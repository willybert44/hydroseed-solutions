import { NextResponse } from "next/server";
import { getZohoAccessToken } from "@/lib/zoho";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { SERVICES, deleteCalendarEvent, minutesToDisplay } from "@/lib/booking";
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
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
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
      { error: "This booking is already cancelled" },
      { status: 400 },
    );
  }

  // 1. Delete Zoho Calendar event
  if (booking.zoho_event_uid) {
    try {
      const zohoToken = await getZohoAccessToken();
      await deleteCalendarEvent(zohoToken, booking.zoho_event_uid);
    } catch (err) {
      console.error("Failed to delete Zoho event (continuing):", err);
    }
  }

  // 2. Update Supabase status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", booking.id);

  if (updateError) {
    console.error("Failed to update booking status:", updateError);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 },
    );
  }

  // 3. Send cancellation emails
  const svc = SERVICES[booking.service];
  const [hours, minutes] = booking.time.split(":").map(Number);
  const displayTime = minutesToDisplay(hours * 60 + minutes);
  const displayDate = new Date(`${booking.date}T12:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );

  if (resend) {
    await Promise.all([
      resend.emails.send({
        from: EMAIL_FROM_BOOKINGS,
        to: [EMAIL_TO_INTERNAL],
        subject: `Booking Cancelled: ${svc?.label ?? booking.service} — ${booking.name}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;">Booking Cancelled</h2>
          ${detailCard(
            detailRow("Name", booking.name) +
            detailRow("Email", booking.email) +
            detailRow("Was scheduled", `${displayDate} at ${displayTime}`) +
            detailRow("Service", svc?.label ?? booking.service)
          )}
        `),
      }),
      resend.emails.send({
        from: EMAIL_FROM,
        to: [booking.email],
        subject: `Booking Cancelled — ${displayDate}`,
        html: emailLayout(`
          <h2 style="margin:0 0 8px;font-size:22px;text-align:center;">Booking Cancelled</h2>
          <p>Hi ${booking.name},</p>
          <p>Your <strong>${svc?.label ?? booking.service}</strong> on <strong>${displayDate}</strong> at <strong>${displayTime}</strong> has been cancelled.</p>
          ${ctaButton(`${new URL(req.url).origin}/get-seeded`, "Book a New Consultation")}
          ${mutedText("Questions? Call (724) 866-7333 or reply to this email.")}
        `),
      }),
    ]).catch((err) => console.error("Cancellation email error:", err));
  }

  return NextResponse.json({ success: true });
}
