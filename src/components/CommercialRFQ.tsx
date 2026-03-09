"use client";

import { useState, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackConversion, trackEvent } from "@/lib/gtag";
import {
  Ruler,
  MapPin,
  FileText,
  Send,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  ChevronDown,
  Upload,
  X,
  FileUp,
  Info,
} from "lucide-react";

const SiteMeasure = lazy(() => import("./SiteMeasure"));

/* ─── Types ─── */
type ProjectType =
  | "highway"
  | "mine-reclamation"
  | "slope-stabilization"
  | "erosion-control"
  | "solar-fields"
  | "stormwater"
  | "bsm"
  | "bfm"
  | "pipeline"
  | "land-development"
  | "other";

type AreaUnit = "sqft" | "acres";

interface RFQData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  projectTypes: ProjectType[];
  projectName: string;
  projectLocation: string;
  estimatedAcreage: number;
  areaUnit: AreaUnit;
  specifications: string;
  timeline: string;
  additionalNotes: string;
}

const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: "highway", label: "Heavy Highway / PennDOT" },
  { value: "mine-reclamation", label: "Mine Reclamation" },
  { value: "slope-stabilization", label: "Slope Stabilization" },
  { value: "erosion-control", label: "Erosion Control / E&S" },
  { value: "solar-fields", label: "Solar Fields" },
  { value: "stormwater", label: "Stormwater / MS4" },
  { value: "bsm", label: "Biotic Soil Media (BSM)" },
  { value: "bfm", label: "Bonded Fiber Matrix (BFM)" },
  { value: "pipeline", label: "Pipeline / Utility ROW" },
  { value: "land-development", label: "Land Development / Grading" },
  { value: "other", label: "Other" },
];

const timelineOptions = [
  "Immediate / Emergency",
  "Within 30 days",
  "1–3 months",
  "3–6 months",
  "6+ months / Bidding phase",
];

const steps = [
  { label: "Company", icon: Building2 },
  { label: "Project", icon: FileText },
  { label: "Details", icon: Ruler },
  { label: "Submit", icon: Send },
];

