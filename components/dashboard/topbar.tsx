"use client";

import {
  Bell,
  BarChart3,
  Building2,
  CheckCheck,
  ChevronDown,
  Headset,
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

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

/*
|--------------------------------------------------------------------------
| NOTIFICATION ICON
|--------------------------------------------------------------------------
*/

function getNotificationIcon(
  type: Notification["type"]
) {
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

/*
|--------------------------------------------------------------------------
| NOTIFICATION ICON COLORS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| NOTIFICATION TYPE LABEL
|--------------------------------------------------------------------------
*/

function getNotificationTypeLabel(
  type: Notification["type"]
) {
  return (
    type.charAt(0) +
    type.slice(1).toLowerCase()
  );
}

/*
|--------------------------------------------------------------------------
| TOPBAR
|--------------------------------------------------------------------------
*/

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | USER
  |--------------------------------------------------------------------------
  */

  const [user, setUser] =
    useState<AuthUser | null>(null);

  /*
  |--------------------------------------------------------------------------
  | MENUS
  |--------------------------------------------------------------------------
  */

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const [
    notificationsError,
    setNotificationsError,
  ] = useState("");

  const [
    markingAllRead,
    setMarkingAllRead,
  ] = useState(false);

  const [
    markingReadId,
    setMarkingReadId,
  ] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const [loggingOut, setLoggingOut] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | REFS
  |--------------------------------------------------------------------------
  */

  const profileRef =
    useRef<HTMLDivElement | null>(null);

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  /*
  |--------------------------------------------------------------------------
  | NOTIFICATION UNREAD COUNT
  |--------------------------------------------------------------------------
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
        /*
         * Notifications should never
         * break the dashboard.
         */
      }
    }

    void loadUnreadCount();

    const interval =
      window.setInterval(
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
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | CLOSE MENUS ON OUTSIDE CLICK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handlePointerDown = (
      event: PointerEvent
    ) => {
      const target =
        event.target as Node;

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
  |--------------------------------------------------------------------------
  | KEYBOARD SHORTCUTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      const tagName =
        target?.tagName?.toLowerCase();

      /*
       * "/" -> Search
       */

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

      /*
       * ESC -> Close menus
       */

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

  /*
  |--------------------------------------------------------------------------
  | USER INITIALS
  |--------------------------------------------------------------------------
  */

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

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  }, [user]);

  /*
  |--------------------------------------------------------------------------
  | USER DISPLAY
  |--------------------------------------------------------------------------
  */

  const firstName =
    user?.fullName
      ?.trim()
      .split(/\s+/)[0] ||
    "Account";

  const role =
    user?.role
      ? user.role.toLowerCase()
      : "member";

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const query =
      search.trim();

    if (!query) {
      return;
    }

    const normalized =
      query.toLowerCase();

    if (
      normalized.includes("support") ||
      normalized.includes("inbox") ||
      normalized.includes("whatsapp") ||
      normalized.includes("customer")
    ) {
      router.push(
        "/dashboard/support"
      );

      return;
    }

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
  |--------------------------------------------------------------------------
  | NOTIFICATION CLICK
  |--------------------------------------------------------------------------
  */

  async function handleNotificationClick(
    notification: Notification
  ) {
    if (!notification.readAt) {
      setMarkingReadId(
        notification.id
      );

      setNotifications(
        (current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  readAt:
                    new Date().toISOString(),
                }
              : item
          )
      );

      setUnreadCount(
        (current) =>
          Math.max(0, current - 1)
      );

      try {
        await markNotificationRead(
          notification.id
        );
      } catch {
        /*
         * Restore unread state if
         * backend rejects the operation.
         */

        setNotifications(
          (current) =>
            current.map((item) =>
              item.id === notification.id
                ? {
                    ...item,
                    readAt: null,
                  }
                : item
            )
        );

        setUnreadCount(
          (current) =>
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

  /*
  |--------------------------------------------------------------------------
  | MARK ALL NOTIFICATIONS READ
  |--------------------------------------------------------------------------
  */

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

    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            readAt:
              notification.readAt ??
              new Date().toISOString(),
          })
        )
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

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
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
       * Local session cleanup still happens.
       */
    } finally {
      clearSession();

      router.replace("/login");

      router.refresh();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CLOSE MENUS
  |--------------------------------------------------------------------------
  */

  function closeMenus() {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <header className="sticky top-0 z-40 h-[78px] border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* ================================================================
            LEFT
        ================================================================= */}

        <div className="flex min-w-0 flex-1 items-center gap-3">

          {/* Mobile menu */}

          <button
            type="button"
            onClick={onMenuClick}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/10 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-[18px] w-[18px] transition-transform group-hover:scale-105" />
          </button>

          {/* Mobile logo */}

          <Link
            href="/dashboard"
            className="group shrink-0 md:hidden"
          >
            <span className="text-[19px] font-black tracking-[-0.04em] text-slate-950">
              Tap
              <span className="text-blue-600">
                QR
              </span>
            </span>
          </Link>

          {/* Desktop search */}

          <form
            onSubmit={
              handleSearchSubmit
            }
            className="hidden min-w-0 md:block"
          >
            <div className="group flex h-11 w-[320px] items-center gap-3 rounded-[14px] border border-slate-200/90 bg-slate-50/80 px-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-200 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-[0_8px_30px_rgba(37,99,235,0.08)] focus-within:ring-4 focus-within:ring-blue-500/[0.06] lg:w-[390px]">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/70 transition-colors group-focus-within:text-blue-600">
                <Search className="h-3.5 w-3.5" />
              </div>

              <input
                id="dashboard-search"
                type="search"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search your workspace..."
                aria-label="Search workspace"
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />

              {search ? (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="hidden h-6 items-center rounded-md border border-slate-200 bg-white px-2 text-[10px] font-bold text-slate-400 shadow-sm sm:flex">
                  /
                </kbd>
              )}
            </div>
          </form>
        </div>

        {/* ================================================================
            RIGHT
        ================================================================= */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">

          {/* ================================================================
              SUPPORT / INBOX
          ================================================================= */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/support"
              )
            }
            className="group relative flex h-11 items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:px-3"
            title="Support Inbox"
            aria-label="Open Support Inbox"
          >

            {/* Icon */}

            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_5px_15px_rgba(79,70,229,0.25)] transition-transform duration-200 group-hover:scale-105">

              <Headset className="relative z-10 h-[16px] w-[16px] stroke-[2.2]" />

              <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white/20 blur-md" />
            </span>

            {/* Text */}

            <span className="hidden text-left xl:block">
              <span className="block text-[11px] font-extrabold leading-none tracking-tight text-slate-900">
                Inbox
              </span>

              <span className="mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" />
                Live
              </span>
            </span>

            {/* Live indicator */}

            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm xl:hidden" />
          </button>

          {/* ================================================================
              SEPARATOR
          ================================================================= */}

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* ================================================================
              NOTIFICATIONS
          ================================================================= */}

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
              className={`group relative flex h-11 w-11 items-center justify-center rounded-[14px] border bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                notificationsOpen
                  ? "border-blue-200 text-blue-600 shadow-[0_8px_25px_rgba(37,99,235,0.10)]"
                  : "border-slate-200 text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-md"
              }`}
            >
              <Bell className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105" />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[8px] font-black leading-none text-white shadow-sm">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* ==============================================================
                NOTIFICATION DROPDOWN
            =============================================================== */}

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-[370px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">

                {/* Header */}

                <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-4">

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                        <Bell className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-extrabold tracking-tight text-slate-950">
                          Notifications
                        </p>

                        <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                          Stay updated with your workspace
                        </p>
                      </div>

                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleMarkAllRead();
                        }}
                        disabled={
                          markingAllRead
                        }
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />

                        {markingAllRead
                          ? "Updating..."
                          : "Mark all"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Loading */}

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
                  /* Error */

                  <div className="px-4 py-8 text-center">

                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                      <Info className="h-4 w-4" />
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      {notificationsError}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(
                          false
                        );

                        window.setTimeout(
                          () =>
                            setNotificationsOpen(
                              true
                            ),
                          0
                        );
                      }}
                      className="mt-3 text-xs font-bold text-blue-600 transition hover:text-blue-700"
                    >
                      Try again
                    </button>
                  </div>
                ) : notifications.length ===
                  0 ? (
                  /* Empty */

                  <div className="px-4 py-10 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/70">
                      <Bell className="h-5 w-5" />
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-700">
                      You're all caught up
                    </p>

                    <p className="mx-auto mt-1 max-w-[230px] text-[11px] leading-5 text-slate-400">
                      Important workspace alerts will appear here.
                    </p>
                  </div>
                ) : (
                  /* Notifications */

                  <div className="max-h-[430px] overflow-y-auto">

                    {notifications.map(
                      (
                        notification
                      ) => {
                        const unread =
                          !notification.readAt;

                        const isReading =
                          markingReadId ===
                          notification.id;

                        return (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() => {
                              void handleNotificationClick(
                                notification
                              );
                            }}
                            disabled={
                              isReading
                            }
                            className={`group flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-b-0 hover:bg-slate-50 disabled:cursor-wait ${
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
                                      ? "font-extrabold text-slate-950"
                                      : "font-semibold text-slate-700"
                                  }`}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {unread && (
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                                {
                                  notification.message
                                }
                              </p>

                              <div className="mt-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">

                                <span>
                                  {getNotificationTypeLabel(
                                    notification.type
                                  )}
                                </span>

                                <span>
                                  ·
                                </span>

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

                {/* Footer */}

                <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() =>
                      setNotificationsOpen(
                        false
                      )
                    }
                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================
              ACCOUNT
          ================================================================= */}

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

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
              aria-expanded={
                profileOpen
              }
              aria-haspopup="menu"
              className={`group flex h-11 items-center gap-2 rounded-[14px] border bg-white p-1.5 pr-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                profileOpen
                  ? "border-blue-200 shadow-[0_8px_25px_rgba(37,99,235,0.08)]"
                  : "border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              }`}
            >

              {/* Avatar */}

              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-[10px] font-black text-white shadow-[0_4px_12px_rgba(79,70,229,0.20)]">

                <span className="relative z-10">
                  {initials}
                </span>

                <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/20 blur-md" />
              </div>

              {/* User info */}

              <div className="hidden max-w-[130px] text-left lg:block">

                <p className="truncate text-[11px] font-extrabold leading-4 text-slate-900">
                  {firstName}
                </p>

                <p className="truncate text-[9px] font-semibold capitalize text-slate-400">
                  {role}
                </p>
              </div>

              <ChevronDown
                className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-200 lg:block ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* ==============================================================
                ACCOUNT DROPDOWN
            =============================================================== */}

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-3 w-[270px] overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
              >

                {/* Profile header */}

                <div className="bg-gradient-to-br from-slate-50 to-white px-4 py-4">

                  <div className="flex items-center gap-3">

                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-xs font-black text-white shadow-[0_7px_20px_rgba(79,70,229,0.20)]">

                      <span className="relative z-10">
                        {initials}
                      </span>

                      <span className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white/20 blur-md" />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-extrabold tracking-tight text-slate-950">
                        {user?.fullName ||
                          "TapQR User"}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                        {user?.email ||
                          user?.phone ||
                          "Authenticated account"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu */}

                <div className="border-t border-slate-100 p-2">

                  <Link
                    href="/dashboard/settings"
                    role="menuitem"
                    onClick={
                      closeMenus
                    }
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      <Settings className="h-4 w-4" />
                    </span>

                    <span>
                      Account settings
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/business"
                    role="menuitem"
                    onClick={
                      closeMenus
                    }
                    className="group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      <User className="h-4 w-4" />
                    </span>

                    <span>
                      Business profile
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/support"
                    role="menuitem"
                    onClick={
                      closeMenus
                    }
                    className="group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      <Headset className="h-4 w-4" />
                    </span>

                    <span>
                      Support Inbox
                    </span>
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
                    disabled={
                      loggingOut
                    }
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition group-hover:bg-red-100">
                      {loggingOut ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </span>

                    <span>
                      {loggingOut
                        ? "Signing out..."
                        : "Sign out"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}