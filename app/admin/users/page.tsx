"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  adminListUsers,
} from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

type UserRow = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  proUntil: string | null;
  createdAt: string;
  _count: { businesses: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<
    UserRow[]
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
          await adminListUsers({
            search: q || undefined,
            page: p,
            limit: 20,
          });
        setUsers(res.data.users);
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

  function onSearch(v: string) {
    setSearch(v);
    setPage(1);
    void load(v, 1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {total} total
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) =>
            onSearch(e.target.value)
          }
          placeholder="Search name, email, phone…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-slate-500">
            Loading…
          </p>
        ) : users.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">
            No users found.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {u.fullName}
                    {!u.isActive && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                        Suspended
                      </span>
                    )}
                    {u.role ===
                      "SUPER_ADMIN" && (
                      <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {u.email ?? u.phone ?? "—"}
                    {" · "}
                    {u._count.businesses}{" "}
                    businesses · joined{" "}
                    {formatBillingDate(
                      u.createdAt
                    )}
                  </p>
                </div>
                {u.proUntil &&
                new Date(u.proUntil) >
                  new Date() ? (
                  <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-extrabold uppercase text-teal-700">
                    Pro
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase text-slate-500">
                    Free
                  </span>
                )}
              </Link>
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
