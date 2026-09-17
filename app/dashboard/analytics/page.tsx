"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  Globe2,
  MousePointerClick,
  MonitorSmartphone,
  QrCode,
  RefreshCw,
  ScanLine,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Tone = "blue" | "violet" | "green" | "amber" | "red";

type DailyScan = {
  date: string;
  scans: number | string;
};

type DailyConversion = {
  date: string;
  conversions: number | string;
};

type BreakdownRow = {
  name?: string | null;
  scans?: number | string | null;
  conversions?: number | string | null;
  value?: number | string | null;
  currency?: string | null;
};

type QRCodeSummary = {
  id: string;
  name: string;
  experienceType?: string | null;
  scanCount?: number | string | null;
  conversions?: number | string | null;
  conversionRate?: number | string | null;
};

type RecentScan = {
  id: string;
  qrCodeId: string;
  city?: string | null;
  country?: string | null;
  device?: string | null;
  browser?: string | null;
  scannedAt: string;
};

type AnalyticsData = {
  totalScans?: number;
  uniqueVisitors?: number;
  previousPeriodScans?: number;
  percentageChange?: number;

  activeQrCodes?: number;
  totalQrCodes?: number;

  totalConversions?: number;
  uniqueConverters?: number;
  conversionRate?: number;
  previousPeriodConversions?: number;
  conversionPercentageChange?: number;

  dailySeries?: DailyScan[];
  conversionTimeline?: DailyConversion[];

  qrPerformance?: QRCodeSummary[];
  countries?: BreakdownRow[];
  cities?: BreakdownRow[];
  devices?: BreakdownRow[];
  browsers?: BreakdownRow[];
  operatingSystems?: BreakdownRow[];
  referrers?: BreakdownRow[];

  conversionByType?: BreakdownRow[];
  conversionByQr?: BreakdownRow[];
  conversionByRule?: BreakdownRow[];
  conversionByExperiment?: BreakdownRow[];
  conversionByVariant?: BreakdownRow[];
  valuesByCurrency?: BreakdownRow[];

  recentScans?: RecentScan[];
};

const EXPERIENCE_LABELS: Record<string, string> = {
  MENU: "Menu",
  CATALOG: "Catalog",
  WEBSITE: "Website",
  REVIEW: "Review",
  CONTACT: "Contact",
  EXPERIENCE: "Experience",
};

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 180 days", value: 180 },
  { label: "Last 365 days", value: 365 },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: unknown): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(numberValue(value));
}

function formatPercent(value: unknown): string {
  const n = numberValue(value);
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function formatRate(value: unknown): string {
  return `${numberValue(value).toFixed(2)}%`;
}

function formatMoney(value: unknown, currency?: string | null): string {
  const amount = numberValue(value);
  if (!currency) return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeRows(value: unknown): BreakdownRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      name:
        typeof row.name === "string"
          ? row.name
          : typeof row.type === "string"
            ? row.type
            : typeof row.currency === "string"
              ? row.currency
              : typeof row.qrCodeName === "string"
                ? row.qrCodeName
                : typeof row.ruleName === "string"
                  ? row.ruleName
                  : typeof row.experimentName === "string"
                    ? row.experimentName
                    : typeof row.variantName === "string"
                      ? row.variantName
                      : "Unknown",
      scans: numberValue(row.scans ?? row.count),
      conversions: numberValue(row.conversions ?? row.count),
      value: numberValue(row.value ?? row.totalValue),
      currency:
        typeof row.currency === "string" ? row.currency : null,
    };
  });
}

