"use client";

import Link from "next/link";

import { Sparkles } from "lucide-react";

/*
 * Upgrade prompt for paywalled features.
 *
 * Gated backend endpoints answer 403 with
 * code "UPGRADE_REQUIRED" — render this
 * instead of a dead-end error.
 *
 * Usage:
 *
 *   import { isUpgradeRequired } from "@/lib/billing";
 *   import UpgradePrompt from "@/components/billing/UpgradePrompt";
 *
 *   try {
 *     ...
 *   } catch (err) {
 *     if (isUpgradeRequired(err)) {
 *       return <UpgradePrompt feature="Smart Rules" />;
 *     }
 *     throw err;
 *   }
 */

export default function UpgradePrompt({
  feature,
  compact = false,
}: {
  feature: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Sparkles className="h-4 w-4" />
        </span>

        <div>
          <p className="text-sm font-bold text-slate-900">
            {feature} is a Pro
            feature
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Upgrade to unlock{" "}
            {feature.toLowerCase()}{" "}
            and everything else in
            Pro.
          </p>
        </div>
      </div>

      <Link
        href="/pricing"
        className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
      >
        Upgrade
      </Link>
    </div>
  );
}
