"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  adminListReviewReports,
  adminResolveReport,
} from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

export default function AdminModerationPage() {
  const [reports, setReports] = useState<
    any[]
  >([]);
  const [loading, setLoading] =
    useState(true);
  const [busy, setBusy] = useState<
    string | null
  >(null);

  async function load() {
    try {
      const res =
        await adminListReviewReports({
          limit: 30,
        });
      setReports(res.data.reports);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function resolve(
    reportId: string,
    action: "dismiss" | "remove_review"
  ) {
    const msg =
      action === "dismiss"
        ? "Dismiss this report?"
        : "Remove this review permanently?";

    if (!window.confirm(msg)) return;

    setBusy(reportId);
    try {
      await adminResolveReport(
        reportId,
        action
      );
      await load();
    } catch (e: any) {
      alert(
        e?.message || "Action failed."
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Moderation
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Reported reviews awaiting
          your call.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading…
        </p>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-bold text-slate-900">
            Queue is clear
          </p>
          <p className="mt-1 text-xs text-slate-500">
            No open review reports.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {r.review.business
                      .name}{" "}
                    <span className="font-normal text-slate-400">
                      · {r.review.rating}★
                    </span>
                  </p>
                  {r.review.text && (
                    <p className="mt-1 text-sm text-slate-600">
                      “{r.review.text}”
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-bold text-red-600">
                      Report:
                    </span>{" "}
                    {r.reason}
                    {r.details
                      ? ` — ${r.details}`
                      : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatBillingDate(
                      r.createdAt
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() =>
                    resolve(r.id, "dismiss")
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
                >
                  Dismiss report
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() =>
                    resolve(
                      r.id,
                      "remove_review"
                    )
                  }
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {busy === r.id
                    ? "…"
                    : "Remove review"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
