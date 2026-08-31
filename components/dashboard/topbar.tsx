"use client";

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  clearSession,
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";

import { apiRequest } from "@/lib/api";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const router = useRouter();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [loggingOut, setLoggingOut] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement | null>(null);

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Load currently stored authenticated user.
   */
  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  /*
   * Close menus when clicking outside.
   */
  useEffect(() => {
    const handlePointerDown = (
      event: PointerEvent
    ) => {
      const target = event.target as Node;

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, []);

  /*
   * Keyboard shortcut:
   * "/" focuses dashboard search.
   */
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      const tagName =
        target?.tagName?.toLowerCase();

      if (
        event.key === "/" &&
        tagName !== "input" &&
        tagName !== "textarea" &&
        tagName !== "select"
      ) {
        event.preventDefault();

        const searchInput =
          document.getElementById(
            "dashboard-search"
          ) as HTMLInputElement | null;

        searchInput?.focus();
      }

      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  const initials = useMemo(() => {
    if (!user?.fullName?.trim()) {
      return "TQ";
    }

    const parts =
      user.fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`
      .toUpperCase();
  }, [user]);

  const firstName =
    user?.fullName
      ?.trim()
      .split(/\s+/)[0] || "Account";

  const role =
    user?.role
      ? user.role.toLowerCase()
      : "member";

  /*
   * Search is intentionally local for now.
   * We don't invent a backend search API.
   */
  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    /*
     * Basic dashboard search routing.
     * This can later be connected to a real search index
     * when a backend search endpoint exists.
     */
    const normalized =
      query.toLowerCase();

    if (
      normalized.includes("business")
    ) {
      router.push(
        "/dashboard/business"
      );
      return;
    }

    if (
      normalized.includes("qr")
    ) {
      router.push(
        "/dashboard/qr"
      );
      return;
    }

    if (
      normalized.includes("analytic")
    ) {
      router.push(
        "/dashboard/analytics"
      );
      return;
    }

    if (
      normalized.includes("staff")
    ) {
      router.push(
        "/dashboard/staff"
      );
      return;
    }

    if (
      normalized.includes("setting")
    ) {
      router.push(
        "/dashboard/settings"
      );
    }
  }

  /*
   * Logout:
   *
   * 1. Attempt backend logout.
   * 2. Always clear local session.
   * 3. Redirect to login.
   *
   * This is intentionally defensive because local
   * session cleanup must happen even if the API call fails.
   */
  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await apiRequest(
        "/auth/logout",
        {
          method: "POST",
        }
      );
    } catch {
      /*
       * Do not keep the browser session alive merely
       * because the logout request failed.
       */
    } finally {
      clearSession();
      router.replace("/login");
      router.refresh();
    }
  }

  function closeMenus() {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile brand */}
        <Link
          href="/dashboard"
          className="shrink-0 md:hidden"
        >
          <span className="text-lg font-bold tracking-tight text-slate-950">
            Tap
            <span className="text-blue-600">
              QR
            </span>
          </span>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:block"
        >
          <div className="flex h-10 w-[300px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 lg:w-[360px]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              id="dashboard-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search workspace..."
              aria-label="Search workspace"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            {search ? (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="rounded-md p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                /
              </kbd>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(
                (open) => !open
              );
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={
              notificationsOpen
            }
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <Bell className="h-[19px] w-[19px]" />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-3 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Notifications
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Stay updated with your workspace
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                  New
                </span>
              </div>

              <div className="px-4 py-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <Bell className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No notifications yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Important workspace alerts will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* Account */}
        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setProfileOpen(
                (open) => !open
              );
              setNotificationsOpen(
                false
              );
            }}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-600/20">
              {initials}
            </div>

            <div className="hidden max-w-[130px] text-left sm:block">
              <p className="truncate text-xs font-semibold text-slate-900">
                {firstName}
              </p>

              <p className="truncate text-[10px] capitalize text-slate-400">
                {role}
              </p>
            </div>

            <ChevronDown
              className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-3 w-[250px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10"
            >
              {/* User summary */}
              <div className="border-b border-slate-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {user?.fullName ||
                        "TapQR User"}
                    </p>

                    <p className="truncate text-[11px] text-slate-400">
                      {user?.email ||
                        user?.phone ||
                        "Authenticated account"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="p-2">
                <Link
                  href="/dashboard/settings"
                  role="menuitem"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Account settings
                </Link>

                <Link
                  href="/dashboard/business"
                  role="menuitem"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Business profile
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    void handleLogout();
                  }}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}

                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}