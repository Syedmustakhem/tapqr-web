"use client";

import {
  FormEvent,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  Megaphone,
  Link2,
  PauseCircle,
  PlayCircle,
  Plus,
  QrCode,
  RefreshCw,
  Target,
  TrendingUp,
  Unlink2,
  X,
} from "lucide-react";

import { apiRequest, ApiError } from "@/lib/api";

type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

type Campaign = {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CampaignListResponse = {
  success?: boolean;
  message?: string;
  data?: Campaign[];
};

type CampaignResponse = {
  success?: boolean;
  message?: string;
  data?: Campaign;
};

type CampaignAnalytics = {
  campaign: Campaign;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalScans: number;
    totalVisitors: number;
    totalConversions: number;
    totalConversionValue: number;
  };
};

type AnalyticsResponse = {
  success?: boolean;
  message?: string;
  data?: CampaignAnalytics;
};

type QRCodeRecord = {
  id: string;
  businessId: string;
  name: string;
  shortCode: string;
  status: string;
  campaignId?: string | null;
  campaignName?: string | null;
  scanCount?: number;
};

type QRListResponse = {
  success?: boolean;
  message?: string;
  data?: QRCodeRecord[];
};

type QRCodeResponse = {
  success?: boolean;
  message?: string;
  data?: QRCodeRecord;
};

type CampaignQRCodesResponse = {
  success?: boolean;
  message?: string;
  data?: QRCodeRecord[];
};

type QRPerformanceRow = {
  rank: number;
  id: string;
  name: string;
  shortCode: string;
  status: string;
  lifetimeScanCount?: number;
  metrics: {
    scans: number;
    uniqueVisitors: number;
    conversions: number;
    uniqueConverters: number;
    conversionRate: number;
    conversionValue: number;
  };
};

type QRPerformanceAnalytics = {
  campaign: Campaign;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    qrCodes: number;
    totalScans: number;
    totalVisitors: number;
    totalConversions: number;
    totalConversionValue: number;
  };
  qrCodes: QRPerformanceRow[];
};

type QRPerformanceResponse = {
  success?: boolean;
  message?: string;
  data?: QRPerformanceAnalytics;
};

type AttributionAnalytics = {
  campaign: Campaign;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalConversions: number;
    attributedConversions: number;
    unattributedConversions: number;
    attributionRate: number;
  };
  conversionTypes: Array<{
    type: string;
    conversions: number;
  }>;
  conversionValue: {
    currencies: Array<{
      currency: string | null;
      value: number;
    }>;
    total: number;
  };
};

type AttributionResponse = {
  success?: boolean;
  message?: string;
  data?: AttributionAnalytics;
};

const STATUS_META: Record<
  CampaignStatus,
  { label: string; classes: string }
