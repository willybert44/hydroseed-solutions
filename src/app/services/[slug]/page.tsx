import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PhoneLink from "@/components/PhoneLink";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Gauge,
  Wrench,
  HelpCircle,
} from "lucide-react";
import serviceLandings, { type ServiceLanding } from "@/data/service-landings";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return serviceLandings.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const svc = serviceLandings.find((s) => s.slug === slug);
  if (!svc) return {};
  return {
    title: `${svc.name} Hydroseeding Services | Pittsburgh PA | Hydroseed Solutions`,
    description: `${svc.heroDescription.slice(0, 150)}. Professional ${svc.name.toLowerCase()} hydroseeding in Pittsburgh & Western PA. Free estimates — 412-866-SEED.`,
    keywords: [
      `${svc.name.toLowerCase()} hydroseeding`,
      `${svc.name.toLowerCase()} Pittsburgh`,
      `${svc.name.toLowerCase()} Pennsylvania`,
      `${svc.name.toLowerCase()} Western PA`,
      "hydroseeding contractor Pittsburgh",
      "erosion control Pittsburgh",
      "professional hydroseeding",
      "lawn installation",
      "finish grading",
    ],
    alternates: {
      canonical: `https://hydroseed.solutions/services/${svc.slug}`,
    },
    openGraph: {
      title: `${svc.name} Hydroseeding | Hydroseed Solutions`,
      description: svc.tagline,
      url: `https://hydroseed.solutions/services/${svc.slug}`,
      type: "website",
    },
  };
}

const galleryPhotos = [
  "/images/photos/photo-hydroseeding-hillside-2024-05-07.jpg",
  "/images/photos/photo-construction-site-hydroseeding-kohler-generator-2024-05-07.jpg",
  "/images/photos/photo-backyard-hydroseeding.jpg",
  "/images/photos/photo-residential-houses-hydroseeded-lawn-2024-04-17.jpg",
  "/images/photos/photo-lawn-hydroseeding-residential-backyard.jpg",
  "/images/photos/photo-backyard-lawn-hydroseeding-2025-08-13.jpg",
  "/images/photos/photo-hydroseeding-erosion-control-hillside-2024-04-09.jpg",
  "/images/photos/photo-hydroseeding-landscaping-house-2025-10-28.jpg",
  "/images/photos/photo-worker-hydroseeding-landscaping.jpg",
  "/images/photos/photo-hydroseeding-lawn-2025-10-03.jpg",
  "/images/photos/photo-backyard-landscaping-swimming-pool-2025-08-13.jpg",
  "/images/photos/photo-hydroseed-lawn-backyard-landscaping.jpg",
  "/images/photos/photo-hydroseeding-slope-landscaping.jpg",
  "/images/photos/photo-residential-houses-lawn-maintenance.jpg",
  "/images/photos/photo-construction-site-hydroseeding-2024-05-07.jpg",
  "/images/photos/photo-hydroseeding-backyard-landscaping.jpg",
  "/images/photos/photo-teal-pulp-material-2025-10-03.jpg",
];

function getServicePhotos(slug: string): string[] {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  const start = Math.abs(hash) % galleryPhotos.length;
  return [0, 1, 2].map(
    (offset) => galleryPhotos[(start + offset * 3) % galleryPhotos.length]
  );
}

function getRelated(svc: ServiceLanding): ServiceLanding[] {
  return svc.relatedServices
    .map((slug) => serviceLandings.find((s) => s.slug === slug))
    .filter((s): s is ServiceLanding => !!s);
}