export default function CommercialRFQ() {
  const [step, setStep] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [planFiles, setPlanFiles] = useState<{ file: File; preview: string | null }[]>([]);
  const planInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<RFQData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    projectTypes: [],
    projectName: "",
    projectLocation: "",
    estimatedAcreage: 0,
    areaUnit: "acres",
    specifications: "",
    timeline: "",
    additionalNotes: "",
  });

  const update = (partial: Partial<RFQData>) => setForm({ ...form, ...partial });

  const toggleProjectType = (t: ProjectType) => {
    setForm((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(t)
        ? prev.projectTypes.filter((x) => x !== t)
        : [...prev.projectTypes, t],
    }));
  };

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return form.companyName.trim() !== "" && form.contactName.trim() !== "" && form.email.trim() !== "";
      case 1:
        return form.projectTypes.length > 0;
      case 2:
        return true;
      case 3:
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

  const handleSubmit = () => {
    // Build mailto or form submission
    const sqft = form.areaUnit === "acres" ? Math.round(form.estimatedAcreage * 43560) : form.estimatedAcreage;
    const acreage = form.areaUnit === "acres" ? form.estimatedAcreage : parseFloat((form.estimatedAcreage / 43560).toFixed(2));
    const types = form.projectTypes
      .map((t) => projectTypeOptions.find((o) => o.value === t)?.label)
      .join(", ");

    const subject = encodeURIComponent(`RFQ: ${form.projectName || "New Project"} — ${form.companyName}`);
    const body = encodeURIComponent(
      `COMMERCIAL RFQ — HYDROSEED SOLUTIONS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `COMPANY\n` +
      `Company: ${form.companyName}\n` +
      `Contact: ${form.contactName}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone || "Not provided"}\n\n` +
      `PROJECT\n` +
      `Project Name: ${form.projectName || "Not specified"}\n` +
      `Service Types: ${types}\n` +
      `Location: ${form.projectLocation || "Not specified"}\n` +
      `Estimated Size: ${acreage} acres (${sqft.toLocaleString()} sq ft)\n` +
      `Timeline: ${form.timeline || "Not specified"}\n\n` +
      `SPECIFICATIONS\n` +
      `${form.specifications || "None provided"}\n\n` +
      `ADDITIONAL NOTES\n` +
      `${form.additionalNotes || "None"}\n` +
      (planFiles.length > 0
        ? `\nATTACHED FILES (please reply to this email with attachments)\n` +
          planFiles.map((pf) => `• ${pf.file.name} (${(pf.file.size / 1024 / 1024).toFixed(1)} MB)`).join("\n") +
          "\n"
        : "")
    );

    trackEvent("generate_lead", { currency: "USD", value: 0 });
    // Replace with your real conversion label:
    trackConversion(process.env.NEXT_PUBLIC_AW_RFQ_LABEL ?? "");

    window.location.href = `mailto:hello@hydroseed.solutions?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-brand" />
        </div>
        <h3 className="text-2xl font-bold mb-3">RFQ Submitted</h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Your email client should have opened with the RFQ details. If it
          didn&apos;t, you can reach us directly at{" "}
          <a href="mailto:hello@hydroseed.solutions" className="text-brand hover:underline">
            hello@hydroseed.solutions
          </a>
        </p>
        <p className="text-sm text-text-muted mb-8">
          We typically respond to commercial RFQs within 1 business day with
          preliminary pricing and a proposed site visit schedule.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setStep(0);
            setForm({
              companyName: "",
              contactName: "",
              email: "",
              phone: "",
              projectTypes: [],
              projectName: "",
              projectLocation: "",
              estimatedAcreage: 0,
              areaUnit: "acres",
              specifications: "",
              timeline: "",
              additionalNotes: "",
            });
          }}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          ← Submit another RFQ
        </button>
      </div>
    );
  }

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
          {/* Step 0: Company Info */}
          {step === 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 1 of 4 — Your Info
              </p>
              <h3 className="text-2xl font-bold mb-2">Company Information</h3>
              <p className="text-text-secondary mb-4">
                Tell us about your organization so we can tailor our response.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">We respond to every RFQ within 1 business day.</strong>{" "}
                  Fields marked with <span className="text-brand">*</span> are required — everything else can be filled in later.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Company Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => update({ companyName: e.target.value })}
                    placeholder="e.g. ABC Construction"
                    className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Contact Name <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(e) => update({ contactName: e.target.value })}
                      placeholder="Full name"
                      className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="(412) 555-0000"
                      className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email <span className="text-brand">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                    placeholder="you@company.com"
                    className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Project Type */}
          {step === 1 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 2 of 4 — Service Type
              </p>
              <h3 className="text-2xl font-bold mb-2">What type of work?</h3>
              <p className="text-text-secondary mb-4">
                Select all service types that apply to this project.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Select all that apply</strong> — many projects involve multiple service types (e.g., erosion control + stormwater). We&apos;ll scope each component separately in our quote.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {projectTypeOptions.map((opt) => {
                  const selected = form.projectTypes.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleProjectType(opt.value)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        selected
                          ? "border-brand bg-brand/10"
                          : "border-border bg-surface-overlay hover:border-border-light"
                      }`}
                    >
                      <span className="font-medium text-sm">{opt.label}</span>
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          selected ? "bg-brand border-brand" : "border-border-light"
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

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 3 of 4 — Project Details
              </p>
              <h3 className="text-2xl font-bold mb-2">Project Details</h3>
              <p className="text-text-secondary mb-4">
                Help us scope the project accurately. All fields optional at
                this stage.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Don&apos;t have all the details yet?</strong>{" "}
                  That&apos;s fine — fill in what you know and skip the rest. You can also upload plans/specs at the bottom. The more info you provide, the faster we can turn around a quote.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={form.projectName}
                      onChange={(e) => update({ projectName: e.target.value })}
                      placeholder="e.g. Route 22 Widening Phase 2"
                      className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Project Location
                    </label>
                    <input
                      type="text"
                      value={form.projectLocation}
                      onChange={(e) => update({ projectLocation: e.target.value })}
                      placeholder="e.g. Monroeville, PA"
                      className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>

                {/* Estimated area */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Estimated Area
                  </label>
                  <div className="flex gap-2 mb-3">
                    {(["acres", "sqft"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          if (u === form.areaUnit) return;
                          const converted =
                            u === "acres"
                              ? parseFloat((form.estimatedAcreage / 43560).toFixed(2))
                              : Math.round(form.estimatedAcreage * 43560);
                          update({ areaUnit: u, estimatedAcreage: converted });
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          form.areaUnit === u
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
                      step={form.areaUnit === "acres" ? 0.1 : 1}
                      value={form.estimatedAcreage || ""}
                      onChange={(e) =>
                        update({ estimatedAcreage: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      placeholder={form.areaUnit === "acres" ? "e.g. 15" : "e.g. 650000"}
                      className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">
                      {form.areaUnit === "acres" ? "acres" : "sq ft"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-text-muted">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <button
                    onClick={() => setShowMap(true)}
                    className="mt-3 w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border border-border bg-surface-overlay hover:border-brand hover:bg-brand/5 transition-all group"
                  >
                    <MapPin className="w-5 h-5 text-brand" />
                    <div className="text-left">
                      <p className="font-semibold text-sm group-hover:text-brand transition-colors">
                        Measure on a map
                      </p>
                      <p className="text-xs text-text-muted">
                        Draw your area on Google satellite view
                      </p>
                    </div>
                  </button>

                  {showMap && (
                    <Suspense fallback={null}>
                      <SiteMeasure
                        onAreaMeasured={(sqft) => {
                          const val =
                            form.areaUnit === "acres"
                              ? parseFloat((sqft / 43560).toFixed(2))
                              : sqft;
                          update({ estimatedAcreage: val });
                          setShowMap(false);
                        }}
                        onClose={() => setShowMap(false)}
                      />
                    </Suspense>
                  )}
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Project Timeline
                  </label>
                  <div className="relative">
                    <select
                      value={form.timeline}
                      onChange={(e) => update({ timeline: e.target.value })}
                      className="w-full appearance-none px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary focus:outline-none focus:border-brand transition-colors"
                    >
                      <option value="">Select timeline…</option>
                      {timelineOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-text-muted absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Specifications / Permit Requirements
                  </label>
                  <textarea
                    value={form.specifications}
                    onChange={(e) => update({ specifications: e.target.value })}
                    placeholder="e.g. PennDOT Pub 408 Section 804, DEP Chapter 102, NPDES permit #, seed mix specs, BFM required…"
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>

                {/* Plan Upload */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Upload Plans / Documents
                  </label>

                  <input
                    ref={planInputRef}
                    type="file"
                    accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.tif,.tiff"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const newFiles = files.map((file) => ({
                        file,
                        preview: file.type.startsWith("image/")
                          ? URL.createObjectURL(file)
                          : null,
                      }));
                      setPlanFiles((prev) => [...prev, ...newFiles]);
                      e.target.value = "";
                    }}
                  />

                  {planFiles.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {planFiles.map((pf, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-overlay group"
                        >
                          {pf.preview ? (
                            <img
                              src={pf.preview}
                              alt={pf.file.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                              <FileUp className="w-4 h-4 text-brand" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{pf.file.name}</p>
                            <p className="text-xs text-text-muted">
                              {(pf.file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (pf.preview) URL.revokeObjectURL(pf.preview);
                              setPlanFiles((prev) => prev.filter((_, idx) => idx !== i));
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => planInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 px-5 py-5 rounded-2xl border-2 border-dashed border-border bg-surface-overlay hover:border-brand/40 hover:bg-brand/5 transition-all group"
                  >
                    <Upload className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" />
                    <div className="text-left">
                      <p className="font-semibold text-sm group-hover:text-brand transition-colors">
                        {planFiles.length === 0 ? "Upload plans, drawings, or specs" : "Add more files"}
                      </p>
                      <p className="text-xs text-text-muted">
                        PDF, DWG, DXF, JPG, PNG, TIFF
                      </p>
                    </div>
                  </button>

                  {planFiles.length > 0 && (
                    <p className="mt-2 text-xs text-text-muted">
                      {planFiles.length} file{planFiles.length !== 1 ? "s" : ""} attached — will be referenced in your RFQ email. Please reply with attachments after submitting.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-3">
                Step 4 of 4 — Review & Submit
              </p>
              <h3 className="text-2xl font-bold mb-2">Review & Submit</h3>
              <p className="text-text-secondary mb-4">
                Confirm your RFQ details below. We&apos;ll respond within 1
                business day with preliminary pricing.
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/10 mb-6">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">What happens next:</strong>{" "}
                  Clicking &quot;Submit RFQ&quot; opens your email client with all details pre-filled. We&apos;ll review your project, and you&apos;ll hear back within 1 business day with preliminary pricing and a proposed site visit schedule.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {/* Summary card */}
                <div className="p-6 rounded-2xl border border-border bg-surface-overlay space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">Company</span>
                    <span className="text-sm font-medium">{form.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">Contact</span>
                    <span className="text-sm font-medium">{form.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">Email</span>
                    <span className="text-sm font-medium">{form.email}</span>
                  </div>
                  {form.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Phone</span>
                      <span className="text-sm font-medium">{form.phone}</span>
                    </div>
                  )}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">Services</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">
                      {form.projectTypes
                        .map((t) => projectTypeOptions.find((o) => o.value === t)?.label)
                        .join(", ")}
                    </span>
                  </div>
                  {form.projectName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Project</span>
                      <span className="text-sm font-medium">{form.projectName}</span>
                    </div>
                  )}
                  {form.projectLocation && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Location</span>
                      <span className="text-sm font-medium">{form.projectLocation}</span>
                    </div>
                  )}
                  {form.estimatedAcreage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Est. Area</span>
                      <span className="text-sm font-medium">
                        {form.areaUnit === "acres"
                          ? `${form.estimatedAcreage} acres`
                          : `${form.estimatedAcreage.toLocaleString()} sq ft`}
                      </span>
                    </div>
                  )}
                  {form.timeline && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Timeline</span>
                      <span className="text-sm font-medium">{form.timeline}</span>
                    </div>
                  )}
                  {planFiles.length > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between">
                        <span className="text-sm text-text-muted">Attachments</span>
                        <span className="text-sm font-medium">
                          {planFiles.length} file{planFiles.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional notes */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Anything else we should know?
                  </label>
                  <textarea
                    value={form.additionalNotes}
                    onChange={(e) => update({ additionalNotes: e.target.value })}
                    placeholder="Plans available, prevailing wage, bonding requirements, special access considerations…"
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand text-surface font-semibold hover:bg-brand-light transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit RFQ
              </button>
              <p className="mt-3 text-xs text-text-muted text-center">
                Opens your email client with the RFQ details pre-filled.
                No instant pricing — we&apos;ll review your project and respond
                with a formal quote.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Navigation Buttons ─── */}
      {step < 3 && (
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
              {step === 2 ? "Review RFQ" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-text-muted mt-4">
            {step === 0 && "Takes about 3 minutes. Your info is never shared or sold."}
            {step === 1 && "2 more steps — project details and review."}
            {step === 2 && "Last step — review and submit your RFQ."}
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setStep(2)}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← Go back and edit details
          </button>
        </div>
      )}
    </div>
  );
}
