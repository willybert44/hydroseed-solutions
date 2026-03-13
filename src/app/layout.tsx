import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GoogleTag from "@/components/GoogleTag";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hydroseed.solutions"),
  title: {
    default: "Hydroseed Solutions | Professional Hydroseeding in Pittsburgh & Western PA",
    template: "%s | Hydroseed Solutions",
  },
  description:
    "Pittsburgh's premier hydroseeding company serving all of Western Pennsylvania. Lawn installation, finish grading, erosion control, slope stabilization & custom seed blends. Free estimates — call 412-866-SEED.",
  keywords: [
    "hydroseeding",
    "hydroseeding Pittsburgh",
    "hydroseeding near me",
    "lawn installation Pittsburgh",
    "grass seeding",
    "lawn seeding",
    "finish grading",
    "yard grading",
    "erosion control",
    "slope stabilization",
    "seed blends",
    "hydroseed contractor",
    "Western PA hydroseeding",
    "Allegheny County hydroseeding",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Hydroseed Solutions",
    title: "Hydroseed Solutions | Professional Hydroseeding in Pittsburgh & Western PA",
    description:
      "Pittsburgh's premier hydroseeding company. Lawn installation, erosion control, finish grading & custom seed blends across Western Pennsylvania. Free estimates.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hydroseed Solutions | Pittsburgh Hydroseeding",
    description:
      "Professional hydroseeding, lawn installation & erosion control across Western PA. Free estimates — 412-866-SEED.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://hydroseed.solutions",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Hydroseed Solutions",
    description:
      "Professional hydroseeding company serving Pittsburgh and all of Western Pennsylvania. Lawn installation, finish grading, erosion control, slope stabilization & custom seed blends.",
    url: "https://hydroseed.solutions",
    telephone: "+14128667333",
    email: "hello@hydroseed.solutions",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pittsburgh",
      addressRegion: "PA",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.4406,
      longitude: -79.9959,
    },
    areaServed: [
      { "@type": "County", name: "Allegheny County, PA" },
      { "@type": "County", name: "Butler County, PA" },
      { "@type": "County", name: "Washington County, PA" },
      { "@type": "County", name: "Westmoreland County, PA" },
    ],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "18:00",
    },
    sameAs: [],
  };

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <GoogleTag />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="noise-bg" />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
