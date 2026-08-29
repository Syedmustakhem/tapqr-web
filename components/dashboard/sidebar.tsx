"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  QrCode,
  BarChart3,
  Users,
  Activity,
  Settings,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Business",
    href: "/dashboard/business",
    icon: Building2,
  },
  {
    label: "QR Studio",
    href: "/dashboard/qr",
    icon: QrCode,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Staff & Access",
    href: "/dashboard/staff",
    icon: Users,
  },
  {
    label: "Activity",
    href: "/dashboard/activity",
    icon: Activity,
  },
];

const secondaryNavigation = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[272px]
          flex-col border-r border-slate-200/80
          bg-white/95 backdrop-blur-xl
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-[76px] items-center justify-between px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-900/10">
              T
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-950">
              Tap<span className="text-blue-600">QR</span>
            </span>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-5">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 text-white shadow-xl shadow-blue-950/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Sparkles className="h-4 w-4" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                TapQR Workspace
              </span>
            </div>

            <p className="text-sm font-semibold">
              Your digital presence
            </p>

            <p className="mt-1 text-xs leading-5 text-white/55">
              Manage your business, QR codes and customer activity.
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }
                  `}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active
                        ? "text-blue-300"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />

                  <span>{item.label}</span>

                  {item.label === "Analytics" && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        active
                          ? "bg-white/10 text-white/70"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      LIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <p className="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Account
          </p>

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }
                  `}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200/80 p-4">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            onClick={() => {
              localStorage.removeItem("tapqr_access_token");
              localStorage.removeItem("tapqr_refresh_token");
              window.location.href = "/login";
            }}
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}