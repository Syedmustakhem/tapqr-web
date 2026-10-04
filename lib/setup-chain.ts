"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { apiRequest } from "@/lib/api";
import { getBillingStatus } from "@/lib/billing";

/*
 * ============================================================
 * GUIDED SETUP CHAIN
 * ============================================================
 *
 * New users used to land on a dashboard full of disconnected
 * pages — Campaigns here, QR Studio there, no path between
 * them. The setup chain fixes that with one strict order:
 *
 *   1. Set up your business
 *   2. Create your first QR   (locked until 1)
 *   3. Launch a campaign      (locked until 2)
 *   4. Go live                (locked until 3)
 *   5. Supercharge with Pro   (locked until 4)
 *
 * Progress is DERIVED from real data — never stored — so it
 * can never get out of sync, needs no migration, and existing
 * users (who already have businesses/QRs) auto-complete
 * every step and never see a lock.
 */

export const SETUP_CHAIN_DISMISS_KEY =
  "tapqr_setup_chain_done";

export type SetupStepId =
  | "business"
  | "qr"
  | "campaign"
  | "golive"
  | "pro";

export type SetupStep = {
  id: SetupStepId;
  index: number;
  title: string;
  description: string;
  cta: string;
  href: string;
  done: boolean;
  locked: boolean;
  current: boolean;
};

export type SetupChain = {
  loading: boolean;
  hasBusiness: boolean;
  hasQr: boolean;
  hasCampaign: boolean;
  isPublished: boolean;
  isPro: boolean;
  dismissed: boolean;
  steps: SetupStep[];
  doneCount: number;
  complete: boolean;
  refresh: () => void;
};

type BusinessRow = {
  id: string;
  status?: string | null;
};

const BUSINESS_STORAGE_KEY =
  "tapqr_current_business_id";

function readDismissed(): boolean {
  try {
    return (
      localStorage.getItem(
        SETUP_CHAIN_DISMISS_KEY
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function dismissSetupChain() {
  try {
    localStorage.setItem(
      SETUP_CHAIN_DISMISS_KEY,
      "1"
    );
  } catch {
    /* Non-fatal. */
  }
}

function countOf(payload: unknown): number {
  if (Array.isArray(payload)) {
    return payload.length;
  }
  if (
    payload &&
    typeof payload === "object"
  ) {
    const data = (payload as any).data;
    if (Array.isArray(data)) {
      return data.length;
    }
  }
  return 0;
}

export function useSetupChain(): SetupChain {
  const [loading, setLoading] =
    useState(true);
  const [hasBusiness, setHasBusiness] =
    useState(false);
  const [businessId, setBusinessId] =
    useState<string | null>(null);
  const [isPublished, setIsPublished] =
    useState(false);
  const [hasQr, setHasQr] =
    useState(false);
  const [hasCampaign, setHasCampaign] =
    useState(false);
  const [isPro, setIsPro] =
    useState(false);
  const [dismissed, setDismissed] =
    useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setDismissed(readDismissed());
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      let business: BusinessRow | null =
        null;

      /* 1. Businesses — pick the selected one, else the first. */
      try {
        const payload =
          await apiRequest<any>(
            "/businesses"
          );
        const list: BusinessRow[] =
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        const stored =
          typeof window !== "undefined"
            ? localStorage.getItem(
                BUSINESS_STORAGE_KEY
              )
            : null;

        business =
          list.find(
            (b) => b.id === stored
          ) ??
          list[0] ??
          null;
      } catch {
        business = null;
      }

      if (cancelled) return;

      const gotBusiness =
        business !== null;
      setHasBusiness(gotBusiness);
      setBusinessId(
        business?.id ?? null
      );
      setIsPublished(
        (business?.status ?? "")
          .toUpperCase()
          .includes("PUBLISH") ||
          (business?.status ?? "")
            .toUpperCase() === "ACTIVE"
      );

      /* 2 + 3. QRs and campaigns for that business. */
      if (business?.id) {
        const [qrPayload, campPayload] =
          await Promise.all([
            apiRequest(
              `/qrcodes/business/${business.id}`
            ).catch(() => null),
            apiRequest(
              `/campaign/business/${business.id}/campaigns`
            ).catch(() => null),
          ]);

        if (cancelled) return;
        setHasQr(countOf(qrPayload) > 0);
        setHasCampaign(
          countOf(campPayload) > 0
        );
      } else {
        setHasQr(false);
        setHasCampaign(false);
      }

      /* 4. Plan. */
      try {
        const status =
          await getBillingStatus();
        const code =
          status?.data?.plan?.code ??
          "FREE";
        if (!cancelled) {
          setIsPro(code !== "FREE");
        }
      } catch {
        /* Fail closed on plan — step 5 just stays actionable. */
      }

      if (!cancelled) {
        setDismissed(readDismissed());
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const stepDone = [
    hasBusiness,
    hasQr,
    hasCampaign,
    isPublished,
    isPro || dismissed,
  ];

  const steps: SetupStep[] = [
    {
      id: "business",
      index: 0,
      title: "Set up your business",
      description:
        "Add your business name, logo and contact details. Everything else builds on this.",
      cta: "Set up business",
      href: "/dashboard/business",
      done: stepDone[0],
      locked: false,
      current: false,
    },
    {
      id: "qr",
      index: 1,
      title: "Create your first QR",
      description:
        "Design a smart QR code. One scan opens your whole business experience.",
      cta: "Open QR Studio",
      href: "/dashboard/qr",
      done: stepDone[1],
      locked: !stepDone[0],
      current: false,
    },
    {
      id: "campaign",
      index: 2,
      title: "Launch a campaign",
      description:
        "Put your QR to work — run your first campaign and track real scans.",
      cta: "Create campaign",
      href: "/dashboard/campaigns",
      done: stepDone[2],
      locked: !stepDone[1],
      current: false,
    },
    {
      id: "golive",
      index: 3,
      title: "Go live",
      description:
        "Publish your business so customers can find you when they scan.",
      cta: "Publish now",
      href: "/dashboard/business",
      done: stepDone[3],
      locked: !stepDone[2],
      current: false,
    },
    {
      id: "pro",
      index: 4,
      title: "Supercharge with Pro",
      description:
        "Unlock review funnels, loyalty cards, bookings, WhatsApp orders and more.",
      cta: "Upgrade to Pro",
      href: "/dashboard/payments",
      done: stepDone[4],
      locked: !stepDone[3],
      current: false,
    },
  ];

  let currentAssigned = false;
  for (const step of steps) {
    if (
      !step.done &&
      !step.locked &&
      !currentAssigned
    ) {
      step.current = true;
      currentAssigned = true;
    }
  }

  const doneCount = steps.filter(
    (s) => s.done
  ).length;

  return {
    loading,
    hasBusiness,
    hasQr,
    hasCampaign,
    isPublished,
    isPro,
    dismissed,
    steps,
    doneCount,
    complete: doneCount === steps.length,
    refresh,
  };
}
