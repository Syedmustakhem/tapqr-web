"use client";

import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  ScanLine,
} from "lucide-react";

interface RecentScan {
  id: string;
  location?: string;
  device?: string;
  createdAt?: string;
}

interface RecentScansProps {
  scans?: RecentScan[];
  loading?: boolean;
  error?: string;
}

function formatScanTime(
  createdAt?: string
) {
  if (!createdAt) {
    return "Recently";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export default function RecentScans({
  scans = [],
  loading = false,
  error = "",
}: RecentScansProps) {
  const hasScans = scans.length > 0;

  return (
    <section
      aria-labelledby="recent-scans-title"
      className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Activity
          </p>

          <h2
            id="recent-scans-title"
            className="mt-1 text-lg font-bold text-slate-950"
          >
            Recent scans
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest activity from your QR codes
          </p>
        </div>

        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          View all
          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="divide-y divide-slate-100"
          aria-label="Loading recent scans"
        >
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-4 sm:px-6"
            >
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

              <div className="min-w-0 flex-1">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />

                <div className="mt-2 h-2.5 w-44 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="hidden h-2.5 w-20 animate-pulse rounded bg-slate-100 sm:block" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <ScanLine
              aria-hidden="true"
              className="h-6 w-6"
            />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-950">
            Unable to load activity
          </h3>

          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
            {error}
          </p>

          <Link
            href="/dashboard/analytics"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            Open analytics
            <ArrowRight
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
          </Link>
        </div>
      )}

      {/* Real scans */}
      {!loading &&
        !error &&
        hasScans && (
          <div className="divide-y divide-slate-100">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ScanLine
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    QR scan
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    {scan.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin
                          aria-hidden="true"
                          className="h-3 w-3"
                        />
                        {scan.location}
                      </span>
                    )}

                    {scan.device && (
                      <span>
                        {scan.device}
                      </span>
                    )}
                  </div>
                </div>

                <time
                  dateTime={scan.createdAt}
                  className="hidden shrink-0 text-[11px] font-medium text-slate-400 sm:block"
                >
                  {formatScanTime(
                    scan.createdAt
                  )}
                </time>
              </div>
            ))}
          </div>
        )}

      {/* Empty */}
      {!loading &&
        !error &&
        !hasScans && (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ScanLine
                aria-hidden="true"
                className="h-6 w-6 text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-950">
              No scans yet
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              Share your TapQR code with customers
              to start receiving scans and building
              your activity history.
            </p>

            <Link
              href="/dashboard/qr"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              Open QR Studio
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            </Link>
          </div>
        )}
    </section>
  );
}