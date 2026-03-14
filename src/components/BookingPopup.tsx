"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  X,
  Phone,
  MapPin,
  FlaskConical,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  CheckCircle,
  CreditCard,
} from "lucide-react";

/* ─── Types ─── */
export type ServiceType = "phone" | "walkthrough" | "soil-test";
type ViewState = "services" | "calendar" | "confirm" | "payment" | "success";

export interface BookingResult {
  type: "booking";
  service: ServiceType;
  serviceLabel: string;
  date: string;
  displayDate: string;
  displayTime: string;
  price: string;
}

interface BookingPopupProps {
  name: string;
  email: string;
  phone: string;
  address?: string;
  initialService?: ServiceType;
  onClose: () => void;
  onSuccess: (result: BookingResult) => void;
}

interface TimeSlot {
  time: string;
  display: string;
}

/* ─── Service config ─── */
const services = [
  {
    id: "phone" as ServiceType,
    label: "Phone Consultation",
    price: "Free",
    amount: 0,
    duration: "15 min",
    desc: "Quick call to discuss your project — no obligation.",
    icon: Phone,
  },
  {
    id: "walkthrough" as ServiceType,
    label: "On-Site Walkthrough",
    price: "$45",
    amount: 45,
    duration: "1 hour",
    desc: "We'll walk your property and finalize your plan in person. Credited toward your project.",
    icon: MapPin,
  },
  {
    id: "soil-test" as ServiceType,
    label: "Walkthrough + Soil Test",
    price: "$170",
    amount: 170,
    duration: "1.5 hours",
    desc: "Full walkthrough plus pH, nutrient analysis & amendment recommendations.",
    icon: FlaskConical,
  },
];

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const anim = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } };

/* ─── Inline Stripe form for consultation payment ─── */
function ConsultPaymentForm({
  amount,
  onSuccess,
  onBack,
}: {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message ?? "Payment failed. Please try again.");
      setProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setMessage("Payment was not completed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: "accordion" }} />
      {message && <p className="text-red-400 text-sm mt-4">{message}</p>}
      <button
        disabled={processing || !stripe || !elements}
        className="w-full mt-6 py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ${amount}
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="w-full mt-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors underline disabled:opacity-60"
      >
        Go back
      </button>
    </form>
  );
}

