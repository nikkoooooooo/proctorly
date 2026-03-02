type PaymongoCustomer = {
  id: string;
};

type PaymongoSubscription = {
  id: string;
  status?: string;
  latest_invoice?: {
    payment_intent?: {
      id?: string;
      client_key?: string;
      next_action?: {
        redirect?: {
          url?: string;
        };
      };
    };
  };
};

type CreateSubscriptionInput = {
  customerName: string;
  customerEmail: string;
  paymongoPlanId: string;
};

type CreateSubscriptionResult = {
  subscriptionId: string;
  status: string | null;
  paymentIntentId: string | null;
  paymentIntentClientKey: string | null;
  nextActionUrl: string | null;
  customerId: string;
};

type CreateLinkInput = {
  amount: number;
  description: string;
  remarks?: string;
  currency: string;
};

type CreateLinkResult = {
  linkId: string;
  checkoutUrl: string | null;
  referenceNumber: string | null;
  status: string | null;
};

type PaymongoSignatureParts = {
  timestamp: string;
  testSignature: string | null;
  liveSignature: string | null;
};

const PAYMONGO_BASE_URL =
  process.env.PAYMONGO_BASE_URL || "https://api.paymongo.com/v1";

const WEBHOOK_TOLERANCE_SECONDS = 300;

function getAuthHeader() {
  const secret = process.env.PAYMONGO_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing PAYMONGO_SECRET_KEY");
  }
  const token = Buffer.from(`${secret}:`).toString("base64");
  return `Basic ${token}`;
}

async function paymongoRequest(path: string, body: unknown) {
  const res = await fetch(`${PAYMONGO_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const detail =
      data?.errors?.[0]?.detail ||
      data?.errors?.[0]?.code ||
      "PayMongo request failed";
    throw new Error(detail);
  }

  return data;
}

function parsePaymongoSignatureHeader(header: string): PaymongoSignatureParts {
  const parts = header.split(",").map((part) => part.trim());
  let timestamp = "";
  let testSignature: string | null = null;
  let liveSignature: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value || "";
    if (key === "te") testSignature = value || null;
    if (key === "li") liveSignature = value || null;
  }

  return { timestamp, testSignature, liveSignature };
}

export function verifyPaymongoSignature(rawBody: string, header: string) {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing PAYMONGO_WEBHOOK_SECRET");
  }

  const { timestamp, testSignature, liveSignature } =
    parsePaymongoSignatureHeader(header);
  if (!timestamp) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const timestampSeconds = Number(timestamp);
  if (Number.isFinite(timestampSeconds)) {
    const age = Math.abs(nowSeconds - timestampSeconds);
    if (age > WEBHOOK_TOLERANCE_SECONDS) return false;
  }

  const mode = (process.env.PAYMONGO_WEBHOOK_MODE || "test").toLowerCase();
  const expectedSignature = mode === "live" ? liveSignature : testSignature;
  if (!expectedSignature) return false;

  const crypto = require("crypto") as typeof import("crypto");
  const signedPayload = `${timestamp}.${rawBody}`;
  const computed = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(expectedSignature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function createPaymongoSubscription({
  customerName,
  customerEmail,
  paymongoPlanId,
}: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
  const customerRes = await paymongoRequest("/customers", {
    data: {
      attributes: {
        name: customerName,
        email: customerEmail,
      },
    },
  });

  const customer = customerRes?.data as PaymongoCustomer | undefined;
  if (!customer?.id) {
    throw new Error("Failed to create PayMongo customer");
  }

  const subscriptionRes = await paymongoRequest("/subscriptions", {
    data: {
      attributes: {
        customer_id: customer.id,
        plan_id: paymongoPlanId,
      },
    },
  });

  const subscription = subscriptionRes?.data as PaymongoSubscription | undefined;
  if (!subscription?.id) {
    throw new Error("Failed to create PayMongo subscription");
  }

  const paymentIntent = subscription.latest_invoice?.payment_intent;

  return {
    subscriptionId: subscription.id,
    status: subscription.status ?? null,
    paymentIntentId: paymentIntent?.id ?? null,
    paymentIntentClientKey: paymentIntent?.client_key ?? null,
    nextActionUrl: paymentIntent?.next_action?.redirect?.url ?? null,
    customerId: customer.id,
  };
}

export async function createPaymongoLink({
  amount,
  description,
  remarks,
  currency,
}: CreateLinkInput): Promise<CreateLinkResult> {
  const linkRes = await paymongoRequest("/links", {
    data: {
      attributes: {
        amount,
        description,
        remarks,
        currency,
      },
    },
  });

  const link = linkRes?.data as
    | {
        id?: string;
        attributes?: {
          checkout_url?: string;
          reference_number?: string;
          status?: string;
        };
      }
    | undefined;

  if (!link?.id) {
    throw new Error("Failed to create PayMongo payment link");
  }

  return {
    linkId: link.id,
    checkoutUrl: link.attributes?.checkout_url ?? null,
    referenceNumber: link.attributes?.reference_number ?? null,
    status: link.attributes?.status ?? null,
  };
}
