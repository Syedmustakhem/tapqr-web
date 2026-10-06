"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  adminListPlans,
  adminUpdatePlan,
  adminListFlags,
  adminUpsertFlag,
} from "@/lib/admin";
import { formatINR } from "@/lib/billing";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<
    any[]
  >([]);
  const [flags, setFlags] = useState<
    any[]
  >([]);
  const [loading, setLoading] =
    useState(true);
  const [newFlag, setNewFlag] =
    useState("");
  const [busy, setBusy] = useState<
    string | null
  >(null);

  async function load() {
    try {
      const [p, f] =
        await Promise.all([
          adminListPlans(),
          adminListFlags(),
        ]);
      setPlans(p.data);
      setFlags(f.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function togglePlanActive(
    plan: any
  ) {
    setBusy(plan.code);
    try {
      await adminUpdatePlan(
        plan.code,
        { isActive: !plan.isActive }
      );
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function toggleFlag(flag: any) {
    setBusy(flag.key);
    try {
      await adminUpsertFlag(
        flag.key,
        !flag.enabled
      );
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function createFlag() {
    const key = newFlag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");
    if (!key) return;
    setBusy("new");
    try {
      await adminUpsertFlag(key, true);
      setNewFlag("");
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading…
      </p>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Plans & Feature flags
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pricing and gates — no
          deploy needed.
        </p>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {plan.name}
                </p>
                <p className="text-xs text-slate-500">
                  {plan.code} ·{" "}
                  {formatINR(
                    plan.pricePaise
                  )}
                  {plan.interval
                    ? `/${plan.interval.toLowerCase()}`
                    : ""}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {plan.maxQrs} QRs ·{" "}
                  {plan.maxBusinesses}{" "}
                  businesses ·{" "}
                  {plan.maxSeats} seats
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={
                  plan.isActive
                }
                disabled={busy === plan.code}
                onClick={() =>
                  togglePlanActive(plan)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  plan.isActive
                    ? "bg-teal-500"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    plan.isActive
                      ? "left-[22px]"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Flags */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Feature flags
        </p>

        <div className="mt-3 space-y-2">
          {flags.map((flag) => (
            <div
              key={flag.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-slate-900">
                  {flag.key}
                </p>
                {flag.description && (
                  <p className="truncate text-xs text-slate-500">
                    {flag.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={
                  flag.enabled
                }
                disabled={
                  busy === flag.key
                }
                onClick={() =>
                  toggleFlag(flag)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  flag.enabled
                    ? "bg-teal-500"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    flag.enabled
                      ? "left-[22px]"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}

          {flags.length === 0 && (
            <p className="text-sm text-slate-500">
              No flags yet.
            </p>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={newFlag}
            onChange={(e) =>
              setNewFlag(e.target.value)
            }
            placeholder="new_flag_key"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={createFlag}
            disabled={
              busy === "new" ||
              !newFlag.trim()
            }
            className="shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            Add flag
          </button>
        </div>
      </div>
    </div>
  );
}
