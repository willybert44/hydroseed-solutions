/** Shared Zoho OAuth helper — returns a fresh access token */
export async function getZohoAccessToken(): Promise<string> {
  const res = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
    { method: 'POST' }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoho OAuth failed: ${text}`);
  }

  const { access_token } = await res.json();
  if (!access_token) throw new Error('No access_token in Zoho response');
  return access_token;
}
