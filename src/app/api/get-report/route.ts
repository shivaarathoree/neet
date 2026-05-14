import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing report id" }, { status: 400 });
    }

    const db = createServiceClient();

    // Try by report UUID first
    const { data: byId } = await db
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (byId) return NextResponse.json(byId);

    // Try by session token (via student lookup)
    const { data: student } = await db
      .from("students")
      .select("id")
      .eq("session_token", id)
      .single();

    if (student) {
      const { data: byStudent } = await db
        .from("reports")
        .select("*")
        .eq("student_id", student.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single();

      if (byStudent) return NextResponse.json(byStudent);
    }

    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
