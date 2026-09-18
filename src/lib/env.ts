/** Public base URL used in links sent to customers (PDF, payment callback). */
export function getAppUrl(): string {
  const explicit = process.env.APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
