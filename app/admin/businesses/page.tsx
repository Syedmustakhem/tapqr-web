"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Search } from "lucide-react";
import { adminListBusinesses } from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

type BizRow = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  owner: {
    fullName: string;
    email: string | null;
  };
  _count: { qrCodes: number };
};

export default function AdminBusinessesPage() {
  const [rows, setRows] = useState<
    BizRow[]
  >([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] =
    useState(true);

  const load = useCallback(
    async (q: string, p: number) => {
      setLoading(true);
      try {
        const res =
          await adminListBusinesses({
            search: q || undefined,
            page: p,
            limit: 20,
          });
        setRows(res.data.businesses);
        setTotal(res.data.total);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void load(search, page);
  }, [load, page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Businesses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {total} total
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            void load(e.target.value, 1);
          }}
          placeholder="Search businesses…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-slate-500">
            Loading…
          </p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">
            No businesses found.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {b.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {b.owner.fullName}
                    {b.owner.email
                      ? ` · ${b.owner.email}`
                      : ""}{" "}
                    ·{" "}
                    {formatBillingDate(
                      b.createdAt
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase text-slate-600">
                    {b._count.qrCodes} QRs
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                      b.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((p) => p - 1)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
          >
            ← Prev
          </button>
          <p className="text-xs text-slate-500">
            Page {page}
          </p>
          <button
            type="button"
            disabled={
              page * 20 >= total
            }
            onClick={() =>
              setPage((p) => p + 1)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
