"use client";

import {
  ArrowLeft,
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

type ConversationStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
type HandlingMode = "AI" | "HUMAN";

type Contact = {
  id: string;
  phoneNumber?: string | null;
  displayName?: string | null;
  profileName?: string | null;
};

type AssignedMember = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type Conversation = {
  id: string;
  status: ConversationStatus;
  priority?: string | null;
  handlingMode: HandlingMode;
  lastMessageAt?: string | null;
  createdAt?: string;
  contact?: Contact | null;
  assignedTo?: AssignedMember | null;
};

type WhatsAppMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  type?: string | null;
  text?: string | null;
  content?: string | null;
  status?: string | null;
  mediaId?: string | null;
  templateName?: string | null;
  createdAt: string;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function unwrap<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in (response as Record<string, unknown>)
  ) {
    return (response as ApiResponse<T>).data as T;
  }

  return response as T;
}

function formatTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConversationTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return formatTime(value);
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function getContactName(conversation: Conversation) {
  return (
    conversation.contact?.displayName ||
    conversation.contact?.profileName ||
    conversation.contact?.phoneNumber ||
    "Unknown customer"
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function statusLabel(status: ConversationStatus) {
  return {
    OPEN: "Open",
    PENDING: "Pending",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  }[status];
}

function statusClass(status: ConversationStatus) {
  return {
    OPEN: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
    RESOLVED: "bg-blue-50 text-blue-700 ring-blue-100",
    CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
  }[status];
}

function getMessageText(message: WhatsAppMessage) {
  return message.text || message.content || "";
}

export default function SupportInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ConversationStatus
  >("ALL");

  const [messageText, setMessageText] = useState("");
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) || null,
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const matchesStatus =
        statusFilter === "ALL" || conversation.status === statusFilter;

      if (!matchesStatus) return false;
      if (!query) return true;

      const name = getContactName(conversation).toLowerCase();
      const phone =
        conversation.contact?.phoneNumber?.toLowerCase() || "";

      return (
        name.includes(query) ||
        phone.includes(query) ||
        conversation.id.toLowerCase().includes(query)
      );
    });
  }, [conversations, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: conversations.length,
      open: conversations.filter((item) => item.status === "OPEN").length,
      pending: conversations.filter((item) => item.status === "PENDING").length,
      resolved: conversations.filter((item) => item.status === "RESOLVED").length,
    }),
    [conversations],
  );

  const loadConversations = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoadingConversations(true);

        const response = await apiRequest<
          ApiResponse<Conversation[]> | Conversation[]
        >("/whatsapp/conversations?limit=100&page=1");

        const data = unwrap(response);
        const nextConversations = Array.isArray(data) ? data : [];

        setConversations(nextConversations);

        setSelectedConversationId((current) => {
          if (
            current &&
            nextConversations.some((item) => item.id === current)
          ) {
            return current;
          }

          return nextConversations[0]?.id || null;
        });
      } catch (error) {
        console.error("Failed to load support conversations:", error);
      } finally {
        if (!silent) setLoadingConversations(false);
      }
    },
    [],
  );

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoadingMessages(true);

      const response = await apiRequest<
        ApiResponse<WhatsAppMessage[]> | WhatsAppMessage[]
      >(`/whatsapp/conversations/${conversationId}/messages?limit=200&page=1`);

      const data = unwrap(response);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load conversation messages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();

    const interval = window.setInterval(() => {
      loadConversations(true);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    loadMessages(selectedConversationId);

    const interval = window.setInterval(() => {
      loadMessages(selectedConversationId);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [selectedConversationId, loadMessages]);

  const selectConversation = (id: string) => {
    setSelectedConversationId(id);
    setMobileConversationOpen(true);
  };

  const createConversation = async () => {
    const phone = newPhone.trim();

    if (!/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) {
      window.alert(
        "Enter a valid WhatsApp number with country code, for example +919876543210.",
      );
      return;
    }

    try {
      setCreating(true);

      const response = await apiRequest<
        ApiResponse<Conversation> | Conversation
      >("/whatsapp/conversations", {
        method: "POST",
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const conversation = unwrap(response);

      setNewPhone("");
      setNewChatOpen(false);

      await loadConversations(true);

      if (conversation?.id) {
        setSelectedConversationId(conversation.id);
        setMobileConversationOpen(true);
        await loadMessages(conversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to start conversation.",
      );
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text || !selectedConversation || sending) return;

    try {
      setSending(true);

      await apiRequest(
        `/whatsapp/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        },
      );

      setMessageText("");

      await Promise.all([
        loadMessages(selectedConversation.id),
        loadConversations(true),
      ]);
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to send message.",
      );
    } finally {
      setSending(false);
    }
  };
  const sendSupportTemplate = async () => {
    if (
      !selectedConversation ||
      sendingTemplate ||
      sending
    ) {
      return;
    }

    try {
      setSendingTemplate(true);

      await apiRequest(
        `/whatsapp/conversations/${selectedConversation.id}/template`,
        {
          method: "POST",
        },
      );

      await Promise.all([
        loadMessages(selectedConversation.id),
        loadConversations(true),
      ]);

      window.alert(
        "WhatsApp support template sent successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to send WhatsApp support template:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to send WhatsApp support template.",
      );
    } finally {
      setSendingTemplate(false);
    }
  };
  const updateStatus = async (status: ConversationStatus) => {
    if (!selectedConversation || updating) return;

    try {
      setUpdating(true);

      await apiRequest(
        `/whatsapp/conversations/${selectedConversation.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      await loadConversations(true);
    } catch (error) {
      console.error("Failed to update conversation status:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to update conversation.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const updateHandlingMode = async (handlingMode: HandlingMode) => {
    if (!selectedConversation || updating) return;

    try {
      setUpdating(true);

      await apiRequest(
        `/whatsapp/conversations/${selectedConversation.id}/handling-mode`,
        {
          method: "PATCH",
          body: JSON.stringify({ handlingMode }),
        },
      );

      await loadConversations(true);
    } catch (error) {
      console.error("Failed to update handling mode:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to update handling mode.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-7 lg:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-700 text-white shadow-lg shadow-slate-900/10">
              <MessageCircle size={22} strokeWidth={2.2} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Support Inbox
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                Manage WhatsApp conversations and customer replies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadConversations()}
              disabled={loadingConversations}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={loadingConversations ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setNewChatOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={17} />
              New chat
            </button>
          </div>
        </div>

        {/* Inbox stats */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "All conversations", value: counts.all, key: "ALL" as const },
            { label: "Open", value: counts.open, key: "OPEN" as const },
            { label: "Pending", value: counts.pending, key: "PENDING" as const },
            { label: "Resolved", value: counts.resolved, key: "RESOLVED" as const },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                statusFilter === item.key
                  ? "border-slate-300 bg-slate-50 shadow-sm"
                  : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <p className="text-[11px] font-medium text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                {item.value}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-[620px] lg:grid-cols-[370px_minmax(0,1fr)]">
        {/* Inbox sidebar */}
        <aside
          className={`${
            mobileConversationOpen ? "hidden lg:flex" : "flex"
          } min-h-0 flex-col border-r border-slate-200 bg-white`}
        >
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers or numbers..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
              {(["ALL", "OPEN", "PENDING", "RESOLVED", "CLOSED"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      statusFilter === status
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status === "ALL" ? "All" : statusLabel(status)}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={23}
                    className="mx-auto animate-spin text-slate-400"
                  />
                  <p className="mt-3 text-xs font-medium text-slate-400">
                    Loading conversations...
                  </p>
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-7 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <MessageCircle size={23} />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-800">
                  No conversations found
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  Start a new chat or wait for an incoming WhatsApp message.
                </p>
                <button
                  type="button"
                  onClick={() => setNewChatOpen(true)}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={14} />
                  Start new chat
                </button>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const name = getContactName(conversation);
                const active =
                  conversation.id === selectedConversationId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className={`group flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition ${
                      active
                        ? "bg-slate-50"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    <div
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        active
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {getInitials(name)}
                      {conversation.status === "OPEN" && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {name}
                        </p>
                        <span className="shrink-0 text-[10px] font-medium text-slate-400">
                          {formatConversationTime(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-slate-500">
                          {conversation.contact?.phoneNumber || "WhatsApp"}
                        </p>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusClass(
                            conversation.status,
                          )}`}
                        >
                          {statusLabel(conversation.status)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Conversation panel */}
        <section
          className={`${
            mobileConversationOpen ? "flex" : "hidden lg:flex"
          } min-h-0 min-w-0 flex-1 flex-col bg-slate-50`}
        >
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-white text-slate-300 shadow-sm ring-1 ring-slate-200">
                  <MessageCircle size={32} />
                </div>
                <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                  Your conversations
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Select a customer from the inbox or start a new WhatsApp
                  conversation.
                </p>
                <button
                  type="button"
                  onClick={() => setNewChatOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={16} />
                  Start new conversation
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex min-h-[52px] items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileConversationOpen(false)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                      {getInitials(getContactName(selectedConversation))}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-sm font-bold text-slate-900 sm:text-[15px]">
                          {getContactName(selectedConversation)}
                        </h2>
                        <span
                          className={`hidden rounded-full px-2 py-1 text-[10px] font-semibold ring-1 sm:inline-flex ${statusClass(
                            selectedConversation.status,
                          )}`}
                        >
                          {statusLabel(selectedConversation.status)}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={12} />
                        {selectedConversation.contact?.phoneNumber ||
                          "WhatsApp customer"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConversation.status}
                      disabled={updating}
                      onChange={(event) =>
                        updateStatus(
                          event.target.value as ConversationStatus,
                        )
                      }
                      className="hidden h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-50 sm:block"
                    >
                      <option value="OPEN">Open</option>
                      <option value="PENDING">Pending</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      title="Conversation options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversation controls */}
              <div className="border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    {selectedConversation.handlingMode === "AI" ? (
                      <Bot size={14} />
                    ) : (
                      <UserRound size={14} />
                    )}
                    {selectedConversation.handlingMode === "AI"
                      ? "AI handling"
                      : "Human handling"}
                  </div>

                  <select
                    value={selectedConversation.handlingMode}
                    disabled={updating}
                    onChange={(event) =>
                      updateHandlingMode(
                        event.target.value as HandlingMode,
                      )
                    }
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-50"
                  >
                    <option value="AI">AI handling</option>
                    <option value="HUMAN">Human handling</option>
                  </select>

                  {selectedConversation.assignedTo && (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                      <Users size={13} />
                      {selectedConversation.assignedTo.name ||
                        selectedConversation.assignedTo.email ||
                        "Assigned staff"}
                    </div>
                  )}

                  <div className="ml-auto hidden items-center gap-1.5 text-[11px] font-medium text-slate-400 sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    WhatsApp connected
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-slate-400"
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-200">
                        <MessageCircle size={21} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        No messages yet
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Send the first message to this customer.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
                    {messages.map((message) => {
                      const outbound = message.direction === "OUTBOUND";
                      const text = getMessageText(message);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            outbound ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[86%] px-4 py-2.5 shadow-sm sm:max-w-[72%] ${
                              outbound
                                ? "rounded-2xl rounded-br-md bg-slate-950 text-white"
                                : "rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-900"
                            }`}
                          >
                            {text ? (
                              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                {text}
                              </p>
                            ) : (
                              <div className="flex items-center gap-2 text-sm opacity-70">
                                <MessageCircle size={15} />
                                {message.type || "Media message"}
                              </div>
                            )}

                            <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                              {formatTime(message.createdAt)}

                              {outbound &&
                                (message.status === "READ" ? (
                                  <CheckCheck
                                    size={13}
                                    className="text-blue-400"
                                  />
                                ) : message.status === "DELIVERED" ? (
                                  <CheckCheck size={13} />
                                ) : (
                                  <Check size={13} />
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                {selectedConversation.status === "CLOSED" ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Conversation closed
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Reopen it before sending a message.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateStatus("OPEN")}
                      disabled={updating}
                      className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      Reopen
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto flex max-w-4xl items-end gap-2">
  <button
    type="button"
    onClick={sendSupportTemplate}
    disabled={sendingTemplate || sending}
    aria-label="Send WhatsApp support template"
    className="flex h-[46px] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    title="Send WhatsApp support template"
  >
    {sendingTemplate ? (
      <Loader2
        size={15}
        className="animate-spin"
      />
    ) : (
      <MessageCircle size={15} />
    )}

    <span className="hidden sm:inline">
      Template
    </span>
  </button>

  <textarea
                        value={messageText}
                        onChange={(event) =>
                          setMessageText(event.target.value)
                        }
                        onKeyDown={handleComposerKeyDown}
                        rows={1}
                        placeholder={
                          selectedConversation.handlingMode === "AI"
                            ? "Send a manual WhatsApp reply..."
                            : "Write a reply..."
                        }
                        className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={sending || !messageText.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Send message"
                      >
                        {sending ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Send size={17} />
                        )}
                      </button>
                    </div>

                    <div className="mx-auto mt-2 flex max-w-3xl justify-between px-1 text-[10px] font-medium text-slate-400">
                      <span>Enter to send · Shift + Enter for a new line</span>
                      <span className="hidden sm:block">WhatsApp</span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* New chat modal */}
      {newChatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setNewChatOpen(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <MessageCircle size={19} />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-950">
                  Start a new chat
                </h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Enter the customer&apos;s WhatsApp number to create a
                  conversation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNewChatOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                WhatsApp number
              </label>

              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  autoFocus
                  value={newPhone}
                  onChange={(event) => setNewPhone(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") createConversation();
                  }}
                  placeholder="+919876543210"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
                Use the full international WhatsApp number, including the
                country code.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={() => setNewChatOpen(false)}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createConversation}
                disabled={creating || !newPhone.trim()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {creating ? "Creating..." : "Start conversation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
