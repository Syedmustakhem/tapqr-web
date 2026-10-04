"use client";

import ReferralWidget from "@/components/billing/ReferralWidget";

/*
 * ============================================================
 * REFER & EARN PAGE
 * ============================================================
 *
 * Reached from the sidebar "Refer & Earn" item. Shows the
 * full referral widget: code + link + QR, share actions,
 * and live stats.
 */

export default function ReferPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Refer &amp; Earn
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Invite other businesses to TapQR —
          every one that subscribes to Pro
          earns you 30 days of Pro free,
          and them a 45-day Pro bonus.
        </p>
      </div>

      <ReferralWidget />
    </div>
  );
}
