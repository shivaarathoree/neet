import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Full pipeline test — creates student, queues job, triggers generation
// Only works in development
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const db = createServiceClient();

    const token = "test_" + Date.now().toString(36);

    // 1. Insert student directly
    const { data: student, error: stuErr } = await db
      .from("students")
      .insert([{
        name: body.name || "Test Student",
        email: body.email || "test@test.com",
        phone: body.phone || "9999999999",
        target_degree: body.target_degree || "MBBS",
        score: Number(body.score) || 520,
        category: body.category || "General",
        state: body.state || "Rajasthan",
        prep_years: body.prep_years || "1 year drop",
        biggest_worry: body.biggest_worry || "Parents worried",
        tier: "paid_199",
        report_status: "queued",
        session_token: token,
      }])
      .select("id")
      .single();

    if (stuErr || !student) {
      return NextResponse.json({ error: "Student insert failed: " + stuErr?.message }, { status: 500 });
    }

    console.log(`[test-flow] ✅ Student created: ${student.id}`);

    // 2. Queue job
    const { error: jobErr } = await db.from("report_jobs").insert([{
      student_id: student.id,
      status: "queued",
      attempts: 0,
    }]);

    if (jobErr) {
      return NextResponse.json({ error: "Job insert failed: " + jobErr.message }, { status: 500 });
    }

    console.log(`[test-flow] ✅ Job queued for ${student.id}`);

    // 3. Fire-and-forget: trigger process-queue
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    fetch(`${appUrl}/api/process-queue`, { method: "GET" }).catch(() => {});
    console.log(`[test-flow] ✅ process-queue triggered — student will be at /report/${student.id}`);

    return NextResponse.json({
      success: true,
      student_id: student.id,
      report_url: `/report/${student.id}`,
      message: "Pipeline started! Report generating now.",
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[test-flow] ❌", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