/* ─── Main Booking Popup ─── */
export default function BookingPopup({
  name,
  email,
  phone,
  address,
  initialService,
  onClose,
  onSuccess: onSuccessCallback,
}: BookingPopupProps) {
  const [view, setView] = useState<ViewState>(initialService ? "calendar" : "services");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(initialService ?? null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const activeService = services.find((s) => s.id === selectedService);
  const isPaid = activeService ? activeService.amount > 0 : false;

  // ── Calendar helpers ───────────────────────────────────
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

  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const canGoPrev = useMemo(() => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return prev >= new Date(today.getFullYear(), today.getMonth(), 1);
  }, [currentMonth, today]);

  const canGoNext = useMemo(() => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return next <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  }, [currentMonth, maxDate]);

  const isPastDay = (day: number) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < today;
  const isWeekend = (day: number) => {
    const dow = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
    return dow === 0 || dow === 6;
  };
  const isTooFar = (day: number) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) > maxDate;

  // ── Fetch slots when date changes ─────────────────────
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    setError(null);

    fetch(`/api/booking/slots?date=${selectedDate}&service=${selectedService}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.closed) { setError("We're closed on this day."); return; }
        setSlots(data.slots || []);
        if (!data.slots?.length) setError("No available times on this date. Try another day.");
      })
      .catch(() => { if (!cancelled) setError("Unable to load times. Please try again."); })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });

    return () => { cancelled = true; };
  }, [selectedDate, selectedService]);

  // ── Actions ────────────────────────────────────────────
  const selectDate = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const handleSelectService = (svc: (typeof services)[number]) => {
    setSelectedService(svc.id);
    setView("calendar");
    setSelectedDate("");
    setSlots([]);
    setSelectedSlot(null);
    setError(null);
    setClientSecret(null);
  };

  const handleBack = () => {
    if (view === "payment") {
      setView("confirm");
      setClientSecret(null);
    } else if (view === "confirm") {
      setView("calendar");
    } else if (view === "calendar") {
      setView("services");
      setSelectedService(null);
      setSelectedDate("");
      setSlots([]);
      setSelectedSlot(null);
      setError(null);
    }
  };

  /** For free services: book directly. For paid: create PaymentIntent and go to payment view. */
  const handleConfirm = async () => {
    if (!selectedSlot || !selectedService || !selectedDate || !activeService) return;

    if (!isPaid) {
      // Free service → book immediately
      await finishBooking();
    } else {
      // Paid service → create PaymentIntent and show payment form
      setBooking(true);
      setError(null);
      try {
        const res = await fetch("/api/booking/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: selectedService,
            amount: activeService.amount,
            name,
            email,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Could not start payment");
        setClientSecret(data.clientSecret);
        setView("payment");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setBooking(false);
      }
    }
  };

  /** Finalize the booking: create calendar event + save to DB */
  const finishBooking = async (paymentIntentId?: string) => {
    if (!selectedSlot || !selectedService || !selectedDate || !activeService) return;
    setBooking(true);
    setError(null);

    try {
      const res = await fetch("/api/booking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService,
          date: selectedDate,
          time: selectedSlot.time,
          name,
          email,
          phone,
          address,
          paymentIntentId,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Booking failed");

      setView("success");

      // Fire the callback so the parent can show the confirmation page
      onSuccessCallback({
        type: "booking",
        service: selectedService,
        serviceLabel: activeService.label,
        date: selectedDate,
        displayDate: formatDate(selectedDate),
        displayTime: selectedSlot.display,
        price: activeService.price,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBooking(false);
    }
  };

  const headerTitle = () => {
    switch (view) {
      case "services": return "Book a Consultation";
      case "calendar": return activeService?.label || "Select a Time";
      case "confirm": return "Review Booking";
      case "payment": return "Payment";
      case "success": return "You're Booked!";
    }
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={view === "success" ? undefined : onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-3">
            {(view === "calendar" || view === "confirm" || view === "payment") && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-overlay transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="font-bold text-base">{headerTitle()}</h3>
          </div>
          {view !== "success" && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-overlay transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ─── Step 1: Service Selection ─── */}
            {view === "services" && (
              <motion.div key="services" {...anim}>
                <p className="text-sm text-text-secondary mb-4">
                  Choose a consultation type to see available times.
                </p>
                <div className="space-y-3">
                  {services.map((svc) => {
                    const Icon = svc.icon;
                    return (
                      <button
                        key={svc.id}
                        onClick={() => handleSelectService(svc)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-overlay hover:border-brand/40 hover:bg-brand/5 transition-all text-left group"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                          <Icon className="w-5 h-5 text-brand" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{svc.label}</p>
                            <span className="text-xs font-bold text-brand">{svc.price}</span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">{svc.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Calendar & Time Slots ─── */}
            {view === "calendar" && (
              <motion.div key="calendar" {...anim}>
                {activeService && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-text-muted">
                    <span className="font-semibold text-brand">{activeService.price}</span>
                    <span>·</span>
                    <span>{activeService.duration}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    disabled={!canGoPrev}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold">{monthLabel}</span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    disabled={!canGoNext}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center text-[10px] font-medium text-text-muted uppercase tracking-wider py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {calendarDays.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const disabled = isPastDay(day) || isWeekend(day) || isTooFar(day);
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

                {selectedDate && (
                  <div>
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand" />
                      {formatDate(selectedDate)}
                    </p>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-brand animate-spin" />
                        <span className="ml-2 text-sm text-text-muted">Loading times…</span>
                      </div>
                    ) : error ? (
                      <p className="text-sm text-red-400 py-4 text-center">{error}</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => { setSelectedSlot(slot); setView("confirm"); }}
                            className="py-2.5 px-3 rounded-xl text-sm font-medium bg-surface-overlay border border-border hover:border-brand/40 text-text-primary transition-all"
                          >
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!selectedDate && (
                  <p className="text-sm text-text-muted text-center">Select a date to see available times</p>
                )}
              </motion.div>
            )}

            {/* ─── Step 3: Review / Confirm ─── */}
            {view === "confirm" && selectedSlot && activeService && (
              <motion.div key="confirm" {...anim}>
                <div className="p-4 rounded-xl bg-brand/5 border border-brand/20 mb-6 space-y-2">
                  <p className="font-semibold text-sm">{activeService.label}</p>
                  <p className="text-sm text-text-secondary">
                    {formatDate(selectedDate)} at{" "}
                    <strong className="text-text-primary">{selectedSlot.display}</strong>
                  </p>
                  <p className="text-xs text-text-muted">
                    {activeService.duration} · {activeService.price}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-overlay border border-border mb-6 space-y-1">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-text-muted">{email}</p>
                  {phone && <p className="text-xs text-text-muted">{phone}</p>}
                </div>

                {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

                <button
                  onClick={handleConfirm}
                  disabled={booking}
                  className="w-full py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isPaid ? "Starting payment…" : "Booking…"}
                    </>
                  ) : isPaid ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Continue to Payment – {activeService.price}
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </motion.div>
            )}

            {/* ─── Step 4: Payment (paid services only) ─── */}
            {view === "payment" && clientSecret && activeService && (
              <motion.div key="payment" {...anim}>
                <div className="p-3 rounded-lg bg-brand/5 border border-brand/20 mb-6 text-xs text-text-secondary">
                  <strong className="text-text-primary">{activeService.label}</strong>
                  {" — "}
                  {formatDate(selectedDate)} at {selectedSlot?.display}
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: { theme: "stripe", variables: { colorPrimary: "#00c898" } },
                  }}
                >
                  <ConsultPaymentForm
                    amount={activeService.amount}
                    onSuccess={(paymentIntentId) => finishBooking(paymentIntentId)}
                    onBack={() => { setView("confirm"); setClientSecret(null); }}
                  />
                </Elements>
              </motion.div>
            )}

            {/* ─── Step 5: Success ─── */}
            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-brand" />
                </div>
                <h4 className="text-xl font-bold mb-2">You&apos;re booked!</h4>
                {selectedSlot && (
                  <p className="text-sm text-text-secondary mb-1">
                    {formatDate(selectedDate)} at {selectedSlot.display}
                  </p>
                )}
                <p className="text-xs text-text-muted mb-6">
                  {selectedService === "phone"
                    ? `We'll call you at ${phone || "the number on file"}.`
                    : "We'll see you at your property."}
                  <br />A confirmation has been sent to {email}.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-brand text-surface font-semibold text-sm hover:bg-brand-light transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
