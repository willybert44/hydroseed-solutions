"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Home, HardHat, ArrowLeft, ClipboardList, Calculator, CalendarCheck, CheckCircle, Phone, Mail } from "lucide-react";
import ProjectPlanner from "@/components/ProjectPlanner";
import PhoneLink from "@/components/PhoneLink";
import CommercialRFQ from "@/components/CommercialRFQ";

type FlowType = null | "residential" | "commercial";

export default function GetSeededPage() {
  return (
    <Suspense>
      <GetSeededContent />
    </Suspense>
  );
}

function GetSeededContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('redirect_status') === 'succeeded' || searchParams.get('success') === 'true';
  const [flow, setFlow] = useState<FlowType>(null);

  if (isSuccess) {
    return (
      <>
        <section className="relative pt-32 pb-16 px-6">
          <div className="hero-glow top-0 left-1/2 -translate-x-1/2 opacity-25" />
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle className="w-10 h-10 text-brand" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            >
              You&apos;re <span className="text-gradient">booked!</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-lg text-text-secondary max-w-lg mx-auto leading-relaxed mb-10"
            >
              Your deposit has been received and your project is officially on the schedule. Here&apos;s what happens next.
            </motion.p>
          </div>
        </section>

        <section className="px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {/* Timeline */}
            <div className="space-y-0">
              {[
                {
                  step: "1",
                  title: "Confirmation Email",
                  desc: "You\u2019ll receive a payment receipt and project confirmation within a few minutes.",
                  timing: "Right now",
                },
                {
                  step: "2",
                  title: "We\u2019ll Reach Out",
                  desc: "Our team will call or text to confirm your project details and finalize the scope. Your deposit is credited in full toward the project total.",
                  timing: "Within 1 business day",
                },
                {
                  step: "3",
                  title: "Project Scheduling",
                  desc: "We\u2019ll lock in a date that works for you. Most projects are scheduled within 5 business days.",
                  timing: "Within 5 business days",
                },
                {
                  step: "4",
                  title: "Project Day",
                  desc: "Our crew arrives, sprays, and you\u2019re on your way to a beautiful lawn. We\u2019ll leave you with aftercare instructions.",
                  timing: "Scheduled together",
                },
              ].map((item, i) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                      {item.step}
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-8">
                    <p className="font-semibold text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
                    <p className="text-xs text-brand font-medium mt-1">{item.timing}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact card */}
            <div className="mt-4 p-6 rounded-2xl border border-border bg-surface-raised">
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

            {/* Back link */}
            <div className="mt-10 text-center">
              <a
                href="/"
                className="text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                \u2190 Back to homepage
              </a>
            </div>
          </motion.div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="hero-glow top-0 left-1/2 -translate-x-1/2 opacity-25" />
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-6"
          >
            {flow === "commercial" ? "Commercial RFQ" : flow === "residential" ? "Project Planner" : "Get Started"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6"
          >
            Let&apos;s get
            <br />
            <span className="text-gradient">growing.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed"
          >
            {flow === null
              ? "Whether you're a homeowner or a general contractor, we've got you covered."
              : flow === "residential"
              ? "Answer 5 quick questions about your project and get an instant estimate. No phone calls, no emails, no waiting."
              : "Tell us about your project and we'll respond with a formal quote within 1 business day."}
          </motion.p>
        </div>
      </section>

      {/* ─── How It Works (visible before choosing a flow) ─── */}
      {flow === null && (
        <section className="px-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                {
                  icon: ClipboardList,
                  label: "1. Tell Us About Your Project",
                  desc: "Answer a few quick questions — no account needed.",
                },
                {
                  icon: Calculator,
                  label: "2. Get Your Estimate",
                  desc: "See transparent pricing instantly. No surprises.",
                },
                {
                  icon: CalendarCheck,
                  label: "3. Book When Ready",
                  desc: "Schedule on your terms — no pressure, no commitments.",
                },
              ].map((s) => (
                <div key={s.label}>
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mx-auto mb-2">
                    <s.icon className="w-5 h-5 text-brand" />
                  </div>
                  <p className="text-sm font-semibold mb-0.5">{s.label}</p>
                  <p className="text-xs text-text-muted leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ─── Flow Selector or Active Flow ─── */}
      <section className="py-12 px-6">
        <AnimatePresence mode="wait">
          {flow === null && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.5 }}
              className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4"
            >
              <button
                onClick={() => setFlow("residential")}
                className="group p-8 rounded-3xl glass-card hover:border-brand/40 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:bg-brand/20 transition-colors">
                  <Home className="w-7 h-7 text-brand" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand transition-colors">
                  Homeowner
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  Residential lawn, backyard, or property project. Get an instant
                  estimate in under 2 minutes.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-brand font-medium">
                  Get Instant Estimate →
                </span>
              </button>

              <button
                onClick={() => setFlow("commercial")}
                className="group p-8 rounded-3xl glass-card hover:border-brand/40 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-overlay flex items-center justify-center mb-6 group-hover:bg-brand/10 transition-colors">
                  <HardHat className="w-7 h-7 text-text-secondary group-hover:text-brand transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand transition-colors">
                  Contractor / Commercial
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  GCs, landscapers, pool installers, developers, engineers, municipalities, excavators &amp; site-work contractors. Submit an RFQ and
                  we&apos;ll respond with a formal quote.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-brand font-medium">
                  Submit RFQ →
                </span>
              </button>
            </motion.div>
          )}

          {flow !== null && (
            <motion.div
              key={flow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-3xl mx-auto mb-6">
                <button
                  onClick={() => setFlow(null)}
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {flow === "residential" ? "Switch to Commercial RFQ" : "Switch to Residential Estimate"}
                </button>
              </div>
              <div className="max-w-3xl mx-auto">
                {flow === "residential" ? <ProjectPlanner /> : <CommercialRFQ />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Hero Photo Strip (Moved below actionable items) */}
      <section className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-3xl mx-auto grid grid-cols-3 gap-3"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border mt-3">
            <Image
              src="/images/photos/photo-hydroseed-lawn-backyard-landscaping.jpg"
              alt="Completed hydroseeding project"
              fill
              sizes="(max-width: 768px) 33vw, 256px"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border mt-3">
            <Image
              src="/images/photos/photo-construction-site-hydroseeding-2024-05-07.jpg"
              alt="Commercial hydroseeding project"
              fill
              sizes="(max-width: 768px) 33vw, 256px"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border mt-3">
            <Image
              src="/images/photos/photo-hydroseeding-lawn-2025-10-03.jpg"
              alt="Fresh hydroseeded lawn"
              fill
              sizes="(max-width: 768px) 33vw, 256px"
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Trust section ─── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Instant Estimates",
              desc: "No waiting for callbacks. Get a ballpark in under 2 minutes.",
            },
            {
              num: "02",
              title: "Transparent Pricing",
              desc: "See every factor that goes into your cost. No hidden fees, ever.",
            },
            {
              num: "03",
              title: "Your Terms",
              desc: "Book immediately or consult first. You decide how to move forward.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-center sm:text-left"
            >
              <p className="text-3xl font-bold text-brand/30 mb-2">
                {item.num}
              </p>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="h-20" />
    </>
  );
}
