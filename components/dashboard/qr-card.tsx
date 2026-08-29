"use client";

import Link from "next/link";
import {
  Download,
  ExternalLink,
  Share2,
  QrCode,
} from "lucide-react";

export default function QrCard() {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Your QR
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-950">
              Business QR
            </h2>
          </div>

          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
      </div>

      <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[220px_1fr] md:items-center">
        <div className="mx-auto flex aspect-square w-[190px] items-center justify-center rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950">
            <div className="absolute inset-3 border border-white/10" />

            <QrCode className="h-24 w-24 text-white" />

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-white px-2 py-1 text-[8px] font-black tracking-wide text-slate-950">
              TAPQR
            </div>
          </div>
        </div>

        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-950">
              Your digital doorway
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Customers can scan this QR code to instantly discover your
              business and digital profile.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
              <Download className="h-4 w-4" />
              Download
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <Share2 className="h-4 w-4" />
              Share
            </button>

            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
              View QR Page
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}