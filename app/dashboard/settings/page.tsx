"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import { useRouter } from "next/navigation";

import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  LogOut,
  Settings,
  Shield,
  User,
  XCircle,
} from "lucide-react";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

import {
  clearSession,
} from "@/lib/auth";

import BillingSection from "@/components/billing/BillingSection";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type MeUser = {
  id?: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: string | null;
};

type Preferences = {
  emailEnabled?: boolean;
  whatsappEnabled?: boolean;
  securityEnabled?: boolean;
  authEnabled?: boolean;
  businessEnabled?: boolean;
  qrEnabled?: boolean;
  staffEnabled?: boolean;
  reviewEnabled?: boolean;
  analyticsEnabled?: boolean;
  billingEnabled?: boolean;
  systemEnabled?: boolean;
};

const PREFERENCE_LABELS: Array<{
  key: keyof Preferences;
  title: string;
  description: string;
}> = [
  {
    key: "emailEnabled",
    title: "Email notifications",
    description:
      "Receive updates by email.",
  },
  {
    key: "whatsappEnabled",
    title: "WhatsApp notifications",
    description:
      "Receive updates on WhatsApp.",
  },
  {
    key: "securityEnabled",
    title: "Security alerts",
    description:
      "Sign-ins and security events.",
  },
  {
    key: "authEnabled",
    title: "Authentication updates",
    description:
      "Login codes and session notices.",
  },
  {
    key: "businessEnabled",
    title: "Business updates",
    description:
      "Changes to your businesses.",
  },
  {
    key: "qrEnabled",
    title: "QR code updates",
    description:
      "QR creation and scan milestones.",
  },
  {
    key: "staffEnabled",
    title: "Team updates",
    description:
      "Invitations and member changes.",
  },
  {
    key: "reviewEnabled",
    title: "Review updates",
    description:
      "New customer reviews.",
  },
  {
    key: "analyticsEnabled",
    title: "Analytics digests",
    description:
      "Performance summaries.",
  },
  {
    key: "billingEnabled",
    title: "Billing updates",
    description:
      "Plan and payment notices.",
  },
  {
    key: "systemEnabled",
    title: "System announcements",
    description:
      "Product news from TapQR.",
  },
];

