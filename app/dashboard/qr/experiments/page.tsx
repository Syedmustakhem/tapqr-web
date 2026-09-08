"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Beaker,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  completeQRExperiment,
  deleteQRExperiment,
  getQRExperiments,
  pauseQRExperiment,
  startQRExperiment,
  type QRExperiment,
  type QRExperimentStatus,
} from "@/lib/qr-experiments";

type QRCodeOption = {
  id: string;
  name?: string;
  shortCode?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function unwrap<T>(response: T | ApiEnvelope<T> | undefined): T | undefined {
  if (!response) return undefined;

  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}

function statusLabel(status: QRExperimentStatus) {
  switch (status) {
    case "RUNNING":
      return "Running";
    case "PAUSED":
      return "Paused";
    case "COMPLETED":
      return "Completed";
    case "ARCHIVED":
      return "Archived";
    default:
      return "Draft";
  }
}

function statusClass(status: QRExperimentStatus) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "PAUSED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "ARCHIVED":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-violet-50 text-violet-700 ring-violet-200";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function conversionRate(experiment: QRExperiment) {
  const participants = experiment.participantCount ?? 0;
  const conversions = experiment.conversionCount ?? 0;

  if (!participants) return 0;
  return (conversions / participants) * 100;
}

export default function QRExperimentsPage() {
  const searchParams = useSearchParams();
  const requestedQrCodeId = searchParams.get("qrCodeId") ?? searchParams.get("qrId");
  const [experiments, setExperiments] = useState<QRExperiment[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeOption[]>([]);
  const [selectedQr, setSelectedQr] = useState(requestedQrCodeId ?? "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | QRExperimentStatus>(
    "ALL"
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  async function loadExperiments(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const response = await getQRExperiments(selectedQr || undefined);
      const data = unwrap<QRExperiment[]>(response);

      setExperiments(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load experiments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /*
   * QR options are intentionally loaded through the existing QR endpoint
   * rather than introducing a new experiment-specific QR API.
   */
  async function loadQrCodes() {
    try {
      const response = await fetch("/api/qr-codes/options", {
        credentials: "include",
      });

      if (!response.ok) return;

      const payload = (await response.json()) as ApiEnvelope<QRCodeOption[]>;
      const data = unwrap<QRCodeOption[]>(payload);

      if (Array.isArray(data)) {
        setQrCodes(data);
        if (requestedQrCodeId && data.some((qr) => qr.id === requestedQrCodeId)) {
          setSelectedQr(requestedQrCodeId);
        }
      }
    } catch {
      // QR filtering remains optional; experiment loading should not fail.
    }
  }

  useEffect(() => {
    void loadQrCodes();
  }, [requestedQrCodeId]);

  useEffect(() => {
    void loadExperiments();
  }, [selectedQr]);

  async function runAction(
    experiment: QRExperiment,
    action: "start" | "pause" | "complete" | "delete"
  ) {
    if (
      action === "delete" &&
      !window.confirm(
        `Archive "${experiment.name}"? This will remove it from the active experiment list.`
      )
    ) {
      return;
    }

    try {
      setActionId(experiment.id);
      setMenuId(null);
      setError("");

      if (action === "start") {
        await startQRExperiment(experiment.id);
      } else if (action === "pause") {
        await pauseQRExperiment(experiment.id);
      } else if (action === "complete") {
        await completeQRExperiment(experiment.id);
      } else {
        await deleteQRExperiment(experiment.id);
      }

      await loadExperiments({ silent: true });
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to complete the requested action."
      );
    } finally {
      setActionId(null);
    }
  }

  const filteredExperiments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return experiments.filter((experiment) => {
      const matchesStatus =
        statusFilter === "ALL" || experiment.status === statusFilter;

      if (!matchesStatus) return false;
      if (!query) return true;

      return (
        experiment.name.toLowerCase().includes(query) ||
        (experiment.description ?? "").toLowerCase().includes(query) ||
        experiment.id.toLowerCase().includes(query)
      );
    });
  }, [experiments, search, statusFilter]);

  const stats = useMemo(() => {
    const total = experiments.length;
    const running = experiments.filter((item) => item.status === "RUNNING").length;
    const drafts = experiments.filter((item) => item.status === "DRAFT").length;
    const participants = experiments.reduce(
      (sum, item) => sum + (item.participantCount ?? 0),
      0
    );
    const conversions = experiments.reduce(
      (sum, item) => sum + (item.conversionCount ?? 0),
      0
    );

    return {
      total,
      running,
      drafts,
      participants,
      conversions,
      rate: participants ? (conversions / participants) * 100 : 0,
    };
  }, [experiments]);

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Beaker className="h-4 w-4" />
              QR Intelligence
              <span className="text-slate-300">/</span>
              Experiments
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              A/B Experiments
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Test different QR experiences, split traffic between variants,
              and measure which experience converts better.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadExperiments({ silent: true })}
              disabled={refreshing || loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <a
              href={
                selectedQr
                  ? `/dashboard/qr/experiments/new?qrId=${encodeURIComponent(selectedQr)}`
                  : "/dashboard/qr/experiments/new"
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New experiment
            </a>
          </div>
        </section>

        {selectedQr ? (
          <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
            <span className="mr-auto text-xs font-semibold text-slate-500">
              Viewing QR <span className="font-bold text-slate-900">{selectedQr.slice(0, 8)}</span>
            </span>
            <a
              href={`/dashboard/qr/studio?qrId=${encodeURIComponent(selectedQr)}`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
            >
              QR Studio
            </a>
            <a
              href={`/dashboard/qr/rules?qrId=${encodeURIComponent(selectedQr)}`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Smart Rules
            </a>
          </section>
        ) : null}

        {error ? (
          <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-red-900">
                Something went wrong
              </p>
              <p className="mt-0.5 text-xs leading-5 text-red-700">{error}</p>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Experiments"
            value={stats.total}
            icon={<Beaker className="h-5 w-5" />}
          />
          <StatCard
            label="Running"
            value={stats.running}
            icon={<Activity className="h-5 w-5" />}
          />
          <StatCard
            label="Drafts"
            value={stats.drafts}
            icon={<Clock3 className="h-5 w-5" />}
          />
          <StatCard
            label="Participants"
            value={stats.participants}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Conversions"
            value={stats.conversions}
            suffix={stats.rate ? `${stats.rate.toFixed(1)}%` : "0%"}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search experiments..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["ALL", "RUNNING", "DRAFT", "PAUSED", "COMPLETED"] as const).map(
                (status) => {
                  const active = statusFilter === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${
                        active
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status === "ALL" ? "All" : statusLabel(status)}
                    </button>
                  );
                }
              )}

              {qrCodes.length > 0 ? (
                <select
                  value={selectedQr}
                  onChange={(event) => setSelectedQr(event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="">All QR codes</option>
                  {qrCodes.map((qr) => (
                    <option key={qr.id} value={qr.id}>
                      {qr.name || qr.shortCode || qr.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Experiments
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {filteredExperiments.length} result
                {filteredExperiments.length === 1 ? "" : "s"}
              </p>
            </div>

            <Target className="h-5 w-5 text-slate-400" />
          </div>

          {loading ? (
            <LoadingRows />
          ) : filteredExperiments.length === 0 ? (
            <EmptyState search={Boolean(search || selectedQr || statusFilter !== "ALL")} />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Experiment
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Variants
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Participants
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Conversion
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Schedule
                      </th>
                      <th className="w-12 px-3 py-3" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredExperiments.map((experiment) => (
                      <ExperimentRow
                        key={experiment.id}
                        experiment={experiment}
                        menuOpen={menuId === experiment.id}
                        actionLoading={actionId === experiment.id}
                        onMenu={() =>
                          setMenuId((current) =>
                            current === experiment.id ? null : experiment.id
                          )
                        }
                        onAction={(action) => void runAction(experiment, action)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredExperiments.map((experiment) => (
                  <ExperimentCard
                    key={experiment.id}
                    experiment={experiment}
                    menuOpen={menuId === experiment.id}
                    actionLoading={actionId === experiment.id}
                    onMenu={() =>
                      setMenuId((current) =>
                        current === experiment.id ? null : experiment.id
                      )
                    }
                    onAction={(action) => void runAction(experiment, action)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
        {suffix ? (
          <span className="text-xs font-bold text-emerald-600">{suffix}</span>
        ) : null}
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
        {value.toLocaleString("en-IN")}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function ExperimentRow({
  experiment,
  menuOpen,
  actionLoading,
  onMenu,
  onAction,
}: {
  experiment: QRExperiment;
  menuOpen: boolean;
  actionLoading: boolean;
  onMenu: () => void;
  onAction: (action: "start" | "pause" | "complete" | "delete") => void;
}) {
  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <a
          href={`/dashboard/qr/experiments/${encodeURIComponent(experiment.id)}`}
          className="block"
        >
          <p className="max-w-[260px] truncate text-sm font-bold text-slate-950 hover:text-slate-700">
            {experiment.name}
          </p>
          <p className="mt-1 max-w-[280px] truncate text-xs text-slate-500">
            {experiment.description || `QR ${experiment.qrCodeId.slice(0, 8)}`}
          </p>
        </a>
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={experiment.status} />
      </td>

      <td className="px-4 py-4">
        <div className="flex -space-x-2">
          {(experiment.variants ?? []).slice(0, 3).map((variant, index) => (
            <div
              key={variant.id}
              title={`${variant.name} — ${variant.allocation}%`}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-700"
            >
              {String.fromCharCode(65 + index)}
            </div>
          ))}
          {(experiment.variants?.length ?? 0) > 3 ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[9px] font-bold text-white">
              +{(experiment.variants?.length ?? 0) - 3}
            </div>
          ) : null}
          {(experiment.variants?.length ?? 0) === 0 ? (
            <span className="text-xs text-slate-400">No variants</span>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
        {(experiment.participantCount ?? 0).toLocaleString("en-IN")}
      </td>

      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {conversionRate(experiment).toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-400">
            {(experiment.conversionCount ?? 0).toLocaleString("en-IN")} conversions
          </p>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="text-xs font-semibold text-slate-600">
          {formatDate(experiment.startsAt)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          → {formatDate(experiment.endsAt)}
        </p>
      </td>

      <td className="relative px-3 py-4">
        <ActionMenu
          open={menuOpen}
          loading={actionLoading}
          status={experiment.status}
          onToggle={onMenu}
          onAction={onAction}
        />
      </td>
    </tr>
  );
}

function ExperimentCard({
  experiment,
  menuOpen,
  actionLoading,
  onMenu,
  onAction,
}: {
  experiment: QRExperiment;
  menuOpen: boolean;
  actionLoading: boolean;
  onMenu: () => void;
  onAction: (action: "start" | "pause" | "complete" | "delete") => void;
}) {
  return (
    <article className="relative p-4">
      <div className="flex items-start justify-between gap-3">
        <a
          href={`/dashboard/qr/experiments/${encodeURIComponent(experiment.id)}`}
          className="min-w-0 flex-1"
        >
          <p className="truncate text-sm font-bold text-slate-950">
            {experiment.name}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {experiment.description || `QR ${experiment.qrCodeId.slice(0, 8)}`}
          </p>
        </a>

        <ActionMenu
          open={menuOpen}
          loading={actionLoading}
          status={experiment.status}
          onToggle={onMenu}
          onAction={onAction}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={experiment.status} />
        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
          {experiment.variants?.length ?? 0} variants
        </span>
        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
          {experiment.allocationType}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniMetric
          label="Participants"
          value={(experiment.participantCount ?? 0).toLocaleString("en-IN")}
        />
        <MiniMetric
          label="Conversions"
          value={(experiment.conversionCount ?? 0).toLocaleString("en-IN")}
        />
        <MiniMetric
          label="Rate"
          value={`${conversionRate(experiment).toFixed(1)}%`}
        />
      </div>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: QRExperimentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusClass(
        status
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}

function ActionMenu({
  open,
  loading,
  status,
  onToggle,
  onAction,
}: {
  open: boolean;
  loading: boolean;
  status: QRExperimentStatus;
  onToggle: () => void;
  onAction: (action: "start" | "pause" | "complete" | "delete") => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Experiment actions"
        onClick={onToggle}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {status === "DRAFT" || status === "PAUSED" ? (
            <MenuButton
              icon={<Play className="h-3.5 w-3.5" />}
              label="Start experiment"
              onClick={() => onAction("start")}
            />
          ) : null}

          {status === "RUNNING" ? (
            <>
              <MenuButton
                icon={<Pause className="h-3.5 w-3.5" />}
                label="Pause experiment"
                onClick={() => onAction("pause")}
              />
              <MenuButton
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                label="Complete experiment"
                onClick={() => onAction("complete")}
              />
            </>
          ) : null}

          {status !== "COMPLETED" && status !== "ARCHIVED" ? (
            <MenuButton
              destructive
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label="Archive experiment"
              onClick={() => onAction("delete")}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-5 py-5"
        >
          <div className="h-10 w-52 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search }: { search: boolean }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Beaker className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-950">
        {search ? "No experiments found" : "No experiments yet"}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
        {search
          ? "Try changing the search text or filters."
          : "Create an experiment to compare different QR experiences and measure conversion performance."}
      </p>

      {!search ? (
        <a
          href="/dashboard/qr/experiments/new"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create experiment
        </a>
      ) : null}
    </div>
  );
}
