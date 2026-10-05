"use client";

import { useState } from "react";
import {
  MessageCircle,
  ArrowUpRight,
  Mail,
  ChevronDown,
} from "lucide-react";

/*
 * ============================================================
 * HELP & SUPPORT SECTION (settings)
 * ============================================================
 *
 * WhatsApp quick-support card, FAQ, and contact email.
 */

const SUPPORT_WHATSAPP = "91XXXXXXXXXX";
const SUPPORT_DISPLAY = "+91 XXXXX XXXXX";
const SUPPORT_EMAIL = "support@tapqr.shop";

const FAQS: Array<{
  q: string;
  a: string;
}> = [
  {
    q: "How do I claim my free 15-day Pro trial?",
    a: "Open your dashboard — you'll see a 'Pro FREE for 15 days' banner at the top. Tap 'Claim free Pro'. You'll need an OTP-verified phone number, and each phone number can claim one trial.",
  },
  {
    q: "How does Refer & Earn work?",
    a: "Find 'Refer & Earn' in the sidebar and share your code or link. When a business you invited subscribes to Pro, you get 30 days of Pro free — and they get a 45-day Pro bonus.",
  },
  {
    q: "Will my QR codes stop working if my trial ends?",
    a: "No. Your QR codes keep working forever. When Pro ends, you simply lose the Pro features (review funnel, loyalty card, bookings, etc.) until you subscribe.",
  },
  {
    q: "How do I get a GST invoice for my subscription?",
    a: "Open Payments in the sidebar, then Billing history. Every payment has a downloadable GST invoice.",
  },
  {
    q: "Can I change my plan later?",
    a: "Yes — switch between Monthly (₹199) and Yearly (₹999) anytime from the Payments page. The change is prorated automatically.",
  },
  {
    q: "Is my business data safe?",
    a: "Yes. Your data is encrypted in transit and at rest, and only your team members can access your workspace.",
  },
];

export default function HelpSupportSection() {
  const [openFaq, setOpenFaq] = useState<
    number | null
  >(null);

  const chatUrl =
    `https://wa.me/${SUPPORT_WHATSAPP}` +
    `?text=${encodeURIComponent(
      "Hi TapQR Support! I need help with my account."
    )}`;

  return (
    <div className="space-y-5">
      {/* WhatsApp card */}
      <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-white p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
            <MessageCircle className="h-5 w-5 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">
              Chat with support
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Fastest help — WhatsApp us at{" "}
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-900 underline decoration-[#25D366] decoration-2 underline-offset-2"
              >
                {SUPPORT_DISPLAY}
              </a>
              <span className="text-slate-400">
                {" "}
                · Mon–Sat, 10am–7pm IST
              </span>
            </p>
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1fb857]"
            >
              Open WhatsApp chat
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Email */}
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <Mail className="h-5 w-5 text-slate-600" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900">
            Email us
          </p>
          <p className="text-xs text-slate-500">
            {SUPPORT_EMAIL} · replies within
            one business day
          </p>
        </div>
      </a>

      {/* FAQ */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          Frequently asked questions
        </p>
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(
                      open ? null : i
                    )
                  }
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <p className="px-4 pb-4 text-xs leading-5 text-slate-500">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
