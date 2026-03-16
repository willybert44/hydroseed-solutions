"use client";

import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackConversion, trackEvent } from "@/lib/gtag";
import PhoneLink from "@/components/PhoneLink";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Ruler,
  Mountain,
  Layers,
  FlaskConical,
  Calculator,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  CreditCard,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Camera,
  X,
  ImagePlus,
  Shovel,
  User,
  CheckCircle,
  Phone,
  Mail,
} from "lucide-react";

const SiteMeasure = lazy(() => import("./SiteMeasure"));
import BookingPopup, { type BookingResult } from "./BookingPopup";

/* ─── Types ─── */
type ConfirmationData =
  | { type: "deposit"; amount: number; estimateBase: number }
  | BookingResult;

type SlopeCondition = "flat" | "mild" | "moderate" | "steep";
type GradingLevel = "none" | "minor" | "full";
type SoilImport = "none" | "topsoil" | "bsm";
type SeedBlend = "lawn" | "erosion" | "wildflower" | "custom" | "";
type Amendment = "lime" | "compost";
type AreaUnit = "sqft" | "acres";

interface FormData {
  squareFeet: number;
  slope: SlopeCondition | "";
  grading: GradingLevel | "";
  soilImport: SoilImport;
  seedBlend: SeedBlend;
  amendments: Amendment[];
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  smsOptIn: boolean;
  projectAddress: string;
  billingAddressSame: boolean;
  billingAddress: string;
}

/* ─── Pricing Config ─── */
const SLOPE_MULTIPLIER: Record<SlopeCondition, number> = {
  flat: 1.0,
  mild: 1.15,
  moderate: 1.35,
  steep: 1.6,
};

const AMENDMENT_COST: Record<Amendment, number> = {
  lime: 0.015,
  compost: 0.025,
};

/* Grading: 2-man crew @ 406 SF/man-hr = 812 SF/crew-hr. $500/crew-hr. $2,000 min. */
const GRADING_CREW_RATE = 500;        // $/crew-hour
const GRADING_MINIMUM = 2000;
const GRADING_PRODUCTIVITY: Record<Exclude<GradingLevel, "none">, number> = {
  minor: 1200,   // SF/crew-hr — light loosening, faster throughput
  full: 812,     // SF/crew-hr — full reslope at base rate
};

/*
 * Topsoil: 20-ton triaxle @ $37.50/ton = $750/load.
 * ~14,000 SF coverage per load at 1" depth.
 * +$350 delivery per load, +spreading time at grading crew rate.
 * Spreading rate ~1,000 SF/crew-hr.
 * Round to nearest full triaxle load.
 *
 * BSM (Proganics Dual): sprayed with hydroseeder — cheaper than hauling.
 */
const TOPSOIL_COST_PER_LOAD = 750;     // 20 tons × $37.50
const TOPSOIL_DELIVERY_PER_LOAD = 350;
const TOPSOIL_COVERAGE_PER_LOAD = 14000; // SF per load at 1" depth
const TOPSOIL_SPREAD_RATE = 1000;       // SF/crew-hr
const BSM_RATE = 0.07;                  // $/sqft — sprayed, no hauling

const MINIMUM_PROJECT = 500;

function getBaseRate(sqft: number): number {
  if (sqft <= 5000) return 0.22;
  if (sqft <= 15000) return 0.18;
  if (sqft <= 30000) return 0.16;
  return 0.14;
}

function calculateEstimate(data: FormData): {
  low: number;
  high: number;
  base: number;
  gradingCost: number;
  soilImportCost: number;
  hydroseedBase: number;
  topsoilLoads: number;
} {
  const sqft = data.squareFeet || 0;
  const baseRate = getBaseRate(sqft);
  const slopeMult = data.slope ? SLOPE_MULTIPLIER[data.slope] : 1;
  const amendmentAdd = data.amendments.reduce(
    (sum, a) => sum + AMENDMENT_COST[a],
    0
  );
  const hydroseedPerSqft = (baseRate + amendmentAdd) * slopeMult;
  const hydroseedBase = Math.max(sqft * hydroseedPerSqft, MINIMUM_PROJECT);

  let gradingCost = 0;
  if (data.grading && data.grading !== "none") {
    const crewHours = Math.ceil(sqft / GRADING_PRODUCTIVITY[data.grading]);
    gradingCost = Math.max(GRADING_MINIMUM, crewHours * GRADING_CREW_RATE);
  }

  let soilImportCost = 0;
  let topsoilLoads = 0;
  if (data.soilImport === "topsoil") {
    topsoilLoads = Math.max(1, Math.round(sqft / TOPSOIL_COVERAGE_PER_LOAD));
    const materialCost = topsoilLoads * TOPSOIL_COST_PER_LOAD;
    const deliveryCost = topsoilLoads * TOPSOIL_DELIVERY_PER_LOAD;
    const spreadHours = Math.ceil(sqft / TOPSOIL_SPREAD_RATE);
    const spreadCost = spreadHours * GRADING_CREW_RATE;
    soilImportCost = materialCost + deliveryCost + spreadCost;
  } else if (data.soilImport === "bsm") {
    soilImportCost = Math.round(sqft * BSM_RATE);
  }

  const base = hydroseedBase + gradingCost + soilImportCost;
  return {
    low: Math.round(base * 0.9),
    high: Math.round(base * 1.15),
    base: Math.round(base),
    gradingCost,
    soilImportCost,
    hydroseedBase: Math.round(hydroseedBase),
    topsoilLoads,
  };
}

