"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import QRCode from "qrcode";
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Clipboard,
  X,
} from "lucide-react";

import { apiRequest, ApiError } from "@/lib/api";

type QRStatus =
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED";

type QRType =
  | "STATIC"
  | "DYNAMIC";

type QRExperienceType =
  | "BUSINESS"
  | "CATALOG"
  | "MENU"
  | "SERVICES"
  | "PRODUCTS"
  | "CONTACT"
  | "REDIRECT";

type QRCodeRecord = {
  id: string;
  businessId?: string;
  catalogId?: string | null;
  name: string;
  description?: string | null;
  type: QRType;
  destinationUrl?: string | null;
  shortCode: string;
  status: QRStatus;
  experienceType: QRExperienceType;
  enabledSections?: unknown;
  scanCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  branding?: unknown;
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

type QRListResponse = {
  success?: boolean;
  message?: string;
  data?: QRCodeRecord[];
};

type QRResponse = {
  success?: boolean;
  message?: string;
  data?: QRCodeRecord;
};

type FormState = {
  name: string;
  description: string;
  type: QRType;
  experienceType: QRExperienceType;
  catalogId: string;
  destinationUrl: string;
};

const EXPERIENCE_LABELS: Record<
  QRExperienceType,
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

const CATALOG_EXPERIENCES: QRExperienceType[] = [
  "CATALOG",
  "MENU",
  "SERVICES",
  "PRODUCTS",
];

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  type: "DYNAMIC",
  experienceType: "BUSINESS",
  catalogId: "",
  destinationUrl: "",
};

function publicQRUrl(shortCode: string) {
  return `https://tapqr.shop/r/${encodeURIComponent(
    shortCode
  )}`;
}

function makeEmptyForm(): FormState {
  return { ...EMPTY_FORM };
}

