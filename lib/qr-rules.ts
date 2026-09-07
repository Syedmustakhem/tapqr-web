import { apiRequest } from "@/lib/api";

/* ============================================================
   ENUMS
============================================================ */

export type QRRuleStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "ARCHIVED";

export const QRRuleStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  EXPIRED: "EXPIRED",
  ARCHIVED: "ARCHIVED",
} as const;


export type QRRuleLogic = "AND" | "OR";

export const QRRuleLogic = {
  AND: "AND",
  OR: "OR",
} as const;


export type QRRuleConditionType =
  | "TIME"
  | "DATE"
  | "DAY_OF_WEEK"
  | "BUSINESS_HOURS"
  | "DEVICE"
  | "OPERATING_SYSTEM"
  | "BROWSER"
  | "LANGUAGE"
  | "COUNTRY"
  | "STATE"
  | "CITY"
  | "GEO_RADIUS"
  | "REFERRER"
  | "UTM_SOURCE"
  | "UTM_MEDIUM"
  | "UTM_CAMPAIGN"
  | "UTM_TERM"
  | "UTM_CONTENT"
  | "QR_SOURCE"
  | "QR_PLACEMENT"
  | "QR_LOCATION"
  | "CAMPAIGN"
  | "SCAN_COUNT"
  | "VISITOR_TYPE"
  | "CUSTOMER_STATE"
  | "CUSTOMER_SEGMENT"
  | "AUTHENTICATION_STATE"
  | "BUSINESS_STATE"
  | "CATALOG_STATE"
  | "PRODUCT_AVAILABILITY"
  | "SUBSCRIPTION_PLAN"
  | "CUSTOM";

export const QRRuleConditionType = {
  TIME: "TIME",
  DATE: "DATE",
  DAY_OF_WEEK: "DAY_OF_WEEK",
  BUSINESS_HOURS: "BUSINESS_HOURS",
  DEVICE: "DEVICE",
  OPERATING_SYSTEM: "OPERATING_SYSTEM",
  BROWSER: "BROWSER",
  LANGUAGE: "LANGUAGE",
  COUNTRY: "COUNTRY",
  STATE: "STATE",
  CITY: "CITY",
  GEO_RADIUS: "GEO_RADIUS",
  REFERRER: "REFERRER",
  UTM_SOURCE: "UTM_SOURCE",
  UTM_MEDIUM: "UTM_MEDIUM",
  UTM_CAMPAIGN: "UTM_CAMPAIGN",
  UTM_TERM: "UTM_TERM",
  UTM_CONTENT: "UTM_CONTENT",
  QR_SOURCE: "QR_SOURCE",
  QR_PLACEMENT: "QR_PLACEMENT",
  QR_LOCATION: "QR_LOCATION",
  CAMPAIGN: "CAMPAIGN",
  SCAN_COUNT: "SCAN_COUNT",
  VISITOR_TYPE: "VISITOR_TYPE",
  CUSTOMER_STATE: "CUSTOMER_STATE",
  CUSTOMER_SEGMENT: "CUSTOMER_SEGMENT",
  AUTHENTICATION_STATE: "AUTHENTICATION_STATE",
  BUSINESS_STATE: "BUSINESS_STATE",
  CATALOG_STATE: "CATALOG_STATE",
  PRODUCT_AVAILABILITY: "PRODUCT_AVAILABILITY",
  SUBSCRIPTION_PLAN: "SUBSCRIPTION_PLAN",
  CUSTOM: "CUSTOM",
} as const;


export type QRRuleOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "IN"
  | "NOT_IN"
  | "BETWEEN"
  | "NOT_BETWEEN"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "EXISTS"
  | "NOT_EXISTS";

export const QRRuleOperator = {
  EQUALS: "EQUALS",
  NOT_EQUALS: "NOT_EQUALS",
  GREATER_THAN: "GREATER_THAN",
  GREATER_THAN_OR_EQUAL: "GREATER_THAN_OR_EQUAL",
  LESS_THAN: "LESS_THAN",
  LESS_THAN_OR_EQUAL: "LESS_THAN_OR_EQUAL",
  IN: "IN",
  NOT_IN: "NOT_IN",
  BETWEEN: "BETWEEN",
  NOT_BETWEEN: "NOT_BETWEEN",
  CONTAINS: "CONTAINS",
  NOT_CONTAINS: "NOT_CONTAINS",
  STARTS_WITH: "STARTS_WITH",
  ENDS_WITH: "ENDS_WITH",
  EXISTS: "EXISTS",
  NOT_EXISTS: "NOT_EXISTS",
} as const;


