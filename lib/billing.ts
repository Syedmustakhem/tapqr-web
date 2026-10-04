import {
  apiRequest,
  ApiError,
} from "@/lib/api";

/* ============================================================
   PLAN CODES
============================================================ */

export type PlanCode =
  | "FREE"
  | "PRO_MONTHLY"
  | "PRO_YEARLY";

/* ============================================================
   BILLING STATUS
============================================================ */

export type BillingPlan = {
  code: string;
  name: string;
  features?: string[];
};

export type BillingSubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

export type BillingSubscription = {
  status: string;
  planCode: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
};

export type BillingLimits = {
  maxQrs: number;
  maxBusinesses: number;
  maxSeats: number;
};

export type BillingUsage = {
  qrCount: number;
  businessCount: number;
};

export type BillingPayment = {
  id: string;
  amountPaise: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type BillingStatusData = {
  plan: BillingPlan;
  subscription: BillingSubscription | null;
  limits: BillingLimits;
  usage: BillingUsage;
  payments: BillingPayment[];
};

export type BillingStatusResponse = {
  success?: boolean;
  message?: string;
  data?: BillingStatusData;
};

/* ============================================================
   CHECKOUT
============================================================ */

export type CheckoutData = {
  subscriptionId: string;
  keyId: string;
  planName: string;
  amountPaise: number;
  currency: string;
};

export type CheckoutResponse = {
  success?: boolean;
  message?: string;
  data?: CheckoutData;
};

/* ============================================================
   CANCEL
============================================================ */

export type CancelSubscriptionData = {
  status: string;
  currentPeriodEnd?: string | null;
};

export type CancelSubscriptionResponse = {
  success?: boolean;
  message?: string;
  data?: CancelSubscriptionData;
};

/* ============================================================
   HELPERS
============================================================ */

/*
 * Backend error code for paywalled features.
 *
 * 403 responses from gated endpoints carry:
 *
 *   { code: "UPGRADE_REQUIRED" }
 *
 * Callers should render an upgrade prompt
 * instead of a dead-end error.
 */

export const UPGRADE_REQUIRED_CODE =
  "UPGRADE_REQUIRED";

export function isUpgradeRequired(
  error: unknown
): boolean {
  return (
    error instanceof ApiError &&
    error.code ===
      UPGRADE_REQUIRED_CODE
  );
}

/*
 * Paise -> display rupees.
 *
 * 19900 -> "₹199"
 * 19950 -> "₹199.50"
 */

export function formatINR(
  amountPaise: number
): string {
  const rupees =
    amountPaise / 100;

  return `₹${rupees.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

/*
 * ISO date -> "12 Oct 2026".
 */

export function formatBillingDate(
  iso: string | null | undefined
): string {
  if (!iso) {
    return "—";
  }

  const date = new Date(iso);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/* ============================================================
   GET BILLING STATUS
============================================================ */

export async function getBillingStatus() {
  return apiRequest<BillingStatusResponse>(
    "/billing/status"
  );
}

/* ============================================================
   CREATE CHECKOUT
============================================================ */

export async function createCheckout(
  planCode:
    | "PRO_MONTHLY"
    | "PRO_YEARLY"
) {
  return apiRequest<CheckoutResponse>(
    "/billing/checkout",
    {
      method: "POST",
      body: JSON.stringify({
        planCode,
      }),
    }
  );
}

/* ============================================================
   CANCEL SUBSCRIPTION
============================================================ */

export async function cancelSubscription() {
  return apiRequest<CancelSubscriptionResponse>(
    "/billing/cancel",
    {
      method: "POST",
    }
  );
}

/* ============================================================
   TRIAL + REFERRAL (growth)
============================================================ */

export type TrialStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CONVERTED";

export type TrialStatusData = {
  hasTrial: boolean;
  status: TrialStatus | null;
  startsAt: string | null;
  endsAt: string | null;
  daysLeft: number;
  phoneVerified: boolean;
  eligibleForTrial: boolean;
  hasPaidSubscription: boolean;
  proUntil: string | null;
};

export type TrialStatusResponse = {
  success: boolean;
  data: TrialStatusData;
};

export async function getTrialStatus() {
  return apiRequest<TrialStatusResponse>(
    "/growth/trial/status"
  );
}

export async function startTrial() {
  return apiRequest<{
    success: boolean;
    data: {
      status: string;
      startsAt: string;
      endsAt: string;
      daysLeft: number;
    };
  }>("/growth/trial/start", {
    method: "POST",
  });
}

export type ReferralStatsData = {
  code: string | null;
  counts: {
    pending: number;
    qualified: number;
    rewarded: number;
    rejected: number;
  };
  earnedDays: number;
  proUntil: string | null;
  rewardDays: number;
  refereeBonusDays: number;
  maxRewardsPerYear: number;
};

export async function getReferralStats() {
  return apiRequest<{
    success: boolean;
    data: ReferralStatsData;
  }>("/growth/referral/stats");
}

export async function getOrCreateReferralCode() {
  return apiRequest<{
    success: boolean;
    data: { code: string };
  }>("/growth/referral/code", {
    method: "POST",
  });
}

export async function attributeReferral(
  code: string
) {
  return apiRequest<{
    success: boolean;
    data: {
      referralId: string;
      status: string;
    };
  }>("/growth/referral/attribute", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

/*
 * Public — validates a referral code for the invite banner
 * on the login page. Reveals only whether the code exists.
 */
export async function validateReferralCode(
  code: string
) {
  return apiRequest<{
    success: boolean;
    data: { valid: boolean };
  }>(
    `/growth/referral/validate/${encodeURIComponent(code)}`
  );
}

/*
 * Single source of truth for referral links. The login page
 * is the only auth entry — it handles both login and
 * registration — so all invites point there.
 */
export function buildReferralLink(
  code: string
): string {
  return `https://tapqr.shop/login?ref=${encodeURIComponent(code)}`;
}