type SectionId =
  | "account"
  | "security"
  | "notifications"
  | "billing"
  | "privacy";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const router = useRouter();

  const [
    openSection,
    setOpenSection,
  ] = useState<SectionId | null>(
    "account"
  );

  const [user, setUser] =
    useState<MeUser | null>(null);
  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  const [prefs, setPrefs] =
    useState<Preferences | null>(
      null
    );
  const [
    loadingPrefs,
    setLoadingPrefs,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);
  const [
    togglingKey,
    setTogglingKey,
  ] = useState<string | null>(
    null
  );
  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [editing, setEditing] =
    useState(false);
  const [fullName, setFullName] =
    useState("");
  const [phone, setPhone] =
    useState("");

  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  const loadUser =
    useCallback(async () => {
      try {
        setLoadingUser(true);
        setError("");

        const response =
          await apiRequest<{
            data?: MeUser;
            user?: MeUser;
          }>("/auth/me");

        const current =
          response?.data ??
          response?.user ??
          null;

        setUser(current);
        setFullName(
          current?.fullName ?? ""
        );
        setPhone(
          current?.phone ?? ""
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        setLoadingUser(false);
      }
    }, []);

  const loadPreferences =
    useCallback(async () => {
      try {
        setLoadingPrefs(true);

        const response =
          await apiRequest<{
            data?: Preferences;
          }>(
            "/notifications/preferences"
          );

        setPrefs(
          response?.data ?? {}
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notification preferences."
        );
      } finally {
        setLoadingPrefs(false);
      }
    }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (
      openSection ===
      "notifications" &&
      prefs === null &&
      !loadingPrefs
    ) {
      void loadPreferences();
    }
  }, [
    openSection,
    prefs,
    loadingPrefs,
    loadPreferences,
  ]);

  useEffect(() => {
    if (!success) return;
    const timer =
      window.setTimeout(
        () => setSuccess(""),
        3500
      );
    return () =>
      window.clearTimeout(
        timer
      );
  }, [success]);

  useEffect(() => {
    try {
      const tab =
        new URLSearchParams(
          window.location.search
        ).get("tab");

      if (tab === "billing") {
        setOpenSection("billing");
      }
    } catch {
      /* Non-browser or malformed URL — ignore. */
    }
  }, []);

  const toggleSection = (
    id: SectionId
  ) => {
    setOpenSection((current) =>
      current === id
        ? null
        : id
    );
    setError("");
    setSuccess("");
  };

  const handleSaveProfile =
    async () => {
      const name =
        fullName.trim();
      const phoneValue =
        phone.trim();

      if (
        name.length < 3
      ) {
        setError(
          "Full name must be at least 3 characters."
        );
        return;
      }

      if (
        phoneValue &&
        !/^\+[1-9]\d{6,14}$/.test(
          phoneValue
        )
      ) {
        setError(
          "Phone must be in international format, e.g. +919121657235."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        const response =
          await apiRequest<{
            data?: MeUser;
          }>("/auth/me", {
            method: "PATCH",
            body: JSON.stringify(
              {
                fullName: name,
                ...(phoneValue
                  ? {
                      phone:
                        phoneValue,
                    }
                  : {}),
              }
            ),
          });

        const updated =
          response?.data ?? null;

        if (updated) {
          setUser(updated);
          setFullName(
            updated.fullName ??
              ""
          );
          setPhone(
            updated.phone ?? ""
          );
        }

        setEditing(false);
        setSuccess(
          "Profile updated successfully."
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save your profile."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleTogglePreference =
    async (
      key: keyof Preferences,
      value: boolean
    ) => {
      try {
        setTogglingKey(
          String(key)
        );
        setError("");

        const response =
          await apiRequest<{
            data?: Preferences;
          }>(
            "/notifications/preferences",
            {
              method: "PATCH",
              body: JSON.stringify(
                {
                  [key]: value,
                }
              ),
            }
          );

        setPrefs(
          response?.data ?? {
            ...prefs,
            [key]: value,
          }
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update preference."
        );
      } finally {
        setTogglingKey(null);
      }
    };

  const handleLogout =
    async () => {
      if (loggingOut) return;

      setLoggingOut(true);

      try {
        await apiRequest(
          "/auth/logout",
          { method: "POST" }
        );
      } catch (err) {
        if (
          !(err instanceof ApiError)
        ) {
          console.error(
            "TapQR logout error:",
            err
          );
        }
      } finally {
        clearSession();
        router.replace("/login");
        router.refresh();
      }
    };

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
            Manage your account,
            security and
            notification
            preferences.
          </p>
        </div>
      </section>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-semibold text-red-800">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-800">
            {success}
          </p>
        </div>
      )}

      {/* Sections */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        {/* ACCOUNT */}
        <div className="border-b border-slate-100 last:border-b-0">
          <SectionButton
            icon={
              <User className="h-5 w-5" />
            }
            title="Account"
            description="Manage your name, email and phone number."
            open={
              openSection ===
              "account"
            }
            onClick={() =>
              toggleSection(
                "account"
              )
            }
          />

          {openSection ===
            "account" && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-8">
              {loadingUser ? (
                <p className="text-sm text-slate-500">
                  Loading your
                  profile…
                </p>
              ) : (
                <div className="max-w-lg space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Full name
                    </label>
                    {editing ? (
                      <input
                        value={
                          fullName
                        }
                        onChange={(
                          e
                        ) =>
                          setFullName(
                            e.target
                              .value
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {user?.fullName ??
                          "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Email
                    </label>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {user?.email ??
                        "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Email is tied
                      to your sign-in
                      and cannot be
                      changed here.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Phone
                    </label>
                    {editing ? (
                      <input
                        value={
                          phone
                        }
                        onChange={(
                          e
                        ) =>
                          setPhone(
                            e.target
                              .value
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
                        placeholder="+919121657235"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {user?.phone ??
                          "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          onClick={
                            handleSaveProfile
                          }
                          disabled={
                            saving
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          {saving && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          )}
                          {saving
                            ? "Saving…"
                            : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(
                              false
                            );
                            setFullName(
                              user?.fullName ??
                                ""
                            );
                            setPhone(
                              user?.phone ??
                                ""
                            );
                            setError(
                              ""
                            );
                          }}
                          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setEditing(
                            true
                          )
                        }
                        className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                      >
                        Edit profile
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECURITY */}
        <div className="border-b border-slate-100 last:border-b-0">
          <SectionButton
            icon={
              <Shield className="h-5 w-5" />
            }
            title="Security"
            description="Manage authentication and account security."
            open={
              openSection ===
              "security"
            }
            onClick={() =>
              toggleSection(
                "security"
              )
            }
          />

          {openSection ===
            "security" && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-8">
              <div className="max-w-lg space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  You sign in with
                  a one-time code
                  sent to your email
                  or WhatsApp —
                  there is no
                  password to
                  change or leak.
                </p>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    loggingOut
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  {loggingOut
                    ? "Signing out…"
                    : "Sign out of this device"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="border-b border-slate-100 last:border-b-0">
          <SectionButton
            icon={
              <Bell className="h-5 w-5" />
            }
            title="Notifications"
            description="Choose how TapQR communicates with you."
            open={
              openSection ===
              "notifications"
            }
            onClick={() =>
              toggleSection(
                "notifications"
              )
            }
          />

          {openSection ===
            "notifications" && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-8">
              {loadingPrefs ? (
                <p className="text-sm text-slate-500">
                  Loading
                  preferences…
                </p>
              ) : (
                <div className="max-w-xl divide-y divide-slate-100">
                  {PREFERENCE_LABELS.map(
                    (item) => {
                      const checked =
                        prefs?.[
                          item.key
                        ] ?? true;
                      const busy =
                        togglingKey ===
                        String(
                          item.key
                        );

                      return (
                        <div
                          key={String(
                            item.key
                          )}
                          className="flex items-center justify-between gap-4 py-3.5"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {
                                item.title
                              }
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {
                                item.description
                              }
                            </p>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={
                              checked
                            }
                            disabled={
                              busy
                            }
                            onClick={() =>
                              handleTogglePreference(
                                item.key,
                                !checked
                              )
                            }
                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                              checked
                                ? "bg-slate-950"
                                : "bg-slate-200"
                            } disabled:opacity-50`}
                          >
                            <span
                              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                checked
                                  ? "left-6"
                                  : "left-1"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BILLING */}
        <div className="border-b border-slate-100 last:border-b-0">
          <SectionButton
            icon={
              <CreditCard className="h-5 w-5" />
            }
            title="Billing"
            description="Plan, usage, invoices and subscription."
            open={
              openSection ===
              "billing"
            }
            onClick={() =>
              toggleSection(
                "billing"
              )
            }
          />

          {openSection ===
            "billing" && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-8">
              <BillingSection />
            </div>
          )}
        </div>

        {/* PRIVACY */}
        <div className="border-b border-slate-100 last:border-b-0">
          <SectionButton
            icon={
              <Lock className="h-5 w-5" />
            }
            title="Privacy"
            description="Manage privacy and data preferences."
            open={
              openSection ===
              "privacy"
            }
            onClick={() =>
              toggleSection(
                "privacy"
              )
            }
          />

          {openSection ===
            "privacy" && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-8">
              <div className="max-w-lg space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  TapQR stores only
                  what your account
                  needs: your name,
                  email, phone number,
                  your businesses, QR
                  codes, and scan
                  analytics. Scan data
                  is aggregated —
                  individual visitors
                  are never
                  identified by name.
                </p>

                {user && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Data on your
                      account
                    </p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">
                          Name
                        </dt>
                        <dd className="font-semibold text-slate-900">
                          {user.fullName ??
                            "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">
                          Email
                        </dt>
                        <dd className="font-semibold text-slate-900">
                          {user.email ??
                            "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">
                          Phone
                        </dt>
                        <dd className="font-semibold text-slate-900">
                          {user.phone ??
                            "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                <p className="text-xs leading-5 text-slate-400">
                  To export or
                  delete your data,
                  contact
                  support@tapqr.shop
                  from your account
                  email.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Session */}
      <section className="rounded-[24px] border border-blue-100 bg-blue-50/50 p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <h2 className="text-sm font-bold text-blue-950">
              Your account is
              protected
            </h2>

            <p className="mt-1 text-xs leading-5 text-blue-800/70">
              TapQR uses
              authenticated
              sessions to protect
              your dashboard and
              account data.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Section button                                                             */
/* -------------------------------------------------------------------------- */

function SectionButton({
  icon,
  title,
  description,
  open,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50 sm:p-6"
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

      <ChevronRight
        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
          open ? "rotate-90" : ""
        }`}
      />
    </button>
  );
}
