"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  adminListTrials,
  adminListReferrals,
  adminFraudSignals,
} from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

export default function AdminGrowthPage() {
  const [tab, setTab] = useState<
    "trials" | "referrals" | "fraud"
  >("trials");
  const [trials, setTrials] = useState<
    any[]
  >([]);
  const [referrals, setReferrals] =
    useState<any[]>([]);
  const [fraud, setFraud] = useState<
    Array<{
      phone: string;
      count: number;
    }>
  >([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, r, f] =
          await Promise.all([
            adminListTrials({
              limit: 30,
            }),
            adminListReferrals({
              limit: 30,
            }),
            adminFraudSignals(),
          ]);
        setTrials(t.data.trials);
        setReferrals(r.data.referrals);
        setFraud(f.data);
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
          Trials & Referrals
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Growth loops and fraud
          signals.
        </p>
      </div>

      <div className="flex gap-2">
        {(
          [
            ["trials", "Trials"],
            ["referrals", "Referrals"],
            ["fraud", "Fraud signals"],
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
            {key === "fraud" &&
              fraud.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">
                  {fraud.length}
                </span>
              )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading…
        </p>
      ) : tab === "trials" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {trials.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No trials yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {trials.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {t.user.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {t.phone ?? "—"} ·
                      ends{" "}
                      {formatBillingDate(
                        t.endsAt
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                      t.status ===
                      "ACTIVE"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === "referrals" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {referrals.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No referrals yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {referrals.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {r.referrer.fullName}{" "}
                      <span className="font-normal text-slate-400">
                        →{" "}
                        {r.referee
                          ?.fullName ??
                          "pending"}
                      </span>
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {formatBillingDate(
                        r.createdAt
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                      r.status ===
                      "REWARDED"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {fraud.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No duplicate-phone trials
              detected. Clean.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {fraud.map((f) => (
                <div
                  key={f.phone}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <p className="font-mono text-sm font-bold text-slate-900">
                    {f.phone}
                  </p>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-extrabold uppercase text-red-700">
                    {f.count} trials
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
