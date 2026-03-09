import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Hydroseeding Seed Blends | Pittsburgh PA",
  description:
    "Lab-formulated seed blends for every condition — sun, shade, slopes, wet areas & wildflower meadows. Engineered for Western PA soil and climate. Kentucky Bluegrass, Fescue, Ryegrass & native species.",
  keywords: [
    "custom seed blends Pittsburgh",
    "hydroseeding seed mix",
    "Kentucky Bluegrass blend",
    "shade grass seed",
    "erosion control seed mix",
    "slope seed blend",
    "native wildflower seed Pittsburgh",
    "lawn grass seed Pennsylvania",
    "fescue seed blend",
    "drought tolerant grass seed PA",
  ],
  alternates: {
    canonical: "https://hydroseed.solutions/seed-blends",
  },
  openGraph: {
    title: "Custom Hydroseeding Seed Blends | Hydroseed Solutions",
    description:
      "6 lab-formulated seed blends engineered for Western PA conditions. From residential lawns to erosion-control slopes.",
    url: "https://hydroseed.solutions/seed-blends",
    type: "website",
  },
};

export default function SeedBlendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
