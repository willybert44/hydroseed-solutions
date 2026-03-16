import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  EMAIL_FROM,
  EMAIL_TO_INTERNAL,
  emailLayout,
  detailCard,
  detailRow,
} from "@/lib/email";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: Request) {
  const data = await req.json();
  const {
    name,
    email,
    phone,
    projectAddress,
    billingAddress,
    squareFeet,
    slope,
    grading,
    soilImport,
    seedBlend,
    amendments,
    estimateBase,
    depositAmount,
  } = data;

  if (!email || !estimateBase) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const deposit = depositAmount ?? Math.round(Number(estimateBase) * 0.15);
  const amendmentList =
    Array.isArray(amendments) && amendments.length > 0
      ? amendments.join(", ")
      : "None";

  if (resend) {
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [EMAIL_TO_INTERNAL],
        subject: `💰 Deposit Paid: ${name || "Customer"} — $${deposit.toLocaleString()} (${Number(squareFeet ?? 0).toLocaleString()} sqft)`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;">Deposit Paid — Project Booked</h2>
          ${detailCard(
            detailRow("Name", name || "N/A") +
            detailRow("Email", email) +
            detailRow("Phone", phone || "N/A") +
            detailRow("Project Address", projectAddress || "N/A") +
            detailRow("Billing Address", billingAddress || "Same as project")
          )}
          <h3 style="margin:20px 0 8px;font-size:16px;">Project Details</h3>
          ${detailCard(
            detailRow("Area", `${Number(squareFeet ?? 0).toLocaleString()} sqft`) +
            detailRow("Slope", slope || "N/A") +
            detailRow("Grading", grading || "N/A") +
            detailRow("Soil Import", soilImport || "None") +
            detailRow("Seed Blend", seedBlend || "N/A") +
            detailRow("Amendments", amendmentList)
          )}
          <h3 style="margin:20px 0 8px;font-size:16px;">Payment</h3>
          ${detailCard(
            detailRow("Deposit Paid", `$${deposit.toLocaleString()}`) +
            detailRow("Est. Project Total", `$${Number(estimateBase).toLocaleString()}`) +
            detailRow("Remaining Balance", `$${(Number(estimateBase) - deposit).toLocaleString()}`)
          )}
        `),
        replyTo: email,
      });
    } catch (err) {
      console.error("Deposit confirmation email error:", err);
    }
  }

  return NextResponse.json({ success: true });
}
