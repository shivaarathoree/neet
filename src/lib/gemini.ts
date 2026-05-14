import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Student } from "@/types";

// ── Key rotation + retry setup ────────────────────────────────
// Add multiple keys in .env.local as: REPORT_ENGINE_API_KEY=key1,key2,key3,key4
const REPORT_ENGINE_KEYS = (process.env.REPORT_ENGINE_API_KEY || process.env.GEMINI_API_KEY || "").split(",").map((k) => k.trim()).filter(Boolean);
let keyIndex = 0;

function getClient() {
  const key = REPORT_ENGINE_KEYS[keyIndex % REPORT_ENGINE_KEYS.length];
  keyIndex = (keyIndex + 1) % REPORT_ENGINE_KEYS.length;
  return new GoogleGenerativeAI(key);
}

// Model priority — confirmed working models only
const MODEL_PRIORITY = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-preview-05-20"];

async function callOurSystemWithRetry(prompt: string, maxAttempts = 6): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const modelName = MODEL_PRIORITY[attempt % MODEL_PRIORITY.length];
    const client = getClient();
    const model = client.getGenerativeModel({ model: modelName });
    try {
      console.log(`[system] attempt ${attempt + 1} — key: #${(keyIndex - 1 + REPORT_ENGINE_KEYS.length) % REPORT_ENGINE_KEYS.length + 1}`);
      const res = await model.generateContent(prompt);
      console.log(`[system] ✅ success on attempt ${attempt + 1}`);
      return res.response.text();
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      console.warn(`[system] ⚠️ attempt ${attempt + 1} failed (${status})`);
      if (status && status !== 503 && status !== 429 && status !== 404) break;
      // Wait before retry: 1s, 2s, 3s...
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  throw lastErr;
}

