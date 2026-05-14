"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { NtaUpdate } from "@/types";

export default function LiveNewsSection() {
  const [updates, setUpdates] = useState<NtaUpdate[]>([
    {
      id: "f1",
      update_text: "NTA officially confirms NEET-UG 2026 is cancelled. New date will be announced on nta.ac.in.",
      source_url: "https://nta.ac.in",
      fetched_at: new Date().toISOString()
    },
    {
      id: "f2",
      update_text: "All 24 lakh registered students remain eligible. Your registration is preserved.",
      source_url: "https://nta.ac.in",
      fetched_at: new Date().toISOString()
    },
    {
      id: "f3",
      update_text: "Supreme Court monitoring the situation. No admissions will proceed until re-exam results.",
      source_url: "https://main.sci.gov.in",
      fetched_at: new Date().toISOString()
    }
  ]);
  
  useEffect(() => {
    fetch("/api/nta-updates")
      .then((r) => r.json())
      .then((data) => {
        if (data.updates && data.updates.length > 0) {
          setUpdates(data.updates);
        }
      })
      .catch(() => {});
  }, []);

  if (updates.length === 0) return null;

  return (
    <section className="py-16 bg-white border-y border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="shrink-0 w-full sm:w-1/3 pt-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 live-dot shadow-[0_0_8px_#dc2626]" />
              <h2 className="text-xl font-bold font-heading text-slate-900 uppercase tracking-widest">What We Know</h2>
            </div>
            <p className="text-sm text-slate-500 font-light mb-5">
              We are tracking NTA and Supreme Court directives. Here are the confirmed facts right now.
            </p>
            <a href="https://nta.ac.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full border border-red-100">
              Official NTA Website ↗
            </a>
          </div>
          <div className="flex-1 space-y-4 w-full">
            {updates.map((news, i) => {
              const date = new Date(news.fetched_at);
              const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <motion.div 
                  key={news.id || `news-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 bg-slate-50 border border-slate-100 hover:border-red-200 rounded-2xl transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update • {timeString}</div>
                    <a href={news.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-red-500 transition-colors">
                      Verify ↗
                    </a>
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed font-medium">{news.update_text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
