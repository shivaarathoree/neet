import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("PASTE")) {
      return NextResponse.json(
        { error: "Razorpay keys not configured yet. Add them to .env.local" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "neet_" + Date.now().toString(36),
    });

    return NextResponse.json(order);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Razorpay order error:", msg);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
