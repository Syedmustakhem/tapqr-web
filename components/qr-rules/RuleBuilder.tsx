"use client";

import React, { useMemo } from "react";

import {
  QRRuleAction,
  QRRuleActionType,
  QRRuleCondition,
  QRRuleConditionGroup,
  QRRuleConditionType,
  QRRuleLogic,
  QRRuleOperator,
  QRRuleStatus,
} from "@/lib/qr-rules";

import ConditionGroup from "./ConditionGroup";
import ActionBuilder from "./ActionBuilder";

interface BusinessOption {
  id: string;
  name: string;
}

interface QRCodeOption {
  id: string;
  name: string;
  shortCode?: string | null;
}

export interface RuleBuilderValue {
  name: string;
  description: string;
  businessId: string;
  qrCodeId: string;
  priority: number;
  logic: QRRuleLogic;
  conditions: QRRuleCondition[];
  groups: QRRuleConditionGroup[];
  action: QRRuleAction;
  fallbackActionType?: QRRuleActionType | null;
  fallbackActionValue?: string;
  startsAt?: string;
  endsAt?: string;
  experimentId?: string;
  status: QRRuleStatus;
}

interface RuleBuilderProps {
  value: RuleBuilderValue;
  businesses: BusinessOption[];
  qrCodes: QRCodeOption[];
  onChange: (
    value: RuleBuilderValue
  ) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  disabled?: boolean;
  error?: string | null;
}

/* ============================================================
   DEFAULTS
   ============================================================ */

function createCondition(): QRRuleCondition {
  return {
    type: QRRuleConditionType.DEVICE,
    operator: QRRuleOperator.EQUALS,
    value: "",
    sortOrder: 0,
  };
}

function createGroup(): QRRuleConditionGroup {
  return {
    logic: QRRuleLogic.AND,
    conditions: [createCondition()],
    children: [],
    sortOrder: 0,
  };
}

function createAction(): QRRuleAction {
  return {
    type: QRRuleActionType.EXPERIENCE,
    value: "",
  };
}

/* ============================================================
   HELPERS
   ============================================================ */

function getActionLabel(
  type?: QRRuleActionType | null
) {
  if (!type) {
    return "None";
  }

  switch (type) {
    case QRRuleActionType.EXPERIENCE:
      return "Experience";

    case QRRuleActionType.REDIRECT:
      return "Redirect";

    case QRRuleActionType.CATALOG:
      return "Catalog";

    case QRRuleActionType.MENU:
      return "Menu";

    case QRRuleActionType.SERVICES:
      return "Services";

    case QRRuleActionType.PRODUCTS:
      return "Products";

    case QRRuleActionType.CONTACT:
      return "Contact";

    case QRRuleActionType.CAMPAIGN:
      return "Campaign";

    case QRRuleActionType.CUSTOM:
      return "Custom";

    default:
      return type;
  }
}

function getStatusLabel(
  status: QRRuleStatus
) {
  switch (status) {
    case QRRuleStatus.DRAFT:
      return "Draft";

    case QRRuleStatus.ACTIVE:
      return "Active";

    case QRRuleStatus.PAUSED:
      return "Paused";

    case QRRuleStatus.EXPIRED:
      return "Expired";

    case QRRuleStatus.ARCHIVED:
      return "Archived";

    default:
      return status;
  }
}