function statusClasses(status: QRStatus) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "PAUSED":
      return "border-amber-100 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function QRPage() {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] =
    useState("");

  const [qrs, setQrs] =
    useState<QRCodeRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [togglingId, setTogglingId] =
    useState<string | null>(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [editingQR, setEditingQR] =
    useState<QRCodeRecord | null>(null);

  const [menuId, setMenuId] =
    useState<string | null>(null);

  const [showDelete, setShowDelete] =
    useState<QRCodeRecord | null>(null);

  const [form, setForm] =
    useState<FormState>(makeEmptyForm);

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | QRStatus>("ALL");

  const [experienceFilter, setExperienceFilter] =
    useState<
      "ALL" | QRExperienceType
    >("ALL");

  const [sortBy, setSortBy] =
    useState<
      "NEWEST" | "OLDEST" | "SCANS"
    >("NEWEST");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  /*
   * Load businesses first. The selected business is persisted
   * so all QR/analytics screens can share the same workspace.
   */
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

      const data = response?.data ?? [];

      setBusinesses(data);

      const storedId =
        typeof window !== "undefined"
          ? localStorage.getItem(
              "tapqr_current_business_id"
            )
          : null;

      const nextId =
        data.find(
          (business) =>
            business.id === storedId
        )?.id ??
        data[0]?.id ??
        "";

      setSelectedBusinessId(nextId);

      if (
        nextId &&
        typeof window !== "undefined"
      ) {
        localStorage.setItem(
          "tapqr_current_business_id",
          nextId
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadQRCodes(
    businessId: string,
    showRefresh = false
  ) {
    if (!businessId) {
      setQrs([]);
      return;
    }

    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await apiRequest<QRListResponse>(
          `/qrcodes/business/${businessId}`
        );

      setQrs(response?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      void loadQRCodes(
        selectedBusinessId
      );
    }
  }, [selectedBusinessId]);

  /*
   * Close row menus when clicking elsewhere or pressing Escape.
   */
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMenuId(null);
        setShowCreate(false);
        setEditingQR(null);
        setShowDelete(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);

  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) =>
          business.id ===
          selectedBusinessId
      ) ?? null,
    [businesses, selectedBusinessId]
  );

  const stats = useMemo(() => {
    const active =
      qrs.filter(
        (qr) => qr.status === "ACTIVE"
      ).length;

    const paused =
      qrs.filter(
        (qr) => qr.status === "PAUSED"
      ).length;

    const scans = qrs.reduce(
      (sum, qr) =>
        sum + Number(qr.scanCount ?? 0),
      0
    );

    return {
      total: qrs.length,
      active,
      paused,
      scans,
    };
  }, [qrs]);

  const filteredQrs = useMemo(() => {
    const normalized =
      query.trim().toLowerCase();

    const next = qrs.filter((qr) => {
      const matchesQuery =
        !normalized ||
        qr.name
          .toLowerCase()
          .includes(normalized) ||
        qr.shortCode
          .toLowerCase()
          .includes(normalized) ||
        EXPERIENCE_LABELS[
          qr.experienceType
        ]
          .toLowerCase()
          .includes(normalized);

      const matchesStatus =
        statusFilter === "ALL" ||
        qr.status === statusFilter;

      const matchesExperience =
        experienceFilter === "ALL" ||
        qr.experienceType ===
          experienceFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesExperience
      );
    });

    return [...next].sort(
      (a, b) => {
        if (sortBy === "SCANS") {
          return (
            Number(b.scanCount ?? 0) -
            Number(a.scanCount ?? 0)
          );
        }

        const aTime = new Date(
          a.createdAt ?? 0
        ).getTime();

        const bTime = new Date(
          b.createdAt ?? 0
        ).getTime();

        return sortBy === "OLDEST"
          ? aTime - bTime
          : bTime - aTime;
      }
    );
  }, [
    qrs,
    query,
    statusFilter,
    experienceFilter,
    sortBy,
  ]);

  function openCreate() {
    setForm(makeEmptyForm());
    setEditingQR(null);
    setError("");
    setSuccess("");
    setShowCreate(true);
    setMenuId(null);
  }

  function openEdit(qr: QRCodeRecord) {
    setForm({
      name: qr.name ?? "",
      description:
        qr.description ?? "",
      type: qr.type ?? "DYNAMIC",
      experienceType:
        qr.experienceType ?? "BUSINESS",
      catalogId:
        qr.catalogId ?? "",
      destinationUrl:
        qr.destinationUrl ?? "",
    });

    setEditingQR(qr);
    setShowCreate(false);
    setError("");
    setSuccess("");
    setMenuId(null);
  }

  function closeModal() {
    if (saving) return;

    setShowCreate(false);
    setEditingQR(null);
    setForm(makeEmptyForm());
  }

  async function submitQR(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setError(
        "Select a business before creating a QR code."
      );
      return;
    }

    const name = form.name.trim();

    if (name.length < 3) {
      setError(
        "QR name must be at least 3 characters."
      );
      return;
    }

    if (
      CATALOG_EXPERIENCES.includes(
        form.experienceType
      ) &&
      !form.catalogId.trim()
    ) {
      setError(
        "Catalog ID is required for this QR experience."
      );
      return;
    }

    if (
      form.experienceType ===
        "REDIRECT" &&
      !form.destinationUrl.trim()
    ) {
      setError(
        "Destination URL is required for a redirect QR."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingQR) {
        const response =
          await apiRequest<QRResponse>(
            `/qrcodes/${editingQR.id}`,
            {
              method: "PUT",
              body: JSON.stringify({
                catalogId:
                  CATALOG_EXPERIENCES.includes(
                    form.experienceType
                  )
                    ? form.catalogId.trim()
                    : null,
                name,
                description:
                  form.description.trim() ||
                  null,
                destinationUrl:
                  form.experienceType ===
                  "REDIRECT"
                    ? form.destinationUrl.trim() ||
                      null
                    : null,
                experienceType:
                  form.experienceType,
              }),
            }
          );

        if (response?.data) {
          setQrs((current) =>
            current.map((qr) =>
              qr.id === editingQR.id
                ? {
                    ...qr,
                    ...response.data!,
                  }
                : qr
            )
          );
        }

        setSuccess(
          response?.message ??
            "QR code updated successfully."
        );
      } else {
        const response =
          await apiRequest<QRResponse>(
            "/qrcodes",
            {
              method: "POST",
              body: JSON.stringify({
                businessId:
                  selectedBusinessId,
                name,
                description:
                  form.description.trim() ||
                  undefined,
                type: form.type,
                experienceType:
                  form.experienceType,
                ...(form.catalogId.trim() && {
                  catalogId:
                    form.catalogId.trim(),
                }),
                ...(form.destinationUrl.trim() && {
                  destinationUrl:
                    form.destinationUrl.trim(),
                }),
              }),
            }
          );

        if (response?.data) {
          setQrs((current) => [
            response.data!,
            ...current,
          ]);
        }

        setSuccess(
          response?.message ??
            "QR code created successfully."
        );
      }

      closeModal();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(
    qr: QRCodeRecord
  ) {
    const nextStatus: QRStatus =
      qr.status === "ACTIVE"
        ? "PAUSED"
        : "ACTIVE";

    try {
      setTogglingId(qr.id);
      setError("");
      setSuccess("");
      setMenuId(null);

      const response =
        await apiRequest<QRResponse>(
          `/qrcodes/${qr.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              status: nextStatus,
            }),
          }
        );

      const updated =
        response?.data;

      setQrs((current) =>
        current.map((item) =>
          item.id === qr.id
            ? {
                ...item,
                status:
                  updated?.status ??
                  nextStatus,
              }
            : item
        )
      );

      setSuccess(
        response?.message ??
          `QR code ${
            nextStatus === "ACTIVE"
              ? "activated"
              : "paused"
          } successfully.`
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteQR() {
    if (!showDelete) return;

    try {
      setDeletingId(showDelete.id);
      setError("");
      setSuccess("");

      await apiRequest(
        `/qrcodes/${showDelete.id}`,
        {
          method: "DELETE",
        }
      );

      setQrs((current) =>
        current.filter(
          (qr) =>
            qr.id !== showDelete.id
        )
      );

      setShowDelete(null);
      setSuccess(
        "QR code deleted successfully."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function copyLink(
    qr: QRCodeRecord
  ) {
    try {
      await navigator.clipboard.writeText(
        publicQRUrl(qr.shortCode)
      );

      setCopiedId(qr.id);
      window.setTimeout(
        () => setCopiedId(null),
        1800
      );
    } catch {
      setError(
        "Unable to copy the QR link."
      );
    }
  }

  async function shareQR(
    qr: QRCodeRecord
  ) {
    const url = publicQRUrl(
      qr.shortCode
    );

    try {
      if (
        typeof navigator !==
          "undefined" &&
        "share" in navigator
      ) {
        await navigator.share({
          title: qr.name,
          text: `Scan ${qr.name} on TapQR`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        url
      );

      setCopiedId(qr.id);

      window.setTimeout(
        () => setCopiedId(null),
        1800
      );
    } catch {
      /*
       * User-cancelled native share is not an error.
       */
    }
  }

  async function downloadQR(
    qr: QRCodeRecord
  ) {
    try {
      const dataUrl =
        await QRCode.toDataURL(
          publicQRUrl(qr.shortCode),
          {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 1200,
          }
        );

      const link =
        document.createElement("a");

      link.href = dataUrl;
      link.download = `${qr.name
        .replace(/[^a-z0-9-_]+/gi, "-")
        .toLowerCase()}-tapqr.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError(
        "Unable to generate the QR image."
      );
    }
  }

  if (loading) {
    return (
      <main className="space-y-7">
        <div className="h-40 animate-pulse rounded-[28px] bg-white" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-[22px] bg-white"
              />
            )
          )}
        </div>

        <div className="h-96 animate-pulse rounded-[28px] bg-white" />
      </main>
    );
  }

  if (!selectedBusiness) {
    return (
      <main className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <QrCode className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Create a business first
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            QR Studio needs an active business
            workspace before a QR code can be created.
          </p>

          <a
            href="/dashboard/business"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Open Business
            <ExternalLink className="h-4 w-4" />
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-7">
      {/* HEADER */}
      <section className="relative overflow-visible rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              <QrCode className="h-3.5 w-3.5" />
              QR Studio
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              QR codes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create, manage, publish and share the QR
              experiences connected to your business.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setMenuId(
                      (id) =>
                        id ===
                        "__business__"
                          ? null
                          : "__business__"
                    )
                  }
                  className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                    {selectedBusiness.name
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>

                  <span className="max-w-[220px] truncate">
                    {selectedBusiness.name}
                  </span>

                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {menuId === "__business__" && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Select workspace
                    </p>

                    <div className="max-h-64 overflow-y-auto">
                      {businesses.map(
                        (business) => (
                          <button
                            key={business.id}
                            type="button"
                            onClick={() => {
                              setSelectedBusinessId(
                                business.id
                              );
                              localStorage.setItem(
                                "tapqr_current_business_id",
                                business.id
                              );
                              setMenuId(null);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              business.id ===
                              selectedBusinessId
                                ? "bg-slate-950 text-white"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                              {business.name
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">
                                {business.name}
                              </span>

                              <span className="text-[10px] uppercase tracking-wider opacity-50">
                                {business.status ??
                                  "ACTIVE"}
                              </span>
                            </span>

                            {business.id ===
                              selectedBusinessId && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {selectedBusiness.status ??
                  "ACTIVE"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void loadQRCodes(
                  selectedBusinessId,
                  true
                )
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
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create QR
            </button>
          </div>
        </div>
      </section>

      {/* ALERTS */}
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
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="rounded-lg p-1 hover:bg-red-100"
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
            onClick={() => setSuccess("")}
            aria-label="Dismiss success"
            className="rounded-lg p-1 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total QR codes"
          value={stats.total}
          icon={
            <QrCode className="h-5 w-5" />
          }
          tone="blue"
        />

        <Metric
          label="Active"
          value={stats.active}
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          tone="green"
        />

        <Metric
          label="Paused"
          value={stats.paused}
          icon={
            <Activity className="h-5 w-5" />
          }
          tone="amber"
        />

        <Metric
          label="Total scans"
          value={stats.scans}
          icon={
            <Share2 className="h-5 w-5" />
          }
          tone="violet"
        />
      </section>

      {/* TOOLBAR */}
      <section className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search QR codes, codes or experiences..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterSelect
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(
                  value as
                    | "ALL"
                    | QRStatus
                )
              }
              options={[
                ["ALL", "All status"],
                ["ACTIVE", "Active"],
                ["PAUSED", "Paused"],
                ["EXPIRED", "Expired"],
              ]}
            />

            <FilterSelect
              value={experienceFilter}
              onChange={(value) =>
                setExperienceFilter(
                  value as
                    | "ALL"
                    | QRExperienceType
                )
              }
              options={[
                ["ALL", "All experiences"],
                [
                  "BUSINESS",
                  "Business",
                ],
                [
                  "CATALOG",
                  "Catalog",
                ],
                ["MENU", "Menu"],
                [
                  "SERVICES",
                  "Services",
                ],
                [
                  "PRODUCTS",
                  "Products",
                ],
                [
                  "CONTACT",
                  "Contact",
                ],
                [
                  "REDIRECT",
                  "Redirect",
                ],
              ]}
            />

            <FilterSelect
              value={sortBy}
              onChange={(value) =>
                setSortBy(
                  value as
                    | "NEWEST"
                    | "OLDEST"
                    | "SCANS"
                )
              }
              options={[
                ["NEWEST", "Newest"],
                ["OLDEST", "Oldest"],
                ["SCANS", "Most scans"],
              ]}
            />
          </div>
        </div>
      </section>

      {/* LIST */}
      {filteredQrs.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <QrCode className="h-8 w-8 text-slate-500" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            {qrs.length === 0
              ? "Create your first QR code"
              : "No QR codes found"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {qrs.length === 0
              ? "Create a QR code and connect customers to your TapQR business experience."
              : "Try a different search or filter."}
          </p>

          {qrs.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Create QR code
            </button>
          )}
        </section>
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Your QR codes
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {filteredQrs.length}{" "}
                displayed
              </p>
            </div>

            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:block">
              TapQR workspace
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredQrs.map(
              (qr) => (
                <QRRow
                  key={qr.id}
                  qr={qr}
                  menuOpen={
                    menuId === qr.id
                  }
                  toggling={
                    togglingId === qr.id
                  }
                  deleting={
                    deletingId === qr.id
                  }
                  copied={
                    copiedId === qr.id
                  }
                  onMenu={() =>
                    setMenuId(
                      (id) =>
                        id === qr.id
                          ? null
                          : qr.id
                    )
                  }
                  onEdit={() =>
                    openEdit(qr)
                  }
                  onToggle={() =>
                    void toggleStatus(
                      qr
                    )
                  }
                  onDelete={() => {
                    setMenuId(null);
                    setShowDelete(qr);
                  }}
                  onCopy={() =>
                    void copyLink(qr)
                  }
                  onShare={() =>
                    void shareQR(qr)
                  }
                  onDownload={() =>
                    void downloadQR(
                      qr
                    )
                  }
                />
              )
            )}
          </div>
        </section>
      )}

      {/* CREATE / EDIT */}
      {(showCreate || editingQR) && (
        <QRModal
          title={
            editingQR
              ? "Edit QR code"
              : "Create QR code"
          }
          form={form}
          setForm={setForm}
          saving={saving}
          editing={Boolean(
            editingQR
          )}
          onClose={closeModal}
          onSubmit={submitQR}
        />
      )}

      {/* DELETE */}
      {showDelete && (
        <ConfirmDelete
          qr={showDelete}
          loading={
            deletingId ===
            showDelete.id
          }
          onCancel={() =>
            setShowDelete(null)
          }
          onConfirm={() =>
            void deleteQR()
          }
        />
      )}
    </main>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone:
    | "blue"
    | "green"
    | "amber"
    | "violet";
}) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-600",
    green:
      "bg-emerald-50 text-emerald-600",
    amber:
      "bg-amber-50 text-amber-600",
    violet:
      "bg-violet-50 text-violet-600",
  };

  return (
    <article className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {value.toLocaleString()}
      </p>
    </article>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<
    [string, string]
  >;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
    >
      {options.map(
        ([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        )
      )}
    </select>
  );
}

function QRRow({
  qr,
  menuOpen,
  toggling,
  deleting,
  copied,
  onMenu,
  onEdit,
  onToggle,
  onDelete,
  onCopy,
  onShare,
  onDownload,
}: {
  qr: QRCodeRecord;
  menuOpen: boolean;
  toggling: boolean;
  deleting: boolean;
  copied: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onShare: () => void;
  onDownload: () => void;
}) {
  const url = publicQRUrl(
    qr.shortCode
  );

  const [preview, setPreview] =
    useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
    })
      .then((data) => {
        if (active) {
          setPreview(data);
        }
      })
      .catch(() => {
        if (active) {
          setPreview("");
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return (
    <article className="group px-5 py-5 transition hover:bg-slate-50/60 sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* QR */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {preview ? (
            <img
              src={preview}
              alt={`QR code for ${qr.name}`}
              className="h-full w-full object-contain"
            />
          ) : (
            <QrCode className="h-8 w-8 text-slate-300" />
          )}
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-950">
              {qr.name}
            </h3>

            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${statusClasses(
                qr.status
              )}`}
            >
              {qr.status}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            {EXPERIENCE_LABELS[
              qr.experienceType
            ]}{" "}
            ·{" "}
            {qr.type ===
            "DYNAMIC"
              ? "Dynamic"
              : "Static"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="font-mono">
              /r/{qr.shortCode}
            </span>

            <span>
              {Number(
                qr.scanCount ?? 0
              ).toLocaleString()}{" "}
              scans
            </span>

            <span>
              Created{" "}
              {formatDate(
                qr.createdAt
              )}
            </span>
          </div>

          {qr.description && (
            <p className="mt-2 line-clamp-1 max-w-2xl text-xs text-slate-500">
              {qr.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied
              ? "Copied"
              : "Copy"}
          </button>

          <button
            type="button"
            onClick={onShare}
            className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 md:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>

          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>

          <div className="relative">
            <button
              type="button"
              onClick={onMenu}
              disabled={
                toggling ||
                deleting
              }
              aria-label={`Actions for ${qr.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4 text-slate-400" />
                  Edit QR
                </button>

                <button
                  type="button"
                  onClick={onToggle}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Activity className="h-4 w-4 text-slate-400" />
                  {qr.status ===
                  "ACTIVE"
                    ? "Pause QR"
                    : "Activate QR"}
                </button>

                <button
                  type="button"
                  onClick={onDownload}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 text-slate-400" />
                  Download
                </button>

                <button
                  type="button"
                  onClick={onCopy}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4 text-slate-400" />
                  Copy public link
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-2.5 pt-3 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete QR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function QRModal({
  title,
  form,
  setForm,
  saving,
  editing,
  onClose,
  onSubmit,
}: {
  title: string;
  form: FormState;
  setForm: React.Dispatch<
    React.SetStateAction<FormState>
  >;
  saving: boolean;
  editing: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="qr-modal-title"
              className="text-lg font-bold text-slate-950"
            >
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Configure how customers should experience
              this QR code.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-6 px-6 py-6"
        >
          <Field
            label="QR name"
            value={form.name}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                name: value,
              }))
            }
            placeholder="Main entrance QR"
            disabled={saving}
            required
          />

          <Field
            label="Description"
            value={form.description}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                description: value,
              }))
            }
            placeholder="Where this QR is used"
            disabled={saving}
          />

          {!editing && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                QR type
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    [
                      "DYNAMIC",
                      "Dynamic",
                      "Change the experience later without replacing the printed QR.",
                    ],
                    [
                      "STATIC",
                      "Static",
                      "Keep a fixed destination for this QR.",
                    ],
                  ] as const
                ).map(
                  ([
                    value,
                    label,
                    description,
                  ]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm(
                          (current) => ({
                            ...current,
                            type: value,
                          })
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.type ===
                        value
                          ? "border-blue-300 bg-blue-50/60 ring-4 ring-blue-500/5"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          {label}
                        </span>

                        {form.type ===
                          value && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>

                      <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        {description}
                      </p>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Experience
            </label>

            <select
              value={
                form.experienceType
              }
              disabled={saving}
              onChange={(event) => {
                const nextExperience =
                  event.target
                    .value as QRExperienceType;

                setForm((current) => ({
                  ...current,
                  experienceType:
                    nextExperience,
                  catalogId:
                    CATALOG_EXPERIENCES.includes(
                      nextExperience
                    )
                      ? current.catalogId
                      : "",
                  destinationUrl:
                    nextExperience ===
                    "REDIRECT"
                      ? current.destinationUrl
                      : "",
                }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 disabled:opacity-60"
            >
              {Object.entries(
                EXPERIENCE_LABELS
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {CATALOG_EXPERIENCES.includes(
            form.experienceType
          ) && (
            <Field
              label="Catalog ID"
              value={form.catalogId}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  catalogId: value,
                }))
              }
              placeholder="Enter the catalog ID"
              disabled={saving}
              required
            />
          )}

          {form.experienceType ===
            "REDIRECT" && (
            <Field
              label="Destination URL"
              value={
                form.destinationUrl
              }
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  destinationUrl:
                    value,
                }))
              }
              placeholder="https://example.com"
              type="url"
              disabled={saving}
              required
            />
          )}

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex gap-3">
              <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <div>
                <p className="text-xs font-bold text-blue-950">
                  Public QR link
                </p>

                <p className="mt-1 text-[11px] leading-5 text-blue-800/70">
                  TapQR will assign a unique public short
                  code after creation. The printed QR can then
                  point to that public experience.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}

              {saving
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create QR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={`qr-field-${label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`}
        className="mb-2 block text-xs font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={`qr-field-${label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 disabled:cursor-not-allowed disabled:bg-slate-50"
      />
    </div>
  );
}

function ConfirmDelete({
  qr,
  loading,
  onCancel,
  onConfirm,
}: {
  qr: QRCodeRecord;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>

        <h2
          id="delete-title"
          className="mt-5 text-lg font-bold text-slate-950"
        >
          Delete QR code?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          “{qr.name}” will be soft-deleted. Its historical
          records remain in the database, but it will no
          longer appear in your active QR list.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {loading
              ? "Deleting..."
              : "Delete QR"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
