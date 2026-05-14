import { createServiceClient } from "./src/lib/supabase";

async function test() {
  const db = createServiceClient();
  const { data, error } = await db.from("students").insert([{
    name: "DB Test",
    email: "test@db.com",
    phone: "123",
    tier: "free",
    report_status: "pending"
  }]).select();

  if (error) {
    console.error("DB Error:", error.message);
  } else {
    console.log("DB Success:", data);
  }
}
test();
