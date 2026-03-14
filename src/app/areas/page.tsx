import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowUpRight, ChevronRight } from "lucide-react";
import suburbs from "@/data/suburbs";
import PhoneLink from "@/components/PhoneLink";

export const metadata: Metadata = {
  title: "Hydroseeding Service Areas | Pittsburgh & 50+ Western PA Cities",
  description:
    "Hydroseed Solutions serves 50+ communities across Western PA — from Pittsburgh to an hour out. Professional hydroseeding, lawn installation, finish grading & erosion control in Allegheny, Butler, Washington & Westmoreland Counties.",
  keywords: [
    "Pittsburgh hydroseeding",
    "hydroseeding near me",
    "hydroseeding service areas",
    "Allegheny County hydroseeding",
    "Butler County hydroseeding",
    "Washington County hydroseeding",
    "Westmoreland County hydroseeding",
    "Western PA hydroseeding",
    "lawn installation near me",
    "finish grading near me",
    "erosion control near me",
    "grass seeding Pittsburgh area",
  ],
  alternates: {
    canonical: "https://hydroseed.solutions/areas",
  },
  openGraph: {
    title: "Hydroseeding Service Areas | Hydroseed Solutions",
    description:
      "Serving 50+ Western PA communities with professional hydroseeding, lawn installation & erosion control.",
    url: "https://hydroseed.solutions/areas",
    type: "website",
  },
};

const countyOrder = ["Allegheny", "Butler", "Washington", "Westmoreland"];

function groupByCounty() {
  const groups: Record<string, typeof suburbs> = {};
  for (const s of suburbs) {
    if (!groups[s.county]) groups[s.county] = [];
    groups[s.county].push(s);
  }
  // Sort each county group alphabetically
  for (const county of Object.keys(groups)) {
    groups[county].sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

export default function AreasIndexPage() {
  const grouped = groupByCounty();

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="sp pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-brand text-sm font-medium mb-4">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>Service Areas</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            Hydroseeding Across{" "}
            <span className="text-gradient">Greater Pittsburgh</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl">
            We provide professional hydroseeding services to over 50 communities
            across Allegheny, Butler, Washington, and Westmoreland Counties.
            Find your area below.
          </p>

          {/* Hero Photo Strip */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
              <Image
                src="/images/photos/photo-residential-houses-hydroseeded-lawn-2024-04-17.jpg"
                alt="Hydroseeded lawn in Pittsburgh neighborhood"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
              <Image
                src="/images/photos/photo-hydroseeding-erosion-control-hillside-2024-04-09.jpg"
                alt="Erosion control hydroseeding on hillside"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border">
              <Image
                src="/images/photos/photo-backyard-lawn-hydroseeding-2025-08-13.jpg"
                alt="Backyard lawn hydroseeding project"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── County Groups ─── */}
      {countyOrder.map((county) => {
        const areas = grouped[county];
        if (!areas) return null;
        return (
          <section
            key={county}
            className="border-t border-border"
          >
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="w-5 h-5 text-brand" />
                <h2 className="text-2xl font-bold">{county} County</h2>
                <span className="text-sm text-text-muted">
                  ({areas.length} areas)
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {areas.map((area) => (
                  <Link
                    key={area.slug}
                    href={`/areas/${area.slug}`}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-border hover:border-brand/40 hover:bg-surface-raised transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold group-hover:text-brand transition-colors">
                        {area.name}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {area.distance} of Pittsburgh · {area.zip}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand shrink-0 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ─── CTA ─── */}
      <section className="py-32 sp bg-brand/5 border-t border-brand/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don&apos;t See Your Area?
          </h2>
          <p className="text-text-secondary mb-8">
            We likely serve your community too. Contact us to confirm coverage
            and get a free estimate for your hydroseeding project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-seeded"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors"
            >
              Get a Free Estimate
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <PhoneLink
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-full hover:border-brand hover:text-brand transition-colors"
            >
              Call 724-866-SEED
            </PhoneLink>
          </div>
        </div>
      </section>
    </>
  );
}
