"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Droplets,
  Mountain,
  FlaskConical,
  Shield,
  Sprout,
  Zap,
  Ruler,
  ThermometerSun,
} from "lucide-react";

const services = [
  {
    icon: Droplets,
    title: "Residential Hydroseeding",
    desc: "Your yard, reimagined. We apply a precision-engineered slurry of seed, mulch, fertilizer, and tackifier in a single application. You'll see green in 5-7 days and a fully established lawn in 3-4 weeks — at roughly 1/3 the cost of sod.",
    features: [
      "Custom seed blend for your specific conditions",
      "Full soil prep and grading included",
      "Post-application care guide",
      "Germination guarantee",
    ],
  },
  {
    icon: Shield,
    title: "Commercial & Municipal",
    desc: "Large-scale hydroseeding for commercial properties, housing developments, roadways, and public infrastructure. We handle projects from 10,000 sqft to 100+ acres with the same precision and quality.",
    features: [
      "DOT-compliant erosion control specs",
      "Project management and scheduling",
      "Multi-phase application capability",
      "Environmental compliance documentation",
    ],
  },
  {
    icon: Mountain,
    title: "Erosion & Slope Control",
    desc: "Steep slopes, embankments, and erosion-prone areas are our specialty. Our bonded fiber matrix (BFM) and flexible growth medium (FGM) applications hold soil in place while establishing deep-rooted vegetation cover.",
    features: [
      "Slopes up to 1:1 (45°) grade",
      "Bonded fiber matrix (BFM) application",
      "Erosion control blanket integration",
      "Stormwater management compliance",
    ],
  },
  {
    icon: FlaskConical,
    title: "Custom Seed Blending",
    desc: "Not all lawns are created equal. We formulate custom seed blends based on your soil composition, sun exposure, traffic patterns, and climate zone. From athletic fields to wildflower meadows — we blend it.",
    features: [
      "Soil testing and analysis",
      "Sun/shade mapping",
      "Native species options",
      "Seasonal blend optimization",
    ],
  },
  {
    icon: Sprout,
    title: "Lawn Renovation & Overseeding",
    desc: "Patchy, thin, or damaged lawn? Our hydroseed overseeding process fills in gaps and strengthens your existing turf without tearing everything up and starting over.",
    features: [
      "Core aeration before application",
      "Targeted thin-spot treatment",
      "Compatible blend matching",
      "Minimal disruption to existing lawn",
    ],
  },
  {
    icon: Zap,
    title: "Rapid Establishment Program",
    desc: "Need green fast? Our accelerated establishment protocol uses premium fast-germinating varieties, enhanced bio-stimulants, and our proprietary tackifier for visible results in as little as 5 days.",
    features: [
      "Fast-germinating seed varieties",
      "Bio-stimulant enhanced slurry",
      "7-day germination guarantee",
      "Ideal for time-sensitive projects",
    ],
  },
  {
    icon: Ruler,
    title: "Site Preparation & Grading",
    desc: "Proper prep is everything. We offer full site preparation including rough and finish grading, debris removal, and soil amendment — so your hydroseed application has the best possible foundation.",
    features: [
      "Rough and finish grading",
      "Debris and rock removal",
      "Soil amendment and conditioning",
      "Drainage optimization",
    ],
  },
  {
    icon: ThermometerSun,
    title: "Seasonal & Climate Programs",
    desc: "We tailor application timing and seed selection to your region's climate cycles. Cool-season, warm-season, or transitional zone — we know what works and when to apply it.",
    features: [
      "Spring, summer, and fall programs",
      "Climate-zone specific planning",
      "Dormant seeding options",
      "Year-round maintenance plans",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[60vh] flex flex-col justify-center sp pt-32 pb-16">
        <div className="hero-glow top-0 left-1/3 opacity-20" />
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-6"
          >
            Services
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95]"
          >
            Everything green.
            <br />
            <span className="text-text-muted">Nothing ordinary.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-lg text-text-secondary max-w-2xl leading-relaxed"
          >
            From backyard lawns to 100-acre development sites, we deliver
            hydroseeding solutions engineered for your exact conditions.
          </motion.p>
        </div>

        {/* Hero Photo Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 w-full max-w-6xl mx-auto grid grid-cols-3 gap-4"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-construction-site-hydroseeding-kohler-generator-2024-05-07.jpg"
              alt="Commercial hydroseeding equipment"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-hydroseeding-hillside-2024-05-07.jpg"
              alt="Hillside hydroseeding"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-backyard-hydroseeding.jpg"
              alt="Backyard hydroseeding"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Services List ─── */}
      <section className="py-24 sp border-t border-border">
        <div className="max-w-5xl mx-auto space-y-6">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="group p-8 md:p-10 rounded-2xl border border-border bg-surface-raised hover:border-brand/20 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-2/3">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-brand" />
                      </div>
                      <h2 className="text-2xl font-bold">{svc.title}</h2>
                    </div>
                    <p className="text-text-secondary leading-relaxed">
                      {svc.desc}
                    </p>
                  </div>
                  <div className="md:w-1/3 md:border-l md:border-border md:pl-8">
                    <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-3">
                      Includes
                    </p>
                    <ul className="space-y-2">
                      {svc.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-text-secondary"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Work Gallery ─── */}
      <section className="py-16 sp border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-6"
          >
            Recent Projects
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "/images/photos/photo-hydroseeding-landscaping-house-2025-10-28.jpg", alt: "Residential landscaping project" },
              { src: "/images/photos/photo-hydroseeding-erosion-control-hillside-2024-04-09.jpg", alt: "Erosion control on hillside" },
              { src: "/images/photos/photo-backyard-landscaping-swimming-pool-2025-08-13.jpg", alt: "Backyard pool landscaping" },
              { src: "/images/photos/photo-worker-hydroseeding-landscaping.jpg", alt: "Hydroseeding in progress" },
            ].map((photo, i) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specialty Landing Pages ─── */}
      <section className="py-24 sp border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-4">
            Specialty Services
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Industry-Specific Solutions
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-2xl">
            Large-scale, regulated, and technically demanding projects require specialized hydroseeding expertise. We deliver.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "New Lawn Installation", slug: "new-lawn-installation", desc: "Complete start-to-finish lawn installation for new homes — grading, topsoil, amendments, and hydroseeding in one service." },
              { title: "Finish Grading & Seed Bed Prep", slug: "finish-grading", desc: "Proper grading, topsoil installation, and seed bed preparation — the foundation every great lawn needs." },
              { title: "Mine Reclamation", slug: "mine-reclamation", desc: "DEP-compliant revegetation for surface-mined land and coal refuse sites." },
              { title: "Slope Stabilization", slug: "slope-stabilization", desc: "Bonded fiber matrix applications for Pittsburgh's steepest terrain." },
              { title: "Erosion Control", slug: "erosion-control", desc: "Rapid-response stabilization for construction sites and NPDES compliance." },
              { title: "Heavy Highway", slug: "heavy-highway", desc: "PennDOT-compliant hydroseeding for infrastructure and roadway projects." },
              { title: "Solar Fields", slug: "solar-fields", desc: "Low-maintenance ground cover and pollinator habitat for utility-scale solar." },
              { title: "Stormwater Projects", slug: "stormwater-projects", desc: "Engineered vegetation for basins, channels, wetlands, and MS4 facilities." },
              { title: "Biotic Soil Media", slug: "biotic-soil-media", desc: "Spray-applied engineered topsoil for sites where importing soil is impractical or cost-prohibitive." },
              { title: "Bonded Fiber Matrix", slug: "bonded-fiber-matrix", desc: "Flexterra & high-performance BFM erosion control that outperforms blankets on steep slopes and channels." },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/services/${item.slug}`}
                className="group p-6 rounded-2xl border border-border bg-surface-raised hover:border-brand/30 transition-colors"
              >
                <h3 className="font-semibold text-lg group-hover:text-brand transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  {item.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-brand font-medium">
                  Learn More
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 sp border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Not sure what you need?
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Our project planner walks you through it. Get an instant estimate
            based on your specific conditions.
          </p>
          <Link
            href="/get-seeded"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors"
          >
            Start Your Estimate
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <div className="h-28" />
    </>
  );
}
