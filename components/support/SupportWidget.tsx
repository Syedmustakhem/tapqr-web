"use client";

import {
  MessageCircle,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

/*
 * ============================================================
 * SUPPORT WIDGET
 * ============================================================
 *
 * Quick-support card for the dashboard: highlights the
 * WhatsApp support number and opens a wa.me chat with a
 * pre-filled message.
 *
 * Usage: drop <SupportWidget /> anywhere on the dashboard
 * (e.g. below TrialBanner / ReferralWidget).
 */

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
//  PUT YOUR SUPPORT WHATSAPP NUMBER HERE
//  Format: country code + number, no "+", no spaces.
//  Example: "919121657235"
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
const SUPPORT_WHATSAPP = "91XXXXXXXXXX";

// How the number looks on screen.
const SUPPORT_DISPLAY = "+91 XXXXX XXXXX";

// Support hours shown under the button.
const SUPPORT_HOURS = "Mon–Sat, 10am–7pm IST";

export default function SupportWidget() {
  const chatUrl =
    `https://wa.me/${SUPPORT_WHATSAPP}` +
    `?text=${encodeURIComponent(
      "Hi TapQR Support! I need help with my account."
    )}`;

  return (
    <section className="rounded-[24px] border border-green-200 bg-gradient-to-r from-green-50 to-white px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
            <MessageCircle className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Need help? Talk to us right now
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Fastest support — WhatsApp us at{" "}
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-900 underline decoration-[#25D366] decoration-2 underline-offset-2"
              >
                {SUPPORT_DISPLAY}
              </a>
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
              <Clock3 className="h-3 w-3" />
              {SUPPORT_HOURS} · usually replies within an hour
            </p>
          </div>
        </div>
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1fb857]"
        >
          Chat on WhatsApp
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
