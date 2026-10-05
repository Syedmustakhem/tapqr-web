"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  type ApiKeyData,
} from "@/lib/settings";
import { formatBillingDate } from "@/lib/billing";

/*
 * ============================================================
 * DEVELOPER SECTION (settings) — API keys
 * ============================================================
 *
 * API keys for AgentOS / MCP integrations. The plaintext key
 * is shown ONCE at creation and never stored server-side.
 */

export default function DeveloperSection() {
  const [keys, setKeys] = useState<
    ApiKeyData[]
  >([]);
  const [loading, setLoading] =
    useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] =
    useState(false);
  const [newKey, setNewKey] = useState<
    string | null
  >(null);
  const [copied, setCopied] =
    useState(false);
  const [error, setError] =
    useState("");

  async function load() {
    try {
      const res = await listApiKeys();
      setKeys(res.data);
    } catch {
      /* section stays empty on failure */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || creating) return;

    setCreating(true);
    setError("");

    try {
      const res = await createApiKey(
        trimmed
      );
      setNewKey(res.data.key);
      setName("");
      await load();
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not create the API key."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (
      !window.confirm(
        "Revoke this API key? Integrations using it will stop working immediately."
      )
    ) {
      return;
    }

    try {
      await revokeApiKey(id);
      await load();
    } catch {
      /* silent */
    }
  }

  async function copyKey() {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(
        newKey
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        2000
      );
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-xs leading-5 text-slate-500">
        API keys let your own integrations
        and AI agents (like TapQR AgentOS)
        read your TapQR data securely. Keys
        are shown once — store them safely.
      </p>

      {/* New key banner */}
      {newKey && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            Copy your key now — it won&apos;t
            be shown again
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-amber-200 bg-white px-3 py-2 font-mono text-xs text-slate-900">
              {newKey}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setNewKey(null)}
            className="mt-2 text-xs font-semibold text-amber-700 underline"
          >
            I&apos;ve saved it — dismiss
          </button>
        </div>
      )}

      {/* Create */}
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Key name — e.g. AgentOS production"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={
            creating || !name.trim()
          }
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {creating
            ? "Creating…"
            : "Create key"}
        </button>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {/* List */}
      {loading ? (
        <p className="text-xs text-slate-400">
          Loading keys…
        </p>
      ) : keys.length === 0 ? (
        <p className="text-xs text-slate-400">
          No API keys yet. Create one to
          connect an integration.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {keys.map((k) => {
            const revoked = !!k.revokedAt;
            return (
              <div
                key={k.id}
                className="flex items-center gap-3 p-4"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    revoked
                      ? "bg-slate-100"
                      : "bg-teal-50"
                  }`}
                >
                  <KeyRound
                    className={`h-4 w-4 ${
                      revoked
                        ? "text-slate-400"
                        : "text-teal-600"
                    }`}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {k.name}
                    {revoked && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                        Revoked
                      </span>
                    )}
                  </p>
                  <p className="truncate font-mono text-[11px] text-slate-400">
                    {k.prefix}… · created{" "}
                    {formatBillingDate(
                      k.createdAt
                    )}
                    {k.lastUsedAt &&
                      ` · last used ${formatBillingDate(k.lastUsedAt)}`}
                  </p>
                </div>
                {!revoked && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRevoke(k.id)
                    }
                    title="Revoke key"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
