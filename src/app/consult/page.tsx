"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import NeetHeader from "@/components/neet/NeetHeader";
import type { Mentor, Student } from "@/types";

const FALLBACK_MENTORS: Mentor[] = [
  { id: "1", name: "Dr. Arjun Mehta", degree: "MBBS", college: "AIIMS New Delhi", neet_score: 698, calendly_link: "#", photo_url: "", is_active: true },
  { id: "2", name: "Dr. Priya Nair", degree: "BAMS", college: "IPGT & RA, Gujarat", neet_score: 412, calendly_link: "#", photo_url: "", is_active: true },
  { id: "3", name: "Dr. Rohan Sharma", degree: "BDS", college: "Maulana Azad Dental, Delhi", neet_score: 520, calendly_link: "#", photo_url: "", is_active: true },
  { id: "4", name: "Dr. Ananya Singh", degree: "BHMS", college: "NMC Homeopathic, Mumbai", neet_score: 340, calendly_link: "#", photo_url: "", is_active: true },
];

export default function ConsultPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Partial<Student> | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selected, setSelected] = useState<Mentor | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("neet_student_data");
    if (raw) setStudent(JSON.parse(raw));

    fetch("/api/mentors")
      .then((r) => r.json())
      .then((d) => setMentors(d.mentors?.length ? d.mentors : FALLBACK_MENTORS))
      .catch(() => setMentors(FALLBACK_MENTORS));
  }, []);

  const matched = student?.target_degree
    ? mentors.filter((m) => m.degree === student.target_degree)
    : [];
  const others = mentors.filter((m) => !matched.find((mm) => mm.id === m.id));
  const displayMentors = [...matched, ...others];

  const handleBook = async (mentor: Mentor) => {
    setSelected(mentor);
    // Create ₹999 payment
    const resp = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 999 }),
    });
    const order = await resp.json();
    if (order.error) { alert(order.error); return; }

    const rz = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      amount: order.amount,
      currency: order.currency,
      name: "NEET by Unipathschool",
      description: `1:1 Session with ${mentor.name}`,
      order_id: order.id,
      prefill: { name: student?.name || "", email: student?.email || "", contact: student?.phone || "" },
      theme: { color: "#0EA5E9" },
      handler: () => {
        if (mentor.calendly_link && mentor.calendly_link !== "#") {
          window.open(mentor.calendly_link, "_blank");
        } else {
          alert("Booking confirmed! The mentor will contact you within 2 hours on your registered number.");
        }
      },
    });
    rz.open();
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <NeetHeader />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-full mb-5">
            <span className="text-sky-600 text-[10px] font-bold uppercase tracking-wider">1-on-1 Mentorship</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-medium font-heading text-slate-900 tracking-tighter mb-3">
            Talk to a senior who{" "}
            <span className="text-primary">cracked your exact path</span>
          </h1>
          <p className="text-slate-500 text-sm font-light max-w-xl mx-auto">
            45 minutes. No script. Real questions, real answers from someone who sat in your seat.
          </p>
        </motion.div>

        {/* Matched mentor highlight */}
        {matched.length > 0 && (
          <div className="mb-5 p-3 bg-sky-50 border border-sky-200 rounded-2xl text-center">
            <p className="text-[11px] font-semibold text-sky-700">
              ⭐ We found {matched.length} mentor{matched.length > 1 ? "s" : ""} who cracked {student?.target_degree} — shown first
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {displayMentors.map((mentor, i) => {
            const isMatch = matched.find((m) => m.id === mentor.id);
            return (
              <motion.div key={mentor.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`p-6 bg-white border-2 rounded-2xl transition-all duration-300 hover:shadow-lg ${isMatch ? "border-sky-300 shadow-sky-50" : "border-slate-200"}`}>
                {isMatch && (
                  <div className="text-[9px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-1 rounded-full inline-block mb-3 uppercase tracking-wider">
                    Matches Your Degree
                  </div>
                )}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 shrink-0">
                    {mentor.photo_url ? (
                      <img src={mentor.photo_url} alt={mentor.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      mentor.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-slate-900 text-base">{mentor.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{mentor.degree} · {mentor.college}</p>
                    <p className="text-[11px] font-medium text-primary mt-1">NEET Score: {mentor.neet_score}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold font-heading text-slate-900">₹999</div>
                    <div className="text-[10px] text-slate-400">45 min session</div>
                  </div>
                  <button onClick={() => handleBook(mentor)}
                    className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${isMatch ? "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20" : "bg-slate-900 text-white hover:bg-primary"}`}>
                    Book Session →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* What happens */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">What happens after you book</p>
          {[
            { step: "1", text: "Pay ₹999 via Razorpay (UPI / Card / Net Banking)" },
            { step: "2", text: "Pick a 45-min slot on the mentor's calendar" },
            { step: "3", text: "Get the video call link on your email" },
            { step: "4", text: "45 min — ask everything, no judgement" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">{item.step}</div>
              <p className="text-sm text-slate-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