export type QRRuleActionType =
  | "EXPERIENCE"
  | "REDIRECT"
  | "CATALOG"
  | "MENU"
  | "SERVICES"
  | "PRODUCTS"
  | "CONTACT"
  | "CAMPAIGN"
  | "CUSTOM";

export const QRRuleActionType = {
  EXPERIENCE: "EXPERIENCE",
  REDIRECT: "REDIRECT",
  CATALOG: "CATALOG",
  MENU: "MENU",
  SERVICES: "SERVICES",
  PRODUCTS: "PRODUCTS",
  CONTACT: "CONTACT",
  CAMPAIGN: "CAMPAIGN",
  CUSTOM: "CUSTOM",
} as const;


export type QRRuleMatchStatus =
  | "MATCHED"
  | "NOT_MATCHED"
  | "FALLBACK"
  | "ERROR";

export const QRRuleMatchStatus = {
  MATCHED: "MATCHED",
  NOT_MATCHED: "NOT_MATCHED",
  FALLBACK: "FALLBACK",
  ERROR: "ERROR",
} as const;


/* ============================================================
   CONDITION
============================================================ */

export type QRRuleCondition = {
  id?: string;
  type: QRRuleConditionType;
  operator: QRRuleOperator;
  value?: unknown;
  value2?: unknown;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
};

/* ============================================================
   CONDITION GROUP
============================================================ */

export type QRRuleConditionGroup = {
  id?: string;
  logic: QRRuleLogic;
  conditions: QRRuleCondition[];
  children?: QRRuleConditionGroup[];
  sortOrder?: number;
};

/* ============================================================
   ACTION
============================================================ */

export type QRRuleAction = {
  type: QRRuleActionType;
  value?: string | null;
};

/* ============================================================
   RULE
============================================================ */

export type QRRule = {
  id: string;
  qrCodeId: string;

  name: string;
  description?: string | null;

  status: QRRuleStatus;

  priority: number;
  logic: QRRuleLogic;

  actionType?: QRRuleActionType | null;
  actionValue?: string | null;

  fallbackActionType?: QRRuleActionType | null;
  fallbackActionValue?: string | null;

  conditions?: QRRuleCondition[];
  groups?: QRRuleConditionGroup[];

  matchCount?: number;
  lastMatchedAt?: string | null;

  publishedVersion?: number | null;

  createdAt?: string;
  updatedAt?: string;
};

/* ============================================================
   RULE MATCH
============================================================ */

export type QRRuleMatch = {
  id: string;

  qrCodeId: string;

  ruleId?: string | null;
  ruleVersion?: number | null;

  status: QRRuleMatchStatus;

  actionType?: QRRuleActionType | null;
  actionValue?: string | null;

  device?: string | null;
  operatingSystem?: string | null;
  browser?: string | null;

  country?: string | null;
  state?: string | null;
  city?: string | null;

  language?: string | null;
  referrer?: string | null;

  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;

  sourceType?: string | null;

  visitorKey?: string | null;

  matchedAt: string;
};

/* ============================================================
   API RESPONSES
============================================================ */

export type QRRulesResponse = {
  success?: boolean;
  message?: string;
  data?: QRRule[];
};

export type QRRuleResponse = {
  success?: boolean;
  message?: string;
  data?: QRRule;
};

export type QRRuleMatchesResponse = {
  success?: boolean;
  message?: string;
  data?: QRRuleMatch[];
};

/* ============================================================
   CREATE / UPDATE INPUT
============================================================ */

export type CreateQRRuleInput = {
  qrCodeId: string;

  name: string;
  description?: string;

  priority?: number;

  logic?: QRRuleLogic;

  conditions?: QRRuleCondition[];

  groups?: QRRuleConditionGroup[];

  actionType: QRRuleActionType;
  actionValue?: string | null;

  fallbackActionType?: QRRuleActionType | null;
  fallbackActionValue?: string | null;

  startsAt?: string;
  endsAt?: string;
  experimentId?: string;
  status?: QRRuleStatus;
};

export type UpdateQRRuleInput = {
  name?: string;
  description?: string | null;

  priority?: number;

  logic?: QRRuleLogic;

  conditions?: QRRuleCondition[];

  groups?: QRRuleConditionGroup[];

  actionType?: QRRuleActionType;
  actionValue?: string | null;

  fallbackActionType?: QRRuleActionType | null;
  fallbackActionValue?: string | null;
};

/* ============================================================
   SIMULATOR
============================================================ */

