import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NEET 2026 Crisis Action Plan | NEET by Unipathschool",
  description:
    "NEET 2026 cancelled? Get your personalised action plan in 5 minutes. What this means for your MBBS/BDS/BAMS/BHMS/BUMS/BVSc/BSc Nursing path. College lists, re-exam scenarios, drop vs repeat analysis.",
  keywords: [
    "NEET 2026 cancelled",
    "NEET cancel action plan",
    "MBBS admission 2026",
    "NTA NEET 2026",
    "NEET re-exam",
    "BAMS BHMS BUMS admission",
    "NEET score college list",
  ],
  openGraph: {
    title: "NEET 2026 Cancelled — Get Your Personal Action Plan",
    description: "24 lakh NEET 2026 students. Every degree path. One clear plan. Built by Unipathschool.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col overflow-x-hidden antialiased bg-[#FAFAFA]`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "Inter, sans-serif", borderRadius: "12px" },
          }}
        />
      </body>
    </html>
  );
}
