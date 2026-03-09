"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Home, HardHat, ArrowLeft, ClipboardList, Calculator, CalendarCheck } from "lucide-react";
import ProjectPlanner from "@/components/ProjectPlanner";
import CommercialRFQ from "@/components/CommercialRFQ";

type FlowType = null | "residential" | "commercial";

export default function GetSeededPage() {
  const [flow, setFlow] = useState<FlowType>(null);

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

        {/* Hero Photo Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 w-full max-w-3xl mx-auto grid grid-cols-3 gap-3"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-hydroseed-lawn-backyard-landscaping.jpg"
              alt="Completed hydroseeding project"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-construction-site-hydroseeding-2024-05-07.jpg"
              alt="Commercial hydroseeding project"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-hydroseeding-lawn-2025-10-03.jpg"
              alt="Fresh hydroseeded lawn"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
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
                className="group p-8 rounded-3xl border border-border bg-surface-raised hover:border-brand/40 transition-all text-left"
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
                className="group p-8 rounded-3xl border border-border bg-surface-raised hover:border-brand/40 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-overlay flex items-center justify-center mb-6 group-hover:bg-brand/10 transition-colors">
                  <HardHat className="w-7 h-7 text-text-secondary group-hover:text-brand transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand transition-colors">
                  Contractor / Commercial
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  GCs, developers, engineers, municipalities. Submit an RFQ and
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
              <div className="max-w-3xl mx-auto p-8 md:p-12 rounded-3xl border border-border bg-surface-raised">
                {flow === "residential" ? <ProjectPlanner /> : <CommercialRFQ />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
