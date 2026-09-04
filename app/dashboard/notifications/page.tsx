"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Star,
  Users,
  Building2,
  QrCode,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api";

import {
  extractNotifications,
  extractUnreadCount,
  formatNotificationTime,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  retryNotification,
  type Notification,
  type NotificationType,
} from "@/lib/notifications";

const PAGE_SIZE = 20;

const FILTERS: Array<{
  value: "ALL" | NotificationType;
  label: string;
}> = [
  { value: "ALL", label: "All" },
  { value: "SECURITY", label: "Security" },
  { value: "AUTH", label: "Auth" },
  { value: "BUSINESS", label: "Business" },
  { value: "QR", label: "QR" },
  { value: "STAFF", label: "Staff" },
  { value: "REVIEW", label: "Reviews" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "BILLING", label: "Billing" },
  { value: "SYSTEM", label: "System" },
];

function getIcon(type: NotificationType) {
  switch (type) {
    case "SECURITY":
    case "AUTH":
      return <ShieldAlert className="h-5 w-5" />;
    case "BUSINESS":
      return <Building2 className="h-5 w-5" />;
    case "QR":
      return <QrCode className="h-5 w-5" />;
    case "STAFF":
      return <Users className="h-5 w-5" />;
    case "REVIEW":
      return <Star className="h-5 w-5" />;
    case "ANALYTICS":
      return <BarChart3 className="h-5 w-5" />;
    case "BILLING":
      return <Info className="h-5 w-5" />;
    case "SYSTEM":
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function getIconClasses(type: NotificationType) {
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
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getTypeLabel(type: NotificationType) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading notifications.";
}

function extractPagination(
  response: Awaited<ReturnType<typeof getNotifications>>,
  page: number
) {
  const data = response?.data;

  const total = Number(data?.total ?? 0);
  const returnedPage = Number(data?.page ?? page);
  const limit = Number(data?.limit ?? PAGE_SIZE);

  let totalPages = Number(
    data?.totalPages ?? 0
  );

  if (!totalPages && total > 0 && limit > 0) {
    totalPages = Math.ceil(total / limit);
  }

  if (!totalPages) {
    totalPages =
      extractNotifications(response).length < limit
        ? returnedPage
        : returnedPage + 1;
  }

  return {
    total,
    page: returnedPage,
    limit,
    totalPages: Math.max(1, totalPages),
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [filter, setFilter] =
    useState<"ALL" | NotificationType>("ALL");

  const [unreadOnly, setUnreadOnly] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [markingId, setMarkingId] =
    useState<string | null>(null);

  const [markingAll, setMarkingAll] =
    useState(false);

  const [retryingId, setRetryingId] =
    useState<string | null>(null);

  const loadUnreadCount = useCallback(
    async () => {
      try {
        const response =
          await getUnreadNotificationCount();

        setUnreadCount(
          extractUnreadCount(response)
        );
      } catch {
        // Keep page usable if count fails.
      }
    },
    []
  );

  const loadNotifications = useCallback(
    async (showRefresh = false) => {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response =
          await getNotifications({
            page,
            limit: PAGE_SIZE,
            unreadOnly,
            ...(filter !== "ALL"
              ? { type: filter }
              : {}),
          });

        const items =
          extractNotifications(response);

        const pagination =
          extractPagination(
            response,
            page
          );

        setNotifications(items);
        setTotal(pagination.total);
        setTotalPages(
          pagination.totalPages
        );

        if (
          pagination.page !== page
        ) {
          setPage(
            pagination.page
          );
        }
      } catch (err) {
        if (
          err instanceof ApiError &&
          err.status === 401
        ) {
          return;
        }

        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, page, unreadOnly]
  );

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        void loadUnreadCount();
      }, 30000);

    return () =>
      window.clearInterval(
        interval
      );
  }, [loadUnreadCount]);

  async function handleMarkRead(
    notification: Notification
  ) {
    if (
      notification.readAt ||
      markingId
    ) {
      return;
    }

    setMarkingId(notification.id);

    setNotifications((current) =>
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

    setUnreadCount((current) =>
      Math.max(0, current - 1)
    );

    try {
      await markNotificationRead(
        notification.id
      );
    } catch {
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
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (
      markingAll ||
      unreadCount === 0
    ) {
      return;
    }

    const previous =
      notifications;
    const previousCount =
      unreadCount;

    setMarkingAll(true);

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        readAt:
          item.readAt ??
          new Date().toISOString(),
      }))
    );

    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
      setUnreadCount(
        previousCount
      );
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleRetry(
    notification: Notification
  ) {
    const hasFailedDelivery =
      notification.deliveries?.some(
        (delivery) =>
          delivery.status === "FAILED"
      );

    if (
      !hasFailedDelivery ||
      retryingId
    ) {
      return;
    }

    setRetryingId(notification.id);

    try {
      await retryNotification(
        notification.id
      );

      await loadNotifications(true);
    } catch {
      setError(
        "Unable to retry this notification."
      );
    } finally {
      setRetryingId(null);
    }
  }

  function handleFilterChange(
    value: "ALL" | NotificationType
  ) {
    setFilter(value);
    setPage(1);
  }

  function handleUnreadOnlyChange(
    value: boolean
  ) {
    setUnreadOnly(value);
    setPage(1);
  }

  const showingFrom =
    total === 0
      ? 0
      : (page - 1) *
          PAGE_SIZE +
        1;

  const showingTo =
    total === 0
      ? 0
      : Math.min(
          page * PAGE_SIZE,
          total
        );

  const hasFailedDeliveries =
    useMemo(
      () =>
        notifications.some(
          (notification) =>
            notification.deliveries?.some(
              (delivery) =>
                delivery.status ===
                "FAILED"
            )
        ),
      [notifications]
    );

  return (
    <main className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Bell className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Important account and workspace activity in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void loadNotifications(
                  true
                );
                void loadUnreadCount();
              }}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => {
                void handleMarkAllRead();
              }}
              disabled={
                markingAll ||
                unreadCount === 0
              }
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark all as read
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {total}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
              Unread
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-500">
              Current page
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {page} / {totalPages}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  handleFilterChange(
                    item.value
                  )
                }
                className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                  filter === item.value
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) =>
                handleUnreadOnlyChange(
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Unread only
          </label>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1">
            {error}
          </span>
          <button
            type="button"
            onClick={() => {
              setError("");
              void loadNotifications(
                true
              );
            }}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold hover:bg-red-100"
          >
            Retry
          </button>
        </section>
      )}

      {/* List */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Activity center
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                Your notifications
              </h2>
            </div>

            {hasFailedDeliveries && (
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-red-600">
                Failed delivery available
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="flex gap-4 px-5 py-5 sm:px-6"
                >
                  <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Bell className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-800">
              No notifications found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-400">
              {unreadOnly
                ? "You have no unread notifications matching the selected filter."
                : "Important workspace alerts and account activity will appear here."}
            </p>

            {(unreadOnly ||
              filter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setFilter("ALL");
                  setUnreadOnly(false);
                  setPage(1);
                }}
                className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(
              (notification) => {
                const unread =
                  !notification.readAt;

                const failed =
                  notification.deliveries?.some(
                    (delivery) =>
                      delivery.status ===
                      "FAILED"
                  );

                const marking =
                  markingId ===
                  notification.id;

                const retrying =
                  retryingId ===
                  notification.id;

                return (
                  <article
                    key={notification.id}
                    className={`px-5 py-5 transition sm:px-6 ${
                      unread
                        ? "bg-blue-50/35"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getIconClasses(
                          notification.type
                        )}`}
                      >
                        {getIcon(
                          notification.type
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`truncate text-sm ${
                                  unread
                                    ? "font-bold text-slate-950"
                                    : "font-semibold text-slate-800"
                                }`}
                              >
                                {
                                  notification.title
                                }
                              </h3>

                              {unread && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                              <span>
                                {getTypeLabel(
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

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                              unread
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {unread
                              ? "Unread"
                              : "Read"}
                          </span>
                        </div>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                          {
                            notification.message
                          }
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {!notification.readAt && (
                            <button
                              type="button"
                              onClick={() => {
                                void handleMarkRead(
                                  notification
                                );
                              }}
                              disabled={
                                marking
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                              {marking ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Mark as read
                            </button>
                          )}

                          {notification.actionUrl &&
                            notification.actionUrl.startsWith(
                              "/"
                            ) &&
                            !notification.actionUrl.startsWith(
                              "//"
                            ) && (
                              <Link
                                href={
                                  notification.actionUrl
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-slate-800"
                              >
                                Open
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            )}

                          {failed && (
                            <button
                              type="button"
                              onClick={() => {
                                void handleRetry(
                                  notification
                                );
                              }}
                              disabled={
                                retrying
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              {retrying ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                              )}
                              {retrying
                                ? "Retrying..."
                                : "Retry delivery"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          notifications.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-600">
                  {showingFrom}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-600">
                  {showingTo}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-600">
                  {total}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                    )
                  }
                  disabled={page <= 1}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-xs font-bold text-white">
                  {page}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                    )
                  }
                  disabled={
                    page >= totalPages
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}
