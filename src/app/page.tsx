"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import NeetHeader from "@/components/neet/NeetHeader";
import LiveNTATicker from "@/components/neet/LiveNTATicker";
import LiveNewsSection from "@/components/neet/LiveNewsSection";

const stats = [
  { number: "24L+", label: "Students Affected" },
  { number: "7", label: "Degree Paths" },
  { number: "5 min", label: "To Get Started" },
  { number: "₹199", label: "Complete Report" },
];

const threeOptions = [
  { icon: "⏳", title: "Wait & Watch", desc: "NTA will announce re-exam in 30–45 days. Registration is safe. But panic without a plan is wasted energy.", tag: "Default", tagBg: "bg-slate-100 text-slate-600", border: "border-slate-200" },
  { icon: "📚", title: "Prepare Now", desc: "Use this window. 30 days of focused revision can add 30–50 marks. That changes which college you get.", tag: "Recommended", tagBg: "bg-primary/10 text-primary", border: "border-primary/40" },
  { icon: "🔄", title: "Explore Alternatives", desc: "Depending on your score and degree, strong paths may already be open. Don't decide blind.", tag: "Worth Knowing", tagBg: "bg-sky-50 text-sky-700", border: "border-sky-200" },
];

const features = [
  { icon: "📊", title: "Scenario Analysis", desc: "Exactly what your options are if the current score stands — and what changes if the re-exam score goes up 40 or 80 marks." },
  { icon: "⚖️", title: "Drop vs Repeat", desc: "Data-driven. Specific to your years of prep, your score, your degree. Not a generic answer." },
  { icon: "🛣️", title: "Alternative Paths", desc: "If MBBS or BDS is out of reach right now, we show you the real viable paths that accept your score." },
];

