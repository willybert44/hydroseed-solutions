"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PhoneLink from "@/components/PhoneLink";
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface Booking {
  id: number;
  service: string;
  serviceLabel: string;
  price: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  address: string | null;
}

interface TimeSlot {
  time: string;
  display: string;
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m;
  const hr = Math.floor(total / 60);
  const min = total % 60;
  const period = hr >= 12 ? "PM" : "AM";
  const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${h12}:${String(min).padStart(2, "0")} ${period}`;
}

type View = "details" | "reschedule" | "cancelled" | "rescheduled";

export default function ManageBookingPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("details");

  // Cancel state
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Reschedule state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [newManageToken, setNewManageToken] = useState<string | null>(null);

  // Fetch booking
  useEffect(() => {
    if (!token) {
      setError("No booking token provided.");
      setLoading(false);
      return;
    }
    fetch(`/api/booking/manage?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Booking not found");
        return r.json();
      })
      .then((data) => setBooking(data))
      .catch(() => setError("This booking link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  // Calendar helpers
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d;
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const canGoPrev = useMemo(() => {
    const prev = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );
    return prev >= new Date(today.getFullYear(), today.getMonth(), 1);
  }, [currentMonth, today]);

  const canGoNext = useMemo(() => {
    const next = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
    return next <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  }, [currentMonth, maxDate]);

  const isPastDay = (day: number) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < today;
  const isWeekend = (day: number) => {
    const dow = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    ).getDay();
    return dow === 0 || dow === 6;
  };
  const isTooFar = (day: number) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) >
    maxDate;

  // Fetch slots when date changes
  useEffect(() => {
    if (!selectedDate || !booking) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    setSlotError(null);

    fetch(
      `/api/booking/slots?date=${selectedDate}&service=${booking.service}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.closed) {
          setSlotError("We're closed on this day.");
          return;
        }
        setSlots(data.slots || []);
        if (!data.slots?.length)
          setSlotError("No available times on this date.");
      })
      .catch(() => {
        if (!cancelled)
          setSlotError("Unable to load times. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, booking]);

  const selectDate = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Actions
  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Cancel failed");
      }
      setView("cancelled");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    setRescheduling(true);
    try {
      const res = await fetch("/api/booking/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          date: selectedDate,
          time: selectedSlot.time,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reschedule failed");
      setNewManageToken(data.manageToken);
      setView("rescheduled");
    } catch (err: unknown) {
      setSlotError(
        err instanceof Error ? err.message : "Failed to reschedule",
      );
    } finally {
      setRescheduling(false);
    }
  };

  // ── Render ─────────────────────────────────────────────
  if (loading) {
    return (
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
          <p className="mt-4 text-text-muted">Loading your booking…</p>
        </div>
      </section>
    );
  }

  if (error && !booking) {
    return (
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Booking Not Found</h1>
          <p className="text-text-secondary">{error}</p>
          <a
            href="/get-seeded"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors"
          >
            Book a New Consultation
          </a>
        </div>
      </section>
    );
  }

  if (!booking) return null;

  return (
    <>
      <section className="relative pt-32 pb-16 px-6">
        <div className="hero-glow top-0 left-1/2 -translate-x-1/2 opacity-25" />
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {/* ─── Cancelled confirmation ─── */}
            {view === "cancelled" && (
              <motion.div
                key="cancelled"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-3">Booking Cancelled</h1>
                <p className="text-text-secondary mb-2">
                  Your <strong>{booking.serviceLabel}</strong> on{" "}
                  <strong>{formatDate(booking.date)}</strong> has been cancelled.
                </p>
                <p className="text-sm text-text-muted mb-8">
                  A confirmation email has been sent to {booking.email}.
                </p>
                <a
                  href="/get-seeded"
                  className="inline-block px-6 py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors"
                >
                  Book Again
                </a>
              </motion.div>
            )}

            {/* ─── Rescheduled confirmation ─── */}
            {view === "rescheduled" && (
              <motion.div
                key="rescheduled"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <CheckCircle className="w-16 h-16 text-brand mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-3">Rescheduled!</h1>
                <p className="text-text-secondary mb-2">
                  Your <strong>{booking.serviceLabel}</strong> is now on:
                </p>
                <div className="inline-block p-4 rounded-xl bg-brand/5 border border-brand/20 mb-6">
                  <p className="font-semibold">{formatDate(selectedDate)}</p>
                  <p className="text-sm text-text-secondary">
                    {selectedSlot?.display}
                  </p>
                </div>
                <p className="text-sm text-text-muted mb-8">
                  A confirmation email with your new booking link has been sent
                  to {booking.email}.
                </p>
                {newManageToken && (
                  <a
                    href={`/booking/manage?token=${newManageToken}`}
                    className="inline-block px-6 py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors"
                  >
                    View Updated Booking
                  </a>
                )}
              </motion.div>
            )}

            {/* ─── Booking details ─── */}
            {view === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-bold mb-2 text-center">
                  Manage Your Booking
                </h1>
                <p className="text-text-secondary text-center mb-8">
                  {booking.status === "cancelled"
                    ? "This booking has been cancelled."
                    : "View, reschedule, or cancel your consultation."}
                </p>

                {/* Booking card */}
                <div className="p-6 rounded-2xl border border-border bg-surface-raised mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-brand/10 text-brand"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {booking.status === "confirmed"
                        ? "Confirmed"
                        : "Cancelled"}
                    </span>
                    <span className="text-xs text-text-muted">
                      {booking.serviceLabel}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-brand shrink-0" />
                      <span className="text-sm font-medium">
                        {formatDate(booking.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-brand shrink-0" />
                      <span className="text-sm font-medium">
                        {formatTime(booking.time)}
                      </span>
                    </div>
                    {booking.address &&
                      booking.service !== "phone" && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-brand shrink-0" />
                          <span className="text-sm">{booking.address}</span>
                        </div>
                      )}
                    {booking.price !== "Free" && (
                      <p className="text-xs text-text-muted pt-1">
                        {booking.price} paid — credited toward your project
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {booking.status === "confirmed" && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setView("reschedule")}
                      className="w-full py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors"
                    >
                      Reschedule
                    </button>
                    {showCancelConfirm ? (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-sm text-red-700 mb-3">
                          Are you sure you want to cancel this booking?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {cancelling ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : null}
                            {cancelling
                              ? "Cancelling…"
                              : "Yes, Cancel Booking"}
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={cancelling}
                            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface-overlay transition-colors"
                          >
                            Keep Booking
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-3 rounded-xl border border-border text-text-secondary text-sm font-medium hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                )}

                {/* Contact */}
                <div className="mt-8 p-5 rounded-2xl border border-border bg-surface-overlay">
                  <p className="text-sm font-semibold mb-3">
                    Need help?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <PhoneLink
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-brand/40 transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4 text-brand" />
                      (724) 866-7333
                    </PhoneLink>
                    <a
                      href="mailto:hello@hydroseed.solutions"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-brand/40 transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4 text-brand" />
                      hello@hydroseed.solutions
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Reschedule calendar ─── */}
            {view === "reschedule" && (
              <motion.div
                key="reschedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => {
                      setView("details");
                      setSelectedDate("");
                      setSlots([]);
                      setSelectedSlot(null);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-overlay transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-xl font-bold">Pick a New Time</h2>
                </div>

                <div className="p-3 rounded-lg bg-brand/5 border border-brand/20 mb-6 text-xs text-text-secondary">
                  Currently: <strong>{formatDate(booking.date)}</strong> at{" "}
                  <strong>{formatTime(booking.time)}</strong>
                </div>

                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    disabled={!canGoPrev}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-overlay transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold">{monthLabel}</span>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    disabled={!canGoNext}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-overlay transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div
                      key={d}
                      className="text-center text-[10px] font-medium text-text-muted uppercase tracking-wider py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {calendarDays.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const disabled =
                      isPastDay(day) || isWeekend(day) || isTooFar(day);
                    const selected = dateStr === selectedDate;
                    return (
                      <button
                        key={day}
                        disabled={disabled}
                        onClick={() => selectDate(day)}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                          selected
                            ? "bg-brand text-surface"
                            : disabled
                              ? "text-text-muted/30 cursor-not-allowed"
                              : "hover:bg-surface-overlay text-text-primary"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand" />
                      {formatDate(selectedDate)}
                    </p>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-brand animate-spin" />
                        <span className="ml-2 text-sm text-text-muted">
                          Loading times…
                        </span>
                      </div>
                    ) : slotError ? (
                      <p className="text-sm text-red-400 py-4 text-center">
                        {slotError}
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                              selectedSlot?.time === slot.time
                                ? "bg-brand text-surface border-brand"
                                : "bg-surface-overlay border-border hover:border-brand/40 text-text-primary"
                            }`}
                          >
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!selectedDate && (
                  <p className="text-sm text-text-muted text-center mb-6">
                    Select a date to see available times
                  </p>
                )}

                {/* Confirm reschedule */}
                {selectedSlot && (
                  <button
                    onClick={handleReschedule}
                    disabled={rescheduling}
                    className="w-full py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {rescheduling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rescheduling…
                      </>
                    ) : (
                      `Reschedule to ${selectedSlot.display}`
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
