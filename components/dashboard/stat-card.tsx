import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Minus,
  QrCode,
  Users,
} from "lucide-react";

type StatIcon =
  | "business"
  | "scans"
  | "qr"
  | "users";

type TrendType =
  | "positive"
  | "negative"
  | "neutral";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  trendType?: TrendType;
  icon: StatIcon;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = "positive",
  icon,
  loading = false,
}: StatCardProps) {
  const Icon =
    icon === "business"
      ? Building2
      : icon === "qr"
        ? QrCode
        : icon === "users"
          ? Users
          : BarChart3;

  const TrendIcon =
    trendType === "negative"
      ? ArrowDownRight
      : trendType === "neutral"
        ? Minus
        : ArrowUpRight;

  const trendClasses =
    trendType === "positive"
      ? "bg-emerald-50 text-emerald-600"
      : trendType === "negative"
        ? "bg-red-50 text-red-600"
        : "bg-slate-100 text-slate-500";

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
            <div className="h-6 w-16 rounded-full bg-slate-100" />
          </div>

          <div className="mt-5 h-3 w-24 rounded bg-slate-100" />

          <div className="mt-2 h-9 w-28 rounded-lg bg-slate-100" />

          <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <article
      aria-label={`${title}: ${value}`}
      className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50 blur-2xl transition duration-300 group-hover:bg-blue-100" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
            <Icon
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.9}
            />
          </div>

          {trend && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${trendClasses}`}
            >
              <TrendIcon
                aria-hidden="true"
                className="h-3 w-3"
              />

              <span>{trend}</span>
            </span>
          )}
        </div>

        {/* Metric */}
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </p>

        <p
          className="mt-1 truncate text-3xl font-bold tracking-tight text-slate-950"
          title={value}
        >
          {value}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {subtitle}
        </p>
      </div>
    </article>
  );
}