export type QRRuleSimulationInput = {
  qrCodeId: string;

  ruleId?: string;

  device?: string;
  operatingSystem?: string;
  browser?: string;

  country?: string;
  state?: string;
  city?: string;

  language?: string;

  referrer?: string;

  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;

  sourceType?: string;
  placementLabel?: string;
  locationLabel?: string;
  campaignName?: string;

  scanCount?: number;

  visitorType?: string;
  customerState?: string;
  customerSegment?: string;

  authenticated?: boolean;

  subscriptionPlan?: string;

  timestamp?: string;
  timezone?: string;

  custom?: Record<string, unknown>;
};

export type QRRuleSimulationResult = {
  matched: boolean;

  ruleId?: string | null;
  ruleName?: string | null;

  actionType?: QRRuleActionType | null;
  actionValue?: string | null;

  fallback?: boolean;

  trace?: unknown[];
};

/* ============================================================
   CREATE RULE
============================================================ */

export async function createQRRule(
  input: CreateQRRuleInput
) {
  return apiRequest<QRRuleResponse>(
    "/qr-rules",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

/* ============================================================
   LIST RULES
============================================================ */

export async function getQRRules(
  qrCodeId: string
) {
  return apiRequest<QRRulesResponse>(
    `/qr-rules/qr/${encodeURIComponent(qrCodeId)}`
  );
}

/* ============================================================
   GET RULE
============================================================ */

export async function getQRRule(
  ruleId: string
) {
  return apiRequest<QRRuleResponse>(
    `/qr-rules/${encodeURIComponent(ruleId)}`
  );
}

/* ============================================================
   UPDATE RULE
============================================================ */

export async function updateQRRule(
  ruleId: string,
  input: UpdateQRRuleInput
) {
  return apiRequest<QRRuleResponse>(
    `/qr-rules/${encodeURIComponent(ruleId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

/* ============================================================
   DELETE RULE
============================================================ */

export async function deleteQRRule(
  ruleId: string
) {
  return apiRequest<{
    success?: boolean;
    message?: string;
  }>(
    `/qr-rules/${encodeURIComponent(ruleId)}`,
    {
      method: "DELETE",
    }
  );
}

/* ============================================================
   ACTIVATE
============================================================ */

export async function activateQRRule(
  ruleId: string
) {
  return apiRequest<QRRuleResponse>(
    `/qr-rules/${encodeURIComponent(ruleId)}/activate`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   PAUSE
============================================================ */

export async function pauseQRRule(
  ruleId: string
) {
  return apiRequest<QRRuleResponse>(
    `/qr-rules/${encodeURIComponent(ruleId)}/pause`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   PUBLISH
============================================================ */

export async function publishQRRule(
  ruleId: string
) {
  return apiRequest<QRRuleResponse>(
    `/qr-rules/${encodeURIComponent(ruleId)}/publish`,
    {
      method: "POST",
    }
  );
}

/* ============================================================
   ROLLBACK
============================================================ */

export async function rollbackQRRule(
  ruleId: string,
  version: number
) {
  return apiRequest<QRRuleResponse>(
    `/qr-rules/${encodeURIComponent(ruleId)}/rollback`,
    {
      method: "POST",
      body: JSON.stringify({
        version,
      }),
    }
  );
}

/* ============================================================
   RULE MATCHES
============================================================ */

export async function getQRRuleMatches(
  qrCodeId: string,
  params?: {
    ruleId?: string;
    status?: QRRuleMatchStatus;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }
) {
  const search = new URLSearchParams();

  if (params?.ruleId) {
    search.set("ruleId", params.ruleId);
  }

  if (params?.status) {
    search.set("status", params.status);
  }

  if (params?.from) {
    search.set("from", params.from);
  }

  if (params?.to) {
    search.set("to", params.to);
  }

  if (params?.limit !== undefined) {
    search.set("limit", String(params.limit));
  }

  if (params?.offset !== undefined) {
    search.set("offset", String(params.offset));
  }

  const query = search.toString();

  return apiRequest<QRRuleMatchesResponse>(
    `/qr-rules/qr/${encodeURIComponent(qrCodeId)}/matches${
      query ? `?${query}` : ""
    }`
  );
}

/* ============================================================
   SIMULATE
============================================================ */

export async function simulateQRRule(
  input: QRRuleSimulationInput
) {
  return apiRequest<{
    success?: boolean;
    message?: string;
    data?: QRRuleSimulationResult;
  }>(
    "/qr-rules/simulate",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}