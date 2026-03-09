import Script from "next/script";

/**
 * Replace these with your real IDs:
 *   GA_MEASUREMENT_ID  → from Google Analytics (e.g. "G-XXXXXXXXXX")
 *   AW_CONVERSION_ID   → from Google Ads       (e.g. "AW-123456789")
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const AW_CONVERSION_ID = process.env.NEXT_PUBLIC_AW_ID ?? "";

export default function GoogleTag() {
  if (!GA_MEASUREMENT_ID && !AW_CONVERSION_ID) return null;

  const primaryId = GA_MEASUREMENT_ID || AW_CONVERSION_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ""}
          ${AW_CONVERSION_ID ? `gtag('config', '${AW_CONVERSION_ID}');` : ""}
        `}
      </Script>
    </>
  );
}
