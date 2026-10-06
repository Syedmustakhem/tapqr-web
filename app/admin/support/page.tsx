"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  adminListTickets,
} from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<
    any[]
  >([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<
    string | undefined
  >("OPEN");
  const [loading, setLoading] =
    useState(true);

  async function load(
    status?: string
  ) {
    setLoading(true);
    try {
      const res =
        await adminListTickets({
          status,
          limit: 30,
        });
      setTickets(res.data.tickets);
      setTotal(res.data.total);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(filter);
  }, []);

  function setStatusFilter(s?: string) {
    setFilter(s);
    void load(s);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Support inbox
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {total} tickets
        </p>
      </div>

      <div className="flex gap-2">
        {(
          [
            ["OPEN", "Open"],
            ["ANSWERED", "Answered"],
            ["CLOSED", "Closed"],
            [undefined, "All"],
          ] as const
        ).map(([val, label]) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              setStatusFilter(val)
            }
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              filter === val
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
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-bold text-slate-900">
            Inbox zero
          </p>
          <p className="mt-1 text-xs text-slate-500">
            No tickets in this view.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/admin/support/${t.id}`}
                className="block px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {t.subject}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                      t.status ===
                      "OPEN"
                        ? "bg-red-100 text-red-700"
                        : t.status ===
                            "ANSWERED"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {t.user.fullName} ·{" "}
                  {formatBillingDate(
                    t.createdAt
                  )}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
