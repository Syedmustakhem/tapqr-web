"use client";

import type { ReactNode } from "react";

import { Lock } from "lucide-react";

/*
 * Locked overlay for Pro-only panels on the
 * free plan.
 *
 * Free members see the panel dimmed with a
 * centered "Upgrade to Pro" call-to-action
 * instead of toggling something and getting
 * a confusing error afterwards.
 *
 *   <ProLock
 *     locked={!isPro}
 *     feature="Review Funnel"
 *     onUpgrade={() =>
 *       setUpgradeFeature("Review Funnel")
 *     }
 *   >
 *     <Panel …>…</Panel>
 *   </ProLock>
 */

export default function ProLock({
  locked,
  feature,
  onUpgrade,
  children,
}: {
  locked: boolean;
  feature: string;
  onUpgrade: () => void;
  children: ReactNode;
}) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-50 blur-[1px]"
      >
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 p-4">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white/95 px-6 py-5 text-center shadow-xl backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Lock className="h-5 w-5" />
          </span>

          <p className="mt-3 text-sm font-extrabold text-slate-900">
            {feature} is Pro
          </p>

          <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
            Upgrade to unlock{" "}
            {feature.toLowerCase()}{" "}
            for your business.
          </p>

          <button
            type="button"
            onClick={onUpgrade}
            className="mt-3 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
