import { apiRequest } from "./api";

/*
 * ============================================================
 * SETTINGS API — preferences + developer API keys
 * ============================================================
 */

export type PreferencesData = {
  language: string;
  timezone: string;
};

export const LANGUAGES: Array<{
  code: string;
  label: string;
}> = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
];

export const TIMEZONES: Array<{
  code: string;
  label: string;
}> = [
  {
    code: "Asia/Kolkata",
    label: "India (IST, UTC+5:30)",
  },
  {
    code: "Asia/Dubai",
    label: "Dubai (GST, UTC+4)",
  },
  {
    code: "Asia/Singapore",
    label: "Singapore (SGT, UTC+8)",
  },
  {
    code: "Europe/London",
    label: "London (GMT/BST)",
  },
  {
    code: "America/New_York",
    label: "New York (ET)",
  },
];

export async function getPreferences() {
  return apiRequest<{
    success: boolean;
    data: PreferencesData;
  }>("/settings/preferences");
}

export async function updatePreferences(
  input: Partial<PreferencesData>
) {
  return apiRequest<{
    success: boolean;
    data: PreferencesData;
  }>("/settings/preferences", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export type ApiKeyData = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export async function listApiKeys() {
  return apiRequest<{
    success: boolean;
    data: ApiKeyData[];
  }>("/settings/api-keys");
}

export async function createApiKey(
  name: string,
  expiresInDays?: number
) {
  return apiRequest<{
    success: boolean;
    data: ApiKeyData & { key: string };
  }>("/settings/api-keys", {
    method: "POST",
    body: JSON.stringify({
      name,
      ...(expiresInDays !== undefined
        ? { expiresInDays }
        : {}),
    }),
  });
}

export async function revokeApiKey(
  id: string
) {
  return apiRequest<{
    success: boolean;
    data: { revoked: boolean };
  }>(
    `/settings/api-keys/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}
