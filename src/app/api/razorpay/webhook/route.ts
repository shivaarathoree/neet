import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase";
import { generateFullReport } from "@/lib/gemini";
import type { Student } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature (skip if secret not yet configured)
    if (secret && !secret.includes("PASTE")) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      if (expected !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    if (event.event !== "payment.captured") {
      return NextResponse.json({ status: "ignored" });
    }

    const payment = event.payload.payment.entity;
    const notes = payment.notes || {};
    const sessionToken = notes.session_token;

    if (!sessionToken) {
      return NextResponse.json({ status: "no session token" });
    }

    const db = createServiceClient();

    // Get student data
    const { data: studentRow } = await db
      .from("students")
      .select("*")
      .eq("session_token", sessionToken)
      .single();

    if (!studentRow) {
      return NextResponse.json({ status: "student not found" });
    }

    // Update to paid
    await db
      .from("students")
      .update({ tier: "paid_199" })
      .eq("session_token", sessionToken);

    // Generate report
    const reportContent = await generateFullReport(studentRow as Student);

    await db.from("reports").insert([{
      student_id: studentRow.id,
      report_content: reportContent,
      generated_at: new Date().toISOString(),
    }]);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
