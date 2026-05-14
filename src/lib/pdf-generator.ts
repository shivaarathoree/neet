import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { ReportData } from "@/lib/gemini";
import type { Student } from "@/types";

const NAVY = rgb(0.05, 0.08, 0.18);
const ORANGE = rgb(0.76, 0.25, 0.05);
const GRAY = rgb(0.35, 0.37, 0.42);
const LIGHT = rgb(0.96, 0.96, 0.97);
const WHITE = rgb(1, 1, 1);
const GREEN = rgb(0.08, 0.64, 0.45);

function drawText(page: ReturnType<PDFDocument["addPage"]>, text: string, x: number, y: number, font: ReturnType<PDFDocument["embedStandardFont"]> extends Promise<infer T> ? T : never, size: number, color = NAVY) {
  page.drawText(text, { x, y, font, size, color });
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generatePDF(student: Student, report: ReportData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);

  const W = 595.28;
  const H = 841.89;
  const M = 48;
  const maxW = W - M * 2;

  // ── PAGE 1: Cover ──────────────────────────────────────────
  const cover = doc.addPage([W, H]);

  // Dark background top half
  cover.drawRectangle({ x: 0, y: H / 2, width: W, height: H / 2, color: NAVY });
  // Orange accent bar
  cover.drawRectangle({ x: 0, y: H / 2 - 6, width: W, height: 6, color: ORANGE });

  // Logo text top-right
  cover.drawText("UNIPATHSCHOOL", { x: W - M - 120, y: H - 36, font: boldFont, size: 9, color: rgb(0.6, 0.62, 0.7) });

  // Main headline
  cover.drawText("NEET 2026", { x: M, y: H - 100, font: boldFont, size: 52, color: ORANGE });
  cover.drawText("CRISIS ACTION PLAN", { x: M, y: H - 158, font: boldFont, size: 28, color: WHITE });

  // Student name
  const nameY = H / 2 + 80;
  cover.drawText("Prepared for", { x: M, y: nameY, font: regularFont, size: 11, color: rgb(0.6, 0.62, 0.7) });
  cover.drawText(student.name || "Student", { x: M, y: nameY - 28, font: boldFont, size: 30, color: WHITE });

  // Info box — lower half
  const boxY = H / 2 - 120;
  cover.drawRectangle({ x: M, y: boxY, width: maxW, height: 100, color: LIGHT, borderColor: rgb(0.87, 0.87, 0.9), borderWidth: 1 });

  const infoItems = [
    ["Degree Target", student.target_degree || ""],
    ["NEET 2026 Score", String(student.score || "N/A")],
    ["Category", student.category || ""],
    ["Home State", student.state || ""],
  ];
  let infoX = M + 20;
  infoItems.forEach(([label, val]) => {
    cover.drawText(label, { x: infoX, y: boxY + 68, font: regularFont, size: 8, color: GRAY });
    cover.drawText(val, { x: infoX, y: boxY + 50, font: boldFont, size: 13, color: NAVY });
    infoX += maxW / 4;
  });

  // Date
  cover.drawText(`Prepared: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, { x: M, y: boxY - 24, font: regularFont, size: 9, color: GRAY });
  cover.drawText("unipathschool.com", { x: W - M - 90, y: boxY - 24, font: boldFont, size: 9, color: ORANGE });

  // ── PAGE 2: Situation Summary ──────────────────────────────
  const p2 = doc.addPage([W, H]);
  p2.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: NAVY });
  p2.drawText("YOUR SITUATION", { x: M, y: H - 32, font: boldFont, size: 10, color: ORANGE });
  p2.drawText("What NEET 2026 Cancellation Means for You", { x: M, y: H - 54, font: boldFont, size: 20, color: WHITE });

  let y2 = H - 110;
  const summaryLines = wrap(report.situation_summary || "", 88);
  summaryLines.forEach((line) => {
    p2.drawText(line, { x: M, y: y2, font: regularFont, size: 11, color: NAVY });
    y2 -= 16;
  });

  // Drop vs repeat box
  y2 -= 20;
  p2.drawRectangle({ x: M, y: y2 - 100, width: maxW, height: 110, color: rgb(1, 0.97, 0.94), borderColor: ORANGE, borderWidth: 1 });
  p2.drawText("Drop vs Repeat — Our Recommendation", { x: M + 16, y: y2 - 18, font: boldFont, size: 11, color: ORANGE });
  const dropLines = wrap(report.drop_vs_repeat_recommendation || "", 85);
  let dropY = y2 - 36;
  dropLines.slice(0, 4).forEach((line) => {
    p2.drawText(line, { x: M + 16, y: dropY, font: regularFont, size: 10, color: NAVY });
    dropY -= 14;
  });

  // ── PAGE 3: College List (Current Score) ──────────────────
  const p3 = doc.addPage([W, H]);
  p3.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: NAVY });
  p3.drawText("COLLEGE LIST", { x: M, y: H - 32, font: boldFont, size: 10, color: ORANGE });
  p3.drawText(`If your current score of ${student.score} stands (${student.category} category)`, { x: M, y: H - 54, font: boldFont, size: 17, color: WHITE });

  let y3 = H - 100;
  // Table header
  p3.drawRectangle({ x: M, y: y3 - 20, width: maxW, height: 20, color: NAVY });
  const cols3 = [M + 8, M + 230, M + 330, M + 410, M + 460];
  const headers3 = ["College Name", "State", "Type", "Cutoff", "Seats"];
  headers3.forEach((h, i) => p3.drawText(h, { x: cols3[i], y: y3 - 14, font: boldFont, size: 8, color: WHITE }));
  y3 -= 20;

  const colleges = report.college_list_current || [];
  if (colleges.length === 0) {
    p3.drawText("Based on your score, no direct matches found. See Re-exam Scenarios on the next page.", { x: M, y: y3 - 20, font: regularFont, size: 10, color: GRAY });
    p3.drawText("Focus on the 30-day plan to improve your score for the re-exam.", { x: M, y: y3 - 36, font: regularFont, size: 10, color: GRAY });
  } else {
    colleges.slice(0, 18).forEach((c, i) => {
      const rowY = y3 - (i + 1) * 18;
      if (i % 2 === 0) p3.drawRectangle({ x: M, y: rowY - 4, width: maxW, height: 18, color: LIGHT });
      if (c.type === "Government") p3.drawRectangle({ x: M, y: rowY - 4, width: 4, height: 18, color: GREEN });
      const rowColor = c.type === "Government" ? rgb(0.08, 0.4, 0.2) : NAVY;
      const name = c.college_name.length > 38 ? c.college_name.slice(0, 36) + ".." : c.college_name;
      p3.drawText(name, { x: cols3[0], y: rowY + 2, font: regularFont, size: 8, color: rowColor });
      p3.drawText(c.state || "", { x: cols3[1], y: rowY + 2, font: regularFont, size: 8, color: GRAY });
      p3.drawText(c.type || "", { x: cols3[2], y: rowY + 2, font: regularFont, size: 8, color: rowColor });
      p3.drawText(String(c.expected_cutoff || ""), { x: cols3[3], y: rowY + 2, font: boldFont, size: 8, color: NAVY });
      p3.drawText(String(c.seats || ""), { x: cols3[4], y: rowY + 2, font: regularFont, size: 8, color: GRAY });
    });
  }

  // ── PAGE 4: Re-exam Scenarios ──────────────────────────────
  const p4 = doc.addPage([W, H]);
  p4.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: NAVY });
  p4.drawText("RE-EXAM SCENARIOS", { x: M, y: H - 32, font: boldFont, size: 10, color: ORANGE });
  p4.drawText("What improves if you study for 30 days before the re-exam", { x: M, y: H - 54, font: boldFont, size: 16, color: WHITE });

  let y4 = H - 100;
  const scenarios = report.college_list_reexam_scenarios || [];
  scenarios.forEach((sc, si) => {
    if (y4 < 80) return;
    p4.drawRectangle({ x: M, y: y4 - 22, width: maxW, height: 22, color: si === 0 ? LIGHT : si === 1 ? rgb(0.9, 0.97, 0.93) : rgb(0.95, 0.98, 1) });
    p4.drawText(sc.score_range || "", { x: M + 10, y: y4 - 14, font: boldFont, size: 10, color: NAVY });
    y4 -= 22;
    (sc.colleges || []).slice(0, 4).forEach((c) => {
      if (y4 < 60) return;
      p4.drawText(`  • ${c.college_name} (${c.state}) — ${c.type}`, { x: M + 16, y: y4 - 12, font: regularFont, size: 9, color: GRAY });
      y4 -= 14;
    });
    if (!sc.colleges || sc.colleges.length === 0) {
      p4.drawText("  • Focused revision needed to unlock options in this range.", { x: M + 16, y: y4 - 12, font: regularFont, size: 9, color: GRAY });
      y4 -= 14;
    }
    y4 -= 8;
  });

  // ── PAGE 5: 30-Day Plan ────────────────────────────────────
  const p5 = doc.addPage([W, H]);
  p5.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: NAVY });
  p5.drawText("30-DAY ACTION PLAN", { x: M, y: H - 32, font: boldFont, size: 10, color: ORANGE });
  p5.drawText("Week-by-week guide to maximise your re-exam score", { x: M, y: H - 54, font: boldFont, size: 16, color: WHITE });

  let y5 = H - 100;
  // Table header
  p5.drawRectangle({ x: M, y: y5 - 20, width: maxW, height: 20, color: NAVY });
  const planCols = [M + 8, M + 60, M + 260, M + 340, M + 420];
  ["Week", "Focus", "Daily Hours", "Subjects", ""].forEach((h, i) => p5.drawText(h, { x: planCols[i], y: y5 - 14, font: boldFont, size: 8, color: WHITE }));
  y5 -= 20;

  (report.thirty_day_plan || []).forEach((wk, i) => {
    const rowH = 26;
    if (y5 < 60) return;
    if (i % 2 === 0) p5.drawRectangle({ x: M, y: y5 - rowH, width: maxW, height: rowH, color: LIGHT });
    p5.drawText(`Week ${wk.week}`, { x: planCols[0], y: y5 - 16, font: boldFont, size: 9, color: ORANGE });
    const focus = wk.focus.length > 38 ? wk.focus.slice(0, 36) + ".." : wk.focus;
    p5.drawText(focus, { x: planCols[1], y: y5 - 16, font: regularFont, size: 9, color: NAVY });
    p5.drawText(`${wk.daily_hours}h/day`, { x: planCols[2], y: y5 - 16, font: boldFont, size: 9, color: NAVY });
    const subjects = (wk.subjects || []).slice(0, 2).join(", ");
    p5.drawText(subjects, { x: planCols[3], y: y5 - 16, font: regularFont, size: 9, color: GRAY });
    y5 -= rowH;
  });

  // ── PAGE 6: Alternative Paths + Footer ────────────────────
  const p6 = doc.addPage([W, H]);
  p6.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: NAVY });
  p6.drawText("ALTERNATIVE PATHS", { x: M, y: H - 32, font: boldFont, size: 10, color: ORANGE });
  p6.drawText("Other strong medical careers worth considering", { x: M, y: H - 54, font: boldFont, size: 16, color: WHITE });

  let y6 = H - 110;
  (report.alternative_paths || []).forEach((ap, i) => {
    if (y6 < 100) return;
    p6.drawRectangle({ x: M, y: y6 - 80, width: maxW, height: 85, color: i % 2 === 0 ? LIGHT : WHITE, borderColor: rgb(0.87, 0.87, 0.9), borderWidth: 1 });
    p6.drawText(ap.path_name || "", { x: M + 16, y: y6 - 20, font: boldFont, size: 13, color: ORANGE });
    const descLines = wrap(ap.description || "", 82);
    descLines.slice(0, 2).forEach((l, li) => p6.drawText(l, { x: M + 16, y: y6 - 36 - li * 13, font: regularFont, size: 9, color: NAVY }));
    const whyLines = wrap("Why consider: " + (ap.why_consider || ""), 82);
    whyLines.slice(0, 1).forEach((l, li) => p6.drawText(l, { x: M + 16, y: y6 - 64, font: regularFont, size: 9, color: GRAY }));
    y6 -= 95;
  });

  // Footer
  p6.drawRectangle({ x: 0, y: 0, width: W, height: 50, color: NAVY });
  p6.drawText("Prepared by Unipathschool.com", { x: M, y: 20, font: regularFont, size: 9, color: rgb(0.6, 0.62, 0.7) });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
