"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RuleVersions from "@/components/qr-rules/RuleVersions";
import {
  activateQRRule,
  deleteQRRule,
  getQRRule,
  pauseQRRule,
  publishQRRule,
  type QRRule,
  type QRRuleCondition,
  type QRRuleConditionGroup,
} from "@/lib/qr-rules";

import RuleSimulator from "@/components/qr-rules/RuleSimulator";
import RuleMatches from "@/components/qr-rules/RuleMatches";

/* ============================================================
   TYPES
============================================================ */

type QRCodeForRule = {
  id: string;
  name: string;
  shortCode?: string | null;
  businessId?: string | null;
  status?: string | null;
};

type RuleWithRelations = QRRule & {
  qrCode?: QRCodeForRule | null;

  /*
   * Different backend/frontend revisions have used both
   * conditionGroups and qrruleConditionGroups.
   *
   * Keep the page tolerant of either response shape.
   */
  groups?: QRRuleConditionGroup[];
  qrruleConditionGroups?: QRRuleConditionGroup[];

  versions?: Array<{
    id?: string;
    version: number;
    status?: string;
    createdAt?: string;
    publishedAt?: string | null;
    rollbackFromVersion?: number | null;
  }>;

  experiment?: {
    id?: string;
    name?: string;
    status?: string;
    variants?: Array<{
      id?: string;
      name?: string;
      allocation?: number;
    }>;
  } | null;

  auditLogs?: Array<{
    id?: string;
    action?: string;
    createdAt?: string;
  }>;
};

/* ============================================================
   ICONS
============================================================ */

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m16.5 3.5 4 4L9 19l-5 1 1-5 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M8 6v12M16 6v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M14 4c3.5-1 6 0 6 0s1 2.5 0 6c-1.2 4.2-4.6 7.5-8.5 8.5L9 16l-2.5-2.5C7.5 9.6 10.8 6.2 14 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 15.5 5 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M5 13.5 3 15.5M10.5 19 9 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="15.5"
        cy="8.5"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M4 7h16v13H4V7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M3 4h18v3H3V4ZM9 11h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M20 11a8 8 0 0 0-14.9-4M5 4v4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8 8 0 0 0 14.9 4M19 20v-4h-4"
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

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M12 4 21 20H3L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v5M12 17h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
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

function statusLabel(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PAUSED":
      return "Paused";
    case "DRAFT":
      return "Draft";
    case "EXPIRED":
      return "Expired";
    case "ARCHIVED":
      return "Archived";
    default:
      return status || "Unknown";
  }
}

