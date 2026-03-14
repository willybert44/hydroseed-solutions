import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SERVICES } from "@/lib/booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const AMOUNTS: Record<string, number> = {
  walkthrough: 4500,  // $45 in cents
  "soil-test": 17000, // $170 in cents
};

export async function POST(req: Request) {
  const { service, name, email } = await req.json();

  if (!service || !AMOUNTS[service]) {
    return NextResponse.json({ error: "Invalid or free service" }, { status: 400 });
  }

  const svc = SERVICES[service];
  const amountCents = AMOUNTS[service];

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      description: `${svc.label} — ${name}`,
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Payment setup failed";
    console.error("Booking payment error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
