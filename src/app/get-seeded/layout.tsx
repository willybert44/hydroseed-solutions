import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Free Hydroseeding Estimate | Pittsburgh & Western PA",
  description:
    "Get an instant hydroseeding estimate in under 2 minutes. Residential project planner or commercial RFQ. Lawn installation, finish grading, erosion control & more. Serving all of Western Pennsylvania.",
  keywords: [
    "hydroseeding estimate",
    "hydroseeding quote Pittsburgh",
    "lawn installation quote",
    "hydroseeding cost",
    "hydroseeding price per square foot",
    "free hydroseeding estimate",
    "commercial hydroseeding quote",
    "erosion control estimate",
    "finish grading quote Pittsburgh",
  ],
  alternates: {
    canonical: "https://hydroseed.solutions/get-seeded",
  },
  openGraph: {
    title: "Get a Free Hydroseeding Estimate | Hydroseed Solutions",
    description:
      "Instant hydroseeding estimates for residential & commercial projects. Lawn installation, grading, erosion control across Western PA.",
    url: "https://hydroseed.solutions/get-seeded",
    type: "website",
  },
};

export default function GetSeededLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
