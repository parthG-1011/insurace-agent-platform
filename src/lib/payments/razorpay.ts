const API = "https://api.razorpay.com/v1";

export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export interface PaymentLink {
  id: string;
  short_url: string;
  status: "created" | "partially_paid" | "paid" | "cancelled" | "expired";
  payments: { payment_id: string; status: string }[] | null;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!razorpayConfigured()) throw new Error("Payments are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)");
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Razorpay: ${body?.error?.description ?? res.statusText}`);
  return body as T;
}

export function createPaymentLink(input: {
  amountInr: number;
  referenceId: string;
  description: string;
  customer: { name: string; contact: string; email: string };
  callbackUrl: string;
  notes: Record<string, string>;
}) {
  return call<PaymentLink>("/payment_links", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountInr * 100,
      currency: "INR",
      accept_partial: false,
      description: input.description.slice(0, 2048),
      reference_id: input.referenceId,
      customer: input.customer,
      // The agent shares the link on WhatsApp, so Razorpay doesn't need to notify.
      notify: { sms: false, email: false },
      reminder_enable: false,
      callback_url: input.callbackUrl,
      callback_method: "get",
      notes: input.notes,
    }),
  });
}

export const fetchPaymentLink = (id: string) => call<PaymentLink>(`/payment_links/${encodeURIComponent(id)}`);
