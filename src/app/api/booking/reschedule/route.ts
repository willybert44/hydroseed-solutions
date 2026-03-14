import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getZohoAccessToken } from "@/lib/zoho";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import {
  SERVICES,
  createCalendarEvent,
  deleteCalendarEvent,
  minutesToDisplay,
} from "@/lib/booking";
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
  const { token, date, time } = await req.json();

  if (!token || !date || !time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  // Fetch the booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("manage_token", token)
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 },
    );
  }

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "Cannot reschedule a cancelled booking" },
      { status: 400 },
    );
  }

  const svc = SERVICES[booking.service];
  if (!svc) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  const isOnSite = booking.service !== "phone";
  const address = booking.payload?.address;
  let newZohoEventUid: string | null = null;

  try {
    const zohoToken = await getZohoAccessToken();

    // 1. Delete old Zoho Calendar event
    if (booking.zoho_event_uid) {
      await deleteCalendarEvent(zohoToken, booking.zoho_event_uid);
    }

    // 2. Create new Zoho Calendar event
    newZohoEventUid = await createCalendarEvent(zohoToken, {
      title: `${svc.label} — ${booking.name} (rescheduled)`,
      date,
      startTime: time,
      duration: svc.duration,
      description: `Name: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone}${isOnSite && address ? `\nAddress: ${address}` : ""}\nService: ${svc.label}\n(Rescheduled)`,
      location: isOnSite && address ? address : undefined,
    });
  } catch (err) {
    console.error("Zoho calendar reschedule error (continuing):", err);
  }

  // 3. Generate a new manage token for the rescheduled booking
  const newManageToken = randomUUID();
  const origin = new URL(req.url).origin;
  const newManageUrl = `${origin}/booking/manage?token=${newManageToken}`;

  // 4. Update Supabase
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      date,
      time,
      zoho_event_uid: newZohoEventUid,
      manage_token: newManageToken,
      status: "confirmed",
    })
    .eq("id", booking.id);

  if (updateError) {
    console.error("Failed to update booking:", updateError);
    return NextResponse.json(
      { error: "Failed to reschedule" },
      { status: 500 },
    );
  }

  // 5. Send reschedule emails
  const [hours, minutes] = time.split(":").map(Number);
  const displayTime = minutesToDisplay(hours * 60 + minutes);
  const displayDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (resend) {
    await Promise.all([
      resend.emails.send({
        from: EMAIL_FROM_BOOKINGS,
        to: [EMAIL_TO_INTERNAL],
        subject: `Booking Rescheduled: ${svc.label} — ${booking.name} → ${displayDate}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;">Booking Rescheduled</h2>
          ${detailCard(
            detailRow("Name", booking.name) +
            detailRow("Email", booking.email) +
            detailRow("New Date", displayDate) +
            detailRow("New Time", displayTime) +
            detailRow("Service", svc.label)
          )}
          ${ctaButton(newManageUrl, "Manage This Booking")}
        `),
      }),
      resend.emails.send({
        from: EMAIL_FROM,
        to: [booking.email],
        subject: `Booking Rescheduled: ${svc.label} — ${displayDate} at ${displayTime}`,
        html: emailLayout(`
          <h2 style="margin:0 0 8px;font-size:22px;text-align:center;color:#00c898;">Booking Rescheduled</h2>
          <p>Hi ${booking.name},</p>
          <p>Your <strong>${svc.label}</strong> has been moved to:</p>
          ${detailCard(
            detailRow("Date", displayDate) +
            detailRow("Time", displayTime) +
            (isOnSite && address ? detailRow("Location", address) : "")
          )}
          ${ctaButton(newManageUrl, "View Updated Booking")}
          ${mutedText("Need to make another change? Use the button above or call (724) 866-7333.")}
        `),
      }),
    ]).catch((err) => console.error("Reschedule email error:", err));
  }

  return NextResponse.json({ success: true, manageToken: newManageToken });
}
