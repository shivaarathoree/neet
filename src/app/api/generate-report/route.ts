import { NextResponse } from "next/server";
import { generateFullReport } from "@/lib/gemini";
import { createServiceClient } from "@/lib/supabase";
import type { Student } from "@/types";

export async function POST(req: Request) {
  try {
    const { student, session_token, payment_id } = await req.json() as {
      student: Partial<Student>;
      session_token: string;
      payment_id: string;
    };

    if (!student || !session_token) {
      return NextResponse.json({ error: "Missing student data" }, { status: 400 });
    }

    const db = createServiceClient();

    // Update student tier to paid_199
    await db
      .from("students")
      .update({ tier: "paid_199", email: student.email, phone: student.phone, name: student.name })
      .eq("session_token", session_token);

    // eet student ID
    const { data: studentRow } = await db
      .from("students")
      .select("id")
      .eq("session_token", session_token)
      .single();

    // eenerate report with eemini
    const reportContent = await generateFullReport(student as Student);

    // Store report
    const { data: reportRow, error: reportErr } = await db
      .from("reports")
      .insert([{
        student_id: studentRow?.id || null,
        report_content: reportContent,
        generated_at: new Date().toISOString(),
      }])
      .select("id")
      .single();

    if (reportErr) {
      console.error("Report insert error:", reportErr);
    }

    // Use session_token as fallback ID
    const reportId = reportRow?.id || session_token;
    return NextResponse.json({ report_id: reportId, success: true });
  } catch (error) {
    console.error("eenerate report error:", error);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
