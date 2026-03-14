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

type Params = Promise<{ slug: string; service: string }>;

const serviceMap: Record<string, { title: string; keyword: string }> = {
  "lawn-installation": { title: "Lawn Installation", keyword: "lawn installation" },
  "grass-seeding": { title: "Grass Seeding", keyword: "grass seeding" },
  "lawn-seeding": { title: "Lawn Seeding", keyword: "lawn seeding" },
  "new-lawn-planting": { title: "New Lawn Planting", keyword: "new lawn planting" }
};

export async function generateStaticParams() {
  const params: { slug: string; service: string }[] = [];
  const services = Object.keys(serviceMap);
  for (const s of suburbs) {
    for (const service of services) {
      params.push({ slug: s.slug, service });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, service } = await params;
  const suburb = suburbs.find((s) => s.slug === slug);
  const serviceData = serviceMap[service];
  
  if (!suburb || !serviceData) return {};
  
  return {
    title: `${serviceData.title} in ${suburb.name} PA | Hydroseed Solutions`,
    description: `Professional ${serviceData.keyword} services in ${suburb.name}, ${suburb.county} County PA. High-quality hydroseeding, finish grading & erosion control. Free estimates — 724-866-SEED.`,
    keywords: [
      `${serviceData.keyword} ${suburb.name}`,
      `${serviceData.keyword} ${suburb.name} PA`,
      `hydroseeding ${suburb.name}`,
      `hydroseed ${suburb.name} PA`,
      `finish grading ${suburb.name}`,
      `${suburb.county} County ${serviceData.keyword}`,
    ],
    alternates: {
      canonical: `https://hydroseed.solutions/areas/${suburb.slug}/${service}`,
    },
    openGraph: {
      title: `${serviceData.title} in ${suburb.name} | Hydroseed Solutions`,
      description: `${suburb.name}'s trusted experts for ${serviceData.keyword}. Fast, affordable, and vibrant results.`,
      url: `https://hydroseed.solutions/areas/${suburb.slug}/${service}`,
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
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return photos[Math.abs(hash + index) % photos.length];
}

export default async function AreaServicePage({ params }: { params: Params }) {
  const { slug, service } = await params;
  const suburb = suburbs.find((s) => s.slug === slug);
  const serviceData = serviceMap[service];
  
  if (!suburb || !serviceData) notFound();

  const neighbors = getNeighbors(suburb);
  const heroPhoto = getSuburbPhoto(suburb.slug + service, 0);
  const secondPhoto = getSuburbPhoto(suburb.slug + service, 3);
  const thirdPhoto = getSuburbPhoto(suburb.slug + service, 7);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Hydroseed Solutions",
    description: `Professional ${serviceData.keyword} & hydroseeding in ${suburb.name}, ${suburb.county} County PA`,
    url: `https://hydroseed.solutions/areas/${suburb.slug}/${service}`,
    areaServed: {
      "@type": "City",
      name: suburb.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <Image
          src={heroPhoto}
          alt={`${serviceData.title} project in ${suburb.name}`}
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
            <Link href={`/areas/${suburb.slug}`} className="hover:underline">
              {suburb.name}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="capitalize">{serviceData.title}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            {serviceData.title} in{" "}
            <span className="text-gradient">{suburb.name}</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl">
            {suburb.description} Looking for {serviceData.keyword}? Hydroseed Solutions provides comprehensive application strategies tailored perfectly to {suburb.name}'s unique local environment.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/get-seeded"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-brand text-surface font-semibold rounded-full hover:bg-brand-light transition-colors"
            >
              Get a Free Estimate
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="border-y border-border bg-surface-raised">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium">{suburb.distance} of PGH</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Population</p>
                <p className="text-sm font-medium">{suburb.population}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TreePine className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Terrain</p>
                <p className="text-sm font-medium line-clamp-1">{suburb.terrain.split('.')[0]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-5 h-5 text-brand shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Local Note</p>
                <p className="text-sm font-medium line-clamp-1 truncate">{suburb.seasonalNote.split('.')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold mb-6">Expert {serviceData.title} for {suburb.name} Properties</h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-8">
                {suburb.terrain}
              </p>
              <div className="my-12">
                <Image
                  src={secondPhoto}
                  alt={`${serviceData.title} in ${suburb.name}, PA`}
                  width={800}
                  height={500}
                  className="rounded-2xl w-full object-cover h-[400px]"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">Why Choose Us for {serviceData.title}?</h3>
              <p className="text-text-secondary mb-6">
                Not all <strong>{serviceData.keyword}</strong> techniques are created equally. Our proprietary hydroseeding slurry binds tightly to the soil, ensuring faster germination and significantly better protection against washouts than traditional methods. 
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Grows in faster than traditional dry seeding",
                  "Significantly more cost-effective than laying sod",
                  "Customized seed blends explicitly picked for Allegheny/regional conditions",
                  "Built-in soil erosion and weed control properties"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-2xl font-bold mb-4">Local Insight: {suburb.name}</h3>
              <div className="bg-surface-raised border border-border p-8 rounded-2xl mb-8">
                <blockquote className="text-lg italic text-text-secondary border-l-4 border-brand pl-4">
                  "{suburb.seasonalNote}"
                </blockquote>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Common Tasks / Services in Suburb */}
              <div className="p-8 rounded-3xl bg-surface-raised border border-border">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-brand" />
                  Common Projects Here
                </h3>
                <ul className="space-y-4 text-text-secondary">
                  {suburb.commonProjects.map((project, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                      {project}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Service Links Box */}
              <div className="p-8 rounded-3xl bg-surface border border-border">
                <h3 className="text-lg font-bold mb-6">More Services in {suburb.name}</h3>
                <ul className="space-y-3">
                   <li>
                     <Link href={`/areas/${suburb.slug}`} className="text-text-secondary hover:text-brand transition-colors block py-2 border-b border-border/50">
                        Hydroseeding
                     </Link>
                   </li>
                   {Object.entries(serviceMap).map(([key, data]) => {
                     // don't link to the current service we are on
                     if (key === service) return null;
                     return (
                       <li key={key}>
                         <Link href={`/areas/${suburb.slug}/${key}`} className="text-text-secondary hover:text-brand transition-colors block py-2 border-b border-border/50">
                           {data.title}
                         </Link>
                       </li>
                     );
                   })}
                </ul>
              </div>

              {/* Testimonial */}
              <div className="p-8 rounded-3xl bg-surface-raised border border-border relative overflow-hidden">
                <Quote className="absolute top-4 right-4 w-24 h-24 text-surface rotate-12 opacity-50" />
                <div className="relative z-10">
                  <p className="text-text-secondary italic mb-6">
                    &quot;{suburb.testimonialQuote}&quot;
                  </p>
                  <div>
                    <p className="font-semibold text-text">{suburb.testimonialName}</p>
                    <p className="text-sm text-text-muted">
                      {suburb.name} Resident
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-brand text-surface relative overflow-hidden">
        <Image
          src={thirdPhoto}
          alt={`Commercial hydroseeding in ${suburb.name}`}
          fill
          className="object-cover opacity-20 mix-blend-multiply"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to upgrade your {suburb.name} property?
          </h2>
          <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
            Our established {serviceData.keyword} process is specifically optimized for Pennsylvania's unpredictable terrain. Get an upfront estimate and fast scheduling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/get-seeded"
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-surface text-brand font-bold rounded-full hover:bg-white transition-colors"
            >
              Request Quick Quote
            </Link>
            <PhoneLink
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 border-2 border-surface/30 rounded-full hover:bg-surface/10 transition-colors"
            >
              Call 724-866-SEED
            </PhoneLink>
          </div>
        </div>
      </section>

      {/* Neighboring Areas */}
      {neighbors.length > 0 && (
        <section className="border-t border-border bg-surface-raised py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8">
              Also Serving Near {suburb.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {neighbors.map((n) => (
                <Link
                  key={n.slug}
                  href={`/areas/${n.slug}/${service}`}
                  className="p-4 rounded-xl border border-border bg-surface hover:border-brand hover:shadow-[0_0_0_1px_rgba(205,249,58,0.2)] transition-all group flex items-center justify-between"
                >
                  <span className="font-medium text-text-secondary group-hover:text-text transition-colors">
                    {n.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
