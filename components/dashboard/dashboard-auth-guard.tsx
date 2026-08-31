"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  getAccessToken,
  getRefreshToken,
  clearSession,
} from "@/lib/auth";

interface DashboardAuthGuardProps {
  children: ReactNode;
}

export default function DashboardAuthGuard({
  children,
}: DashboardAuthGuardProps) {
  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const accessToken =
        getAccessToken();

      const refreshToken =
        getRefreshToken();

      /*
       * No session at all.
       */
      if (!accessToken && !refreshToken) {
        window.location.replace("/login");
        return;
      }

      /*
       * An access token exists.
       *
       * Let the dashboard/API layer validate it.
       * If it has expired, apiRequest() will attempt
       * to refresh it using the refresh token.
       */
      if (accessToken) {
        if (mounted) {
          setChecking(false);
        }
        return;
      }

      /*
       * No access token but refresh token exists.
       *
       * Try to restore the session before showing
       * the private dashboard.
       */
      if (refreshToken) {
        try {
          const response =
            await fetch(
              `${
                process.env
                  .NEXT_PUBLIC_API_URL ||
                "https://api.tapqr.shop/api"
              }/auth/refresh`,
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
            throw new Error(
              "Session expired."
            );
          }

          const data =
            await response.json();

          const newAccessToken =
            data?.data?.accessToken ??
            data?.accessToken;

          if (!newAccessToken) {
            throw new Error(
              "Unable to restore session."
            );
          }

          /*
           * Import dynamically so the guard only
           * loads the session writer when required.
           */
          const { saveTokens } =
            await import("@/lib/auth");

          saveTokens(newAccessToken);

          if (mounted) {
            setChecking(false);
          }
        } catch {
          clearSession();

          if (mounted) {
            window.location.replace(
              "/login"
            );
          }
        }

        return;
      }

      if (mounted) {
        setChecking(false);
      }
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg">
            T
          </div>

          <p className="text-sm font-medium text-slate-400">
            Securely checking your session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}