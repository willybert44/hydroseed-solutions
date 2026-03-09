"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sun, CloudRain, Trees, Flower2, Mountain, Wheat } from "lucide-react";

const blends = [
  {
    name: "The Classic",
    tagline: "Tried, true, green.",
    icon: Wheat,
    color: "from-green-900/20 to-green-800/5",
    description:
      "Our go-to residential blend. A balanced mix of Kentucky Bluegrass, Perennial Ryegrass, and Fine Fescue for a dense, dark-green lawn that thrives in Pennsylvania's climate.",
    bestFor: "Full sun to partial shade residential lawns",
    germinationDays: "7-14",
    species: ["Kentucky Bluegrass", "Perennial Ryegrass", "Fine Fescue"],
  },
  {
    name: "Shade Master",
    tagline: "Where the sun don't shine.",
    icon: Trees,
    color: "from-emerald-900/20 to-emerald-800/5",
    description:
      "Engineered for heavily shaded areas where traditional blends struggle. Heavy on Creeping Red Fescue and Chewings Fescue with shade-tolerant Bluegrass varieties.",
    bestFor: "Heavy shade, under trees, north-facing slopes",
    germinationDays: "10-18",
    species: ["Creeping Red Fescue", "Chewings Fescue", "Shade-tolerant Bluegrass"],
  },
  {
    name: "Slope Lock",
    tagline: "Gravity is optional.",
    icon: Mountain,
    color: "from-teal-900/20 to-teal-800/5",
    description:
      "Our erosion control powerhouse. Deep-rooting species combined with an aggressive tackifier and bonded fiber matrix to hold steep slopes while establishing permanent vegetation.",
    bestFor: "Slopes 15%+ grade, embankments, erosion-prone areas",
    germinationDays: "5-10",
    species: ["Annual Ryegrass", "Tall Fescue", "Crown Vetch", "Birdsfoot Trefoil"],
  },
  {
    name: "Sun Scorcher",
    tagline: "Bring the heat.",
    icon: Sun,
    color: "from-yellow-900/15 to-amber-900/5",
    description:
      "Built for full-sun exposure and drought tolerance. Turf-type Tall Fescue dominant with drought-resistant Bluegrass varieties. Handles the hottest Pittsburgh summers without flinching.",
    bestFor: "South-facing, full sun, high heat exposure",
    germinationDays: "7-12",
    species: ["Turf-type Tall Fescue", "Drought-resistant Bluegrass", "Perennial Rye"],
  },
  {
    name: "Rain Runner",
    tagline: "Wet feet? No problem.",
    icon: CloudRain,
    color: "from-blue-900/20 to-cyan-900/5",
    description:
      "Designed for poorly drained areas, low spots, and rain gardens. Species selected for wet soil tolerance with added bio-retention functionality.",
    bestFor: "Low areas, poor drainage, rain gardens",
    germinationDays: "10-16",
    species: ["Reed Canarygrass", "Fowl Bluegrass", "Creeping Bentgrass"],
  },
  {
    name: "Wildflower Riot",
    tagline: "Let it run wild.",
    icon: Flower2,
    color: "from-pink-900/15 to-purple-900/5",
    description:
      "A curated mix of native wildflowers and grasses for meadows, pollinator habitats, and natural areas. Low maintenance, high impact, ecologically responsible.",
    bestFor: "Meadows, natural areas, pollinator gardens",
    germinationDays: "14-28",
    species: ["Black-eyed Susan", "Purple Coneflower", "Little Bluestem", "Wild Bergamot"],
  },
];

export default function SeedBlendsPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[60vh] flex flex-col justify-center px-6 pt-24">
        <div className="hero-glow top-0 right-1/4 opacity-20" />
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-6"
          >
            Seed Blends
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95]"
          >
            The perfect blend
            <br />
            <span className="text-gradient">for every condition.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-lg text-text-secondary max-w-2xl leading-relaxed"
          >
            We don&apos;t do one-size-fits-all. Each blend is engineered for
            specific soil, sun, slope, and climate conditions. Because your
            dirt is unique — and your seed should be too.
          </motion.p>
        </div>

        {/* Hero Photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 w-full max-w-5xl mx-auto relative aspect-[3/1] rounded-3xl overflow-hidden border border-border"
        >
          <Image
            src="/images/photos/photo-lawn-hydroseeding-residential-backyard.jpg"
            alt="Lush hydroseeded residential lawn"
            fill
            className="object-cover"
          />
        </motion.div>
      </section>

      {/* ─── Blends ─── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto space-y-8">
          {blends.map((blend, i) => {
            const Icon = blend.icon;
            return (
              <motion.div
                key={blend.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${blend.color} p-8 md:p-12`}
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-3/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6 text-brand" />
                      <p className="text-xs font-semibold tracking-widest text-brand uppercase">
                        {blend.tagline}
                      </p>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                      {blend.name}
                    </h2>
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {blend.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {blend.species.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-2/5 md:border-l md:border-border/50 md:pl-8 space-y-4">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                        Best For
                      </p>
                      <p className="text-sm text-text-primary">
                        {blend.bestFor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                        Germination
                      </p>
                      <p className="text-sm text-text-primary">
                        {blend.germinationDays} days
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Photo Gallery ─── */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-6"
          >
            In the Field
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "/images/photos/photo-hydroseeding-lawn-2025-10-03.jpg", alt: "Freshly hydroseeded lawn" },
              { src: "/images/photos/photo-hydroseeding-slope-landscaping.jpg", alt: "Slope blend application" },
              { src: "/images/photos/photo-backyard-lawn-hydroseeding-2025-08-13.jpg", alt: "Residential backyard blend" },
              { src: "/images/photos/photo-teal-pulp-material-2025-10-03.jpg", alt: "Hydroseed slurry mix" },
            ].map((photo, i) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border"
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

      {/* ─── Custom Blend CTA ─── */}
      <section className="py-32 px-6 bg-surface-raised border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Don&apos;t see your fit?
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
            We create custom blends for unique conditions. Tell us about your
            project and we&apos;ll engineer the perfect mix.
          </p>
          <Link
            href="/get-seeded"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors"
          >
            Build Your Custom Blend
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <div className="h-20" />
    </>
  );
}
