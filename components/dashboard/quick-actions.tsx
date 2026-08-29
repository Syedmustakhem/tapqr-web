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
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-950">
          Quick actions
        </h2>

        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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
              className="group rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-700" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-950">
                {action.title}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}