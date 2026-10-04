"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  Lock,
  PartyPopper,
  Sparkles,
} from "lucide-react";

import {
  dismissSetupChain,
  useSetupChain,
  type SetupStep,
} from "@/lib/setup-chain";

/*
 * ============================================================
 * GETTING STARTED — the guided setup chain
 * ============================================================
 *
 * One strict order for every new user:
 *   Business → QR Studio → Campaigns → Go live → Pro
 *
 * Each step unlocks only when the previous one is done.
 * Progress is derived from real data (see lib/setup-chain),
 * so existing users auto-complete and never see this as
 * a blocker.
 */

const PRO_BENEFITS = [
  "Review Funnel — turn happy scanners into Google reviews",
  "Today's Specials banner on your scan page",
  "Digital Loyalty Card with stamp rewards",
  "Appointment Booking in 6 modes",
  "Scan-to-WhatsApp Ordering",
  "UPI Pay-on-Scan",
  "Pro scan analytics",
];

function StepCard({
  step,
}: {
  step: SetupStep;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-5 transition ${
        step.current
          ? "border-slate-950 shadow-lg"
          : "border-slate-200"
      } ${step.locked ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
            step.done
              ? "bg-emerald-500 text-white"
              : step.current
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {step.done ? (
            <Check className="h-5 w-5" />
          ) : step.locked ? (
            <Lock className="h-4 w-4" />
          ) : (
            step.index + 1
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              {step.title}
            </h3>
            {step.current && (
              <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Up next
              </span>
            )}
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {step.description}
          </p>

          {step.id === "pro" &&
            !step.done &&
            !step.locked && (
              <ul className="mt-3 space-y-1.5">
                {PRO_BENEFITS.map(
                  (benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-xs font-medium text-slate-600"
                    >
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      {benefit}
                    </li>
                  )
                )}
              </ul>
            )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {step.done ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Done
              </span>
            ) : step.locked ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                Complete the previous
                step to unlock
              </span>
            ) : (
              <>
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800"
                >
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                {step.id === "pro" && (
                  <DismissProButton />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {step.index < 4 && (
        <div
          aria-hidden="true"
          className="absolute -bottom-5 left-9 h-5 w-px bg-slate-200"
        />
      )}
    </div>
  );
}

function DismissProButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        dismissSetupChain();
        router.refresh();
        window.location.reload();
      }}
      className="rounded-xl px-3 py-2.5 text-xs font-bold text-slate-400 transition hover:text-slate-600"
    >
      Explore on my own
    </button>
  );
}

export default function GettingStartedPage() {
  const chain = useSetupChain();

  if (chain.loading) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </main>
    );
  }

  const percent = Math.round(
    (chain.doneCount / chain.steps.length) *
      100
  );

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-6 pb-16">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Setup chain
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
          Getting started
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Follow the steps in order —
          each one unlocks the next.
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              {chain.doneCount} of{" "}
              {chain.steps.length}{" "}
              steps complete
            </span>
            <span>{percent}%</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
              style={{
                width: `${percent}%`,
              }}
            />
          </div>
        </div>
      </div>

      {chain.complete ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <PartyPopper className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">
            You&apos;re all set!
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Your business is live with
            QR codes and campaigns
            running. Share your QR
            everywhere — menus,
            storefronts, packaging.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
          >
            Go to dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {chain.steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
            />
          ))}
        </div>
      )}
    </main>
  );
}