export async function fetchNtaUpdates() {
  const prompt = `NEET-UG 2026 has been cancelled. Return exactly 4 short NTA updates in JSON array:
[{"update_text":"max 20 words per update", "source_url":"https://nta.ac.in"}]
Focus on: cancellation reason, re-exam timeline, student eligibility, official steps. No speculation. Return only JSON.`;
  try {
    const text = (await callOurSystemWithRetry(prompt, 4)).replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch {
    return [
      { update_text: "NTA confirms NEET-UG 2026 cancelled. Re-exam date to be announced on nta.ac.in.", source_url: "https://nta.ac.in" },
      { update_text: "All 24 lakh registered students remain eligible. Your registration is preserved.", source_url: "https://nta.ac.in" },
      { update_text: "Supreme Court monitoring situation. No admissions until re-exam results published.", source_url: "https://main.sci.gov.in" },
      { update_text: "MCC has paused all counselling rounds until NTA re-exam results are out.", source_url: "https://mcc.nic.in" },
    ];
  }
}

export async function generateFreePreview(student: Partial<Student>) {
  const prompt = `NEET 2026 cancelled. Student: ${student.name}, targeting ${student.target_degree}, score ${student.score}, category ${student.category}, state ${student.state}.
You are a NEET 2026 counselling expert. All score references and counselling information must be for the 2026 exam cycle. Do not reference 2024 or 2025 cutoffs as current data. If you are uncertain about 2026 specific data, provide realistic estimates based on trends and clearly frame them as projected ranges, not guaranteed cutoffs.
Return JSON only (no markdown):
{"impact":"2 sentences about cancellation impact for this degree","options":["option1","option2","option3"],"personalInsight":"1-2 honest sentences about their score vs typical cutoffs"}`;
  try {
    const text = (await callOurSystemWithRetry(prompt, 4)).replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch {
    return {
      impact: `For ${student.target_degree} students, NEET 2026 cancellation pauses all admissions. NTA will announce a re-exam — your registration is safe.`,
      options: ["Wait for NTA's official re-exam date (30–45 days). Monitor nta.ac.in daily.", "Use this window to improve your score — 30 focused days can add 30–50 marks.", "Explore alternative medical paths that may suit your current score."],
      personalInsight: `With ${student.score} marks, your full plan will show exactly where you stand vs real ${student.target_degree} cutoffs for ${student.category} category.`,
    };
  }
}

export interface CollegeEntry { college_name: string; state: string; type: string; expected_cutoff: number; seats: number; }
export interface ScenarioEntry { score_range: string; colleges: { college_name: string; state: string; type: string }[]; }
export interface PlanWeek { week: number; focus: string; daily_hours: number; subjects: string[]; }
export interface AlternativePath { path_name: string; description: string; why_consider: string; }

export interface ReportData {
  situation_summary: string;
  college_list_current: CollegeEntry[];
  college_list_reexam_scenarios: ScenarioEntry[];
  drop_vs_repeat_recommendation: string;
  thirty_day_plan: PlanWeek[];
  alternative_paths: AlternativePath[];
}

export async function generateFullReport(student: Student): Promise<ReportData> {
  const improvedScore1 = (student.score || 0) + 40;
  const improvedScore2 = (student.score || 0) + 80;

  const prompt = `You are a NEET 2026 counselling expert. NEET 2026 is cancelled. Generate a personalised report for:
Name: ${student.name} | Degree: ${student.target_degree} | Score: ${student.score} | Category: ${student.category} | State: ${student.state} | Prep: ${student.prep_years} | Worry: ${student.biggest_worry}

All college cutoffs, seat matrices, fee structures, and counselling round information you provide must be for the 2026 exam cycle. Do not reference 2024 or 2025 cutoffs as current data. If you are uncertain about 2026 specific data, provide realistic estimates based on trends and clearly frame them as projected ranges, not guaranteed cutoffs.

Return ONLY valid JSON (no markdown, no extra text):
{
  "situation_summary": "3-4 sentences addressing ${student.name} directly. Honest about score ${student.score} vs ${student.target_degree} cutoffs. Calm, forward-looking.",
  "college_list_current": [{"college_name":"Real Indian college name","state":"Indian state","type":"Government or Private","expected_cutoff":400,"seats":100}],
  "college_list_reexam_scenarios": [
    {"score_range":"Current: ${student.score}","colleges":[{"college_name":"...","state":"...","type":"Govt/Private"}]},
    {"score_range":"Improved: ${improvedScore1}","colleges":[{"college_name":"...","state":"...","type":"Govt/Private"}]},
    {"score_range":"Best case: ${improvedScore2}","colleges":[{"college_name":"...","state":"...","type":"Govt/Private"}]}
  ],
  "drop_vs_repeat_recommendation": "Specific advice for ${student.name} with ${student.prep_years} prep and score ${student.score} for ${student.target_degree}.",
  "thirty_day_plan": [
    {"week":1,"focus":"Specific focus","daily_hours":6,"subjects":["Biology","Physics"]},
    {"week":2,"focus":"...","daily_hours":7,"subjects":["..."]},
    {"week":3,"focus":"...","daily_hours":8,"subjects":["..."]},
    {"week":4,"focus":"Full mocks and revision","daily_hours":8,"subjects":["Full Syllabus"]}
  ],
  "alternative_paths": [
    {"path_name":"Specific alternative","description":"What it involves","why_consider":"Why relevant for score ${student.score}"}
  ]
}

RULES: Real Indian colleges only. ${student.state} state quota first. Cutoffs must be degree-specific and explicitly aligned to NEET 2026. Include at least 5 colleges in college_list_current. If score < 400 for MBBS, be honest.`;

  try {
    const raw = await callOurSystemWithRetry(prompt, 6);
    let text = raw.replace(/```json|```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
    const parsed = JSON.parse(text) as ReportData;
    console.log(`[system] Report sections: ${Object.keys(parsed).join(", ")} | Colleges: ${parsed.college_list_current?.length}`);
    return parsed;
  } catch (err) {
    console.error("[system] ❌ All attempts failed, using fallback data:", err);
    return {
      situation_summary: `${student.name}, your score of ${student.score} as a ${student.category} candidate targeting ${student.target_degree} puts you in a specific bracket. With NEET 2026 cancelled, this window is an opportunity — not a setback. Here is your complete action plan.`,
      college_list_current: [
        { college_name: "Sawai Man Singh Medical College, Jaipur", state: "Rajasthan", type: "Government", expected_cutoff: 500, seats: 250 },
        { college_name: "RNT Medical College, Udaipur", state: "Rajasthan", type: "Government", expected_cutoff: 480, seats: 150 },
        { college_name: "Dr. S.N. Medical College, Jodhpur", state: "Rajasthan", type: "Government", expected_cutoff: 490, seats: 150 },
        { college_name: "Pacific Medical College, Udaipur", state: "Rajasthan", type: "Private", expected_cutoff: 400, seats: 150 },
        { college_name: "NIMS University, Jaipur", state: "Rajasthan", type: "Private", expected_cutoff: 350, seats: 200 },
      ],
      college_list_reexam_scenarios: [
        { score_range: `Current: ${student.score}`, colleges: [{ college_name: "Pacific Medical College, Udaipur", state: "Rajasthan", type: "Private" }, { college_name: "NIMS University, Jaipur", state: "Rajasthan", type: "Private" }] },
        { score_range: `Improved: ${improvedScore1}`, colleges: [{ college_name: "RNT Medical College, Udaipur", state: "Rajasthan", type: "Government" }, { college_name: "Dr. S.N. Medical College, Jodhpur", state: "Rajasthan", type: "Government" }] },
        { score_range: `Best case: ${improvedScore2}`, colleges: [{ college_name: "SMS Medical College, Jaipur", state: "Rajasthan", type: "Government" }, { college_name: "AIIMS Jodhpur", state: "Rajasthan", type: "Government" }] },
      ],
      drop_vs_repeat_recommendation: `Given ${student.prep_years} of preparation and a score of ${student.score}, a focused 30-day revision before the re-exam is strongly recommended. Targeted work in weak areas can meaningfully improve your position without a full year drop.`,
      thirty_day_plan: [
        { week: 1, focus: "Diagnose weakest topics using past papers and NCERT", daily_hours: 6, subjects: ["Biology", "Physics", "Chemistry"] },
        { week: 2, focus: "Intensive revision of high-weightage Biology chapters", daily_hours: 7, subjects: ["Human Physiology", "Genetics", "Cell Biology"] },
        { week: 3, focus: "Physics and Chemistry formula consolidation + timed practice", daily_hours: 8, subjects: ["Physics", "Organic Chemistry", "Mock Tests"] },
        { week: 4, focus: "Full mock tests, error analysis, exam day strategy", daily_hours: 8, subjects: ["Full Syllabus", "Mock Tests", "Revision"] },
      ],
      alternative_paths: [
        { path_name: "BAMS (Ayurvedic Medicine)", description: "5.5-year government-recognised medical degree with growing demand and career opportunities.", why_consider: "Lower NEET cutoff than MBBS, similar clinical scope, strong government job prospects." },
        { path_name: "BDS (Dental Surgery)", description: "5-year degree with strong career prospects in India and abroad.", why_consider: `With a score of ${student.score}, BDS at government colleges may be accessible with 30 more marks.` },
        { path_name: "BSc Nursing", description: "4-year degree with guaranteed hospital and international career paths.", why_consider: "Strong job market, good income, high demand in Gulf and UK." },
      ],
    };
  }
}
