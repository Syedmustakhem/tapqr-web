import {
  ArrowUpRight,
  BarChart3,
  Building2,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  icon: "business" | "scans";
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: StatCardProps) {
  const Icon =
    icon === "business"
      ? Building2
      : BarChart3;

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50 blur-2xl transition group-hover:bg-blue-100" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>

          {trend && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}