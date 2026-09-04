import { apiRequest } from "@/lib/api";

export type NotificationType =
  | "SECURITY"
  | "AUTH"
  | "BUSINESS"
  | "QR"
  | "STAFF"
  | "REVIEW"
  | "ANALYTICS"
  | "BILLING"
  | "SYSTEM";

export type NotificationStatus =
  | "PENDING"
  | "SENDING"
  | "SENT"
  | "FAILED"
  | "SKIPPED";

export type NotificationChannel =
  | "EMAIL"
  | "WHATSAPP";

export type NotificationDelivery = {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  providerMessageId?: string | null;
  providerResponse?: unknown;
  attempts: number;
  lastAttemptAt?: string | null;
  sentAt?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Notification = {
  id: string;
  userId: string;
  businessId?: string | null;

  type: NotificationType;

  title: string;
  message: string;

  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;

  eventKey?: string | null;

  createdAt: string;
  expiresAt?: string | null;

  readAt?: string | null;

  deliveries?: NotificationDelivery[];
};

export type NotificationListResponse = {
  success?: boolean;
  message?: string;
  data?: {
    notifications?: Notification[];
    items?: Notification[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

export type NotificationUnreadResponse = {
  success?: boolean;
  message?: string;
  data?: {
    count?: number;
    unreadCount?: number;
    readTrackingAvailable?: boolean;
  };
};

export type NotificationSingleResponse = {
  success?: boolean;
  message?: string;
  data?: Notification;
};

export type NotificationRetryResponse = {
  success?: boolean;
  message?: string;
  data?: {
    notificationId?: string;
    retried?: number;
    deliveries?: NotificationDelivery[];
  };
};

function extractData<T>(
  response: T & {
    data?: unknown;
  }
) {
  return response?.data;
}

/**
 * Get notifications for the authenticated user.
 */
export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}) {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set(
      "page",
      String(params.page)
    );
  }

  if (params?.limit) {
    searchParams.set(
      "limit",
      String(params.limit)
    );
  }

  if (params?.unreadOnly !== undefined) {
    searchParams.set(
      "unreadOnly",
      String(params.unreadOnly)
    );
  }

  if (params?.type) {
    searchParams.set(
      "type",
      params.type
    );
  }

  const query = searchParams.toString();

  return apiRequest<NotificationListResponse>(
    `/notifications${query ? `?${query}` : ""}`
  );
}

/**
 * Get unread notification count.
 */
export async function getUnreadNotificationCount() {
  return apiRequest<NotificationUnreadResponse>(
    "/notifications/unread-count"
  );
}

/**
 * Get a single notification.
 */
export async function getNotification(
  id: string
) {
  return apiRequest<NotificationSingleResponse>(
    `/notifications/${id}`
  );
}

/**
 * Mark one notification as read.
 */
export async function markNotificationRead(
  id: string
) {
  return apiRequest<NotificationSingleResponse>(
    `/notifications/${id}/read`,
    {
      method: "POST",
    }
  );
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsRead() {
  return apiRequest<{
    success?: boolean;
    message?: string;
    data?: {
      updated?: number;
    };
  }>("/notifications/read-all", {
    method: "POST",
  });
}

/**
 * Retry failed notification deliveries.
 */
export async function retryNotification(
  id: string
) {
  return apiRequest<NotificationRetryResponse>(
    `/notifications/${id}/retry`,
    {
      method: "POST",
    }
  );
}

/**
 * Safely extract notifications from different
 * response envelope shapes.
 */
export function extractNotifications(
  response: NotificationListResponse
): Notification[] {
  const data = response?.data;

  if (!data) {
    return [];
  }

  if (Array.isArray(data.notifications)) {
    return data.notifications;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

/**
 * Safely extract unread count.
 */
export function extractUnreadCount(
  response: NotificationUnreadResponse
): number {
  const data = response?.data;

  if (!data) {
    return 0;
  }

  return Number(
    data.count ??
      data.unreadCount ??
      0
  );
}

/**
 * Human-friendly relative time.
 */
export function formatNotificationTime(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diff =
    Date.now() - date.getTime();

  const seconds = Math.floor(
    diff / 1000
  );

  if (seconds < 30) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
    }
  );
}