"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Droplets,
  Shield,
  Zap,
  Sprout,
  Mountain,
  FlaskConical,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stats = [
  { value: "500K+", label: "Sq Ft Seeded" },
  { value: "200+", label: "Projects Completed" },
  { value: "15+", label: "Custom Blends" },
  { value: "98%", label: "Germination Rate" },
];

const services = [
  {
    icon: Droplets,
    title: "Residential Hydroseeding",
    desc: "Transform your yard from dirt to lush green in a fraction of the time and cost of traditional sod.",
  },
  {
    icon: Mountain,
    title: "Erosion & Slope Control",
    desc: "Engineered hydroseed applications for slopes, embankments, and erosion-prone terrain.",
  },
  {
    icon: FlaskConical,
    title: "Custom Seed Blends",
    desc: "Lab-formulated seed mixes designed for your exact soil, sun, and climate conditions.",
  },
  {
    icon: Shield,
    title: "Commercial Projects",
    desc: "Large-scale hydroseeding for developers, municipalities, and commercial properties.",
  },
  {
    icon: Sprout,
    title: "Lawn Renovation",
    desc: "Breathe new life into tired, patchy, or damaged lawns with precision overseeding.",
  },
  {
    icon: Zap,
    title: "Rapid Establishment",
    desc: "Our proprietary tackifier and mulch blend gets you visible growth in 5-7 days.",
  },
];

export default function Home() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden sp">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/photos/bg-video-compressed.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />

        <div className="hero-glow top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <div className="hero-glow bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-20" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Image
              src="/images/logos/logo.png"
              alt="Hydroseed Solutions"
              width={384}
              height={144}
              className="h-24 sm:h-32 w-auto mx-auto"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-light text-xs font-medium text-text-secondary mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Pittsburgh&apos;s Premier Hydroseeding Company
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]"
          >
            DON&apos;T JUST
            <br />
            PLANT.{" "}
            <span className="text-gradient">HYDROSEED.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            We spray a precision-engineered slurry of seed, mulch, fertilizer,
            and tackifier — delivering faster germination, better coverage, and
            stronger roots than any traditional method.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/get-seeded"
              className="group flex items-center gap-2 px-8 py-4 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors text-base"
            >
              Get Your Estimate
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 border border-border-light text-text-secondary font-medium rounded-full hover:border-brand hover:text-brand transition-colors text-base"
            >
              Explore Services
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-28 md:bottom-24 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 border-2 border-border-light rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1 h-1 rounded-full bg-brand"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Stats ─── */}
      <section className="relative py-24 sp border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-4xl sm:text-5xl font-bold text-gradient">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── What is Hydroseeding ─── */}
      <section className="py-32 sp">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-4">
              The Process
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Hydroseeding
              <br />
              <span className="text-text-muted">explained in 30 seconds.</span>
            </h2>
            <p className="mt-6 text-text-secondary leading-relaxed">
              Traditional seeding is slow and patchy. Sod is expensive and
              fragile. Hydroseeding is the sweet spot — a pressurized slurry of
              premium seed, wood-fiber mulch, starter fertilizer, and a binding
              tackifier sprayed directly onto prepared soil.
            </p>
            <p className="mt-4 text-text-secondary leading-relaxed">
              The mulch retains moisture, the tackifier holds everything in
              place, and the seed establishes roots 40% faster than broadcast
              seeding. The result? A dense, resilient lawn at a fraction of the
              cost of sod.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 mt-8 text-brand font-medium hover:gap-3 transition-all"
            >
              Learn more about our services
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl border border-border overflow-hidden relative">
              <Image
                src="/images/photos/photo-hydroseeding-hillside-2024-05-07.jpg"
                alt="Hydroseeding a hillside"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-2xl font-bold text-white mb-2">1 Application</p>
                <p className="text-white/80">
                  Seed + mulch + fertilizer + tackifier. Sprayed in one pass.
                  Green in 7 days.
                </p>
              </div>
            </div>
            <div className="absolute -z-10 inset-4 rounded-3xl bg-brand/5 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ─── Services Grid ─── */}
      <section className="py-32 sp bg-surface-raised border-t border-b border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-4">
              What We Do
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Built different.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="group p-8 rounded-2xl border border-border bg-surface hover:border-brand/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-6 group-hover:bg-brand/20 transition-colors">
                    <Icon className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{svc.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {svc.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-brand font-medium hover:gap-3 transition-all"
            >
              View all services
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Project Gallery ─── */}
      <section className="py-32 sp">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-4">
              Our Work
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              See the results.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: "/images/photos/photo-backyard-hydroseeding.jpg", alt: "Backyard hydroseeding project" },
              { src: "/images/photos/photo-residential-houses-hydroseeded-lawn-2024-04-17.jpg", alt: "Residential hydroseeded lawn" },
              { src: "/images/photos/photo-construction-site-hydroseeding-2024-05-07.jpg", alt: "Panoramic hydroseeding project" },
              { src: "/images/photos/photo-backyard-lawn-hydroseeding-2025-08-13.jpg", alt: "Hydroseeding project" },
              { src: "/images/photos/photo-lawn-hydroseeding-residential-backyard.jpg", alt: "Residential lawn hydroseeding" },
              { src: "/images/photos/photo-backyard-landscaping-swimming-pool-2025-08-13.jpg", alt: "Completed hydroseeding" },
            ].map((photo, i) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className={`relative overflow-hidden rounded-2xl border border-border group ${
                  i === 2 ? "col-span-2 aspect-[2/1]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trusted Partners ─── */}
      <section className="py-20 sp border-t border-border">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-sm font-bold tracking-widest text-brand uppercase text-center mb-16"
          >
            Companies We&apos;ve Partnered With
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-16 md:gap-24"
          >
            {[
              { src: "/images/logos/WCHA_logo-white.png", alt: "WCHA", h: "h-20" },
              { src: "/images/logos/Credible-Pool-Spa-Logo.png", alt: "Credible Pool & Spa", h: "h-24" },
              { src: "/images/logos/0gmNY1vYmkOPrtcW2CUpj7Ddk.avif", alt: "Partner company", h: "h-20" },
              { src: "/images/logos/58e0b7_c81d2aa8c7344caf8dd5ebc1fc09cfaa~mv2.avif", alt: "Partner company", h: "h-20" },
            ].map((logo) => (
              <div key={logo.src} className="relative flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={240}
                  height={120}
                  className={`${logo.h} w-auto object-contain`}
                />
              </div>
            ))}
            <div className="text-2xl sm:text-3xl font-bold opacity-70 hover:opacity-100 transition-opacity text-center">
              Lutterman Excavating
            </div>
            <div className="text-2xl sm:text-3xl font-bold opacity-70 hover:opacity-100 transition-opacity text-center">
              Inca Stone
            </div>
            <div className="text-xl sm:text-2xl font-medium italic opacity-50 text-center">
              &amp; more...
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 sp">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Your lawn deserves
              <br />
              <span className="text-gradient">better than average.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
              Get an instant project estimate in under 2 minutes. No phone
              calls, no waiting, no games.
            </p>
            <Link
              href="/get-seeded"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-brand text-surface font-bold text-lg rounded-full hover:bg-brand-light transition-colors animate-pulse-glow"
            >
              Get Seeded Now
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="h-28" />
    </>
  );
}