const trustPoints = [
  "No fake countdown timers",
  "No 'limited seats' pressure tactics",
  "Every NTA update links to official source",
  "Pay only if the free preview actually helped you",
  "PDF professional enough for parents to read and trust",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <NeetHeader />

      {/* NTA Ticker */}
      <div className="pt-[4.5rem]">
        <LiveNTATicker />
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)]" />

        {/* Glow orbs */}
        <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 -right-20 w-[40rem] h-[40rem] bg-gradient-to-bl from-primary/6 to-orange-300/3 blur-[130px] rounded-full pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-10 -left-20 w-[36rem] h-[36rem] bg-gradient-to-tr from-sky-500/4 to-primary/6 blur-[110px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-24">
          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-10">
            <span className="w-2 h-2 rounded-full bg-red-500 live-dot shadow-[0_0_8px_#ef4444]" />
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-[0.2em]">
              NEET 2026 Cancelled · 24 Lakh Students Affected
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9 }}
            className="text-5xl sm:text-6xl lg:text-[5.5rem] font-medium font-heading text-slate-900 leading-[1.05] tracking-tighter mb-8">
            NEET Cancelled.
            <br />
            <span className="relative inline-block">
              <span className="text-gradient">Your parents want answers.</span>
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,10 Q100,0 200,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            <span className="text-slate-800">Get them in 5 minutes.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            MBBS · BDS · BAMS · BHMS · BUMS · BVSc · BSc Nursing.
            Every student is in chaos right now. This platform gives you one thing:{" "}
            <span className="text-slate-800 font-medium">&ldquo;What do I do NOW?&rdquo;</span>
          </motion.p>

          {/* CTA group */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/get-started" id="hero-cta"
              className="group relative overflow-hidden inline-flex items-center gap-3 px-9 py-4.5 text-sm font-bold text-white bg-slate-900 rounded-full shadow-2xl shadow-slate-900/20 hover:shadow-primary/30 transition-all duration-400 uppercase tracking-widest">
              <div className="absolute inset-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full z-0" />
              <span className="relative z-10 flex items-center gap-2.5">
                Get Your Free Preview
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Free preview · No login · No credit card
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tighter">{s.number}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />
      </section>

      {/* ── LIVE NEWS ────────────────────────────────────────── */}
      <LiveNewsSection />

      {/* ── 3 OPTIONS ────────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(194,65,12,0.03),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-primary text-[11px] font-bold tracking-[0.3em] uppercase mb-5 flex items-center justify-center gap-4">
              <span className="w-10 h-px bg-primary/30" /> Right Now <span className="w-10 h-px bg-primary/30" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium font-heading text-slate-900 tracking-tighter mb-4">
              You have 3 options.{" "}
              <span className="text-primary">Most students don&apos;t see all 3.</span>
            </h2>
            <p className="text-slate-500 text-base font-light">Your personalised plan tells you which one fits your score, category, and degree.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {threeOptions.map((opt, i) => (
              <motion.div key={opt.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className={`relative p-7 bg-white border-2 ${opt.border} rounded-[1.5rem] hover:shadow-xl transition-all duration-300 group`}>
                <div className="text-4xl mb-4">{opt.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-heading font-semibold text-slate-900 text-xl tracking-tight">{opt.title}</h3>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${opt.tagBg}`}>{opt.tag}</span>
                </div>
                <p className="text-sm text-slate-500 font-light leading-relaxed">{opt.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-10">
            <Link href="/get-started"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[11px] font-bold text-white bg-slate-900 rounded-full uppercase tracking-widest hover:bg-primary transition-all duration-300">
              See Which Option Fits Me →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── INSIDE THE PLAN ──────────────────────────────────── */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-primary text-[11px] font-bold tracking-[0.3em] uppercase mb-5 flex items-center justify-center gap-4">
              <span className="w-10 h-px bg-primary/30" /> What&apos;s Inside <span className="w-10 h-px bg-primary/30" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium font-heading text-slate-900 tracking-tighter mb-4">
              Your personalised crisis roadmap
            </h2>
            <p className="text-slate-500 text-base font-light max-w-2xl mx-auto">
              Not generic advice. A 6-page PDF built around your specific score, category, state, and degree target.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 bg-white border border-slate-200 rounded-[1.5rem] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-heading font-semibold text-slate-900 text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 font-light leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_0%,rgba(194,65,12,0.04),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-primary text-[11px] font-bold tracking-[0.3em] uppercase mb-5 flex items-center justify-center gap-4">
              <span className="w-10 h-px bg-primary/30" /> Simple Pricing <span className="w-10 h-px bg-primary/30" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium font-heading text-slate-900 tracking-tighter mb-4">
              Transparent. No surprises.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Free */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-7 bg-white border border-slate-200 rounded-[1.5rem]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Free</div>
              <div className="text-4xl font-bold font-heading text-slate-900 tracking-tighter mb-2">₹0</div>
              <p className="text-sm text-slate-400 font-light mb-6">No card. No signup.</p>
              {["Live NTA updates", "What cancellation means for YOUR degree", "Your 3 options explained", "One personalised score insight"].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-slate-600 mb-2.5">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {f}
                </div>
              ))}
            </motion.div>

            {/* ₹199 */}
            <motion.div initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative p-7 bg-slate-900 border border-slate-800 rounded-[1.5rem] hover:border-primary/50 transition-all overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 blur-[70px] rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sky-500/5 blur-[60px] rounded-full" />
              <div className="relative z-10">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-5">Most Popular</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-4xl font-bold font-heading text-white tracking-tighter">₹199</div>
                  <div className="text-sm text-slate-500 line-through">₹499</div>
                </div>
                <p className="text-sm text-slate-400 font-light mb-6">NEET chaos discount · One-time</p>
                {["Complete 6-page Personalised PDF", "Real college list (your score + 3 re-exam scenarios)", "Drop vs repeat analysis", "30-day prep plan, week by week", "Alternative medical paths", "Your name on cover — share with parents"].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-slate-300 mb-2.5">
                    <span className="text-primary mt-0.5 shrink-0">✓</span> {f}
                  </div>
                ))}
                <Link href="/get-started"
                  className="mt-6 w-full flex items-center justify-center py-3.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                  Get This Plan →
                </Link>
              </div>
            </motion.div>

            {/* ₹999 */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-7 bg-white border border-slate-200 rounded-[1.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-sky-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">Limited Slots</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">PRO</div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-bold font-heading text-slate-900 tracking-tighter mb-2">₹999</div>
                <div className="text-sm text-slate-400 line-through">₹2499</div>
              </div>
              <p className="text-sm text-slate-400 font-light mb-6">Complete Guidance + Human Support</p>
              {["Everything in the ₹199 Plan", "45-min 1:1 Video Mentor Call", "Talk to a senior who cracked it", "Added to Direct WhatsApp Community", "Ask doubts directly anytime"].map((f, i) => (
                <div key={f} className="flex items-start gap-2 text-sm text-slate-600 mb-2.5">
                  <span className={`${i === 0 ? "text-primary font-bold" : "text-sky-500"} mt-0.5 shrink-0`}>✓</span> 
                  <span className={i === 0 ? "font-medium" : ""}>{f}</span>
                </div>
              ))}
              <a href="mailto:shivarathorecse@gmail.com?subject=NEET%20PRO%20Plan%20Request&body=Hi%20Unipathschool%20Team,%0A%0AI%20am%20interested%20in%20the%20PRO%20Plan%20(Rs%20999)%20with%20the%201:1%20mentor%20call%20and%20WhatsApp%20community.%0A%0AMy%20details:%0AName:%20%0APhone:%20%0A%0APlease%20let%20me%20know%20how%20to%20proceed."
                className="mt-6 w-full flex items-center justify-center py-3.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all">
                Request PRO →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ────────────────────────────────────── */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-slate-500 text-base font-light italic mb-10 leading-relaxed max-w-xl mx-auto">
              &ldquo;24 lakh students are in crisis right now. We built this to help — not to profit from panic. Every claim here links to an official source.&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {trustPoints.map((t, i) => (
                <div key={t} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                  <span className="text-sm">{i < 2 ? "🚫" : "✅"}</span>
                  <span className="text-[11px] font-medium text-slate-600">{t}</span>
                </div>
              ))}
            </div>
            <Link href="/get-started"
              className="inline-flex items-center gap-3 px-9 py-4.5 text-sm font-bold text-white bg-slate-900 rounded-full hover:bg-primary transition-all duration-300 uppercase tracking-widest shadow-xl shadow-slate-900/10">
              Start Free — No Login Needed →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-950 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-heading font-semibold text-white text-lg tracking-tighter mb-1">
              NEET by <span className="text-primary">UNIPATHSCHOOL</span>
            </div>
            <div className="text-xs text-slate-500 font-light">Crisis support for 24 lakh NEET 2026 students.</div>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://nta.ac.in" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-white transition-colors">NTA Official ↗</a>
            <a href="https://unipathschool.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-white transition-colors">unipathschool.com ↗</a>
          </div>
          <div className="text-xs text-slate-600">© 2026 Unipathschool. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
