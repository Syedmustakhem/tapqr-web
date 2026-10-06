"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  adminGetTicket,
  adminReplyTicket,
} from "@/lib/admin";
import { formatBillingDate } from "@/lib/billing";

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = String(
    params.ticketId ?? ""
  );

  const [ticket, setTicket] =
    useState<any>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [sending, setSending] =
    useState(false);

  const load = useCallback(async () => {
    try {
      const res =
        await adminGetTicket(ticketId);
      setTicket(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function send(close: boolean) {
    if (!reply.trim() || sending)
      return;

    setSending(true);
    try {
      await adminReplyTicket(
        ticketId,
        reply.trim(),
        close
      );
      setReply("");
      await load();
    } catch (e: any) {
      alert(
        e?.message || "Reply failed."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading…
      </p>
    );
  }

  if (!ticket) {
    return (
      <p className="text-sm text-slate-500">
        Ticket not found.
      </p>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">
          {ticket.subject}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {ticket.user.fullName} ·{" "}
          {ticket.user.email ?? "—"}
          {ticket.user.phone
            ? ` · ${ticket.user.phone}`
            : ""}{" "}
          ·{" "}
          {formatBillingDate(
            ticket.createdAt
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm leading-6 text-slate-700">
          {ticket.message}
        </p>
      </div>

      {ticket.adminReply && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
            Your reply
            {ticket.repliedAt
              ? ` · ${formatBillingDate(ticket.repliedAt)}`
              : ""}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {ticket.adminReply}
          </p>
        </div>
      )}

      {ticket.status !== "CLOSED" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <textarea
            value={reply}
            onChange={(e) =>
              setReply(e.target.value)
            }
            rows={4}
            placeholder="Write your reply…"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                send(false)
              }
              disabled={
                sending ||
                !reply.trim()
              }
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {sending
                ? "Sending…"
                : "Reply"}
            </button>
            <button
              type="button"
              onClick={() =>
                send(true)
              }
              disabled={
                sending ||
                !reply.trim()
              }
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50"
            >
              Reply & close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