> = {
  DRAFT: {
    label: "Draft",
    classes: "border-slate-200 bg-slate-100 text-slate-600",
  },
  ACTIVE: {
    label: "Active",
    classes: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  PAUSED: {
    label: "Paused",
    classes: "border-amber-100 bg-amber-50 text-amber-700",
  },
  COMPLETED: {
    label: "Completed",
    classes: "border-blue-100 bg-blue-50 text-blue-700",
  },
  ARCHIVED: {
    label: "Archived",
    classes: "border-slate-200 bg-slate-50 text-slate-500",
  },
};

const STATUS_ACTIONS: Record<
  CampaignStatus,
  CampaignStatus[]
> = {
  DRAFT: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["PAUSED", "COMPLETED", "ARCHIVED"],
  PAUSED: ["ACTIVE", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(Number(value ?? 0));
}

function formatCurrency(value: number, currency = "INR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function getCurrentBusinessId() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("tapqr_current_business_id") ?? ""
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function toISOStringOrNull(value: string) {
  if (!value.trim()) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export default function CampaignsPage() {
  const [businessId, setBusinessId] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [days, setDays] = useState(30);

  const [analytics, setAnalytics] =
    useState<CampaignAnalytics | null>(null);
  const [attribution, setAttribution] =
    useState<AttributionAnalytics | null>(null);
  const [qrCodes, setQRCodes] = useState<QRCodeRecord[]>([]);
  const [campaignQRCodes, setCampaignQRCodes] =
    useState<QRCodeRecord[]>([]);
  const [qrPerformance, setQRPerformance] =
    useState<QRPerformanceAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [qrLoading, setQRLoading] = useState(false);
  const [attachingQrId, setAttachingQrId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
  });

  const selectedCampaign = useMemo(
    () =>
      campaigns.find(
        (campaign) => campaign.id === selectedId,
      ) ?? null,
    [campaigns, selectedId],
  );

  const activeCount = useMemo(
    () =>
      campaigns.filter(
        (campaign) => campaign.status === "ACTIVE",
      ).length,
    [campaigns],
  );

  const scheduledCount = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          campaign.status === "DRAFT" &&
          Boolean(campaign.startsAt),
      ).length,
    [campaigns],
  );

  const completedCount = useMemo(
    () =>
      campaigns.filter(
        (campaign) => campaign.status === "COMPLETED",
      ).length,
    [campaigns],
  );

  useEffect(() => {
    setBusinessId(getCurrentBusinessId());
  }, []);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    void loadCampaigns();
  }, [businessId]);

  useEffect(() => {
    if (!selectedCampaign) {
      setAnalytics(null);
      setAttribution(null);
      setQRCodes([]);
      setCampaignQRCodes([]);
      setQRPerformance(null);
      return;
    }

    setForm({
      name: selectedCampaign.name ?? "",
      description: selectedCampaign.description ?? "",
      startsAt: toDateTimeLocal(selectedCampaign.startsAt),
      endsAt: toDateTimeLocal(selectedCampaign.endsAt),
    });

    void loadAnalytics(selectedCampaign.id);
    void loadCampaignQRData(selectedCampaign.id);
  }, [selectedCampaign, days]);

  async function loadCampaigns(showRefresh = false) {
    if (!businessId) return;

    try {
      setError("");

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response =
        await apiRequest<CampaignListResponse>(
          `/business/${businessId}/campaigns`,
        );

      const data = response.data ?? [];

      setCampaigns(data);

      setSelectedId((current) => {
        if (
          current &&
          data.some((campaign) => campaign.id === current)
        ) {
          return current;
        }

        return data[0]?.id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load campaigns.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadAnalytics(campaignId: string) {
    if (!businessId) return;

    try {
      setAnalyticsLoading(true);

      const [
        overviewResponse,
        attributionResponse,
      ] = await Promise.all([
        apiRequest<AnalyticsResponse>(
          `/analytics/business/${businessId}/campaigns/${campaignId}?days=${days}`,
        ),
        apiRequest<AttributionResponse>(
          `/analytics/business/${businessId}/campaigns/${campaignId}/conversion-attribution?days=${days}`,
        ),
      ]);

      setAnalytics(overviewResponse.data ?? null);
      setAttribution(attributionResponse.data ?? null);
    } catch (err) {
      setAnalytics(null);
      setAttribution(null);

      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load campaign analytics.",
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function loadCampaignQRData(campaignId: string) {
    if (!businessId) return;

    try {
      setQRLoading(true);

      const [campaignResponse, qrResponse, performanceResponse] =
        await Promise.all([
          apiRequest<CampaignQRCodesResponse>(
            `/business/${businessId}/campaigns/${campaignId}/qrcodes`,
          ),
          apiRequest<QRListResponse>(
            `/qrcodes/business/${businessId}`,
          ),
          apiRequest<QRPerformanceResponse>(
            `/analytics/business/${businessId}/campaigns/${campaignId}/qr-performance?days=${days}`,
          ),
        ]);

      setCampaignQRCodes(campaignResponse.data ?? []);
      setQRCodes(qrResponse.data ?? []);
      setQRPerformance(performanceResponse.data ?? null);
    } catch (err) {
      setQRPerformance(null);
      setCampaignQRCodes([]);
      setQRCodes([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load campaign QR data.",
      );
    } finally {
      setQRLoading(false);
    }
  }

  async function attachQRCode(qrCodeId: string) {
    if (!businessId || !selectedCampaign) return;

    try {
      setAttachingQrId(qrCodeId);
      setError("");
      setSuccess("");

      const response = await apiRequest<QRCodeResponse>(
        `/business/${businessId}/campaigns/${selectedCampaign.id}/qrcodes/${qrCodeId}`,
        { method: "POST" },
      );

      if (response.data) {
        setCampaignQRCodes((current) => [
          ...current.filter((qr) => qr.id !== response.data!.id),
          response.data!,
        ]);
      }

      setSuccess(response.message ?? "QR code attached to campaign.");
      await loadCampaignQRData(selectedCampaign.id);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to attach QR code.",
      );
    } finally {
      setAttachingQrId(null);
    }
  }

  async function detachQRCode(qrCodeId: string) {
    if (!businessId || !selectedCampaign) return;

    try {
      setAttachingQrId(qrCodeId);
      setError("");
      setSuccess("");

      const response = await apiRequest<QRCodeResponse>(
        `/business/${businessId}/campaigns/${selectedCampaign.id}/qrcodes/${qrCodeId}`,
        { method: "DELETE" },
      );

      setCampaignQRCodes((current) =>
        current.filter((qr) => qr.id !== qrCodeId),
      );

      setSuccess(response.message ?? "QR code removed from campaign.");
      await loadCampaignQRData(selectedCampaign.id);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to remove QR code from campaign.",
      );
    } finally {
      setAttachingQrId(null);
    }
  }

  function openCreate() {
    setForm({
      name: "",
      description: "",
      startsAt: "",
      endsAt: "",
    });

    setEditing(false);
    setShowModal(true);
    setError("");
    setSuccess("");
  }

  function openEdit() {
    if (!selectedCampaign) return;

    setForm({
      name: selectedCampaign.name ?? "",
      description: selectedCampaign.description ?? "",
      startsAt: toDateTimeLocal(selectedCampaign.startsAt),
      endsAt: toDateTimeLocal(selectedCampaign.endsAt),
    });

    setEditing(true);
    setShowModal(true);
    setError("");
    setSuccess("");
  }

  async function submitCampaign(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!businessId) {
      setError("Select a business workspace first.");
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setError("Campaign name is required.");
      return;
    }

    const startsAt = toISOStringOrNull(form.startsAt);
    const endsAt = toISOStringOrNull(form.endsAt);

    if (form.startsAt && !startsAt) {
      setError("Campaign start time is invalid.");
      return;
    }

    if (form.endsAt && !endsAt) {
      setError("Campaign end time is invalid.");
      return;
    }

    if (
      startsAt &&
      endsAt &&
      new Date(endsAt).getTime() <
        new Date(startsAt).getTime()
    ) {
      setError(
        "Campaign end time cannot be before start time.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editing && selectedCampaign) {
        const response =
          await apiRequest<CampaignResponse>(
            `/business/${businessId}/campaigns/${selectedCampaign.id}`,
            {
              method: "PATCH",
              body: JSON.stringify({
                name,
                description: form.description.trim() || null,
                startsAt,
                endsAt,
              }),
            },
          );

        if (response.data) {
          setCampaigns((current) =>
            current.map((campaign) =>
              campaign.id === response.data!.id
                ? response.data!
                : campaign,
            ),
          );
        }

        setSuccess(
          response.message ??
            "Campaign updated successfully.",
        );
      } else {
        const response =
          await apiRequest<CampaignResponse>(
            `/business/${businessId}/campaigns`,
            {
              method: "POST",
              body: JSON.stringify({
                name,
                description: form.description.trim() || null,
                startsAt,
                endsAt,
              }),
            },
          );

        if (response.data) {
          setCampaigns((current) => [
            response.data!,
            ...current,
          ]);
          setSelectedId(response.data.id);
        }

        setSuccess(
          response.message ??
            "Campaign created successfully.",
        );
      }

      setShowModal(false);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : editing
            ? "Unable to update campaign."
            : "Unable to create campaign.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: CampaignStatus) {
    if (!businessId || !selectedCampaign) return;

    try {
      setChangingStatus(true);
      setError("");
      setSuccess("");

      const response =
        await apiRequest<CampaignResponse>(
          `/business/${businessId}/campaigns/${selectedCampaign.id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
          },
        );

      if (response.data) {
        setCampaigns((current) =>
          current.map((campaign) =>
            campaign.id === response.data!.id
              ? response.data!
              : campaign,
          ),
        );
      }

      setSuccess(
        response.message ??
          "Campaign status updated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to update campaign status.",
      );
    } finally {
      setChangingStatus(false);
    }
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="h-44 animate-pulse rounded-[28px] bg-white" />

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[22px] bg-white"
            />
          ))}
        </div>

        <div className="h-[520px] animate-pulse rounded-[28px] bg-white" />
      </main>
    );
  }

  if (!businessId) {
    return (
      <main className="space-y-6">
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm sm:p-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Megaphone className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Select a business first
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Campaigns belong to a TapQR business workspace.
            Select a business from the Business page and
            return here.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {error && (
        <Banner
          tone="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {success && (
        <Banner
          tone="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
              <Megaphone className="h-3.5 w-3.5" />
              Campaign workspace
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Campaigns
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Group QR activity into campaigns, control
              campaign lifecycle and measure campaign
              performance from one workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadCampaigns(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New campaign
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric
          icon={<Megaphone className="h-4 w-4" />}
          title="Campaigns"
          value={formatNumber(campaigns.length)}
          helper="This workspace"
        />

        <Metric
          icon={<PlayCircle className="h-4 w-4" />}
          title="Active"
          value={formatNumber(activeCount)}
          helper="Currently active"
        />

        <Metric
          icon={<Clock3 className="h-4 w-4" />}
          title="Scheduled"
          value={formatNumber(scheduledCount)}
          helper="Drafts with a start time"
        />

        <Metric
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Completed"
          value={formatNumber(completedCount)}
          helper="Finished campaigns"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Campaign library
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-950">
                Your campaigns
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              {campaigns.length}
            </span>
          </div>

          {campaigns.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
              <Megaphone className="mx-auto h-7 w-7 text-slate-400" />

              <p className="mt-3 text-sm font-bold text-slate-700">
                No campaigns yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Create your first campaign to start grouping
                QR activity.
              </p>

              <button
                type="button"
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                Create campaign
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {campaigns.map((campaign) => {
                const selected = campaign.id === selectedId;
                const status = STATUS_META[campaign.status];

                return (
                  <button
                    key={campaign.id}
                    type="button"
                    onClick={() => setSelectedId(campaign.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                        : "border-slate-100 bg-slate-50/60 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-white/10 text-white"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        <Megaphone className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {campaign.name}
                        </span>

                        <span
                          className={`mt-1 block text-[11px] ${
                            selected
                              ? "text-white/55"
                              : "text-slate-400"
                          }`}
                        >
                          {campaign.startsAt
                            ? `Starts ${formatDate(
                                campaign.startsAt,
                              )}`
                            : "No start time"}
                        </span>
                      </span>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${
                          selected
                            ? "border-white/10 bg-white/10 text-white"
                            : status.classes
                        }`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-6">
          {!selectedCampaign ? (
            <div className="flex min-h-[420px] items-center justify-center text-center">
              <div>
                <Target className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">
                  Select a campaign
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Campaign details and analytics will appear
                  here.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${
                        STATUS_META[
                          selectedCampaign.status
                        ].classes
                      }`}
                    >
                      {
                        STATUS_META[
                          selectedCampaign.status
                        ].label
                      }
                    </span>

                    {selectedCampaign.startsAt && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(
                          selectedCampaign.startsAt,
                        )}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 truncate text-2xl font-bold tracking-[-0.025em] text-slate-950">
                    {selectedCampaign.name}
                  </h2>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                    {selectedCampaign.description ||
                      "No campaign description added."}
                  </p>

                  {selectedCampaign.endsAt && (
                    <p className="mt-2 text-[10px] font-medium text-slate-400">
                      Ends {formatDate(selectedCampaign.endsAt)}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openEdit}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {STATUS_ACTIONS[selectedCampaign.status].map(
                  (status) => {
                    const actionIcon =
                      status === "ACTIVE" ? (
                        <PlayCircle className="h-3.5 w-3.5" />
                      ) : status === "PAUSED" ? (
                        <PauseCircle className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      );

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          void updateStatus(status)
                        }
                        disabled={changingStatus}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        {changingStatus ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          actionIcon
                        )}

                        {status === "ACTIVE"
                          ? "Activate"
                          : status === "PAUSED"
                            ? "Pause"
                            : status === "COMPLETED"
                              ? "Complete"
                              : "Archive"}
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-950">
                          Campaign QR codes
                        </h3>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Attach QR codes that belong to this campaign.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100">
                      {campaignQRCodes.length}
                    </span>
                  </div>

                  {qrLoading ? (
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-14 animate-pulse rounded-xl bg-white" />
                      ))}
                    </div>
                  ) : campaignQRCodes.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center">
                      <QrCode className="mx-auto h-6 w-6 text-slate-300" />
                      <p className="mt-2 text-xs font-bold text-slate-600">
                        No QR codes attached
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Select an available QR below to connect it.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {campaignQRCodes.map((qr) => (
                        <div key={qr.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <QrCode className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-800">{qr.name}</p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-400">/{qr.shortCode}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void detachQRCode(qr.id)}
                            disabled={attachingQrId !== null}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-bold text-slate-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {attachingQrId === qr.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Unlink2 className="h-3.5 w-3.5" />
                            )}
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!qrLoading && qrCodes.filter((qr) => !campaignQRCodes.some((attached) => attached.id === qr.id)).length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Available QR codes
                      </p>
                      <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                        {qrCodes
                          .filter((qr) => !campaignQRCodes.some((attached) => attached.id === qr.id))
                          .map((qr) => (
                            <div key={qr.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                <QrCode className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-700">{qr.name}</p>
                                <p className="mt-0.5 truncate text-[10px] text-slate-400">/{qr.shortCode}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void attachQRCode(qr.id)}
                                disabled={attachingQrId !== null}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-2 text-[10px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                              >
                                {attachingQrId === qr.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Link2 className="h-3.5 w-3.5" />
                                )}
                                Attach
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-950">
                          QR performance
                        </h3>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Compare QR activity for the selected period.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      {qrPerformance?.summary.qrCodes ?? 0} QRs
                    </span>
                  </div>

                  {qrLoading ? (
                    <div className="mt-4 h-48 animate-pulse rounded-xl bg-slate-50" />
                  ) : (qrPerformance?.qrCodes ?? []).length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-7 text-center">
                      <BarChart3 className="mx-auto h-6 w-6 text-slate-300" />
                      <p className="mt-2 text-xs font-bold text-slate-600">
                        No QR performance yet
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Attach a QR code and activity will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            <th className="pb-2 pr-3">QR</th>
                            <th className="pb-2 px-2 text-right">Scans</th>
                            <th className="pb-2 px-2 text-right">Visitors</th>
                            <th className="pb-2 px-2 text-right">Conv.</th>
                            <th className="pb-2 pl-2 text-right">Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {qrPerformance!.qrCodes.map((qr) => (
                            <tr key={qr.id}>
                              <td className="py-3 pr-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="text-[9px] font-black text-slate-300">#{qr.rank}</span>
                                  <div className="min-w-0">
                                    <p className="max-w-[150px] truncate text-[11px] font-bold text-slate-700">{qr.name}</p>
                                    <p className="mt-0.5 text-[9px] text-slate-400">/{qr.shortCode}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-3 text-right text-[11px] font-bold text-slate-700">{formatNumber(qr.metrics.scans)}</td>
                              <td className="px-2 py-3 text-right text-[11px] font-semibold text-slate-600">{formatNumber(qr.metrics.uniqueVisitors)}</td>
                              <td className="px-2 py-3 text-right text-[11px] font-semibold text-slate-600">{formatNumber(qr.metrics.conversions)}</td>
                              <td className="pl-2 py-3 text-right text-[11px] font-bold text-blue-600">{qr.metrics.conversionRate.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-slate-500" />
                      <h3 className="text-sm font-bold text-slate-950">
                        Campaign performance
                      </h3>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Analytics for the selected campaign.
                    </p>
                  </div>

                  <select
                    value={days}
                    onChange={(event) =>
                      setDays(Number(event.target.value))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-400"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={365}>Last 365 days</option>
                  </select>
                </div>

                {analyticsLoading ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="h-24 animate-pulse rounded-2xl bg-slate-50"
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <AnalyticsMetric
                        title="Scans"
                        value={formatNumber(
                          analytics?.summary.totalScans ?? 0,
                        )}
                        icon={
                          <Activity className="h-4 w-4" />
                        }
                      />

                      <AnalyticsMetric
                        title="Visitors"
                        value={formatNumber(
                          analytics?.summary.totalVisitors ?? 0,
                        )}
                        icon={
                          <TrendingUp className="h-4 w-4" />
                        }
                      />

                      <AnalyticsMetric
                        title="Conversions"
                        value={formatNumber(
                          analytics?.summary.totalConversions ?? 0,
                        )}
                        icon={
                          <CheckCircle2 className="h-4 w-4" />
                        }
                      />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Conversion value
                        </p>

                        <p className="mt-2 text-xl font-black text-slate-950">
                          {formatCurrency(
                            analytics?.summary
                              .totalConversionValue ?? 0,
                            attribution
                              ?.conversionValue
                              .currencies[0]?.currency ??
                              "INR",
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Across recorded campaign
                          conversions
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Attribution rate
                        </p>

                        <p className="mt-2 text-xl font-black text-slate-950">
                          {(
                            attribution?.summary
                              .attributionRate ?? 0
                          ).toFixed(2)}
                          %
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Conversions with rule, experiment
                          or variant attribution
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-white">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Conversion types
                        </p>
                      </div>

                      {(attribution?.conversionTypes ?? [])
                        .length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No conversion data for this period.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {attribution!.conversionTypes.map(
                            (item) => (
                              <div
                                key={item.type}
                                className="flex items-center justify-between px-4 py-3"
                              >
                                <span className="text-xs font-semibold text-slate-700">
                                  {item.type}
                                </span>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                  {formatNumber(
                                    item.conversions,
                                  )}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {showModal && (
        <CampaignModal
          editing={editing}
          form={form}
          saving={saving}
          setForm={setForm}
          onClose={() => {
            if (!saving) {
              setShowModal(false);
              setEditing(false);
            }
          }}
          onSubmit={submitCampaign}
        />
      )}
    </main>
  );
}

function Metric({
  icon,
  title,
  value,
  helper,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
          {title}
        </span>
      </div>

      <p className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-medium text-slate-400">
        {helper}
      </p>
    </div>
  );
}

function AnalyticsMetric({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
          {title}
        </span>
      </div>

      <p className="mt-2 text-xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function Banner({
  tone,
  message,
  onClose,
}: {
  tone: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${
        tone === "error"
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      <span>{message}</span>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 transition hover:bg-black/5"
        aria-label="Close message"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CampaignModal({
  editing,
  form,
  saving,
  setForm,
  onClose,
  onSubmit,
}: {
  editing: boolean;
  form: {
    name: string;
    description: string;
    startsAt: string;
    endsAt: string;
  };
  saving: boolean;
  setForm: Dispatch<SetStateAction<{
      name: string;
      description: string;
      startsAt: string;
      endsAt: string;
    }>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-950">
                {editing ? "Edit campaign" : "Create campaign"}
              </h2>
            </div>

            <p className="mt-1 text-[11px] text-slate-400">
              Configure campaign identity and scheduling.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label className="text-xs font-bold text-slate-700">
                Campaign name
              </label>

              <input
                autoFocus
                value={form.name}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Summer QR Campaign"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="What is this campaign intended to achieve?"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  Starts at
                </label>

                <input
                  type="datetime-local"
                  value={form.startsAt}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startsAt: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                  Ends at
                </label>

                <input
                  type="datetime-local"
                  value={form.endsAt}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endsAt: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {editing ? "Save changes" : "Create campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
