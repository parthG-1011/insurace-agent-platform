/** Normalises an Indian mobile number to 91XXXXXXXXXX (the format wa.me expects), or null. */
export function normalizeIndianPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : null;
}

export const formatPhone = (normalized: string) => `+91 ${normalized.slice(2, 7)} ${normalized.slice(7)}`;
