"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Crown,
  Sparkles,
  X,
} from "lucide-react";

import {
  getBillingStatus,
} from "@/lib/billing";

/* -------------------------------------------------------------------------- */
/* Show on EVERY login: the login page stamps tapqr_last_login_at on       */
/* every successful sign-in. The banner appears when a login happened       */
/* after the banner was last shown — once per login, never on refresh.     */
/* -------------------------------------------------------------------------- */

const LAST_LOGIN_KEY =
  "tapqr_last_login_at";

const LAST_SHOWN_KEY =
  "tapqr_pro_banner_last_shown";

function shouldShow(): boolean {
  try {
    const lastLogin = Number(
      window.localStorage.getItem(
        LAST_LOGIN_KEY
      ) || 0
    );

    const lastShown = Number(
      window.localStorage.getItem(
        LAST_SHOWN_KEY
      ) || 0
    );

    return (
      lastLogin > 0 &&
      lastLogin > lastShown
    );
  } catch {
    return false;
  }
}

function markShown(): void {
  try {
    window.localStorage.setItem(
      LAST_SHOWN_KEY,
      String(Date.now())
    );
  } catch {
    /* Storage unavailable — show again next login. */
  }
}

/* -------------------------------------------------------------------------- */
/* Banner                                                                     */
/* -------------------------------------------------------------------------- */

export default function ProUpsellBanner() {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!shouldShow()) {
      return;
    }

    /*
     * Never upsell users who already pay.
     * If the status call fails, stay silent —
     * a banner must never break the dashboard.
     */

    void getBillingStatus()
      .then((res) => {
        if (cancelled) {
          return;
        }

        const code =
          res?.data?.plan?.code ??
          "FREE";

        if (code === "FREE") {
          markShown();
          setVisible(true);
        }
      })
      .catch(() => {
        /* Silent — try again next login. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-[0_15px_40px_rgba(124,58,237,0.25)] sm:p-7">
      {/* Decorative sparkles */}
      <Sparkles className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-white/10" />
      <Sparkles className="pointer-events-none absolute bottom-6 right-24 h-10 w-10 text-white/10" />

      <button
        type="button"
        aria-label="Dismiss"
        onClick={() =>
          setVisible(false)
        }
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Crown className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            You&apos;re on Free —
            unlock TapQR Pro
          </h2>

          <p className="mt-1 text-sm leading-6 text-white/80">
            25 QR profiles, smart
            rules, your own branding,
            advanced analytics, and
            TapQR Agent OS — from
            just ₹199/month.
          </p>
        </div>

        <Link
          href="/dashboard/payments"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          See Pro plans
        </Link>
      </div>
    </section>
  );
}
