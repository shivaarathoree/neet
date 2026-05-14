import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateFullReport } from "@/lib/gemini";
import { generatePDF } from "@/lib/pdf-generator";
import { sendReportEmail, sendAdminAlert } from "@/lib/email";
import type { Student } from "@/types";

export const maxDuration = 60;

export async function GET() {
  const db = createServiceClient();
  console.log("[queue] ⚡ process-queue triggered");

  const { data: job, error: jobErr } = await db
    .from("report_jobs")
    .select("id, student_id, attempts")
    .eq("status", "queued")
    .lt("attempts", 3)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (jobErr || !job) {
    console.log("[queue] 📭 No queued jobs found");
    return NextResponse.json({ status: "no_jobs" });
  }

  console.log(`[queue] 📋 Found job ${job.id} for student ${job.student_id} (attempt ${job.attempts + 1})`);

  // Claim the job
  const { error: claimErr } = await db
    .from("report_jobs")
    .update({ status: "processing", attempts: job.attempts + 1, updated_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "queued");

  if (claimErr) {
    console.log("[queue] ⚠️ Job already claimed by another process");
    return NextResponse.json({ status: "race_condition" });
  }

  try {
    // Get student
    const { data: student, error: stuErr } = await db
      .from("students")
      .select("*")
      .eq("id", job.student_id)
      .single();

    if (stuErr || !student) throw new Error("Student not found: " + job.student_id);
    console.log(`[queue] 👤 Student: ${student.name} | ${student.target_degree} | ${student.score} marks | ${student.category}`);

    // Step 1: Generate report
    console.log("[queue] 🤖 Calling report system...");
    const reportData = await generateFullReport(student as Student);
    console.log(`[queue] ✅ Report data done — ${reportData.college_list_current?.length || 0} colleges, ${reportData.thirty_day_plan?.length || 0} weeks`);

    // Step 2: Generate PDF
    console.log("[queue] 📄 Generating PDF...");
    const pdfBuffer = await generatePDF(student as Student, reportData);
    console.log(`[queue] ✅ PDF done — ${pdfBuffer.length} bytes (${Math.round(pdfBuffer.length / 1024)}KB)`);

    if (pdfBuffer.length < 2000) throw new Error("PDF too small — likely empty. Check report data.");

    // Step 3: Upload to Supabase Storage (with base64 fallback)
    let pdfUrl = "";
    const fileName = `reports/${student.id}_${Date.now()}.pdf`;
    console.log(`[queue] ☁️  Uploading PDF to storage: ${fileName}`);

    const { error: uploadErr } = await db.storage
      .from("reports")
      .upload(fileName, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadErr) {
      console.warn(`[queue] ⚠️ Storage upload failed (${uploadErr.message}) — using base64 data URL fallback`);
      // Fallback: store as data URL so student can still download
      pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    } else {
      const { data: urlData } = db.storage.from("reports").getPublicUrl(fileName);
      pdfUrl = urlData.publicUrl;
      console.log(`[queue] ✅ PDF uploaded to storage: ${pdfUrl}`);
    }

    // Step 4: Save report record
    await db.from("reports").insert([{
      student_id: student.id,
      report_content: JSON.stringify(reportData),
      pdf_url: pdfUrl,
    }]);

    // Step 5: Update student to done
    await db.from("students").update({
      report_url: pdfUrl,
      report_status: "done",
    }).eq("id", student.id);

    // Step 6: Mark job complete
    await db.from("report_jobs").update({
      status: "completed",
      updated_at: new Date().toISOString(),
    }).eq("id", job.id);

    console.log(`[queue] 🎉 Report COMPLETE for ${student.name}!`);

    // Step 7: Email (non-blocking)
    if (student.email) {
      console.log(`[queue] 📧 Sending email to ${student.email}...`);
      await sendReportEmail({
        toEmail: student.email,
        toName: student.name || "Student",
        reportUrl: pdfUrl,
        degree: student.target_degree || "Medical",
      });
    }

    return NextResponse.json({ status: "completed", student_id: student.id, pdf_url: pdfUrl });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[queue] ❌ FAILED:", errMsg);

    const { data: current } = await db.from("report_jobs").select("attempts").eq("id", job.id).single();
    const attempts = current?.attempts || 1;

    if (attempts >= 3) {
      await db.from("report_jobs").update({ status: "failed", error_log: errMsg, updated_at: new Date().toISOString() }).eq("id", job.id);
      await db.from("students").update({ report_status: "failed" }).eq("id", job.student_id);
      console.error(`[queue] 💀 Job ${job.id} permanently failed after 3 attempts`);
      await sendAdminAlert({
        subject: `Report FAILED — ${job.student_id}`,
        message: `Student: ${job.student_id}\nJob: ${job.id}\nAttempts: ${attempts}\nError: ${errMsg}`,
      }).catch(() => {});
    } else {
      await db.from("report_jobs").update({ status: "queued", error_log: errMsg, updated_at: new Date().toISOString() }).eq("id", job.id);
      console.warn(`[queue] 🔄 Job ${job.id} reset to queued for retry (attempt ${attempts})`);
    }

    return NextResponse.json({ status: "error", error: errMsg, attempts }, { status: 500 });
  }
}
