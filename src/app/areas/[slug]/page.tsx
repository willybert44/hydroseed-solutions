import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PhoneLink from "@/components/PhoneLink";
import {
  ArrowUpRight,
  MapPin,
  Users,
  Ruler,
  TreePine,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Quote,
} from "lucide-react";
import suburbs, { type SuburbData } from "@/data/suburbs";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return suburbs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const suburb = suburbs.find((s) => s.slug === slug);
  if (!suburb) return {};
  return {
    title: `Hydroseeding ${suburb.name} PA | Lawn Installation & Erosion Control`,
    description: `Professional hydroseeding in ${suburb.name}, ${suburb.county} County PA. Lawn installation, finish grading, erosion control & custom seed blends. Serving ${suburb.name} and surrounding Pittsburgh suburbs. Free estimates — 412-866-SEED.`,
    keywords: [
      `hydroseeding ${suburb.name}`,
      `hydroseed ${suburb.name} PA`,
      `lawn installation ${suburb.name}`,
      `lawn seeding ${suburb.name}`,
      `grass seeding ${suburb.name}`,
      `finish grading ${suburb.name}`,
      `yard grading ${suburb.name}`,
      `erosion control ${suburb.name}`,
      `landscaping ${suburb.name} PA`,
      "hydroseeding near me",
      "Pittsburgh hydroseeding",
      `${suburb.county} County hydroseeding`,
    ],
    alternates: {
      canonical: `https://hydroseed.solutions/areas/${suburb.slug}`,
    },
    openGraph: {
      title: `Hydroseeding in ${suburb.name} | Hydroseed Solutions`,
      description: `${suburb.name}'s trusted hydroseeding experts. Lawn installation, erosion control, finish grading & custom seed blends.`,
      url: `https://hydroseed.solutions/areas/${suburb.slug}`,
      type: "website",
    },
  };
}

function getNeighbors(suburb: SuburbData): SuburbData[] {
  return suburb.neighboringAreas
    .map((slug) => suburbs.find((s) => s.slug === slug))
    .filter((s): s is SuburbData => !!s);
}

const photos = [
  "/images/photos/photo-hydroseeding-hillside-2024-05-07.jpg",
  "/images/photos/photo-construction-site-hydroseeding-kohler-generator-2024-05-07.jpg",
  "/images/photos/photo-backyard-hydroseeding.jpg",
  "/images/photos/photo-residential-houses-hydroseeded-lawn-2024-04-17.jpg",
  "/images/photos/photo-lawn-hydroseeding-residential-backyard.jpg",
  "/images/photos/photo-backyard-lawn-hydroseeding-2025-08-13.jpg",
  "/images/photos/photo-backyard-landscaping-swimming-pool-2025-08-13.jpg",
  "/images/photos/photo-hydroseeding-lawn-2025-10-03.jpg",
  "/images/photos/photo-hydroseeding-erosion-control-hillside-2024-04-09.jpg",
  "/images/photos/photo-hydroseeding-landscaping-house-2025-10-28.jpg",
  "/images/photos/photo-worker-hydroseeding-landscaping.jpg",
  "/images/photos/photo-hydroseed-lawn-backyard-landscaping.jpg",
];

function getSuburbPhoto(slug: string, index: number): string {
  // Deterministic photo assignment based on slug hash
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return photos[Math.abs(hash + index) % photos.length];
}

