import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { EMAIL_FROM, EMAIL_TO_INTERNAL, emailLayout, detailCard, detailRow, ctaButton, mutedText } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!supabase) {
      console.warn('Supabase not configured. Skipping lead save.');
      return NextResponse.json({ success: true, message: 'Lead received (DB not configured)' });
    }

    const { error } = await supabase
      .from('leads')
      .insert([{
        type: data.type || 'residential',
        name: data.name,
        email: data.email,
        phone: data.phone,
        sms_opt_in: data.smsOptIn ?? false,
        project_address: data.projectAddress,
        billing_address: data.billingAddress,
        square_feet: data.squareFeet,
        slope: data.slope,
        grading: data.grading,
        soil_import: data.soilImport,
        seed_blend: data.seedBlend,
        sun: data.sun,
        amendments: data.amendments,
        estimate_low: data.estimateLow,
        estimate_high: data.estimateHigh,
        estimate_base: data.estimateBase,
        company_name: data.companyName,
        project_types: data.projectTypes,
        project_name: data.projectName,
        project_location: data.projectLocation,
        estimated_acreage: data.estimatedAcreage,
        specifications: data.specifications,
        timeline: data.timeline,
        additional_notes: data.additionalNotes,
        payload: data,
      }]);

    if (error) {
      console.error('Lead save error:', error);
      return NextResponse.json({ success: false, error: 'Failed to save lead' }, { status: 500 });
    }

    // Send emails for residential leads
    if (process.env.RESEND_API_KEY && data.email) {
      const estimateRange = `$${Number(data.estimateLow ?? 0).toLocaleString()} – $${Number(data.estimateHigh ?? 0).toLocaleString()}`;
      const depositAmount = `$${Math.round(Number(data.estimateBase ?? 0) * 0.15).toLocaleString()}`;
      const amendments = Array.isArray(data.amendments) && data.amendments.length > 0
        ? data.amendments.join(', ')
        : 'None';

      // Internal notification to Jimmy
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [EMAIL_TO_INTERNAL],
        subject: `📋 New Estimate: ${data.name} — ${Number(data.squareFeet ?? 0).toLocaleString()} sqft`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;">New Residential Inquiry</h2>
          ${detailCard(
            detailRow("Name", data.name || "N/A") +
            detailRow("Email", data.email) +
            detailRow("Phone", data.phone || "N/A") +
            detailRow("SMS Opt-In", data.smsOptIn ? "Yes" : "No") +
            detailRow("Project Address", data.projectAddress || "N/A") +
            detailRow("Billing Address", data.billingAddress || "Same as project")
          )}
          <h3 style="margin:20px 0 8px;font-size:16px;">Project Details</h3>
          ${detailCard(
            detailRow("Area", `${Number(data.squareFeet ?? 0).toLocaleString()} sqft`) +
            detailRow("Slope", data.slope || "N/A") +
            detailRow("Grading", data.grading || "N/A") +
            detailRow("Soil Import", data.soilImport || "None") +
            detailRow("Seed Blend", data.seedBlend || "N/A") +
            detailRow("Amendments", amendments)
          )}
          <h3 style="margin:20px 0 8px;font-size:16px;">Estimate</h3>
          ${detailCard(
            detailRow("Estimate Range", estimateRange) +
            detailRow("Base Estimate", `$${Number(data.estimateBase ?? 0).toLocaleString()}`) +
            detailRow("15% Deposit", depositAmount)
          )}
        `),
        replyTo: data.email,
      }).catch(err => console.error('Internal lead email error:', err));

      // Customer confirmation
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [data.email],
        subject: "Your Hydroseed Solutions Estimate",
        html: emailLayout(`
          <h2 style="margin:0 0 8px;font-size:22px;text-align:center;">Your Estimate Is Ready</h2>
          <p>Hi ${data.name?.split(' ')[0] || 'there'},</p>
          <p>Thanks for using our project planner! Here's a summary of your hydroseeding estimate.</p>
          ${detailCard(
            detailRow("Project Address", data.projectAddress || "N/A") +
            detailRow("Area", `${Number(data.squareFeet ?? 0).toLocaleString()} sqft`) +
            detailRow("Slope", data.slope || "N/A") +
            detailRow("Seed Blend", data.seedBlend || "N/A") +
            detailRow("Grading", data.grading || "None") +
            detailRow("Soil Import", data.soilImport || "None") +
            detailRow("Amendments", amendments)
          )}
          <div style="text-align:center;margin:24px 0;">
            <p style="font-size:28px;font-weight:700;margin:0;">${estimateRange}</p>
            <p style="font-size:13px;color:#666;margin:4px 0 0;">Estimated Project Cost</p>
          </div>
          <p>This is a ballpark estimate — your final price may be lower or higher depending on site conditions.</p>
          <p><strong>What's next?</strong> You can lock in your project with a 15% deposit (${depositAmount}), or schedule a free phone consultation to discuss your project in detail.</p>
          ${ctaButton(`https://hydroseed.solutions/get-seeded`, "View Your Estimate")}
          ${mutedText("Questions? Reply to this email or reach us at hello@hydroseed.solutions.")}
        `),
      }).catch(err => console.error('Customer confirmation email error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
