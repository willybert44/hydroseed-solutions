"use client";

import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackConversion, trackEvent } from "@/lib/gtag";
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
  Sun,
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
} from "lucide-react";

const SiteMeasure = lazy(() => import("./SiteMeasure"));

/* ─── Types ─── */
type SlopeCondition = "flat" | "mild" | "moderate" | "steep";
type SoilCondition = "topsoil" | "clay" | "rocky" | "sandy" | "unknown";
type SunExposure = "full-sun" | "partial" | "full-shade" | "mixed";
type Amendment = "lime" | "compost";
type AreaUnit = "sqft" | "acres";

interface FormData {
  squareFeet: number;
  slope: SlopeCondition | "";
  soil: SoilCondition | "";
  sun: SunExposure | "";
  amendments: Amendment[];
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

const MINIMUM_PROJECT = 500;

function getBaseRate(sqft: number): number {
  if (sqft <= 5000) return 0.22;
  if (sqft <= 15000) return 0.18;
  if (sqft <= 30000) return 0.16;
  return 0.14;
}

function calculateEstimate(data: FormData): { low: number; high: number; base: number } {
  const sqft = data.squareFeet || 0;
  const baseRate = getBaseRate(sqft);
  const slopeMult = data.slope ? SLOPE_MULTIPLIER[data.slope] : 1;
  const amendmentAdd = data.amendments.reduce(
    (sum, a) => sum + AMENDMENT_COST[a],
    0
  );
  const totalPerSqft = (baseRate + amendmentAdd) * slopeMult;
  const base = Math.max(sqft * totalPerSqft, MINIMUM_PROJECT);
  return {
    low: Math.round(base * 0.9),
    high: Math.round(base * 1.15),
    base: Math.round(base),
  };
}

/* ─── Step Configs ─── */
const steps = [
  { label: "Area", icon: Ruler },
  { label: "Slope", icon: Mountain },
  { label: "Soil", icon: Layers },
  { label: "Sun", icon: Sun },
  { label: "Extras", icon: FlaskConical },
  { label: "Photos", icon: Camera },
  { label: "Estimate", icon: Calculator },
];

const slopeOptions: { value: SlopeCondition; label: string; desc: string }[] = [
  { value: "flat", label: "Flat", desc: "0–5% grade" },
  { value: "mild", label: "Mild Slope", desc: "5–15% grade" },
  { value: "moderate", label: "Moderate Slope", desc: "15–30% grade" },
  { value: "steep", label: "Steep", desc: "30%+ grade" },
];

const soilOptions: { value: SoilCondition; label: string; desc: string }[] = [
  { value: "topsoil", label: "Topsoil Present", desc: "Good existing soil" },
  { value: "clay", label: "Clay Heavy", desc: "Dense, slow-draining" },
  { value: "rocky", label: "Rocky / Gravel", desc: "Needs amendment" },
  { value: "sandy", label: "Sandy", desc: "Fast-draining, low nutrient" },
  { value: "unknown", label: "Not Sure", desc: "We'll test on site" },
];

const sunOptions: { value: SunExposure; label: string; desc: string }[] = [
  { value: "full-sun", label: "Full Sun", desc: "6+ hours direct sunlight" },
  { value: "partial", label: "Partial Shade", desc: "3–6 hours sunlight" },
  { value: "full-shade", label: "Full Shade", desc: "Under 3 hours" },
  { value: "mixed", label: "Mixed", desc: "Varies across the area" },
];

const amendmentOptions: { value: Amendment; label: string; desc: string }[] = [
  { value: "lime", label: "Lime Treatment", desc: "+$0.015/sqft" },
  { value: "compost", label: "Compost / Organic Matter", desc: "+$0.025/sqft" },
];

/* ─── Stripe Init ─── */
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ─── Inline Checkout Form ─── */
function CheckoutForm({ amount, onCancel }: { amount: number; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/get-seeded?success=true`,
      },
    });

    if (error) {
      setMessage(error.message ?? "An unexpected error occurred.");
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
  const [showMap, setShowMap] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [areaInput, setAreaInput] = useState<number>(0);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>({
    squareFeet: 0,
    slope: "",
    soil: "",
    sun: "",
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
        return form.soil !== "";
      case 3:
        return form.sun !== "";
      case 4:
        return true;
      case 5:
        return true;
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
          soil: form.soil,
          sun: form.sun,
          amendments: form.amendments,
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

  // Track conversion when user reaches the estimate step
  useEffect(() => {
    if (step === 6) {
      trackEvent("generate_lead", {
        currency: "USD",
        value: estimate.base,
      });
      // Replace with your real Google Ads conversion label:
      trackConversion(process.env.NEXT_PUBLIC_AW_ESTIMATE_LABEL ?? "", estimate.base);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-3xl mx-auto">
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
                Step 1 of 7 — Area Size
              </p>
              <h3 className="text-2xl font-bold mb-2">
                How big is the area?
              </h3>
              <p className="text-text-secondary mb-4">
                Enter the approximate size of the area to be
                hydroseeded. Don&apos;t worry about being exact — we&apos;ll
                verify on site.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Not sure of the exact size?</strong>{" "}
                  That&apos;s totally fine. A rough estimate works — or use the map tool below to draw your area and we&apos;ll calculate it for you.
                </p>
              </div>

              {/* Unit toggle */}
              <div className="flex gap-2 mb-4">
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
                        ? "bg-brand text-surface"
                        : "border border-border text-text-secondary hover:border-brand/40"
                    }`}
                  >
                    {u === "sqft" ? "Square Feet" : "Acres"}
                  </button>
                ))}
              </div>

              <div className="relative">
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
              {form.squareFeet > 0 && (
                <p className="mt-3 text-sm text-text-muted">
                  {areaUnit === "acres" && <>≈ {form.squareFeet.toLocaleString()} sq ft · </>}
                  Base rate: ${getBaseRate(form.squareFeet).toFixed(2)}/sqft (includes seed, tackifier, starter fertilizer &amp; 70/30 wood fiber/cellulose mulch)
                </p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-text-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={() => setShowMap(true)}
                className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border border-border bg-surface-overlay hover:border-brand hover:bg-brand/5 transition-all group"
              >
                <MapPin className="w-5 h-5 text-brand" />
                <div className="text-left">
                  <p className="font-semibold group-hover:text-brand transition-colors">Not sure? Measure on a map</p>
                  <p className="text-xs text-text-muted">Draw your area on Google satellite view</p>
                </div>
              </button>

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
                Step 2 of 7 — Slope
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

          {/* Step 2: Soil */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 3 of 7 — Soil
              </p>
              <h3 className="text-2xl font-bold mb-2">
                What&apos;s the soil situation?
              </h3>
              <p className="text-text-secondary mb-4">
                Soil type affects seed selection and amendment requirements.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Not sure?</strong> That&apos;s the most common answer — just pick &quot;Not Sure&quot; and we&apos;ll test your soil during the site visit. No wrong answers here.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {soilOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, soil: opt.value })}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      form.soil === opt.value
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

          {/* Step 3: Sun */}
          {step === 3 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 4 of 7 — Sun Exposure
              </p>
              <h3 className="text-2xl font-bold mb-2">
                How much sun does it get?
              </h3>
              <p className="text-text-secondary mb-4">
                Sun exposure determines the optimal seed blend for your project.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Quick test:</strong> Check the area around noon. If it&apos;s in direct sunlight with no tree cover, that&apos;s full sun. Trees overhead? Partial shade. If different parts of the area vary, pick &quot;Mixed.&quot;
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sunOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, sun: opt.value })}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      form.sun === opt.value
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
                Step 5 of 7 — Optional Extras
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

          {/* Step 5: Photos */}
          {step === 5 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 6 of 7 — Photos (Optional)
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

          {/* Step 6: Results */}
          {step === 6 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 7 of 7 — Your Estimate
              </p>
              <h3 className="text-2xl font-bold mb-2">
                Your estimate is ready.
              </h3>
              <p className="text-text-secondary mb-4">
                Based on {form.squareFeet.toLocaleString()} sqft,{" "}
                {form.slope} slope, {form.soil} soil, {form.sun} exposure
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
                      amount={Math.round(estimate.low * 0.15)} 
                      onCancel={() => setClientSecret(null)} 
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
                      Prefer to meet first? Book a $45 on-site consultation.
                      We&apos;ll walk your property, test your soil, and finalize
                      your plan in person.
                    </p>
                    <a
                      href="https://hydroseed.zohobookings.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 rounded-xl border border-border text-center font-semibold text-text-secondary hover:border-brand hover:text-brand transition-colors text-sm"
                    >
                      Book Consultation – $45
                    </a>
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
                      Why do we charge $45 for a consultation?
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
                          We get it — a $45 consultation fee might seem unusual.
                          Here&apos;s the honest truth about why we do it:
                        </p>
                        <p>
                          Every consultation means a real human (our founder,
                          actually) drives to your property, walks the terrain,
                          tests the soil, and spends 60–90 minutes designing a
                          custom hydroseeding plan tailored to your exact
                          conditions.
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
                          By asking for <strong className="text-text-primary">$45</strong> we ensure
                          that both you and us have{" "}
                          <strong className="text-text-primary">skin in the game</strong>. It&apos;s
                          about mutual respect for each other&apos;s time and a
                          shared commitment to taking this seriously.
                        </p>
                        <p className="text-brand font-medium">
                          And here&apos;s the thing: if you move forward with
                          your project, the $45 is credited toward your total.
                          You literally lose nothing.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Navigation Buttons ─── */}
      {step < 6 && (
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
              {step === 5 ? "See My Estimate" : step === 4 ? "Continue (or Skip)" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Progress encouragement */}
          <p className="text-center text-xs text-text-muted mt-4">
            {step === 0 && "This takes about 2 minutes. No account needed."}
            {step === 1 && "Great start — 5 quick questions to go."}
            {step === 2 && "You're doing great — 4 more steps."}
            {step === 3 && "Almost halfway — 3 more steps."}
            {step === 4 && "Almost there — 2 more steps."}
            {step === 5 && "Last step before your estimate!"}
          </p>
        </div>
      )}

      {step === 6 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setStep(0);
              setForm({
                squareFeet: 0,
                slope: "",
                soil: "",
                sun: "",
                amendments: [],
              });
            }}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← Start over with a new estimate
          </button>
        </div>
      )}
    </div>
  );
}