export default async function SuburbPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const suburb = suburbs.find((s) => s.slug === slug);
  if (!suburb) notFound();

  const neighbors = getNeighbors(suburb);
  const heroPhoto = getSuburbPhoto(suburb.slug, 0);
  const secondPhoto = getSuburbPhoto(suburb.slug, 3);
  const thirdPhoto = getSuburbPhoto(suburb.slug, 7);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Hydroseed Solutions",
    description: `Professional hydroseeding, lawn installation, finish grading & erosion control in ${suburb.name}, ${suburb.county} County PA`,
    url: `https://hydroseed.solutions/areas/${suburb.slug}`,
    areaServed: {
      "@type": "City",
      name: suburb.name,
      containedInPlace: {
        "@type": "State",
        name: "Pennsylvania",
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pittsburgh",
      addressRegion: "PA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.4406,
      longitude: -79.9959,
    },
    telephone: "+14128667333",
    priceRange: "$$",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Hydroseeding Services in ${suburb.name}`,
      itemListElement: suburb.commonProjects.map((project) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: project,
        },
      })),
    },
    review: {
      "@type": "Review",
      reviewBody: suburb.testimonialQuote,
      author: {
        "@type": "Person",
        name: suburb.testimonialName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://hydroseed.solutions",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Service Areas",
        item: "https://hydroseed.solutions/areas",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: suburb.name,
        item: `https://hydroseed.solutions/areas/${suburb.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <Image
          src={heroPhoto}
          alt={`Hydroseeding project in ${suburb.name}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 pt-40 w-full">
          <div className="flex items-center gap-2 text-brand text-sm font-medium mb-4">
            <Link href="/areas" className="hover:underline">
              Service Areas
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>{suburb.county} County</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Hydroseeding in{" "}
            <span className="text-gradient">{suburb.name}</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl">
            {suburb.description}
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

      {/* ─── Quick Facts ─── */}
      <section className="border-y border-border bg-surface-raised">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Location
                </p>
                <p className="text-sm font-medium">
                  {suburb.distance} of Pittsburgh
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Population
                </p>
                <p className="text-sm font-medium">{suburb.population}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Ruler className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  County
                </p>
                <p className="text-sm font-medium">{suburb.county} County</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TreePine className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  ZIP Code
                </p>
                <p className="text-sm font-medium">{suburb.zip}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Terrain & Soil Conditions ─── */}
      <section className="py-24 sp">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {suburb.name} Terrain & Soil Conditions
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                {suburb.terrain}
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-raised border border-border">
                <CalendarCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">
                    Seasonal Timing for {suburb.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {suburb.seasonalNote}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={secondPhoto}
                alt={`Hydroseeding terrain in ${suburb.name}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Common Projects ─── */}
      <section className="py-24 sp bg-surface-raised border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">
            Popular Hydroseeding Projects in {suburb.name}
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            Based on our extensive experience working in {suburb.name}, these
            are the most common project types we handle for homeowners and
            contractors in this area.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suburb.commonProjects.map((project) => (
              <div
                key={project}
                className="p-6 rounded-2xl bg-surface border border-border hover:border-brand/30 transition-colors"
              >
                <CheckCircle2 className="w-6 h-6 text-brand mb-3" />
                <p className="font-semibold">{project}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonial ─── */}
      <section className="py-24 sp border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Quote className="w-10 h-10 text-brand/30 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6">
            &ldquo;{suburb.testimonialQuote}&rdquo;
          </blockquote>
          <p className="text-text-secondary">
            — {suburb.testimonialName}
          </p>
        </div>
      </section>

      {/* ─── Project Photo ─── */}
      <section className="sp border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="relative aspect-[5/2] rounded-3xl overflow-hidden border border-border">
            <Image
              src={thirdPhoto}
              alt={`Completed hydroseeding project near ${suburb.name}`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ─── Why Hydroseed in [Suburb] ─── */}
      <section className="py-24 sp bg-surface-raised border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">
            Why {suburb.name} Homeowners Choose Hydroseed Solutions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Local Expertise",
                text: `We've completed dozens of projects in ${suburb.name} and understand the unique soil, terrain, and climate conditions of ${suburb.county} County.`,
              },
              {
                title: "Cost-Effective Results",
                text: `Hydroseeding costs 60-70% less than sod installation while providing deeper root development and a lawn uniquely adapted to ${suburb.name}'s growing conditions.`,
              },
              {
                title: "Fast Turnaround",
                text: `Most ${suburb.name} residential projects are completed in a single day. You'll see visible green growth within 5-7 days and a fully established lawn in 3-4 weeks.`,
              },
              {
                title: "Custom Seed Selection",
                text: `Every ${suburb.name} property gets a seed blend specifically formulated for its sun/shade exposure, soil type, and intended use — no generic mixes.`,
              },
              {
                title: "Erosion Prevention",
                text: `${suburb.name}'s terrain demands proper erosion control. Our bonded fiber matrix applications hold soil on even the steepest slopes while vegetation establishes.`,
              },
              {
                title: "Guaranteed Germination",
                text: `We stand behind every application with our germination guarantee. If it doesn't grow, we come back — no questions asked. That's our promise to ${suburb.name} customers.`,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-surface border border-border"
              >
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Top Services in [Suburb] ─── */}
      <section className="py-24 sp border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">
            More Services in {suburb.name}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { slug: 'lawn-installation', title: 'Lawn Installation' },
              { slug: 'grass-seeding', title: 'Grass Seeding' },
              { slug: 'lawn-seeding', title: 'Lawn Seeding' },
              { slug: 'new-lawn-planting', title: 'New Lawn Planting' },
            ].map((service) => (
              <Link
                key={service.slug}
                href={`/areas/${suburb.slug}/${service.slug}`}
                className="p-4 rounded-xl border border-border bg-surface hover:border-brand hover:shadow-[0_0_0_1px_rgba(205,249,58,0.2)] transition-all group flex items-center justify-between"
              >
                <span className="font-medium text-text-secondary group-hover:text-brand transition-colors">
                  {service.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Nearby Areas ─── */}
      {neighbors.length > 0 && (
        <section className="py-24 sp border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">
              We Also Serve Nearby Areas
            </h2>
            <div className="flex flex-wrap gap-3">
              {neighbors.map((n) => (
                <Link
                  key={n.slug}
                  href={`/areas/${n.slug}`}
                  className="px-4 py-2 rounded-full border border-border text-sm hover:border-brand hover:text-brand transition-colors"
                >
                  {n.name}
                </Link>
              ))}
              <Link
                href="/areas"
                className="px-4 py-2 rounded-full border border-border text-sm text-text-muted hover:border-brand hover:text-brand transition-colors"
              >
                View All Areas →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="py-32 sp bg-brand/5 border-t border-brand/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your {suburb.name} Property?
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Get an instant estimate for your hydroseeding project. Most{" "}
            {suburb.name} residential properties can be completed in a single
            day.
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