/* ─── Step Configs ─── */
const steps = [
  { label: "Area", icon: Ruler },
  { label: "Slope", icon: Mountain },
  { label: "Grading", icon: Shovel },
  { label: "Seed", icon: Layers },
  { label: "Extras", icon: FlaskConical },
  { label: "Photos", icon: Camera },
  { label: "Contact", icon: User },
  { label: "Estimate", icon: Calculator },
];

const slopeOptions: { value: SlopeCondition; label: string; desc: string }[] = [
  { value: "flat", label: "Flat", desc: "0–5% grade" },
  { value: "mild", label: "Mild Slope", desc: "5–15% grade" },
  { value: "moderate", label: "Moderate Slope", desc: "15–30% grade" },
  { value: "steep", label: "Steep", desc: "30%+ grade" },
];

const soilImportOptions: { value: SoilImport; label: string; desc: string }[] = [
  { value: "none", label: "No Import Needed", desc: "Existing soil is usable" },
  { value: "topsoil", label: "Topsoil Import", desc: "Hauled in by triaxle — 1\u2033 layer based on your area" },
  { value: "bsm", label: "BSM (Proganics Dual)", desc: "Sprayable topsoil applied with the hydroseeder" },
];

const gradingOptions: { value: GradingLevel; label: string; desc: string }[] = [
  { value: "none", label: "Already Prepped", desc: "Soil is soft — you can sift through it by hand" },
  { value: "minor", label: "Minor Loosening", desc: "Mostly OK but the surface is a bit firm" },
  { value: "full", label: "Full Resloping / Grading", desc: "Hard-packed, compacted, or needs reshaping" },
];

const seedBlendOptions: { value: Exclude<SeedBlend, "">; label: string; desc: string }[] = [
  { value: "lawn", label: "Lawn Blend", desc: "Turf-type tall fescue — classic residential lawn" },
  { value: "erosion", label: "Erosion Control", desc: "Fast-establishing mix for slopes & bare soil" },
  { value: "wildflower", label: "Wildflower / Native", desc: "Pollinator-friendly native meadow blend" },
  { value: "custom", label: "Not Sure / Custom", desc: "We’ll recommend the best blend for your site" },
];

const amendmentOptions: { value: Amendment; label: string; desc: string }[] = [
  { value: "lime", label: "Lime Treatment", desc: "+$0.015/sqft" },
  { value: "compost", label: "Compost / Organic Matter", desc: "+$0.025/sqft" },
];

/* ─── Stripe Init ─── */
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ─── Inline Checkout Form ─── */
function CheckoutForm({ amount, onCancel, onSuccess }: { amount: number; onCancel: () => void; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message ?? "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess();
    } else {
      setMessage("Payment was not completed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PaymentElement options={{ layout: "accordion" }} />
      {message && <div className="text-red-500 text-sm mt-4 font-medium">{message}</div>}
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full mt-6 py-3 rounded-xl bg-brand text-surface font-semibold hover:bg-brand-light transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <span className="inline-block animate-spin h-5 w-5 border-2 border-surface border-t-transparent rounded-full"></span>
        ) : (
          `Pay Deposit ($${amount.toLocaleString()})`
        )}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isProcessing}
        className="w-full mt-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors underline disabled:opacity-60"
      >
        Cancel and go back
      </button>
    </form>
  );
}

