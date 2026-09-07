"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Beaker, Check, Plus, Trash2 } from "lucide-react";

import {
  createQRExperiment,
  createQRExperimentVariant,
  QRExperimentAllocationType,
  type CreateQRExperimentVariantInput,
} from "@/lib/qr-experiments";
import { apiRequest } from "@/lib/api";
import { QRRuleActionType } from "@/lib/qr-rules";

type QRCodeRecord = {
  id: string;
  name: string;
  shortCode?: string | null;
  businessId?: string | null;
};

type QRCodesResponse = {
  success?: boolean;
  data?: QRCodeRecord[] | { qrcodes?: QRCodeRecord[]; qrCodes?: QRCodeRecord[] };
};

type VariantDraft = CreateQRExperimentVariantInput;

function extractQRCodes(response: QRCodesResponse): QRCodeRecord[] {
  if (Array.isArray(response.data)) return response.data;
  return response.data?.qrcodes ?? response.data?.qrCodes ?? [];
}

const ACTIONS = [
  { value: QRRuleActionType.EXPERIENCE, label: "Business experience" },
  { value: QRRuleActionType.CATALOG, label: "Catalog" },
  { value: QRRuleActionType.MENU, label: "Menu" },
  { value: QRRuleActionType.SERVICES, label: "Services" },
  { value: QRRuleActionType.PRODUCTS, label: "Products" },
  { value: QRRuleActionType.CONTACT, label: "Contact" },
  { value: QRRuleActionType.REDIRECT, label: "Redirect" },
  { value: QRRuleActionType.CAMPAIGN, label: "Campaign" },
  { value: QRRuleActionType.CUSTOM, label: "Custom" },
] as const;

export default function NewQRExperimentPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [qrCodes, setQRCodes] = useState<QRCodeRecord[]>([]);
  const [qrCodeId, setQrCodeId] = useState(params.get("qrId") ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allocationType, setAllocationType] =
    useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([
    {
      name: "Variant A",
      allocation: 50,
      actionType: QRRuleActionType.EXPERIENCE,
      actionValue: "",
    },
    {
      name: "Variant B",
      allocation: 50,
      actionType: QRRuleActionType.EXPERIENCE,
      actionValue: "",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await apiRequest<QRCodesResponse>("/qrcodes");
        if (mounted) setQRCodes(extractQRCodes(response));
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load QR codes."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const allocationTotal = useMemo(
    () => variants.reduce((sum, item) => sum + Number(item.allocation || 0), 0),
    [variants]
  );

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, ...patch } : variant
      )
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        name: `Variant ${String.fromCharCode(65 + current.length)}`,
        allocation: 0,
        actionType: QRRuleActionType.EXPERIENCE,
        actionValue: "",
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 2) return;
    setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!qrCodeId) {
      setError("Select a QR code.");
      return;
    }

    if (!name.trim()) {
      setError("Enter an experiment name.");
      return;
    }

    if (variants.length < 2) {
      setError("An experiment requires at least two variants.");
      return;
    }

    if (variants.some((variant) => !variant.name.trim())) {
      setError("Every variant needs a name.");
      return;
    }

    if (variants.some((variant) => Number(variant.allocation) < 0)) {
      setError("Variant allocation cannot be negative.");
      return;
    }

    if (allocationType === QRExperimentAllocationType.PERCENTAGE && allocationTotal !== 100) {
      setError(`Variant allocation must total 100%. Current total: ${allocationTotal}%.`);
      return;
    }

    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
      setError("End time cannot be before start time.");
      return;
    }

    try {
      setSaving(true);

      const created = await createQRExperiment({
        qrCodeId,
        name: name.trim(),
        description: description.trim() || null,
        allocationType,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      });

      const experiment = created?.data;

      if (!experiment?.id) {
        throw new Error("Experiment was created without an ID.");
      }

      for (const variant of variants) {
        await createQRExperimentVariant(experiment.id, {
          name: variant.name.trim(),
          allocation: Number(variant.allocation),
          actionType: variant.actionType,
          actionValue: variant.actionValue.trim(),
        });
      }

      router.replace(`/dashboard/qr/experiments/${encodeURIComponent(experiment.id)}`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to create experiment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Beaker className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Create A/B Experiment
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Define the audience QR, traffic allocation, and experiences you want to compare.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionTitle number="01" title="Experiment details" />

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="QR code">
                <select
                  value={qrCodeId}
                  onChange={(event) => setQrCodeId(event.target.value)}
                  disabled={loading || saving}
                  className="field"
                >
                  <option value="">Select a QR code</option>
                  {qrCodes.map((qr) => (
                    <option key={qr.id} value={qr.id}>
                      {qr.name} {qr.shortCode ? `(${qr.shortCode})` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Experiment name">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Menu vs Business Experience"
                  disabled={saving}
                  className="field"
                />
              </Field>

              <Field label="Description" className="md:col-span-2">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What are you trying to learn?"
                  rows={3}
                  disabled={saving}
                  className="field min-h-24 py-3"
                />
              </Field>

              <Field label="Start">
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  disabled={saving}
                  className="field"
                />
              </Field>

              <Field label="End">
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  disabled={saving}
                  className="field"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionTitle number="02" title="Traffic allocation" />

            <div className="flex flex-wrap gap-2">
              {(["PERCENTAGE", "FIXED"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAllocationType(type)}
                  disabled={saving}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    allocationType === type
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type === "PERCENTAGE" ? "Percentage split" : "Fixed allocation"}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Allocation total
              </span>
              <span
                className={`text-sm font-bold ${
                  allocationType === "PERCENTAGE" && allocationTotal !== 100
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {allocationTotal}%
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <SectionTitle number="03" title="Variants" />
              <button
                type="button"
                onClick={addVariant}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" />
                Add variant
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-950">
                      Variant {String.fromCharCode(65 + index)}
                    </p>

                    {variants.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove variant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Variant name">
                      <input
                        value={variant.name}
                        onChange={(event) =>
                          updateVariant(index, { name: event.target.value })
                        }
                        disabled={saving}
                        className="field"
                      />
                    </Field>

                    <Field label="Allocation (%)">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={variant.allocation}
                        onChange={(event) =>
                          updateVariant(index, {
                            allocation: Number(event.target.value),
                          })
                        }
                        disabled={saving}
                        className="field"
                      />
                    </Field>

                    <Field label="Action">
                      <select
                        value={variant.actionType}
                        onChange={(event) =>
                          updateVariant(index, {
                            actionType: event.target.value as VariantDraft["actionType"],
                          })
                        }
                        disabled={saving}
                        className="field"
                      >
                        {ACTIONS.map((action) => (
                          <option key={action.value} value={action.value}>
                            {action.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Action value">
                      <input
                        value={variant.actionValue}
                        onChange={(event) =>
                          updateVariant(index, {
                            actionValue: event.target.value,
                          })
                        }
                        placeholder="Experience/catalog ID, URL, or action value"
                        disabled={saving}
                        className="field"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : <><Check className="h-4 w-4" /> Create experiment</>}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="text-[10px] font-black tracking-[0.16em] text-slate-400">
        {number}
      </span>
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}
