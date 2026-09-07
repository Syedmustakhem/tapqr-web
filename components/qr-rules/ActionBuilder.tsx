"use client";

import React from "react";

import {
  QRRuleAction,
  QRRuleActionType,
} from "@/lib/qr-rules";

interface ActionBuilderProps {
  action: QRRuleAction;
  onChange: (action: QRRuleAction) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

type ActionOption = {
  value: QRRuleActionType;
  label: string;
  description: string;
};

const ACTION_OPTIONS: ActionOption[] = [
  {
    value: QRRuleActionType.EXPERIENCE,
    label: "Experience",
    description:
      "Show a specific TapQR guest experience.",
  },
  {
    value: QRRuleActionType.REDIRECT,
    label: "Redirect",
    description:
      "Send the visitor to another URL.",
  },
  {
    value: QRRuleActionType.CATALOG,
    label: "Catalog",
    description:
      "Open a specific catalog.",
  },
  {
    value: QRRuleActionType.MENU,
    label: "Menu",
    description:
      "Open a digital menu experience.",
  },
  {
    value: QRRuleActionType.SERVICES,
    label: "Services",
    description:
      "Show the business services experience.",
  },
  {
    value: QRRuleActionType.PRODUCTS,
    label: "Products",
    description:
      "Open a product-focused experience.",
  },
  {
    value: QRRuleActionType.CONTACT,
    label: "Contact",
    description:
      "Open the business contact experience.",
  },
  {
    value: QRRuleActionType.CAMPAIGN,
    label: "Campaign",
    description:
      "Route the visitor into a campaign.",
  },
  {
    value: QRRuleActionType.CUSTOM,
    label: "Custom",
    description:
      "Use a custom action value.",
  },
];

function getActionIcon(
  type: QRRuleActionType
) {
  switch (type) {
    case QRRuleActionType.EXPERIENCE:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
          />
          <path
            d="M8 9h8M8 13h5M8 17h8"
            strokeLinecap="round"
          />
        </svg>
      );

    case QRRuleActionType.REDIRECT:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M14 5h5v5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 5l-8 8"
            strokeLinecap="round"
          />
          <path
            d="M18 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case QRRuleActionType.CATALOG:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M5 5h14v14H5z"
            strokeLinejoin="round"
          />
          <path
            d="M8 8h8M8 12h8M8 16h5"
            strokeLinecap="round"
          />
        </svg>
      );

    case QRRuleActionType.MENU:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M6 4v16M10 4v6"
            strokeLinecap="round"
          />
          <path
            d="M10 10c0 2-4 2-4 0"
            strokeLinecap="round"
          />
          <path
            d="M15 4v16"
            strokeLinecap="round"
          />
          <path
            d="M15 4c3 2 3 5 0 7"
            strokeLinecap="round"
          />
        </svg>
      );

    case QRRuleActionType.SERVICES:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M5 7h14M5 12h14M5 17h9"
            strokeLinecap="round"
          />
          <circle
            cx="17"
            cy="17"
            r="2"
          />
        </svg>
      );

    case QRRuleActionType.PRODUCTS:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M5 8h14l-1 11H6L5 8Z"
            strokeLinejoin="round"
          />
          <path
            d="M9 8a3 3 0 0 1 6 0"
            strokeLinecap="round"
          />
        </svg>
      );

    case QRRuleActionType.CONTACT:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M5 6h14v12H5z"
            strokeLinejoin="round"
          />
          <path
            d="m7 8 5 4 5-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case QRRuleActionType.CAMPAIGN:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 7h16v10H4z"
            strokeLinejoin="round"
          />
          <path
            d="M8 4v3M16 4v3"
            strokeLinecap="round"
          />
          <path
            d="M8 11h8M8 14h5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M12 3v18M3 12h18"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function getPlaceholder(
  type: QRRuleActionType
) {
  switch (type) {
    case QRRuleActionType.REDIRECT:
      return "https://example.com";

    case QRRuleActionType.EXPERIENCE:
      return "Experience ID";

    case QRRuleActionType.CATALOG:
      return "Catalog ID";

    case QRRuleActionType.CAMPAIGN:
      return "Campaign ID";

    case QRRuleActionType.MENU:
      return "Menu ID or identifier";

    case QRRuleActionType.SERVICES:
      return "Services identifier";

    case QRRuleActionType.PRODUCTS:
      return "Products identifier";

    case QRRuleActionType.CONTACT:
      return "Contact identifier";

    default:
      return "Enter action value";
  }
}

function getValueDescription(
  type: QRRuleActionType
) {
  switch (type) {
    case QRRuleActionType.REDIRECT:
      return "Use a complete URL including https://.";

    case QRRuleActionType.EXPERIENCE:
      return "Identifier of the experience to open.";

    case QRRuleActionType.CATALOG:
      return "Identifier of the catalog to open.";

    case QRRuleActionType.CAMPAIGN:
      return "Identifier of the campaign to activate.";

    default:
      return "Value passed to the selected action.";
  }
}

export default function ActionBuilder({
  action,
  onChange,
  disabled = false,
  title = "Action",
  description = "Choose what happens when this rule matches.",
}: ActionBuilderProps) {
  const updateAction = (
    changes: Partial<QRRuleAction>
  ) => {
    onChange({
      ...action,
      ...changes,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ======================================================
          HEADER
         ====================================================== */}

      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          BODY
         ====================================================== */}

      <div className="p-5">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Action type
        </label>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTION_OPTIONS.map(
            (option) => {
              const selected =
                action.type ===
                option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    updateAction({
                      type: option.value,
                      value: "",
                    })
                  }
                  className={[
                    "group rounded-2xl border p-4 text-left transition",
                    selected
                      ? "border-blue-300 bg-blue-50/60 ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        selected
                          ? "bg-white text-blue-600 shadow-sm"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {getActionIcon(
                        option.value
                      )}
                    </div>

                    <div
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white",
                      ].join(" ")}
                    >
                      {selected && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-3 w-3"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path
                            d="m6 12 4 4 8-8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {option.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {option.description}
                  </p>
                </button>
              );
            }
          )}
        </div>

        {/* ====================================================
            VALUE
           ==================================================== */}

        <div className="mt-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Action value
          </label>

          <input
            type={
              action.type ===
              QRRuleActionType.REDIRECT
                ? "url"
                : "text"
            }
            value={
              action.value ?? ""
            }
            disabled={disabled}
            placeholder={getPlaceholder(
              action.type
            )}
            onChange={(event) =>
              updateAction({
                value:
                  event.target.value,
              })
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <p className="mt-2 text-xs text-slate-400">
            {getValueDescription(
              action.type
            )}
          </p>
        </div>

        {/* ====================================================
            PREVIEW
           ==================================================== */}

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate-400">
              {getActionIcon(
                action.type
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Action preview
              </p>

              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                {ACTION_OPTIONS.find(
                  (item) =>
                    item.value ===
                    action.type
                )?.label ??
                  action.type}

                {action.value
                  ? ` → ${action.value}`
                  : " → No value configured"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}