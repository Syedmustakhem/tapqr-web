"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  Globe2,
  MonitorSmartphone,
  QrCode,
  RefreshCw,
  ScanLine,
  Smartphone,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type QRStatus =
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | string;

type QRType =
  | "STATIC"
  | "DYNAMIC"
  | string;

type QRExperienceType =
  | "BUSINESS"
  | "CATALOG"
  | "MENU"
  | "SERVICES"
  | "PRODUCTS"
  | "CONTACT"
  | "REDIRECT"
  | string;

type QRCodeSummary = {
  id: string;
  name: string;
  shortCode?: string;
  scanCount?: number;
  status?: QRStatus;
  type?: QRType;
  experienceType?: QRExperienceType;
  createdAt?: string;
  updatedAt?: string;
};

type BreakdownRow = {
  name?: string | null;
  scans?: number | string | null;
};

type DailyScan = {
  date: string;
  scans: number | string;
};

type RecentScan = {
  id: string;
  qrCodeId: string;
  city?: string | null;
  country?: string | null;
  device?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  referrer?: string | null;
  scannedAt: string;
};

type AnalyticsData = {
  period?: {
    days?: number;
    startDate?: string;
    endDate?: string;
  };

  overview?: {
    totalScans?: number;
    uniqueVisitors?: number;
    previousPeriodScans?: number;
    percentageChange?: number;
    activeQrCodes?: number;
    totalQrCodes?: number;
    averageDailyScans?: number;
  };

  scansByDay?: DailyScan[];

  qrPerformance?: QRCodeSummary[];

  locations?: {
    countries?: BreakdownRow[];
    cities?: BreakdownRow[];
  };

  technology?: {
    devices?: BreakdownRow[];
    browsers?: BreakdownRow[];
    operatingSystems?: BreakdownRow[];
  };

  referrers?: BreakdownRow[];

  recentScans?: RecentScan[];
};

type AnalyticsResponse = {
  success?: boolean;
  message?: string;
  data?: AnalyticsData;
};

type Business = {
  id: string;
  name: string;
  status?: string;
  logo?: string | null;
};

type BusinessesResponse = {
  success?: boolean;
  message?: string;
  data?: Business[];
};

type RangeKey =
  | 7
  | 30
  | 90
  | 365;

const RANGE_OPTIONS: Array<{
  value: RangeKey;
  label: string;
}> = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 365, label: "Last 365 days" },
];

const EXPERIENCE_LABELS: Record<
  string,
  string
