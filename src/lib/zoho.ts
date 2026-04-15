/** Shared Zoho OAuth helper — returns a cached or fresh access token */
let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getZohoAccessToken(): Promise<string> {
  // Reuse token if it has at least 2 minutes of life left
  if (cachedToken && Date.now() < cachedToken.expiresAt - 120_000) {
    return cachedToken.value;
  }

  const res = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
    { method: 'POST' }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoho OAuth failed: ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error('No access_token in Zoho response');

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}
