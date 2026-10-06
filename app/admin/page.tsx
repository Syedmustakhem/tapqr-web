"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  CreditCard,
  Zap,
  ScanLine,
  LifeBuoy,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import {
  adminGetOverview,
  type AdminOverview,
} from "@/lib/admin";
import { formatINR } from "@/lib/billing";

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-slate-300" />
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-500">
        {label}
      </p>
      {sub && (
        <p className="mt-0.5 text-[11px] text-slate-400">
          {sub}
        </p>
      )}
    </div>
  );

  return href ? (
    <Link href={href}>{inner}</Link>
  ) : (
    inner
  );
}

export default function AdminOverviewPage() {
  const [data, setData] =
    useState<AdminOverview | null>(
      null
    );
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res =
          await adminGetOverview();
        setData(res.data);
      } catch {
        /* show empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading overview…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500">
        Could not load overview.
      </p>
    );
  }

  const maxSignups = Math.max(
    1,
    ...data.signups.map((s) => s.count)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Everything happening on TapQR
          right now.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total users"
          value={String(data.users)}
          sub={`${data.proUsers} on Pro`}
          href="/admin/users"
        />
        <StatCard
          icon={
            <CreditCard className="h-5 w-5" />
          }
          label="Revenue (all time)"
          value={formatINR(
            data.revenuePaise
          )}
          sub={`${data.paymentCount} payments · ${data.activeSubscriptions} active subs`}
          href="/admin/money"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Active trials"
          value={String(
            data.activeTrials
          )}
          href="/admin/growth"
        />
        <StatCard
          icon={
            <ScanLine className="h-5 w-5" />
          }
          label="Scans today"
          value={String(data.scansToday)}
        />
        <StatCard
          icon={
            <Building2 className="h-5 w-5" />
          }
          label="Businesses"
          value={String(data.businesses)}
          href="/admin/businesses"
        />
        <StatCard
          icon={
            <LifeBuoy className="h-5 w-5" />
          }
          label="Open tickets"
          value={String(data.openTickets)}
          href="/admin/support"
        />
        <StatCard
          icon={
            <ShieldAlert className="h-5 w-5" />
          }
          label="Open reports"
          value={String(data.openReports)}
          href="/admin/moderation"
        />
      </div>

      {/* Signups chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Signups — last 30 days
        </p>
        <div className="mt-4 flex h-32 items-end gap-1">
          {data.signups.map((s) => (
            <div
              key={s.day}
              title={`${s.day}: ${s.count}`}
              className="min-w-0 flex-1 rounded-t bg-slate-950/80 transition hover:bg-teal-600"
              style={{
                height: `${Math.max(
                  4,
                  (s.count / maxSignups) *
                    100
                )}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Revenue by month */}
      {data.revenue.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Revenue by month
          </p>
          <div className="mt-3 divide-y divide-slate-100">
            {data.revenue.map((r) => (
              <div
                key={r.month}
                className="flex items-center justify-between py-2.5"
              >
                <p className="text-sm font-semibold text-slate-700">
                  {r.month}
                </p>
                <p className="text-sm font-bold text-slate-950">
                  {formatINR(r.totalPaise)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
