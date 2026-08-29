"use client";

import {
  Mail,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function StaffPage() {
  return (
    <main className="space-y-7">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600">
              <Users className="h-3.5 w-3.5" />
              Team
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Staff
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage the people who have access to
              your TapQR workspace.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Invite member
          </button>
        </div>
      </section>

      {/* Team stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Team members
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            1
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Pending invites
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            0
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Workspace role
          </p>

          <p className="mt-3 text-lg font-bold capitalize text-slate-950">
            Owner
          </p>
        </div>
      </section>

      {/* Current member */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-bold text-slate-950">
            Workspace members
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            People currently connected to this workspace.
          </p>
        </div>

        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            S
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-950">
              Workspace Owner
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              Account owner
            </div>
          </div>

          <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
            Active
          </span>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Owner
          </span>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Member options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Permissions */}
      <section className="rounded-[24px] border border-blue-100 bg-blue-50/50 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <h2 className="text-sm font-bold text-blue-950">
              Team permissions
            </h2>

            <p className="mt-1 text-xs leading-5 text-blue-800/70">
              Staff invitations and role-based permissions
              will be connected to the TapQR backend when
              the team management API is implemented.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}