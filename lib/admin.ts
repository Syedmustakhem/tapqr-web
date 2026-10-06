import { apiRequest } from "./api";

/*
 * ============================================================
 * SUPER ADMIN API
 * ============================================================
 */

export type AdminOverview = {
  users: number;
  proUsers: number;
  businesses: number;
  activeTrials: number;
  activeSubscriptions: number;
  revenuePaise: number;
  paymentCount: number;
  scansToday: number;
  openTickets: number;
  openReports: number;
  signups: Array<{
    day: string;
    count: number;
  }>;
  revenue: Array<{
    month: string;
    totalPaise: number;
  }>;
};

export type AdminListResponse<T> = {
  success: boolean;
  data: {
    total: number;
    users?: T[];
    businesses?: T[];
    subscriptions?: T[];
    payments?: T[];
    trials?: T[];
    referrals?: T[];
    reports?: T[];
    tickets?: T[];
    entries?: T[];
  };
};

function qs(params: {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}) {
  const p = new URLSearchParams();
  if (params.search)
    p.set("search", params.search);
  if (params.page)
    p.set("page", String(params.page));
  if (params.limit)
    p.set("limit", String(params.limit));
  if (params.status)
    p.set("status", params.status);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function adminGetOverview() {
  return apiRequest<{
    success: boolean;
    data: AdminOverview;
  }>("/admin/overview");
}

export async function adminListUsers(
  params: {
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      users: Array<{
        id: string;
        fullName: string;
        email: string | null;
        phone: string | null;
        role: string;
        isActive: boolean;
        proUntil: string | null;
        createdAt: string;
        _count: {
          businesses: number;
        };
      }>;
    };
  }>(`/admin/users${qs(params)}`);
}

export async function adminGetUser(
  id: string
) {
  return apiRequest<{
    success: boolean;
    data: any;
  }>(
    `/admin/users/${encodeURIComponent(id)}`
  );
}

export async function adminSuspendUser(
  id: string,
  reason?: string
) {
  return apiRequest<{
    success: boolean;
    data: unknown;
  }>(
    `/admin/users/${encodeURIComponent(id)}/suspend`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
}

export async function adminUnsuspendUser(
  id: string
) {
  return apiRequest<{
    success: boolean;
    data: unknown;
  }>(
    `/admin/users/${encodeURIComponent(id)}/unsuspend`,
    { method: "POST" }
  );
}

export async function adminGrantPro(
  id: string,
  days: number,
  reason?: string
) {
  return apiRequest<{
    success: boolean;
    data: { proUntil: string };
  }>(
    `/admin/users/${encodeURIComponent(id)}/grant-pro`,
    {
      method: "POST",
      body: JSON.stringify({
        days,
        reason,
      }),
    }
  );
}

export async function adminExtendTrial(
  id: string,
  days: number,
  reason?: string
) {
  return apiRequest<{
    success: boolean;
    data: { endsAt: string };
  }>(
    `/admin/users/${encodeURIComponent(id)}/extend-trial`,
    {
      method: "POST",
      body: JSON.stringify({
        days,
        reason,
      }),
    }
  );
}

export async function adminListBusinesses(
  params: {
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      businesses: Array<{
        id: string;
        name: string;
        status: string;
        createdAt: string;
        owner: {
          fullName: string;
          email: string | null;
        };
        _count: { qrCodes: number };
      }>;
    };
  }>(`/admin/businesses${qs(params)}`);
}

export async function adminListSubscriptions(
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      subscriptions: Array<{
        id: string;
        planCode: string;
        status: string;
        currentPeriodEnd: string | null;
        cancelAtPeriodEnd: boolean;
        createdAt: string;
        user: {
          fullName: string;
          email: string | null;
        };
      }>;
    };
  }>(`/admin/subscriptions${qs(params)}`);
}

export async function adminListPayments(
  params: {
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      payments: Array<{
        id: string;
        amountPaise: number;
        currency: string;
        status: string;
        razorpayPaymentId: string | null;
        createdAt: string;
        user: {
          fullName: string;
          email: string | null;
        };
      }>;
    };
  }>(`/admin/payments${qs(params)}`);
}

export async function adminListTrials(
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      trials: Array<{
        id: string;
        status: string;
        startsAt: string;
        endsAt: string;
        phone: string | null;
        user: {
          fullName: string;
          email: string | null;
        };
      }>;
    };
  }>(`/admin/trials${qs(params)}`);
}

