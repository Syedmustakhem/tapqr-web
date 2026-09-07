import { apiRequest } from "@/lib/api";
import type { QRRuleActionType } from "@/lib/qr-rules";

/* ============================================================
   ENUMS
============================================================ */

export type QRExperimentStatus =
  | "DRAFT"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

export const QRExperimentStatus = {
  DRAFT: "DRAFT",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;

export type QRExperimentAllocationType =
  | "PERCENTAGE"
  | "FIXED";

export const QRExperimentAllocationType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;

/* ============================================================
   VARIANT
============================================================ */

export type QRExperimentVariant = {
  id: string;
  experimentId: string;

  name: string;
  allocation: number;

  actionType: QRRuleActionType;
  actionValue: string;

  participantCount?: number;
  conversionCount?: number;

  createdAt?: string;
  updatedAt?: string;
};

/* ============================================================
   EXPERIMENT
============================================================ */

export type QRExperiment = {
  id: string;
  qrCodeId: string;

  name: string;
  description?: string | null;

  status: QRExperimentStatus;
  allocationType: QRExperimentAllocationType;

  startsAt?: string | null;
  endsAt?: string | null;

  participantCount?: number;
  conversionCount?: number;

  createdAt?: string;
  updatedAt?: string;

  variants?: QRExperimentVariant[];

  /*
   * Some backend responses may expose the QR relation.
   * Keep this optional so the API layer remains compatible
   * with both minimal and expanded responses.
   */
  qrCode?: {
    id: string;
    name?: string;
    shortCode?: string;
  } | null;
};

/* ============================================================
   API RESPONSE TYPES
============================================================ */

export type QRExperimentResponse = {
  success?: boolean;
  message?: string;
  data?: QRExperiment;
};

export type QRExperimentsResponse = {
  success?: boolean;
  message?: string;
  data?: QRExperiment[];
};

export type QRExperimentVariantResponse = {
  success?: boolean;
  message?: string;
  data?: QRExperimentVariant;
};

/* ============================================================
   INPUT TYPES
============================================================ */

export type CreateQRExperimentInput = {
  qrCodeId: string;

  name: string;
  description?: string | null;

  allocationType?: QRExperimentAllocationType;

  startsAt?: string | null;
  endsAt?: string | null;
};

export type UpdateQRExperimentInput = {
  name?: string;
  description?: string | null;

  allocationType?: QRExperimentAllocationType;

  startsAt?: string | null;
  endsAt?: string | null;
};

export type CreateQRExperimentVariantInput = {
  name: string;
  allocation: number;

  actionType: QRRuleActionType;
  actionValue: string;
};

export type UpdateQRExperimentVariantInput = {
  name?: string;
  allocation?: number;

  actionType?: QRRuleActionType;
  actionValue?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function experimentPath(experimentId: string): string {
  return `/qr-experiments/${encodeURIComponent(experimentId)}`;
}

function variantPath(
  experimentId: string,
  variantId: string
): string {
  return `${experimentPath(experimentId)}/variants/${encodeURIComponent(
    variantId
  )}`;
}

/* ============================================================
   CREATE EXPERIMENT
============================================================ */

export async function createQRExperiment(
  input: CreateQRExperimentInput
) {
  return apiRequest<QRExperimentResponse>(
    "/qr-experiments",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

/* ============================================================
   LIST EXPERIMENTS
============================================================ */

export async function getQRExperiments(
  qrCodeId?: string
) {
  const search = new URLSearchParams();

  if (qrCodeId) {
    search.set("qrCodeId", qrCodeId);
  }

  const query = search.toString();

  return apiRequest<QRExperimentsResponse>(
    `/qr-experiments${query ? `?${query}` : ""}`
  );
}

/* ============================================================
   GET EXPERIMENT
============================================================ */

export async function getQRExperiment(
  experimentId: string
) {
  return apiRequest<QRExperimentResponse>(
    experimentPath(experimentId)
  );
}

/* ============================================================
   UPDATE EXPERIMENT
============================================================ */

export async function updateQRExperiment(
  experimentId: string,
  input: UpdateQRExperimentInput
) {
  return apiRequest<QRExperimentResponse>(
    experimentPath(experimentId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

/* ============================================================
   DELETE EXPERIMENT
============================================================ */

export async function deleteQRExperiment(
  experimentId: string
) {
  return apiRequest<{
    success?: boolean;
    message?: string;
  }>(
    experimentPath(experimentId),
    {
      method: "DELETE",
    }
  );
}

/* ============================================================
   START EXPERIMENT
============================================================ */

export async function startQRExperiment(
  experimentId: string
) {
  return apiRequest<QRExperimentResponse>(
    `${experimentPath(experimentId)}/start`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   PAUSE EXPERIMENT
============================================================ */

export async function pauseQRExperiment(
  experimentId: string
) {
  return apiRequest<QRExperimentResponse>(
    `${experimentPath(experimentId)}/pause`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   COMPLETE EXPERIMENT
============================================================ */

export async function completeQRExperiment(
  experimentId: string
) {
  return apiRequest<QRExperimentResponse>(
    `${experimentPath(experimentId)}/complete`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   CREATE VARIANT
============================================================ */

export async function createQRExperimentVariant(
  experimentId: string,
  input: CreateQRExperimentVariantInput
) {
  return apiRequest<QRExperimentVariantResponse>(
    `${experimentPath(experimentId)}/variants`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

/* ============================================================
   UPDATE VARIANT
============================================================ */

export async function updateQRExperimentVariant(
  experimentId: string,
  variantId: string,
  input: UpdateQRExperimentVariantInput
) {
  return apiRequest<QRExperimentVariantResponse>(
    variantPath(experimentId, variantId),
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

/* ============================================================
   DELETE VARIANT
============================================================ */

export async function deleteQRExperimentVariant(
  experimentId: string,
  variantId: string
) {
  return apiRequest<{
    success?: boolean;
    message?: string;
  }>(
    variantPath(experimentId, variantId),
    {
      method: "DELETE",
    }
  );
}
