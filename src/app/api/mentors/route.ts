import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const degree = searchParams.get("degree");

    const db = createServiceClient();

    let query = db.from("mentors").select("*").eq("is_active", true);
    if (degree) query = query.eq("degree", degree);

    const { data, error } = await query.order("neet_score", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ mentors: data || [] });
  } catch (error) {
    console.error("Mentors error:", error);
    return NextResponse.json({ mentors: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = createServiceClient();

    const { data, error } = await db
      .from("mentors")
      .insert([{
        name: body.name,
        degree: body.degree,
        college: body.college,
        neet_score: body.neet_score,
        calendly_link: body.calendly_link || "",
        photo_url: body.photo_url || "",
        is_active: true,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ mentor: data });
  } catch (error) {
    console.error("Add mentor error:", error);
    return NextResponse.json({ error: "Failed to add mentor" }, { status: 500 });
  }
}
