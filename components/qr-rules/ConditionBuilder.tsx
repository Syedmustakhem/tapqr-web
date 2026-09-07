"use client";

import {
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";

import type {
  QRRuleCondition,
  QRRuleConditionType,
  QRRuleLogic,
  QRRuleOperator,
} from "@/lib/qr-rules";

/* ============================================================
   PROPS
============================================================ */

type ConditionBuilderProps = {
  conditions: QRRuleCondition[];

  logic: QRRuleLogic;

  onChange: (
    conditions: QRRuleCondition[]
  ) => void;

  onLogicChange: (
    logic: QRRuleLogic
  ) => void;
};

/* ============================================================
   CONDITION TYPES
============================================================ */

const CONDITION_TYPES: {
  value: QRRuleConditionType;
  label: string;
  description: string;
}[] = [
  {
    value: "TIME",
    label: "Time",
    description:
      "Match a specific time or time range.",
  },
  {
    value: "DATE",
    label: "Date",
    description:
      "Match a specific date.",
  },
  {
    value: "DAY_OF_WEEK",
    label: "Day of week",
    description:
      "Match Monday, Tuesday, etc.",
  },
  {
    value: "BUSINESS_HOURS",
    label: "Business hours",
    description:
      "Match whether the business is open.",
  },
  {
    value: "DEVICE",
    label: "Device",
    description:
      "Mobile, tablet or desktop.",
  },
  {
    value: "OPERATING_SYSTEM",
    label: "Operating system",
    description:
      "Android, iOS, Windows, macOS, etc.",
  },
  {
    value: "BROWSER",
    label: "Browser",
    description:
      "Chrome, Safari, Firefox, etc.",
  },
  {
    value: "LANGUAGE",
    label: "Language",
    description:
      "Visitor browser language.",
  },
  {
    value: "COUNTRY",
    label: "Country",
    description:
      "Visitor country.",
  },
  {
    value: "STATE",
    label: "State",
    description:
      "Visitor state or region.",
  },
  {
    value: "CITY",
    label: "City",
    description:
      "Visitor city.",
  },
  {
    value: "GEO_RADIUS",
    label: "Geographic radius",
    description:
      "Match visitors inside a geographic radius.",
  },
  {
    value: "REFERRER",
    label: "Referrer",
    description:
      "Where the visitor came from.",
  },
  {
    value: "UTM_SOURCE",
    label: "UTM source",
    description:
      "Campaign source.",
  },
  {
    value: "UTM_MEDIUM",
    label: "UTM medium",
    description:
      "Campaign medium.",
  },
  {
    value: "UTM_CAMPAIGN",
    label: "UTM campaign",
    description:
      "Campaign name.",
  },
  {
    value: "UTM_TERM",
    label: "UTM term",
    description:
      "Campaign keyword.",
  },
  {
    value: "UTM_CONTENT",
    label: "UTM content",
    description:
      "Campaign content.",
  },
  {
    value: "QR_SOURCE",
    label: "QR source",
    description:
      "Table, poster, packaging, etc.",
  },
  {
    value: "QR_PLACEMENT",
    label: "QR placement",
    description:
      "Specific QR placement.",
  },
  {
    value: "QR_LOCATION",
    label: "QR location",
    description:
      "Location assigned to the QR.",
  },
  {
    value: "CAMPAIGN",
    label: "Campaign",
    description:
      "QR campaign.",
  },
  {
    value: "SCAN_COUNT",
    label: "Scan count",
    description:
      "Number of scans.",
  },
  {
    value: "VISITOR_TYPE",
    label: "Visitor type",
    description:
      "New or returning visitor.",
  },
  {
    value: "CUSTOMER_STATE",
    label: "Customer state",
    description:
      "Customer lifecycle state.",
  },
  {
    value: "CUSTOMER_SEGMENT",
    label: "Customer segment",
    description:
      "Customer segment.",
  },
  {
    value: "AUTHENTICATION_STATE",
    label: "Authentication",
    description:
      "Authenticated or anonymous.",
  },
  {
    value: "BUSINESS_STATE",
    label: "Business state",
    description:
      "Business status.",
  },
  {
    value: "CATALOG_STATE",
    label: "Catalog state",
    description:
      "Catalog status.",
  },
  {
    value: "PRODUCT_AVAILABILITY",
    label: "Product availability",
    description:
      "Whether products are available.",
  },
  {
    value: "SUBSCRIPTION_PLAN",
    label: "Subscription plan",
    description:
      "Current TapQR subscription.",
  },
  {
    value: "CUSTOM",
    label: "Custom",
    description:
      "Custom application-defined condition.",
  },
];

/* ============================================================
   OPERATORS
============================================================ */

const OPERATORS: {
  value: QRRuleOperator;
  label: string;
}[] = [
  {
    value: "EQUALS",
    label: "Equals",
  },
  {
    value: "NOT_EQUALS",
    label: "Does not equal",
  },
  {
    value: "GREATER_THAN",
    label: "Greater than",
  },
  {
    value: "GREATER_THAN_OR_EQUAL",
    label: "Greater than or equal",
  },
  {
    value: "LESS_THAN",
    label: "Less than",
  },
  {
    value: "LESS_THAN_OR_EQUAL",
    label: "Less than or equal",
  },
  {
    value: "IN",
    label: "Is one of",
  },
  {
    value: "NOT_IN",
    label: "Is not one of",
  },
  {
    value: "BETWEEN",
    label: "Between",
  },
  {
    value: "NOT_BETWEEN",
    label: "Not between",
  },
  {
    value: "CONTAINS",
    label: "Contains",
  },
  {
    value: "NOT_CONTAINS",
    label: "Does not contain",
  },
  {
    value: "STARTS_WITH",
    label: "Starts with",
  },
  {
    value: "ENDS_WITH",
    label: "Ends with",
  },
  {
    value: "EXISTS",
    label: "Exists",
  },
  {
    value: "NOT_EXISTS",
    label: "Does not exist",
  },
];

/* ============================================================
   DEFAULT CONDITION
============================================================ */

function createCondition(): QRRuleCondition {
  return {
    type: "DEVICE",
    operator: "EQUALS",
    value: "MOBILE",
  };
}

/* ============================================================
   VALUE HELPERS
============================================================ */

function defaultValue(
  type: QRRuleConditionType
): unknown {
  switch (type) {
    case "DEVICE":
      return "MOBILE";

    case "OPERATING_SYSTEM":
      return "ANDROID";

    case "BROWSER":
      return "CHROME";

    case "DAY_OF_WEEK":
      return "MONDAY";

    case "BUSINESS_HOURS":
      return true;

    case "AUTHENTICATION_STATE":
      return "AUTHENTICATED";

    case "VISITOR_TYPE":
      return "NEW";

    default:
      return "";
  }
}

function isBooleanCondition(
  type: QRRuleConditionType
) {
  return (
    type ===
      "BUSINESS_HOURS" ||
    type ===
      "AUTHENTICATION_STATE"
  );
}

function getPresetOptions(
  type: QRRuleConditionType
): string[] | null {
  switch (type) {
    case "DEVICE":
      return [
        "MOBILE",
        "TABLET",
        "DESKTOP",
      ];

    case "OPERATING_SYSTEM":
      return [
        "ANDROID",
        "IOS",
        "WINDOWS",
        "MACOS",
        "LINUX",
        "OTHER",
      ];

    case "BROWSER":
      return [
        "CHROME",
        "SAFARI",
        "FIREFOX",
        "EDGE",
        "OPERA",
        "OTHER",
      ];

    case "DAY_OF_WEEK":
      return [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ];

    case "QR_SOURCE":
      return [
        "TABLE",
        "COUNTER",
        "TAKEAWAY",
        "PACKAGING",
        "POSTER",
        "FLYER",
        "BUSINESS_CARD",
        "RECEIPT",
        "WEBSITE",
        "SOCIAL_MEDIA",
        "ADVERTISEMENT",
        "EVENT",
        "OTHER",
      ];

    case "VISITOR_TYPE":
      return [
        "NEW",
        "RETURNING",
      ];

    case "AUTHENTICATION_STATE":
      return [
        "AUTHENTICATED",
        "ANONYMOUS",
      ];

    default:
      return null;
  }
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ConditionBuilder({
  conditions,
  logic,
  onChange,
  onLogicChange,
}: ConditionBuilderProps) {
  function updateCondition(
    index: number,
    patch: Partial<QRRuleCondition>
  ) {
    onChange(
      conditions.map(
        (condition, currentIndex) =>
          currentIndex === index
            ? {
                ...condition,
                ...patch,
              }
            : condition
      )
    );
  }

  function changeType(
    index: number,
    type: QRRuleConditionType
  ) {
    updateCondition(
      index,
      {
        type,
        operator:
          type === "BUSINESS_HOURS" ||
          type ===
            "AUTHENTICATION_STATE"
            ? "EQUALS"
            : "EQUALS",
        value:
          defaultValue(type),
        value2: undefined,
      }
    );
  }

  function removeCondition(
    index: number
  ) {
    onChange(
      conditions.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );
  }

  function addCondition() {
    onChange([
      ...conditions,
      createCondition(),
    ]);
  }

  return (
    <div className="space-y-5">
      {/* ======================================================
          LOGIC
      ====================================================== */}

      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-950">
            Conditions
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700/70">
            Choose whether all conditions
            or any condition must match.
          </p>
        </div>

        <div className="flex rounded-xl border border-blue-100 bg-white p-1">
          <button
            type="button"
            onClick={() =>
              onLogicChange("AND")
            }
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              logic === "AND"
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            ALL · AND
          </button>

          <button
            type="button"
            onClick={() =>
              onLogicChange("OR")
            }
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              logic === "OR"
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            ANY · OR
          </button>
        </div>
      </div>

      {/* ======================================================
          CONDITIONS
      ====================================================== */}

      {conditions.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-bold text-slate-700">
            No conditions added
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Add a condition to control
            when this rule matches.
          </p>

          <button
            type="button"
            onClick={addCondition}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add condition
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map(
            (
              condition,
              index
            ) => {
              const presetOptions =
                getPresetOptions(
                  condition.type
                );

              const booleanCondition =
                isBooleanCondition(
                  condition.type
                );

              return (
                <div
                  key={
                    condition.id ??
                    `condition-${index}`
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Condition{" "}
                        {index + 1}
                      </span>

                      <p className="mt-1 text-xs text-slate-400">
                        Define when this
                        rule should match.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeCondition(
                          index
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove condition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {/* TYPE */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Field
                      </label>

                      <div className="relative">
                        <select
                          value={
                            condition.type
                          }
                          onChange={(
                            event
                          ) =>
                            changeType(
                              index,
                              event
                                .target
                                .value as QRRuleConditionType
                            )
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
                        >
                          {CONDITION_TYPES.map(
                            (
                              item
                            ) => (
                              <option
                                key={
                                  item.value
                                }
                                value={
                                  item.value
                                }
                              >
                                {
                                  item.label
                                }
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    {/* OPERATOR */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Operator
                      </label>

                      <div className="relative">
                        <select
                          value={
                            condition.operator
                          }
                          onChange={(
                            event
                          ) =>
                            updateCondition(
                              index,
                              {
                                operator:
                                  event
                                    .target
                                    .value as QRRuleOperator,
                              }
                            )
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
                        >
                          {OPERATORS.map(
                            (
                              operator
                            ) => (
                              <option
                                key={
                                  operator.value
                                }
                                value={
                                  operator.value
                                }
                              >
                                {
                                  operator.label
                                }
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    {/* VALUE */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Value
                      </label>

                      {booleanCondition ? (
                        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateCondition(
                                index,
                                {
                                  value:
                                    true,
                                }
                              )
                            }
                            className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-bold ${
                              condition.value ===
                              true
                                ? "bg-slate-950 text-white"
                                : "text-slate-500"
                            }`}
                          >
                            Yes
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateCondition(
                                index,
                                {
                                  value:
                                    false,
                                }
                              )
                            }
                            className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-bold ${
                              condition.value ===
                              false
                                ? "bg-slate-950 text-white"
                                : "text-slate-500"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      ) : presetOptions ? (
                        <div className="relative">
                          <select
                            value={
                              String(
                                condition.value ??
                                  ""
                              )
                            }
                            onChange={(
                              event
                            ) =>
                              updateCondition(
                                index,
                                {
                                  value:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
                          >
                            {presetOptions.map(
                              (
                                option
                              ) => (
                                <option
                                  key={
                                    option
                                  }
                                  value={
                                    option
                                  }
                                >
                                  {option
                                    .replace(
                                      /_/g,
                                      " "
                                    )
                                    .replace(
                                      /\b\w/g,
                                      (
                                        char
                                      ) =>
                                        char.toUpperCase()
                                    )}
                                </option>
                              )
                            )}
                          </select>

                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                      ) : (
                        <input
                          type={
                            condition.type ===
                              "SCAN_COUNT"
                              ? "number"
                              : condition.type ===
                                "DATE"
                              ? "date"
                              : condition.type ===
                                "TIME"
                              ? "time"
                              : "text"
                          }
                          value={
                            condition.value ===
                            undefined
                              ? ""
                              : String(
                                  condition.value
                                )
                          }
                          onChange={(
                            event
                          ) =>
                            updateCondition(
                              index,
                              {
                                value:
                                  condition.type ===
                                  "SCAN_COUNT"
                                    ? Number(
                                        event
                                          .target
                                          .value
                                      )
                                    : event
                                        .target
                                        .value,
                              }
                            )
                          }
                          placeholder={
                            condition.type ===
                            "GEO_RADIUS"
                              ? "e.g. 10"
                              : "Enter value"
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
                        />
                      )}
                    </div>
                  </div>

                  {/* SECOND VALUE */}

                  {(condition.operator ===
                    "BETWEEN" ||
                    condition.operator ===
                      "NOT_BETWEEN") && (
                    <div className="mt-3">
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Second value
                      </label>

                      <input
                        type={
                          condition.type ===
                            "DATE"
                            ? "date"
                            : condition.type ===
                              "TIME"
                            ? "time"
                            : "text"
                        }
                        value={
                          condition.value2 ===
                          undefined
                            ? ""
                            : String(
                                condition.value2
                              )
                        }
                        onChange={(
                          event
                        ) =>
                          updateCondition(
                            index,
                            {
                              value2:
                                event
                                  .target
                                  .value,
                            }
                          )
                        }
                        placeholder="Enter second value"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5"
                      />
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ======================================================
          ADD CONDITION
      ====================================================== */}

      {conditions.length >
        0 && (
        <button
          type="button"
          onClick={addCondition}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add condition
        </button>
      )}

      {/* ======================================================
          LOGIC SUMMARY
      ====================================================== */}

      {conditions.length >
        1 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          These conditions use{" "}
          <span className="font-bold text-slate-800">
            {logic}
          </span>{" "}
          logic.
        </div>
      )}
    </div>
  );
}