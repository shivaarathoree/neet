import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServiceClient } from "@/lib/supabase";
import type { Student } from "@/types";

export async function POST(req: Request) {
  try {
    const body: Partial<Student> & { session_token?: string } = await req.json();

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment not configured. Contact support." }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const token = body.session_token || Math.random().toString(36).slice(2) + Date.now().toString(36);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: 19900, // ₹199 in paise
      currency: "INR",
      receipt: "neet_" + Date.now().toString(36),
      notes: { session_token: token, student_token: token, student_name: body.name },
    });

    console.log(`[create-order] Order ${order.id} created for ${body.name}`);

    // Save student to Supabase — try full upsert first, fallback to minimal
    const db = createServiceClient();
    const fullData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      target_degree: body.target_degree,
      score: body.score,
      category: body.category,
      state: body.state,
      prep_years: body.prep_years,
      biggest_worry: body.biggest_worry,
      tier: "free",
      report_status: "pending",
      session_token: token,
      razorpay_order_id: order.id as string,
    };

    const { error: upsertErr } = await db
      .from("students")
      .upsert([fullData], { onConflict: "session_token" });

    if (upsertErr) {
      console.warn("[create-order] Full upsert failed, trying minimal:", upsertErr.message);
      // Fallback: insert without new columns (in case table hasn't been altered yet)
      const minimalData = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        target_degree: body.target_degree,
        score: body.score,
        category: body.category,
        state: body.state,
        prep_years: body.prep_years,
        biggest_worry: body.biggest_worry,
        tier: "free",
        report_status: "pending",
        session_token: token,
      };
      const { error: minErr } = await db.from("students").insert([minimalData]);
      if (minErr) console.error("[create-order] Minimal insert also failed:", minErr.message);
    }

    return NextResponse.json({
      order_id: order.id,
      amount: (order as { amount: number }).amount,
      currency: (order as { currency: string }).currency,
      session_token: token,
    });
  } catch (err) {
    console.error("[create-order] Error:", err);
    return NextResponse.json({ error: "Failed to create payment order. Please try again." }, { status: 500 });
  }
}