function unwrapAnalytics(payload: unknown): AnalyticsData {
  const root = (payload ?? {}) as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const conversion =
    data.conversionAnalytics &&
    typeof data.conversionAnalytics === "object"
      ? (data.conversionAnalytics as Record<string, unknown>)
      : {};

  const overview =
    data.overview && typeof data.overview === "object"
      ? (data.overview as Record<string, unknown>)
      : data;

  const scanAnalytics =
    data.scanAnalytics && typeof data.scanAnalytics === "object"
      ? (data.scanAnalytics as Record<string, unknown>)
      : data;

  return {
    totalScans: numberValue(overview.totalScans ?? data.totalScans),
    uniqueVisitors: numberValue(
      overview.uniqueVisitors ?? data.uniqueVisitors
    ),
    previousPeriodScans: numberValue(
      overview.previousPeriodScans ?? data.previousPeriodScans
    ),
    percentageChange: numberValue(
      overview.percentageChange ?? data.percentageChange
    ),

    activeQrCodes: numberValue(
      overview.activeQrCodes ?? data.activeQrCodes
    ),
    totalQrCodes: numberValue(
      overview.totalQrCodes ?? data.totalQrCodes
    ),

    totalConversions: numberValue(
      overview.totalConversions ?? data.totalConversions
    ),
    uniqueConverters: numberValue(
      overview.uniqueConverters ?? data.uniqueConverters
    ),
    conversionRate: numberValue(
      overview.conversionRate ?? data.conversionRate
    ),
    previousPeriodConversions: numberValue(
      overview.previousPeriodConversions ??
        data.previousPeriodConversions
    ),
    conversionPercentageChange: numberValue(
      overview.conversionPercentageChange ??
        data.conversionPercentageChange
    ),

    dailySeries: Array.isArray(
      scanAnalytics.dailySeries ?? data.dailySeries
    )
      ? ((scanAnalytics.dailySeries ?? data.dailySeries) as DailyScan[])
      : [],

    conversionTimeline: Array.isArray(
      conversion.conversionTimeline ?? conversion.timeline
    )
      ? ((conversion.conversionTimeline ??
          conversion.timeline) as DailyConversion[])
      : [],

    qrPerformance: Array.isArray(
      data.qrPerformance ?? data.qrPerformance
    )
      ? (data.qrPerformance as QRCodeSummary[])
      : [],

    countries: normalizeRows(data.countries),
    cities: normalizeRows(data.cities),
    devices: normalizeRows(data.devices),
    browsers: normalizeRows(data.browsers),
    operatingSystems: normalizeRows(data.operatingSystems),
    referrers: normalizeRows(data.referrers),

    conversionByType: normalizeRows(
      conversion.byType ?? data.conversionByType
    ),
    conversionByQr: normalizeRows(
      conversion.byQr ?? data.conversionByQr
    ),
    conversionByRule: normalizeRows(
      conversion.byRule ?? data.conversionByRule
    ),
    conversionByExperiment: normalizeRows(
      conversion.byExperiment ?? data.conversionByExperiment
    ),
    conversionByVariant: normalizeRows(
      conversion.byVariant ?? data.conversionByVariant
    ),
    valuesByCurrency: normalizeRows(
      conversion.valuesByCurrency ?? data.valuesByCurrency
    ),

    recentScans: Array.isArray(data.recentScans)
      ? (data.recentScans as RecentScan[])
      : [],
  };
}

