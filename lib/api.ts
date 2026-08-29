import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.tapqr.shop/api";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

let refreshPromise:
  | Promise<string | null>
  | null = null;

async function refreshAccessToken(): Promise<
  string | null
> {
  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              refreshToken,
            }),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          clearTokens();
          return null;
        }

        const data =
          await response.json();

        const newAccessToken =
          data?.data?.accessToken ??
          data?.accessToken;

        if (!newAccessToken) {
          clearTokens();
          return null;
        }

        saveTokens(newAccessToken);

        return newAccessToken;
      } catch {
        clearTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function performRequest<T>(
  endpoint: string,
  options: RequestInit,
  token?: string | null
): Promise<T> {
  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
      cache: "no-store",
    }
  );

  let body: any = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiError(
      body?.message ||
        "Something went wrong.",
      response.status,
      body?.code
    );
  }

  return body as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken =
    getAccessToken();

  try {
    return await performRequest<T>(
      endpoint,
      options,
      accessToken
    );
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.status !== 401
    ) {
      throw error;
    }

    const newAccessToken =
      await refreshAccessToken();

    if (!newAccessToken) {
      if (
        typeof window !==
        "undefined"
      ) {
        window.location.href =
          "/login";
      }

      throw error;
    }

    return performRequest<T>(
      endpoint,
      options,
      newAccessToken
    );
  }
}