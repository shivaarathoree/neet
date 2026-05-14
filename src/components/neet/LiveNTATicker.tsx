"use client";

import { useEffect, useState } from "react";
import type { NtaUpdate } from "@/types";

export default function LiveNTATicker() {
  const [updates, setUpdates] = useState<NtaUpdate[]>([
    {
      id: "1",
      update_text: "NTA officially confirms NEET-UG 2026 is cancelled. New date will be announced on nta.ac.in — check there for official notice.",
      source_url: "https://nta.ac.in",
      fetched_at: new Date().toISOString(),
    },
    {
      id: "2",
      update_text: "All 24 lakh registered students remain eligible. Your registration, exam city, and admit card details are preserved.",
      source_url: "https://nta.ac.in",
      fetched_at: new Date().toISOString(),
    },
    {
      id: "3",
      update_text: "Supreme Court monitoring NEET 2026 situation. No MBBS/BDS/AYUSH admissions will proceed until re-exam results are published.",
      source_url: "https://main.sci.gov.in",
      fetched_at: new Date().toISOString(),
    },
    {
      id: "4",
      update_text: "MCC (Medical Counselling Committee) has paused all counselling rounds until further notice from NTA.",
      source_url: "https://mcc.nic.in",
      fetched_at: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    // Fetch live NTA updates from our API
    fetch("/api/nta-updates")
      .then((r) => r.json())
      .then((data) => {
        if (data.updates && data.updates.length > 0) {
          setUpdates(data.updates);
        }
      })
      .catch(() => {
        /* Use fallback updates */
      });
  }, []);

  const doubled = [...updates, ...updates]; // for seamless loop

  return (
    <div className="w-full bg-[#9A0000] border-y border-[#660000] py-3.5 overflow-hidden relative shadow-[0_4px_20px_rgba(154,0,0,0.5)] z-40">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#9A0000] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#9A0000] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-4 mb-0">
        {/* Static label */}
        <div className="flex items-center gap-2 pl-4 sm:pl-6 shrink-0 z-20 relative bg-[#9A0000] shadow-[10px_0_10px_#9A0000]">
          <span className="w-3 h-3 rounded-full bg-white live-dot shadow-[0_0_12px_#ffffff]" />
          <span className="text-xs font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
            LATEST CRISIS UPDATES
          </span>
          <span className="w-px h-4 bg-red-400 ml-2" />
        </div>

        {/* Scrolling updates */}
        <div className="ticker-track gap-12">
          {doubled.map((update, i) => (
            <a
              key={`${update.id}-${i}`}
              href={update.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 whitespace-nowrap group"
            >
              <span className="text-[13px] text-white font-medium group-hover:text-amber-200 transition-colors tracking-wide">
                {update.update_text}
              </span>
              <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/30 group-hover:border-amber-200 group-hover:text-amber-200 transition-colors">
                Read More ↗
              </span>
              <span className="mx-6 text-red-500">•</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
