"use client";

import {
  BarChart3,
  CalendarDays,
  Eye,
  ScanLine,
  TrendingUp,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="space-y-7">
      {/* =========================================================
          HEADER
      ========================================================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-violet-100/40 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              <BarChart3 className="h-3.5 w-3.5" />

              Analytics
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Analytics
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Understand how people interact with
              your TapQR codes and digital presence.
            </p>
          </div>

          {/* Date filter placeholder */}
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <CalendarDays className="h-4 w-4" />

            Last 30 days
          </button>
        </div>
      </section>

      {/* =========================================================
          STAT CARDS
      ========================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total scans
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <ScanLine className="h-4 w-4 text-blue-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            0
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No scans recorded yet
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Unique visitors
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
              <Eye className="h-4 w-4 text-violet-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            0
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No visitor data yet
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Engagement
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            0%
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Waiting for activity
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Active QR codes
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            0
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Create your first QR code
          </p>
        </div>
      </section>

      {/* =========================================================
          CHART PLACEHOLDER
      ========================================================== */}

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Scan activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your QR scan activity will appear here.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            No data yet
          </div>
        </div>

        <div className="mt-7 flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
          <div className="max-w-sm px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <BarChart3 className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Analytics will appear here
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Once your QR codes start receiving
              scans, we'll show trends, traffic,
              engagement and performance data here.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          BREAKDOWN
      ========================================================== */}

      <section className="grid gap-5 lg:grid-cols-2">
        {/* Devices */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">
            Device breakdown
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            See which devices visitors use.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No device data yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Data will appear after your first scan.
            </p>
          </div>
        </div>

        {/* Locations */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">
            Visitor locations
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            See where your QR traffic comes from.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No location data yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Location insights will appear after
              your first scan.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          EMPTY STATE
      ========================================================== */}

      <section className="rounded-[24px] border border-blue-100 bg-blue-50/50 px-6 py-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-bold text-blue-950">
              Analytics will become available automatically
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-800/70">
              Create a QR code and start sharing it.
              Once people scan it, TapQR will begin
              collecting the information needed for
              your analytics dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}