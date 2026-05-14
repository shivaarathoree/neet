import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, session_token, test_mode } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
    }

    // ── HMAC signature verification (skipped in test_mode) ────
    if (!test_mode) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) return NextResponse.json({ error: "Server config error." }, { status: 500 });

      const expected = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) {
        console.error("[verify-payment] ❌ Signature mismatch");
        return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
      }
    } else {
      console.warn("[verify-payment] 🧪 TEST MODE — signature skipped");
    }

    const db = createServiceClient();

    // ── Find student by session_token OR razorpay_order_id ────
    let student = null;

    if (session_token) {
      const { data } = await db
        .from("students")
        .select("id, name, email, target_degree, score, category, state, prep_years, biggest_worry")
        .eq("session_token", session_token)
        .single();
      student = data;
    }

    // Fallback: find by razorpay_order_id if session_token lookup failed
    if (!student) {
      const { data } = await db
        .from("students")
        .select("id, name, email, target_degree, score, category, state, prep_years, biggest_worry")
        .eq("razorpay_order_id", razorpay_order_id)
        .single();
      student = data;
    }

    if (!student) {
      console.error("[verify-payment] Student not found for token:", session_token, "order:", razorpay_order_id);
      return NextResponse.json({ error: "Student not found. Contact support." }, { status: 404 });
    }

    // ── Mark student as paid (resilient — skips missing columns) ──
    const essentialUpdate = { tier: "paid_199", report_status: "queued" };
    await db.from("students").update(essentialUpdate).eq("id", student.id);

    // Try to record payment IDs — won't crash if columns don't exist yet
    try {
      await db.from("students").update({ razorpay_payment_id }).eq("id", student.id);
    } catch {
      console.warn("[verify-payment] razorpay_payment_id column not found — run ALTER TABLE");
    }

    // ── Queue report generation ────────────────────────────────
    const { error: jobErr } = await db.from("report_jobs").insert([{
      student_id: student.id,
      status: "queued",
      attempts: 0,
    }]);
    if (jobErr) console.error("[verify-payment] Job queue error:", jobErr.message);

    // ── Fire-and-forget: start processing immediately ──────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    fetch(`${appUrl}/api/process-queue`, { method: "GET" }).catch(() => {});

    console.log(`[verify-payment] ✅ Student ${student.name} (${student.id}) paid — job queued`);

    return NextResponse.json({
      success: true,
      student_id: student.id,
      message: "Payment verified. Your report is being generated.",
    });

  } catch (err) {
    console.error("[verify-payment] Unexpected error:", err);
    return NextResponse.json({ error: "Verification error. Your payment is safe — contact support." }, { status: 500 });
  }
}