export default async function ServiceLandingPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const svc = serviceLandings.find((s) => s.slug === slug);
  if (!svc) notFound();

  const related = getRelated(svc);
  const photos = getServicePhotos(svc.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${svc.name} Hydroseeding`,
    description: svc.heroDescription,
    provider: {
      "@type": "LocalBusiness",
      name: "Hydroseed Solutions",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pittsburgh",
        addressRegion: "PA",
      },
      telephone: "+14128667333",
      url: "https://hydroseed.solutions",
    },
    areaServed: [
      { "@type": "State", name: "Pennsylvania" },
      { "@type": "County", name: "Allegheny County" },
      { "@type": "County", name: "Butler County" },
      { "@type": "County", name: "Washington County" },
      { "@type": "County", name: "Westmoreland County" },
    ],
    url: `https://hydroseed.solutions/services/${svc.slug}`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: svc.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden">
        <Image
          src={svc.heroPhoto}
          alt={svc.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/85 to-surface/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 pt-40 w-full">
          <div className="flex items-center gap-2 text-brand text-sm font-medium mb-4">
            <Link href="/services" className="hover:underline">
              Services
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>{svc.name}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl">
            <span className="text-gradient">{svc.name}</span> Hydroseeding
          </h1>
          <p className="mt-2 text-xl text-text-secondary max-w-2xl">
            {svc.tagline}
          </p>
          <p className="mt-6 text-text-secondary max-w-3xl leading-relaxed">
            {svc.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/get-seeded"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors"
            >
              Get a Free Estimate
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <PhoneLink
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-text-secondary hover:text-brand hover:border-brand transition-colors"
            >
              Call 412-866-SEED
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* ─── The Problem ─── */}
      <section className="py-24 sp">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest text-red-400 uppercase mb-4">
              The Challenge
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {svc.problemTitle}
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              {svc.problemDescription}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {svc.problemPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-5 rounded-xl bg-red-500/5 border border-red-500/10"
              >
                <span className="text-red-400 font-mono text-sm mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Photo Gallery ─── */}
      <section className="py-16 sp border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border col-span-2 md:col-span-1">
              <Image
                src={photos[0]}
                alt={`${svc.name} hydroseeding project`}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
              <Image
                src={photos[1]}
                alt={`Professional ${svc.name.toLowerCase()} application`}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
              <Image
                src={photos[2]}
                alt={`${svc.name} results`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Solution ─── */}
      <section className="py-24 sp bg-surface-raised border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-4">
              Our Approach
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {svc.solutionTitle}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {svc.solutionDescription}
            </p>
          </div>
          <div className="space-y-6">
            {svc.solutionSteps.map((step, i) => (
              <div
                key={i}
                className="flex gap-6 p-6 md:p-8 rounded-2xl bg-surface border border-border"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                  <span className="text-brand font-bold text-sm">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specifications ─── */}
      <section className="py-24 sp border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Gauge className="w-5 h-5 text-brand" />
            <h2 className="text-2xl font-bold">Technical Specifications</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {svc.specifications.map((spec) => (
              <div
                key={spec.label}
                className="p-5 rounded-xl border border-border"
              >
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  {spec.label}
                </p>
                <p className="text-lg font-semibold">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Applications ─── */}
      <section className="py-24 sp bg-surface-raised border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="w-5 h-5 text-brand" />
            <h2 className="text-2xl font-bold">Applications</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {svc.applications.map((app) => (
              <div
                key={app.title}
                className="p-6 rounded-2xl bg-surface border border-border"
              >
                <h3 className="text-lg font-semibold mb-2">{app.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {app.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Photo ─── */}
      <section className="sp border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="relative aspect-[3/1] rounded-3xl overflow-hidden border border-border">
            <Image
              src={photos[1]}
              alt={`Hydroseed Solutions ${svc.name.toLowerCase()} work in Pittsburgh, PA`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <p className="text-xs font-semibold tracking-widest text-brand uppercase mb-2">
                On the Job
              </p>
              <p className="text-xl md:text-2xl font-bold max-w-md">
                Professional {svc.name.toLowerCase()} hydroseeding across Western PA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Hydroseed Solutions ─── */}
      <section className="py-24 sp border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">
            Why Choose Hydroseed Solutions for {svc.name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {svc.whyHydroseed.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 sp bg-surface-raised border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-5 h-5 text-brand" />
            <h2 className="text-2xl font-bold">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {svc.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-surface overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer font-semibold hover:text-brand transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown className="w-4 h-4 text-text-muted shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Related Services ─── */}
      {related.length > 0 && (
        <section className="py-24 sp border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">Related Services</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group p-6 rounded-2xl border border-border hover:border-brand/30 transition-colors"
                >
                  <p className="font-semibold group-hover:text-brand transition-colors">
                    {r.name}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {r.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="py-32 sp bg-brand/5 border-t border-brand/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {svc.ctaTitle}
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            {svc.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-seeded"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors"
            >
              Get Your Free Estimate
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <PhoneLink
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-full hover:border-brand hover:text-brand transition-colors"
            >
              Call 412-866-SEED
            </PhoneLink>
          </div>
        </div>
      </section>
    </>
  );
}
