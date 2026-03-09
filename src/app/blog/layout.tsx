import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hydroseeding Blog | Lawn Care Tips, Erosion Control & Project Spotlights",
  description:
    "Expert articles on hydroseeding, lawn installation, erosion control, seed science & project case studies from Pittsburgh's premier hydroseeding company. Tips for Western PA homeowners and contractors.",
  keywords: [
    "hydroseeding blog",
    "lawn care tips Pittsburgh",
    "erosion control guide",
    "hydroseeding vs sod",
    "grass seed tips Pennsylvania",
    "lawn installation guide",
    "slope erosion prevention",
    "native grass seeding",
  ],
  alternates: {
    canonical: "https://hydroseed.solutions/blog",
  },
  openGraph: {
    title: "Hydroseeding Blog | Hydroseed Solutions",
    description:
      "Expert articles on hydroseeding, lawn care, erosion control & seed science from Pittsburgh's premier hydroseeding company.",
    url: "https://hydroseed.solutions/blog",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
