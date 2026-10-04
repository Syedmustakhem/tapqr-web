"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiRequest,
  ApiError,
} from "@/lib/api";
import {
  getBillingStatus,
  isUpgradeRequired,
} from "@/lib/billing";
import UpgradeModal from "@/components/billing/UpgradeModal";
import ProLock from "@/components/billing/ProLock";

/*
 * ============================================================
 * BOOKINGS (Pro feature #4) — 6 advanced modes
 * ============================================================
 *
 * APPOINTMENT: services + slots      (hospital/clinic/salon)
 * TABLE:       date + time + guests + food (restaurant)
 * ORDER:       product cart          (shopkeeper)
 * TOKEN:       queue token            (clinic/office)
 * EVENT:       event + seats          (workshop/class)
 * RENTAL:      item + date range      (cars/equipment)
 */

const BUSINESS_STORAGE_KEY =
  "tapqr_current_business_id";

type BookingMode =
  | "APPOINTMENT"
  | "TABLE"
  | "ORDER"
  | "TOKEN"
  | "EVENT"
  | "RENTAL";

const MODES: {
  value: BookingMode;
  label: string;
  hint: string;
}[] = [
  {
    value: "APPOINTMENT",
    label: "📅 Appointment",
    hint: "Hospital, clinic, salon — service + time slot",
  },
  {
    value: "TABLE",
    label: "🍽️ Table booking",
    hint: "Restaurant — table + party size + food pre-order",
  },
  {
    value: "ORDER",
    label: "🛍️ Product order",
    hint: "Shopkeeper — product cart + pickup",
  },
  {
    value: "TOKEN",
    label: "🎫 Token / Queue",
    hint: "Clinic, office — token number for today",
  },
  {
    value: "EVENT",
    label: "🎪 Event seats",
    hint: "Workshop, class — event + seats",
  },
  {
    value: "RENTAL",
    label: "🔑 Rental",
    hint: "Cars, equipment — item + date range",
  },
];

type ServiceConfig = {
  id: string;
  name: string;
  durationMinutes: number;
  price?: number | null;
};

type EventConfig = {
  id: string;
  name: string;
  date: string;
  totalSeats: number;
  price?: number | null;
};

type BookingItem = {
  id: string;
  name: string;
  quantity: number;
  price?: number | null;
};

type Booking = {
  id: string;
  mode: string;
  serviceName: string;
  date: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  partySize?: number | null;
  tokenNumber?: number | null;
  items?: BookingItem[] | null;
  customerName: string;
  customerPhone: string;
  note?: string | null;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED";
};

type Config = {
  appointmentBookingEnabled: boolean;
  appointmentBookingMode: BookingMode;
  appointmentServices: ServiceConfig[];
  appointmentEvents: EventConfig[];
  appointmentSlotMinutes: number;
  appointmentAdvanceDays: number;
  appointmentMaxPartySize: number;
  appointmentMaxTokensPerDay: number;
};

const STATUS_META: Record<
  Booking["status"],
  { label: string; classes: string }
