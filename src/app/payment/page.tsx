"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NeetHeader from "@/components/neet/NeetHeader";
import type { Student } from "@/types";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (opts: object) => { open: () => void; on: (e: string, cb: (r: { error: { description: string } }) => void) => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Partial<Student> | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("neet_student_data");
    if (!raw) { router.push("/get-started"); return; }
    const data = JSON.parse(raw);
    setStudent(data);
    setForm((f) => ({ ...f, name: data.name || "", email: data.email || "", phone: data.phone || "" }));
  }, [router]);

  const valid = form.name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email) && form.phone.length >= 10;

  const handlePay = useCallback(async () => {
    if (!valid || !student) return;
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error("Payment gateway failed to load. Check your internet."); setLoading(false); return; }

      const token = localStorage.getItem("neet_session_token") || Math.random().toString(36).slice(2);
      const updatedStudent = { ...student, name: form.name, email: form.email, phone: form.phone };
      localStorage.setItem("neet_student_data", JSON.stringify(updatedStudent));

      // Create order server-side
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedStudent, session_token: token }),
      });
      const order = await orderRes.json();
      if (order.error) { toast.error(order.error); setLoading(false); return; }

      const rz = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "NEET by Unipathschool",
        description: "NEET 2026 Crisis Action Plan — ₹199",
        order_id: order.order_id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#C2410C" },
        modal: { escape: false, backdropclose: false },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          toast.success("Payment received! Generating your report...");
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              session_token: order.session_token || token,
            }),
          });
          const verify = await verifyRes.json();
          if (verify.success) {
            router.push(`/report/${verify.student_id}`);
          } else {
            toast.error("Verification issue. Your payment is safe — we'll email your report within 1 hour.");
            router.push(`/report/${token}`);
          }
        },
      });

      rz.on("payment.failed", (r: { error: { description: string } }) => {
        toast.error("Payment failed: " + r.error.description + ". Please try again.");
        setLoading(false);
      });

      rz.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [valid, student, form, router]);

  if (!student) return null;

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <NeetHeader />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-5">
              <span className="text-primary text-[10px] font-bold uppercase tracking-wider">One-time · NEET Crisis Discount</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium font-heading text-slate-900 tracking-tighter mb-3">
              Your Complete Action Plan
            </h1>
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-4xl font-bold font-heading text-slate-900">₹199</span>
              <span className="text-xl text-slate-400 line-through">₹499</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">60% OFF</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl mb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">What {student.name} gets</p>
            {[
              { icon: "📋", text: "6-page personalised PDF with your name on cover" },
              { icon: "🏥", text: `Real college list for ${student.target_degree} (current score + re-exam scenarios)` },
              { icon: "⚖️", text: "Drop vs repeat — specific to your years of prep" },
              { icon: "📅", text: "30-day week-by-week prep plan" },
              { icon: "🔍", text: "Alternative paths if score doesn't meet cutoff" },
              { icon: "📧", text: "PDF emailed to you + download link on screen" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl mb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Where to send your PDF</p>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input id="pay-name" type="text" placeholder="Your name (appears on PDF cover)" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input id="pay-email" type="email" placeholder="PDF will be sent here" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Phone Number</label>
                <input id="pay-phone" type="tel" placeholder="10-digit mobile number" value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          <button onClick={handlePay} disabled={!valid || loading} id="pay-now"
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm uppercase tracking-widest hover:bg-primary-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/25">
            {loading
              ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing...</>
              : <>Pay ₹199 Securely 🔒</>}
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-3">
            Razorpay · UPI / Cards / Net Banking · No account needed
          </p>
          <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
            <p className="text-[11px] text-slate-500 italic">
              &ldquo;PDF delivered on screen + emailed within 10 minutes. Your data is never shared.&rdquo;
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
