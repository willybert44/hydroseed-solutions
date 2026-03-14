/** Shared booking config & Zoho Calendar helpers */

export const TIMEZONE = "America/New_York";
const ZOHO_CALENDAR_API = "https://calendar.zoho.com/api/v1";

/** Business hours per day of week (0=Sunday). Values are [startMinute, endMinute) from midnight. */
export const BUSINESS_HOURS: Record<number, [number, number] | null> = {
  0: null,         // Sunday — closed
  1: [480, 1020],  // Mon  8:00 AM – 5:00 PM
  2: [480, 1020],  // Tue
  3: [480, 1020],  // Wed
  4: [480, 1020],  // Thu
  5: [480, 1020],  // Fri
  6: null,         // Saturday — closed
};

export const SERVICES: Record<string, { label: string; duration: number; price: string }> = {
  phone:       { label: "Phone Consultation",   duration: 15,  price: "Free" },
  walkthrough: { label: "On-Site Walkthrough",  duration: 60,  price: "$45" },
  "soil-test": { label: "Walkthrough + Soil Test", duration: 90, price: "$170" },
};

/** Minutes between slot start times */
export const SLOT_INTERVAL = 30;

/** Buffer minutes around existing calendar events */
export const BUFFER = 15;

// ── Time helpers ─────────────────────────────────────────

/** Get the Eastern Time UTC offset string for a given date, e.g. "-0400" or "-0500" */
export function getETOffset(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    timeZoneName: "longOffset",
  });
  const parts = formatter.formatToParts(date);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value || "";
  // tz is like "GMT-04:00" → we want "-0400"
  return tz.replace("GMT", "").replace(":", "");
}

/** Minutes from midnight → "8:00 AM" */
export function minutesToDisplay(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(min).padStart(2, "0")} ${period}`;
}

/** Minutes from midnight → "08:00" */
export function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

// ── Zoho Calendar parsing ────────────────────────────────

/** Parse Zoho datetime "20260314T100000-0400" → Date */
function parseZohoDateTime(s: string): Date {
  const y = s.slice(0, 4), mo = s.slice(4, 6), d = s.slice(6, 8);
  const h = s.slice(9, 11), mi = s.slice(11, 13), sc = s.slice(13, 15);
  const off = s.slice(15); // e.g. "-0400"
  const offFmt = `${off.slice(0, 3)}:${off.slice(3)}`; // "-04:00"
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${sc}${offFmt}`);
}

/** Convert a Date to minutes-from-midnight in Eastern Time */
function dateToETMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

// ── Zoho Calendar ID ─────────────────────────────────────

let cachedCalendarId: string | null = null;

export async function getCalendarId(token: string): Promise<string> {
  if (process.env.ZOHO_CALENDAR_ID) return process.env.ZOHO_CALENDAR_ID;
  if (cachedCalendarId) return cachedCalendarId;

  const res = await fetch(`${ZOHO_CALENDAR_API}/calendars`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) throw new Error(`Calendar list failed: ${res.status}`);

  const data = await res.json();
  const cals = data.calendars || [];
  const primary = cals.find((c: Record<string, unknown>) => c.isprimary) || cals[0];
  if (!primary) throw new Error("No calendars found in Zoho account");

  cachedCalendarId = primary.uid;
  return primary.uid;
}

// ── Fetch busy intervals ─────────────────────────────────

/** Returns busy intervals as { start, end } in minutes-from-midnight ET */
export async function fetchBusyIntervals(
  date: string,
  token: string,
): Promise<{ start: number; end: number }[]> {
  const calId = await getCalendarId(token);
  const offset = getETOffset(date);
  const dateClean = date.replace(/-/g, "");

  const range = JSON.stringify({
    start: `${dateClean}T000000${offset}`,
    end: `${dateClean}T235959${offset}`,
  });

  const url = `${ZOHO_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events?range=${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Zoho Calendar events error:", res.status, text);
    return [];
  }

  const data = await res.json();
  const events: Record<string, unknown>[] = data.events || [];

  return events
    .filter((e) => !e.isallday)
    .map((e) => {
      const dt = e.dateandtime as { start: string; end: string };
      return {
        start: dateToETMinutes(parseZohoDateTime(dt.start)),
        end: dateToETMinutes(parseZohoDateTime(dt.end)),
      };
    });
}

// ── Create calendar event ────────────────────────────────

export async function createCalendarEvent(
  token: string,
  opts: {
    title: string;
    date: string;
    startTime: string;
    duration: number;
    description: string;
    location?: string;
  },
): Promise<string | null> {
  try {
    const calId = await getCalendarId(token);
    const offset = getETOffset(opts.date);
    const dateClean = opts.date.replace(/-/g, "");
    const [hours, minutes] = opts.startTime.split(":").map(Number);
    const endTotal = hours * 60 + minutes + opts.duration;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    const pad = (n: number) => String(n).padStart(2, "0");
    const startStr = `${dateClean}T${pad(hours)}${pad(minutes)}00${offset}`;
    const endStr = `${dateClean}T${pad(endH)}${pad(endM)}00${offset}`;

    const eventData: Record<string, unknown> = {
      title: opts.title,
      dateandtime: {
        timezone: TIMEZONE,
        start: startStr,
        end: endStr,
      },
      description: opts.description,
    };
    if (opts.location) {
      eventData.location = opts.location;
    }

    const res = await fetch(
      `${ZOHO_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `eventdata=${encodeURIComponent(JSON.stringify(eventData))}`,
      },
    );

    if (!res.ok) {
      console.error("Zoho Calendar create error:", await res.text());
      return null;
    }
    const data = await res.json();
    // Zoho returns the event UID in the response
    const uid = data.events?.[0]?.uid ?? null;
    return uid;
  } catch (err) {
    console.error("Calendar event creation error:", err);
    return null;
  }
}

// ── Delete calendar event ────────────────────────────────

export async function deleteCalendarEvent(
  token: string,
  eventUid: string,
): Promise<boolean> {
  try {
    const calId = await getCalendarId(token);
    const res = await fetch(
      `${ZOHO_CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(eventUid)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      },
    );
    if (!res.ok) {
      console.error("Zoho Calendar delete error:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Calendar event deletion error:", err);
    return false;
  }
}
