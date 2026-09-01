"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  ExternalLink,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import { apiRequest, ApiError } from "@/lib/api";
import {
  AuthUser,
  saveUser,
} from "@/lib/auth";

type Business = {
  id: string;
  name: string;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  description?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BusinessesResponse = {
  success?: boolean;
  message?: string;
  data?: Business[];
};

type MeResponse = {
  success?: boolean;
  message?: string;
  data?: AuthUser;
  user?: AuthUser;
};

type AnalyticsData = {
  overview?: {
    totalScans?: number;
    uniqueVisitors?: number;
    previousPeriodScans?: number;
    percentageChange?: number;
    activeQrCodes?: number;
    totalQrCodes?: number;
    averageDailyScans?: number;
  };
  scansByDay?: Array<{
    date: string;
    scans: number | string;
  }>;
  qrPerformance?: Array<{
    id: string;
    name: string;
    shortCode?: string;
    scanCount?: number | string;
    status?: string;
    experienceType?: string;
  }>;
  recentScans?: Array<{
    id: string;
    qrCodeId: string;
    city?: string | null;
    country?: string | null;
    device?: string | null;
    browser?: string | null;
    operatingSystem?: string | null;
    referrer?: string | null;
    scannedAt: string;
  }>;
};

type AnalyticsResponse = {
  success?: boolean;
  message?: string;
  data?: AnalyticsData;
};

const BUSINESS_STORAGE_KEY =
  "tapqr_current_business_id";

function numberValue(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "TQ";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load your dashboard.";
}

export default function DashboardPage() {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [selectedBusinessId, setSelectedBusinessId] =
    useState("");

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [businessMenuOpen, setBusinessMenuOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [meResponse, businessResponse] =
          await Promise.all([
            apiRequest<MeResponse>(
              "/auth/me"
            ),
            apiRequest<BusinessesResponse>(
              "/businesses"
            ),
          ]);

        const currentUser =
          meResponse?.data ??
          meResponse?.user ??
          null;

        if (currentUser) {
          setUser(currentUser);
          saveUser(currentUser);
        }

        const nextBusinesses =
          businessResponse?.data ?? [];

        setBusinesses(nextBusinesses);

        const storedId =
          typeof window !== "undefined"
            ? localStorage.getItem(
                BUSINESS_STORAGE_KEY
              )
            : null;

        const nextId =
          nextBusinesses.find(
            (business) =>
              business.id === storedId
          )?.id ??
          nextBusinesses[0]?.id ??
          "";

        setSelectedBusinessId(nextId);

        if (
          nextId &&
          typeof window !== "undefined"
        ) {
          localStorage.setItem(
            BUSINESS_STORAGE_KEY,
            nextId
          );
        }

        if (nextId) {
          const analyticsResponse =
            await apiRequest<AnalyticsResponse>(
              `/analytics/business/${nextId}?days=30&limit=10`
            );

          setAnalytics(
            analyticsResponse?.data ??
              null
          );
        } else {
          setAnalytics(null);
        }
      } catch (err) {
        if (
          err instanceof ApiError &&
          err.status === 401
        ) {
          window.location.replace(
            "/login"
          );
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
    []
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) =>
          business.id ===
          selectedBusinessId
      ) ?? null,
    [businesses, selectedBusinessId]
  );

  const overview =
    analytics?.overview ?? {};

  const totalScans =
    numberValue(
      overview.totalScans
    );

  const uniqueVisitors =
    numberValue(
      overview.uniqueVisitors
    );

  const percentageChange =
    numberValue(
      overview.percentageChange
    );

  const activeQrCodes =
    numberValue(
      overview.activeQrCodes
    );

  const totalQrCodes =
    numberValue(
      overview.totalQrCodes
    );

  const recentScans =
    analytics?.recentScans ?? [];

  const qrPerformance =
    [...(analytics?.qrPerformance ?? [])]
      .sort(
        (a, b) =>
          numberValue(
            b.scanCount
          ) -
          numberValue(
            a.scanCount
          )
      )
      .slice(0, 5);

  const dailyScans =
    analytics?.scansByDay ?? [];

  const dailyMax = Math.max(
    1,
    ...dailyScans.map((row) =>
      numberValue(row.scans)
    )
  );

  const firstName =
    user?.fullName
      ?.trim()
      .split(/\s+/)[0] ?? "there";

  async function refreshDashboard() {
    setSuccess("");
    await loadDashboard(true);
    setSuccess(
      "Dashboard refreshed."
    );

    window.setTimeout(
      () => setSuccess(""),
      2000
    );
  }

  async function changeBusiness(
    businessId: string
  ) {
    setSelectedBusinessId(
      businessId
    );
    setBusinessMenuOpen(false);

    if (
      typeof window !== "undefined"
    ) {
      localStorage.setItem(
        BUSINESS_STORAGE_KEY,
        businessId
      );
    }

    try {
      setError("");
      setAnalytics(null);

      const response =
        await apiRequest<AnalyticsResponse>(
          `/analytics/business/${businessId}?days=30&limit=10`
        );

      setAnalytics(
        response?.data ?? null
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  }

  if (loading) {
    return (
      <DashboardSkeleton />
    );
  }

  return (
    <main className="space-y-7">
      {error && (
        <Alert
          tone="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {success && (
        <Alert
          tone="success"
          message={success}
          onClose={() =>
            setSuccess("")
          }
        />
      )}

      {/* HERO */}
      <section className="relative overflow-visible rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-violet-100/40 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              Workspace overview
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Welcome back,{" "}
              {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your business, QR experiences and customer activity from one secure workspace.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {selectedBusiness && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setBusinessMenuOpen(
                        (open) => !open
                      )
                    }
                    aria-expanded={
                      businessMenuOpen
                    }
                    aria-haspopup="listbox"
                    className="inline-flex max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                      {getInitials(
                        selectedBusiness.name
                      )}
                    </span>

                    <span className="max-w-[220px] truncate">
                      {selectedBusiness.name}
                    </span>

                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {businessMenuOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Current workspace
                      </p>

                      <div className="max-h-64 overflow-y-auto">
                        {businesses.map(
                          (business) => (
                            <button
                              key={business.id}
                              type="button"
                              onClick={() =>
                                void changeBusiness(
                                  business.id
                                )
                              }
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                business.id ===
                                selectedBusinessId
                                  ? "bg-slate-950 text-white"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                                {getInitials(
                                  business.name
                                )}
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold">
                                  {business.name}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.12em] opacity-50">
                                  {business.status ??
                                    "ACTIVE"}
                                </span>
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user?.role && (
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void refreshDashboard()
              }
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

            <Link
              href="/dashboard/qr"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create QR
            </Link>
          </div>
        </div>
      </section>

      {/* ACCOUNT STATUS */}
      <section className="rounded-[22px] border border-emerald-100 bg-emerald-50/60 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-bold text-emerald-950">
              Secure workspace
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-800/70">
              Your dashboard is connected through the authenticated API session. Expired access tokens are handled by the shared API client.
            </p>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Businesses"
          value={businesses.length}
          helper="Available workspaces"
          icon={
            <Building2 className="h-5 w-5" />
          }
          tone="blue"
        />

        <MetricCard
          label="Active QR codes"
          value={activeQrCodes}
          helper={`${totalQrCodes} total QR codes`}
          icon={
            <QrCode className="h-5 w-5" />
          }
          tone="green"
        />

        <MetricCard
          label="Total scans"
          value={totalScans}
          helper="Last 30 days"
          icon={
            <ScanLine className="h-5 w-5" />
          }
          tone="violet"
        />

        <MetricCard
          label="Estimated visitors"
          value={uniqueVisitors}
          helper="Distinct recorded IPs"
          icon={
            <Eye className="h-5 w-5" />
          }
          tone="amber"
        />
      </section>

      {/* PERFORMANCE */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Performance
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Scan activity
                </h2>
              </div>

              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-950"
              >
                Analytics
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {dailyScans.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">
                <BarChart3 className="h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm font-bold text-slate-700">
                  No scan activity yet
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  Share an active TapQR code and your scan trend will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex min-w-[620px] items-end gap-2 sm:gap-3">
                  {dailyScans.map(
                    (item) => {
                      const scans =
                        numberValue(
                          item.scans
                        );

                      const height = Math.max(
                        scans === 0
                          ? 3
                          : 8,
                        Math.round(
                          (scans /
                            dailyMax) *
                            190
                        )
                      );

                      return (
                        <div
                          key={item.date}
                          className="flex min-w-[20px] flex-1 flex-col items-center justify-end gap-2"
                        >
                          <span className="text-[9px] font-bold text-slate-500">
                            {scans}
                          </span>

                          <div
                            className="w-full max-w-[28px] rounded-t-lg bg-blue-500 transition-all duration-500"
                            style={{
                              height: `${height}px`,
                            }}
                            title={`${scans} scans on ${formatShortDate(
                              item.date
                            )}`}
                          />

                          <span className="text-[9px] text-slate-400">
                            {formatShortDate(
                              item.date
                            )}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Growth
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-950">
              Period performance
            </h2>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    percentageChange < 0
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {percentageChange < 0 ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : (
                    <TrendingUp className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <p className="text-3xl font-bold tracking-tight text-slate-950">
                    {percentageChange > 0
                      ? "+"
                      : ""}
                    {percentageChange.toFixed(
                      1
                    )}
                    %
                  </p>

                  <p className="text-xs text-slate-400">
                    Compared with the previous period
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <SmallMetric
                  label="Scans"
                  value={formatNumber(
                    totalScans
                  )}
                />

                <SmallMetric
                  label="Active QR"
                  value={formatNumber(
                    activeQrCodes
                  )}
                />
              </div>
            </div>

            <Link
              href="/dashboard/analytics"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Open full analytics
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </section>

      {/* QR PERFORMANCE + RECENT ACTIVITY */}
      <section className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                QR performance
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                Top QR codes
              </h2>
            </div>

            <Link
              href="/dashboard/qr"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-950"
            >
              Manage
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {qrPerformance.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center">
                <QrCode className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm font-bold text-slate-700">
                  No QR codes yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Create your first QR experience to start tracking performance.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {qrPerformance.map(
                  (qr, index) => (
                    <div
                      key={qr.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-500 shadow-sm">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {qr.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {qr.experienceType ??
                            "QR experience"}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-bold text-slate-900">
                        {formatNumber(
                          numberValue(
                            qr.scanCount
                          )
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Activity
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                Recent scans
              </h2>
            </div>

            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-950"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentScans.length === 0 ? (
              <div className="px-5 py-12 text-center sm:px-6">
                <ScanLine className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">
                  No scans yet
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Visitor activity will appear here after your first scan.
                </p>
              </div>
            ) : (
              recentScans
                .slice(0, 6)
                .map((scan) => (
                  <div
                    key={scan.id}
                    className="px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ScanLine className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {[
                            scan.city,
                            scan.country,
                          ]
                            .filter(Boolean)
                            .join(
                              ", "
                            ) ||
                            "Visitor scan"}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-400">
                          {[
                            scan.device,
                            scan.browser,
                          ]
                            .filter(Boolean)
                            .join(
                              " · "
                            ) ||
                            "Device information unavailable"}
                        </p>
                      </div>

                      <time
                        dateTime={
                          scan.scannedAt
                        }
                        className="hidden shrink-0 text-[10px] text-slate-400 sm:block"
                      >
                        {formatDateTime(
                          scan.scannedAt
                        )}
                      </time>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Quick actions
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Common workspace tasks
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <QuickAction
            href="/dashboard/business"
            icon={
              <Building2 className="h-5 w-5" />
            }
            title="Manage business"
            description="Update profile and workspace details"
          />

          <QuickAction
            href="/dashboard/qr"
            icon={
              <QrCode className="h-5 w-5" />
            }
            title="Create a QR"
            description="Build a new customer experience"
          />

          <QuickAction
            href="/dashboard/analytics"
            icon={
              <BarChart3 className="h-5 w-5" />
            }
            title="View analytics"
            description="Understand scans and traffic"
          />
        </div>
      </section>

      {/* EMPTY BUSINESS CTA */}
      {businesses.length === 0 && (
        <section className="rounded-[24px] border border-blue-100 bg-blue-50/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <div>
                <p className="text-sm font-bold text-blue-950">
                  Your workspace is ready for setup
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-900/70">
                  Create a business first, then connect QR experiences and analytics to it.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/business"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              Create business
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  icon: React.ReactNode;
  tone:
    | "blue"
    | "green"
    | "violet"
    | "amber";
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    green:
      "bg-emerald-50 text-emerald-600",
    violet:
      "bg-violet-50 text-violet-600",
    amber:
      "bg-amber-50 text-amber-600",
  };

  return (
    <article className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {helper}
      </p>
    </article>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
          {icon}
        </div>

        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-700" />
      </div>

      <p className="mt-4 text-sm font-bold text-slate-950">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </Link>
  );
}

function Alert({
  tone,
  message,
  onClose,
}: {
  tone: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  const success =
    tone === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <span className="min-w-0 flex-1">
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss message"
        className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="space-y-7">
      <div className="h-48 animate-pulse rounded-[28px] bg-white" />

      <div className="h-20 animate-pulse rounded-[22px] bg-white" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-[22px] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <div className="h-[380px] animate-pulse rounded-[28px] bg-white" />
        <div className="h-[380px] animate-pulse rounded-[28px] bg-white" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-[330px] animate-pulse rounded-[24px] bg-white" />
        <div className="h-[330px] animate-pulse rounded-[24px] bg-white" />
      </div>
    </main>
  );
}
