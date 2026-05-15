"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestPDFPage() {
  const router = useRouter();
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; filename: string; size: number; colleges: number } | null>(null);
  const [form, setForm] = useState({
    name: "Shiva Test",
    email: "shivarathorecse@gmail.com",
    target_degree: "MBBS",
    score: "520",
    category: "General",
    state: "Rajasthan",
    prep_years: "1 year drop",
    biggest_worry: "Parents are worried, don't know what to do next",
  });

  const addLog = (msg: string) => setLog((l) => [...l, `${new Date().toLocaleTimeString()} — ${msg}`]);

  // Test 1: Direct PDF only (no DB)
  const generatePDF = async () => {
    setLoading(true);
    setResult(null);
    setLog([]);
    addLog("Calling report system + pdf-lib...");

    try {
      const res = await fetch("/api/test-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || data.error) { addLog("❌ Error: " + (data.error || res.statusText)); setLoading(false); return; }

      addLog(`✅ Report data: ${data.colleges_count} colleges returned`);
      addLog(`✅ PDF: ${data.size} bytes (${Math.round(data.size / 1024)}KB)`);

      const binary = atob(data.pdf_base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult({ url, filename: data.filename, size: data.size, colleges: data.colleges_count });
      addLog("✅ PDF ready — click Open or Download below");
    } catch (err: unknown) {
      addLog("❌ " + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  // Test 2: Full pipeline — student → DB → queue → process → report page
  const testFullPipeline = async () => {
    setPipelineLoading(true);
    setLog([]);
    addLog("Creating student in Supabase...");

    try {
      const res = await fetch("/api/test-full-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || data.error) { addLog("❌ " + (data.error || res.statusText)); setPipelineLoading(false); return; }

      addLog("✅ Student saved to Supabase");
      addLog("✅ Report job queued");
      addLog("✅ process-queue triggered — generating PDF now...");
      addLog(`⏳ Redirecting to report page in 3 seconds...`);

      setTimeout(() => {
        router.push(data.report_url);
      }, 3000);

    } catch (err: unknown) {
      addLog("❌ " + (err instanceof Error ? err.message : String(err)));
      setPipelineLoading(false);
    }
  };

  const fields = Object.entries(form);

  return (
    <div style={{ fontFamily: "monospace", padding: 32, maxWidth: 760, margin: "0 auto", background: "#0C1120", minHeight: "100vh", color: "#E2E8F0" }}>
      <h1 style={{ color: "#C2410C", fontSize: 22, marginBottom: 4 }}>🧪 NEET Platform Test Console</h1>
      <p style={{ color: "#64748B", fontSize: 12, marginBottom: 24 }}>Dev tools — tests run without payment. Watch Next.js terminal for server logs.</p>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {fields.map(([key, val]) => (
          <div key={key} style={{ gridColumn: key === "biggest_worry" ? "span 2" : "span 1" }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              {key.replace(/_/g, " ")}
            </label>
            <input
              value={val}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#E2E8F0", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>
        ))}
      </div>

      {/* Test buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <button onClick={generatePDF} disabled={loading || pipelineLoading}
          style={{ padding: "14px", background: loading ? "#334155" : "#C2410C", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {loading ? "⏳ Generating PDF..." : "⚡ Test 1: PDF Only (No DB)"}
        </button>
        <button onClick={testFullPipeline} disabled={loading || pipelineLoading}
          style={{ padding: "14px", background: pipelineLoading ? "#334155" : "#1e40af", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {pipelineLoading ? "⏳ Running pipeline..." : "🔄 Test 2: Full Pipeline → Report Page"}
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#475569", marginBottom: 16 }}>
        <b style={{ color: "#94A3B8" }}>Test 1</b>: Report data + PDF only (fastest, no Supabase) &nbsp;|&nbsp;
        <b style={{ color: "#94A3B8" }}>Test 2</b>: Full flow — saves to DB, queues job, opens /report/[id]
      </p>

      {/* PDF result */}
      {result && (
        <div style={{ background: "#052e16", border: "1px solid #16a34a", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#4ade80", fontSize: 13, fontWeight: 700 }}>✅ PDF Ready!</div>
            <div style={{ color: "#86efac", fontSize: 11 }}>{result.size} bytes · {result.colleges} colleges · {result.filename}</div>
          </div>
          <a href={result.url} download={result.filename}
            style={{ padding: "10px 20px", background: "#16a34a", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            ⬇ Download AI PDF
          </a>
          <a href="https://lpzaslgjklcxeotobcdu.supabase.co/storage/v1/object/public/reports/assets/NEET26_Planner_UniPathSchool.pdf" target="_blank" rel="noopener noreferrer"
            style={{ padding: "10px 20px", background: "#C2410C", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            ⬇ Download Planner
          </a>
          <a href={result.url} target="_blank" rel="noopener noreferrer"
            style={{ padding: "10px 20px", background: "#1e40af", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            👁 Open AI PDF
          </a>
        </div>
      )}

      {/* Console */}
      <div style={{ background: "#1E293B", borderRadius: 12, padding: 16, minHeight: 80, border: "1px solid #334155" }}>
        <div style={{ fontSize: 10, color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Output</div>
        {log.length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>Click a test button above...</div>}
        {log.map((l, i) => (
          <div key={i} style={{ fontSize: 12, lineHeight: 1.8, color: l.includes("❌") ? "#F87171" : l.includes("✅") ? "#4ADE80" : l.includes("⏳") ? "#FCD34D" : "#94A3B8" }}>{l}</div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: 16, background: "#1E293B", borderRadius: 12, border: "1px solid #334155" }}>
        <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Quick Links</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["/", "/get-started", "/payment", "/api/process-queue"].map((link) => (
            <a key={link} href={link} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#C2410C", textDecoration: "none", padding: "4px 10px", border: "1px solid #C2410C30", borderRadius: 6 }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