function getBusinessIdFromBrowser(searchParams: URLSearchParams): string {
  const fromQuery =
    searchParams.get("businessId")?.trim() ||
    searchParams.get("business")?.trim();

  if (fromQuery) return fromQuery;

  const keys = [
    "tapqr_business_id",
    "businessId",
    "business_id",
    "selectedBusinessId",
  ];

  for (const key of keys) {
    const value = window.localStorage.getItem(key)?.trim();
    if (value) return value;
  }

  return "";
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AnalyticsPage() {
  const searchParams = useSearchParams();

  const [businessId, setBusinessId] = useState("");
  const [range, setRange] = useState(30);
  const [rangeOpen, setRangeOpen] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setBusinessId(getBusinessIdFromBrowser(searchParams));
  }, [searchParams]);

  const loadAnalytics = useCallback(
    async (showRefresh = false) => {
      if (!businessId) {
        setLoadingAnalytics(false);
        setError(
          "Business ID is missing. Open Analytics from a business workspace or add ?businessId=YOUR_BUSINESS_ID."
        );
        return;
      }

      if (showRefresh) setRefreshing(true);
      else setLoadingAnalytics(true);

      setError("");

      try {
        const query = new URLSearchParams({
          days: String(range),
          limit: "10",
        });

        const payload = await apiRequest(
          `/analytics/business/${encodeURIComponent(
            businessId
          )}?${query.toString()}`
        );

        setAnalytics(unwrapAnalytics(payload));
        if (showRefresh) {
          setSuccess("Analytics refreshed successfully.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics."
        );
      } finally {
        setLoadingAnalytics(false);
        setRefreshing(false);
      }
    },
    [businessId, range]
  );

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const totalScans = numberValue(analytics.totalScans);
  const uniqueVisitors = numberValue(analytics.uniqueVisitors);
  const previousPeriodScans = numberValue(analytics.previousPeriodScans);
  const percentageChange = numberValue(analytics.percentageChange);

  const totalConversions = numberValue(analytics.totalConversions);
  const uniqueConverters = numberValue(analytics.uniqueConverters);
  const conversionRate = numberValue(analytics.conversionRate);
  const previousPeriodConversions = numberValue(
    analytics.previousPeriodConversions
  );
  const conversionPercentageChange = numberValue(
    analytics.conversionPercentageChange
  );

  const activeQrCodes = numberValue(analytics.activeQrCodes);
  const totalQrCodes = numberValue(analytics.totalQrCodes);

  const dailySeries = analytics.dailySeries ?? [];
  const conversionTimeline = analytics.conversionTimeline ?? [];

  const averageDailyScans =
    range > 0 ? totalScans / range : totalScans;

  const averageDailyConversions =
    range > 0 ? totalConversions / range : totalConversions;

  const trendDirection =
    percentageChange < 0 ? "down" : "up";

  const conversionTrendDirection =
    conversionPercentageChange < 0 ? "down" : "up";

  const chartMax = Math.max(
    1,
    ...dailySeries.map((item) => numberValue(item.scans))
  );

  const conversionChartMax = Math.max(
    1,
    ...conversionTimeline.map((item) =>
      numberValue(item.conversions)
    )
  );

  const topQr = useMemo(
    () =>
      [...(analytics.qrPerformance ?? [])]
        .sort(
          (a, b) =>
            numberValue(b.scanCount) -
            numberValue(a.scanCount)
        )
        .slice(0, 10),
    [analytics.qrPerformance]
  );

  if (loadingAnalytics && !analytics.dailySeries) {
    return <AnalyticsSkeleton />;
  }

  return (
    <main className="space-y-7 pb-10">
      {/* HEADER */}
      <section className="overflow-visible rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
              Workspace analytics
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              QR analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Understand scans, visitors, conversions, QR performance,
              audience behavior, and experiment attribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRangeOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <CalendarDays className="h-4 w-4" />
                {RANGE_OPTIONS.find(
                  (option) => option.value === range
                )?.label ?? `Last ${range} days`}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {rangeOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setRange(option.value);
                        setRangeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                        range === option.value
                          ? "bg-slate-950 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                      {range === option.value && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void loadAnalytics(true)}
              disabled={refreshing || !businessId}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      {/* ALERTS */}
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
          onClose={() => setSuccess("")}
        />
      )}

      {/* SCAN KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total scans"
          value={formatNumber(totalScans)}
          helper={`${formatNumber(averageDailyScans)} average per day`}
          icon={<ScanLine className="h-5 w-5" />}
          tone="blue"
          loading={loadingAnalytics}
        />

        <MetricCard
          label="Estimated visitors"
          value={formatNumber(uniqueVisitors)}
          helper="Distinct recorded visitors"
          icon={<Eye className="h-5 w-5" />}
          tone="violet"
          loading={loadingAnalytics}
        />

        <MetricCard
          label="Period growth"
          value={formatPercent(percentageChange)}
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
            trendDirection === "down" ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )
          }
          tone={trendDirection === "down" ? "red" : "green"}
          loading={loadingAnalytics}
        />

        <MetricCard
          label="Active QR codes"
          value={`${formatNumber(activeQrCodes)} / ${formatNumber(
            totalQrCodes
          )}`}
          helper="Active of total QR codes"
          icon={<QrCode className="h-5 w-5" />}
          tone="amber"
          loading={loadingAnalytics}
        />
      </section>

      {/* CONVERSION KPIs */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Conversion attribution
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">
              Business outcomes
            </h2>
          </div>

          <p className="text-xs text-slate-400">
            Based on recorded QR conversions
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Conversions"
            value={formatNumber(totalConversions)}
            helper={`${formatNumber(
              averageDailyConversions
            )} average per day`}
            icon={<MousePointerClick className="h-5 w-5" />}
            tone="green"
            loading={loadingAnalytics}
          />

          <MetricCard
            label="Unique converters"
            value={formatNumber(uniqueConverters)}
            helper="Distinct visitor keys"
            icon={<Users className="h-5 w-5" />}
            tone="violet"
            loading={loadingAnalytics}
          />

          <MetricCard
            label="Conversion rate"
            value={formatRate(conversionRate)}
            helper="Conversions ÷ scans"
            icon={<TrendingUp className="h-5 w-5" />}
            tone="blue"
            loading={loadingAnalytics}
          />

          <MetricCard
            label="Conversion growth"
            value={formatPercent(
              conversionPercentageChange
            )}
            helper={
              previousPeriodConversions > 0
                ? `${formatNumber(
                    previousPeriodConversions
                  )} previous-period conversions`
                : totalConversions > 0
                  ? "No previous-period baseline"
                  : "No conversions recorded"
            }
            icon={
              conversionTrendDirection === "down" ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )
            }
            tone={
              conversionTrendDirection === "down"
                ? "red"
                : "green"
            }
            loading={loadingAnalytics}
          />
        </div>
      </section>

      {/* SCAN + TOP QR */}
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

      {/* CONVERSION TREND */}
      <ConversionTrendCard
        series={conversionTimeline}
        max={conversionChartMax}
        loading={loadingAnalytics}
        totalConversions={totalConversions}
      />

      {/* CONVERSION BREAKDOWNS */}
      <section>
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Attribution
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Where conversions came from
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <BreakdownCard
            title="Conversion types"
            subtitle="Actions that generated conversions"
            icon={<MousePointerClick className="h-5 w-5" />}
            rows={analytics.conversionByType ?? []}
            loading={loadingAnalytics}
            metric="conversions"
          />

          <BreakdownCard
            title="By QR code"
            subtitle="Conversions attributed to each QR"
            icon={<QrCode className="h-5 w-5" />}
            rows={analytics.conversionByQr ?? []}
            loading={loadingAnalytics}
            metric="conversions"
          />

          <BreakdownCard
            title="By rule"
            subtitle="Published smart-rule attribution"
            icon={<Activity className="h-5 w-5" />}
            rows={analytics.conversionByRule ?? []}
            loading={loadingAnalytics}
            metric="conversions"
          />

          <BreakdownCard
            title="By experiment"
            subtitle="A/B experiment attribution"
            icon={<BarChart3 className="h-5 w-5" />}
            rows={analytics.conversionByExperiment ?? []}
            loading={loadingAnalytics}
            metric="conversions"
          />

          <BreakdownCard
            title="By variant"
            subtitle="Experiment variant conversions"
            icon={<TrendingUp className="h-5 w-5" />}
            rows={analytics.conversionByVariant ?? []}
            loading={loadingAnalytics}
            metric="conversions"
          />

          <CurrencyValueCard
            rows={analytics.valuesByCurrency ?? []}
            loading={loadingAnalytics}
          />
        </div>
      </section>

      {/* AUDIENCE */}
      <section>
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Audience
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Who is scanning
          </h2>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <BreakdownCard
            title="Countries"
            subtitle="Where your scans originate"
            icon={<Globe2 className="h-5 w-5" />}
            rows={analytics.countries ?? []}
            loading={loadingAnalytics}
            metric="scans"
          />

          <BreakdownCard
            title="Cities"
            subtitle="Top cities by scan volume"
            icon={<Activity className="h-5 w-5" />}
            rows={analytics.cities ?? []}
            loading={loadingAnalytics}
            metric="scans"
          />

          <BreakdownCard
            title="Devices"
            subtitle="Devices used to scan"
            icon={<MonitorSmartphone className="h-5 w-5" />}
            rows={analytics.devices ?? []}
            loading={loadingAnalytics}
            metric="scans"
          />
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="grid gap-5 lg:grid-cols-2">
        <BreakdownCard
          title="Browsers"
          subtitle="Browser distribution"
          icon={<Globe2 className="h-5 w-5" />}
          rows={analytics.browsers ?? []}
          loading={loadingAnalytics}
          metric="scans"
        />

        <BreakdownCard
          title="Operating systems"
          subtitle="Platform distribution"
          icon={<Smartphone className="h-5 w-5" />}
          rows={analytics.operatingSystems ?? []}
          loading={loadingAnalytics}
          metric="scans"
        />
      </section>

      {/* TRAFFIC + RECENT */}
      <section className="grid gap-5 xl:grid-cols-2">
        <BreakdownCard
          title="Traffic sources"
          subtitle="Where referred traffic comes from"
          icon={<Activity className="h-5 w-5" />}
          rows={analytics.referrers ?? []}
          loading={loadingAnalytics}
          metric="scans"
          emptyLabel="No referrer information recorded yet."
        />

        <RecentScansCard
          rows={analytics.recentScans ?? []}
          loading={loadingAnalytics}
          qrCodes={topQr}
        />
      </section>

      {/* NOTE */}
      <section className="rounded-[24px] border border-blue-100 bg-blue-50/60 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-blue-950">
              Analytics are powered by QR scan and conversion events.
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-900/70">
              Conversion attribution uses the latest matching QR rule
              context and experiment assignment when available. Monetary
              totals remain separated by currency so mixed-currency data
              is not combined incorrectly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric card                                                                */
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
  tone: Tone;
  loading?: boolean;
}) {
  const tones: Record<Tone, string> = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
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

/* -------------------------------------------------------------------------- */
/* Scan trend                                                                 */
/* -------------------------------------------------------------------------- */

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

  const points = series.map((item, index) => {
    const x =
      series.length <= 1
        ? width / 2
        : paddingX +
          (index / (series.length - 1)) *
            (width - paddingX * 2);

    const value = numberValue(item.scans);
    const y =
      height -
      paddingY -
      (value / max) * (height - paddingY * 2);

    return { x, y, value, date: item.date };
  });

  const linePath =
    points.length > 0
      ? points
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x.toFixed(
                2
              )} ${point.y.toFixed(2)}`
          )
          .join(" ")
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${width - paddingX} ${
          height - paddingY
        } L ${paddingX} ${height - paddingY} Z`
      : "";

  const labelIndexes =
    series.length <= 7
      ? series.map((_, index) => index)
      : [0, Math.floor((series.length - 1) / 2), series.length - 1];

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
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y =
                    height -
                    paddingY -
                    ratio * (height - paddingY * 2);

                  return (
                    <line
                      key={ratio}
                      x1={paddingX}
                      x2={width - paddingX}
                      y1={y}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100"
                      strokeWidth="1"
                    />
                  );
                })}

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

                {points.map((point) => (
                  <circle
                    key={`${point.date}-${point.x}`}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill="currentColor"
                    className="text-blue-600"
                  />
                ))}

                {labelIndexes.map((index) => {
                  const point = points[index];
                  if (!point) return null;

                  return (
                    <text
                      key={`${point.date}-label`}
                      x={point.x}
                      y={height - 7}
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      className="text-slate-400"
                    >
                      {formatShortDate(point.date)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Conversion trend                                                           */
/* -------------------------------------------------------------------------- */

function ConversionTrendCard({
  series,
  max,
  loading,
  totalConversions,
}: {
  series: DailyConversion[];
  max: number;
  loading: boolean;
  totalConversions: number;
}) {
  const width = 1100;
  const height = 260;
  const paddingX = 24;
  const paddingY = 26;

  const points = series.map((item, index) => {
    const x =
      series.length <= 1
        ? width / 2
        : paddingX +
          (index / (series.length - 1)) *
            (width - paddingX * 2);

    const value = numberValue(item.conversions);
    const y =
      height -
      paddingY -
      (value / max) * (height - paddingY * 2);

    return { x, y, value, date: item.date };
  });

  const linePath =
    points.length > 0
      ? points
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x.toFixed(
                2
              )} ${point.y.toFixed(2)}`
          )
          .join(" ")
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${width - paddingX} ${
          height - paddingY
        } L ${paddingX} ${height - paddingY} Z`
      : "";

  const labelIndexes =
    series.length <= 7
      ? series.map((_, index) => index)
      : [0, Math.floor((series.length - 1) / 2), series.length - 1];

  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">
            Conversion performance
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Conversion activity
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {formatNumber(totalConversions)} conversions in this period
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Daily conversions
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="h-[260px] animate-pulse rounded-2xl bg-slate-50" />
        ) : points.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
            <div>
              <MousePointerClick className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">
                No conversion activity yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Conversions will appear here after visitors complete
                tracked actions.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-[260px] w-full"
                role="img"
                aria-label="Daily conversion activity"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y =
                    height -
                    paddingY -
                    ratio * (height - paddingY * 2);

                  return (
                    <line
                      key={ratio}
                      x1={paddingX}
                      x2={width - paddingX}
                      y1={y}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100"
                      strokeWidth="1"
                    />
                  );
                })}

                {areaPath && (
                  <path
                    d={areaPath}
                    fill="currentColor"
                    className="text-emerald-50"
                  />
                )}

                <path
                  d={linePath}
                  fill="none"
                  stroke="currentColor"
                  className="text-emerald-600"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {points.map((point) => (
                  <circle
                    key={`${point.date}-${point.x}`}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill="currentColor"
                    className="text-emerald-600"
                  />
                ))}

                {labelIndexes.map((index) => {
                  const point = points[index];
                  if (!point) return null;

                  return (
                    <text
                      key={`${point.date}-label`}
                      x={point.x}
                      y={height - 7}
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      className="text-slate-400"
                    >
                      {formatShortDate(point.date)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Top QR                                                                     */
/* -------------------------------------------------------------------------- */

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
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-xl bg-slate-50"
              />
            ))}
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
            {rows.map((row, index) => (
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
                      ? EXPERIENCE_LABELS[row.experienceType] ??
                        row.experienceType
                      : "QR experience"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-slate-900">
                    {formatNumber(row.scanCount)}
                  </p>
                  {row.conversions != null && (
                    <p className="mt-0.5 text-[10px] text-emerald-600">
                      {formatNumber(row.conversions)} conversions
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Breakdown                                                                  */
/* -------------------------------------------------------------------------- */

function BreakdownCard({
  title,
  subtitle,
  icon,
  rows,
  loading,
  metric,
  emptyLabel = "No data recorded for this period.",
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  rows: BreakdownRow[];
  loading: boolean;
  metric: "scans" | "conversions";
  emptyLabel?: string;
}) {
  const normalizedRows = useMemo(
    () =>
      rows
        .map((row) => ({
          name: row.name?.trim() || "Unknown",
          value:
            metric === "conversions"
              ? numberValue(row.conversions)
              : numberValue(row.scans),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [rows, metric]
  );

  const max = Math.max(
    1,
    ...normalizedRows.map((row) => row.value)
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
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="flex justify-between gap-3">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-3 w-10 rounded bg-slate-100" />
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : normalizedRows.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <p className="text-xs font-semibold text-slate-600">
              {emptyLabel}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {normalizedRows.map((row) => {
              const width = Math.max(
                4,
                Math.round((row.value / max) * 100)
              );

              return (
                <div key={`${row.name}-${row.value}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-semibold text-slate-700">
                      {row.name}
                    </span>

                    <span className="shrink-0 text-xs font-bold text-slate-900">
                      {formatNumber(row.value)}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Currency values                                                            */
/* -------------------------------------------------------------------------- */

function CurrencyValueCard({
  rows,
  loading,
}: {
  rows: BreakdownRow[];
  loading: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">
            Conversion value
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Aggregated separately by currency
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-xl bg-slate-50"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <p className="text-xs font-semibold text-slate-600">
              No monetary conversion values recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.slice(0, 8).map((row) => (
              <div
                key={`${row.currency ?? row.name}-${row.value}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">
                    {row.currency ?? row.name ?? "Unknown"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Recorded conversion value
                  </p>
                </div>

                <p className="shrink-0 text-sm font-black text-slate-950">
                  {formatMoney(row.value, row.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Recent scans                                                               */
/* -------------------------------------------------------------------------- */

function RecentScansCard({
  rows,
  loading,
  qrCodes,
}: {
  rows: RecentScan[];
  loading: boolean;
  qrCodes: QRCodeSummary[];
}) {
  const qrNameMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const qr of qrCodes) {
      map.set(qr.id, qr.name);
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
          <div>
            {[1, 2, 3, 4].map((item) => (
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
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <ScanLine className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No scans yet
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Recent visitor activity will appear here after your first
              scan.
            </p>
          </div>
        ) : (
          rows.slice(0, 10).map((scan) => {
            const location = [scan.city, scan.country]
              .filter(Boolean)
              .join(", ");

            const device = [scan.device, scan.browser]
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
                      {qrNameMap.get(scan.qrCodeId) ?? "QR scan"}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-slate-400">
                      {location || "Location unavailable"}
                      {device ? ` · ${device}` : ""}
                    </p>
                  </div>

                  <time
                    dateTime={scan.scannedAt}
                    className="hidden shrink-0 text-[10px] font-medium text-slate-400 sm:block"
                  >
                    {formatDateTime(scan.scannedAt)}
                  </time>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Alerts                                                                     */
/* -------------------------------------------------------------------------- */

function Alert({
  tone,
  message,
  onClose,
}: {
  tone: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  const isSuccess = tone === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
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

      <span className="min-w-0 flex-1">{message}</span>

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

/* -------------------------------------------------------------------------- */
/* Empty state / skeleton                                                     */
/* -------------------------------------------------------------------------- */

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
          Share an active TapQR code and daily scan activity will appear
          here.
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
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-[22px] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-[22px] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <div className="h-[370px] animate-pulse rounded-[28px] bg-white" />
        <div className="h-[370px] animate-pulse rounded-[28px] bg-white" />
      </div>

      <div className="h-[350px] animate-pulse rounded-[28px] bg-white" />

      <div className="grid gap-5 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-[24px] bg-white"
          />
        ))}
      </div>
    </main>
  );
}
