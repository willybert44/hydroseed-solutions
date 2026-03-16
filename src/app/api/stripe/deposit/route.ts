import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Payment service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const data = await request.json();
    
    // Ensure amount is valid and in cents for Stripe
    const amountInCents = Math.round(Number(data.amount) * 100);

    if (!amountInCents || amountInCents <= 0) {
      throw new Error("Invalid deposit amount.");
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      description: `Hydroseeding Project Deposit (15%) - Estimate Base: $${Math.round(Number(data.estimateBase || 0))} | Specs: ${data.squareFeet} SqFt | Slope: ${data.slope}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Stripe integration error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe checkout session" },
      { status: 500 }
    );
  }
}
