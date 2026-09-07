"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  activateQRRule,
  deleteQRRule,
  getQRRules,
  pauseQRRule,
  publishQRRule,
  type QRRule,
  type QRRuleActionType,
  type QRRuleStatus,
} from "@/lib/qr-rules";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

/* ============================================================
   TYPES
============================================================ */

type Business = {
  id: string;
  name: string;
  status?: string;
  logo?: string | null;
};

type QRCodeRecord = {
  id: string;
  businessId?: string;
  name: string;
  shortCode: string;
  status?: string;
  experienceType?: string;
};

type BusinessesResponse = {
  success?: boolean;
  message?: string;
  data?: Business[];
};

type QRListResponse = {
  success?: boolean;
  message?: string;
  data?: QRCodeRecord[];
};

/* ============================================================
   LABELS
============================================================ */

const STATUS_LABELS: Record<
  QRRuleStatus,
  string
> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  EXPIRED: "Expired",
  ARCHIVED: "Archived",
};

const ACTION_LABELS: Record<
  QRRuleActionType,
  string
> = {
  EXPERIENCE: "Experience",
  REDIRECT: "Redirect",
  CATALOG: "Catalog",
  MENU: "Menu",
  SERVICES: "Services",
  PRODUCTS: "Products",
  CONTACT: "Contact",
  CAMPAIGN: "Campaign",
  CUSTOM: "Custom",
};

/* ============================================================
   HELPERS
============================================================ */

function getErrorMessage(
  error: unknown
) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function statusClasses(
  status: QRRuleStatus
) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "PAUSED":
      return "border-amber-100 bg-amber-50 text-amber-700";

    case "DRAFT":
      return "border-blue-100 bg-blue-50 text-blue-700";

    case "EXPIRED":
      return "border-red-100 bg-red-50 text-red-700";

    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(
  value?: string | null
) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  return date.toLocaleString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function conditionCount(
  rule: QRRule
) {
  const direct =
    rule.conditions?.length ?? 0;

  const groups =
    rule.conditionGroups ?? [];

  const grouped = groups.reduce(
    (total, group) =>
      total +
      (group.conditions?.length ?? 0),
    0
  );

  return direct + grouped;
}

function conditionSummary(
  rule: QRRule
) {
  const count = conditionCount(rule);

  if (count === 0) {
    return "No conditions";
  }

  if (count === 1) {
    return "1 condition";
  }

  return `${count} conditions`;
}

/* ============================================================
   PAGE
============================================================ */