function statusClass(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PAUSED":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "EXPIRED":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function actionLabel(action?: string | null) {
  if (!action) {
    return "—";
  }

  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getConditions(
  rule: RuleWithRelations
): QRRuleCondition[] {
  return rule.conditions ?? [];
}

function getGroups(
  rule: RuleWithRelations
): QRRuleConditionGroup[] {
  return (
    rule.conditionGroups ??
    rule.groups ??
    rule.qrruleConditionGroups ??
    []
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      {hint ? (
        <p className="mt-1 text-[10px] text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
  right,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {title}
          </h2>

          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        {right}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function ConditionRow({
  condition,
  index,
}: {
  condition: QRRuleCondition;
  index: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">
              {condition.type}
            </span>

            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] text-slate-600">
              {condition.operator}
            </span>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Value
              </p>

              <p className="mt-0.5 break-words text-xs text-slate-700">
                {formatValue(condition.value)}
              </p>
            </div>

            {condition.value2 !== undefined ? (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Value 2
                </p>

                <p className="mt-0.5 break-words text-xs text-slate-700">
                  {formatValue(condition.value2)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function RuleDetailPage() {
  const params = useParams<{ ruleId: string }>();
  const router = useRouter();

  const ruleId = Array.isArray(params?.ruleId)
    ? params.ruleId[0]
    : params?.ruleId;

  const [rule, setRule] =
    useState<RuleWithRelations | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [matchesRefreshKey, setMatchesRefreshKey] =
    useState(0);

  /* ==========================================================
     LOAD RULE
  ========================================================== */

  const loadRule = useCallback(async () => {
    if (!ruleId) {
      setError("Rule ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getQRRule(ruleId);

      const data = response?.data as
        | RuleWithRelations
        | undefined;

      if (!data) {
        throw new Error("QR rule was not found.");
      }

      setRule(data);
    } catch (loadError) {
      setRule(null);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load this QR rule."
      );
    } finally {
      setLoading(false);
    }
  }, [ruleId]);

  useEffect(() => {
    void loadRule();
  }, [loadRule]);

  /* ==========================================================
     ACTION HANDLER
  ========================================================== */

  const runAction = async (
    action: "publish" | "activate" | "pause" | "archive"
  ) => {
    if (!ruleId || actionLoading) {
      return;
    }

    if (
      action === "archive" &&
      !window.confirm(
        "Archive this rule? It will no longer participate in routing."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      if (action === "publish") {
        await publishQRRule(ruleId);
        setSuccess("Rule published successfully.");
      }

      if (action === "activate") {
        await activateQRRule(ruleId);
        setSuccess("Rule activated successfully.");
      }

      if (action === "pause") {
        await pauseQRRule(ruleId);
        setSuccess("Rule paused successfully.");
      }

      if (action === "archive") {
        await deleteQRRule(ruleId);
        setSuccess("Rule archived successfully.");
      }

      await loadRule();

      setMatchesRefreshKey(
        (current) => current + 1
      );

      if (action === "archive") {
        setTimeout(() => {
          router.push("/dashboard/qr/rules");
        }, 500);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to complete the requested action."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const conditions = useMemo(
    () => (rule ? getConditions(rule) : []),
    [rule]
  );

  const groups = useMemo(
    () => (rule ? getGroups(rule) : []),
    [rule]
  );

  const qrCode = rule?.qrCode;

  const simulatorQRCodes = useMemo(() => {
    if (!rule) {
      return [];
    }

    return [
      {
        id: rule.qrCodeId,
        name:
          qrCode?.name ||
          `QR Code ${rule.qrCodeId.slice(0, 8)}`,
        shortCode: qrCode?.shortCode,
        businessId:
          qrCode?.businessId,
      },
    ];
  }, [rule, qrCode]);

  const isArchived =
    rule?.status === "ARCHIVED";

  const isActive =
    rule?.status === "ACTIVE";

  const isPublished =
    Boolean(rule?.publishedVersion);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
                />
              )
            )}
          </div>

          <div className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
      </main>
    );
  }

  /* ==========================================================
     ERROR / NOT FOUND
  ========================================================== */

  if (!rule) {
    return (
      <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/qr/rules"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeftIcon />
            Back to Smart Rules
          </Link>

          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertIcon />
              </div>

              <div>
                <h1 className="text-sm font-bold text-slate-950">
                  Unable to load rule
                </h1>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  {error ||
                    "The requested rule could not be found."}
                </p>

                <button
                  type="button"
                  onClick={() => void loadRule()}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <RefreshIcon />
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ======================================================
            BREADCRUMB
        ====================================================== */}

        <Link
          href="/dashboard/qr/rules"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeftIcon />
          Smart Rules
        </Link>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold",
                      statusClass(rule.status),
                    ].join(" ")}
                  >
                    {statusLabel(rule.status)}
                  </span>

                  {rule.publishedVersion ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                      v{rule.publishedVersion} published
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {rule.name}
                </h1>

                {rule.description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {rule.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    No description provided.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
                  <span>
                    Rule ID{" "}
                    <strong className="font-mono text-slate-600">
                      {rule.id}
                    </strong>
                  </span>

                  <span>
                    QR{" "}
                    <strong className="text-slate-600">
                      {qrCode?.name ||
                        rule.qrCodeId}
                    </strong>
                  </span>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-2 xl:max-w-xl xl:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/qr/rules/new?edit=${encodeURIComponent(
                        rule.id
                      )}`
                    )
                  }
                  disabled={
                    actionLoading ||
                    isArchived
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <EditIcon />
                  Edit
                </button>

                {!isPublished &&
                !isArchived ? (
                  <button
                    type="button"
                    onClick={() =>
                      void runAction("publish")
                    }
                    disabled={actionLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RocketIcon />
                    Publish
                  </button>
                ) : null}

                {isPublished &&
                !isActive &&
                !isArchived ? (
                  <button
                    type="button"
                    onClick={() =>
                      void runAction("activate")
                    }
                    disabled={actionLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PlayIcon />
                    Activate
                  </button>
                ) : null}

                {isActive ? (
                  <button
                    type="button"
                    onClick={() =>
                      void runAction("pause")
                    }
                    disabled={actionLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PauseIcon />
                    Pause
                  </button>
                ) : null}

                {!isArchived ? (
                  <button
                    type="button"
                    onClick={() =>
                      void runAction("archive")
                    }
                    disabled={actionLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArchiveIcon />
                    Archive
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            SUCCESS / ERROR
        ====================================================== */}

        {success ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckIcon />
            </div>

            <p className="text-xs font-semibold text-emerald-800">
              {success}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertIcon />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-red-900">
                Action failed
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>
          </div>
        ) : null}

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Priority"
            value={rule.priority}
            hint="Higher priority evaluates first"
          />

          <StatCard
            label="Match count"
            value={rule.matchCount ?? 0}
            hint={
              rule.lastMatchedAt
                ? `Last: ${formatDate(
                    rule.lastMatchedAt
                  )}`
                : "No matches yet"
            }
          />

          <StatCard
            label="Conditions"
            value={
              conditions.length +
              groups.reduce(
                (total, group) =>
                  total +
                  (group.conditions?.length ??
                    0),
                0
              )
            }
            hint={`${rule.logic} evaluation`}
          />

          <StatCard
            label="Published version"
            value={
              rule.publishedVersion ??
              "—"
            }
            hint={
              isPublished
                ? "Production version"
                : "Not published"
            }
          />
        </div>

        {/* ======================================================
            RULE CONFIGURATION
        ====================================================== */}

        <div className="grid gap-5 lg:grid-cols-2">

          {/* CONDITIONS */}

          <Section
            title="Conditions"
            description="Conditions used by the routing engine."
            right={
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                {rule.logic}
              </span>
            }
          >
            {conditions.length === 0 &&
            groups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                <p className="text-xs font-semibold text-slate-600">
                  No conditions configured
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  This rule may match without
                  condition checks.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conditions.map(
                  (condition, index) => (
                    <ConditionRow
                      key={
                        condition.id ??
                        `${condition.type}-${index}`
                      }
                      condition={condition}
                      index={index}
                    />
                  )
                )}

                {groups.map(
                  (group, groupIndex) => (
                    <div
                      key={
                        group.id ??
                        `group-${groupIndex}`
                      }
                      className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-400">
                            Condition group
                          </p>

                          <p className="mt-0.5 text-xs font-bold text-indigo-900">
                            {group.logic}
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-indigo-500 ring-1 ring-indigo-100">
                          Group {groupIndex + 1}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {(
                          group.conditions ?? []
                        ).map(
                          (
                            condition,
                            conditionIndex
                          ) => (
                            <ConditionRow
                              key={
                                condition.id ??
                                `${groupIndex}-${conditionIndex}`
                              }
                              condition={
                                condition
                              }
                              index={
                                conditionIndex
                              }
                            />
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>

          {/* ACTION */}

          <Section
            title="Routing action"
            description="Action executed when this rule wins."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Action type
                </p>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {actionLabel(
                    rule.actionType
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Action value
                </p>

                <p className="mt-2 break-all text-xs text-slate-700">
                  {rule.actionValue ||
                    "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Fallback
              </p>

              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                {rule.fallbackActionType ? (
                  <>
                    <p className="text-xs font-bold text-slate-800">
                      {actionLabel(
                        rule.fallbackActionType
                      )}
                    </p>

                    <p className="mt-1 break-all text-[11px] text-slate-500">
                      {rule.fallbackActionValue ||
                        "No value"}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">
                    No rule-specific fallback
                  </p>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* ======================================================
            SCHEDULE / QR
        ====================================================== */}

        <Section
          title="Rule context"
          description="QR code and activation window."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                QR code
              </p>

              <p className="mt-1 text-xs font-bold text-slate-800">
                {qrCode?.name ||
                  rule.qrCodeId}
              </p>

              {qrCode?.shortCode ? (
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  /r/{qrCode.shortCode}
                </p>
              ) : null}
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Priority
              </p>

              <p className="mt-1 text-xs font-bold text-slate-800">
                {rule.priority}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Starts
              </p>

              <p className="mt-1 text-xs text-slate-700">
                {formatDate(
                  (
                    rule as QRRule & {
                      startsAt?: string | null;
                    }
                  ).startsAt
                )}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Ends
              </p>

              <p className="mt-1 text-xs text-slate-700">
                {formatDate(
                  (
                    rule as QRRule & {
                      endsAt?: string | null;
                    }
                  ).endsAt
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* ======================================================
            EXPERIMENT
        ====================================================== */}

        {rule.experiment ? (
          <Section
            title="Experiment"
            description="Experiment connected to this rule."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Experiment
                </p>

                <p className="mt-1 text-xs font-bold text-slate-800">
                  {rule.experiment.name ||
                    rule.experiment.id ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {rule.experiment.status ||
                    "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Variants
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    rule.experiment
                      .variants ?? []
                  ).length > 0 ? (
                    rule.experiment.variants.map(
                      (variant, index) => (
                        <span
                          key={
                            variant.id ??
                            index
                          }
                          className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-700"
                        >
                          {variant.name ||
                            variant.id ||
                            `Variant ${
                              index + 1
                            }`}
                        </span>
                      )
                    )
                  ) : (
                    <span className="text-xs text-slate-400">
                      No variants
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Section>
        ) : null}

        {/* ======================================================
            SIMULATOR
        ====================================================== */}

        <div id="simulator">
          <RuleSimulator
            qrCodes={
              simulatorQRCodes
            }
            defaultQRCodeId={
              rule.qrCodeId
            }
            disabled={
              actionLoading ||
              isArchived
            }
          />
        </div>

        {/* ======================================================
            MATCH ANALYTICS
        ====================================================== */}

        <div id="matches">
          <RuleMatches
            qrCodeId={rule.qrCodeId}
            ruleId={rule.id}
            pageSize={25}
            refreshKey={
              matchesRefreshKey
            }
          />
        </div>

        {/* ======================================================
            VERSION HISTORY
        ====================================================== */}

        {rule.versions &&
        rule.versions.length > 0 ? (
          <Section
            title="Version history"
            description="Published and archived rule versions."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Version
                    </th>

                    <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Created
                    </th>

                    <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Published
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rule.versions.map(
                    (version, index) => (
                      <tr
                        key={
                          version.id ??
                          `${version.version}-${index}`
                        }
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-3 py-3">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            v{version.version}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">
                            {version.status ||
                              "—"}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-[11px] text-slate-500">
                          {formatDate(
                            version.createdAt
                          )}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-slate-500">
                          {formatDate(
                            version.publishedAt
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        ) : null}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="flex flex-col gap-2 pb-6 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Created{" "}
            {formatDate(rule.createdAt)}
          </span>

          <span>
            Last updated{" "}
            {formatDate(rule.updatedAt)}
          </span>
        </div>
      </div>
    </main>
  );
}