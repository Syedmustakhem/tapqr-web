"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Info,
} from "lucide-react";
import {
  getReferralStats,
  getOrCreateReferralCode,
  buildReferralLink,
  type ReferralStatsData,
} from "@/lib/billing";

/*
 * ============================================================
 * REFERRAL WIDGET  —  "Refer & Earn"
 * ============================================================
 *
 * Dashboard card: the user's referral code + link + QR,
 * live stats, and share actions.
 *
 * The pitch: every referred business that subscribes to Pro
 * earns the referrer 30 days of Pro free (credited after
 * their current plan time ends).
 */

export default function ReferralWidget() {
  const [stats, setStats] =
    useState<ReferralStatsData | null>(
      null
    );
  const [qrUrl, setQrUrl] =
    useState<string>("");
  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Ensure the user has a code first.
        await getOrCreateReferralCode();
        const res =
          await getReferralStats();

        if (cancelled) return;
        setStats(res.data);

        if (res.data.code) {
          const link = buildReferralLink(res.data.code);
          const dataUrl =
            await QRCode.toDataURL(
              link,
              {
                margin: 1,
                width: 220,
                color: {
                  dark: "#0f172a",
                  light: "#ffffff",
                },
              }
            );
          if (!cancelled) {
            setQrUrl(dataUrl);
          }
        }
      } catch {
        /* silent — widget is non-critical */
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || !stats.code) {
    return null;
  }

  const link = buildReferralLink(stats.code);
  const earnedMonths = Math.floor(
    stats.earnedDays / 30
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        link
      );
      setCopied(true);
      setTimeout(
        () => setCopied(false),
        2000
      );
    } catch {
      /* clipboard unavailable */
    }
  }

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(
    `I'm using TapQR for my business — one QR for my menu, reviews, bookings and more. Try it free with my link: ${link}`
  )}`;

  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* LEFT — pitch + code */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-950">
              Refer &amp; Earn
            </h2>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            Invite other businesses. When
            one subscribes to Pro, you get{" "}
            <span className="font-bold text-slate-700">
              {stats.rewardDays} days of Pro
              free
            </span>{" "}
            — and they get a{" "}
            <span className="font-bold text-slate-700">
              {stats.refereeBonusDays}-day
              Pro bonus
            </span>
            . Up to{" "}
            {stats.maxRewardsPerYear} rewards
            per year. Credits stack after
            your current plan ends.
          </p>

          {/* Code + link */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Your referral code
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em] text-slate-900">
              {stats.code}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-500">
                {link}
              </p>
              <button
                onClick={copyLink}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-teal-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={whatsappShare}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white transition hover:brightness-95"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share on WhatsApp
            </a>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy invite link
            </button>
          </div>
        </div>

        {/* MIDDLE — QR */}
        {qrUrl && (
          <div className="flex shrink-0 flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Referral QR code"
              className="h-32 w-32 rounded-2xl border border-slate-200"
            />
            <p className="text-[10px] font-medium text-slate-400">
              Scan to join with your code
            </p>
          </div>
        )}

        {/* RIGHT — stats */}
        <div className="grid shrink-0 grid-cols-3 gap-2 lg:w-56 lg:grid-cols-1">
          <div className="rounded-2xl bg-slate-50 px-3 py-2.5 text-center lg:text-left">
            <p className="text-lg font-bold text-slate-900">
              {stats.counts.pending}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Invited
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2.5 text-center lg:text-left">
            <p className="text-lg font-bold text-teal-600">
              {stats.counts.rewarded}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Converted
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 px-3 py-2.5 text-center lg:text-left">
            <p className="text-lg font-bold text-teal-700">
              {earnedMonths > 0
                ? `${earnedMonths} mo`
                : `${stats.earnedDays}d`}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-teal-600/70">
              Pro earned
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p className="text-[11px] leading-relaxed text-slate-500">
          <Users className="mr-1 inline h-3 w-3" />
          Rewards unlock when your invite
          becomes a paying Pro subscriber —
          signups alone don&apos;t count, so
          the system can&apos;t be gamed.
        </p>
      </div>
    </section>
  );
}
