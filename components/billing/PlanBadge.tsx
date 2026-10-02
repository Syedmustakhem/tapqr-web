"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { getBillingStatus } from "@/lib/billing";

/*
 * Small plan pill for the dashboard header.
 *
 * Fails silently — a billing hiccup must
 * never break the dashboard.
 */

export default function PlanBadge() {
  const [label, setLabel] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getBillingStatus()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const code =
          response?.data?.plan
            ?.code ?? "FREE";

        setLabel(
          code === "FREE"
            ? "FREE"
            : "PRO"
        );
      })
      .catch(() => {
        /*
         * Never break the dashboard
         * over a billing lookup.
         */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!label) {
    return null;
  }

  const isPro = label === "PRO";

  return (
    <Link
      href="/dashboard/settings?tab=billing"
      title="Billing settings"
      className={`hidden items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] transition sm:inline-flex ${
        isPro
          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}
