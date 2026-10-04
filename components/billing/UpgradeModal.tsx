"use client";

import { useEffect } from "react";

import Link from "next/link";

import { Sparkles, X } from "lucide-react";

/*
 * Centered "Upgrade to Pro" modal.
 *
 * Shown when a free member tries to use a paid feature —
 * replaces the old top-of-page error banner, which was
 * easy to miss and confusing.
 *
 * Usage:
 *
 *   const [upgradeFeature, setUpgradeFeature] =
 *     useState<string | null>(null);
 *
 *   <UpgradeModal
 *     open={upgradeFeature !== null}
 *     feature={upgradeFeature ?? "This feature"}
 *     onClose={() => setUpgradeFeature(null)}
 *   />
 */

const BENEFITS = [
  "Review Funnel, Specials Banner & Loyalty Card",
  "Appointment Booking in 6 modes",
  "Scan-to-WhatsApp Ordering",
  "Pro scan analytics & more",
];

export default function UpgradeModal({
  open,
  feature,
  onClose,
}: {
  open: boolean;
  feature: string;
  onClose: () => void;
}) {
  /*
   * Close on Escape + lock body scroll
   * while the modal is open.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      onKey
    );
    const previous =
      document.body.style.overflow;
    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        onKey
      );
      document.body.style.overflow =
        previous;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Pro"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Sparkles className="h-7 w-7" />
        </span>

        <h2 className="mt-4 text-xl font-extrabold text-slate-900">
          Upgrade to Pro
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          <span className="font-bold text-slate-700">
            {feature}
          </span>{" "}
          is a Pro feature. Unlock
          it — and everything else
          in Pro — in one tap.
        </p>

        <ul className="mt-4 space-y-2 text-left">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2 text-xs font-semibold text-slate-600"
            >
              <span className="mt-0.5 text-emerald-500">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs font-bold text-slate-400">
          ₹199/month · ₹999/year —
          cancel anytime
        </p>

        <Link
          href="/dashboard/payments"
          className="mt-3 block w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-slate-800"
        >
          Upgrade to Pro
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:text-slate-600"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
