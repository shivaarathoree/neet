"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NeetHeader from "@/components/neet/NeetHeader";
import type { Student } from "@/types";

const CALENDLY_URL = "https://calendly.com/unipathschool/neet-mentorship";

type StudentRecord = Partial<Student & { report_status: string; report_url: string }>;

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [showDownloadHint, setShowDownloadHint] = useState(false);

  const fetchStudent = useCallback(async () => {
    const id = params?.id as string;
    if (!id) { router.push("/get-started"); return; }

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("students")
        .select("id, name, target_degree, score, category, state, tier, report_status, report_url")
        .or(`id.eq.${id},session_token.eq.${id}`)
        .single();

      if (data) {
        setStudent(data);
      } else {
        // Fallback: read from localStorage
        const raw = localStorage.getItem("neet_student_data");
        if (raw) setStudent({ ...JSON.parse(raw), report_status: "processing" });
      }
    } catch {
      const raw = localStorage.getItem("neet_student_data");
      if (raw) setStudent({ ...JSON.parse(raw), report_status: "processing" });
    }
    setLoading(false);
  }, [params, router]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  // Auto-refresh every 8s while processing
  useEffect(() => {
    const status = student?.report_status;
    if (!student || status === "done" || status === "failed") return;
    const interval = setInterval(fetchStudent, 8000);
    return () => clearInterval(interval);
  }, [student, fetchStudent]);

  // 10-second countdown → show download hint
  useEffect(() => {
    const status = student?.report_status;
    if (!student || status === "done" || status === "failed") return;

    if (countdown <= 0) { setShowDownloadHint(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, student]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <NeetHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  const status = student?.report_status;

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <NeetHeader />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">

        {student?.name && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-slate-400 text-sm font-light mb-8">
            {student.name} · {student.target_degree} · {student.score} marks · {student.category}
          </motion.p>
        )}

        {/* ── PENDING / PROCESSING ─────────────────────────── */}
        {(status === "pending" || status === "queued" || status === "processing") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            <div className="p-10 bg-white border border-slate-200 rounded-[1.5rem] text-center">
              {/* Spinner */}
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                {countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{countdown}</span>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-medium font-heading text-slate-900 tracking-tighter mb-2">
                Your NEET 2026 report is being generated
              </h2>
              <p className="text-slate-500 text-sm font-light mb-6 max-w-sm mx-auto">
                Our system is personalising every section for your score, category, and degree.
                {countdown > 0
                  ? ` Estimated time: ${countdown}s`
                  : " This is taking longer than usual — refreshing…"}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-semibold text-primary">Auto-refreshing every 8 seconds</span>
              </div>
            </div>

            {/* 10s hint — "report not showing? click here" */}
            <AnimatePresence>
              {showDownloadHint && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-5 bg-amber-50 border border-amber-200 rounded-[1.2rem] flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-2xl">⏳</div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-amber-900 mb-1">Still generating…</p>
                    <p className="text-xs text-amber-700 font-light">
                      Your personalised report is still being prepared. You can trigger it manually or check your email in a few minutes.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch("/api/process-queue");
                      setTimeout(fetchStudent, 5000);
                    }}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-all">
                    Retry Now →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-[11px] text-slate-400">
              Also check your email inbox (and spam folder) in 5–10 minutes.
            </p>
          </motion.div>
        )}

        {/* ── DONE ─────────────────────────────────────────── */}
        {status === "done" && student?.report_url && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            <div className="p-8 bg-white border border-emerald-200 rounded-[1.5rem] text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="w-14 h-14 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <h2 className="text-xl font-medium font-heading text-slate-900 tracking-tighter mb-1">
                Your NEET 2026 action plan is ready, {student.name?.split(" ")[0]}!
              </h2>
              <p className="text-slate-500 text-sm font-light mb-6">
                Download below. We&apos;ve also emailed it to you — share with your parents.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={student.report_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 group w-full sm:w-auto">
                  <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Your AI Report
                </a>
                
                <a href="https://lpzaslgjklcxeotobcdu.supabase.co/storage/v1/object/public/reports/assets/NEET26_Planner_UniPathSchool.pdf" download="NEET26_Planner_UniPathSchool.pdf" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 group w-full sm:w-auto">
                  <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  2026 Strategy Planner
                </a>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Also sent to your email inbox
              </div>
            </div>

            {/* ₹999 Upsell */}
            <div className="p-7 bg-slate-900 border border-slate-800 rounded-[1.5rem] relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-sky-500/10 blur-[70px] rounded-full" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-3">Next Step — Optional</p>
                <h3 className="text-lg font-medium font-heading text-white tracking-tighter mb-2">
                  Talk to a real {student.target_degree} senior who was exactly where you are.
                </h3>
                <p className="text-sm text-slate-400 font-light mb-5">
                  45 min · ₹999 · They cracked NEET. Ask everything. No script.
                </p>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-500 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20">
                  Book Your Session — ₹999 →
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FAILED ───────────────────────────────────────── */}
        {status === "failed" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white border border-red-200 rounded-[1.5rem] text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-medium font-heading text-slate-900 tracking-tighter mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-500 text-sm font-light mb-5 max-w-sm mx-auto">
              Our team has been alerted. We&apos;ll email your report within 1 hour. Your payment is safe.
            </p>
            <div className="space-y-3">
              <button onClick={async () => {
                await fetch("/api/process-queue");
                setTimeout(fetchStudent, 5000);
              }}
                className="w-full py-3 rounded-full bg-slate-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all">
                Retry Report Generation
              </button>
              <a href="mailto:neet@unipathschool.com"
                className="block text-sm text-primary hover:underline">
                Contact: neet@unipathschool.com
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
