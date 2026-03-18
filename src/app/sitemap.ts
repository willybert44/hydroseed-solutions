import type { MetadataRoute } from "next";
import suburbs from "@/data/suburbs";
import serviceLandings from "@/data/service-landings";

const BASE = "https://hydroseed.solutions";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/areas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/get-seeded`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/seed-blends`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const servicePages: MetadataRoute.Sitemap = serviceLandings.map((svc) => ({
    url: `${BASE}/services/${svc.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const areaPages: MetadataRoute.Sitemap = suburbs.map((suburb) => ({
    url: `${BASE}/areas/${suburb.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const serviceKeywords = [
    "lawn-installation",
    "grass-seeding",
    "lawn-seeding",
    "new-lawn-planting",
    "hydroseeding",
    "erosion-control",
    "lawn-replacement",
    "yard-grading",
    "finish-grading",
    "lawn-restoration",
  ];

  const areaServicePages: MetadataRoute.Sitemap = suburbs.flatMap((suburb) =>
    serviceKeywords.map((service) => ({
      url: `${BASE}/areas/${suburb.slug}/${service}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticPages, ...servicePages, ...areaPages, ...areaServicePages, ...legalPages];
}