> = {
  BUSINESS: "Business profile",
  CATALOG: "Catalog",
  MENU: "Menu",
  SERVICES: "Services",
  PRODUCTS: "Products",
  CONTACT: "Contact",
  REDIRECT: "URL redirect",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function numberValue(
  value: unknown,
  fallback = 0
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(value);
    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  return fallback;
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}

function formatPercent(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(
    1
  )}%`;
}

function formatShortDate(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function formatDateTime(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function initials(
  value: string
) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "TQ";
  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function getErrorMessage(
  error: unknown
) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load analytics. Please try again.";
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AnalyticsPage() {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [selectedBusinessId, setSelectedBusinessId] =
    useState("");

  const [range, setRange] =
    useState<RangeKey>(30);

  const [rangeOpen, setRangeOpen] =
    useState(false);

  const [businessOpen, setBusinessOpen] =
    useState(false);

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(
      null
    );

  const [loadingBusinesses, setLoadingBusinesses] =
    useState(true);

  const [loadingAnalytics, setLoadingAnalytics] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) =>
          business.id ===
          selectedBusinessId
      ) ?? null,
    [businesses, selectedBusinessId]
  );

  const loadBusinesses = useCallback(
    async () => {
      try {
        setLoadingBusinesses(true);
        setError("");

        const response =
          await apiRequest<BusinessesResponse>(
            "/businesses"
          );

        const data =
          response?.data ?? [];

        setBusinesses(data);

        const storedId =
          typeof window !==
          "undefined"
            ? localStorage.getItem(
                "tapqr_current_business_id"
              )
            : null;

        const nextId =
          data.find(
            (business) =>
              business.id ===
              storedId
          )?.id ??
          data[0]?.id ??
          "";

        setSelectedBusinessId(
          nextId
        );

        if (
          nextId &&
          typeof window !==
            "undefined"
        ) {
          localStorage.setItem(
            "tapqr_current_business_id",
            nextId
          );
        }
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoadingBusinesses(
          false
        );
      }
    },
    []
  );

  const loadAnalytics =
    useCallback(
      async (
        businessId: string,
        days: RangeKey,
        showRefresh = false
      ) => {
        if (!businessId) {
          setAnalytics(null);
          setLoadingAnalytics(
            false
          );
          return;
        }

        try {
          setError("");

          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoadingAnalytics(true);
          }

          const response =
            await apiRequest<AnalyticsResponse>(
              `/analytics/business/${businessId}?days=${days}&limit=10`
            );

          setAnalytics(
            response?.data ?? null
          );
        } catch (err) {
          setError(
            getErrorMessage(err)
          );
        } finally {
          setLoadingAnalytics(
            false
          );
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (
      !selectedBusinessId
    ) {
      return;
    }

    void loadAnalytics(
      selectedBusinessId,
      range
    );
  }, [
    selectedBusinessId,
    range,
    loadAnalytics,
  ]);

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

  const previousPeriodScans =
    numberValue(
      overview.previousPeriodScans
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

  const averageDailyScans =
    numberValue(
      overview.averageDailyScans,
      range
        ? totalScans / range
        : 0
    );

  const dailySeries =
    analytics?.scansByDay ?? [];

  const qrPerformance =
    analytics?.qrPerformance ?? [];

  const countries =
    analytics?.locations
      ?.countries ?? [];

  const cities =
    analytics?.locations
      ?.cities ?? [];

  const devices =
    analytics?.technology
      ?.devices ?? [];

  const browsers =
    analytics?.technology
      ?.browsers ?? [];

  const operatingSystems =
    analytics?.technology
      ?.operatingSystems ?? [];

  const referrers =
    analytics?.referrers ?? [];

  const recentScans =
    analytics?.recentScans ?? [];

  const trendDirection =
    percentageChange > 0
      ? "up"
      : percentageChange < 0
        ? "down"
        : "neutral";

  const chartMax = useMemo(
    () =>
      Math.max(
        1,
        ...dailySeries.map(
          (item) =>
            numberValue(
              item.scans
            )
        )
      ),
    [dailySeries]
  );

  const topQr =
    useMemo(
      () =>
        [...qrPerformance]
          .sort(
            (a, b) =>
              numberValue(
                b.scanCount
              ) -
              numberValue(
                a.scanCount
              )
          )
          .slice(0, 5),
      [qrPerformance]
    );

  function chooseBusiness(
    businessId: string
  ) {
    setSelectedBusinessId(
      businessId
    );

    if (
      typeof window !==
      "undefined"
    ) {
      localStorage.setItem(
        "tapqr_current_business_id",
        businessId
      );
    }

    setBusinessOpen(false);
  }

  async function refresh() {
    if (!selectedBusinessId) {
      return;
    }

    setSuccess("");

    await loadAnalytics(
      selectedBusinessId,
      range,
      true
    );

    setSuccess(
      "Analytics refreshed."
    );

    window.setTimeout(
      () => setSuccess(""),
      2000
    );
  }

  if (loadingBusinesses) {
    return (
      <AnalyticsSkeleton />
    );
  }

  if (!selectedBusiness) {
    return (
      <main className="space-y-7">
        <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <BarChart3 className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Analytics starts with a business
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create a business and start sharing a
            TapQR code to begin collecting analytics.
          </p>

          <a
            href="/dashboard/business"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Open Business
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-7">
      {/* HEADER */}
      <section className="relative overflow-visible rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-violet-100/40 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Performance overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Understand how customers interact with your
              TapQR experiences and where your traffic comes from.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* BUSINESS SWITCHER */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setBusinessOpen(
                      (open) =>
                        !open
                    )
                  }
                  aria-expanded={
                    businessOpen
                  }
                  className="inline-flex max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                    {initials(
                      selectedBusiness.name
                    )}
                  </span>

                  <span className="max-w-[220px] truncate">
                    {selectedBusiness.name}
                  </span>

                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {businessOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Select workspace
                    </p>

                    <div className="max-h-64 overflow-y-auto">
                      {businesses.map(
                        (business) => (
                          <button
                            key={business.id}
                            type="button"
                            onClick={() =>
                              chooseBusiness(
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
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                business.id ===
                                selectedBusinessId
                                  ? "bg-white/10 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {initials(
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

              {/* DATE RANGE */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setRangeOpen(
                      (open) =>
                        !open
                    )
                  }
                  aria-expanded={
                    rangeOpen
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {
                    RANGE_OPTIONS.find(
                      (option) =>
                        option.value ===
                        range
                    )?.label
                  }
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {rangeOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl sm:left-0 sm:right-auto">
                    {RANGE_OPTIONS.map(
                      (option) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() => {
                            setRange(
                              option.value
                            );
                            setRangeOpen(
                              false
                            );
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                            range ===
                            option.value
                              ? "bg-slate-950 text-white"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {option.label}

                          {range ===
                            option.value && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void refresh()
            }
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </section>

      {/* ALERTS */}
      {error && (
        <Alert
          tone="error"
          message={error}
          onClose={() =>
            setError("")
          }
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

      {/* KPI CARDS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total scans"
          value={formatNumber(
            totalScans
          )}
          helper={
            `${formatNumber(
              averageDailyScans
            )} average per day`
          }
          icon={
            <ScanLine className="h-5 w-5" />
          }
          tone="blue"
          loading={loadingAnalytics}
        />

        <MetricCard
          label="Estimated visitors"
          value={formatNumber(
            uniqueVisitors
          )}
          helper="Distinct recorded IPs"
          icon={
            <Eye className="h-5 w-5" />
          }
          tone="violet"
          loading={loadingAnalytics}
        />

        <MetricCard
          label="Period growth"
          value={formatPercent(
            percentageChange
          )}
          helper={
            previousPeriodScans > 0
              ? `${formatNumber(
                  previousPeriodScans
                )} scans in previous period`
              : totalScans > 0
                ? "No previous-period baseline"
                : "No scans recorded"
          }
          icon={
            trendDirection ===
            "down" ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )
          }
          tone={
            trendDirection ===
            "down"
              ? "red"
              : "green"
          }
          loading={loadingAnalytics}
        />

        <MetricCard
          label="Active QR codes"
          value={`${formatNumber(
            activeQrCodes
          )} / ${formatNumber(
            totalQrCodes
          )}`}
          helper="Active of total QR codes"
          icon={
            <QrCode className="h-5 w-5" />
          }
          tone="amber"
          loading={loadingAnalytics}
        />
      </section>

      {/* MAIN TREND + TOP QR */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <ScanTrendCard
          series={dailySeries}
          max={chartMax}
          loading={loadingAnalytics}
          totalScans={totalScans}
        />

        <TopQrCard
          rows={topQr}
          loading={loadingAnalytics}
        />
      </section>

      {/* AUDIENCE BREAKDOWNS */}
      <section className="grid gap-5 xl:grid-cols-3">
        <BreakdownCard
          title="Countries"
          subtitle="Where your scans originate"
          icon={
            <Globe2 className="h-5 w-5" />
          }
          rows={countries}
          loading={loadingAnalytics}
        />

        <BreakdownCard
          title="Cities"
          subtitle="Top cities by scan volume"
          icon={
            <Activity className="h-5 w-5" />
          }
          rows={cities}
          loading={loadingAnalytics}
        />

        <BreakdownCard
          title="Devices"
          subtitle="Devices used to scan"
          icon={
            <MonitorSmartphone className="h-5 w-5" />
          }
          rows={devices}
          loading={loadingAnalytics}
        />
      </section>

      {/* TECHNOLOGY */}
      <section className="grid gap-5 lg:grid-cols-2">
        <BreakdownCard
          title="Browsers"
          subtitle="Browser distribution"
          icon={
            <Globe2 className="h-5 w-5" />
          }
          rows={browsers}
          loading={loadingAnalytics}
        />

        <BreakdownCard
          title="Operating systems"
          subtitle="Platform distribution"
          icon={
            <Smartphone className="h-5 w-5" />
          }
          rows={operatingSystems}
          loading={loadingAnalytics}
        />
      </section>

      {/* TRAFFIC SOURCES + RECENT */}
      <section className="grid gap-5 xl:grid-cols-2">
        <BreakdownCard
          title="Traffic sources"
          subtitle="Where referred traffic comes from"
          icon={
            <Activity className="h-5 w-5" />
          }
          rows={referrers}
          loading={loadingAnalytics}
          emptyLabel="No referrer information recorded yet."
        />

        <RecentScansCard
          rows={recentScans}
          loading={loadingAnalytics}
          qrCodes={qrPerformance}
        />
      </section>

      {/* PERFORMANCE NOTE */}
      <section className="rounded-[24px] border border-blue-100 bg-blue-50/60 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-blue-950">
              Your analytics update automatically from QR scan activity.
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-900/70">
              Visitor counts are estimates based on recorded IP addresses.
              Location and device breakdowns depend on the metadata available
              for each scan.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone:
    | "blue"
    | "violet"
    | "green"
    | "amber"
    | "red";
  loading?: boolean;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    green:
      "bg-emerald-50 text-emerald-600",
    amber:
      "bg-amber-50 text-amber-600",
    red:
      "bg-red-50 text-red-600",
  };

  return (
    <article className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      {loading ? (
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
          </div>
          <div className="mt-4 h-9 w-28 rounded-lg bg-slate-100" />
          <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
            >
              {icon}
            </div>
          </div>

          <p className="mt-4 truncate text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {helper}
          </p>
        </>
      )}
    </article>
  );
}

function ScanTrendCard({
  series,
  max,
  loading,
  totalScans,
}: {
  series: DailyScan[];
  max: number;
  loading: boolean;
  totalScans: number;
}) {
  const width = 760;
  const height = 280;
  const paddingX = 22;
  const paddingY = 28;

  const points = series.map(
    (item, index) => {
      const x =
        series.length <= 1
          ? width / 2
          : paddingX +
            (index /
              (series.length - 1)) *
              (width -
                paddingX * 2);

      const value =
        numberValue(
          item.scans
        );

      const y =
        height -
        paddingY -
        (value / max) *
          (height -
            paddingY * 2);

      return {
        x,
        y,
        value,
        date: item.date,
      };
    }
  );

  const linePath =
    points.length > 0
      ? points
          .map(
            (point, index) =>
              `${
                index === 0
                  ? "M"
                  : "L"
              } ${point.x.toFixed(
                2
              )} ${point.y.toFixed(
                2
              )}`
          )
          .join(" ")
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${width - paddingX} ${
          height - paddingY
        } L ${paddingX} ${
          height - paddingY
        } Z`
      : "";

  const labelIndexes =
    series.length <= 7
      ? series.map(
          (_, index) => index
        )
      : [
          0,
          Math.floor(
            (series.length - 1) /
              2
          ),
          series.length - 1,
        ];

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Performance
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Scan activity
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {formatNumber(totalScans)} total scans in this period
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Daily
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="h-[280px] animate-pulse rounded-2xl bg-slate-50" />
        ) : points.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-[280px] w-full"
                role="img"
                aria-label="Daily QR scan activity"
              >
                {[0, 0.25, 0.5, 0.75, 1].map(
                  (ratio) => {
                    const y =
                      height -
                      paddingY -
                      ratio *
                        (height -
                          paddingY *
                            2);

                    return (
                      <line
                        key={ratio}
                        x1={paddingX}
                        x2={
                          width -
                          paddingX
                        }
                        y1={y}
                        y2={y}
                        stroke="currentColor"
                        className="text-slate-100"
                        strokeWidth="1"
                      />
                    );
                  }
                )}

                {areaPath && (
                  <path
                    d={areaPath}
                    fill="currentColor"
                    className="text-blue-50"
                  />
                )}

                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="currentColor"
                    className="text-blue-600"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {points.map(
                  (point) => (
                    <circle
                      key={`${point.date}-${point.x}`}
                      cx={point.x}
                      cy={point.y}
                      r="3.5"
                      fill="currentColor"
                      className="text-blue-600"
                    />
                  )
                )}

                {labelIndexes.map(
                  (index) => {
                    const point =
                      points[index];

                    if (!point) {
                      return null;
                    }

                    return (
                      <text
                        key={`${point.date}-label`}
                        x={point.x}
                        y={
                          height -
                          7
                        }
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                        className="text-slate-400"
                      >
                        {formatShortDate(
                          point.date
                        )}
                      </text>
                    );
                  }
                )}
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TopQrCard({
  rows,
  loading,
}: {
  rows: QRCodeSummary[];
  loading: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          QR performance
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">
          Top QR codes
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Lifetime scan totals for this workspace
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-xl bg-slate-50"
                />
              )
            )}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center">
            <QrCode className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No QR performance yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Create and share a QR code to start collecting data.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map(
              (row, index) => (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-500 shadow-sm">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {row.name}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {row.experienceType
                        ? EXPERIENCE_LABELS[
                            row.experienceType
                          ] ??
                          row.experienceType
                        : "QR experience"}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-bold text-slate-900">
                    {formatNumber(
                      numberValue(
                        row.scanCount
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
  );
}

function BreakdownCard({
  title,
  subtitle,
  icon,
  rows,
  loading,
  emptyLabel = "No data recorded for this period.",
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  rows: BreakdownRow[];
  loading: boolean;
  emptyLabel?: string;
}) {
  const normalizedRows =
    rows
      .map((row) => ({
        name:
          row.name?.trim() ||
          "Unknown",
        scans: numberValue(
          row.scans
        ),
      }))
      .sort(
        (a, b) =>
          b.scans - a.scans
      )
      .slice(0, 5);

  const max =
    Math.max(
      1,
      ...normalizedRows.map(
        (row) => row.scans
      )
    );

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse"
                >
                  <div className="flex justify-between gap-3">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="h-3 w-10 rounded bg-slate-100" />
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100" />
                </div>
              )
            )}
          </div>
        ) : normalizedRows.length ===
          0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <p className="text-xs font-semibold text-slate-600">
              {emptyLabel}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {normalizedRows.map(
              (row) => {
                const width =
                  Math.max(
                    4,
                    Math.round(
                      (row.scans /
                        max) *
                        100
                    )
                  );

                return (
                  <div
                    key={`${row.name}-${row.scans}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {row.name}
                      </span>

                      <span className="shrink-0 text-xs font-bold text-slate-900">
                        {formatNumber(
                          row.scans
                        )}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RecentScansCard({
  rows,
  loading,
  qrCodes,
}: {
  rows: RecentScan[];
  loading: boolean;
  qrCodes: QRCodeSummary[];
}) {
  const qrNameMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          string
        >();

      for (const qr of qrCodes) {
        map.set(
          qr.id,
          qr.name
        );
      }

      return map;
    }, [qrCodes]);

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Live activity
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Recent scans
          </h2>
        </div>

        <ScanLine className="h-5 w-5 text-slate-300" />
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="space-y-0">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
                  <div className="flex-1">
                    <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                    <div className="mt-2 h-2.5 w-48 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <ScanLine className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No scans yet
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Recent visitor activity will appear here after your first scan.
            </p>
          </div>
        ) : (
          rows.slice(0, 10).map(
            (scan) => {
              const location =
                [scan.city, scan.country]
                  .filter(Boolean)
                  .join(", ");

              const device =
                [
                  scan.device,
                  scan.browser,
                ]
                  .filter(Boolean)
                  .join(" · ");

              return (
                <div
                  key={scan.id}
                  className="px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ScanLine className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {qrNameMap.get(
                          scan.qrCodeId
                        ) ??
                          "QR scan"}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        {location ||
                          "Location unavailable"}
                        {device
                          ? ` · ${device}`
                          : ""}
                      </p>
                    </div>

                    <time
                      dateTime={
                        scan.scannedAt
                      }
                      className="hidden shrink-0 text-[10px] font-medium text-slate-400 sm:block"
                    >
                      {formatDateTime(
                        scan.scannedAt
                      )}
                    </time>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>
    </section>
  );
}

function Alert({
  tone,
  message,
  onClose,
}: {
  tone:
    | "error"
    | "success";
  message: string;
  onClose: () => void;
}) {
  const isSuccess =
    tone === "success";

  return (
    <div
      role={
        isSuccess
          ? "status"
          : "alert"
      }
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {isSuccess ? (
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

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
      <div className="max-w-sm px-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <BarChart3 className="h-5 w-5 text-slate-400" />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-700">
          No scan activity yet
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Share an active TapQR code and daily scan activity will appear here.
        </p>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <main className="space-y-7">
      <div className="h-44 animate-pulse rounded-[28px] bg-white" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[22px] bg-white"
            />
          )
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <div className="h-[370px] animate-pulse rounded-[28px] bg-white" />
        <div className="h-[370px] animate-pulse rounded-[28px] bg-white" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-[24px] bg-white"
            />
          )
        )}
      </div>
    </main>
  );
}
