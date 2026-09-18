export const formatAmount = (n: number) => Math.round(n).toLocaleString("en-IN");

export const formatINR = (n: number) => `₹${formatAmount(n)}`;

/** ₹1 Cr, ₹50 L, ₹75,000 — how Indian agents talk about cover amounts. */
export function formatCover(n: number, symbol = "₹"): string {
  if (n >= 10_000_000) return `${symbol}${+(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `${symbol}${+(n / 100_000).toFixed(2)} L`;
  return `${symbol}${formatAmount(n)}`;
}

export const formatTerm = (years: number) => (years === 1 ? "1 year" : `${years} years`);

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" && value.length === 10 ? new Date(`${value}T00:00:00Z`) : new Date(value);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

export function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}
