"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  QrCode,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { MessageSquare } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { clearSession, getStoredUser, type AuthUser } from "@/lib/auth";

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
  label: "Reviews",
  href: "/dashboard/reviews",
  icon: MessageSquare,
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

function getInitials(user: AuthUser | null) {
  if (!user?.fullName?.trim()) return "T";

  const parts = user.fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";

  return `${first}${last}`.toUpperCase();
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user] = useState<AuthUser | null>(() => getStoredUser());

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      // A failed logout request must never leave local credentials behind.
      // If the server already considers the session expired, local cleanup
      // is still the correct client-side behavior.
      if (!(error instanceof ApiError)) {
        console.error("TapQR logout error:", error);
      }
    } finally {
      clearSession();
      setLogoutOpen(false);
      onClose();
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Dashboard navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-slate-200 bg-white shadow-[0_0_40px_rgba(15,23,42,0.05)] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10">
              T
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-tight text-slate-950">
                Tap<span className="text-blue-600">QR</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Business workspace
              </div>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace card */}
        <div className="px-4 pb-4 pt-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-xl shadow-slate-950/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <Sparkles className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                    TapQR Workspace
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Business control center
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-white/50">
              Manage your business, smart QR experiences and customer activity from one secure workspace.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4" aria-label="Workspace">
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
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 ${
                    active
                      ? "bg-slate-950 text-white shadow-md shadow-slate-950/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active ? "bg-white/10" : "bg-slate-50 group-hover:bg-white"
                    }`}
                  >
                    <Icon
                      className={`h-[17px] w-[17px] ${
                        active
                          ? "text-blue-300"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {item.label === "Analytics" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
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

          <div className="my-6 h-px bg-slate-100" />

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
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
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active ? "bg-white/10" : "bg-slate-50 group-hover:bg-white"
                    }`}
                  >
                    <Icon
                      className={`h-[17px] w-[17px] ${
                        active ? "text-blue-300" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Security indicator */}
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-950">
                  Secure session
                </p>
                <p className="mt-0.5 text-[10px] leading-4 text-emerald-800/70">
                  Protected with access and refresh tokens.
                </p>
              </div>
            </div>
          </div>
        </nav>

        {/* Account / logout */}
        <div className="border-t border-slate-100 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">
              {getInitials(user)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {user?.fullName || "TapQR user"}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {user?.email || user?.phone || "Secure account"}
              </p>
            </div>

            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          </div>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Logout confirmation */}
      {logoutOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-description"
        >
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <LogOut className="h-5 w-5" />
            </div>

            <h2 id="logout-title" className="mt-5 text-xl font-bold tracking-tight text-slate-950">
              Sign out of TapQR?
            </h2>

            <p id="logout-description" className="mt-2 text-sm leading-6 text-slate-500">
              Your local session will be cleared and you will return to the secure login page.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-500/10 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing out...
                  </>
                ) : (
                  "Sign out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
