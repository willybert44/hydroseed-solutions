"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Target, Heart, Leaf, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const values = [
  {
    icon: Target,
    title: "Precision Over Volume",
    desc: "We don't chase every job. We select projects where hydroseeding is the right answer and deliver obsessive-level quality.",
  },
  {
    icon: Heart,
    title: "Radically Transparent",
    desc: "You'll know exactly what's going in your soil, what it costs, and why. No hidden fees, no mystery mixes.",
  },
  {
    icon: Leaf,
    title: "Earth-First Engineering",
    desc: "Every blend is formulated to work with your ecosystem, not against it. Native species, organic amendments, zero shortcuts.",
  },
  {
    icon: Eye,
    title: "Obsessed With Different",
    desc: "From our process to our website to our seed blends — we refuse to be another generic landscaping company.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[50vh] flex flex-col justify-center sp pt-32 pb-16">
        <div className="hero-glow top-0 right-0 opacity-20" />
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-6"
          >
            About Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95]"
          >
            We&apos;re not your
            <br />
            typical{" "}
            <span className="text-gradient">landscapers.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-lg text-text-secondary max-w-2xl leading-relaxed"
          >
            Hydroseed Solutions was born from a simple frustration: why does
            every lawn company do the exact same thing the exact same way? We
            set out to rethink everything — the science, the process, the
            customer experience. All of it.
          </motion.p>
        </div>

        {/* Hero Photo Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 w-full max-w-5xl mx-auto grid grid-cols-3 gap-4"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-worker-hydroseeding-landscaping.jpg"
              alt="Hydroseed Solutions crew member on site"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-hydroseeding-hillside-2024-05-07.jpg"
              alt="Hydroseeding hillside project"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
            <Image
              src="/images/photos/photo-hydroseeding-landscaping-house-2025-10-28.jpg"
              alt="Completed residential hydroseeding"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Story ─── */}
      <section className="py-32 sp border-t border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              The origin story.
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                It started with a 2-acre lot that nobody wanted to seed. Too
                steep for sod, too large for hand-broadcast, too eroded for
                anything conventional. The solution? A high-performance
                hydroseed application that transformed bare clay into a thick,
                green hillside in under three weeks.
              </p>
              <p>
                That project taught us something important: hydroseeding isn&apos;t
                just an alternative to sod — it&apos;s a fundamentally better
                approach for most applications. Faster establishment, deeper
                root systems, fraction of the cost, and it can go where sod
                can&apos;t.
              </p>
              <p>
                We built Hydroseed Solutions to make this technology accessible
                to everyone — homeowners, developers, municipalities — with a
                customer experience that&apos;s as modern as the science behind it.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl border border-border overflow-hidden relative">
              <Image
                src="/images/photos/photo-construction-site-hydroseeding-2024-05-07.jpg"
                alt="Hydroseed Solutions team at work"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-6xl font-bold text-white mb-4">
                  2019
                </p>
                <p className="text-white/80">
                  Founded in Pittsburgh, PA
                </p>
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    <span className="text-sm text-white/80">
                      Started with one truck and one mission
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    <span className="text-sm text-white/80">
                      Grew to 200+ projects per year
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    <span className="text-sm text-white/80">
                      15+ proprietary seed blends
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    <span className="text-sm text-white/80">
                      0 interest in being ordinary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Photo Grid ─── */}
      <section className="py-24 sp border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-8"
          >
            In the Field
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "/images/photos/photo-hydroseeding-lawn-2025-10-03.jpg",
              "/images/photos/photo-worker-hydroseeding-landscaping.jpg",
              "/images/photos/photo-teal-pulp-material-2025-10-03.jpg",
              "/images/photos/photo-hydroseeding-erosion-control-hillside-2024-04-09.jpg",
            ].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border"
              >
                <Image
                  src={src}
                  alt="Hydroseed Solutions at work"
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="py-32 sp bg-surface-raised border-t border-b border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16"
          >
            <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-4">
              Our Values
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              What we stand for.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl border border-border bg-surface"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{v.title}</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {v.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 sp">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Ready to see the
            <br />
            <span className="text-gradient">difference?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Get an instant project estimate and see why we&apos;re not like
            everyone else.
          </p>
          <Link
            href="/get-seeded"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors"
          >
            Get Seeded
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <div className="h-28" />
    </>
  );
}
