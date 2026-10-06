"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  adminGetUser,
  adminSuspendUser,
  adminUnsuspendUser,
  adminGrantPro,
  adminExtendTrial,
} from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  const [user, setUser] =
    useState<any>(null);
  const [loading, setLoading] =
    useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await adminGetUser(id);
      setUser(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(
    label: string,
    fn: () => Promise<unknown>,
    confirmText?: string
  ) {
    if (
      confirmText &&
      !window.confirm(confirmText)
    )
      return;
    setBusy(label);
    try {
      await fn();
      await load();
    } catch (e: any) {
      alert(
        e?.message || "Action failed."
      );
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading…
      </p>
    );
  }

  if (!user) {
    return (
      <p className="text-sm text-slate-500">
        User not found.
      </p>
    );
  }

  const isPro =
    user.proUntil &&
    new Date(user.proUntil) > new Date();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          {user.fullName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.email ?? "—"}
          {user.phone
            ? ` · ${user.phone}`
            : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
              user.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {user.isActive
              ? "Active"
              : "Suspended"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase text-slate-600">
            {user.role}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
              isPro
                ? "bg-teal-100 text-teal-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isPro ? "Pro" : "Free"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Actions
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {user.isActive ? (
            <button
              type="button"
              disabled={!!busy}
              onClick={() =>
                run(
                  "suspend",
                  () =>
                    adminSuspendUser(
                      id,
                      "Suspended from admin panel"
                    ),
                  `Suspend ${user.fullName}? They will be locked out immediately.`
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy === "suspend"
                ? "…"
                : "Suspend user"}
            </button>
          ) : (
            <button
              type="button"
              disabled={!!busy}
              onClick={() =>
                run("unsuspend", () =>
                  adminUnsuspendUser(id)
                )
              }
              className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy === "unsuspend"
                ? "…"
                : "Unsuspend"}
            </button>
          )}

          <button
            type="button"
            disabled={!!busy}
            onClick={() => {
              const days = window.prompt(
                "Grant how many days of Pro?",
                "30"
              );
              if (!days) return;
              void run("pro", () =>
                adminGrantPro(
                  id,
                  parseInt(days, 10) || 30,
                  "Manual grant from admin panel"
                )
              );
            }}
            className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-800 disabled:opacity-50"
          >
            {busy === "pro"
              ? "…"
              : "Grant Pro"}
          </button>

          <button
            type="button"
            disabled={!!busy}
            onClick={() => {
              const days = window.prompt(
                "Extend trial by how many days?",
                "7"
              );
              if (!days) return;
              void run("trial", () =>
                adminExtendTrial(
                  id,
                  parseInt(days, 10) || 7,
                  "Manual extension from admin panel"
                )
              );
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
          >
            {busy === "trial"
              ? "…"
              : "Extend trial"}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Details
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">
              Joined
            </dt>
            <dd className="font-semibold">
              {formatBillingDate(
                user.createdAt
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">
              Pro until
            </dt>
            <dd className="font-semibold">
              {user.proUntil
                ? formatBillingDate(
                    user.proUntil
                  )
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">
              Trial
            </dt>
            <dd className="font-semibold">
              {user.trial
                ? `${user.trial.status} → ${formatBillingDate(user.trial.endsAt)}`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">
              Businesses
            </dt>
            <dd className="font-semibold">
              {user.businesses?.length ??
                0}
            </dd>
          </div>
        </dl>
      </div>

      {/* Subscriptions */}
      {user.subscriptions?.length >
        0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Subscriptions
          </p>
          <div className="mt-3 space-y-2">
            {user.subscriptions.map(
              (s: any) => (
                <div
                  key={s.id}
                  className="flex justify-between text-sm"
                >
                  <span className="font-semibold">
                    {s.planCode}
                  </span>
                  <span className="text-slate-500">
                    {s.status}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Pro credits */}
      {user.proCredits?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Pro credit history
          </p>
          <div className="mt-3 space-y-2">
            {user.proCredits.map(
              (c: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between text-sm"
                >
                  <span className="font-semibold">
                    +{c.days} days
                  </span>
                  <span className="text-slate-500">
                    {c.reason}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
