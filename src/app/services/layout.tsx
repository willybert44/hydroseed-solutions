import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hydroseeding Services | Lawn Installation, Grading & Erosion Control | Pittsburgh PA",
  description:
    "Full-service hydroseeding in Pittsburgh & Western PA. Residential lawn installation, finish grading, erosion control, slope stabilization, commercial hydroseeding, custom seed blending & more. Free estimates — 412-866-SEED.",
  keywords: [
    "hydroseeding services Pittsburgh",
    "lawn installation Pittsburgh",
    "finish grading services",
    "yard grading Pittsburgh",
    "erosion control services Pittsburgh",
    "slope stabilization Pittsburgh",
    "commercial hydroseeding",
    "residential hydroseeding",
    "lawn renovation Pittsburgh",
    "grass seeding services",
    "site preparation grading",
    "custom seed blending",
    "overseeding Pittsburgh",
  ],
  alternates: {
    canonical: "https://hydroseed.solutions/services",
  },
  openGraph: {
    title: "Hydroseeding Services | Hydroseed Solutions Pittsburgh",
    description:
      "Residential & commercial hydroseeding, lawn installation, finish grading, erosion control & custom seed blends across Western PA.",
    url: "https://hydroseed.solutions/services",
    type: "website",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
