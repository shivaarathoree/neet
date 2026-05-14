"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NeetHeader from "@/components/neet/NeetHeader";
import type { Student } from "@/types";
import { DEGREE_INFO } from "@/types";

interface PreviewData {
  impact: string;
  options: string[];
  personalInsight: string;
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [student, setStudent] = useState<Partial<Student> | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("neet_student_data");
    if (!raw) { router.push("/get-started"); return; }
    const data = JSON.parse(raw);
    setStudent(data);

    fetch("/api/free-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((d) => setPreview(d.preview))
      .catch(() => {
        const deg = DEGREE_INFO.find((d) => d.label === data.target_degree);
        const cutoff = data.category === "SC" ? deg?.projectedCutoff2026SC : data.category === "ST" ? deg?.projectedCutoff2026ST : data.category === "OBC" ? deg?.projectedCutoff2026OBC : deg?.projectedCutoff2026General;
        setPreview({
          impact: `For ${data.target_degree} students, the NEET 2026 cancellation means all AYUSH/medical admissions are paused. NTA will announce a re-exam — your registration is safe.`,
          options: [
            "Wait for NTA's re-exam announcement (expected in 30–45 days). Stay informed via nta.ac.in.",
            "Use this window to improve your score. 30 days of focused prep can add 30–50 marks.",
            "If your score is already competitive, explore whether state quota seats may open early.",
          ],
          personalInsight: data.score >= (cutoff || 400)
            ? `With ${data.score} marks as ${data.category}, you are above the projected 2026 range for ${data.target_degree}. If the score stands, you have real options.`
            : `With ${data.score} marks, there is a gap to the projected 2026 range (${cutoff}+). Your full report will show exactly what prep can close this gap.`,
        });
      })
      .finally(() => setLoading(false));
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-light">Building your free preview...</p>
        </div>
      </div>
    );
  }

  if (!student || !preview) return null;

  const degreeInfo = DEGREE_INFO.find((d) => d.label === student.target_degree);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-5">
          <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Free Preview Ready</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium font-heading text-slate-900 tracking-tighter mb-2">
          Here&apos;s what cancellation means for{" "}
          <span className="text-primary">{student.name || "you"}</span>
        </h1>
        <p className="text-slate-500 text-sm font-light">
          {degreeInfo?.icon} Targeting {student.target_degree} · Score: {student.score} · {student.category} · {student.state}
        </p>
      </motion.div>

      {/* Section 1 — Impact */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 bg-white border border-slate-200 rounded-2xl mb-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What This Means for YOUR {student.target_degree} Path</div>
        <p className="text-slate-700 text-sm leading-relaxed">{preview.impact}</p>
      </motion.div>

      {/* Section 2 — 3 Options */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-6 bg-white border border-slate-200 rounded-2xl mb-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Your 3 Options Right Now</div>
        <div className="space-y-3">
          {preview.options.map((opt, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-slate-700 text-sm leading-relaxed">{opt}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 3 — Personal insight */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-6 bg-primary/5 border border-primary/20 rounded-2xl mb-8">
        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Your Personal Insight</div>
        <p className="text-slate-800 text-sm leading-relaxed font-medium">{preview.personalInsight}</p>
      </motion.div>

      {/* Paywall teaser */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="relative p-7 bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Complete Action Plan — ₹199</div>
          <h3 className="text-xl font-medium font-heading text-white tracking-tighter mb-4">
            {student.name}, your full plan includes:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {[
              "College list if score stands",
              "College list after re-exam scenarios",
              "Drop vs repeat — data-driven for YOU",
              "30-day re-exam prep plan",
              "Alternative paths for " + student.target_degree,
              "PDF with your name — share with parents",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-primary mt-0.5">✓</span> {f}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/payment")} id="get-full-plan"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/25">
              Get Complete Plan — ₹199
            </button>
            <div className="text-sm text-slate-500 line-through">₹499</div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">No account needed. Just name + email + phone. PDF emailed instantly.</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <NeetHeader />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <PreviewContent />
      </Suspense>
    </main>
  );
}
