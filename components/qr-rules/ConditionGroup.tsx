"use client";

import React, { useMemo } from "react";

import {
  QRRuleCondition,
  QRRuleConditionType,
  QRRuleOperator,
} from "@/lib/qr-rules";

/* ============================================================
   TYPES
   ============================================================ */

type ConditionChangePayload =
  | QRRuleCondition
  | QRRuleCondition[];

interface ConditionBuilderProps {
  /*
   * Supports BOTH APIs.
   *
   * Single condition:
   *   <ConditionBuilder
   *     condition={condition}
   *     onChange={(condition) => ...}
   *   />
   *
   * Array:
   *   <ConditionBuilder
   *     conditions={conditions}
   *     onChange={(conditions) => ...}
   *   />
   */
  condition?: QRRuleCondition;
  conditions?: QRRuleCondition[];

  index?: number;

  disabled?: boolean;

  onChange: (
    value: ConditionChangePayload
  ) => void;

  onRemove?: () => void;
}

/* ============================================================
   OPTIONS
   ============================================================ */

const CONDITION_TYPES: Array<{
  value: QRRuleConditionType;
  label: string;
  description: string;
}> = [
  {
    value: "TIME",
    label: "Time",
    description: "Match a specific time or time range.",
  },
  {
    value: "DATE",
    label: "Date",
    description: "Match a specific date.",
  },
  {
    value: "DAY_OF_WEEK",
    label: "Day of week",
    description: "Match one or more days.",
  },
  {
    value: "BUSINESS_HOURS",
    label: "Business hours",
    description: "Match when the business is open.",
  },
  {
    value: "DEVICE",
    label: "Device",
    description: "Mobile, tablet, desktop, etc.",
  },
  {
    value: "OPERATING_SYSTEM",
    label: "Operating system",
    description: "Windows, macOS, Android, iOS, etc.",
  },
  {
    value: "BROWSER",
    label: "Browser",
    description: "Chrome, Safari, Firefox, Edge, etc.",
  },
  {
    value: "LANGUAGE",
    label: "Language",
    description: "Visitor browser language.",
  },
  {
    value: "COUNTRY",
    label: "Country",
    description: "Visitor country.",
  },
  {
    value: "STATE",
    label: "State",
    description: "Visitor state or region.",
  },
  {
    value: "CITY",
    label: "City",
    description: "Visitor city.",
  },
  {
    value: "GEO_RADIUS",
    label: "Geo radius",
    description: "Match visitors within a geographic radius.",
  },
  {
    value: "REFERRER",
    label: "Referrer",
    description: "Where the visitor came from.",
  },
  {
    value: "UTM_SOURCE",
    label: "UTM source",
    description: "Campaign source.",
  },
  {
    value: "UTM_MEDIUM",
    label: "UTM medium",
    description: "Campaign medium.",
  },
  {
    value: "UTM_CAMPAIGN",
    label: "UTM campaign",
    description: "Campaign name.",
  },
  {
    value: "UTM_TERM",
    label: "UTM term",
    description: "Campaign keyword.",
  },
  {
    value: "UTM_CONTENT",
    label: "UTM content",
    description: "Campaign content identifier.",
  },
  {
    value: "QR_SOURCE",
    label: "QR source",
    description: "Physical or digital QR source.",
  },
  {
    value: "QR_PLACEMENT",
    label: "QR placement",
    description: "Where the QR is placed.",
  },
  {
    value: "QR_LOCATION",
    label: "QR location",
    description: "Business/location label.",
  },
  {
    value: "CAMPAIGN",
    label: "Campaign",
    description: "QR campaign name.",
  },
  {
    value: "SCAN_COUNT",
    label: "Scan count",
    description: "Number of scans for this QR.",
  },
  {
    value: "VISITOR_TYPE",
    label: "Visitor type",
    description: "New or returning visitor.",
  },
  {
    value: "CUSTOMER_STATE",
    label: "Customer state",
    description: "Customer lifecycle state.",
  },
  {
    value: "CUSTOMER_SEGMENT",
    label: "Customer segment",
    description: "Customer segment.",
  },
  {
    value: "AUTHENTICATION_STATE",
    label: "Authentication state",
    description: "Authenticated or anonymous.",
  },
  {
    value: "BUSINESS_STATE",
    label: "Business state",
    description: "Business lifecycle state.",
  },
  {
    value: "CATALOG_STATE",
    label: "Catalog state",
    description: "Catalog lifecycle state.",
  },
  {
    value: "PRODUCT_AVAILABILITY",
    label: "Product availability",
    description: "Product availability state.",
  },
  {
    value: "SUBSCRIPTION_PLAN",
    label: "Subscription plan",
    description: "Business subscription plan.",
  },
  {
    value: "CUSTOM",
    label: "Custom",
    description: "Custom routing attribute.",
  },
];

