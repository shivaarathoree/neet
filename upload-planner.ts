import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing keys");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function upload() {
  const fileContent = fs.readFileSync("public/NEET26_Planner_UniPathSchool.pdf");
  
  const { data, error } = await supabase.storage
    .from("reports")
    .upload("assets/NEET26_Planner_UniPathSchool.pdf", fileContent, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    return;
  }

  const { data: publicUrlData } = supabase.storage.from("reports").getPublicUrl("assets/NEET26_Planner_UniPathSchool.pdf");
  console.log("PUBLIC URL:", publicUrlData.publicUrl);
}

upload();
