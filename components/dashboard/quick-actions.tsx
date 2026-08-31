"use client";

import Link from "next/link";
import {
  UserRound,
  QrCode,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

const actions = [
  {
    title: "Edit Profile",
    description: "Update your business",
    href: "/dashboard/business",
    icon: UserRound,
  },
  {
    title: "Customize QR",
    description: "Make it yours",
    href: "/dashboard/qr",
    icon: QrCode,
  },
  {
    title: "Analytics",
    description: "Track your growth",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2
            id="quick-actions-title"
            className="text-sm font-bold text-slate-950"
          >
            Quick actions
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Common workspace shortcuts
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Shortcuts
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label={`${action.title}: ${action.description}`}
            >
              {/* Subtle hover glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-50 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white">
                    <Icon
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 transition-all duration-300 group-hover:bg-slate-100">
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
                    />
                  </div>
                </div>

                <p className="mt-4 text-sm font-bold text-slate-950">
                  {action.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}