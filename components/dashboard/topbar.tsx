 "use client";

import {
  Bell,
  BarChart3,
  Building2,
  CheckCheck,
  ChevronDown,
  Info,
  LogOut,
  Menu,
  QrCode,
  Search,
  Settings,
  ShieldAlert,
  Star,
  User,
  Users,
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

import {
  extractNotifications,
  extractUnreadCount,
  formatNotificationTime,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/notifications";

interface TopbarProps {
  onMenuClick: () => void;
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "SECURITY":
      return <ShieldAlert className="h-4 w-4" />;
    case "BUSINESS":
      return <Building2 className="h-4 w-4" />;
    case "QR":
      return <QrCode className="h-4 w-4" />;
    case "STAFF":
      return <Users className="h-4 w-4" />;
    case "REVIEW":
      return <Star className="h-4 w-4" />;
    case "ANALYTICS":
      return <BarChart3 className="h-4 w-4" />;
    case "AUTH":
      return <ShieldAlert className="h-4 w-4" />;
    case "BILLING":
      return <Info className="h-4 w-4" />;
    case "SYSTEM":
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getNotificationIconClasses(
  type: Notification["type"]
) {
  switch (type) {
    case "SECURITY":
    case "AUTH":
      return "bg-red-50 text-red-600";
    case "BUSINESS":
    case "QR":
      return "bg-blue-50 text-blue-600";
    case "STAFF":
      return "bg-violet-50 text-violet-600";
    case "REVIEW":
      return "bg-amber-50 text-amber-600";
    case "ANALYTICS":
      return "bg-emerald-50 text-emerald-600";
    case "BILLING":
      return "bg-orange-50 text-orange-600";
    case "SYSTEM":
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getNotificationTypeLabel(
  type: Notification["type"]
) {
  return type.charAt(0) + type.slice(1).toLowerCase();
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

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsError, setNotificationsError] =
    useState("");

  const [markingAllRead, setMarkingAllRead] =
    useState(false);

  const [markingReadId, setMarkingReadId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [loggingOut, setLoggingOut] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement | null>(null);

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  /*
   * Load unread count when the dashboard shell mounts.
   * Poll periodically so notifications created elsewhere
   * become visible without requiring a full page refresh.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
      try {
        const response =
          await getUnreadNotificationCount();

        if (!cancelled) {
          setUnreadCount(
            extractUnreadCount(response)
          );
        }
      } catch {
        // Notification loading should never break the dashboard.
      }
    }

    void loadUnreadCount();

    const interval = window.setInterval(
      () => {
        void loadUnreadCount();
      },
      30000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  /*
   * Load the notification list when the dropdown opens.
   */
  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    let cancelled = false;

    async function loadNotifications() {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const response =
          await getNotifications({
            page: 1,
            limit: 8,
          });

        if (!cancelled) {
          setNotifications(
            extractNotifications(response)
          );
        }
      } catch {
        if (!cancelled) {
          setNotificationsError(
            "Unable to load notifications."
          );
        }
      } finally {
        if (!cancelled) {
          setNotificationsLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [notificationsOpen]);

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
   * Keyboard shortcuts.
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

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    const normalized =
      query.toLowerCase();

    if (normalized.includes("business")) {
      router.push(
        "/dashboard/business"
      );
      return;
    }

    if (normalized.includes("qr")) {
      router.push("/dashboard/qr");
      return;
    }

    if (normalized.includes("analytic")) {
      router.push(
        "/dashboard/analytics"
      );
      return;
    }

    if (normalized.includes("staff")) {
      router.push("/dashboard/staff");
      return;
    }

    if (normalized.includes("setting")) {
      router.push(
        "/dashboard/settings"
      );
    }
  }

  async function handleNotificationClick(
    notification: Notification
  ) {
    if (!notification.readAt) {
      setMarkingReadId(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );

      try {
        await markNotificationRead(
          notification.id
        );
      } catch {
        /*
         * Restore the unread state if the backend
         * rejected the operation.
         */
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  readAt: null,
                }
              : item
          )
        );

        setUnreadCount((current) =>
          current + 1
        );
      } finally {
        setMarkingReadId(null);
      }
    }

    setNotificationsOpen(false);

    if (notification.actionUrl) {
      const actionUrl =
        notification.actionUrl.trim();

      if (
        actionUrl.startsWith("/") &&
        !actionUrl.startsWith("//")
      ) {
        router.push(actionUrl);
      }
    }
  }

  async function handleMarkAllRead() {
    if (
      markingAllRead ||
      unreadCount === 0
    ) {
      return;
    }

    setMarkingAllRead(true);

    const previous =
      notifications;

    const previousCount =
      unreadCount;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt:
          notification.readAt ??
          new Date().toISOString(),
      }))
    );

    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
      setUnreadCount(previousCount);
    } finally {
      setMarkingAllRead(false);
    }
  }

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
      // Local session cleanup still happens.
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
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

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
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
            aria-expanded={
              notificationsOpen
            }
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <Bell className="h-[19px] w-[19px]" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black leading-none text-white ring-2 ring-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Notifications
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Stay updated with your workspace
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void handleMarkAllRead();
                    }}
                    disabled={markingAllRead}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {markingAllRead
                      ? "Updating..."
                      : "Mark all read"}
                  </button>
                )}
              </div>

              {notificationsLoading ? (
                <div className="space-y-2 px-4 py-4">
                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex gap-3 rounded-xl p-2"
                      >
                        <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                          <div className="h-2.5 w-full animate-pulse rounded bg-slate-100" />
                          <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : notificationsError ? (
                <div className="px-4 py-7 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Info className="h-4 w-4" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {notificationsError}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      window.setTimeout(
                        () =>
                          setNotificationsOpen(
                            true
                          ),
                        0
                      );
                    }}
                    className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
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
              ) : (
                <div className="max-h-[430px] overflow-y-auto">
                  {notifications.map(
                    (notification) => {
                      const unread =
                        !notification.readAt;

                      const isReading =
                        markingReadId ===
                        notification.id;

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            void handleNotificationClick(
                              notification
                            );
                          }}
                          disabled={isReading}
                          className={`group flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 disabled:cursor-wait ${
                            unread
                              ? "bg-blue-50/40"
                              : "bg-white"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getNotificationIconClasses(
                              notification.type
                            )}`}
                          >
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <p
                                className={`min-w-0 flex-1 truncate text-xs ${
                                  unread
                                    ? "font-bold text-slate-950"
                                    : "font-semibold text-slate-700"
                                }`}
                              >
                                {notification.title}
                              </p>

                              {unread && (
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                              {notification.message}
                            </p>

                            <div className="mt-1.5 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.08em] text-slate-400">
                              <span>
                                {getNotificationTypeLabel(
                                  notification.type
                                )}
                              </span>
                              <span>·</span>
                              <span className="normal-case tracking-normal">
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              <div className="border-t border-slate-100 px-4 py-3">
                <Link
                  href="/dashboard/notifications"
                  onClick={() =>
                    setNotificationsOpen(false)
                  }
                  className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  View all notifications
                </Link>
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
              setNotificationsOpen(false);
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
