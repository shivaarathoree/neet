import { NextResponse } from "next/server";
import { generateFullReport } from "@/lib/gemini";
import { generatePDF } from "@/lib/pdf-generator";
import type { Student } from "@/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const student: Student = {
      id: "test-" + Date.now(),
      name: body.name || "Test Student",
      email: body.email || "test@test.com",
      phone: body.phone || "9999999999",
      target_degree: body.target_degree || "MBBS",
      score: Number(body.score) || 520,
      category: body.category || "General",
      state: body.state || "Rajasthan",
      prep_years: body.prep_years || "1 year drop",
      biggest_worry: body.biggest_worry || "Not sure what to do next",
      tier: "paid_199",
      report_status: "processing",
    };

    console.log(`[test-generate] ▶ Starting: ${student.name} | ${student.target_degree} | ${student.score}`);

    // Step 1: Report data
    console.log("[test-generate] 🤖 Calling report system...");
    const reportData = await generateFullReport(student);
    console.log(`[test-generate] ✅ Report data OK — ${reportData.college_list_current?.length || 0} colleges`);

    // Step 2: PDF
    console.log("[test-generate] 📄 Building PDF...");
    const pdfBuffer = await generatePDF(student, reportData);
    console.log(`[test-generate] ✅ PDF built — ${pdfBuffer.length} bytes`);

    // Return as base64 JSON — avoids all binary streaming issues
    const base64 = pdfBuffer.toString("base64");
    const filename = `NEET-Plan-${student.name.replace(/\s+/g, "-")}.pdf`;

    return NextResponse.json({ 
      success: true, 
      pdf_base64: base64, 
      filename,
      size: pdfBuffer.length,
      colleges_count: reportData.college_list_current?.length || 0,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[test-generate] ❌ FAILED:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
