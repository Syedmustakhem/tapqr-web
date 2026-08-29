"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import StatCard from "@/components/dashboard/stat-card";
import QrCard from "@/components/dashboard/qr-card";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentScans from "@/components/dashboard/recent-scans";

import { apiRequest, ApiError } from "@/lib/api";
import {
  AuthUser,
  getAccessToken,
  saveUser,
} from "@/lib/auth";

interface MeResponse {
  success?: boolean;
  message?: string;
  code?: string;

  data?: AuthUser;

  user?: AuthUser;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response =
          await apiRequest<MeResponse>(
            "/auth/me",
            {
              method: "GET",
            }
          );

        const currentUser =
          response?.data ??
          response?.user;

        if (!currentUser) {
          throw new Error(
            "Unable to load your account."
          );
        }

        if (!mounted) {
          return;
        }

        setUser(currentUser);

        saveUser(currentUser);
      } catch (err) {
        if (!mounted) {
          return;
        }

        if (
          err instanceof ApiError &&
          err.status === 401
        ) {
          router.replace("/login");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your account."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-7">
        {/* Welcome skeleton */}
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-7 w-40 rounded-full bg-slate-100" />

            <div className="h-10 w-72 rounded-xl bg-slate-100" />

            <div className="h-5 w-full max-w-xl rounded-lg bg-slate-100" />

            <div className="h-11 w-32 rounded-xl bg-slate-100" />
          </div>
        </section>

        {/* Stats skeleton */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-[22px] bg-white shadow-sm" />
          <div className="h-32 animate-pulse rounded-[22px] bg-white shadow-sm" />
        </section>

        {/* Content skeleton */}
        <div className="h-28 animate-pulse rounded-[22px] bg-white shadow-sm" />

        <div className="h-64 animate-pulse rounded-[28px] bg-white shadow-sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            !
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Try again
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const firstName =
    user.fullName?.trim().split(" ")[0] ||
    "there";

  return (
    <div className="space-y-7">
      {/* =========================================================
          WELCOME
      ========================================================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-violet-100/40 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />

              Workspace overview
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Good morning,{" "}
              {firstName} 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Welcome back to TapQR. Manage
              your digital identity, QR codes,
              business information and analytics
              from one workspace.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {user.email && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                  {user.email}
                </span>
              )}

              {user.phone && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                  {user.phone}
                </span>
              )}

              {user.role && (
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold capitalize text-blue-600">
                  {user.role.toLowerCase()}
                </span>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/business"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Quick setup
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* =========================================================
          ACCOUNT STATUS
      ========================================================== */}

      <section className="rounded-[22px] border border-emerald-100 bg-emerald-50/60 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-bold text-emerald-950">
              Your TapQR account is active
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-800/70">
              Your account is successfully
              authenticated. Complete your business
              profile and create your first QR code
              to get started.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================== */}

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Your business"
          value="Setup"
          subtitle="Complete your business profile"
          icon="business"
        />

        <StatCard
          title="QR scans"
          value="0"
          subtitle="Scans this month"
          icon="scans"
        />
      </section>

      {/* =========================================================
          SECURITY
      ========================================================== */}

      <section className="rounded-[22px] border border-blue-100 bg-blue-50/50 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-bold text-blue-950">
              You're securely signed in
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-800/70">
              Your TapQR session is protected with
              access and refresh tokens. If your
              access token expires, TapQR will
              automatically refresh your session.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          QR
      ========================================================== */}

      <QrCard />

      {/* =========================================================
          QUICK ACTIONS
      ========================================================== */}

      <QuickActions />

      {/* =========================================================
          RECENT SCANS
      ========================================================== */}

      <RecentScans />
    </div>
  );
}