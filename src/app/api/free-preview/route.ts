import { NextResponse } from "next/server";
import { generateFreePreview } from "@/lib/gemini";
import type { Student } from "@/types";

export async function POST(req: Request) {
  try {
    const student: Partial<Student> = await req.json();
    if (!student.target_degree || student.score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const preview = await generateFreePreview(student);
    return NextResponse.json({ preview });
  } catch (error) {
    console.error("Free preview error:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
