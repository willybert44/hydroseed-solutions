/**
 * Shared email helpers — branded HTML templates for Resend.
 * Domain: hydroseed.solutions (verified)
 */

export const EMAIL_FROM = "Hydroseed Solutions <hello@hydroseed.solutions>";
export const EMAIL_FROM_BOOKINGS = "Hydroseed Solutions <bookings@hydroseed.solutions>";
export const EMAIL_TO_INTERNAL = "jimmy@hydroseed.solutions";

const BRAND = "#00c898";
const BRAND_LIGHT = "#f0fdf9";
const BORDER = "#d1fae5";
const TEXT = "#1a1a1a";
const TEXT_MUTED = "#666666";
const BG = "#fafafa";

/** Wrap content in the standard branded email shell */
export function emailLayout(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <!-- Header bar -->
        <tr><td style="background:${BRAND};padding:20px 32px;text-align:center;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">HYDROSEED SOLUTIONS</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:${TEXT};font-size:15px;line-height:1.6;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;font-size:12px;color:${TEXT_MUTED};">
          <p style="margin:0 0 4px;">Hydroseed Solutions &middot; Pittsburgh &amp; Western PA</p>
          <p style="margin:0;"><a href="tel:+17248667333" style="color:${BRAND};text-decoration:none;">(724) 866-7333</a> &middot; <a href="mailto:hello@hydroseed.solutions" style="color:${BRAND};text-decoration:none;">hello@hydroseed.solutions</a></p>
          <p style="margin:8px 0 0;"><a href="https://hydroseed.solutions" style="color:${BRAND};text-decoration:none;">hydroseed.solutions</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** A styled detail card block */
export function detailCard(rows: string): string {
  return `<div style="background:${BRAND_LIGHT};border:1px solid ${BORDER};border-radius:12px;padding:16px;margin:16px 0;">${rows}</div>`;
}

/** Single row inside a detail card */
export function detailRow(label: string, value: string): string {
  return `<p style="margin:4px 0;font-size:14px;"><strong style="color:${TEXT};">${label}:</strong> <span style="color:${TEXT};">${value}</span></p>`;
}

/** A branded CTA button */
export function ctaButton(href: string, text: string): string {
  return `<div style="text-align:center;margin:24px 0;"><a href="${href}" style="display:inline-block;padding:12px 28px;background:${BRAND};color:#ffffff;font-weight:600;font-size:14px;border-radius:10px;text-decoration:none;">${text}</a></div>`;
}

/** Muted paragraph */
export function mutedText(text: string): string {
  return `<p style="color:${TEXT_MUTED};font-size:13px;margin-top:20px;">${text}</p>`;
}
