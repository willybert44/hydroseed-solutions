/**
 * Fires a Google Ads conversion event.
 *
 * Usage:
 *   import { trackConversion } from "@/lib/gtag";
 *   trackConversion("AW-123456789/AbCdEfGhIjK");
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackConversion(conversionLabel: string, value?: number) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: conversionLabel,
    ...(value != null && { value, currency: "USD" }),
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
