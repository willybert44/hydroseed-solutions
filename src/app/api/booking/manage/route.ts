import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SERVICES } from "@/lib/booking";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, service, date, time, name, email, phone, status, payload")
    .eq("manage_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 },
    );
  }

  const svc = SERVICES[data.service];

  return NextResponse.json({
    id: data.id,
    service: data.service,
    serviceLabel: svc?.label ?? data.service,
    price: svc?.price ?? "—",
    date: data.date,
    time: data.time,
    name: data.name,
    email: data.email,
    phone: data.phone,
    status: data.status,
    address: data.payload?.address ?? null,
  });
}
