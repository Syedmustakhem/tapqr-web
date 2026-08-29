"use client";

import Link from "next/link";
import {
  ArrowRight,
  Download,
  ExternalLink,
  MoreHorizontal,
  Plus,
  QrCode,
  ScanLine,
  Share2,
} from "lucide-react";

export default function QRPage() {
  return (
    <main className="space-y-7">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              <QrCode className="h-3.5 w-3.5" />
              QR Management
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              QR Codes
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Create, manage and share your TapQR codes
              from one place.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create QR Code
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total QR codes
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <QrCode className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-950">
            0
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Active
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <QrCode className="h-4 w-4 text-emerald-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-950">
            0
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total scans
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
              <ScanLine className="h-4 w-4 text-violet-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-950">
            0
          </p>
        </div>
      </section>

      {/* Empty state */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white px-6 py-16 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <QrCode className="h-8 w-8 text-slate-500" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-950">
          Create your first QR code
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Create a QR code for your business and
          connect it to your TapQR digital experience.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create QR Code
        </button>
      </section>

      {/* Future QR features */}
      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
          <QrCode className="h-5 w-5 text-blue-600" />

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Customize
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Customize your QR code to match your
            brand and business.
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
          <Share2 className="h-5 w-5 text-violet-600" />

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Share
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Share your QR code with customers
            anywhere.
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
          <ScanLine className="h-5 w-5 text-emerald-600" />

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Track scans
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Monitor QR scans and understand how
            customers interact with your QR codes.
          </p>
        </div>
      </section>
    </main>
  );
}