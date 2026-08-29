"use client";

import {
  Activity,
  Clock3,
  ScanLine,
} from "lucide-react";

export default function ActivityPage() {
  return (
    <main className="space-y-7">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
            <Activity className="h-3.5 w-3.5" />
            Activity
          </div>

          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Activity
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Keep track of activity across your TapQR
            workspace.
          </p>
        </div>
      </section>

      {/* Empty state */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white px-6 py-16 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <Clock3 className="h-7 w-7 text-slate-500" />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          No activity yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Your TapQR activity will appear here once
          you start creating businesses, QR codes,
          and receiving scans.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600">
          <ScanLine className="h-4 w-4" />
          Activity tracking coming next
        </div>
      </section>
    </main>
  );
}