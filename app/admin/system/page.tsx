"use client";

import {
  useEffect,
  useState,
} from "react";
import { adminListAuditLog } from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

export default function AdminSystemPage() {
  const [entries, setEntries] = useState<
    any[]
  >([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res =
          await adminListAuditLog({
            limit: 50,
          });
        setEntries(res.data.entries);
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
          Audit log
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every super-admin action,
          recorded. Append-only.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading…
        </p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-bold text-slate-900">
            No admin actions yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Actions you take in this
            panel will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {entries.map((e) => (
              <div
                key={e.id}
                className="px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-xs font-bold text-slate-900">
                    {e.action}
                  </p>
                  <p className="shrink-0 text-[11px] text-slate-400">
                    {formatBillingDate(
                      e.createdAt
                    )}
                  </p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {e.adminEmail}
                  {e.targetType
                    ? ` → ${e.targetType}${e.targetId ? ` ${e.targetId.slice(0, 8)}…` : ""}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
