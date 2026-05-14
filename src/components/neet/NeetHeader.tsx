"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function NeetHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-5 w-full z-50 px-4 sm:px-6 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="max-w-5xl w-full glass rounded-full h-14 flex items-center justify-between px-3 pr-3 pointer-events-auto shadow-[0_4px_24px_rgba(15,23,42,0.07)] border border-white/60"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-3">
            <span className="font-heading font-semibold text-slate-900 text-base tracking-tighter">
              NEET
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest hidden sm:inline">
              by
            </span>
            <span className="font-heading font-light text-primary text-base tracking-tighter hidden sm:inline">
              UNIPATHSCHOOL
            </span>
            <span className="w-1.5 h-4 bg-primary ml-1 opacity-80 animate-pulse" />
          </Link>

          {/* Live badge — desktop */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 live-dot" />
            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
              NTA Updates Live
            </span>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/get-started"
              className="relative flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold text-white bg-slate-900 rounded-full overflow-hidden group uppercase tracking-[0.15em] transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <div className="absolute inset-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full z-0" />
              <span className="relative z-10">Get Plan</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary/30 transition-all"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </motion.div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="fixed top-[4.5rem] left-4 right-4 z-40 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-5 md:hidden pointer-events-auto"
        >
          <div className="flex items-center gap-2 mb-4 px-2 py-2 bg-amber-50 rounded-2xl border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 live-dot" />
            <span className="text-[11px] font-semibold text-amber-700">NTA Updates Live</span>
          </div>
          <Link
            href="/get-started"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300"
          >
            Get My Action Plan →
          </Link>
        </motion.div>
      )}
    </>
  );
}
