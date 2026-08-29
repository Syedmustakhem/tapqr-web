    export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-7">
      <div className="h-44 rounded-[28px] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-36 rounded-[22px] bg-slate-200" />
        <div className="h-36 rounded-[22px] bg-slate-200" />
      </div>

      <div className="h-16 rounded-[22px] bg-slate-200" />

      <div className="h-[360px] rounded-[24px] bg-slate-200" />

      <div className="h-32 rounded-[24px] bg-slate-200" />

      <div className="h-[260px] rounded-[24px] bg-slate-200" />
    </div>
  );
}