function getStatusClass(
  status: QRRuleStatus
) {
  switch (status) {
    case QRRuleStatus.ACTIVE:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case QRRuleStatus.PAUSED:
      return "bg-amber-50 text-amber-700 border-amber-200";

    case QRRuleStatus.EXPIRED:
      return "bg-orange-50 text-orange-700 border-orange-200";

    case QRRuleStatus.ARCHIVED:
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function formatDateTime(
  value?: string
) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function RuleBuilder({
  value,
  businesses,
  qrCodes,
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Save Rule",
  disabled = false,
  error,
}: RuleBuilderProps) {
  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) =>
          business.id === value.businessId
      ),
    [businesses, value.businessId]
  );

  const selectedQR = useMemo(
    () =>
      qrCodes.find(
        (qr) => qr.id === value.qrCodeId
      ),
    [qrCodes, value.qrCodeId]
  );

  const update = (
    changes: Partial<RuleBuilderValue>
  ) => {
    onChange({
      ...value,
      ...changes,
    });
  };

  /* ==========================================================
     GROUP MANAGEMENT
     ========================================================== */

  const updateGroup = (
    index: number,
    group: QRRuleConditionGroup
  ) => {
    const nextGroups = [
      ...value.groups,
    ];

    nextGroups[index] = {
      ...group,
      sortOrder: index,
    };

    update({
      groups: nextGroups,
    });
  };

  const removeGroup = (
    index: number
  ) => {
    update({
      groups: value.groups
        .filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
        .map((group, itemIndex) => ({
          ...group,
          sortOrder: itemIndex,
        })),
    });
  };

  const addGroup = () => {
    update({
      groups: [
        ...value.groups,
        {
          ...createGroup(),
          sortOrder:
            value.groups.length,
        },
      ],
    });
  };

  /* ==========================================================
     ROOT CONDITION MANAGEMENT
     ========================================================== */

  const updateRootCondition = (
    index: number,
    condition: QRRuleCondition
  ) => {
    const nextConditions = [
      ...value.conditions,
    ];

    nextConditions[index] = {
      ...condition,
      sortOrder: index,
    };

    update({
      conditions: nextConditions,
    });
  };

  const removeRootCondition = (
    index: number
  ) => {
    update({
      conditions: value.conditions
        .filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
        .map((condition, itemIndex) => ({
          ...condition,
          sortOrder: itemIndex,
        })),
    });
  };

  const addRootCondition = () => {
    update({
      conditions: [
        ...value.conditions,
        {
          ...createCondition(),
          sortOrder:
            value.conditions.length,
        },
      ],
    });
  };

  /* ==========================================================
     ACTION
     ========================================================== */

  const handleActionChange = (
    action: QRRuleAction
  ) => {
    update({
      action,
    });
  };

  /* ==========================================================
     FALLBACK
     ========================================================== */

  const handleFallbackTypeChange = (
    type: QRRuleActionType | ""
  ) => {
    update({
      fallbackActionType:
        type === ""
          ? null
          : type,
      fallbackActionValue:
        type === ""
          ? ""
          : value.fallbackActionValue,
    });
  };

  /* ==========================================================
     VALIDATION
     ========================================================== */

  const validationMessage =
    !value.name.trim()
      ? "Rule name is required."
      : !value.businessId
        ? "Business is required."
        : !value.qrCodeId
          ? "QR Code is required."
          : !value.action.type
            ? "Action type is required."
            : !value.action.value?.trim()
              ? "Action value is required."
              : null;

  const canSubmit =
    !disabled &&
    !submitting &&
    !validationMessage;

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="space-y-6">
      {/* ======================================================
          PAGE HEADER
         ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Rule Builder
            </h1>

            <span
              className={[
                "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                getStatusClass(
                  value.status
                ),
              ].join(" ")}
            >
              {getStatusLabel(
                value.status
              )}
            </span>
          </div>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Create routing logic that
            dynamically controls what
            visitors see when they scan
            this QR code.
          </p>
        </div>
      </div>

      {/* ======================================================
          ERROR
         ====================================================== */}

      {(error || validationMessage) && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="mt-0.5 h-5 w-5 shrink-0"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
            />

            <path
              d="M12 8v4M12 16h.01"
              strokeLinecap="round"
            />
          </svg>

          <p>
            {error ??
              validationMessage}
          </p>
        </div>
      )}

      {/* ======================================================
          BASIC DETAILS
         ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h10"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Basic details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Identify the rule and
                choose which QR code it
                controls.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* Rule name */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rule name
            </label>

            <input
              type="text"
              value={value.name}
              disabled={disabled}
              maxLength={120}
              placeholder="Example: Mobile visitors"
              onChange={(event) =>
                update({
                  name: event.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* Description */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </label>

            <textarea
              value={value.description}
              disabled={disabled}
              rows={3}
              maxLength={1000}
              placeholder="Describe what this rule is intended to do."
              onChange={(event) =>
                update({
                  description:
                    event.target.value,
                })
              }
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* Business */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Business
            </label>

            <select
              value={value.businessId}
              disabled={
                disabled ||
                businesses.length === 0
              }
              onChange={(event) =>
                update({
                  businessId:
                    event.target.value,
                  qrCodeId: "",
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                Select business
              </option>

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

          {/* QR Code */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              QR Code
            </label>

            <select
              value={value.qrCodeId}
              disabled={
                disabled ||
                qrCodes.length === 0
              }
              onChange={(event) =>
                update({
                  qrCodeId:
                    event.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                Select QR code
              </option>

              {qrCodes.map((qr) => (
                <option
                  key={qr.id}
                  value={qr.id}
                >
                  {qr.name}
                  {qr.shortCode
                    ? ` (${qr.shortCode})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Priority
            </label>

            <input
              type="number"
              value={value.priority}
              disabled={disabled}
              onChange={(event) =>
                update({
                  priority:
                    Number(
                      event.target.value
                    ) || 0,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Higher priority rules are
              evaluated first.
            </p>
          </div>

          {/* Logic */}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Root logic
            </label>

            <div className="flex h-11 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({
                    logic:
                      QRRuleLogic.AND,
                  })
                }
                className={[
                  "flex-1 rounded-lg text-xs font-semibold transition",
                  value.logic ===
                  QRRuleLogic.AND
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                AND
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  update({
                    logic:
                      QRRuleLogic.OR,
                  })
                }
                className={[
                  "flex-1 rounded-lg text-xs font-semibold transition",
                  value.logic ===
                  QRRuleLogic.OR
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                OR
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          TARGET SUMMARY
         ====================================================== */}

      {(selectedBusiness ||
        selectedQR) && (
        <div className="grid gap-3 md:grid-cols-2">
          {selectedBusiness && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Business
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {selectedBusiness.name}
              </p>
            </div>
          )}

          {selectedQR && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                QR Code
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {selectedQR.name}
              </p>

              {selectedQR.shortCode && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {selectedQR.shortCode}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          CONDITIONS
         ====================================================== */}

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                1
              </span>

              <h2 className="text-base font-bold text-slate-950">
                When should this rule
                match?
              </h2>
            </div>

            <p className="mt-1 pl-9 text-xs text-slate-500">
              Define the visitor,
              location, time, QR source,
              campaign, or other
              conditions.
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={addGroup}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
              />
            </svg>

            Add condition group
          </button>
        </div>

        <div className="space-y-4">
          {/* Root conditions */}

          {value.conditions.length >
            0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Root conditions
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Connected with{" "}
                    <span className="font-bold">
                      {value.logic}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={
                    addRootCondition
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      strokeLinecap="round"
                    />
                  </svg>

                  Add
                </button>
              </div>

              <div className="space-y-3">
                {value.conditions.map(
                  (
                    condition,
                    index
                  ) => (
                    <React.Fragment
                      key={
                        condition.id ??
                        `root-${index}`
                      }
                    >
                      <div className="rounded-2xl border border-slate-200 bg-white">
                        <ConditionGroup
                          group={{
                            logic:
                              QRRuleLogic.AND,
                            conditions: [
                              condition,
                            ],
                            children: [],
                            sortOrder:
                              index,
                          }}
                          disabled={
                            disabled
                          }
                          onChange={(
                            group
                          ) => {
                            const next =
                              group
                                .conditions?.[0];

                            if (next) {
                              updateRootCondition(
                                index,
                                next
                              );
                            }
                          }}
                        />
                      </div>

                      {index <
                        value.conditions
                          .length -
                          1 && (
                        <div className="flex justify-center">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {value.logic}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
          )}

          {/* Nested groups */}

          {value.groups.map(
            (group, index) => (
              <ConditionGroup
                key={
                  group.id ??
                  `condition-group-${index}`
                }
                group={group}
                depth={0}
                disabled={disabled}
                onChange={(
                  nextGroup
                ) =>
                  updateGroup(
                    index,
                    nextGroup
                  )
                }
                onRemove={() =>
                  removeGroup(index)
                }
              />
            )
          )}

          {/* Empty state */}

          {value.conditions.length ===
            0 &&
            value.groups.length ===
              0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  No conditions configured
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Add a condition or
                  condition group to control
                  when this rule matches.
                </p>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={addGroup}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      strokeLinecap="round"
                    />
                  </svg>

                  Add first condition
                </button>
              </div>
            )}
        </div>
      </section>

      {/* ======================================================
          ACTION
         ====================================================== */}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">
            2
          </span>

          <div>
            <h2 className="text-base font-bold text-slate-950">
              What should happen?
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Choose the experience or
              destination for matching
              visitors.
            </p>
          </div>
        </div>

        <ActionBuilder
          action={value.action}
          disabled={disabled}
          onChange={
            handleActionChange
          }
        />
      </section>

      {/* ======================================================
          FALLBACK
         ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M12 3v18"
                  strokeLinecap="round"
                />

                <path
                  d="m7 8 5-5 5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="m17 16-5 5-5-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Fallback action
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Optional action used when
                this rule cannot produce its
                primary result.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fallback type
            </label>

            <select
              value={
                value.fallbackActionType ??
                ""
              }
              disabled={disabled}
              onChange={(event) =>
                handleFallbackTypeChange(
                  event.target
                    .value as
                    | QRRuleActionType
                    | ""
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                No fallback
              </option>

              {Object.values(
                QRRuleActionType
              ).map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {getActionLabel(
                    type
                  )}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fallback value
            </label>

            <input
              type="text"
              value={
                value.fallbackActionValue ??
                ""
              }
              disabled={
                disabled ||
                !value.fallbackActionType
              }
              placeholder="Fallback action value"
              onChange={(event) =>
                update({
                  fallbackActionValue:
                    event.target.value,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          SCHEDULE
         ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path
                  d="M12 7v5l3 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Schedule
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Optionally limit when this
                rule is eligible to run.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Starts at
            </label>

            <input
              type="datetime-local"
              value={
                value.startsAt ?? ""
              }
              disabled={disabled}
              onChange={(event) =>
                update({
                  startsAt:
                    event.target.value ||
                    undefined,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              {formatDateTime(
                value.startsAt
              )}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ends at
            </label>

            <input
              type="datetime-local"
              value={
                value.endsAt ?? ""
              }
              disabled={disabled}
              onChange={(event) =>
                update({
                  endsAt:
                    event.target.value ||
                    undefined,
                })
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              {formatDateTime(
                value.endsAt
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          SUMMARY
         ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Rule summary
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Review the configuration before
            saving.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-b-2xl bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Conditions
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {value.conditions
                .length +
                value.groups.length}
            </p>
          </div>

          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Logic
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {value.logic}
            </p>
          </div>

          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Priority
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {value.priority}
            </p>
          </div>

          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Action
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-900">
              {getActionLabel(
                value.action.type
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          ACTION BAR
         ====================================================== */}

      <div className="sticky bottom-4 z-20">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="px-2">
            <p className="text-xs font-semibold text-slate-700">
              {value.name.trim() ||
                "Untitled rule"}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {selectedQR?.name ??
                "No QR code selected"}
            </p>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                disabled={submitting}
                onClick={onCancel}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={onSubmit}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 12h14"
                      strokeLinecap="round"
                    />

                    <path
                      d="m13 6 6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   OPTIONAL FACTORY
   ============================================================ */

export function createDefaultRuleBuilderValue(
  overrides?: Partial<RuleBuilderValue>
): RuleBuilderValue {
  return {
    name: "",
    description: "",
    businessId: "",
    qrCodeId: "",
    priority: 0,
    logic: QRRuleLogic.AND,
    conditions: [],
    groups: [createGroup()],
    action: createAction(),
    fallbackActionType: null,
    fallbackActionValue: "",
    startsAt: undefined,
    endsAt: undefined,
    experimentId: undefined,
    status: QRRuleStatus.DRAFT,
    ...overrides,
  };
}