"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  adminListSubscriptions,
  adminListPayments,
} from "@/lib/admin";
import {
  formatINR,
  formatBillingDate,
} from "@/lib/billing";

export default function AdminMoneyPage() {
  const [tab, setTab] = useState<
    "subs" | "payments"
  >("subs");
  const [subs, setSubs] = useState<
    any[]
  >([]);
  const [payments, setPayments] =
    useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] =
          await Promise.all([
            adminListSubscriptions({
              limit: 30,
            }),
            adminListPayments({
              limit: 30,
            }),
          ]);
        setSubs(
          s.data.subscriptions
        );
        setPayments(p.data.payments);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Money
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Subscriptions and payments
          across the platform.
        </p>
      </div>

      <div className="flex gap-2">
        {(
          [
            ["subs", "Subscriptions"],
            ["payments", "Payments"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === key
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading…
        </p>
      ) : tab === "subs" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {subs.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No subscriptions yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {subs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {s.user.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {s.planCode} ·{" "}
                      {s.user.email ?? "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                        s.status ===
                        "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {s.status}
                    </span>
                    {s.cancelAtPeriodEnd && (
                      <p className="mt-1 text-[11px] text-amber-600">
                        Cancels{" "}
                        {formatBillingDate(
                          s.currentPeriodEnd
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {payments.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No payments yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {formatINR(
                        p.amountPaise
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {p.user.fullName} ·{" "}
                      {formatBillingDate(
                        p.createdAt
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                      p.status ===
                      "captured"
                        ? "bg-green-100 text-green-700"
                        : p.status ===
                            "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
