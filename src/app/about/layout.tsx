import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Hydroseed Solutions | Pittsburgh Hydroseeding Company",
  description:
    "Learn about Hydroseed Solutions — Pittsburgh's premier hydroseeding company. Founded in 2022, we specialize in lawn installation, erosion control, finish grading & custom seed blends across Western PA.",
  keywords: [
    "about Hydroseed Solutions",
    "Pittsburgh hydroseeding company",
    "hydroseeding contractor Pittsburgh",
    "Western PA lawn company",
    "hydroseeding experts Pennsylvania",
  ],
  alternates: {
    canonical: "https://hydroseed.solutions/about",
  },
  openGraph: {
    title: "About Hydroseed Solutions | Pittsburgh Hydroseeding Company",
    description:
      "Founded in 2022 in Pittsburgh. We specialize in hydroseeding, lawn installation, erosion control & custom seed blends across all of Western PA.",
    url: "https://hydroseed.solutions/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
