"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  createQRRule,
  QRRuleStatus,
} from "@/lib/qr-rules";

import { apiRequest, ApiError } from "@/lib/api";

import RuleBuilder, {
  createDefaultRuleBuilderValue,
  type RuleBuilderValue,
} from "@/components/qr-rules/RuleBuilder";

/* ============================================================
   TYPES
   ============================================================ */

interface Business {
  id: string;
  name: string;
}

interface QRCodeRecord {
  id: string;
  name: string;
  shortCode?: string | null;
  businessId?: string | null;
}

interface BusinessesResponse {
  success?: boolean;
  data?: Business[] | { businesses?: Business[] };
}

interface QRCodesResponse {
  success?: boolean;
  data?:
    | QRCodeRecord[]
    | {
        qrcodes?: QRCodeRecord[];
        qrCodes?: QRCodeRecord[];
      };
}

/* ============================================================
   HELPERS
   ============================================================ */

function extractBusinesses(
  response: BusinessesResponse
): Business[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data?.businesses) {
    return response.data.businesses;
  }

  return [];
}

function extractQRCodes(
  response: QRCodesResponse
): QRCodeRecord[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data?.qrcodes) {
    return response.data.qrcodes;
  }

  if (response.data?.qrCodes) {
    return response.data.qrCodes;
  }

  return [];
}

/* ============================================================
   PAGE
   ============================================================ */

