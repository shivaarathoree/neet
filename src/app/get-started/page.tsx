"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import NeetHeader from "@/components/neet/NeetHeader";
import { DEGREE_INFO, INDIAN_STATES, type Degree, type Category, type PrepYears, type Student } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const STEPS = ["Degree", "Score & Category", "Background", "Your Worry"];

function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function GetStartedPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Student>>({
    name: "",
    target_degree: undefined,
    score: undefined,
    category: undefined,
    state: undefined,
    prep_years: undefined,
    biggest_worry: "",
  });

  const updateForm = (key: keyof Student, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 0) return !!form.target_degree;
    if (step === 1) return form.score !== undefined && form.score >= 0 && form.score <= 720 && !!form.category && !!form.name;
    if (step === 2) return !!form.state && !!form.prep_years;
    if (step === 3) return !!form.biggest_worry && form.biggest_worry.trim().length > 5;
    return false;
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setLoading(true);
    try {
      const token = generateSessionToken();
      const studentData = { ...form, session_token: token, tier: "free" as const };
      await supabase.from("students").insert([studentData]);
      localStorage.setItem("neet_session_token", token);
      localStorage.setItem("neet_student_data", JSON.stringify(studentData));
      router.push(`/preview?token=${token}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <NeetHeader />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${i < step ? "bg-primary text-white" : i === step ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${i === step ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl sm:text-3xl font-medium font-heading text-slate-900 tracking-tighter mb-2">Which degree are you targeting?</h2>
              <p className="text-slate-500 text-sm font-light mb-8">MBBS and BAMS cutoffs are completely different — this shapes everything.</p>
              <div className="grid grid-cols-2 gap-3">
                {DEGREE_INFO.map((deg) => (
                  <button key={deg.label} id={`degree-${deg.label}`} onClick={() => updateForm("target_degree", deg.label as Degree)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${form.target_degree === deg.label ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <span className="text-2xl">{deg.icon}</span>
                    <div>
                      <div className="font-semibold font-heading text-slate-900 text-sm">{deg.label}</div>
                      <div className="text-[10px] text-slate-400">{deg.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl sm:text-3xl font-medium font-heading text-slate-900 tracking-tighter mb-2">Your score and details</h2>
              <p className="text-slate-500 text-sm font-light mb-8">Score + category determines your actual college options.</p>
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Your Name</label>
                  <input type="text" placeholder="Full name" value={form.name ?? ""} onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">NEET 2026 Score (0–720)</label>
                  <input type="number" min={0} max={720} placeholder="e.g. 540" value={form.score ?? ""}
                    onChange={(e) => updateForm("score", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                  {form.score !== undefined && form.target_degree && (
                    <div className="mt-2 px-3 py-2 bg-slate-50 rounded-xl">
                      <p className="text-[11px] text-slate-500">
                        {(() => {
                          const deg = DEGREE_INFO.find((d) => d.label === form.target_degree);
                          if (!deg) return "";
                          const cutoff = form.category === "SC" ? deg.projectedCutoff2026SC : form.category === "ST" ? deg.projectedCutoff2026ST : form.category === "OBC" ? deg.projectedCutoff2026OBC : deg.projectedCutoff2026General;
                          return form.score! >= cutoff ? `✅ Above projected 2026 ${form.target_degree} range for ${form.category || "General"} (${cutoff}+)` : `⚠️ Projected 2026 range starts near ${cutoff}+. Your plan will explain what this means.`;
                        })()}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Category</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["General", "OBC", "SC", "ST", "EWS"] as Category[]).map((cat) => (
                      <button key={cat} id={`cat-${cat}`} onClick={() => updateForm("category", cat)}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.category === cat ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl sm:text-3xl font-medium font-heading text-slate-900 tracking-tighter mb-2">A bit about your background</h2>
              <p className="text-slate-500 text-sm font-light mb-8">State determines your 85% state quota seats. Prep years shapes the drop-vs-repeat advice.</p>
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Home State</label>
                  <select value={form.state ?? ""} onChange={(e) => updateForm("state", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Preparation Journey</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["First attempt", "1 drop", "2+ drops"] as PrepYears[]).map((p) => (
                      <button key={p} id={`prep-${p}`} onClick={() => updateForm("prep_years", p)}
                        className={`py-3.5 rounded-2xl text-sm font-semibold border transition-all ${form.prep_years === p ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl sm:text-3xl font-medium font-heading text-slate-900 tracking-tighter mb-2">One honest question</h2>
              <p className="text-slate-500 text-sm font-light mb-8">What is your biggest worry right now? Your report will address this directly.</p>
              <textarea rows={5} placeholder="e.g. My parents are fighting with me about dropping a year. My score is 480 and I honestly don't know if I can do better..."
                value={form.biggest_worry ?? ""} onChange={(e) => updateForm("biggest_worry", e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed" />
              <p className="text-[11px] text-slate-400 mt-2">This stays private and shapes your personalised report.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-10">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
            className="px-6 py-3 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => canProceed() && setStep((s) => s + 1)} disabled={!canProceed()}
              className="px-8 py-3 rounded-full bg-slate-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || loading} id="submit-form"
              className="px-8 py-3.5 rounded-full bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-primary-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/25">
              {loading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Building preview...</>) : "See My Free Preview →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
