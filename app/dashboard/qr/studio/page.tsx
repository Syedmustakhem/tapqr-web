"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import QRCode from "qrcode";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Palette,
  QrCode,
  RefreshCw,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

/* ============================================================
   TYPES
============================================================ */

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

type QRSourceType =
  | "TABLE"
  | "COUNTER"
  | "TAKEAWAY"
  | "PACKAGING"
  | "POSTER"
  | "FLYER"
  | "BUSINESS_CARD"
  | "RECEIPT"
  | "WEBSITE"
  | "SOCIAL_MEDIA"
  | "ADVERTISEMENT"
  | "EVENT"
  | "OTHER";

type QRBranding = {
  id?: string;
  qrCodeId?: string;

  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;

  qrForegroundColor?: string | null;
  qrBackgroundColor?: string | null;

  logoUrl?: string | null;
  coverImageUrl?: string | null;

  buttonStyle?: string | null;
  fontFamily?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

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

  sourceType?: QRSourceType;
  placementLabel?: string | null;
  locationLabel?: string | null;
  campaignName?: string | null;

  enabledSections?: unknown;

  scanCount?: number;

  createdAt?: string;

  updatedAt?: string;

  deletedAt?: string | null;

  branding?: QRBranding | null;
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

type BrandingResponse = {
  success?: boolean;
  message?: string;
  data?: QRBranding | null;
};

/* ============================================================
   DEFAULT BRANDING
============================================================ */

const DEFAULT_BRANDING: QRBranding = {
  primaryColor: "#111827",
  secondaryColor: "#2F6BFF",
  backgroundColor: "#FFFFFF",

  qrForegroundColor: "#000000",
  qrBackgroundColor: "#FFFFFF",

  logoUrl: null,
  coverImageUrl: null,

  buttonStyle: "rounded",
  fontFamily: "Inter",
};

/* ============================================================
   LABELS
============================================================ */

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

/* ============================================================
   HELPERS
============================================================ */

function publicQRUrl(
  shortCode: string
) {
  return `https://tapqr.shop/r/${encodeURIComponent(
    shortCode
  )}`;
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

  return "Something went wrong. Please try again.";
}

function safeFileName(
  value: string
) {
  return (
    value
      .replace(
        /[^a-z0-9-_]+/gi,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .toLowerCase() ||
    "tapqr"
  );
}

function isValidHex(
  value: string
) {
  return /^#[0-9A-Fa-f]{6}$/.test(
    value
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function QRStudioPage() {
  const searchParams =
    useSearchParams();

  const requestedQrId =
    searchParams.get("qrId");

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
  ] = useState(
    requestedQrId ?? ""
  );

  const [
    branding,
    setBranding,
  ] = useState<QRBranding>(
    DEFAULT_BRANDING
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingQrs,
    setLoadingQrs,
  ] = useState(false);

  const [
    loadingBranding,
    setLoadingBranding,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    preview,
    setPreview,
  ] = useState("");

  const [
    logoPreviewError,
    setLogoPreviewError,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState(false);

  /* ==========================================================
     SELECTED QR
  ========================================================== */

  const selectedQR =
    useMemo(() => {
      return (
        qrs.find(
          (qr) =>
            qr.id ===
            selectedQrId
        ) ?? null
      );
    }, [
      qrs,
      selectedQrId,
    ]);

  /* ==========================================================
     LOAD BUSINESSES
  ========================================================== */

  async function loadBusinesses() {
    try {
      setLoading(true);
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

      const nextBusinessId =
        data.find(
          (business) =>
            business.id ===
            storedId
        )?.id ??
        data[0]?.id ??
        "";

      setSelectedBusinessId(
        nextBusinessId
      );

      if (
        nextBusinessId &&
        typeof window !==
          "undefined"
      ) {
        localStorage.setItem(
          "tapqr_current_business_id",
          nextBusinessId
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
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

      /*
       * If the page was opened using:
       *
       * /dashboard/qr/studio?qrId=ABC
       *
       * prefer that QR.
       */
      if (
        requestedQrId &&
        data.some(
          (qr) =>
            qr.id ===
            requestedQrId
        )
      ) {
        setSelectedQrId(
          requestedQrId
        );
      } else {
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
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoadingQrs(false);
    }
  }

  useEffect(() => {
    void loadBusinesses();
  }, []);

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
    requestedQrId,
  ]);

  /* ==========================================================
     LOAD BRANDING
  ========================================================== */

  async function loadBranding(
    qrCodeId: string
  ) {
    if (!qrCodeId) {
      setBranding({
        ...DEFAULT_BRANDING,
      });
      return;
    }

    try {
      setLoadingBranding(true);
      setError("");
      setSuccess("");

      const response =
        await apiRequest<BrandingResponse>(
          `/qrcodes/${qrCodeId}/branding`
        );

      setBranding({
        ...DEFAULT_BRANDING,
        ...(response?.data ??
          {}),
      });

      setLogoPreviewError(
        false
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );

      /*
       * If there is no branding record yet,
       * start with defaults.
       */
      setBranding({
        ...DEFAULT_BRANDING,
      });
    } finally {
      setLoadingBranding(false);
    }
  }

  useEffect(() => {
    if (selectedQrId) {
      void loadBranding(
        selectedQrId
      );
    }
  }, [selectedQrId]);

  /* ==========================================================
     QR PREVIEW
  ========================================================== */

  useEffect(() => {
    if (!selectedQR) {
      setPreview("");
      return;
    }

    let active = true;

    setGenerating(true);

    QRCode.toDataURL(
      publicQRUrl(
        selectedQR.shortCode
      ),
      {
        errorCorrectionLevel:
          "H",

        margin: 2,

        width: 1000,

        color: {
          dark:
            isValidHex(
              branding.qrForegroundColor ??
                ""
            )
              ? branding.qrForegroundColor!
              : "#000000",

          light:
            isValidHex(
              branding.qrBackgroundColor ??
                ""
            )
              ? branding.qrBackgroundColor!
              : "#FFFFFF",
        },
      }
    )
      .then((dataUrl) => {
        if (active) {
          setPreview(dataUrl);
        }
      })
      .catch(() => {
        if (active) {
          setPreview("");
        }
      })
      .finally(() => {
        if (active) {
          setGenerating(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    selectedQR,
    branding.qrForegroundColor,
    branding.qrBackgroundColor,
  ]);

  /* ==========================================================
     UPDATE BRANDING
  ========================================================== */

  function updateBranding(
    patch: Partial<QRBranding>
  ) {
    setBranding(
      (current) => ({
        ...current,
        ...patch,
      })
    );

    setSuccess("");
  }

  /* ==========================================================
     SAVE BRANDING
  ========================================================== */

  async function saveBranding() {
    if (!selectedQR) {
      setError(
        "Select a QR code first."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        primaryColor:
          branding.primaryColor ??
          null,

        secondaryColor:
          branding.secondaryColor ??
          null,

        backgroundColor:
          branding.backgroundColor ??
          null,

        qrForegroundColor:
          branding.qrForegroundColor ??
          null,

        qrBackgroundColor:
          branding.qrBackgroundColor ??
          null,

        logoUrl:
          branding.logoUrl?.trim() ||
          null,

        coverImageUrl:
          branding.coverImageUrl?.trim() ||
          null,

        buttonStyle:
          branding.buttonStyle?.trim() ||
          null,

        fontFamily:
          branding.fontFamily?.trim() ||
          null,
      };

      const response =
        await apiRequest<BrandingResponse>(
          `/qrcodes/${selectedQR.id}/branding`,
          {
            method: "PUT",
            body: JSON.stringify(
              payload
            ),
          }
        );

      setBranding({
        ...DEFAULT_BRANDING,
        ...(response?.data ??
          payload),
      });

      setSuccess(
        response?.message ??
          "QR Studio design saved successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     DOWNLOAD PNG
  ========================================================== */

  async function downloadPNG() {
    if (!selectedQR) {
      setError(
        "Select a QR code first."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const dataUrl =
        await QRCode.toDataURL(
          publicQRUrl(
            selectedQR.shortCode
          ),
          {
            errorCorrectionLevel:
              "H",

            margin: 2,

            width: 1600,

            color: {
              dark:
                isValidHex(
                  branding.qrForegroundColor ??
                    ""
                )
                  ? branding.qrForegroundColor!
                  : "#000000",

              light:
                isValidHex(
                  branding.qrBackgroundColor ??
                    ""
                )
                  ? branding.qrBackgroundColor!
                  : "#FFFFFF",
            },
          }
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = dataUrl;

      link.download = `${safeFileName(
        selectedQR.name
      )}-tapqr.png`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setSuccess(
        "PNG QR downloaded successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setGenerating(false);
    }
  }

  /* ==========================================================
     DOWNLOAD SVG
  ========================================================== */

  async function downloadSVG() {
    if (!selectedQR) {
      setError(
        "Select a QR code first."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const svg =
        await QRCode.toString(
          publicQRUrl(
            selectedQR.shortCode
          ),
          {
            type: "svg",

            errorCorrectionLevel:
              "H",

            margin: 2,

            width: 1600,

            color: {
              dark:
                isValidHex(
                  branding.qrForegroundColor ??
                    ""
                )
                  ? branding.qrForegroundColor!
                  : "#000000",

              light:
                isValidHex(
                  branding.qrBackgroundColor ??
                    ""
                )
                  ? branding.qrBackgroundColor!
                  : "#FFFFFF",
            },
          }
        );

      const blob =
        new Blob(
          [svg],
          {
            type:
              "image/svg+xml;charset=utf-8",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download = `${safeFileName(
        selectedQR.name
      )}-tapqr.svg`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );

      setSuccess(
        "SVG QR downloaded successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setGenerating(false);
    }
  }

  /* ==========================================================
     COPY URL
  ========================================================== */

  async function copyURL() {
    if (!selectedQR) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        publicQRUrl(
          selectedQR.shortCode
        )
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1800
      );
    } catch {
      setError(
        "Unable to copy the QR URL."
      );
    }
  }

  /* ==========================================================
     RESET
  ========================================================== */

  function resetDesign() {
    setBranding({
      ...DEFAULT_BRANDING,
    });

    setLogoPreviewError(
      false
    );

    setSuccess(
      "Design reset. Click Save design to apply it."
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="h-32 animate-pulse rounded-[28px] bg-white" />

        <div className="h-20 animate-pulse rounded-[24px] bg-white" />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="h-[700px] animate-pulse rounded-[28px] bg-white" />

          <div className="h-[700px] animate-pulse rounded-[28px] bg-white" />
        </div>
      </main>
    );
  }

  /* ==========================================================
     NO BUSINESS
  ========================================================== */

  if (businesses.length === 0) {
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
            QR Studio needs a business
            workspace before you can
            customize QR codes.
          </p>

          <Link
            href="/dashboard/business"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Open Business

            <ExternalLink className="h-4 w-4" />
          </Link>
        </section>
      </main>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <main className="space-y-6">
      {/* ======================================================
         HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/dashboard/qr"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to QR codes
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              QR Studio
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Design your QR
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Customize your TapQR QR
              experience and download a
              production-ready QR code.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetDesign}
              disabled={
                saving ||
                generating
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={() =>
                void saveBranding()
              }
              disabled={
                !selectedQR ||
                saving ||
                loadingBranding
              }
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? "Saving..."
                : "Save design"}
            </button>
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
          <X className="mt-0.5 h-5 w-5 shrink-0" />

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
         QR SELECTOR
      ====================================================== */}

      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* BUSINESS */}

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
                  event.target.value;

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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
            >
              {businesses.map(
                (business) => (
                  <option
                    key={business.id}
                    value={business.id}
                  >
                    {business.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* QR */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              QR code
            </label>

            <select
              value={selectedQrId}
              onChange={(event) =>
                setSelectedQrId(
                  event.target.value
                )
              }
              disabled={
                loadingQrs ||
                qrs.length === 0
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 disabled:bg-slate-50"
            >
              {qrs.length === 0 ? (
                <option value="">
                  No QR codes available
                </option>
              ) : (
                qrs.map((qr) => (
                  <option
                    key={qr.id}
                    value={qr.id}
                  >
                    {qr.name} ·{" "}
                    {EXPERIENCE_LABELS[
                      qr.experienceType
                    ] ??
                      qr.experienceType}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {selectedQR && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                selectedQR.status ===
                "ACTIVE"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : selectedQR.status ===
                      "PAUSED"
                    ? "border-amber-100 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {selectedQR.status}
            </span>

            <span className="text-xs text-slate-400">
              /r/
              {selectedQR.shortCode}
            </span>

            <span className="text-xs text-slate-400">
              {Number(
                selectedQR.scanCount ??
                  0
              ).toLocaleString()}{" "}
              scans
            </span>
          </div>
        )}
      </section>

      {/* ======================================================
         NO QR
      ====================================================== */}

      {!selectedQR ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <QrCode className="h-8 w-8 text-slate-400" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Create a QR code first
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create a QR code from QR
            Studio before customizing
            its design.
          </p>

          <Link
            href="/dashboard/qr"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <QrCode className="h-4 w-4" />
            Open QR codes
          </Link>
        </section>
      ) : (
        /* ====================================================
           STUDIO
        ==================================================== */

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
          {/* ==================================================
             PREVIEW
          ================================================== */}

          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Live preview
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your actual TapQR public
                    URL is encoded in this
                    QR.
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600">
                  <QrCode className="h-3.5 w-3.5" />
                  Real QR
                </span>
              </div>
            </div>

            {/* PREVIEW CANVAS */}

            <div
              className="flex min-h-[650px] flex-col items-center justify-center p-8 transition"
              style={{
                backgroundColor:
                  branding.backgroundColor &&
                  isValidHex(
                    branding.backgroundColor
                  )
                    ? branding.backgroundColor
                    : "#FFFFFF",
              }}
            >
              {/* QR */}

              <div className="relative rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_25px_70px_rgba(15,23,42,0.10)]">
                {generating ||
                loadingBranding ? (
                  <div className="flex h-[320px] w-[320px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                  </div>
                ) : preview ? (
                  <img
                    src={preview}
                    alt={`QR code for ${selectedQR.name}`}
                    className="h-[320px] w-[320px] object-contain"
                  />
                ) : (
                  <div className="flex h-[320px] w-[320px] items-center justify-center">
                    <QrCode className="h-20 w-20 text-slate-200" />
                  </div>
                )}

                {/* LOGO CENTER */}

                {branding.logoUrl &&
                  !logoPreviewError && (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-4 border-white bg-white p-2 shadow-lg">
                      <img
                        src={
                          branding.logoUrl
                        }
                        alt=""
                        className="h-full w-full rounded-xl object-contain"
                        onError={() =>
                          setLogoPreviewError(
                            true
                          )
                        }
                      />
                    </div>
                  )}
              </div>

              {/* TITLE */}

              <div className="mt-8 max-w-xl text-center">
                <h2
                  className="text-xl font-bold"
                  style={{
                    color:
                      branding.primaryColor &&
                      isValidHex(
                        branding.primaryColor
                      )
                        ? branding.primaryColor
                        : "#111827",

                    fontFamily:
                      branding.fontFamily ??
                      "Inter",
                  }}
                >
                  {selectedQR.name}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  {EXPERIENCE_LABELS[
                    selectedQR
                      .experienceType
                  ] ??
                    selectedQR.experienceType}
                </p>

                {/* CTA PREVIEW */}

                <div className="mt-5 flex justify-center">
                  <span
                    className={`inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-white ${
                      branding.buttonStyle ===
                      "square"
                        ? "rounded-none"
                        : branding.buttonStyle ===
                            "soft"
                          ? "rounded-lg"
                          : "rounded-xl"
                    }`}
                    style={{
                      backgroundColor:
                        branding.secondaryColor &&
                        isValidHex(
                          branding.secondaryColor
                        )
                          ? branding.secondaryColor
                          : "#2F6BFF",
                    }}
                  >
                    Open TapQR
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-white/80 px-4 py-2 font-mono text-[10px] text-slate-400 shadow-sm">
                  {publicQRUrl(
                    selectedQR.shortCode
                  )}
                </div>
              </div>
            </div>

            {/* DOWNLOAD ACTIONS */}

            <div className="border-t border-slate-100 p-5">
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    void downloadPNG()
                  }
                  disabled={
                    generating
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void downloadSVG()
                  }
                  disabled={
                    generating
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download SVG
                </button>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    void copyURL()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy public URL"}
                </button>

                <a
                  href={publicQRUrl(
                    selectedQR.shortCode
                  )}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open experience
                </a>
              </div>
            </div>
          </div>

          {/* ==================================================
             DESIGN PANEL
          ================================================== */}

          <div className="space-y-6">
            {/* =================================================
               QR COLORS
            ================================================= */}

            <StudioCard
              icon={
                <Palette className="h-5 w-5" />
              }
              title="QR colors"
              description="Keep strong contrast so the QR remains reliable when printed."
            >
              <ColorField
                label="QR foreground"
                value={
                  branding.qrForegroundColor ??
                  "#000000"
                }
                onChange={(value) =>
                  updateBranding({
                    qrForegroundColor:
                      value,
                  })
                }
              />

              <ColorField
                label="QR background"
                value={
                  branding.qrBackgroundColor ??
                  "#FFFFFF"
                }
                onChange={(value) =>
                  updateBranding({
                    qrBackgroundColor:
                      value,
                  })
                }
              />

              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-[11px] leading-5 text-amber-800">
                Recommended: dark QR
                foreground with a light
                background.
              </div>
            </StudioCard>

            {/* =================================================
               BRAND COLORS
            ================================================= */}

            <StudioCard
              icon={
                <Sparkles className="h-5 w-5" />
              }
              title="Brand colors"
              description="These colors are used by the public TapQR experience."
            >
              <ColorField
                label="Primary color"
                value={
                  branding.primaryColor ??
                  "#111827"
                }
                onChange={(value) =>
                  updateBranding({
                    primaryColor:
                      value,
                  })
                }
              />

              <ColorField
                label="Secondary color"
                value={
                  branding.secondaryColor ??
                  "#2F6BFF"
                }
                onChange={(value) =>
                  updateBranding({
                    secondaryColor:
                      value,
                  })
                }
              />

              <ColorField
                label="Experience background"
                value={
                  branding.backgroundColor ??
                  "#FFFFFF"
                }
                onChange={(value) =>
                  updateBranding({
                    backgroundColor:
                      value,
                  })
                }
              />
            </StudioCard>

            {/* =================================================
               BRAND ASSETS
            ================================================= */}

            <StudioCard
              icon={
                <ImageIcon className="h-5 w-5" />
              }
              title="Brand assets"
              description="Add your business logo and cover image."
            >
              <UrlField
                label="Logo URL"
                value={
                  branding.logoUrl ??
                  ""
                }
                placeholder="https://example.com/logo.png"
                onChange={(value) => {
                  setLogoPreviewError(
                    false
                  );

                  updateBranding({
                    logoUrl:
                      value ||
                      null,
                  });
                }}
              />

              {branding.logoUrl && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {!logoPreviewError ? (
                    <img
                      src={
                        branding.logoUrl
                      }
                      alt="Logo preview"
                      className="h-12 w-12 rounded-xl bg-white object-contain p-2"
                      onError={() =>
                        setLogoPreviewError(
                          true
                        )
                      }
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700">
                      Logo preview
                    </p>

                    <p className="mt-1 truncate text-[10px] text-slate-400">
                      {branding.logoUrl}
                    </p>
                  </div>
                </div>
              )}

              <UrlField
                label="Cover image URL"
                value={
                  branding.coverImageUrl ??
                  ""
                }
                placeholder="https://example.com/cover.jpg"
                onChange={(value) =>
                  updateBranding({
                    coverImageUrl:
                      value ||
                      null,
                  })
                }
              />
            </StudioCard>

            {/* =================================================
               EXPERIENCE STYLE
            ================================================= */}

            <StudioCard
              icon={
                <QrCode className="h-5 w-5" />
              }
              title="Experience style"
              description="Customize the look of buttons and text on the public experience."
            >
              {/* BUTTON */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Button style
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    "rounded",
                    "soft",
                    "square",
                  ].map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() =>
                          updateBranding(
                            {
                              buttonStyle:
                                style,
                            }
                          )
                        }
                        className={`rounded-xl border px-3 py-2.5 text-xs font-bold capitalize transition ${
                          branding.buttonStyle ===
                          style
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {style}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* FONT */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Font family
                </label>

                <select
                  value={
                    branding.fontFamily ??
                    "Inter"
                  }
                  onChange={(event) =>
                    updateBranding({
                      fontFamily:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
                >
                  <option value="Inter">
                    Inter
                  </option>

                  <option value="system-ui">
                    System UI
                  </option>

                  <option value="Arial">
                    Arial
                  </option>

                  <option value="Verdana">
                    Verdana
                  </option>

                  <option value="Georgia">
                    Georgia
                  </option>
                </select>
              </div>
            </StudioCard>

            {/* =================================================
               SAVE
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                void saveBranding()
              }
              disabled={
                saving ||
                loadingBranding ||
                !selectedQR
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {saving
                ? "Saving QR Studio..."
                : "Save QR Studio design"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

/* ============================================================
   STUDIO CARD
============================================================ */

function StudioCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   COLOR FIELD
============================================================ */

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  const colorValue =
    isValidHex(value)
      ? value
      : "#000000";

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
        <input
          type="color"
          value={colorValue}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          aria-label={label}
        />

        <input
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="min-w-0 flex-1 bg-transparent px-1 text-sm font-mono uppercase text-slate-700 outline-none"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
}

/* ============================================================
   URL FIELD
============================================================ */

function UrlField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="url"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
      />
    </div>
  );
}