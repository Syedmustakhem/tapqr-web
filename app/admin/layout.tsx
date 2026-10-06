"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  LifeBuoy,
  Megaphone,
  Settings2,
  ScrollText,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { getStoredUser } from "@/lib/auth";

/*
 * ============================================================
 * SUPER ADMIN SHELL
 * ============================================================
 *
 * Guards every /admin page: only SUPER_ADMIN gets in.
 * Everyone else is bounced back to the dashboard.
 */

const NAV: Array<{
  href: string;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <LayoutDashboard className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: "/admin/businesses",
    label: "Businesses",
    icon: (
      <Building2 className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/money",
    label: "Money",
    icon: (
      <CreditCard className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/growth",
    label: "Trials & Referrals",
    icon: (
      <TrendingUp className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/moderation",
    label: "Moderation",
    icon: (
      <ShieldAlert className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/support",
    label: "Support",
    icon: (
      <LifeBuoy className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/broadcasts",
    label: "Broadcasts",
    icon: (
      <Megaphone className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/plans",
    label: "Plans & Flags",
    icon: (
      <Settings2 className="h-4 w-4" />
    ),
  },
  {
    href: "/admin/system",
    label: "Audit Log",
    icon: (
      <ScrollText className="h-4 w-4" />
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const user = getStoredUser();
    setAllowed(
      user?.role === "SUPER_ADMIN"
    );
  }, []);

  if (allowed === null) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="text-sm text-slate-500">
          Checking access…
        </p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-red-400" />
          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Super admin only
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This area is restricted.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold">
                TapQR Super Admin
              </p>
              <p className="text-[11px] text-slate-400">
                Full platform control
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6">
        {/* Side nav */}
        <nav className="hidden w-52 shrink-0 md:block">
          <div className="sticky top-20 space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(
                      item.href
                    );
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(
                    item.href
                  );
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
