"use client";

import {
  Bell,
  ChevronRight,
  Lock,
  Settings,
  Shield,
  User,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="space-y-7">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
            <Settings className="h-3.5 w-3.5" />
            Workspace
          </div>

          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Manage your account, security and
            notification preferences.
          </p>
        </div>
      </section>

      {/* Settings sections */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <SettingRow
          icon={<User className="h-5 w-5" />}
          title="Account"
          description="Manage your name, email and phone number."
        />

        <SettingRow
          icon={<Shield className="h-5 w-5" />}
          title="Security"
          description="Manage authentication and account security."
        />

        <SettingRow
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          description="Choose how TapQR communicates with you."
        />

        <SettingRow
          icon={<Lock className="h-5 w-5" />}
          title="Privacy"
          description="Manage privacy and data preferences."
        />
      </section>

      {/* Session */}
      <section className="rounded-[24px] border border-blue-100 bg-blue-50/50 p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <h2 className="text-sm font-bold text-blue-950">
              Your account is protected
            </h2>

            <p className="mt-1 text-xs leading-5 text-blue-800/70">
              TapQR uses authenticated sessions to
              protect your dashboard and account data.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function SettingRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 border-b border-slate-100 p-5 text-left transition last:border-b-0 hover:bg-slate-50 sm:p-6"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </button>
  );
}