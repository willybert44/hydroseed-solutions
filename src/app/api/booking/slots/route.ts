import { NextResponse } from "next/server";
import { getZohoAccessToken } from "@/lib/zoho";
import {
  BUSINESS_HOURS,
  SERVICES,
  SLOT_INTERVAL,
  BUFFER,
  TIMEZONE,
  fetchBusyIntervals,
  minutesToDisplay,
  minutesToTime,
} from "@/lib/booking";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const service = searchParams.get("service");

  if (!date?.match(/^\d{4}-\d{2}-\d{2}$/) || !service) {
    return NextResponse.json(
      { error: "date (YYYY-MM-DD) and service are required" },
      { status: 400 },
    );
  }

  const svc = SERVICES[service];
  if (!svc) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  // Day of week for the target date
  const [y, mo, d] = date.split("-").map(Number);
  const dow = new Date(y, mo - 1, d).getDay();
  const hours = BUSINESS_HOURS[dow];

  if (!hours) {
    return NextResponse.json({ date, slots: [], closed: true });
  }

  const duration = svc.duration;

  // If the requested date is today, skip slots that are less than 1 hour from now
  const now = new Date();
  const nowET = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
  const isToday =
    nowET.getFullYear() === y &&
    nowET.getMonth() + 1 === mo &&
    nowET.getDate() === d;
  const minMinutes = isToday
    ? nowET.getHours() * 60 + nowET.getMinutes() + 60
    : 0;

  // Fetch calendar busy intervals (gracefully falls back to empty if Zoho unavailable)
  let busy: { start: number; end: number }[] = [];
  try {
    const token = await getZohoAccessToken();
    const raw = await fetchBusyIntervals(date, token);
    busy = raw.map((b) => ({
      start: b.start - BUFFER,
      end: b.end + BUFFER,
    }));
  } catch (err) {
    console.error("Zoho Calendar unavailable — showing all open slots:", err);
  }

  // Generate available slots
  const slots: { time: string; display: string }[] = [];
  for (let m = hours[0]; m + duration <= hours[1]; m += SLOT_INTERVAL) {
    if (m < minMinutes) continue;
    const isBusy = busy.some((b) => m < b.end && m + duration > b.start);
    if (!isBusy) {
      slots.push({ time: minutesToTime(m), display: minutesToDisplay(m) });
    }
  }

  return NextResponse.json({ date, slots });
}
