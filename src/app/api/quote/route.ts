import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { EMAIL_FROM, EMAIL_FROM_BOOKINGS, EMAIL_TO_INTERNAL, emailLayout, detailCard, detailRow, ctaButton, mutedText } from '@/lib/email';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 1. Save to Supabase (if configured)
    if (supabase) {
      const { error: dbError } = await supabase
        .from('quotes') // Make sure this table exists in your Supabase project
        .insert([{
          type: data.type || 'Commercial RFQ',
          company_name: data.companyName,
          contact_name: data.contactName,
          email: data.email,
          phone: data.phone,
          project_name: data.projectName,
          project_location: data.projectLocation,
          estimated_acreage: data.estimatedAcreage,
          payload: data // Storing the full JSON payload for flexibility
        }]);
        
      if (dbError) {
        console.error('Supabase Insertion Error:', dbError);
        // Continue to send email even if DB fails, to prevent total data loss
      }
    } else {
      console.warn('Supabase not configured. Skipping DB insertion.');
    }

    // 2. Send Email via Resend
    if (process.env.RESEND_API_KEY) {
      const projectTypes = Array.isArray(data.projectTypes) && data.projectTypes.length > 0
        ? data.projectTypes.join(', ')
        : 'N/A';
      const acreage = data.estimatedAcreage
        ? `${Number(data.estimatedAcreage).toLocaleString()} ${data.areaUnit || 'acres'}`
        : 'N/A';

      // Internal notification to Jimmy
      await resend.emails.send({
        from: EMAIL_FROM_BOOKINGS,
        to: [EMAIL_TO_INTERNAL],
        subject: `New RFQ: ${data.projectName || 'Lead'} — ${data.companyName || data.contactName}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;">New Commercial RFQ</h2>
          ${detailCard(
            detailRow("Company", data.companyName || "N/A") +
            detailRow("Contact", data.contactName) +
            detailRow("Email", data.email) +
            detailRow("Phone", data.phone || "N/A") +
            detailRow("SMS Opt-In", data.smsOptIn ? "Yes" : "No")
          )}
          ${detailCard(
            detailRow("Project", data.projectName || "N/A") +
            detailRow("Project Types", projectTypes) +
            detailRow("Location", data.projectLocation || "N/A") +
            detailRow("Estimated Area", acreage) +
            detailRow("Timeline", data.timeline || "N/A") +
            (data.specifications ? `<p style="margin:8px 0 4px;font-size:14px;"><strong>Specifications:</strong></p><pre style="margin:4px 0;font-size:13px;white-space:pre-wrap;background:#f8f8f8;padding:8px;border-radius:8px;">${data.specifications}</pre>` : "") +
            (data.additionalNotes ? `<p style="margin:8px 0 4px;font-size:14px;"><strong>Additional Notes:</strong></p><pre style="margin:4px 0;font-size:13px;white-space:pre-wrap;background:#f8f8f8;padding:8px;border-radius:8px;">${data.additionalNotes}</pre>` : "")
          )}
        `),
        replyTo: data.email
      }).catch(err => console.error('Internal RFQ email error:', err));

      // Customer confirmation
      if (data.email) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [data.email],
          subject: "We've Received Your RFQ — Hydroseed Solutions",
          html: emailLayout(`
            <h2 style="margin:0 0 8px;font-size:22px;text-align:center;">RFQ Received</h2>
            <p>Hi ${data.contactName?.split(' ')[0] || 'there'},</p>
            <p>Thanks for submitting a request for quote. We've received your inquiry and our team will review the details below.</p>
            ${detailCard(
              detailRow("Company", data.companyName || "N/A") +
              detailRow("Project", data.projectName || "N/A") +
              detailRow("Project Types", projectTypes) +
              detailRow("Location", data.projectLocation || "N/A") +
              detailRow("Estimated Area", acreage) +
              detailRow("Timeline", data.timeline || "N/A")
            )}
            <p><strong>What's next?</strong> We typically respond to commercial RFQs within 1 business day with preliminary pricing and a proposed site visit schedule.</p>
            ${mutedText("Questions? Reply to this email or reach us at hello@hydroseed.solutions.")}
          `),
        }).catch(err => console.error('Customer RFQ confirmation email error:', err));
      }
    } else {
      console.warn('RESEND_API_KEY not configured. Skipping email.');
    }

    return NextResponse.json({ success: true, message: 'Quote submitted successfully' });
  } catch (error) {
    console.error('Submission Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process submission' }, { status: 500 });
  }
}
