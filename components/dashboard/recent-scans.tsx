import {
  ScanLine,
  ArrowRight,
} from "lucide-react";

export default function RecentScans() {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Activity
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Recent scans
          </h2>
        </div>

        <button className="flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-950">
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <ScanLine className="h-6 w-6 text-slate-400" />
        </div>

        <h3 className="mt-4 text-sm font-bold text-slate-950">
          No scans yet
        </h3>

        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
          Share your TapQR code with customers to start receiving scans
          and building your activity history.
        </p>
      </div>
    </section>
  );
}