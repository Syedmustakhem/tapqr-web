"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock3,
  ArrowRight,
  Gift,
} from "lucide-react";
import {
  getTrialStatus,
  startTrial,
  formatBillingDate,
  type TrialStatusData,
} from "@/lib/billing";

/*
 * ============================================================
 * TRIAL BANNER
 * ============================================================
 *
 * Shows on the dashboard overview:
 *  - ACTIVE trial      -> countdown + upgrade CTA
 *  - Eligible, no trial -> "start free trial" CTA
 *  - Pro via credits   -> "Pro active until <date>" note
 *  - Paid subscriber   -> nothing
 */

export default function TrialBanner() {
  const [data, setData] =
    useState<TrialStatusData | null>(null);
  const [starting, setStarting] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    getTrialStatus()
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
        }
      })
      .catch(() => {
        /* silent — banner is non-critical */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return null;
  }

  // Paid subscribers don't need the banner.
  if (data.hasPaidSubscription) {
    return null;
  }

  async function handleStart() {
    setStarting(true);
    setError("");

    try {
      await startTrial();

      // Refetch instead of an optimistic spread: the
      // server-computed status is always type-correct and
      // reflects the real trial state.
      const res = await getTrialStatus();
      setData(res.data);
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not start the trial. Please try again."
      );
    } finally {
      setStarting(false);
    }
  }

  // Pro access from referral credits (no trial, no paid sub).
  const creditProActive =
    !data.hasTrial &&
    data.proUntil &&
    new Date(data.proUntil).getTime() >
      Date.now();

  if (creditProActive) {
    return (
      <section className="rounded-[24px] border border-teal-200 bg-teal-50 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <Gift className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
          <div>
            <p className="text-sm font-bold text-slate-900">
              Pro is active on your account
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Earned through referrals —
              active until{" "}
              {formatBillingDate(
                data.proUntil
              )}
              . Keep referring to extend it.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    data.hasTrial &&
    data.status === "ACTIVE"
  ) {
    return (
      <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                Pro trial: {data.daysLeft}{" "}
                {data.daysLeft === 1
                  ? "day"
                  : "days"}{" "}
                left
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                You're trying every Pro
                feature free until{" "}
                {formatBillingDate(
                  data.endsAt
                )}
                . Upgrade to keep them.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/payments"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
          >
            Upgrade now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  if (data.eligibleForTrial) {
    return (
      <section className="rounded-[24px] border border-teal-200 bg-gradient-to-r from-teal-50 to-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                Try Pro free for 15 days
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Review funnel, loyalty card,
                bookings, WhatsApp ordering
                and more — no card required.
              </p>
              {error && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
          >
            {starting
              ? "Starting…"
              : "Start free trial"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    );
  }

  return null;
}
