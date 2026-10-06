"use client";

import { useState } from "react";
import { adminBroadcast } from "@/lib/admin";

export default function AdminBroadcastsPage() {
  const [channel, setChannel] = useState<
    "whatsapp" | "email"
  >("whatsapp");
  const [segment, setSegment] = useState<
    "all" | "pro" | "trial" | "free"
  >("all");
  const [message, setMessage] =
    useState("");
  const [sending, setSending] =
    useState(false);
  const [result, setResult] = useState<
    string | null
  >(null);

  async function send() {
    if (!message.trim() || sending)
      return;

    if (
      !window.confirm(
        `Send this ${channel} broadcast to segment "${segment}"? This goes to real users.`
      )
    )
      return;

    setSending(true);
    setResult(null);

    try {
      const res =
        await adminBroadcast({
          channel,
          segment,
          message: message.trim(),
        });
      setResult(
        `Sent to ${res.data.sent} users (${res.data.failed} failed).`
      );
      setMessage("");
    } catch (e: any) {
      setResult(
        e?.message || "Broadcast failed."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          Broadcasts
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Announcements straight to
          users. Use sparingly.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Channel
            </p>
            <div className="mt-2 flex gap-2">
              {(
                [
                  "whatsapp",
                  "email",
                ] as const
              ).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setChannel(c)
                  }
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold capitalize transition ${
                    channel === c
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 text-slate-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Segment
            </p>
            <select
              value={segment}
              onChange={(e) =>
                setSegment(
                  e.target.value as any
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="all">
                Everyone
              </option>
              <option value="pro">
                Pro users
              </option>
              <option value="trial">
                Active trials
              </option>
              <option value="free">
                Free users
              </option>
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Message
          </p>
          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            rows={5}
            maxLength={1000}
            placeholder="Write the announcement…"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">
            {message.length}/1000
          </p>
        </div>

        <button
          type="button"
          onClick={send}
          disabled={
            sending || !message.trim()
          }
          className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {sending
            ? "Sending…"
            : `Send ${channel} broadcast`}
        </button>

        {result && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
