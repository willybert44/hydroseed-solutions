import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getZohoAccessToken } from "@/lib/zoho";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { SERVICES, createCalendarEvent, minutesToDisplay } from "@/lib/booking";
import {
  EMAIL_FROM,
  EMAIL_FROM_BOOKINGS,
  EMAIL_TO_INTERNAL,
  emailLayout,
  detailCard,
  detailRow,
  ctaButton,
  mutedText,
} from "@/lib/email";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: Request) {
  const data = await req.json();
  const { service, date, time, name, email, phone, address } = data;

  if (!service || !date || !time || !name || !email) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const svc = SERVICES[service];
  if (!svc) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  const [hours, minutes] = time.split(":").map(Number);
  const displayTime = minutesToDisplay(hours * 60 + minutes);
  const displayDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  try {
    const manageToken = randomUUID();
    let zohoEventUid: string | null = null;
    const origin = new URL(req.url).origin;
    const manageUrl = `${origin}/booking/manage?token=${manageToken}`;

    // 1. Create Zoho Calendar event
    try {
      const token = await getZohoAccessToken();
      const isOnSite = service !== "phone";
      zohoEventUid = await createCalendarEvent(token, {
        title: `${svc.label} — ${name}`,
        date,
        startTime: time,
        duration: svc.duration,
        description: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}${isOnSite && address ? `\nAddress: ${address}` : ""}\nService: ${svc.label}`,
        location: isOnSite && address ? address : undefined,
      });
    } catch (err) {
      console.error("Calendar event creation failed (continuing):", err);
    }

    // 2. Save to Supabase
    if (supabase) {
      const { error: dbError } = await supabase.from("bookings").insert([
        {
          service,
          date,
          time,
          name,
          email,
          phone,
          status: "confirmed",
          manage_token: manageToken,
          zoho_event_uid: zohoEventUid,
          payload: data,
        },
      ]);
      if (dbError) {
        console.error("Supabase bookings insert error:", dbError);
        return NextResponse.json(
          { error: "Failed to save booking" },
          { status: 500 }
        );
      }
    }

    // 3. Send notification + confirmation emails
    if (resend) {
      const isOnSite = service !== "phone";
      await Promise.all([
        // Business notification
        resend.emails.send({
          from: EMAIL_FROM_BOOKINGS,
          to: [EMAIL_TO_INTERNAL],
          subject: `New Booking: ${svc.label} — ${name} on ${displayDate}`,
          html: emailLayout(`
            <h2 style="margin:0 0 16px;font-size:20px;">New ${svc.label} Booking</h2>
            ${detailCard(
              detailRow("Name", name) +
              detailRow("Email", email) +
              detailRow("Phone", phone) +
              (isOnSite && address ? detailRow("Address", address) : "") +
              detailRow("Date", displayDate) +
              detailRow("Time", displayTime) +
              (data.paymentIntentId ? detailRow("Payment", `${svc.price} collected`) : "")
            )}
            ${ctaButton(manageUrl, "Manage This Booking")}
          `),
          replyTo: email,
        }),
        // Customer confirmation
        resend.emails.send({
          from: EMAIL_FROM,
          to: [email],
          subject: `Booking Confirmed: ${svc.label} — ${displayDate} at ${displayTime}`,
          html: emailLayout(`
            <h2 style="margin:0 0 8px;font-size:22px;text-align:center;color:#00c898;">You&rsquo;re booked!</h2>
            <p>Hi ${name},</p>
            <p>Your <strong>${svc.label}</strong> has been confirmed.</p>
            ${detailCard(
              detailRow("Date", displayDate) +
              detailRow("Time", displayTime) +
              (isOnSite && address ? detailRow("Location", address) : "") +
              (svc.price !== "Free" ? detailRow("Paid", svc.price) : "")
            )}
            ${
              service === "phone"
                ? `<p>We&rsquo;ll call you at <strong>${phone}</strong> at your scheduled time.</p>`
                : `<p>We&rsquo;ll meet you at your property at the scheduled time.${svc.price !== "Free" ? " Your consultation fee is credited toward your project if you move forward." : ""}</p>`
            }
            ${ctaButton(manageUrl, "Manage Your Booking")}
            ${mutedText("Need to reschedule or cancel? Use the button above or call (724) 866-7333.")}
          `),
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
