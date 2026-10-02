"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  CreditCard,
  Loader2,
  Receipt,
} from "lucide-react";

import {
  cancelSubscription,
  formatBillingDate,
  formatINR,
  getBillingStatus,
  type BillingStatusData,
} from "@/lib/billing";

/* ============================================================
   USAGE BAR
============================================================ */

function UsageBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const percent =
    max > 0
      ? Math.min(
          100,
          Math.round(
            (used / max) * 100
          )
        )
      : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="text-xs font-bold text-slate-700">
          {used} / {max}
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-950 transition-all"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   BILLING SECTION
============================================================ */

export default function BillingSection() {
  const [status, setStatus] =
    useState<BillingStatusData | null>(
      null
    );
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const [cancelling, setCancelling] =
    useState(false);
  const [notice, setNotice] =
    useState("");

  const loadStatus =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getBillingStatus();

        setStatus(
          response?.data ?? null
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load billing information."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleCancel =
    async () => {
      if (cancelling) {
        return;
      }

      const confirmed =
        window.confirm(
          "Cancel your Pro subscription? You keep Pro until the end of the current billing period."
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancelling(true);
        setNotice("");

        const response =
          await cancelSubscription();

        const periodEnd =
          response?.data
            ?.currentPeriodEnd;

        setNotice(
          periodEnd
            ? `Subscription cancelled. Pro stays active until ${formatBillingDate(
                periodEnd
              )}.`
            : "Subscription cancelled."
        );

        await loadStatus();
      } catch (err) {
        setNotice(
          err instanceof Error
            ? err.message
            : "Unable to cancel the subscription."
        );
      } finally {
        setCancelling(false);
      }
    };

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading billing…
      </p>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

        <div>
          <p className="text-sm font-semibold text-red-800">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadStatus()
            }
            className="mt-2 text-xs font-bold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <p className="text-sm text-slate-500">
        No billing information
        available.
      </p>
    );
  }

  const planCode =
    status.plan?.code ?? "FREE";

  const isPro =
    planCode !== "FREE";

  const subscription =
    status.subscription;

  const subscriptionActive =
    subscription?.status ===
      "ACTIVE" &&
    !subscription?.cancelAtPeriodEnd;

  const payments =
    status.payments ?? [];

  return (
    <div className="max-w-xl space-y-6">
      {notice && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">
            {notice}
          </p>
        </div>
      )}

      {/* Current plan */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {status.plan?.name ??
                  "Free"}
              </p>

              <p className="text-xs text-slate-500">
                Current plan
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${
              isPro
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        {subscription && (
          <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">
                Status
              </dt>
              <dd className="font-semibold capitalize text-slate-900">
                {subscription.status
                  .toLowerCase()
                  .replace(
                    /_/g,
                    " "
                  )}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">
                {subscription.cancelAtPeriodEnd
                  ? "Pro ends"
                  : "Renews"}
              </dt>
              <dd className="font-semibold text-slate-900">
                {formatBillingDate(
                  subscription.currentPeriodEnd
                )}
              </dd>
            </div>
          </dl>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard/payments"
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            {isPro
              ? "Change plan"
              : "Upgrade to Pro"}
          </Link>

          {subscriptionActive && (
            <button
              type="button"
              onClick={() =>
                void handleCancel()
              }
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {cancelling && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {cancelling
                ? "Cancelling…"
                : "Cancel subscription"}
            </button>
          )}
        </div>
      </div>

      {/* Usage */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Usage
        </p>

        <div className="mt-4 space-y-4">
          <UsageBar
            label="QR codes"
            used={
              status.usage?.qrCount ??
              0
            }
            max={
              status.limits
                ?.maxQrs ?? 1
            }
          />

          <UsageBar
            label="Businesses"
            used={
              status.usage
                ?.businessCount ?? 0
            }
            max={
              status.limits
                ?.maxBusinesses ??
              1
            }
          />
        </div>
      </div>

      {/* Invoices */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-slate-400" />

          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Invoice history
          </p>
        </div>

        {payments.length ===
        0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No payments yet.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-slate-100">
            {payments.map(
              (payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatINR(
                        payment.amountPaise
                      )}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatBillingDate(
                        payment.createdAt
                      )}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-600">
                    {payment.status}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
