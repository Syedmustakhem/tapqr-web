"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  getAccessToken,
  getRefreshToken,
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
    const accessToken =
      getAccessToken();

    const refreshToken =
      getRefreshToken();

    if (
      !accessToken &&
      !refreshToken
    ) {
      window.location.replace(
        "/login"
      );

      return;
    }

    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
            T
          </div>

          <p className="text-sm font-medium text-slate-400">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}