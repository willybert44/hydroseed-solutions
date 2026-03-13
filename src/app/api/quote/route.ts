import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
      const emailContent = `
        <h2>New Quote Request: ${data.projectName || data.companyName || 'Lead'}</h2>
        <p><strong>Company:</strong> ${data.companyName || 'N/A'}</p>
        <p><strong>Contact:</strong> ${data.contactName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <br />
        <p><strong>Project Name:</strong> ${data.projectName}</p>
        <p><strong>Location:</strong> ${data.projectLocation}</p>
        <p><strong>Timeline:</strong> ${data.timeline || 'N/A'}</p>
        <p><strong>Specifications:</strong></p>
        <pre>${data.specifications || 'N/A'}</pre>
        <br />
        <p><em>Full Data Payload:</em></p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;

      await resend.emails.send({
        from: 'Quotes <onboarding@resend.dev>', // Update this to your verified Resend domain, e.g., 'Quotes <hello@hydroseed.solutions>'
        to: ['hello@hydroseed.solutions'],
        subject: `New RFQ: ${data.projectName || 'Lead'} — ${data.companyName || data.contactName}`,
        html: emailContent,
        replyTo: data.email
      });
    } else {
      console.warn('RESEND_API_KEY not configured. Skipping email.');
    }

    return NextResponse.json({ success: true, message: 'Quote submitted successfully' });
  } catch (error) {
    console.error('Submission Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process submission' }, { status: 500 });
  }
}
