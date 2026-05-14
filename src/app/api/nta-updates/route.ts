import { NextResponse } from "next/server";
import { fetchNtaUpdates } from "@/lib/gemini";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const db = createServiceClient();

    // Check if we have fresh updates (< 30 min old)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existing } = await db
      .from("nta_updates")
      .select("*")
      .gte("fetched_at", thirtyMinAgo)
      .order("fetched_at", { ascending: false })
      .limit(4);

    if (existing && existing.length >= 2) {
      return NextResponse.json({ updates: existing, source: "cache" });
    }

    // Fetch fresh updates from our system
    const fresh = await fetchNtaUpdates();

    // Store in Supabase
    const rows = fresh.map((u: { update_text: string; source_url: string }) => ({ ...u, fetched_at: new Date().toISOString() }));
    await db.from("nta_updates").insert(rows);

    return NextResponse.json({ updates: rows, source: "live" });
  } catch (error) {
    console.error("NTA updates error:", error);
    // Return static fallback
    return NextResponse.json({
      updates: [
        { id: "f1", update_text: "NTA officially confirms NEET-UG 2026 is cancelled. New date will be announced on nta.ac.in.", source_url: "https://nta.ac.in", fetched_at: new Date().toISOString() },
        { id: "f2", update_text: "All 24 lakh registered students remain eligible. Your registration is preserved.", source_url: "https://nta.ac.in", fetched_at: new Date().toISOString() },
        { id: "f3", update_text: "Supreme Court monitoring the situation. No admissions will proceed until re-exam results.", source_url: "https://main.sci.gov.in", fetched_at: new Date().toISOString() },
      ],
      source: "fallback",
    });
  }
}
