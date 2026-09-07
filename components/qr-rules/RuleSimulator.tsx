"use client";

import React, { useMemo, useState } from "react";
import { simulateQRRule } from "@/lib/qr-rules";

/* ============================================================
   TYPES
   ============================================================ */

export interface RuleSimulatorQRCode {
  id: string;
  name: string;
  shortCode?: string | null;
  businessId?: string | null;
}

interface RuleSimulatorProps {
  qrCodes?: RuleSimulatorQRCode[];
  defaultQRCodeId?: string;
  disabled?: boolean;
  className?: string;
}

interface SimulatorForm {
  qrCodeId: string;
  device: string;
  operatingSystem: string;
  browser: string;
  country: string;
  state: string;
  city: string;
  language: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  visitorKey: string;
  customerId: string;
  timestamp: string;
}

interface TraceItem {
  conditionType?: string;
  operator?: string;
  value?: unknown;
  actualValue?: unknown;
  matched?: boolean;
  result?: boolean;
  reason?: string;
  [key: string]: unknown;
}

interface SimulationResponse {
  simulatedAt?: string;
  qrCodeId?: string;
  context?: Record<string, unknown>;
  result?: {
    status?: string;
    qrCodeId?: string;
    ruleId?: string | null;
    ruleVersion?: number | null;
    action?: {
      type?: string;
      value?: unknown;
    } | null;
    fallback?: {
      type?: string;
      value?: unknown;
    } | null;
    experimentId?: string | null;
    variantId?: string | null;
    selectedRuleId?: string | null;
    selectedReason?: string | null;
    trace?: unknown;
    evaluationTrace?: unknown;
    matchedAt?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const DEVICE_OPTIONS = [
  { value: "", label: "Any device" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
  { value: "desktop", label: "Desktop" },
];

const OS_OPTIONS = [
  { value: "", label: "Any operating system" },
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "windows", label: "Windows" },
  { value: "macos", label: "macOS" },
  { value: "linux", label: "Linux" },
];

const BROWSER_OPTIONS = [
  { value: "", label: "Any browser" },
  { value: "chrome", label: "Chrome" },
  { value: "safari", label: "Safari" },
  { value: "firefox", label: "Firefox" },
  { value: "edge", label: "Edge" },
];

const VISITOR_PRESETS = [
  {
    label: "New visitor",
    visitorKey: "simulator-new-visitor",
    customerId: "",
  },
  {
    label: "Returning visitor",
    visitorKey: "simulator-returning-visitor",
    customerId: "",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

function createDefaultForm(qrCodeId = ""): SimulatorForm {
  return {
    qrCodeId,
    device: "mobile",
    operatingSystem: "android",
    browser: "chrome",
    country: "India",
    state: "",
    city: "",
    language: "en",
    referrer: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    visitorKey: "simulator-new-visitor",
    customerId: "",
    timestamp: new Date().toISOString().slice(0, 16),
  };
}

function cleanRecord(
  values: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value.trim().length > 0
    )
  );
}

function buildQuery(form: SimulatorForm) {
  return cleanRecord({
    utm_source: form.utmSource,
    utm_medium: form.utmMedium,
    utm_campaign: form.utmCampaign,
    utm_term: form.utmTerm,
    utm_content: form.utmContent,
  });
}

function buildHeaders(form: SimulatorForm) {
  return cleanRecord({
    "user-agent": buildUserAgent(form),
    "accept-language": form.language,
    referer: form.referrer,
    "x-tapqr-visitor-key": form.visitorKey,
  });
}

function buildUserAgent(form: SimulatorForm) {
  const os = form.operatingSystem || "android";
  const browser = form.browser || "chrome";
  const device = form.device || "mobile";

  return [
    "TapQR-Simulator/1.0",
    `Device/${device}`,
    `OS/${os}`,
    `Browser/${browser}`,
  ].join(" ");
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return value || "—";
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeTrace(
  trace: unknown
): TraceItem[] {
  if (!trace) {
    return [];
  }

  if (Array.isArray(trace)) {
    return trace as TraceItem[];
  }

  if (typeof trace === "object") {
    const object = trace as Record<string, unknown>;

    if (Array.isArray(object.items)) {
      return object.items as TraceItem[];
    }

    if (Array.isArray(object.conditions)) {
      return object.conditions as TraceItem[];
    }

    if (Array.isArray(object.trace)) {
      return object.trace as TraceItem[];
    }

    if (Array.isArray(object.rules)) {
      return object.rules as TraceItem[];
    }
  }

  return [];
}

function extractErrorMessage(error: unknown): string {
  if (!error) {
    return "Simulation failed.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const value = error as Record<string, unknown>;

    if (typeof value.message === "string") {
      return value.message;
    }

    if (
      value.response &&
      typeof value.response === "object"
    ) {
      const response = value.response as Record<
        string,
        unknown
      >;

      if (typeof response.message === "string") {
        return response.message;
      }

      if (
        response.data &&
        typeof response.data === "object"
      ) {
        const data = response.data as Record<
          string,
          unknown
        >;

        if (typeof data.message === "string") {
          return data.message;
        }

        if (
          data.error &&
          typeof data.error === "object"
        ) {
          const nested = data.error as Record<
            string,
            unknown
          >;

          if (typeof nested.message === "string") {
            return nested.message;
          }
        }
      }
    }
  }

  return "Unable to run the simulation.";
}

function getStatus(result?: SimulationResponse["result"]) {
  const status = String(
    result?.status ?? ""
  ).toUpperCase();

  if (
    status === "MATCHED" ||
    status === "MATCH"
  ) {
    return "MATCHED";
  }

  if (
    status === "NOT_MATCHED" ||
    status === "NOT MATCHED"
  ) {
    return "NOT_MATCHED";
  }

  if (status === "FALLBACK") {
    return "FALLBACK";
  }

  if (status === "ERROR") {
    return "ERROR";
  }

  return status || "UNKNOWN";
}

function statusLabel(status: string) {
  switch (status) {
    case "MATCHED":
      return "Rule matched";

    case "NOT_MATCHED":
      return "No rule matched";

    case "FALLBACK":
      return "Fallback selected";

    case "ERROR":
      return "Evaluation error";

    default:
      return "Simulation completed";
  }
}

/* ============================================================
   SMALL ICONS
   ============================================================ */

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M8 5.5v13l10-6.5-10-6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M20 11a8 8 0 0 0-14.9-4M5 4v4h4M4 13a8 8 0 0 0 14.9 4M19 20v-4h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m6 12 4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden="true"
    >
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
   FIELD COMPONENT
   ============================================================ */

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-slate-700">
          {label}
        </label>

        {hint ? (
          <span className="text-[10px] font-medium text-slate-400">
            {hint}
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        {options.map((option) => (
          <option
            key={option.value || option.label}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronIcon />
    </div>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    />
  );
}

/* ============================================================
   RESULT STATUS
   ============================================================ */

function ResultStatus({
  status,
}: {
  status: string;
}) {
  const matched = status === "MATCHED";
  const fallback = status === "FALLBACK";
  const error = status === "ERROR";

  return (
    <div
      className={[
        "flex items-start gap-3 rounded-2xl border px-4 py-3",
        matched
          ? "border-emerald-200 bg-emerald-50"
          : fallback
            ? "border-amber-200 bg-amber-50"
            : error
              ? "border-red-200 bg-red-50"
              : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          matched
            ? "bg-emerald-100 text-emerald-700"
            : fallback
              ? "bg-amber-100 text-amber-700"
              : error
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600",
        ].join(" ")}
      >
        {matched ? (
          <CheckIcon />
        ) : error ? (
          <XIcon />
        ) : (
          <span className="text-xs font-bold">
            !
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p
          className={[
            "text-sm font-bold",
            matched
              ? "text-emerald-900"
              : fallback
                ? "text-amber-900"
                : error
                  ? "text-red-900"
                  : "text-slate-900",
          ].join(" ")}
        >
          {statusLabel(status)}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          The routing engine evaluated the current
          simulation context.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function RuleSimulator({
  qrCodes = [],
  defaultQRCodeId = "",
  disabled = false,
  className = "",
}: RuleSimulatorProps) {
  const initialQRCodeId =
    defaultQRCodeId ||
    qrCodes[0]?.id ||
    "";

  const [form, setForm] = useState<SimulatorForm>(
    () => createDefaultForm(initialQRCodeId)
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [response, setResponse] =
    useState<SimulationResponse | null>(null);

  const selectedQRCode = useMemo(
    () =>
      qrCodes.find(
        (qr) => qr.id === form.qrCodeId
      ),
    [qrCodes, form.qrCodeId]
  );

  const result = response?.result;

  const status = getStatus(result);

  const trace = useMemo(() => {
    return normalizeTrace(
      result?.evaluationTrace ??
        result?.trace
    );
  }, [result]);

  const updateField = <
    K extends keyof SimulatorForm
  >(
    field: K,
    value: SimulatorForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
  };

  const reset = () => {
    setForm(
      createDefaultForm(
        defaultQRCodeId ||
          qrCodes[0]?.id ||
          ""
      )
    );

    setResponse(null);
    setError(null);
  };

  const applyVisitorPreset = (
    preset: (typeof VISITOR_PRESETS)[number]
  ) => {
    setForm((current) => ({
      ...current,
      visitorKey: preset.visitorKey,
      customerId: preset.customerId,
    }));

    setError(null);
  };

  const runSimulation = async () => {
    if (!form.qrCodeId) {
      setError(
        "Select a QR code before running the simulation."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      /*
       * The backend simulator accepts request metadata
       * through headers/query and evaluates the existing
       * published routing rules.
       */
      const payload = {
        qrCodeId: form.qrCodeId,

        headers: buildHeaders(form),

        query: buildQuery(form),

        visitorKey:
          form.visitorKey.trim() || undefined,

        customerId:
          form.customerId.trim() || undefined,

        custom: {
          simulator: true,
          simulatorDevice:
            form.device || undefined,
          simulatorOS:
            form.operatingSystem || undefined,
          simulatorBrowser:
            form.browser || undefined,
          simulatorCountry:
            form.country || undefined,
          simulatorState:
            form.state || undefined,
          simulatorCity:
            form.city || undefined,
        },

        /*
         * These are included for forward compatibility
         * with the validation contract.
         */
        timestamp: form.timestamp
          ? new Date(
              form.timestamp
            ).toISOString()
          : undefined,
      };

      const data =
        await simulateQRRule(payload);

      setResponse(
        data as SimulationResponse
      );
    } catch (simulationError) {
      setResponse(null);
      setError(
        extractErrorMessage(
          simulationError
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={[
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      {/* ======================================================
          HEADER
         ====================================================== */}

      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <PlayIcon />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Rule Simulator
                </h2>

                <p className="text-xs text-slate-500">
                  Test routing without affecting
                  production analytics.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            disabled={loading || disabled}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateIcon />
            Reset
          </button>
        </div>
      </div>

      {/* ======================================================
          BODY
         ====================================================== */}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
        {/* ====================================================
            FORM
           ==================================================== */}

        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            {/* QR CODE */}

            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  QR Context
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Choose the QR code whose active
                  routing rules should be evaluated.
                </p>
              </div>

              <Field label="QR Code">
                <SelectField
                  value={form.qrCodeId}
                  disabled={
                    disabled ||
                    loading ||
                    qrCodes.length === 0
                  }
                  onChange={(value) =>
                    updateField(
                      "qrCodeId",
                      value
                    )
                  }
                  options={[
                    {
                      value: "",
                      label:
                        qrCodes.length > 0
                          ? "Select a QR code"
                          : "No QR codes available",
                    },
                    ...qrCodes.map((qr) => ({
                      value: qr.id,
                      label: qr.name,
                    })),
                  ]}
                />
              </Field>

              {selectedQRCode ? (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-medium">
                    ID
                  </span>
                  <span className="truncate font-mono">
                    {selectedQRCode.id}
                  </span>
                  {selectedQRCode.shortCode ? (
                    <>
                      <span>•</span>
                      <span>
                        /r/
                        {selectedQRCode.shortCode}
                      </span>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* VISITOR */}

            <div>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Visitor
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Simulate who is scanning the QR.
                  </p>
                </div>

                <div className="flex gap-1.5">
                  {VISITOR_PRESETS.map(
                    (preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        disabled={
                          disabled || loading
                        }
                        onClick={() =>
                          applyVisitorPreset(
                            preset
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
                      >
                        {preset.label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Visitor key">
                  <TextField
                    value={form.visitorKey}
                    disabled={
                      disabled || loading
                    }
                    placeholder="visitor-123"
                    onChange={(value) =>
                      updateField(
                        "visitorKey",
                        value
                      )
                    }
                  />
                </Field>

                <Field
                  label="Customer ID"
                  hint="Optional"
                >
                  <TextField
                    value={form.customerId}
                    disabled={
                      disabled || loading
                    }
                    placeholder="cus_..."
                    onChange={(value) =>
                      updateField(
                        "customerId",
                        value
                      )
                    }
                  />
                </Field>
              </div>
            </div>

            {/* DEVICE */}

            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Device & Browser
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  These values are converted into
                  simulator request metadata.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Device">
                  <SelectField
                    value={form.device}
                    disabled={
                      disabled || loading
                    }
                    onChange={(value) =>
                      updateField(
                        "device",
                        value
                      )
                    }
                    options={DEVICE_OPTIONS}
                  />
                </Field>

                <Field label="Operating system">
                  <SelectField
                    value={
                      form.operatingSystem
                    }
                    disabled={
                      disabled || loading
                    }
                    onChange={(value) =>
                      updateField(
                        "operatingSystem",
                        value
                      )
                    }
                    options={OS_OPTIONS}
                  />
                </Field>

                <Field label="Browser">
                  <SelectField
                    value={form.browser}
                    disabled={
                      disabled || loading
                    }
                    onChange={(value) =>
                      updateField(
                        "browser",
                        value
                      )
                    }
                    options={
                      BROWSER_OPTIONS
                    }
                  />
                </Field>
              </div>
            </div>

            {/* LOCATION */}

            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Location & Language
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Country">
                  <TextField
                    value={form.country}
                    disabled={
                      disabled || loading
                    }
                    placeholder="India"
                    onChange={(value) =>
                      updateField(
                        "country",
                        value
                      )
                    }
                  />
                </Field>

                <Field label="State">
                  <TextField
                    value={form.state}
                    disabled={
                      disabled || loading
                    }
                    placeholder="Andhra Pradesh"
                    onChange={(value) =>
                      updateField(
                        "state",
                        value
                      )
                    }
                  />
                </Field>

                <Field label="City">
                  <TextField
                    value={form.city}
                    disabled={
                      disabled || loading
                    }
                    placeholder="Kadiri"
                    onChange={(value) =>
                      updateField(
                        "city",
                        value
                      )
                    }
                  />
                </Field>

                <Field label="Language">
                  <TextField
                    value={form.language}
                    disabled={
                      disabled || loading
                    }
                    placeholder="en"
                    onChange={(value) =>
                      updateField(
                        "language",
                        value
                      )
                    }
                  />
                </Field>
              </div>
            </div>

            {/* ATTRIBUTION */}

            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Traffic Attribution
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Useful for UTM, campaign and
                  referrer rules.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Referrer">
                  <TextField
                    value={form.referrer}
                    disabled={
                      disabled || loading
                    }
                    placeholder="https://instagram.com"
                    onChange={(value) =>
                      updateField(
                        "referrer",
                        value
                      )
                    }
                  />
                </Field>

                <Field label="UTM source">
                  <TextField
                    value={form.utmSource}
                    disabled={
                      disabled || loading
                    }
                    placeholder="instagram"
                    onChange={(value) =>
                      updateField(
                        "utmSource",
                        value
                      )
                    }
                  />
                </Field>

                <Field label="UTM medium">
                  <TextField
                    value={form.utmMedium}
                    disabled={
                      disabled || loading
                    }
                    placeholder="social"
                    onChange={(value) =>
                      updateField(
                        "utmMedium",
                        value
                      )
                    }
                  />
                </Field>

                <Field label="UTM campaign">
                  <TextField
                    value={
                      form.utmCampaign
                    }
                    disabled={
                      disabled || loading
                    }
                    placeholder="summer-sale"
                    onChange={(value) =>
                      updateField(
                        "utmCampaign",
                        value
                      )
                    }
                  />
                </Field>

                <Field
                  label="UTM term"
                  hint="Optional"
                >
                  <TextField
                    value={form.utmTerm}
                    disabled={
                      disabled || loading
                    }
                    placeholder="keyword"
                    onChange={(value) =>
                      updateField(
                        "utmTerm",
                        value
                      )
                    }
                  />
                </Field>

                <Field
                  label="UTM content"
                  hint="Optional"
                >
                  <TextField
                    value={
                      form.utmContent
                    }
                    disabled={
                      disabled || loading
                    }
                    placeholder="banner-a"
                    onChange={(value) =>
                      updateField(
                        "utmContent",
                        value
                      )
                    }
                  />
                </Field>
              </div>
            </div>

            {/* TIME */}

            <div>
              <Field
                label="Simulation time"
                hint="Optional"
              >
                <TextField
                  type="datetime-local"
                  value={form.timestamp}
                  disabled={
                    disabled || loading
                  }
                  onChange={(value) =>
                    updateField(
                      "timestamp",
                      value
                    )
                  }
                />
              </Field>
            </div>

            {/* ERROR */}

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <XIcon />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-red-900">
                      Simulation failed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* RUN */}

            <button
              type="button"
              onClick={runSimulation}
              disabled={
                disabled ||
                loading ||
                !form.qrCodeId
              }
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Evaluating rules...
                </>
              ) : (
                <>
                  <PlayIcon />
                  Run Simulation
                </>
              )}
            </button>

            <p className="text-center text-[10px] leading-4 text-slate-400">
              Simulation uses the routing engine but
              does not create production match analytics
              or experiment assignments.
            </p>
          </div>
        </div>

        {/* ====================================================
            RESULT
           ==================================================== */}

        <div className="min-h-[500px] bg-slate-50/50 p-5 sm:p-6">
          {!response ? (
            <div className="flex h-full min-h-[460px] items-center justify-center">
              <div className="max-w-xs text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                  <PlayIcon />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  Ready to simulate
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Configure the visitor context on the
                  left and run the simulation to see
                  exactly how your QR rules evaluate.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Simulation Result
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Routing decision and evaluation trace.
                </p>
              </div>

              <ResultStatus status={status} />

              {/* SELECTED RULE */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Routing decision
                  </h4>

                  {result?.matchedAt ? (
                    <span className="text-[10px] text-slate-400">
                      {new Date(
                        result.matchedAt
                      ).toLocaleTimeString()}
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      Rule ID
                    </p>

                    <p className="mt-1 truncate font-mono text-xs text-slate-800">
                      {result?.ruleId ||
                        result?.selectedRuleId ||
                        "No matching rule"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      Version
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {result?.ruleVersion ??
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      Action
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-900">
                      {result?.action?.type ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      Action value
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-700">
                      {formatValue(
                        result?.action?.value
                      )}
                    </p>
                  </div>
                </div>

                {result?.selectedReason ? (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-medium text-slate-400">
                      Decision reason
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {result.selectedReason}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* EXPERIMENT */}

              {result?.experimentId ||
              result?.variantId ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                    Experiment
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-indigo-400">
                        Experiment
                      </p>

                      <p className="mt-1 truncate font-mono text-xs text-indigo-900">
                        {result.experimentId ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-indigo-400">
                        Variant
                      </p>

                      <p className="mt-1 truncate font-mono text-xs text-indigo-900">
                        {result.variantId ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* TRACE */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Evaluation trace
                    </h4>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Condition-by-condition routing
                      evaluation.
                    </p>
                  </div>

                  {trace.length > 0 ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      {trace.length} checks
                    </span>
                  ) : null}
                </div>

                {trace.length > 0 ? (
                  <div className="space-y-2">
                    {trace.map(
                      (item, index) => {
                        const matched =
                          item.matched ??
                          item.result ??
                          false;

                        return (
                          <div
                            key={`${item.conditionType || "trace"}-${index}`}
                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                          >
                            <div
                              className={[
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                matched
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600",
                              ].join(" ")}
                            >
                              {matched ? (
                                <CheckIcon />
                              ) : (
                                <XIcon />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-800">
                                  {item.conditionType ||
                                    "Condition"}
                                </span>

                                {item.operator ? (
                                  <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[9px] text-slate-600">
                                    {item.operator}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-1 grid gap-1 text-[10px] sm:grid-cols-2">
                                <span className="text-slate-500">
                                  Expected:{" "}
                                  <strong className="font-semibold text-slate-700">
                                    {formatValue(
                                      item.value
                                    )}
                                  </strong>
                                </span>

                                <span className="text-slate-500">
                                  Actual:{" "}
                                  <strong className="font-semibold text-slate-700">
                                    {formatValue(
                                      item.actualValue
                                    )}
                                  </strong>
                                </span>
                              </div>

                              {item.reason ? (
                                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                                  {item.reason}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      No trace entries returned
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-400">
                      The routing result was returned,
                      but no condition trace was exposed
                      by the response.
                    </p>
                  </div>
                )}
              </div>

              {/* CONTEXT SUMMARY */}

              <details className="rounded-2xl border border-slate-200 bg-white">
                <summary className="cursor-pointer list-none px-4 py-3 text-xs font-bold text-slate-700">
                  <span className="flex items-center justify-between">
                    Simulation context
                    <span className="text-[10px] font-normal text-slate-400">
                      View raw context
                    </span>
                  </span>
                </summary>

                <div className="border-t border-slate-100 p-4">
                  <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-[10px] leading-5 text-slate-200">
                    {JSON.stringify(
                      response.context ??
                        {},
                      null,
                      2
                    )}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}