export default function NewQRRulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQRCodeId =
    searchParams.get("qrId") ?? "";

  /* ==========================================================
     STATE
     ========================================================== */

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [qrCodes, setQRCodes] =
    useState<QRCodeRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [builder, setBuilder] =
    useState<RuleBuilderValue>(() =>
      createDefaultRuleBuilderValue({
        qrCodeId:
          initialQRCodeId,
      })
    );

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  useEffect(() => {
  let mounted = true;

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Load businesses first.
      const businessesResponse =
        await apiRequest<BusinessesResponse>(
          "/businesses"
        );

      if (!mounted) return;

      const loadedBusinesses =
        extractBusinesses(businessesResponse);

      setBusinesses(loadedBusinesses);

      if (loadedBusinesses.length === 0) {
        setQRCodes([]);
        setError(
          "No businesses found. Create a business before creating a Smart Rule."
        );
        return;
      }

      /*
       * Use the business selected in the TapQR workspace.
       * Business page stores this value here.
       */
      let currentBusinessId = "";

      try {
        currentBusinessId =
          window.localStorage.getItem(
            "tapqr_current_business_id"
          ) ?? "";
      } catch {
        currentBusinessId = "";
      }

      /*
       * If a QR ID is present, try to preserve it.
       * Otherwise use the current workspace business.
       */
      const selectedBusiness =
        loadedBusinesses.find(
          (business) =>
            business.id === currentBusinessId
        ) ?? loadedBusinesses[0];

      if (!selectedBusiness) {
        setQRCodes([]);
        setError(
          "No business is available."
        );
        return;
      }

      /*
       * IMPORTANT:
       * Backend route is:
       *
       * GET /api/qrcodes/business/:businessId
       */
      const qrCodesResponse =
        await apiRequest<QRCodesResponse>(
          `/qrcodes/business/${encodeURIComponent(
            selectedBusiness.id
          )}`
        );

      if (!mounted) return;

      const loadedQRCodes =
        extractQRCodes(qrCodesResponse);

      setQRCodes(loadedQRCodes);

      /*
       * If qrId was supplied in the URL,
       * make sure it belongs to the selected business.
       */
      if (initialQRCodeId) {
        const selectedQR =
          loadedQRCodes.find(
            (qr) =>
              qr.id === initialQRCodeId
          );

        if (selectedQR) {
          setBuilder((current) => ({
            ...current,
            qrCodeId: selectedQR.id,
            businessId:
              selectedQR.businessId ??
              selectedBusiness.id,
          }));
        } else {
          /*
           * QR ID does not belong to the current
           * workspace business.
           */
          setBuilder((current) => ({
            ...current,
            businessId:
              selectedBusiness.id,
            qrCodeId: "",
          }));

          setError(
            "The selected QR code does not belong to the current business."
          );
        }
      } else {
        setBuilder((current) => ({
          ...current,
          businessId:
            selectedBusiness.id,
        }));
      }
    } catch (err) {
      console.error(
        "Failed to load Smart Rule data:",
        err
      );

      if (!mounted) return;

      setQRCodes([]);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load businesses and QR codes."
      );
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  loadData();

  return () => {
    mounted = false;
  };
}, [initialQRCodeId]);
  /* ==========================================================
     FILTER QR CODES BY BUSINESS
     ========================================================== */

  const filteredQRCodes =
    useMemo(() => {
      if (!builder.businessId) {
        return qrCodes;
      }

      return qrCodes.filter(
        (qr) =>
          !qr.businessId ||
          qr.businessId ===
            builder.businessId
      );
    }, [
      qrCodes,
      builder.businessId,
    ]);

  /* ==========================================================
     CHANGE BUILDER
     ========================================================== */

  const handleBuilderChange = (
    nextValue: RuleBuilderValue
  ) => {
    setBuilder(nextValue);
    setError(null);
  };

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const handleSubmit = async () => {
    setError(null);

    /*
     * Client-side validation.
     */

    if (!builder.name.trim()) {
      setError(
        "Please enter a rule name."
      );
      return;
    }

    if (!builder.businessId) {
      setError(
        "Please select a business."
      );
      return;
    }

    if (!builder.qrCodeId) {
      setError(
        "Please select a QR code."
      );
      return;
    }

    if (!builder.action.type) {
      setError(
        "Please select an action type."
      );
      return;
    }

    if (
      !builder.action.value?.trim()
    ) {
      setError(
        "Please enter an action value."
      );
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Convert frontend builder state
       * into the backend create-rule shape.
       */

      const payload = {
        qrCodeId:
          builder.qrCodeId,

        name:
          builder.name.trim(),

        description:
          builder.description.trim() ||
          undefined,

        priority:
          Number.isFinite(
            builder.priority
          )
            ? builder.priority
            : 0,

        logic:
          builder.logic,

        actionType:
          builder.action.type,

        actionValue:
          String(
            builder.action.value ?? ""
          ).trim(),

        fallbackActionType:
          builder.fallbackActionType ??
          undefined,

        fallbackActionValue:
          builder.fallbackActionValue?.trim() ||
          undefined,

        conditions:
          builder.conditions,

        groups:
          builder.groups,

        startsAt:
          builder.startsAt
            ? new Date(
                builder.startsAt
              ).toISOString()
            : undefined,

        endsAt:
          builder.endsAt
            ? new Date(
                builder.endsAt
              ).toISOString()
            : undefined,

        experimentId:
          builder.experimentId ||
          undefined,

        status:
          QRRuleStatus.DRAFT,
      };

      /*
       * Create the rule.
       */

      await createQRRule(payload);

      /*
       * Rule successfully created.
       */

      router.push(
        "/dashboard/qr/rules"
      );

      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message ||
            "Unable to create the rule."
        );
      } else if (err instanceof Error) {
        setError(
          err.message
        );
      } else {
        setError(
          "Unable to create the rule."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <div className="min-h-[60vh] p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />

          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />

          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
     ========================================================== */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ====================================================
            BREADCRUMB
           ==================================================== */}

        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/qr/rules"
              )
            }
            className="font-medium transition hover:text-slate-900"
          >
            Smart Rules
          </button>

          <span className="text-slate-300">
            /
          </span>

          <span className="font-medium text-slate-700">
            Create Rule
          </span>
        </div>

        {/* ====================================================
            EMPTY DATA ERROR
           ==================================================== */}

        {businesses.length === 0 &&
          qrCodes.length === 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M12 3 3 20h18L12 3Z"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M12 9v4M12 17h.01"
                    strokeLinecap="round"
                  />
                </svg>

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    No businesses or QR
                    codes found
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Create a business and
                    QR code before creating
                    a Smart Rule.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* ====================================================
            BUILDER
           ==================================================== */}

        <RuleBuilder
          value={builder}
          businesses={businesses}
          qrCodes={filteredQRCodes}
          onChange={
            handleBuilderChange
          }
          onSubmit={handleSubmit}
          onCancel={() =>
            router.push(
              "/dashboard/qr/rules"
            )
          }
          submitting={submitting}
          submitLabel="Save Draft"
          error={error}
        />
      </div>
    </main>
  );
}