"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getQRRuleMatches,
  QRRuleMatch,
  QRRuleMatchStatus,
} from "@/lib/qr-rules";

type RuleMatchesProps = {
  qrCodeId: string;
  ruleId?: string;
  pageSize?: number;
  refreshKey?: number;
};

const STATUS_OPTIONS: Array<{
  value: "" | QRRuleMatchStatus;
  label: string;
}> = [
  { value: "", label: "All statuses" },
  { value: "MATCHED", label: "Matched" },
  { value: "NOT_MATCHED", label: "Not matched" },
  { value: "FALLBACK", label: "Fallback" },
  { value: "ERROR", label: "Error" },
];

const statusClasses: Record<QRRuleMatchStatus, string> = {
  MATCHED:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  NOT_MATCHED:
    "bg-slate-100 text-slate-700 ring-slate-200",
  FALLBACK:
    "bg-amber-50 text-amber-700 ring-amber-200",
  ERROR:
    "bg-red-50 text-red-700 ring-red-200",
};

function formatStatus(status: QRRuleMatchStatus) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function valueOrDash(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  return String(value);
}

function truncate(value?: string | null, length = 36) {
  if (!value) return "—";

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}…`;
}

function getLocation(match: QRRuleMatch) {
  return [match.city, match.state, match.country]
    .filter(Boolean)
    .join(", ");
}

function getAttribution(match: QRRuleMatch) {
  return [
    match.utmSource,
    match.utmMedium,
    match.utmCampaign,
  ]
    .filter(Boolean)
    .join(" / ");
}

export default function RuleMatches({
  qrCodeId,
  ruleId,
  pageSize = 25,
  refreshKey = 0,
}: RuleMatchesProps) {
  const [matches, setMatches] = useState<QRRuleMatch[]>([]);
  const [status, setStatus] = useState<
    "" | QRRuleMatchStatus
  >("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const [expandedId, setExpandedId] = useState<
    string | null
  >(null);

  const loadMatches = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!qrCodeId) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const silent = options?.silent ?? false;

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await getQRRuleMatches(
          qrCodeId,
          {
            ruleId,
            status: status || undefined,
            from: from
              ? new Date(`${from}T00:00:00`).toISOString()
              : undefined,
            to: to
              ? new Date(
                  `${to}T23:59:59.999`
                ).toISOString()
              : undefined,
            limit: pageSize,
            offset: page * pageSize,
          }
        );

        setMatches(response?.data ?? []);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load rule matches.";

        setError(message);
        setMatches([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      qrCodeId,
      ruleId,
      status,
      from,
      to,
      page,
      pageSize,
    ]
  );

  useEffect(() => {
    void loadMatches();
  }, [loadMatches, refreshKey]);

  useEffect(() => {
    setPage(0);
  }, [status, from, to, ruleId, qrCodeId]);

  const stats = useMemo(() => {
    return {
      total: matches.length,
      matched: matches.filter(
        (item) => item.status === "MATCHED"
      ).length,
      fallback: matches.filter(
        (item) => item.status === "FALLBACK"
      ).length,
      errors: matches.filter(
        (item) => item.status === "ERROR"
      ).length,
    };
  }, [matches]);

  const hasNextPage =
    matches.length === pageSize;

  const hasPreviousPage = page > 0;

  function clearFilters() {
    setStatus("");
    setFrom("");
    setTo("");
    setPage(0);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                Rule Matches
              </h2>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Live analytics
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Review how this Smart Rule is being evaluated
              in real traffic.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadMatches({ silent: true })
            }
            disabled={refreshing || loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M5.5 9A7.5 7.5 0 0 1 18 6.5L20 9M18.5 15A7.5 7.5 0 0 1 6 17.5L4 15"
              />
            </svg>

            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Loaded"
            value={stats.total}
          />

          <StatCard
            label="Matched"
            value={stats.matched}
          />

          <StatCard
            label="Fallback"
            value={stats.fallback}
          />

          <StatCard
            label="Errors"
            value={stats.errors}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="rule-match-status"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Status
            </label>

            <select
              id="rule-match-status"
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value as
                    | ""
                    | QRRuleMatchStatus
                );
                setPage(0);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value || "all"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rule-match-from"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              From
            </label>

            <input
              id="rule-match-from"
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="rule-match-to"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              To
            </label>

            <input
              id="rule-match-to"
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!status && !from && !to}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:mx-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              !
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Unable to load matches
              </p>

              <p className="mt-0.5 text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadMatches()}
              className="ml-auto shrink-0 text-sm font-medium text-red-700 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-5 sm:p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && matches.length === 0 && (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6M9 16h6M8 3h8l3 3v15H5V3h3Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 3v4h8V3"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No rule matches found
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Try changing the filters or generate some
            traffic through the QR code.
          </p>
        </div>
      )}

      {/* Desktop table */}
      {!loading && !error && matches.length > 0 && (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {matches.map((match) => {
                  const expanded =
                    expandedId === match.id;

                  return (
                    <tr
                      key={match.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge
                          status={match.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-36">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {valueOrDash(
                              match.actionType
                            )}
                          </p>

                          {match.actionValue && (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {match.actionValue}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {match.ruleVersion
                          ? `v${match.ruleVersion}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {truncate(match.visitorKey, 20)}
                        </code>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm text-slate-800">
                            {valueOrDash(
                              match.device
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {[
                              match.browser,
                              match.operatingSystem,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700">
                          {getLocation(match) || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-32">
                          <p className="truncate text-sm text-slate-700">
                            {valueOrDash(
                              match.sourceType
                            )}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {getAttribution(match) || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(match.matchedAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expanded
                                ? null
                                : match.id
                            )
                          }
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          {expanded
                            ? "Hide"
                            : "Details"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 lg:hidden">
            {matches.map((match) => {
              const expanded =
                expandedId === match.id;

              return (
                <div
                  key={match.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <StatusBadge
                      status={match.status}
                    />

                    <span className="text-xs text-slate-400">
                      {formatDate(match.matchedAt)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Action"
                      value={valueOrDash(
                        match.actionType
                      )}
                    />

                    <InfoItem
                      label="Version"
                      value={
                        match.ruleVersion
                          ? `v${match.ruleVersion}`
                          : "—"
                      }
                    />

                    <InfoItem
                      label="Device"
                      value={valueOrDash(
                        match.device
                      )}
                    />

                    <InfoItem
                      label="Browser"
                      value={valueOrDash(
                        match.browser
                      )}
                    />

                    <InfoItem
                      label="OS"
                      value={valueOrDash(
                        match.operatingSystem
                      )}
                    />

                    <InfoItem
                      label="Location"
                      value={
                        getLocation(match) || "—"
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(
                        expanded ? null : match.id
                      )
                    }
                    className="mt-4 w-full rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    {expanded
                      ? "Hide details"
                      : "View details"}
                  </button>

                  {expanded && (
                    <MatchDetails match={match} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop expanded details */}
          {expandedId && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 lg:px-6">
              {(() => {
                const match = matches.find(
                  (item) => item.id === expandedId
                );

                if (!match) return null;

                return (
                  <MatchDetails match={match} />
                );
              })()}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {matches.length}
              </span>{" "}
              result{matches.length === 1 ? "" : "s"} on
              page{" "}
              <span className="font-medium text-slate-700">
                {page + 1}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasPreviousPage || loading}
                onClick={() =>
                  setPage((current) =>
                    Math.max(0, current - 1)
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={!hasNextPage || loading}
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: QRRuleMatchStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusClasses[status]
      }`}
    >
      <span
        className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />

      {formatStatus(status)}
    </span>
  );
}

function TableHead({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
    >
      {children}
    </th>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function MatchDetails({
  match,
}: {
  match: QRRuleMatch;
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Match details
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Full request context captured for this
            evaluation.
          </p>
        </div>

        <code className="hidden rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500 sm:block">
          {match.id}
        </code>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem
          label="Action"
          value={valueOrDash(match.actionType)}
        />

        <InfoItem
          label="Action value"
          value={valueOrDash(match.actionValue)}
        />

        <InfoItem
          label="Rule version"
          value={
            match.ruleVersion
              ? `v${match.ruleVersion}`
              : "—"
          }
        />

        <InfoItem
          label="Source"
          value={valueOrDash(match.sourceType)}
        />

        <InfoItem
          label="Device"
          value={valueOrDash(match.device)}
        />

        <InfoItem
          label="Operating system"
          value={valueOrDash(
            match.operatingSystem
          )}
        />

        <InfoItem
          label="Browser"
          value={valueOrDash(match.browser)}
        />

        <InfoItem
          label="Language"
          value={valueOrDash(match.language)}
        />

        <InfoItem
          label="Country"
          value={valueOrDash(match.country)}
        />

        <InfoItem
          label="State"
          value={valueOrDash(match.state)}
        />

        <InfoItem
          label="City"
          value={valueOrDash(match.city)}
        />

        <InfoItem
          label="Referrer"
          value={truncate(match.referrer, 42)}
        />

        <InfoItem
          label="UTM source"
          value={valueOrDash(match.utmSource)}
        />

        <InfoItem
          label="UTM medium"
          value={valueOrDash(match.utmMedium)}
        />

        <InfoItem
          label="UTM campaign"
          value={valueOrDash(
            match.utmCampaign
          )}
        />

        <InfoItem
          label="UTM term"
          value={valueOrDash(match.utmTerm)}
        />

        <InfoItem
          label="UTM content"
          value={valueOrDash(
            match.utmContent
          )}
        />

        <InfoItem
          label="Visitor key"
          value={truncate(match.visitorKey, 42)}
        />

        <InfoItem
          label="Matched at"
          value={formatDate(match.matchedAt)}
        />
      </div>
    </div>
  );
}