export async function adminListReferrals(
  params: {
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      referrals: Array<{
        id: string;
        status: string;
        createdAt: string;
        referrer: {
          fullName: string;
          email: string | null;
        };
        referee: {
          fullName: string;
          email: string | null;
        } | null;
      }>;
    };
  }>(`/admin/referrals${qs(params)}`);
}

export async function adminFraudSignals() {
  return apiRequest<{
    success: boolean;
    data: Array<{
      phone: string;
      count: number;
    }>;
  }>("/admin/fraud-signals");
}

export async function adminListReviewReports(
  params: {
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      reports: Array<{
        id: string;
        reason: string;
        details: string | null;
        createdAt: string;
        review: {
          id: string;
          rating: number;
          text: string | null;
          business: {
            name: string;
          };
        };
      }>;
    };
  }>(`/admin/review-reports${qs(params)}`);
}

export async function adminResolveReport(
  reportId: string,
  action: "dismiss" | "remove_review"
) {
  return apiRequest<{
    success: boolean;
    data: unknown;
  }>(
    `/admin/review-reports/${encodeURIComponent(reportId)}/resolve`,
    {
      method: "POST",
      body: JSON.stringify({ action }),
    }
  );
}

export async function adminListPlans() {
  return apiRequest<{
    success: boolean;
    data: Array<{
      code: string;
      name: string;
      pricePaise: number;
      currency: string;
      interval: string | null;
      maxQrs: number;
      maxBusinesses: number;
      maxSeats: number;
      features: string[];
      isActive: boolean;
    }>;
  }>("/admin/plans");
}

export async function adminUpdatePlan(
  code: string,
  data: {
    name?: string;
    pricePaise?: number;
    maxQrs?: number;
    maxBusinesses?: number;
    maxSeats?: number;
    features?: string[];
    isActive?: boolean;
  }
) {
  return apiRequest<{
    success: boolean;
    data: unknown;
  }>(
    `/admin/plans/${encodeURIComponent(code)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function adminListFlags() {
  return apiRequest<{
    success: boolean;
    data: Array<{
      key: string;
      enabled: boolean;
      description: string | null;
      updatedAt: string;
    }>;
  }>("/admin/flags");
}

export async function adminUpsertFlag(
  key: string,
  enabled: boolean,
  description?: string
) {
  return apiRequest<{
    success: boolean;
    data: unknown;
  }>("/admin/flags", {
    method: "POST",
    body: JSON.stringify({
      key,
      enabled,
      description,
    }),
  });
}

export async function adminListTickets(
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      tickets: Array<{
        id: string;
        subject: string;
        status: string;
        createdAt: string;
        user: {
          fullName: string;
          email: string | null;
        };
      }>;
    };
  }>(`/admin/support/tickets${qs(params)}`);
}

export async function adminGetTicket(
  ticketId: string
) {
  return apiRequest<{
    success: boolean;
    data: any;
  }>(
    `/admin/support/tickets/${encodeURIComponent(ticketId)}`
  );
}

export async function adminReplyTicket(
  ticketId: string,
  reply: string,
  close?: boolean
) {
  return apiRequest<{
    success: boolean;
    data: unknown;
  }>(
    `/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`,
    {
      method: "POST",
      body: JSON.stringify({
        reply,
        close,
      }),
    }
  );
}

export async function adminBroadcast(input: {
  channel: "whatsapp" | "email";
  segment: "all" | "pro" | "trial" | "free";
  message: string;
}) {
  return apiRequest<{
    success: boolean;
    data: {
      sent: number;
      failed: number;
    };
  }>("/admin/broadcast", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function adminListAuditLog(
  params: {
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<{
    success: boolean;
    data: {
      total: number;
      entries: Array<{
        id: string;
        adminEmail: string;
        action: string;
        targetType: string | null;
        targetId: string | null;
        createdAt: string;
      }>;
    };
  }>(`/admin/audit-log${qs(params)}`);
}

/** User-facing: open a support ticket. */
export async function createSupportTicket(
  subject: string,
  message: string
) {
  return apiRequest<{
    success: boolean;
    data: { id: string };
  }>("/admin/support/tickets", {
    method: "POST",
    body: JSON.stringify({
      subject,
      message,
    }),
  });
}
