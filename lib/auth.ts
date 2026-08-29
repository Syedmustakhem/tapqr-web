export type AuthUser = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    "tapqr_access_token"
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    "tapqr_refresh_token"
  );
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value =
    localStorage.getItem("tapqr_user");

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function saveTokens(
  accessToken: string,
  refreshToken?: string
) {
  localStorage.setItem(
    "tapqr_access_token",
    accessToken
  );

  if (refreshToken) {
    localStorage.setItem(
      "tapqr_refresh_token",
      refreshToken
    );
  }
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(
    "tapqr_user",
    JSON.stringify(user)
  );
}

export function saveSession(data: {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: AuthUser;
  };
}) {
  const accessToken =
    data.accessToken ??
    data.data?.accessToken;

  const refreshToken =
    data.refreshToken ??
    data.data?.refreshToken;

  const user =
    data.user ??
    data.data?.user;

  if (accessToken) {
    saveTokens(
      accessToken,
      refreshToken
    );
  }

  if (user) {
    saveUser(user);
  }
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    "tapqr_access_token"
  );

  localStorage.removeItem(
    "tapqr_refresh_token"
  );

  localStorage.removeItem(
    "tapqr_user"
  );
}

/*
 * Backward-compatible alias.
 * api.ts currently uses clearTokens().
 */
export function clearTokens() {
  clearSession();
}

export function isAuthenticated() {
  return !!getAccessToken();
}