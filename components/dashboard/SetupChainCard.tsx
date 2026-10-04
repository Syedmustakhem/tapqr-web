"use client";

import Link from "next/link";

import {
  ArrowRight,
  Check,
} from "lucide-react";

import { useSetupChain } from "@/lib/setup-chain";

/*
 * Compact setup-chain progress card for the
 * dashboard overview. Hidden once the chain
 * is complete.
 */
export default function SetupChainCard() {
  const chain = useSetupChain();

  if (chain.loading || chain.complete) {
    return null;
  }

  const current = chain.steps.find(
    (s) => s.current
  );

  const percent = Math.round(
    (chain.doneCount / chain.steps.length) *
      100
  );

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
            Getting started
          </p>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight">
            {chain.doneCount} of{" "}
            {chain.steps.length}{" "}
            steps complete
          </h2>

          <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
              style={{
                width: `${percent}%`,
              }}
            />
          </div>

          {current && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Up next:{" "}
              <span className="font-bold text-white">
                {current.title}
              </span>
            </p>
          )}
        </div>

        <Link
          href="/dashboard/getting-started"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-slate-950 transition hover:bg-slate-100"
        >
          Continue setup
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
