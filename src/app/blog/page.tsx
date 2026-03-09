"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";

const posts = [
  {
    title: "Hydroseeding vs. Sod: The Real Cost Breakdown",
    excerpt:
      "Everyone thinks sod is the gold standard. We ran the numbers on 50 real projects and the results might surprise you.",
    category: "Education",
    date: "Mar 2026",
    readTime: "6 min",
    image: "/images/photos/photo-lawn-hydroseeding-residential-backyard.jpg",
  },
  {
    title: "Why Your Grass Seed Failed (And What to Do Instead)",
    excerpt:
      "Broadcast seeding has a 40-60% failure rate. Here's the science behind why — and how hydroseeding solves every single problem.",
    category: "Science",
    date: "Feb 2026",
    readTime: "8 min",
    image: "/images/photos/photo-backyard-hydroseeding.jpg",
  },
  {
    title: "The Slope Nobody Thought Could Grow",
    excerpt:
      "A 45-degree embankment, pure clay, and a skeptical homeowner. How our Slope Lock blend turned impossible into inevitable.",
    category: "Case Study",
    date: "Feb 2026",
    readTime: "5 min",
    image: "/images/photos/photo-hydroseeding-hillside-2024-05-07.jpg",
  },
  {
    title: "Native Seeds: Why Your Lawn Should Go Local",
    excerpt:
      "Native grass and wildflower species aren't just trendy — they're ecologically essential. Here's how we incorporate them.",
    category: "Sustainability",
    date: "Jan 2026",
    readTime: "7 min",
    image: "/images/photos/photo-hydroseeding-slope-landscaping.jpg",
  },
  {
    title: "What Is Tackifier and Why Does It Matter?",
    excerpt:
      "The unsung hero of hydroseeding. This binding agent is why our seed stays put on slopes, in rain, and through wind.",
    category: "Education",
    date: "Jan 2026",
    readTime: "4 min",
    image: "/images/photos/photo-construction-site-hydroseeding-kohler-generator-2024-05-07.jpg",
  },
  {
    title: "5 Signs You Need Erosion Control (Before It's Too Late)",
    excerpt:
      "Erosion doesn't announce itself. These early warning signs can save you thousands in landscape damage.",
    category: "Tips",
    date: "Dec 2025",
    readTime: "5 min",
    image: "/images/photos/photo-hydroseeding-landscaping-house-2025-10-28.jpg",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[50vh] flex flex-col justify-center px-6 pt-24">
        <div className="hero-glow top-0 left-1/2 opacity-15" />
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold tracking-widest text-brand uppercase mb-6"
          >
            Field Notes
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95]"
          >
            Thoughts from
            <br />
            <span className="text-text-muted">the field.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-lg text-text-secondary max-w-2xl leading-relaxed"
          >
            Science, stories, and straight talk about hydroseeding, erosion
            control, and why we do things differently.
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
            src="/images/photos/photo-hydroseeding-slope-landscaping.jpg"
            alt="Hydroseeding slope project"
            fill
            className="object-cover"
          />
        </motion.div>
      </section>

      {/* ─── Posts Grid ─── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group flex flex-col rounded-2xl border border-border bg-surface-raised hover:border-brand/20 transition-colors overflow-hidden"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col flex-1 p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-brand/10 text-brand">
                  {post.category}
                </span>
                <span className="text-xs text-text-muted">{post.date}</span>
              </div>
              <h2 className="text-lg font-bold mb-3 group-hover:text-brand transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </div>
                <span className="text-xs text-brand font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ─── Newsletter / CTA ─── */}
      <section className="py-24 px-6 bg-surface-raised border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            More articles coming soon.
          </h2>
          <p className="text-text-secondary mb-8">
            We&apos;re just getting started. Check back for deep dives into
            hydroseeding science, project spotlights, and seasonal tips.
          </p>
          <Link
            href="/get-seeded"
            className="text-brand font-medium inline-flex items-center gap-2 hover:gap-3 transition-all"
          >
            In the meantime, get your estimate
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="h-20" />
    </>
  );
}