> = {
  PENDING: {
    label: "Pending",
    classes: "bg-amber-100 text-amber-800",
  },
  CONFIRMED: {
    label: "Confirmed",
    classes: "bg-blue-100 text-blue-800",
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-slate-100 text-slate-500",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-green-100 text-green-800",
  },
};

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(
    36
  )}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function formatSlot(
  start?: string | null,
  end?: string | null
): string {
  if (!start || !end) return "";
  const fmt = (t: string) => {
    const [h, m] = t
      .split(":")
      .map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 =
      h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(
      2,
      "0"
    )} ${ampm}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatDate(
  dateKey?: string | null
): string {
  if (!dateKey) return "";
  const [y, m, d] = dateKey
    .split("-")
    .map(Number);
  return new Date(
    y,
    m - 1,
    d
  ).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function bookingSummary(b: Booking): string {
  switch (b.mode) {
    case "TABLE":
      return `Table for ${
        b.partySize ?? "?"
      } · ${formatDate(b.date)} · ${formatSlot(
        b.startTime,
        b.endTime
      )}${
        b.items?.length
          ? ` · Pre-order: ${b.items
              .map(
                (i) =>
                  `${i.name} ×${i.quantity}`
              )
              .join(", ")}`
          : ""
      }`;
    case "ORDER":
      return `Order · ${
        b.items
          ?.map(
            (i) =>
              `${i.name} ×${i.quantity}`
          )
          .join(", ") ?? ""
      }`;
    case "TOKEN":
      return `Token #${
        b.tokenNumber ?? "?"
      } · ${formatDate(b.date)}`;
    case "EVENT":
      return `${formatDate(b.date)} · ${
        b.partySize ?? 1
      } seat${(b.partySize ?? 1) > 1 ? "s" : ""}`;
    case "RENTAL":
      return `${formatDate(
        b.date
      )} → ${formatDate(b.endDate)}`;
    default:
      return `${formatDate(b.date)} · ${formatSlot(
        b.startTime,
        b.endTime
      )}`;
  }
}

export default function AppointmentsPage() {
  const [businessId, setBusinessId] =
    useState("");
  const [tab, setTab] = useState<
    "bookings" | "settings"
  >("bookings");

  const [config, setConfig] =
    useState<Config | null>(null);
  const [configLoading, setConfigLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  const [enabled, setEnabled] =
    useState(false);
  const [mode, setMode] =
    useState<BookingMode>("APPOINTMENT");
  const [services, setServices] =
    useState<ServiceConfig[]>([]);
  const [events, setEvents] =
    useState<EventConfig[]>([]);
  const [slotMinutes, setSlotMinutes] =
    useState("30");
  const [advanceDays, setAdvanceDays] =
    useState("14");
  const [maxPartySize, setMaxPartySize] =
    useState("12");
  const [maxTokens, setMaxTokens] =
    useState("100");

  // Service draft
  const [draftName, setDraftName] =
    useState("");
  const [draftDuration, setDraftDuration] =
    useState("30");
  const [draftPrice, setDraftPrice] =
    useState("");

  // Event draft
  const [draftEventName, setDraftEventName] =
    useState("");
  const [draftEventDate, setDraftEventDate] =
    useState("");
  const [draftEventSeats, setDraftEventSeats] =
    useState("50");
  const [draftEventPrice, setDraftEventPrice] =
    useState("");

  const [bookings, setBookings] =
    useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] =
    useState(true);
  const [statusFilter, setStatusFilter] =
    useState<string>("upcoming");
  const [actingId, setActingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");
  const [error, setError] = useState("");

  /* Pro plan state — null = unknown, never lock on a billing hiccup. */
  const [isPro, setIsPro] =
    useState<boolean | null>(null);

  /* Centered upgrade modal — feature label, or null when closed. */
  const [upgradeFeature, setUpgradeFeature] =
    useState<string | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(
            BUSINESS_STORAGE_KEY
          )
        : null;
    if (stored) setBusinessId(stored);

    let cancelled = false;
    getBillingStatus()
      .then((response) => {
        if (cancelled) {
          return;
        }
        const code =
          response?.data?.plan?.code ?? "FREE";
        setIsPro(code !== "FREE");
      })
      .catch(() => {
        /* Leave isPro null — never lock on a billing hiccup. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadConfig = useCallback(async () => {
    if (!businessId) return;
    setConfigLoading(true);
    setError("");
    try {
      const payload =
        await apiRequest<{
          data: Config;
        }>(
          `/appointments/businesses/${encodeURIComponent(
            businessId
          )}/config`
        );
      const c =
        payload?.data as Config;
      setConfig(c);
      setEnabled(
        c.appointmentBookingEnabled ??
          false
      );
      setMode(
        c.appointmentBookingMode ??
          "APPOINTMENT"
      );
      setServices(
        c.appointmentServices ?? []
      );
      setEvents(
        c.appointmentEvents ?? []
      );
      setSlotMinutes(
        String(
          c.appointmentSlotMinutes ?? 30
        )
      );
      setAdvanceDays(
        String(
          c.appointmentAdvanceDays ?? 14
        )
      );
      setMaxPartySize(
        String(
          c.appointmentMaxPartySize ?? 12
        )
      );
      setMaxTokens(
        String(
          c.appointmentMaxTokensPerDay ??
            100
        )
      );
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load settings."
      );
    } finally {
      setConfigLoading(false);
    }
  }, [businessId]);

  const loadBookings = useCallback(async () => {
    if (!businessId) return;
    setBookingsLoading(true);
    try {
      const params =
        new URLSearchParams({
          limit: "100",
        });
      if (statusFilter !== "upcoming") {
        params.set(
          "status",
          statusFilter
        );
      } else {
        const today = new Date();
        const pad = (n: number) =>
          String(n).padStart(2, "0");
        params.set(
          "from",
          `${today.getFullYear()}-${pad(
            today.getMonth() + 1
          )}-${pad(today.getDate())}`
        );
      }
      const payload =
        await apiRequest<{
          data: Booking[];
        }>(
          `/appointments/businesses/${encodeURIComponent(
            businessId
          )}?${params.toString()}`
        );
      setBookings(
        payload?.data ?? []
      );
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load bookings."
      );
    } finally {
      setBookingsLoading(false);
    }
  }, [businessId, statusFilter]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  /* ---------------- settings actions ---------------- */

  const serviceLabel =
    mode === "TABLE"
      ? "Menu items"
      : mode === "ORDER"
        ? "Products"
        : mode === "RENTAL"
          ? "Rental items"
          : mode === "TOKEN"
            ? "Counters / departments"
            : "Services";

  const addService = () => {
    const name = draftName.trim();
    const duration =
      parseInt(draftDuration, 10);
    const price = draftPrice.trim()
      ? parseFloat(draftPrice)
      : null;
    if (!name) {
      setError("Name is required.");
      return;
    }
    if (
      !duration ||
      duration < 5 ||
      duration > 480
    ) {
      setError(
        "Duration must be 5–480 minutes."
      );
      return;
    }
    setServices((prev) => [
      ...prev,
      {
        id: newId("svc"),
        name,
        durationMinutes: duration,
        price:
          price !== null && !isNaN(price)
            ? price
            : null,
      },
    ]);
    setDraftName("");
    setDraftDuration("30");
    setDraftPrice("");
    setError("");
  };

  const addEvent = () => {
    const name =
      draftEventName.trim();
    const seats = parseInt(
      draftEventSeats,
      10
    );
    const price =
      draftEventPrice.trim()
        ? parseFloat(draftEventPrice)
        : null;
    if (!name) {
      setError(
        "Event name is required."
      );
      return;
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        draftEventDate
      )
    ) {
      setError(
        "Pick a valid event date."
      );
      return;
    }
    if (!seats || seats < 1) {
      setError(
        "Total seats must be at least 1."
      );
      return;
    }
    setEvents((prev) => [
      ...prev,
      {
        id: newId("evt"),
        name,
        date: draftEventDate,
        totalSeats: seats,
        price:
          price !== null && !isNaN(price)
            ? price
            : null,
      },
    ]);
    setDraftEventName("");
    setDraftEventDate("");
    setDraftEventSeats("50");
    setDraftEventPrice("");
    setError("");
  };

  const saveConfig = async () => {
    if (!businessId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload =
        await apiRequest<{
          data: Config;
        }>(
          `/appointments/businesses/${encodeURIComponent(
            businessId
          )}/config`,
          {
            method: "PATCH",
            body: JSON.stringify({
              appointmentBookingEnabled:
                enabled,
              appointmentBookingMode:
                mode,
              appointmentServices:
                services,
              appointmentEvents:
                events,
              appointmentSlotMinutes:
                parseInt(
                  slotMinutes,
                  10
                ) || 30,
              appointmentAdvanceDays:
                parseInt(
                  advanceDays,
                  10
                ) || 14,
              appointmentMaxPartySize:
                parseInt(
                  maxPartySize,
                  10
                ) || 12,
              appointmentMaxTokensPerDay:
                parseInt(maxTokens, 10) ||
                100,
            }),
          }
        );
      setConfig(
        payload?.data as Config
      );
      setMessage("Settings saved.");
    } catch (e) {
      if (isUpgradeRequired(e)) {
        const label = (
          e instanceof ApiError ? e.message : ""
        )
          .split(" requires a Pro plan")[0]
          .trim();
        setUpgradeFeature(
          label || "Appointment Booking"
        );
      } else {
        setError(
          e instanceof ApiError
            ? e.message
            : "Could not save settings."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const setBookingStatus = async (
    id: string,
    status: Booking["status"]
  ) => {
    if (!businessId) return;
    setActingId(id);
    setError("");
    try {
      await apiRequest(
        `/appointments/businesses/${encodeURIComponent(
          businessId
        )}/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status }
            : b
        )
      );
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not update booking."
      );
    } finally {
      setActingId(null);
    }
  };

  const upcomingCount = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === "PENDING" ||
          b.status === "CONFIRMED"
      ).length,
    [bookings]
  );

  if (!businessId) {
    return (
      <main className="p-6">
        <p className="text-sm text-slate-500">
          Select a business to manage
          bookings.
        </p>
      </main>
    );
  }

  const needsServices =
    mode !== "EVENT";
  const needsSlots =
    mode === "APPOINTMENT" ||
    mode === "TABLE";

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-950">
          Bookings{" "}
          <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-700">
            Pro
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Appointments, tables, orders,
          tokens, events, rentals — one
          engine.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      ) : null}

      <div className="flex gap-2 border-b border-slate-200">
        {(
          [
            ["bookings", "Bookings"],
            ["settings", "Settings"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-bold transition ${
              tab === key
                ? "border-b-2 border-slate-950 text-slate-950"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
            {key === "bookings" &&
            upcomingCount > 0 ? (
              <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {upcomingCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">
              Show:
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
            >
              <option value="upcoming">
                Upcoming
              </option>
              <option value="PENDING">
                Pending
              </option>
              <option value="CONFIRMED">
                Confirmed
              </option>
              <option value="COMPLETED">
                Completed
              </option>
              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>

          {bookingsLoading ? (
            <p className="text-sm text-slate-400">
              Loading…
            </p>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
              <p className="text-sm font-bold text-slate-600">
                No bookings yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                They will appear here
                when customers book
                through your QR.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const m =
                  STATUS_META[b.status];
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {b.mode ===
                          "TOKEN"
                            ? `🎫 Token #${
                                b.tokenNumber ??
                                "?"
                              }`
                            : b.serviceName}
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                            {b.mode}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {bookingSummary(
                            b
                          )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          👤{" "}
                          {b.customerName}{" "}
                          · 📞{" "}
                          {b.customerPhone}
                        </p>
                        {b.note ? (
                          <p className="mt-1 text-xs italic text-slate-400">
                            “{b.note}”
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${m.classes}`}
                      >
                        {m.label}
                      </span>
                    </div>
                    {(b.status ===
                      "PENDING" ||
                      b.status ===
                        "CONFIRMED") && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {b.status ===
                          "PENDING" && (
                          <button
                            type="button"
                            disabled={
                              actingId ===
                              b.id
                            }
                            onClick={() =>
                              setBookingStatus(
                                b.id,
                                "CONFIRMED"
                              )
                            }
                            className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status ===
                          "CONFIRMED" && (
                          <button
                            type="button"
                            disabled={
                              actingId ===
                              b.id
                            }
                            onClick={() =>
                              setBookingStatus(
                                b.id,
                                "COMPLETED"
                              )
                            }
                            className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Mark completed
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={
                            actingId === b.id
                          }
                          onClick={() =>
                            setBookingStatus(
                              b.id,
                              "CANCELLED"
                            )
                          }
                          className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "settings" && (
        <section className="space-y-6">
          <ProLock
            locked={isPro === false}
            feature="Appointment Booking"
            onUpgrade={() =>
              setUpgradeFeature(
                "Appointment Booking"
              )
            }
          >
          {configLoading ? (
            <p className="text-sm text-slate-400">
              Loading settings…
            </p>
          ) : (
            <>
              {/* Mode picker */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-bold text-slate-900">
                  Booking mode
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  One engine, six
                  business types. Pick
                  what fits you.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() =>
                        setMode(m.value)
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        mode === m.value
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="block text-sm font-bold">
                        {m.label}
                      </span>
                      <span
                        className={`mt-1 block text-xs ${
                          mode === m.value
                            ? "text-slate-300"
                            : "text-slate-400"
                        }`}
                      >
                        {m.hint}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="mt-5 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setEnabled(
                        e.target.checked
                      )
                    }
                    className="mt-1 h-4 w-4 accent-slate-950"
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      Enable booking
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Scanners see the
                      booking button on
                      your QR page.
                      {needsSlots &&
                        " Slots come from your opening hours (Business → Opening hours)."}
                    </span>
                  </span>
                </label>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {needsSlots && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Slot length
                        (minutes)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={240}
                        value={slotMinutes}
                        onChange={(e) =>
                          setSlotMinutes(
                            e.target.value
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                      />
                    </div>
                  )}
                  {mode !== "ORDER" &&
                    mode !== "TOKEN" && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Bookable days
                          ahead
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={advanceDays}
                          onChange={(e) =>
                            setAdvanceDays(
                              e.target.value
                            )
                          }
                          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                        />
                      </div>
                    )}
                  {mode === "TABLE" && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Max party size
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={maxPartySize}
                        onChange={(e) =>
                          setMaxPartySize(
                            e.target.value
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                      />
                    </div>
                  )}
                  {mode === "TOKEN" && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Max tokens per day
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={maxTokens}
                        onChange={(e) =>
                          setMaxTokens(
                            e.target.value
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Services / products / menu */}
              {needsServices && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-bold text-slate-900">
                    {mode === "TABLE"
                      ? "Menu items"
                      : mode === "ORDER"
                        ? "Products"
                        : mode === "RENTAL"
                          ? "Rental items"
                          : mode === "TOKEN"
                            ? "Counters / departments"
                            : "Services"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {mode === "TABLE"
                      ? "Dishes scanners can pre-order with their table."
                      : mode === "ORDER"
                        ? "Products scanners can add to their order."
                        : mode === "RENTAL"
                          ? "Items for rent (price = per day)."
                          : mode === "TOKEN"
                            ? "Each counter issues its own token queue."
                            : "Services scanners can book."}
                  </p>

                  {services.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {services.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {s.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {
                                s.durationMinutes
                              }{" "}
                              min
                              {typeof s.price ===
                                "number" &&
                              s.price > 0
                                ? ` · ₹${s.price}${
                                    mode ===
                                    "RENTAL"
                                      ? "/day"
                                      : ""
                                  }`
                                : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setServices(
                                (prev) =>
                                  prev.filter(
                                    (x) =>
                                      x.id !==
                                      s.id
                                  )
                              )
                            }
                            className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-[1fr_90px_110px_auto]">
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) =>
                        setDraftName(
                          e.target.value
                        )
                      }
                      placeholder="Name"
                      maxLength={80}
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                    <input
                      type="number"
                      min={5}
                      max={480}
                      value={draftDuration}
                      onChange={(e) =>
                        setDraftDuration(
                          e.target.value
                        )
                      }
                      placeholder="Min"
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                    <input
                      type="number"
                      min={0}
                      value={draftPrice}
                      onChange={(e) =>
                        setDraftPrice(
                          e.target.value
                        )
                      }
                      placeholder="₹ (optional)"
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={addService}
                      className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Events */}
              {mode === "EVENT" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-bold text-slate-900">
                    Events
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Workshops, classes,
                    shows — scanners pick
                    an event and seats.
                  </p>

                  {events.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {events.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {e.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(
                                e.date
                              )}{" "}
                              ·{" "}
                              {e.totalSeats}{" "}
                              seats
                              {typeof e.price ===
                                "number" &&
                              e.price > 0
                                ? ` · ₹${e.price}`
                                : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setEvents(
                                (prev) =>
                                  prev.filter(
                                    (x) =>
                                      x.id !==
                                      e.id
                                  )
                              )
                            }
                            className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-[1fr_140px_90px_110px_auto]">
                    <input
                      type="text"
                      value={draftEventName}
                      onChange={(e) =>
                        setDraftEventName(
                          e.target.value
                        )
                      }
                      placeholder="Event name"
                      maxLength={80}
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                    <input
                      type="date"
                      value={draftEventDate}
                      onChange={(e) =>
                        setDraftEventDate(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={draftEventSeats}
                      onChange={(e) =>
                        setDraftEventSeats(
                          e.target.value
                        )
                      }
                      placeholder="Seats"
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                    <input
                      type="number"
                      min={0}
                      value={draftEventPrice}
                      onChange={(e) =>
                        setDraftEventPrice(
                          e.target.value
                        )
                      }
                      placeholder="₹ (optional)"
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={addEvent}
                      className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={saveConfig}
                disabled={saving}
                className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : "Save settings"}
              </button>
            </>
          )}
          </ProLock>
        </section>
      )}

      <UpgradeModal
        open={upgradeFeature !== null}
        feature={
          upgradeFeature ?? "Appointment Booking"
        }
        onClose={() =>
          setUpgradeFeature(null)
        }
      />
    </main>
  );
}
