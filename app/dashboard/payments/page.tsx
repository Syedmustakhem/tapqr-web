"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Check,
  CreditCard,
  Crown,
  Sparkles,
} from "lucide-react";

import BillingSection from "@/components/billing/BillingSection";
import PlanCheckoutButton from "@/components/billing/PlanCheckoutButton";

import {
  getBillingStatus,
} from "@/lib/billing";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type PlanCode =
  | "PRO_MONTHLY"
  | "PRO_YEARLY";

const PRO_PLANS: Array<{
  code: PlanCode;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Sparkles;
  features: string[];
}> = [
  {
    code: "PRO_MONTHLY",
    name: "Pro Monthly",
    price: "₹199",
    period: "/ month",
    description:
      "Build a branded digital identity.",
    icon: Sparkles,
    features: [
      "Everything in Free",
      "Multiple QR profiles",
      "Custom QR colors",
      "Your own brand colors",
      "Add your own logo",
      "Advanced QR customization",
      "Analytics",
      "TapQR Agent OS access",
    ],
  },
  {
    code: "PRO_YEARLY",
    name: "Pro Yearly",
    price: "₹999",
    period: "/ year",
    description:
      "The best value for growing brands.",
    icon: Crown,
    features: [
      "Everything in Pro Monthly",
      "Multiple QR profiles",
      "Custom QR colors",
      "Your own brand colors",
      "Your own logo",
      "Advanced customization",
      "Analytics",
      "TapQR Agent OS access",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PaymentsPage() {
  /*
   * ?plan=PRO_MONTHLY (or PRO_YEARLY) highlights the plan
   * the visitor picked on the public pricing page.
   */

  const [highlighted, setHighlighted] =
    useState<PlanCode | null>(null);

  const [currentPlan, setCurrentPlan] =
    useState<string | null>(null);

  useEffect(() => {
    try {
      const plan =
        new URLSearchParams(
          window.location.search
        ).get("plan");

      if (
        plan === "PRO_MONTHLY" ||
        plan === "PRO_YEARLY"
      ) {
        setHighlighted(plan);
      }
    } catch {
      /* Non-browser — ignore. */
    }

    void getBillingStatus()
      .then((res) => {
        setCurrentPlan(
          res?.data?.plan?.code ??
            "FREE"
        );
      })
      .catch(() => {
        setCurrentPlan("FREE");
      });
  }, []);

  const isPro =
    currentPlan !== null &&
    currentPlan !== "FREE";

  return (
    <main className="space-y-7">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
            <CreditCard className="h-3.5 w-3.5" />
            Billing
          </div>

          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Payments
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Your plan, usage, invoices,
            and upgrades — all in one
            place.
          </p>
        </div>
      </section>

      {/* Upgrade plans (only when not Pro) */}
      {!isPro && (
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-slate-400">
            Upgrade to Pro
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {PRO_PLANS.map((plan) => {
              const Icon = plan.icon;
              const active =
                highlighted ===
                plan.code;

              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col rounded-[24px] border bg-white p-7 shadow-sm transition ${
                    active
                      ? "border-slate-950 ring-2 ring-slate-950/10"
                      : "border-slate-200/80"
                  }`}
                >
                  {active && (
                    <div className="absolute right-6 top-6 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white">
                      Your pick
                    </div>
                  )}

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-950">
                    {plan.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {plan.description}
                  </p>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight text-slate-950">
                      {plan.price}
                    </span>
                    <span className="pb-1 text-sm text-slate-400">
                      {plan.period}
                    </span>
                  </div>

                  <PlanCheckoutButton
                    planCode={plan.code}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    {plan.code ===
                    "PRO_MONTHLY"
                      ? "Get TapQR Pro"
                      : "Choose Yearly"}
                  </PlanCheckoutButton>

                  <div className="my-6 h-px bg-slate-100" />

                  <ul className="space-y-3">
                    {plan.features.map(
                      (feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950/5 text-slate-950">
                            <Check
                              className="h-3 w-3"
                              strokeWidth={3}
                            />
                          </span>
                          <span className="text-slate-600">
                            {feature}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Current plan, usage, invoices */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-slate-400">
          Current plan
        </h2>

        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/60 p-5 sm:p-8">
          <BillingSection />
        </div>
      </section>

      {/* Back link */}
      <div>
        <Link
          href="/dashboard/settings?tab=billing"
          className="text-xs font-bold text-slate-400 transition hover:text-slate-600"
        >
          ← Manage in Settings → Billing
        </Link>
      </div>
    </main>
  );
}
