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

/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  /*
   * Prevent multiple simultaneous refresh requests.
   *
   * Example:
   * Request A -> 401
   * Request B -> 401
   * Request C -> 401
   *
   * All three wait for the same refresh request.
   */
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken,
            }),
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
          clearTokens();
          return null;
        }

        const newAccessToken =
          body?.data?.accessToken ??
          body?.accessToken;

        if (!newAccessToken) {
          clearTokens();
          return null;
        }

        /*
         * Only replace the access token.
         * Existing refresh token remains untouched.
         */
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

/*
|--------------------------------------------------------------------------
| PERFORM REQUEST
|--------------------------------------------------------------------------
*/

async function performRequest<T>(
  endpoint: string,
  options: RequestInit,
  token?: string | null
): Promise<T> {
  const headers = new Headers(
    options.headers
  );

  /*
   * Only set JSON content type when a body exists.
   * This keeps GET requests cleaner.
   */
  if (options.body) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

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

/*
|--------------------------------------------------------------------------
| API REQUEST
|--------------------------------------------------------------------------
*/

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = getAccessToken();

  try {
    return await performRequest<T>(
      endpoint,
      options,
      accessToken
    );
  } catch (error) {
    /*
     * Only handle 401s.
     */
    if (
      !(error instanceof ApiError) ||
      error.status !== 401
    ) {
      throw error;
    }

    /*
     * IMPORTANT:
     * If this request wasn't authenticated in
     * the first place, don't attempt token refresh.
     *
     * This prevents public endpoints such as:
     * /auth/login
     * /auth/identify
     * /auth/email/send-otp
     * /auth/whatsapp/send-otp
     *
     * from incorrectly triggering a session redirect.
     */
    if (!accessToken) {
      throw error;
    }

    const newAccessToken =
      await refreshAccessToken();

    /*
     * Refresh failed -> user session is no longer valid.
     */
    if (!newAccessToken) {
      if (
        typeof window !== "undefined"
      ) {
        window.location.href = "/login";
      }

      throw error;
    }

    /*
     * Retry the original request exactly once
     * with the new access token.
     */
    return performRequest<T>(
      endpoint,
      options,
      newAccessToken
    );
  }
}