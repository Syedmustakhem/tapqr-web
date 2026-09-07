"use client";

import React, { useMemo, useState } from "react";
import {
  rollbackQRRule,
  type QRRule,
  type QRRuleVersion,
} from "@/lib/qr-rules";

interface RuleVersionsProps {
  rule: QRRule;
  disabled?: boolean;
  onChanged?: () => void | Promise<void>;
  className?: string;
}

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status?: string) {
  switch (status) {
    case "PUBLISHED":
      return "Published";

    case "DRAFT":
      return "Draft";

    case "TESTING":
      return "Testing";

    case "ARCHIVED":
      return "Archived";

    default:
      return status || "Unknown";
  }
}

function statusClasses(status?: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "DRAFT":
      return "border-slate-200 bg-slate-50 text-slate-600";

    case "TESTING":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-500";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function snapshotRecord(
  snapshot: unknown
): Record<string, unknown> | null {
  if (
    snapshot &&
    typeof snapshot === "object" &&
    !Array.isArray(snapshot)
  ) {
    return snapshot as Record<string, unknown>;
  }

  return null;
}

function valueLabel(value: unknown) {
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
    return "—";
  }
}

/* ============================================================
   ICONS
============================================================ */

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M3.5 12a8.5 8.5 0 1 0 2.5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M3.5 5v5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function ChevronIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={[
        "h-4 w-4 transition-transform",
        open ? "rotate-180" : "",
      ].join(" ")}
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
   SNAPSHOT PREVIEW
============================================================ */

function SnapshotPreview({
  version,
}: {
  version: QRRuleVersion;
}) {
  const snapshot = snapshotRecord(version.snapshot);

  if (!snapshot) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        No readable snapshot data is available.
      </div>
    );
  }

  const conditions = Array.isArray(snapshot.conditions)
    ? snapshot.conditions
    : [];

  const groups = Array.isArray(snapshot.groups)
    ? snapshot.groups
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Action
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {valueLabel(snapshot.actionType)}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {valueLabel(snapshot.actionValue)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Priority
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {valueLabel(snapshot.priority)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Logic
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {valueLabel(snapshot.logic)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Conditions
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {conditions.length}
            {groups.length > 0
              ? ` + ${groups.length} groups`
              : ""}
          </p>
        </div>
      </div>

      <details className="group rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <span>View complete snapshot</span>

            <span className="text-slate-400 transition group-open:rotate-180">
              <ChevronIcon open={false} />
            </span>
          </div>
        </summary>

        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-600">
            {JSON.stringify(
              version.snapshot,
              null,
              2
            )}
          </pre>
        </div>
      </details>
    </div>
  );
}

/* ============================================================
   VERSION ROW
============================================================ */

function VersionRow({
  version,
  currentPublishedVersion,
  busy,
  disabled,
  expanded,
  onToggle,
  onRollback,
}: {
  version: QRRuleVersion;
  currentPublishedVersion?: number | null;
  busy: boolean;
  disabled: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRollback: () => void;
}) {
  const isCurrent =
    currentPublishedVersion === version.version;

  const isRollbackVersion =
    version.rollbackFromVersion !== null &&
    version.rollbackFromVersion !== undefined;

  const canRollback =
    !disabled &&
    !busy &&
    version.status !== "DRAFT" &&
    !isCurrent;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                isCurrent
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-50 text-slate-500",
              ].join(" ")}
            >
              <HistoryIcon />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-950">
                  Version {version.version}
                </span>

                <span
                  className={[
                    "inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]",
                    statusClasses(version.status),
                  ].join(" ")}
                >
                  {statusLabel(version.status)}
                </span>

                {isCurrent ? (
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                    Current
                  </span>
                ) : null}

                {isRollbackVersion ? (
                  <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-blue-700">
                    Rollback
                  </span>
                ) : null}
              </div>

              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span>
                  Created {formatDate(version.createdAt)}
                </span>

                {version.publishedAt ? (
                  <span>
                    Published{" "}
                    {formatDate(
                      version.publishedAt
                    )}
                  </span>
                ) : null}

                {version.rollbackFromVersion !==
                null &&
                version.rollbackFromVersion !==
                  undefined ? (
                  <span>
                    Restored from v
                    {version.rollbackFromVersion}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canRollback ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onRollback();
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    onRollback();
                  }
                }}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <RotateIcon />
                Roll back
              </span>
            ) : null}

            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
              <ChevronIcon open={expanded} />
            </span>
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <SnapshotPreview version={version} />
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   MAIN
============================================================ */

export default function RuleVersions({
  rule,
  disabled = false,
  onChanged,
  className = "",
}: RuleVersionsProps) {
  const versions = useMemo(
    () =>
      [...(rule.versions ?? [])].sort(
        (a, b) => b.version - a.version
      ),
    [rule.versions]
  );

  const [expandedVersion, setExpandedVersion] =
    useState<number | null>(
      versions[0]?.version ?? null
    );

  const [rollbackVersion, setRollbackVersion] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const rollbackTarget = versions.find(
    (version) =>
      version.version === rollbackVersion
  );

  const handleRollback = async (
    version: QRRuleVersion
  ) => {
    if (loading || disabled) {
      return;
    }

    const confirmed = window.confirm(
      `Roll back "${rule.name}" to version ${version.version}?\n\nThis will create a new published version using that snapshot. Existing versions will remain in history.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRollbackVersion(version.version);

      await rollbackQRRule(
        rule.id,
        version.version
      );

      if (onChanged) {
        await onChanged();
      }
    } catch (rollbackError) {
      const message =
        rollbackError instanceof Error
          ? rollbackError.message
          : "Unable to roll back the rule.";

      setError(message);
    } finally {
      setLoading(false);
      setRollbackVersion(null);
    }
  };

  return (
    <section
      className={[
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      ].join(" ")}
    >
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <HistoryIcon />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Version History
                </h2>

                <p className="text-xs text-slate-500">
                  Immutable rule snapshots and rollback
                  history.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Published version
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {rule.publishedVersion
                ? `v${rule.publishedVersion}`
                : "None"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs font-semibold text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        {loading && rollbackTarget ? (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold text-blue-700">
              Rolling back to version{" "}
              {rollbackTarget.version}…
            </p>
          </div>
        ) : null}

        {versions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
              <HistoryIcon />
            </div>

            <h3 className="mt-3 text-sm font-bold text-slate-900">
              No versions yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              Versions will appear here when the rule
              is created, updated, published, or
              rolled back.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <VersionRow
                key={version.id}
                version={version}
                currentPublishedVersion={
                  rule.publishedVersion
                }
                busy={loading}
                disabled={disabled}
                expanded={
                  expandedVersion ===
                  version.version
                }
                onToggle={() =>
                  setExpandedVersion(
                    (current) =>
                      current === version.version
                        ? null
                        : version.version
                  )
                }
                onRollback={() =>
                  void handleRollback(version)
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}