const OPERATORS: Array<{
  value: QRRuleOperator;
  label: string;
}> = [
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
   DEFAULT VALUES
   ============================================================ */

function createDefaultCondition(): QRRuleCondition {
  return {
    id:
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `condition-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,
    type: "DEVICE",
    operator: "EQUALS",
    value: "",
  };
}

/* ============================================================
   HELPERS
   ============================================================ */

function getTypeLabel(
  type: QRRuleConditionType
): string {
  return (
    CONDITION_TYPES.find(
      (item) => item.value === type
    )?.label ?? type
  );
}

function getTypeDescription(
  type: QRRuleConditionType
): string {
  return (
    CONDITION_TYPES.find(
      (item) => item.value === type
    )?.description ?? ""
  );
}

function getOperatorLabel(
  operator: QRRuleOperator
): string {
  return (
    OPERATORS.find(
      (item) => item.value === operator
    )?.label ?? operator
  );
}

function isExistenceOperator(
  operator: QRRuleOperator
) {
  return (
    operator === "EXISTS" ||
    operator === "NOT_EXISTS"
  );
}

function isBetweenOperator(
  operator: QRRuleOperator
) {
  return (
    operator === "BETWEEN" ||
    operator === "NOT_BETWEEN"
  );
}

function isArrayOperator(
  operator: QRRuleOperator
) {
  return (
    operator === "IN" ||
    operator === "NOT_IN"
  );
}

function isNumericCondition(
  type: QRRuleConditionType
) {
  return (
    type === "SCAN_COUNT" ||
    type === "GEO_RADIUS"
  );
}

function isDateCondition(
  type: QRRuleConditionType
) {
  return type === "DATE";
}

function isTimeCondition(
  type: QRRuleConditionType
) {
  return (
    type === "TIME" ||
    type === "BUSINESS_HOURS"
  );
}

function isDayCondition(
  type: QRRuleConditionType
) {
  return type === "DAY_OF_WEEK";
}

function normalizeArrayValue(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value.map((item) =>
      String(item ?? "")
    );
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function valueToInputString(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (
    typeof value === "object"
  ) {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return String(value);
}

/* ============================================================
   SMALL UI COMPONENTS
   ============================================================ */

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-xs font-semibold text-slate-700">
      {children}
      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
}

function SelectField({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    >
      {children}
    </select>
  );
}

function TextInput({
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  disabled: boolean;
  placeholder?: string;
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
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    />
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function ConditionBuilder({
  condition,
  conditions,
  index,
  disabled = false,
  onChange,
  onRemove,
}: ConditionBuilderProps) {
  /*
   * IMPORTANT:
   *
   * Never do:
   *
   *   conditions.length
   *
   * without normalizing first.
   *
   * This was the source of the runtime crash.
   */
  const normalizedConditions = useMemo(() => {
    if (Array.isArray(conditions)) {
      return conditions;
    }

    if (condition) {
      return [condition];
    }

    return [];
  }, [condition, conditions]);

  const isSingleConditionMode =
    Boolean(condition) &&
    !Array.isArray(conditions);

  const activeCondition =
    isSingleConditionMode
      ? condition ?? createDefaultCondition()
      : normalizedConditions[0] ??
        createDefaultCondition();

  /* ==========================================================
     UPDATE
     ========================================================== */

  const emitCondition = (
    nextCondition: QRRuleCondition
  ) => {
    if (isSingleConditionMode) {
      onChange(nextCondition);
      return;
    }

    const nextConditions = [
      ...normalizedConditions,
    ];

    if (
      typeof index === "number" &&
      index >= 0
    ) {
      nextConditions[index] =
        nextCondition;
    } else {
      nextConditions[0] =
        nextCondition;
    }

    onChange(nextConditions);
  };

  const updateCondition = (
    changes: Partial<QRRuleCondition>
  ) => {
    emitCondition({
      ...activeCondition,
      ...changes,
    });
  };

  /* ==========================================================
     REMOVE
     ========================================================== */

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      return;
    }

    if (
      !isSingleConditionMode &&
      normalizedConditions.length > 0
    ) {
      const removeIndex =
        typeof index === "number"
          ? index
          : 0;

      onChange(
        normalizedConditions.filter(
          (_, itemIndex) =>
            itemIndex !== removeIndex
        )
      );
    }
  };

  /* ==========================================================
     CURRENT VALUES
     ========================================================== */

  const type =
    activeCondition.type;

  const operator =
    activeCondition.operator;

  const value =
    activeCondition.value;

  const value2 =
    activeCondition.value2;

  const arrayValue =
    normalizeArrayValue(value);

  /* ==========================================================
     TYPE CHANGE
     ========================================================== */

  const handleTypeChange = (
    nextType: QRRuleConditionType
  ) => {
    let nextValue: unknown = "";

    if (nextType === "DAY_OF_WEEK") {
      nextValue = [];
    }

    if (
      nextType === "GEO_RADIUS"
    ) {
      nextValue = "";
    }

    updateCondition({
      type: nextType,
      value: nextValue,
      value2: undefined,
    });
  };

  /* ==========================================================
     OPERATOR CHANGE
     ========================================================== */

  const handleOperatorChange = (
    nextOperator: QRRuleOperator
  ) => {
    let nextValue =
      activeCondition.value;

    let nextValue2 =
      activeCondition.value2;

    if (
      isExistenceOperator(
        nextOperator
      )
    ) {
      nextValue = "";
      nextValue2 = undefined;
    } else if (
      isArrayOperator(nextOperator)
    ) {
      nextValue = normalizeArrayValue(
        activeCondition.value
      );
      nextValue2 = undefined;
    } else if (
      isBetweenOperator(
        nextOperator
      )
    ) {
      nextValue =
        activeCondition.value ?? "";
      nextValue2 =
        activeCondition.value2 ?? "";
    } else {
      if (
        Array.isArray(nextValue)
      ) {
        nextValue =
          nextValue[0] ?? "";
      }

      nextValue2 = undefined;
    }

    updateCondition({
      operator: nextOperator,
      value: nextValue,
      value2: nextValue2,
    });
  };

  /* ==========================================================
     RENDER VALUE
     ========================================================== */

  const renderValueInput = () => {
    if (
      isExistenceOperator(operator)
    ) {
      return (
        <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
          <span className="text-xs font-medium text-slate-500">
            This condition does not
            require a value.
          </span>
        </div>
      );
    }

    /* --------------------------------------------------------
       DAY OF WEEK
       -------------------------------------------------------- */

    if (isDayCondition(type)) {
      const days = [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ];

      const selectedDays =
        normalizeArrayValue(value);

      const toggleDay = (
        day: string
      ) => {
        const exists =
          selectedDays.includes(day);

        const next = exists
          ? selectedDays.filter(
              (item) => item !== day
            )
          : [
              ...selectedDays,
              day,
            ];

        updateCondition({
          value: next,
        });
      };

      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {days.map((day) => {
            const selected =
              selectedDays.includes(
                day
              );

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() =>
                  toggleDay(day)
                }
                className={[
                  "rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "",
                ].join(" ")}
              >
                {day
                  .slice(0, 3)}
              </button>
            );
          })}
        </div>
      );
    }

    /* --------------------------------------------------------
       BOOLEAN-LIKE STATES
       -------------------------------------------------------- */

    if (
      type ===
        "AUTHENTICATION_STATE" ||
      type === "VISITOR_TYPE" ||
      type ===
        "PRODUCT_AVAILABILITY"
    ) {
      let options: string[] = [];

      if (
        type ===
        "AUTHENTICATION_STATE"
      ) {
        options = [
          "AUTHENTICATED",
          "ANONYMOUS",
        ];
      }

      if (
        type === "VISITOR_TYPE"
      ) {
        options = [
          "NEW",
          "RETURNING",
        ];
      }

      if (
        type ===
        "PRODUCT_AVAILABILITY"
      ) {
        options = [
          "AVAILABLE",
          "OUT_OF_STOCK",
          "LOW_STOCK",
        ];
      }

      if (
        isArrayOperator(operator)
      ) {
        return (
          <TextInput
            value={valueToInputString(
              value
            )}
            disabled={disabled}
            placeholder="AVAILABLE, OUT_OF_STOCK"
            onChange={(next) =>
              updateCondition({
                value: next
                  .split(",")
                  .map(
                    (item) =>
                      item.trim()
                  )
                  .filter(Boolean),
              })
            }
          />
        );
      }

      return (
        <SelectField
          value={valueToInputString(
            value
          )}
          disabled={disabled}
          onChange={(next) =>
            updateCondition({
              value: next,
            })
          }
        >
          <option value="">
            Select value
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option
                .replaceAll(
                  "_",
                  " "
                )
                .toLowerCase()
                .replace(
                  /\b\w/g,
                  (char) =>
                    char.toUpperCase()
                )}
            </option>
          ))}
        </SelectField>
      );
    }

    /* --------------------------------------------------------
       DEVICE
       -------------------------------------------------------- */

    if (type === "DEVICE") {
      const options = [
        "MOBILE",
        "TABLET",
        "DESKTOP",
      ];

      if (
        isArrayOperator(operator)
      ) {
        return (
          <TextInput
            value={valueToInputString(
              value
            )}
            disabled={disabled}
            placeholder="MOBILE, DESKTOP"
            onChange={(next) =>
              updateCondition({
                value: next
                  .split(",")
                  .map(
                    (item) =>
                      item.trim()
                  )
                  .filter(Boolean),
              })
            }
          />
        );
      }

      return (
        <SelectField
          value={valueToInputString(
            value
          )}
          disabled={disabled}
          onChange={(next) =>
            updateCondition({
              value: next,
            })
          }
        >
          <option value="">
            Select device
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </SelectField>
      );
    }

    /* --------------------------------------------------------
       NUMERIC
       -------------------------------------------------------- */

    if (isNumericCondition(type)) {
      return (
        <div
          className={
            isBetweenOperator(operator)
              ? "grid grid-cols-2 gap-3"
              : ""
          }
        >
          <TextInput
            type="number"
            value={valueToInputString(
              value
            )}
            disabled={disabled}
            placeholder={
              type ===
              "GEO_RADIUS"
                ? "Radius"
                : "Value"
            }
            onChange={(next) =>
              updateCondition({
                value:
                  next === ""
                    ? ""
                    : Number(next),
              })
            }
          />

          {isBetweenOperator(
            operator
          ) && (
            <TextInput
              type="number"
              value={valueToInputString(
                value2
              )}
              disabled={disabled}
              placeholder="Maximum"
              onChange={(next) =>
                updateCondition({
                  value2:
                    next === ""
                      ? ""
                      : Number(next),
                })
              }
            />
          )}
        </div>
      );
    }

    /* --------------------------------------------------------
       DATE
       -------------------------------------------------------- */

    if (isDateCondition(type)) {
      return (
        <div
          className={
            isBetweenOperator(operator)
              ? "grid grid-cols-2 gap-3"
              : ""
          }
        >
          <TextInput
            type="date"
            value={valueToInputString(
              value
            )}
            disabled={disabled}
            onChange={(next) =>
              updateCondition({
                value: next,
              })
            }
          />

          {isBetweenOperator(
            operator
          ) && (
            <TextInput
              type="date"
              value={valueToInputString(
                value2
              )}
              disabled={disabled}
              onChange={(next) =>
                updateCondition({
                  value2: next,
                })
              }
            />
          )}
        </div>
      );
    }

    /* --------------------------------------------------------
       TIME
       -------------------------------------------------------- */

    if (isTimeCondition(type)) {
      return (
        <div
          className={
            isBetweenOperator(operator)
              ? "grid grid-cols-2 gap-3"
              : ""
          }
        >
          <TextInput
            type="time"
            value={valueToInputString(
              value
            )}
            disabled={disabled}
            onChange={(next) =>
              updateCondition({
                value: next,
              })
            }
          />

          {isBetweenOperator(
            operator
          ) && (
            <TextInput
              type="time"
              value={valueToInputString(
                value2
              )}
              disabled={disabled}
              onChange={(next) =>
                updateCondition({
                  value2: next,
                })
              }
            />
          )}
        </div>
      );
    }

    /* --------------------------------------------------------
       ARRAY OPERATORS
       -------------------------------------------------------- */

    if (isArrayOperator(operator)) {
      return (
        <div>
          <TextInput
            value={valueToInputString(
              value
            )}
            disabled={disabled}
            placeholder="Value 1, Value 2, Value 3"
            onChange={(next) =>
              updateCondition({
                value: next
                  .split(",")
                  .map(
                    (item) =>
                      item.trim()
                  )
                  .filter(Boolean),
              })
            }
          />

          <p className="mt-1.5 text-[11px] text-slate-400">
            Separate multiple values
            with commas.
          </p>
        </div>
      );
    }

    /* --------------------------------------------------------
       BETWEEN
       -------------------------------------------------------- */

    if (isBetweenOperator(operator)) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            value={valueToInputString(
              value
            )}
            disabled={disabled}
            placeholder="Minimum"
            onChange={(next) =>
              updateCondition({
                value: next,
              })
            }
          />

          <TextInput
            value={valueToInputString(
              value2
            )}
            disabled={disabled}
            placeholder="Maximum"
            onChange={(next) =>
              updateCondition({
                value2: next,
              })
            }
          />
        </div>
      );
    }

    /* --------------------------------------------------------
       DEFAULT
       -------------------------------------------------------- */

    return (
      <TextInput
        value={valueToInputString(
          value
        )}
        disabled={disabled}
        placeholder={
          type === "CUSTOM"
            ? "Enter custom value"
            : "Enter value"
        }
        onChange={(next) =>
          updateCondition({
            value: next,
          })
        }
      />
    );
  };

  /* ==========================================================
     PREVIEW
     ========================================================== */

  const preview = useMemo(() => {
    const typeLabel =
      getTypeLabel(type);

    const operatorLabel =
      getOperatorLabel(operator);

    if (
      isExistenceOperator(operator)
    ) {
      return `${typeLabel} ${operatorLabel.toLowerCase()}`;
    }

    if (
      isBetweenOperator(operator)
    ) {
      return `${typeLabel} ${operatorLabel.toLowerCase()} ${valueToInputString(
        value
      )} and ${valueToInputString(
        value2
      )}`;
    }

    if (
      isArrayOperator(operator)
    ) {
      return `${typeLabel} ${operatorLabel.toLowerCase()} ${valueToInputString(
        value
      )}`;
    }

    return `${typeLabel} ${operatorLabel.toLowerCase()} ${valueToInputString(
      value
    )}`;
  }, [
    type,
    operator,
    value,
    value2,
  ]);

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4.5 w-4.5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M5 7h14M5 12h14M5 17h9"
                  strokeLinecap="round"
                />
                <circle
                  cx="18"
                  cy="17"
                  r="1.5"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                Condition
                {typeof index ===
                  "number"
                  ? ` ${index + 1}`
                  : ""}
              </p>

              <p className="truncate text-[11px] text-slate-400">
                Define when this rule
                should match
              </p>
            </div>
          </div>

          {onRemove && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              aria-label="Remove condition"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M4 7h16"
                  strokeLinecap="round"
                />
                <path
                  d="M9 7V4h6v3M8 7l1 13h6l1-13"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 11v5M14 11v5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* BODY */}

      <div className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          {/* CONDITION TYPE */}

          <div>
            <FieldLabel required>
              Condition type
            </FieldLabel>

            <SelectField
              value={type}
              disabled={disabled}
              onChange={(next) =>
                handleTypeChange(
                  next as QRRuleConditionType
                )
              }
            >
              {CONDITION_TYPES.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </SelectField>

            <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
              {getTypeDescription(
                type
              )}
            </p>
          </div>

          {/* OPERATOR */}

          <div>
            <FieldLabel required>
              Operator
            </FieldLabel>

            <SelectField
              value={operator}
              disabled={disabled}
              onChange={(next) =>
                handleOperatorChange(
                  next as QRRuleOperator
                )
              }
            >
              {OPERATORS.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </SelectField>
          </div>
        </div>

        {/* VALUE */}

        <div className="mt-4">
          <FieldLabel
            required={
              !isExistenceOperator(
                operator
              )
            }
          >
            Value
          </FieldLabel>

          {renderValueInput()}
        </div>

        {/* PREVIEW */}

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M5 12h14"
                  strokeLinecap="round"
                />
                <path
                  d="M13 6l6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Rule preview
              </p>

              <p className="mt-1 break-words text-xs font-medium leading-5 text-slate-700">
                {preview}
              </p>
            </div>
          </div>
        </div>

        {/* ADVANCED METADATA */}

        {type === "CUSTOM" && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-3">
            <FieldLabel>
              Custom metadata
            </FieldLabel>

            <TextInput
              value={valueToInputString(
                activeCondition
                  .metadata
              )}
              disabled={disabled}
              placeholder='{"key":"value"}'
              onChange={(next) => {
                let metadata:
                  | Record<
                      string,
                      unknown
                    >
                  | undefined;

                try {
                  const parsed =
                    JSON.parse(next);

                  if (
                    parsed &&
                    typeof parsed ===
                      "object" &&
                    !Array.isArray(
                      parsed
                    )
                  ) {
                    metadata =
                      parsed;
                  }
                } catch {
                  metadata =
                    undefined;
                }

                updateCondition({
                  metadata,
                });
              }}
            />

            <p className="mt-1.5 text-[11px] text-slate-400">
              Optional JSON metadata for
              custom routing logic.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {getTypeLabel(type)}
          </span>

          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
            {getOperatorLabel(
              operator
            )}
          </span>
        </div>
      </div>
    </div>
  );
}