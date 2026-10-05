"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Globe,
  Check,
  Loader2,
} from "lucide-react";
import {
  getPreferences,
  updatePreferences,
  LANGUAGES,
  TIMEZONES,
} from "@/lib/settings";

/*
 * ============================================================
 * PREFERENCES SECTION (settings)
 * ============================================================
 *
 * Dashboard language + timezone. Saved to the backend
 * (/api/settings/preferences) so every device follows the
 * same preference.
 */

export default function PreferencesSection() {
  const [language, setLanguage] =
    useState("en");
  const [timezone, setTimezone] =
    useState("Asia/Kolkata");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [saved, setSaved] =
    useState(false);
  const [dirty, setDirty] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res =
          await getPreferences();
        if (cancelled) return;
        setLanguage(
          res.data.language ?? "en"
        );
        setTimezone(
          res.data.timezone ??
            "Asia/Kolkata"
        );
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled)
          setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function pickLanguage(code: string) {
    setLanguage(code);
    setDirty(true);
    setSaved(false);
  }

  function pickTimezone(code: string) {
    setTimezone(code);
    setDirty(true);
    setSaved(false);
  }

  async function handleSave() {
    if (saving || !dirty) return;
    setSaving(true);

    try {
      await updatePreferences({
        language,
        timezone,
      });
      setDirty(false);
      setSaved(true);
      window.setTimeout(
        () => setSaved(false),
        2500
      );
    } catch {
      /* silent — user can retry */
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading your preferences…
      </p>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Language */}
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          <Globe className="h-3.5 w-3.5" />
          Dashboard language
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((lang) => {
            const active =
              language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() =>
                  pickLanguage(lang.code)
                }
                aria-pressed={active}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "border-teal-500 bg-teal-50 font-bold text-teal-900"
                    : "border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="truncate">
                  {lang.label}
                </span>
                {active && (
                  <Check className="h-4 w-4 shrink-0 text-teal-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timezone */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Timezone
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Used for booking times,
          analytics charts, and
          notifications.
        </p>
        <select
          value={timezone}
          onChange={(e) =>
            pickTimezone(e.target.value)
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
        >
          {TIMEZONES.map((tz) => (
            <option
              key={tz.code}
              value={tz.code}
            >
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {saving && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          {saving
            ? "Saving…"
            : "Save preferences"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