/* ─── Component ─── */
export default function ProjectPlanner() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [feeExpanded, setFeeExpanded] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingService, setBookingService] = useState<"phone" | "walkthrough" | "soil-test" | undefined>();
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [areaInput, setAreaInput] = useState<number>(0);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [contact, setContact] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: '',
    smsOptIn: false,
    projectAddress: '',
    billingAddressSame: true,
    billingAddress: '',
  });
  const projectAddressRef = useRef<HTMLInputElement>(null);
  const billingAddressRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>({
    squareFeet: 0,
    slope: "",
    grading: "",
    soilImport: "none",
    seedBlend: "",
    amendments: [],
  });

  const estimate = useMemo(() => calculateEstimate(form), [form]);

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return form.squareFeet > 0;
      case 1:
        return form.slope !== "";
      case 2:
        return form.grading !== "";
      case 3:
        return form.seedBlend !== "";
      case 4:
        return true;
      case 5:
        return true;
      case 6: {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
        const nameParts = contact.name.trim().split(/\s+/);
        const nameValid = nameParts.length >= 2 && nameParts.every(p => p.length > 0);
        return nameValid && emailValid && contact.phone.trim() !== '' && contact.projectAddress.trim() !== '';
      }
      default:
        return true;
    }
  })();

  const next = () => {
    if (canAdvance && step < steps.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleAmendment = (a: Amendment) => {
    setForm((prev) => ({
      ...prev,
      amendments: prev.amendments.includes(a)
        ? prev.amendments.filter((x) => x !== a)
        : [...prev.amendments, a],
    }));
  };

  const handleDepositCheckout = async () => {
    setIsStartingCheckout(true);

    try {
      const depositAmount = Math.round(estimate.base * 0.15);
      const response = await fetch("/api/stripe/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: depositAmount,
          estimateBase: estimate.base,
          squareFeet: form.squareFeet,
          slope: form.slope,
          grading: form.grading,
          soilImport: form.soilImport,
          seedBlend: form.seedBlend,
          amendments: form.amendments,
          contactName: contact.name,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          smsOptIn: contact.smsOptIn,
          projectAddress: contact.projectAddress,
          billingAddress: contact.billingAddressSame ? contact.projectAddress : contact.billingAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to start checkout");
      }

      const payload: { clientSecret?: string } = await response.json();
      if (!payload.clientSecret) {
        throw new Error("Checkout session secret missing");
      }

      setClientSecret(payload.clientSecret);
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Could not start payment: ${error.message}`);
      setIsStartingCheckout(false);
    }
  };

  // Save lead & track conversion when user reaches the estimate step
  useEffect(() => {
    if (step === 7) {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'residential',
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          smsOptIn: contact.smsOptIn,
          projectAddress: contact.projectAddress,
          billingAddress: contact.billingAddressSame ? contact.projectAddress : contact.billingAddress,
          squareFeet: form.squareFeet,
          slope: form.slope,
          grading: form.grading,
          soilImport: form.soilImport,
          seedBlend: form.seedBlend,
          amendments: form.amendments,
          estimateLow: estimate.low,
          estimateHigh: estimate.high,
          estimateBase: estimate.base,
        }),
      }).catch(err => console.error('Failed to save lead:', err));

      trackEvent("generate_lead", {
        currency: "USD",
        value: estimate.base,
      });
      trackConversion(process.env.NEXT_PUBLIC_AW_ESTIMATE_LABEL ?? "", estimate.base);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Google Places Autocomplete for contact address fields
  useEffect(() => {
    if (step !== 6) return;
    let cancelled = false;

    const attach = (input: HTMLInputElement | null, field: 'projectAddress' | 'billingAddress') => {
      if (!input || input.dataset.acAttached) return false;
      if (typeof google === 'undefined' || !google.maps?.places) return false;
      const ac = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place.formatted_address) {
          setContact(prev => ({ ...prev, [field]: place.formatted_address! }));
        }
      });
      input.dataset.acAttached = '1';
      return true;
    };

    const init = async () => {
      // Load script if not yet present
      if (typeof google === 'undefined' || !google.maps?.places) {
        const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!key) return;
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const s = document.createElement('script');
          s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&libraries=places`;
          s.async = true;
          document.head.appendChild(s);
        }
      }
      // Poll until Places API is ready AND project address ref is in DOM
      await new Promise<void>((resolve) => {
        const poll = setInterval(() => {
          if (cancelled) { clearInterval(poll); resolve(); return; }
          const apiReady = typeof google !== 'undefined' && google.maps?.places;
          const refReady = projectAddressRef.current !== null;
          if (apiReady && refReady) { clearInterval(poll); resolve(); }
        }, 150);
        setTimeout(() => { clearInterval(poll); resolve(); }, 10000);
      });
      if (cancelled) return;
      attach(projectAddressRef.current, 'projectAddress');
      attach(billingAddressRef.current, 'billingAddress');
    };

    init();
    return () => { cancelled = true; };
  }, [step, contact.billingAddressSame]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-3xl mx-auto glass-strong rounded-3xl p-6 sm:p-10">
      {/* ─── Confirmation View ─── */}
      {confirmation ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-10 h-10 text-brand" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {confirmation.type === "deposit" ? (
              <>You&apos;re <span className="text-gradient">booked!</span></>
            ) : (
              <>You&apos;re <span className="text-gradient">all set!</span></>
            )}
          </h2>

          <p className="text-lg text-text-secondary max-w-lg mx-auto leading-relaxed mb-8">
            {confirmation.type === "deposit"
              ? "Your deposit has been received and your project is officially on the schedule."
              : confirmation.service === "phone"
                ? "Your phone consultation has been scheduled."
                : `Your ${confirmation.serviceLabel.toLowerCase()} has been booked.`}
          </p>

          {/* Details card */}
          <div className="max-w-md mx-auto p-6 rounded-2xl border border-brand/20 bg-brand/5 mb-8 text-left">
            {confirmation.type === "deposit" ? (
              <>
                <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">Deposit Receipt</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Deposit paid</span>
                    <span className="font-semibold">${confirmation.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Est. project total</span>
                    <span className="font-semibold">${confirmation.estimateBase.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-brand/20 flex justify-between">
                    <span className="text-text-secondary">Remaining balance</span>
                    <span className="font-semibold">${(confirmation.estimateBase - confirmation.amount).toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">Booking Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Service</span>
                    <span className="font-semibold">{confirmation.serviceLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Date</span>
                    <span className="font-semibold">{confirmation.displayDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Time</span>
                    <span className="font-semibold">{confirmation.displayTime}</span>
                  </div>
                  {confirmation.price !== "Free" && (
                    <div className="pt-2 mt-2 border-t border-brand/20 flex justify-between">
                      <span className="text-text-secondary">Payment</span>
                      <span className="font-semibold text-brand">{confirmation.price} paid</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Next steps timeline */}
          <div className="max-w-md mx-auto text-left mb-8">
            <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-4">What happens next</p>
            <div className="space-y-0">
              {(confirmation.type === "deposit"
                ? [
                    { step: "1", title: "Confirmation Email", desc: "You\u2019ll receive a payment receipt and project confirmation within a few minutes.", timing: "Right now" },
                    { step: "2", title: "We\u2019ll Reach Out", desc: "Our team will call or text to confirm your project details and finalize the scope. Your deposit is credited in full toward the project total.", timing: "Within 1 business day" },
                    { step: "3", title: "Project Scheduling", desc: "We\u2019ll lock in a date that works for you. Most projects are scheduled within 5 business days.", timing: "Within 5 business days" },
                    { step: "4", title: "Project Day", desc: "Our crew arrives, sprays, and you\u2019re on your way to a beautiful lawn.", timing: "Scheduled together" },
                  ]
                : confirmation.service === "phone"
                ? [
                    { step: "1", title: "Confirmation Email", desc: `A confirmation has been sent to ${contact.email}.`, timing: "Right now" },
                    { step: "2", title: "Phone Consultation", desc: `We\u2019ll call you at ${contact.phone} at your scheduled time to discuss your project.`, timing: confirmation.displayDate },
                    { step: "3", title: "Custom Proposal", desc: "After the call we\u2019ll send you a detailed proposal based on your project needs.", timing: "Same day" },
                  ]
                : [
                    { step: "1", title: "Confirmation Email", desc: `A confirmation has been sent to ${contact.email}.`, timing: "Right now" },
                    { step: "2", title: confirmation.serviceLabel, desc: `We\u2019ll visit your property on ${confirmation.displayDate} at ${confirmation.displayTime} to walk the site and finalize your plan.`, timing: confirmation.displayDate },
                    { step: "3", title: "Final Proposal", desc: "You\u2019ll receive a precise quote based on actual site conditions. Consultation fee is credited toward your project.", timing: "Same day" },
                    { step: "4", title: "Project Scheduling", desc: "If you decide to move forward, we\u2019ll schedule your project within 5 business days.", timing: "When you\u2019re ready" },
                  ]
              ).map((item, i, arr) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                      {item.step}
                    </div>
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-6">
                    <p className="font-semibold text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
                    <p className="text-xs text-brand font-medium mt-1">{item.timing}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="max-w-md mx-auto p-6 rounded-2xl border border-border bg-surface-raised mb-8">
            <h3 className="font-bold mb-3">Questions in the meantime?</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <PhoneLink
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-brand/40 transition-colors text-sm font-medium"
              >
                <Phone className="w-4 h-4 text-brand" />
                (724) 866-7333
              </PhoneLink>
              <a
                href="mailto:hello@hydroseed.solutions"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-brand/40 transition-colors text-sm font-medium"
              >
                <Mail className="w-4 h-4 text-brand" />
                hello@hydroseed.solutions
              </a>
            </div>
          </div>

          <a
            href="/"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            &larr; Back to homepage
          </a>
        </motion.div>
      ) : (
      <>
      {/* ─── Progress Bar ─── */}
      <div className="flex items-center justify-between mb-12">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={s.label}
              onClick={() => i < step && setStep(i)}
              className={`flex flex-col items-center gap-1.5 transition-colors ${
                isActive
                  ? "text-brand"
                  : isDone
                  ? "text-brand/60 cursor-pointer"
                  : "text-text-muted"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-brand text-surface"
                    : isDone
                    ? "bg-brand/10 text-brand"
                    : "bg-surface-overlay text-text-muted"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-medium tracking-wider uppercase hidden sm:block">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Step Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="min-h-[320px]"
        >
          {/* Step 0: Area */}
          {step === 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 1 of 8 — Area Size
              </p>
              <h3 className="text-2xl font-bold mb-2">
                How big is the area?
              </h3>
              <p className="text-text-secondary mb-6">
                Let&apos;s start by getting the approximate size of your project. We can calculate it for you using our satellite map tool.
              </p>

              {/* Primary Method: Map Measure */}
              <button
                onClick={() => setShowMap(true)}
                className="w-full flex items-center gap-4 px-6 py-6 mb-6 rounded-2xl border-2 border-brand bg-brand/5 hover:bg-brand/10 hover:border-brand-light transition-all group shadow-sm text-left"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-text-primary group-hover:text-brand transition-colors">
                    {form.squareFeet > 0 ? "Edit Map Measurement" : "Measure with Satellite Map"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {form.squareFeet > 0 
                      ? "Update your drawn property boundaries" 
                      : "Draw your area on the map and we'll calculate it"}
                  </p>
                </div>
              </button>
              <p className="text-xs text-text-muted text-center -mt-3 mb-6 md:hidden">
                ℹ️ Map tool works best on a desktop or tablet — you can also enter your area manually below.
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-text-muted font-medium uppercase tracking-wider">or enter manually</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Unit toggle */}
              <div className="flex justify-start gap-2 mb-4">
                {(["sqft", "acres"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      if (u === areaUnit) return;
                      const converted =
                        u === "acres"
                          ? parseFloat((areaInput / 43560).toFixed(2))
                          : Math.round(areaInput * 43560);
                      setAreaUnit(u);
                      setAreaInput(converted);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      areaUnit === u
                        ? "bg-surface-raised text-text-primary border border-border"
                        : "text-text-secondary hover:bg-surface-overlay"
                    }`}
                  >
                    {u === "sqft" ? "Square Feet" : "Acres"}
                  </button>
                ))}
              </div>

              {/* Manual Input */}
              <div className="relative mb-2">
                <input
                  type="number"
                  min={0}
                  step={areaUnit === "acres" ? 0.01 : 1}
                  value={areaInput || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const clamped = Math.max(0, val);
                    setAreaInput(clamped);
                    const sqft = areaUnit === "acres" ? Math.round(clamped * 43560) : clamped;
                    setForm({ ...form, squareFeet: sqft });
                  }}
                  placeholder={areaUnit === "acres" ? "e.g. 0.5" : "e.g. 5000"}
                  className="w-full px-6 py-5 rounded-2xl bg-surface-overlay border border-border text-2xl font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted font-mono">
                  {areaUnit === "acres" ? "acres" : "sq ft"}
                </span>
              </div>
              
              {/* Show calculated totals/rates */}
              {form.squareFeet > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-brand/5 border border-brand/20 flex flex-col gap-1">
                  <p className="text-sm font-medium text-text-primary">
                    Total: <span className="font-bold text-brand">{form.squareFeet.toLocaleString()} sq ft</span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    {areaUnit === "acres" && <>≈ {(form.squareFeet / 43560).toFixed(2)} acres · </>}
                    Base price estimate: <span className="font-medium">${getBaseRate(form.squareFeet).toFixed(2)}/sqft</span>
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    (includes seed, tackifier, starter fertilizer & 70/30 wood fiber/cellulose mulch)
                  </p>
                </div>
              )}

              {/* Map Measure Modal */}
              {showMap && (
                <Suspense fallback={null}>
                  <SiteMeasure
                    onAreaMeasured={(sqft) => {
                      setForm({ ...form, squareFeet: sqft });
                      setAreaInput(areaUnit === "acres" ? parseFloat((sqft / 43560).toFixed(2)) : sqft);
                      setShowMap(false);
                    }}
                    onClose={() => setShowMap(false)}
                  />
                </Suspense>
              )}
            </div>
          )}

          {/* Step 1: Slope */}
          {step === 1 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 2 of 8 — Slope
              </p>
              <h3 className="text-2xl font-bold mb-2">
                What&apos;s the slope like?
              </h3>
              <p className="text-text-secondary mb-4">
                Steeper slopes require more material and specialized techniques.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">How to tell:</strong>{" "}
                  If you can mow it easily, it&apos;s flat or mild. If you&apos;d think twice about walking up it, that&apos;s moderate. If it feels dangerous, that&apos;s steep.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {slopeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, slope: opt.value })}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      form.slope === opt.value
                        ? "border-brand bg-brand/10"
                        : "border-border bg-surface-overlay hover:border-border-light"
                    }`}
                  >
                    <p className="font-semibold mb-1">{opt.label}</p>
                    <p className="text-xs text-text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Site Prep & Soil */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 3 of 8 — Site Prep &amp; Soil
              </p>

              <h4 className="text-lg font-bold mb-2">
                Need soil imported?
              </h4>
              <p className="text-text-secondary text-sm mb-4">
                If existing soil is poor or missing, we can bring in topsoil by the triaxle load or spray BSM (Proganics Dual) with the hydroseeder.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {soilImportOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const next: Partial<FormData> = { soilImport: opt.value };
                      // Topsoil needs spreading → cannot be "already prepped"
                      if (opt.value === "topsoil" && form.grading === "none") {
                        next.grading = "minor";
                      }
                      setForm({ ...form, ...next });
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      form.soilImport === opt.value
                        ? "border-brand bg-brand/10"
                        : "border-border bg-surface-overlay hover:border-border-light"
                    }`}
                  >
                    <p className="font-semibold mb-1">{opt.label}</p>
                    <p className="text-xs text-text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {form.soilImport === "topsoil" && form.squareFeet > 0 && (
                <p className="text-sm text-text-muted mb-6">
                  Estimated {estimate.topsoilLoads} triaxle load{estimate.topsoilLoads > 1 ? "s" : ""} for {form.squareFeet.toLocaleString()} sqft
                </p>
              )}

              <h3 className="text-2xl font-bold mb-2">
                Is the seedbed prepared?
              </h3>
              <p className="text-text-secondary mb-4">
                The top layer of soil needs to be loose enough to sift through by hand. If the ground is hard-packed or compacted, grading is needed.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">How to tell:</strong> Kneel down and try to sift the top few inches of soil through your fingers. If it crumbles and moves freely, the seedbed is ready. If it&apos;s hard and won&apos;t break apart, grading is needed.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {gradingOptions.map((opt) => {
                  const disabled = opt.value === "none" && form.soilImport === "topsoil";
                  return (
                    <button
                      key={opt.value}
                      disabled={disabled}
                      onClick={() => setForm({ ...form, grading: opt.value })}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        disabled
                          ? "border-border bg-surface-overlay opacity-40 cursor-not-allowed"
                          : form.grading === opt.value
                            ? "border-brand bg-brand/10"
                            : "border-border bg-surface-overlay hover:border-border-light"
                      }`}
                    >
                      <p className="font-semibold mb-1">{opt.label}</p>
                      <p className="text-xs text-text-muted">
                        {disabled ? "Topsoil import requires grading" : opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Seed Blend */}
          {step === 3 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 4 of 8 — Seed Blend
              </p>
              <h3 className="text-2xl font-bold mb-2">
                What type of seed blend?
              </h3>
              <p className="text-text-secondary mb-4">
                Different projects call for different seed mixes. Pick what fits your goals — or let us recommend the right blend.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {seedBlendOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, seedBlend: opt.value })}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      form.seedBlend === opt.value
                        ? "border-brand bg-brand/10"
                        : "border-border bg-surface-overlay hover:border-border-light"
                    }`}
                  >
                    <p className="font-semibold mb-1">{opt.label}</p>
                    <p className="text-xs text-text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Amendments */}
          {step === 4 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 5 of 8 — Optional Extras
              </p>
              <h3 className="text-2xl font-bold mb-2">
                Any extras needed?
              </h3>
              <p className="text-text-secondary mb-4">
                Your base blend already includes seed, tackifier, starter
                fertilizer, and 70/30 wood fiber/cellulose mulch. These are
                optional soil amendments — select any that apply, or skip if
                you&apos;re unsure.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Most homeowners skip this step</strong> — and that&apos;s perfectly fine. If you know your soil is acidic (common in Western PA), lime can help. Otherwise, just hit Continue.
                </p>
              </div>
              <div className="space-y-3">
                {amendmentOptions.map((opt) => {
                  const selected = form.amendments.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleAmendment(opt.value)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all ${
                        selected
                          ? "border-brand bg-brand/10"
                          : "border-border bg-surface-overlay hover:border-border-light"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{opt.label}</p>
                        <p className="text-xs text-text-muted">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          selected
                            ? "bg-brand border-brand"
                            : "border-border-light"
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-surface" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: Photos */}
          {step === 5 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 6 of 8 — Photos (Optional)
              </p>
              <h3 className="text-2xl font-bold mb-2">
                Photo walkthrough
              </h3>
              <p className="text-text-secondary mb-4">
                Take or upload photos of the areas to be seeded. This helps us
                give you a more accurate estimate.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">This step is optional</strong> — but photos help us a lot. Ideally, snap a wide shot of the full area plus close-ups of the soil and any slopes. You can always skip and hit &quot;See Estimate.&quot;
                </p>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const newPhotos = files.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }));
                  setPhotos((prev) => [...prev, ...newPhotos]);
                  e.target.value = "";
                }}
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border group">
                      <img
                        src={photo.preview}
                        alt={`Site photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(photo.preview);
                          setPhotos((prev) => prev.filter((_, idx) => idx !== i));
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 px-6 py-8 rounded-2xl border-2 border-dashed border-border bg-surface-overlay hover:border-brand/40 hover:bg-brand/5 transition-all group"
              >
                <ImagePlus className="w-6 h-6 text-text-muted group-hover:text-brand transition-colors" />
                <div className="text-left">
                  <p className="font-semibold group-hover:text-brand transition-colors">
                    {photos.length === 0 ? "Add photos of your property" : "Add more photos"}
                  </p>
                  <p className="text-xs text-text-muted">
                    Tap to take a photo or choose from your gallery
                  </p>
                </div>
              </button>

              {photos.length > 0 && (
                <p className="mt-3 text-sm text-text-muted text-center">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""} added
                </p>
              )}
            </div>
          )}

          {/* Step 7: Contact Info */}
          {step === 6 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 7 of 8 — Contact Info
              </p>
              <h3 className="text-2xl font-bold mb-2">
                Where should we send your estimate?
              </h3>
              <p className="text-text-secondary mb-6">
                We need a few details to finalize your estimate and reach out about scheduling.
              </p>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-text-primary mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contact.name}
                    onChange={(e) => {
                      const capitalized = e.target.value.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
                      setContact(prev => ({ ...prev, name: capitalized }));
                    }}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 rounded-xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-text-primary mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-text-primary mb-1.5">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(412) 555-1234"
                    className="w-full px-4 py-3 rounded-xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                {/* SMS Opt-in */}
                <button
                  type="button"
                  onClick={() => setContact(prev => ({ ...prev, smsOptIn: !prev.smsOptIn }))}
                  className="w-full flex items-start gap-3 p-4 rounded-xl border border-border bg-surface-overlay hover:border-border-light transition-colors text-left"
                >
                  <div className={`w-5 h-5 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    contact.smsOptIn ? "bg-brand border-brand" : "border-border-light"
                  }`}>
                    {contact.smsOptIn && <Check className="w-3 h-3 text-surface" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Text me updates about my project</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Receive scheduling updates &amp; photos via SMS. Msg &amp; data rates may apply. Reply STOP to opt out.
                    </p>
                  </div>
                </button>

                {/* Project Address */}
                <div>
                  <label htmlFor="project-address" className="block text-sm font-medium text-text-primary mb-1.5">
                    Project Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={projectAddressRef}
                    id="project-address"
                    type="text"
                    value={contact.projectAddress}
                    onChange={(e) => setContact(prev => ({ ...prev, projectAddress: e.target.value }))}
                    placeholder="Start typing an address..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                {/* Billing Address Toggle */}
                <button
                  type="button"
                  onClick={() => setContact(prev => ({ ...prev, billingAddressSame: !prev.billingAddressSame }))}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <div className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    contact.billingAddressSame ? "bg-brand border-brand" : "border-border-light"
                  }`}>
                    {contact.billingAddressSame && <Check className="w-3 h-3 text-surface" />}
                  </div>
                  <span>Billing address same as project address</span>
                </button>

                {/* Billing Address (if different) */}
                {!contact.billingAddressSame && (
                  <div>
                    <label htmlFor="billing-address" className="block text-sm font-medium text-text-primary mb-1.5">
                      Billing Address
                    </label>
                    <input
                      ref={billingAddressRef}
                      id="billing-address"
                      type="text"
                      value={contact.billingAddress}
                      onChange={(e) => setContact(prev => ({ ...prev, billingAddress: e.target.value }))}
                      placeholder="Start typing an address..."
                      className="w-full px-4 py-3 rounded-xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 8: Results */}
          {step === 7 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 8 of 8 — Your Estimate
              </p>
              <h3 className="text-2xl font-bold mb-2">
                Your estimate is ready.
              </h3>
              <p className="text-text-secondary mb-4">
                Based on {form.squareFeet.toLocaleString()} sqft,{" "}
                {form.slope} slope, {form.seedBlend} seed blend
                {form.grading !== "none" && `, ${form.grading} grading`}
                {form.soilImport !== "none" &&
                  `, ${form.soilImport === "bsm" ? "BSM" : `${estimate.topsoilLoads} triaxle load${estimate.topsoilLoads > 1 ? "s" : ""} topsoil`}`}
                {form.amendments.length > 0 &&
                  `, with ${form.amendments.length} amendment${
                    form.amendments.length > 1 ? "s" : ""
                  }`}
                .
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">This is a ballpark estimate</strong> — your final price may be lower or higher depending on site conditions. Choose an option below to lock in your project or get a precise quote during a site visit.
                </p>
              </div>

              {/* Estimate Card */}
              <div className="p-8 rounded-3xl border border-brand/30 bg-brand/5 mb-8">
                <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-2">
                  Estimated Project Cost
                </p>
                <p className="text-5xl font-bold text-gradient">
                  ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Final pricing confirmed after site consultation
                </p>

                {/* Line item breakdown */}
                <div className="mt-4 pt-4 border-t border-brand/20 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Hydroseeding</span>
                    <span className="font-medium">${estimate.hydroseedBase.toLocaleString()}</span>
                  </div>
                  {estimate.gradingCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Finish Grading ({form.grading === "minor" ? "minor loosening" : "full reslope"})</span>
                      <span className="font-medium">${estimate.gradingCost.toLocaleString()}</span>
                    </div>
                  )}
                  {estimate.soilImportCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        {form.soilImport === "bsm"
                          ? "BSM (Proganics Dual)"
                          : `Topsoil (${estimate.topsoilLoads} load${estimate.topsoilLoads > 1 ? "s" : ""} + delivery + spreading)`}
                      </span>
                      <span className="font-medium">${estimate.soilImportCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Inline Checkout vs Two Paths */}
              {clientSecret ? (
                <div className="w-full bg-surface border border-border rounded-xl p-4 sm:p-6 mb-8 shadow-sm">
                  <h4 className="text-xl font-bold mb-4">Pay 15% Deposit Online</h4>
                  <p className="text-sm text-text-secondary mb-6">
                    A refundable deposit locks your project into our schedule and begins the final scoping process.
                  </p>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#00c898',
                        },
                      },
                    }}
                  >
                    <CheckoutForm 
                      amount={Math.round(estimate.base * 0.15)} 
                      onCancel={() => setClientSecret(null)}
                      onSuccess={() => {
                        setConfirmation({
                          type: "deposit",
                          amount: Math.round(estimate.base * 0.15),
                          estimateBase: estimate.base,
                        });
                      }}
                    />
                  </Elements>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {/* Path 1: Deposit & Book */}
                  <div className="p-6 rounded-2xl border border-border bg-surface-raised">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                      <CreditCard className="w-5 h-5 text-brand" />
                    </div>
                    <h4 className="font-bold mb-2">Book Your Project</h4>
                    <p className="text-sm text-text-secondary mb-4">
                      Lock in your spot with a 15% deposit (${Math.round(estimate.base * 0.15).toLocaleString()}).
                      Credited fully toward your project total. We&apos;ll
                      schedule you within 5 business days.
                    </p>
                    <button
                      className="w-full py-3 rounded-xl bg-brand text-surface font-semibold hover:bg-brand-light transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleDepositCheckout}
                      disabled={isStartingCheckout}
                    >
                      {isStartingCheckout ? "Starting secure checkout..." : "Pay Deposit & Book ->"}
                    </button>
                  </div>

                  {/* Path 2: Site Consultation */}
                  <div className="p-6 rounded-2xl border border-border bg-surface-raised">
                    <div className="w-10 h-10 rounded-xl bg-surface-overlay flex items-center justify-center mb-4">
                      <Calendar className="w-5 h-5 text-text-secondary" />
                    </div>
                    <h4 className="font-bold mb-2">Site Consultation First</h4>
                    <p className="text-sm text-text-secondary mb-4">
                      Prefer to meet first? We&apos;ll walk your property and
                      finalize your plan in person.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => { setBookingService("walkthrough"); setShowBooking(true); }}
                        className="block w-full py-3 rounded-xl border border-border text-center font-semibold text-text-secondary hover:border-brand hover:text-brand transition-colors text-sm"
                      >
                        Walkthrough Only – $45
                      </button>
                      <button
                        onClick={() => { setBookingService("soil-test"); setShowBooking(true); }}
                        className="block w-full py-3 rounded-xl border border-border text-center font-semibold text-text-secondary hover:border-brand hover:text-brand transition-colors text-sm"
                      >
                        With Soil Test – $170
                      </button>
                      <p className="text-xs text-text-muted text-center pt-1">
                        Soil test includes pH, nutrient analysis &amp; amendment recommendations
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Explanation */}
              <div className="rounded-2xl border border-border bg-surface-overlay overflow-hidden">
                <button
                  onClick={() => setFeeExpanded(!feeExpanded)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-brand shrink-0" />
                    <span className="text-sm font-medium">
                      Why do we charge for a consultation?
                    </span>
                  </div>
                  {feeExpanded ? (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                <AnimatePresence>
                  {feeExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3 text-sm text-text-secondary leading-relaxed">
                        <p>
                          We get it — a consultation fee might seem unusual.
                          Here&apos;s the honest truth about why we do it:
                        </p>
                        <p>
                          Every consultation means a real human (our founder,
                          actually) drives to your property, walks the terrain,
                          and spends 60–90 minutes designing a custom
                          hydroseeding plan tailored to your exact conditions.
                          The $170 option adds a professional soil test with
                          pH, nutrient analysis, and amendment recommendations.
                        </p>
                        <p>
                          We used to offer this completely free. The result?
                          About 40% of scheduled consultations were no-shows or
                          tire-kickers — people who weren&apos;t serious about
                          actually doing a project. That wasted time meant we
                          couldn&apos;t serve the customers who genuinely needed
                          us.
                        </p>
                        <p>
                          By asking for a small fee we ensure
                          that both you and us have{" "}
                          <strong className="text-text-primary">skin in the game</strong>. It&apos;s
                          about mutual respect for each other&apos;s time and a
                          shared commitment to taking this seriously.
                        </p>
                        <p className="text-brand font-medium">
                          And here&apos;s the thing: if you move forward with
                          your project, the consultation fee is credited toward
                          your total. You literally lose nothing.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-6 text-center text-xs text-text-muted">
                Not ready to commit just yet?{" "}
                <button
                  onClick={() => { setBookingService("phone"); setShowBooking(true); }}
                  className="underline hover:text-brand transition-colors"
                >
                  Schedule a free phone consultation
                </button>{" "}
                — no obligation.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Phone Consultation Booking Popup ─── */}
      {showBooking && (
        <BookingPopup
          name={contact.name}
          email={contact.email}
          phone={contact.phone}
          address={contact.projectAddress}
          initialService={bookingService}
          onClose={() => { setShowBooking(false); setBookingService(undefined); }}
          onSuccess={(result) => {
            setShowBooking(false);
            setBookingService(undefined);
            setConfirmation(result);
          }}
        />
      )}

      {/* ─── Navigation Buttons ─── */}
      {step < 8 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={next}
              disabled={!canAdvance}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-surface text-sm font-semibold hover:bg-brand-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {step === 6 ? "See My Estimate" : step === 5 ? "Continue (or Skip)" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Progress encouragement */}
          <p className="text-center text-xs text-text-muted mt-4">
            {step === 0 && "This takes about 2 minutes. No account needed."}
            {step === 1 && "Great start — 6 quick steps to go."}
            {step === 2 && "You're doing great — 5 more steps."}
            {step === 3 && "Nice — 4 more steps."}
            {step === 4 && "Almost halfway — 4 more steps."}
            {step === 4 && "Getting close — 3 more steps."}
            {step === 5 && "Almost there — 2 more steps."}
            {step === 6 && "Last step before your estimate!"}
          </p>
        </div>
      )}

      {step === 7 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setStep(0);
              setForm({
                squareFeet: 0,
                slope: "",
                grading: "",
                soilImport: "none",
                seedBlend: "",
                amendments: [],
              });
              setContact({
                name: '',
                email: '',
                phone: '',
                smsOptIn: false,
                projectAddress: '',
                billingAddressSame: true,
                billingAddress: '',
              });
              setPhotos([]);
            }}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← Start over with a new estimate
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
