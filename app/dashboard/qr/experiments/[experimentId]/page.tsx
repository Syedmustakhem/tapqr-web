"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Beaker,
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  completeQRExperiment,
  createQRExperimentVariant,
  getQRExperiment,
  pauseQRExperiment,
  startQRExperiment,
  updateQRExperimentVariant,
  deleteQRExperimentVariant,
  type QRExperiment,
  type QRExperimentVariant,
  type QRExperimentStatus,
} from "@/lib/qr-experiments";
import { QRRuleActionType } from "@/lib/qr-rules";

function rate(participants = 0, conversions = 0) {
  return participants ? (conversions / participants) * 100 : 0;
}

function statusLabel(status: QRExperimentStatus) {
  return status === "RUNNING"
    ? "Running"
    : status === "PAUSED"
      ? "Paused"
      : status === "COMPLETED"
        ? "Completed"
        : status === "ARCHIVED"
          ? "Archived"
          : "Draft";
}

function statusClass(status: QRExperimentStatus) {
  return status === "RUNNING"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : status === "PAUSED"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : status === "COMPLETED"
        ? "bg-blue-50 text-blue-700 ring-blue-200"
        : status === "ARCHIVED"
          ? "bg-slate-100 text-slate-600 ring-slate-200"
          : "bg-violet-50 text-violet-700 ring-violet-200";
}

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function QRExperimentDetailPage() {
  const router = useRouter();
  const params = useParams<{ experimentId: string }>();
  const experimentId = params?.experimentId;

  const [experiment, setExperiment] = useState<QRExperiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!experimentId) return;

    try {
      setLoading(true);
      setError("");
      const response = await getQRExperiment(experimentId);
      setExperiment(response?.data ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load experiment."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [experimentId]);

  async function lifecycle(action: "start" | "pause" | "complete") {
    if (!experiment) return;

    try {
      setActionLoading(true);
      setError("");

      if (action === "start") await startQRExperiment(experiment.id);
      if (action === "pause") await pauseQRExperiment(experiment.id);
      if (action === "complete") await completeQRExperiment(experiment.id);

      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to update experiment."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function removeVariant(variantId: string) {
    if (!experiment) return;
    if (!window.confirm("Delete this variant?")) return;

    try {
      setActionLoading(true);
      await deleteQRExperimentVariant(experiment.id, variantId);
      await load();
    } catch (variantError) {
      setError(
        variantError instanceof Error
          ? variantError.message
          : "Unable to delete variant."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="h-8 w-52 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!experiment) {
    return (
      <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <p className="text-sm font-bold text-red-900">Experiment not found</p>
          <p className="mt-1 text-xs text-red-700">{error || "The requested experiment does not exist."}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/qr/experiments")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to experiments
          </button>
        </div>
      </main>
    );
  }

  const variants = experiment.variants ?? [];
  const bestVariant = useMemo(
    () =>
      [...variants].sort(
        (a, b) =>
          rate(b.participantCount, b.conversionCount) -
          rate(a.participantCount, a.conversionCount)
      )[0],
    [variants]
  );

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/qr/experiments")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Experiments
          </button>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || actionLoading}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Beaker className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950">
                    {experiment.name}
                  </h1>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusClass(experiment.status)}`}>
                    {statusLabel(experiment.status)}
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  {experiment.description || "No experiment description provided."}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-400">
                  <span>QR: {experiment.qrCode?.name || experiment.qrCodeId}</span>
                  <span>•</span>
                  <span>{experiment.allocationType}</span>
                  <span>•</span>
                  <span>{formatDate(experiment.startsAt)} → {formatDate(experiment.endsAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {experiment.status === "DRAFT" || experiment.status === "PAUSED" ? (
                <button
                  type="button"
                  onClick={() => void lifecycle("start")}
                  disabled={actionLoading}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start
                </button>
              ) : null}

              {experiment.status === "RUNNING" ? (
                <>
                  <button
                    type="button"
                    onClick={() => void lifecycle("pause")}
                    disabled={actionLoading}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => void lifecycle("complete")}
                    disabled={actionLoading}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric title="Participants" value={(experiment.participantCount ?? 0).toLocaleString("en-IN")} icon={<Users className="h-5 w-5" />} />
          <Metric title="Conversions" value={(experiment.conversionCount ?? 0).toLocaleString("en-IN")} icon={<TrendingUp className="h-5 w-5" />} />
          <Metric title="Conversion rate" value={`${rate(experiment.participantCount, experiment.conversionCount).toFixed(1)}%`} icon={<Target className="h-5 w-5" />} />
          <Metric title="Variants" value={String(variants.length)} icon={<Activity className="h-5 w-5" />} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-950">Variant performance</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Compare traffic and conversion performance for every variant.
            </p>
          </div>

          {variants.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Beaker className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-900">No variants</p>
              <p className="mt-1 text-xs text-slate-500">Add at least two variants before starting the experiment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {variants.map((variant, index) => {
                const participants = variant.participantCount ?? 0;
                const conversions = variant.conversionCount ?? 0;
                const conversionRate = rate(participants, conversions);
                const allocation = Number(variant.allocation) || 0;
                const isBest = bestVariant?.id === variant.id && participants > 0;

                return (
                  <VariantRow
                    key={variant.id}
                    variant={variant}
                    index={index}
                    participants={participants}
                    conversions={conversions}
                    conversionRate={conversionRate}
                    allocation={allocation}
                    isBest={isBest}
                    disabled={actionLoading || experiment.status === "RUNNING" || experiment.status === "COMPLETED"}
                    onDelete={() => void removeVariant(variant.id)}
                    onReload={() => void load()}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">{title}</p>
    </div>
  );
}

function VariantRow({
  variant,
  index,
  participants,
  conversions,
  conversionRate,
  allocation,
  isBest,
  disabled,
  onDelete,
  onReload,
}: {
  variant: QRExperimentVariant;
  index: number;
  participants: number;
  conversions: number;
  conversionRate: number;
  allocation: number;
  isBest: boolean;
  disabled: boolean;
  onDelete: () => void;
  onReload: () => void;
}) {
  const [name, setName] = useState(variant.name);
  const [actionType, setActionType] = useState(variant.actionType);
  const [actionValue, setActionValue] = useState(variant.actionValue);
  const [allocationValue, setAllocationValue] = useState(String(allocation));
  const [saving, setSaving] = useState(false);

  async function save() {
    try {
      setSaving(true);
      await updateQRExperimentVariant(variant.experimentId, variant.id, {
        name: name.trim(),
        actionType,
        actionValue: actionValue.trim(),
        allocation: Number(allocationValue),
      });
      onReload();
    } catch {
      // Parent page handles the main data state; keep edit controls stable.
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
          {String.fromCharCode(65 + index)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={disabled || saving}
              className="h-9 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-slate-400"
            />
            {isBest ? (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                Leading variant
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <EditField label="Allocation">
              <input
                type="number"
                min={0}
                max={100}
                value={allocationValue}
                onChange={(event) => setAllocationValue(event.target.value)}
                disabled={disabled || saving}
                className="edit-field"
              />
            </EditField>

            <EditField label="Action">
              <select
                value={actionType}
                onChange={(event) => setActionType(event.target.value as QRRuleActionType)}
                disabled={disabled || saving}
                className="edit-field"
              >
                {Object.values(QRRuleActionType).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </EditField>

            <EditField label="Action value">
              <input
                value={actionValue}
                onChange={(event) => setActionValue(event.target.value)}
                disabled={disabled || saving}
                className="edit-field"
              />
            </EditField>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => void save()}
                disabled={disabled || saving}
                className="h-9 w-full rounded-lg bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save variant"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Mini title="Traffic" value={`${allocation}%`} />
            <Mini title="Participants" value={participants.toLocaleString("en-IN")} />
            <Mini title="Conversion" value={`${conversionRate.toFixed(1)}%`} />
          </div>
        </div>

        {!disabled ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg px-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function Mini({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