export default function SmartRulesPage() {
  const [
    businesses,
    setBusinesses,
  ] = useState<Business[]>([]);

  const [
    selectedBusinessId,
    setSelectedBusinessId,
  ] = useState("");

  const [
    qrs,
    setQrs,
  ] = useState<QRCodeRecord[]>([]);

  const [
    selectedQrId,
    setSelectedQrId,
  ] = useState("");

  const [
    rules,
    setRules,
  ] = useState<QRRule[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingQrs,
    setLoadingQrs,
  ] = useState(false);

  const [
    loadingRules,
    setLoadingRules,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    actionId,
    setActionId,
  ] = useState<string | null>(null);

  const [
    actionType,
    setActionType,
  ] = useState<
    "ACTIVATE" |
    "PAUSE" |
    "PUBLISH" |
    "DELETE" |
    null
  >(null);

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "ALL" | QRRuleStatus
  >("ALL");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    menuId,
    setMenuId,
  ] = useState<string | null>(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<QRRule | null>(null);

  /* ==========================================================
     SELECTED QR
  ========================================================== */

  const selectedQR =
    useMemo(
      () =>
        qrs.find(
          (qr) =>
            qr.id ===
            selectedQrId
        ) ?? null,
      [
        qrs,
        selectedQrId,
      ]
    );

  /* ==========================================================
     STATS
  ========================================================== */

  const stats =
    useMemo(() => {
      const active =
        rules.filter(
          (rule) =>
            rule.status ===
            "ACTIVE"
        ).length;

      const drafts =
        rules.filter(
          (rule) =>
            rule.status ===
            "DRAFT"
        ).length;

      const paused =
        rules.filter(
          (rule) =>
            rule.status ===
            "PAUSED"
        ).length;

      const matches =
        rules.reduce(
          (sum, rule) =>
            sum +
            Number(
              rule.matchCount ??
                0
            ),
          0
        );

      return {
        total: rules.length,
        active,
        drafts,
        paused,
        matches,
      };
    }, [rules]);

  /* ==========================================================
     LOAD BUSINESSES
  ========================================================== */

  async function loadBusinesses(
    showRefresh = false
  ) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* ==========================================================
     LOAD QR CODES
  ========================================================== */

  async function loadQRCodes(
    businessId: string
  ) {
    if (!businessId) {
      setQrs([]);
      setSelectedQrId("");
      return;
    }

    try {
      setLoadingQrs(true);
      setError("");

      const response =
        await apiRequest<QRListResponse>(
          `/qrcodes/business/${businessId}`
        );

      const data =
        response?.data ?? [];

      setQrs(data);

      setSelectedQrId(
        (current) => {
          if (
            current &&
            data.some(
              (qr) =>
                qr.id ===
                current
            )
          ) {
            return current;
          }

          return (
            data[0]?.id ?? ""
          );
        }
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoadingQrs(false);
    }
  }

  /* ==========================================================
     LOAD RULES
  ========================================================== */

  async function loadRules(
    qrCodeId: string,
    showRefresh = false
  ) {
    if (!qrCodeId) {
      setRules([]);
      return;
    }

    try {
      setLoadingRules(true);
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      }

      const response =
        await getQRRules(
          qrCodeId
        );

      setRules(
        response?.data ?? []
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoadingRules(false);
      setRefreshing(false);
    }
  }

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    void loadBusinesses();
  }, []);

  /* ==========================================================
     BUSINESS CHANGE
  ========================================================== */

  useEffect(() => {
    if (
      selectedBusinessId
    ) {
      void loadQRCodes(
        selectedBusinessId
      );
    }
  }, [
    selectedBusinessId,
  ]);

  /* ==========================================================
     QR CHANGE
  ========================================================== */

  useEffect(() => {
    if (selectedQrId) {
      void loadRules(
        selectedQrId
      );
    } else {
      setRules([]);
    }
  }, [
    selectedQrId,
  ]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredRules =
    useMemo(() => {
      const normalized =
        query
          .trim()
          .toLowerCase();

      const next =
        rules.filter(
          (rule) => {
            const matchesQuery =
              !normalized ||
              rule.name
                .toLowerCase()
                .includes(
                  normalized
                ) ||
              rule.description
                ?.toLowerCase()
                .includes(
                  normalized
                ) ||
              ACTION_LABELS[
                rule.actionType ??
                  "CUSTOM"
              ]
                .toLowerCase()
                .includes(
                  normalized
                );

            const matchesStatus =
              statusFilter ===
                "ALL" ||
              rule.status ===
                statusFilter;

            return (
              matchesQuery &&
              matchesStatus
            );
          }
        );

      return [
        ...next,
      ].sort(
        (a, b) =>
          Number(
            b.priority ?? 0
          ) -
          Number(
            a.priority ?? 0
          )
      );
    }, [
      rules,
      query,
      statusFilter,
    ]);

  /* ==========================================================
     RULE ACTIONS
  ========================================================== */

  async function handleActivate(
    rule: QRRule
  ) {
    try {
      setActionId(rule.id);
      setActionType("ACTIVATE");
      setError("");
      setSuccess("");
      setMenuId(null);

      const response =
        await activateQRRule(
          rule.id
        );

      setRules(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              rule.id
                ? {
                    ...item,
                    ...(response?.data ??
                      {}),
                    status:
                      response?.data
                        ?.status ??
                      "ACTIVE",
                  }
                : item
          )
      );

      setSuccess(
        response?.message ??
          "Rule activated successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function handlePause(
    rule: QRRule
  ) {
    try {
      setActionId(rule.id);
      setActionType("PAUSE");
      setError("");
      setSuccess("");
      setMenuId(null);

      const response =
        await pauseQRRule(
          rule.id
        );

      setRules(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              rule.id
                ? {
                    ...item,
                    ...(response?.data ??
                      {}),
                    status:
                      response?.data
                        ?.status ??
                      "PAUSED",
                  }
                : item
          )
      );

      setSuccess(
        response?.message ??
          "Rule paused successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function handlePublish(
    rule: QRRule
  ) {
    try {
      setActionId(rule.id);
      setActionType("PUBLISH");
      setError("");
      setSuccess("");
      setMenuId(null);

      const response =
        await publishQRRule(
          rule.id
        );

      setRules(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              rule.id
                ? {
                    ...item,
                    ...(response?.data ??
                      {}),
                  }
                : item
          )
      );

      setSuccess(
        response?.message ??
          "Rule published successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setActionId(
        deleteTarget.id
      );
      setActionType("DELETE");
      setError("");
      setSuccess("");

      await deleteQRRule(
        deleteTarget.id
      );

      setRules(
        (current) =>
          current.filter(
            (rule) =>
              rule.id !==
              deleteTarget.id
          )
      );

      setDeleteTarget(null);

      setSuccess(
        "Rule deleted successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  /* ==========================================================
     REFRESH
  ========================================================== */

  async function refreshAll() {
    if (!selectedQrId) {
      await loadBusinesses(
        true
      );
      return;
    }

    await loadRules(
      selectedQrId,
      true
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="h-40 animate-pulse rounded-[28px] bg-white" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            1,
            2,
            3,
            4,
          ].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-[22px] bg-white"
              />
            )
          )}
        </div>

        <div className="h-[500px] animate-pulse rounded-[28px] bg-white" />
      </main>
    );
  }

  /* ==========================================================
     NO BUSINESS
  ========================================================== */

  if (
    businesses.length ===
    0
  ) {
    return (
      <main className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Zap className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Create a business first
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Smart Rules need a
            business workspace
            before you can create
            routing rules.
          </p>

          <Link
            href="/dashboard/business"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Open Business
          </Link>
        </section>
      </main>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <main className="space-y-7">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Rules
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Smart QR routing
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Automatically control what
              visitors see based on
              device, location, time,
              campaign and other
              real-world conditions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void refreshAll()
              }
              disabled={
                refreshing ||
                loadingRules
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            <Link
              href={
                selectedQrId
                  ? `/dashboard/qr/rules/new?qrId=${encodeURIComponent(
                      selectedQrId
                    )}`
                  : "/dashboard/qr/rules/new"
              }
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create rule
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <span className="min-w-0 flex-1">
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <span className="min-w-0 flex-1">
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="rounded-lg p-1 hover:bg-emerald-100"
            aria-label="Dismiss success"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================
          SELECTORS
      ====================================================== */}

      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              Business
            </label>

            <select
              value={
                selectedBusinessId
              }
              onChange={(event) => {
                const id =
                  event.target
                    .value;

                setSelectedBusinessId(
                  id
                );
                setSelectedQrId(
                  ""
                );

                if (
                  typeof window !==
                  "undefined"
                ) {
                  localStorage.setItem(
                    "tapqr_current_business_id",
                    id
                  );
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
            >
              {businesses.map(
                (business) => (
                  <option
                    key={
                      business.id
                    }
                    value={
                      business.id
                    }
                  >
                    {business.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              QR code
            </label>

            <select
              value={
                selectedQrId
              }
              onChange={(event) =>
                setSelectedQrId(
                  event.target
                    .value
                )
              }
              disabled={
                loadingQrs ||
                qrs.length === 0
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 disabled:bg-slate-50"
            >
              {qrs.length ===
              0 ? (
                <option value="">
                  No QR codes available
                </option>
              ) : (
                qrs.map(
                  (qr) => (
                    <option
                      key={qr.id}
                      value={qr.id}
                    >
                      {qr.name}
                    </option>
                  )
                )
              )}
            </select>
          </div>
        </div>

        {selectedQR && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
              <Settings2 className="h-3.5 w-3.5" />
              {selectedQR.name}
            </span>

            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              {selectedQR.experienceType ??
                "EXPERIENCE"}
            </span>

            <Link
              href={`/dashboard/qr/studio?qrId=${encodeURIComponent(
                selectedQR.id
              )}`}
              className="ml-auto inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              QR Studio
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* ======================================================
          STATS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              Total rules
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Zap className="h-5 w-5 text-slate-700" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            {stats.total}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Configured for this QR
          </p>
        </div>

        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-600">
              Active
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-emerald-950">
            {stats.active}
          </p>

          <p className="mt-1 text-xs text-emerald-600/70">
            Currently routing traffic
          </p>
        </div>

        <div className="rounded-[22px] border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
              Drafts
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Edit3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-blue-950">
            {stats.drafts}
          </p>

          <p className="mt-1 text-xs text-blue-600/70">
            Waiting to be published
          </p>
        </div>

        <div className="rounded-[22px] border border-purple-100 bg-purple-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-purple-600">
              Matches
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-purple-950">
            {stats.matches.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-purple-600/70">
            Total rule matches
          </p>
        </div>
      </section>

      {/* ======================================================
          RULES
      ====================================================== */}

      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
        {/* TOOLBAR */}

        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Routing rules
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Higher priority rules
                are evaluated first.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search rules..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event.target
                        .value as
                        | "ALL"
                        | QRRuleStatus
                    )
                  }
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                >
                  <option value="ALL">
                    All statuses
                  </option>

                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="PAUSED">
                    Paused
                  </option>

                  <option value="EXPIRED">
                    Expired
                  </option>

                  <option value="ARCHIVED">
                    Archived
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* NO QR */}

        {!selectedQrId ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Zap className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              Select a QR code
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Select a QR code above
              to view and manage its
              Smart Rules.
            </p>
          </div>
        ) : loadingRules ? (
          /* LOADING RULES */
          <div className="space-y-3 p-5">
            {[
              1,
              2,
              3,
            ].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-slate-50"
                />
              )
            )}
          </div>
        ) : filteredRules.length ===
          0 ? (
          /* EMPTY */
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <Sparkles className="h-7 w-7 text-blue-500" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              No Smart Rules yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first rule
              to automatically route
              visitors based on
              real-world conditions.
            </p>

            <Link
              href={`/dashboard/qr/rules/new?qrId=${encodeURIComponent(
                selectedQrId
              )}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create first rule
            </Link>
          </div>
        ) : (
          /* RULE LIST */
          <div className="divide-y divide-slate-100">
            {filteredRules.map(
              (rule) => {
                const busy =
                  actionId ===
                  rule.id;

                return (
                  <div
                    key={rule.id}
                    className="group p-5 transition hover:bg-slate-50/60"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                      {/* PRIORITY */}

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                          {rule.priority ??
                            0}
                        </div>

                        <div className="min-w-0 xl:hidden">
                          <h3 className="truncate text-sm font-bold text-slate-950">
                            {rule.name}
                          </h3>

                          <p className="text-xs text-slate-400">
                            Priority{" "}
                            {rule.priority ??
                              0}
                          </p>
                        </div>
                      </div>

                      {/* MAIN */}

                      <div className="min-w-0 flex-1">
                        <div className="hidden items-center gap-3 xl:flex">
                          <h3 className="truncate text-sm font-bold text-slate-950">
                            {rule.name}
                          </h3>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusClasses(
                              rule.status
                            )}`}
                          >
                            {
                              STATUS_LABELS[
                                rule.status
                              ]
                            }
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600">
                            <Settings2 className="h-3 w-3" />
                            {conditionSummary(
                              rule
                            )}
                          </span>

                          <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700">
                            {rule.logic ??
                              "AND"}
                          </span>

                          <span className="rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1.5 text-[10px] font-bold text-purple-700">
                            {
                              ACTION_LABELS[
                                rule.actionType ??
                                  "CUSTOM"
                              ]
                            }
                          </span>

                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                            <Clock3 className="h-3 w-3" />
                            {formatDate(
                              rule.updatedAt
                            )}
                          </span>
                        </div>

                        {rule.description && (
                          <p className="mt-2 line-clamp-1 text-xs text-slate-400">
                            {
                              rule.description
                            }
                          </p>
                        )}
                      </div>

                      {/* STATUS MOBILE */}

                      <div className="flex items-center gap-2 xl:hidden">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusClasses(
                            rule.status
                          )}`}
                        >
                          {
                            STATUS_LABELS[
                              rule.status
                            ]
                          }
                        </span>
                      </div>

                      {/* MATCHES */}

                      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3 xl:w-[300px] xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                            Matches
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {Number(
                              rule.matchCount ??
                                0
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                            Last matched
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {formatDateTime(
                              rule.lastMatchedAt
                            )}
                          </p>
                        </div>

                        <div className="hidden sm:block">
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                            Version
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {rule.publishedVersion
                              ? `v${rule.publishedVersion}`
                              : "Draft"}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="relative flex shrink-0 items-center gap-2">
                        {rule.status ===
                          "DRAFT" && (
                          <button
                            type="button"
                            onClick={() =>
                              void handlePublish(
                                rule
                              )
                            }
                            disabled={
                              busy
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                          >
                            {busy &&
                            actionType ===
                              "PUBLISH" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Rocket className="h-4 w-4" />
                            )}

                            Publish
                          </button>
                        )}

                        {rule.status ===
                          "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() =>
                              void handlePause(
                                rule
                              )
                            }
                            disabled={
                              busy
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                          >
                            {busy &&
                            actionType ===
                              "PAUSE" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Clock3 className="h-4 w-4" />
                            )}

                            Pause
                          </button>
                        )}

                        {rule.status ===
                          "PAUSED" && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleActivate(
                                rule
                              )
                            }
                            disabled={
                              busy
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {busy &&
                            actionType ===
                              "ACTIVATE" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}

                            Activate
                          </button>
                        )}

                        <Link
                          href={`/dashboard/qr/rules/${encodeURIComponent(
                            rule.id
                          )}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                          title="Edit rule"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setMenuId(
                              (current) =>
                                current ===
                                rule.id
                                  ? null
                                  : rule.id
                            )
                          }
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                          aria-label="Rule actions"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>

                        {menuId ===
                          rule.id && (
                          <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                            <Link
                              href={`/dashboard/qr/rules/${encodeURIComponent(
                                rule.id
                              )}`}
                              onClick={() =>
                                setMenuId(
                                  null
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit rule
                            </Link>

                            <Link
                              href={`/dashboard/qr/rules/${encodeURIComponent(
                                rule.id
                              )}?tab=matches`}
                              onClick={() =>
                                setMenuId(
                                  null
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Activity className="h-4 w-4" />
                              View matches
                            </Link>

                            {rule.status ===
                              "ACTIVE" && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handlePause(
                                    rule
                                  )
                                }
                                disabled={
                                  busy
                                }
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50"
                              >
                                <Clock3 className="h-4 w-4" />
                                Pause
                              </button>
                            )}

                            {rule.status ===
                              "PAUSED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleActivate(
                                    rule
                                  )
                                }
                                disabled={
                                  busy
                                }
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Activate
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setMenuId(
                                  null
                                );
                                setDeleteTarget(
                                  rule
                                );
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete rule
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          FOOTER HELP
      ====================================================== */}

      <section className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-blue-950">
              Build rules around your
              real-world traffic
            </h3>

            <p className="mt-1 text-xs leading-5 text-blue-700/70">
              Combine time, device,
              location, QR source,
              campaign and visitor
              conditions to create
              personalized QR
              experiences.
            </p>
          </div>

          <Link
            href={
              selectedQrId
                ? `/dashboard/qr/rules/new?qrId=${encodeURIComponent(
                    selectedQrId
                  )}`
                : "/dashboard/qr/rules/new"
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-100"
          >
            <Plus className="h-4 w-4" />
            Add rule
          </Link>
        </div>
      </section>

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-950">
                  Delete rule?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You are about to
                  permanently delete{" "}
                  <span className="font-bold text-slate-800">
                    {
                      deleteTarget.name
                    }
                  </span>
                  . This action
                  cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                disabled={
                  actionId !== null
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                disabled={
                  actionId !== null
                }
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleDelete()
                }
                disabled={
                  actionId !== null
                }
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionId !== null ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}