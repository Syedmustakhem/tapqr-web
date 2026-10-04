"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.tapqr.shop";
const API_ROOT = `${API_BASE}/api`;

/*
 * ============================================================
 * BOOKING WIDGET (Pro feature #4) — 6 advanced modes
 * ============================================================
 *
 * One engine, six business types. The owner picks the mode in
 * Dashboard → Appointments → Settings.
 *
 * APPOINTMENT (hospital/clinic/salon):
 *   service → date → time slot → details → done
 *
 * TABLE (restaurant):
 *   date → time → party size → food pre-order → details → done
 *
 * ORDER (shopkeeper):
 *   products → cart → details → done
 *
 * TOKEN (clinic/office queue):
 *   counter/service → details → done (shows token number)
 *
 * EVENT (workshop/class):
 *   event → seats → details → done
 *
 * RENTAL (cars/equipment):
 *   item → date range → details → done
 */

export type BookingMode =
  | "APPOINTMENT"
  | "TABLE"
  | "ORDER"
  | "TOKEN"
  | "EVENT"
  | "RENTAL";

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
  seatsLeft?: number;
  price?: number | null;
};

type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price?: number | null;
};

type Props = {
  enabled?: boolean | null;
  businessId: string;
  mode?: BookingMode | string | null;
  services?: ServiceConfig[] | null;
  events?: EventConfig[] | null;
  advanceDays?: number | null;
  maxPartySize?: number | null;
  primaryColor: string;
};

const MODE_META: Record<
  string,
  { button: string; title: string }
> = {
  APPOINTMENT: {
    button: "📅 Book an Appointment",
    title: "📅 Book an Appointment",
  },
  TABLE: {
    button: "🍽️ Book a Table",
    title: "🍽️ Book a Table",
  },
  ORDER: {
    button: "🛍️ Order Products",
    title: "🛍️ Order Products",
  },
  TOKEN: {
    button: "🎫 Take a Token",
    title: "🎫 Take a Token",
  },
  EVENT: {
    button: "🎪 Book Event Seats",
    title: "🎪 Book Event Seats",
  },
  RENTAL: {
    button: "🔑 Rent an Item",
    title: "🔑 Rent an Item",
  },
};

function toDateKey(d: Date): string {
  const pad = (n: number) =>
    String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(
    d.getMonth() + 1
  )}-${pad(d.getDate())}`;
}

function formatSlot(
  start: string,
  end: string
): string {
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

function formatDateLabel(
  dateKey: string
): string {
  const [y, m, d] = dateKey
    .split("-")
    .map(Number);
  const dt = new Date(y, m - 1, d);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(
    today.getDate() + 1
  );
  if (toDateKey(dt) === toDateKey(today))
    return "Today";
  if (toDateKey(dt) === toDateKey(tomorrow))
    return "Tomorrow";
  return dt.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatPrice(
  price?: number | null
): string {
  if (
    typeof price !== "number" ||
    price <= 0
  )
    return "";
  return ` · ₹${price}`;
}

function cartTotal(
  items: CartItem[]
): number {
  return items.reduce(
    (s, i) =>
      s +
      (typeof i.price === "number"
        ? i.price * i.quantity
        : 0),
    0
  );
}

export default function AppointmentBooking({
  enabled,
  businessId,
  mode,
  services,
  events,
  advanceDays,
  maxPartySize,
  primaryColor,
}: Props) {
  const activeMode: BookingMode =
    mode === "TABLE" ||
    mode === "ORDER" ||
    mode === "TOKEN" ||
    mode === "EVENT" ||
    mode === "RENTAL"
      ? mode
      : "APPOINTMENT";

  const meta =
    MODE_META[activeMode] ??
    MODE_META.APPOINTMENT;

  const list = useMemo(
    () =>
      Array.isArray(services)
        ? services.filter(
            (s) => s && s.id && s.name
          )
        : [],
    [services]
  );

  const eventList = useMemo(
    () =>
      Array.isArray(events)
        ? events.filter(
            (e) => e && e.id && e.name
          )
        : [],
    [events]
  );

  const days = Math.min(
    Math.max(advanceDays ?? 14, 1),
    90
  );
  const maxParty = Math.min(
    Math.max(maxPartySize ?? 12, 1),
    100
  );

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<
    string
  >("start");

  // Shared
  const [service, setService] =
    useState<ServiceConfig | null>(null);
  const [event, setEvent] =
    useState<EventConfig | null>(null);
  const [dateKey, setDateKey] =
    useState("");
  const [endDateKey, setEndDateKey] =
    useState("");
  const [slots, setSlots] = useState<
    Slot[]
  >([]);
  const [slotsLoading, setSlotsLoading] =
    useState(false);
  const [slot, setSlot] =
    useState<Slot | null>(null);
  const [partySize, setPartySize] =
    useState(2);
  const [cart, setCart] = useState<
    CartItem[]
  >([]);

  // Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneInfo, setDoneInfo] =
    useState<{
      ref: string;
      token?: number;
    } | null>(null);

  const dateOptions = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      out.push(toDateKey(d));
    }
    return out;
  }, [days]);

  /* ---------------- reset on open ---------------- */

  useEffect(() => {
    if (!open) return;
    setError("");
    setDoneInfo(null);
    setSlot(null);
    setCart([]);
    setName("");
    setPhone("");
    setNote("");
    setPartySize(2);
    setDateKey("");
    setEndDateKey("");

    if (
      activeMode === "APPOINTMENT" ||
      activeMode === "TOKEN" ||
      activeMode === "RENTAL"
    ) {
      if (list.length === 1) {
        setService(list[0]);
        setStep(
          activeMode === "TOKEN"
            ? "details"
            : activeMode === "RENTAL"
              ? "range"
              : "date"
        );
      } else {
        setService(null);
        setStep("service");
      }
    } else if (activeMode === "EVENT") {
      setEvent(null);
      setStep("event");
    } else if (activeMode === "ORDER") {
      setStep("products");
    } else {
      // TABLE
      setStep("date");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeMode]);

  /* ---------------- load slots ---------------- */

  useEffect(() => {
    if (
      !open ||
      step !== "slot" ||
      !dateKey ||
      (activeMode === "APPOINTMENT" &&
        !service)
    )
      return;

    let cancelled = false;
    setSlotsLoading(true);
    setError("");

    const url =
      `${API_ROOT}/appointments/public/businesses/${encodeURIComponent(
        businessId
      )}/slots?date=${encodeURIComponent(
        dateKey
      )}` +
      (service
        ? `&serviceId=${encodeURIComponent(
            service.id
          )}`
        : "");

    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok)
          throw new Error(
            j?.message ||
              "Could not load slots."
          );
        return j?.data?.slots ?? [];
      })
      .then((s: Slot[]) => {
        if (!cancelled) setSlots(s);
      })
      .catch((e: Error) => {
        if (!cancelled)
          setError(e.message);
      })
      .finally(() => {
        if (!cancelled)
          setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    open,
    step,
    dateKey,
    service,
    businessId,
    activeMode,
  ]);

  /* ---------------- load events ---------------- */

  const [eventsLoading, setEventsLoading] =
    useState(false);
  const [liveEvents, setLiveEvents] =
    useState<EventConfig[]>(eventList);

  useEffect(() => {
    if (
      !open ||
      activeMode !== "EVENT" ||
      step !== "event"
    )
      return;
    let cancelled = false;
    setEventsLoading(true);
    fetch(
      `${API_ROOT}/appointments/public/businesses/${encodeURIComponent(
        businessId
      )}/events`,
      { cache: "no-store" }
    )
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error();
        return j?.data ?? [];
      })
      .then((evts: EventConfig[]) => {
        if (!cancelled)
          setLiveEvents(evts);
      })
      .catch(() => {
        if (!cancelled)
          setLiveEvents(eventList);
      })
      .finally(() => {
        if (!cancelled)
          setEventsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    open,
    activeMode,
    step,
    businessId,
    eventList,
  ]);

  /* ---------------- visibility ---------------- */

  const needsServices =
    activeMode === "APPOINTMENT" ||
    activeMode === "TOKEN" ||
    activeMode === "RENTAL" ||
    activeMode === "ORDER" ||
    activeMode === "TABLE";

  if (!enabled) return null;
  if (
    needsServices &&
    activeMode !== "TABLE" &&
    list.length === 0
  )
    return null;
  if (
    activeMode === "EVENT" &&
    eventList.length === 0
  )
    return null;

  /* ---------------- actions ---------------- */

  const addToCart = (
    s: ServiceConfig
  ) => {
    setCart((prev) => {
      const found = prev.find(
        (i) => i.id === s.id
      );
      if (found) {
        return prev.map((i) =>
          i.id === s.id
            ? {
                ...i,
                quantity:
                  i.quantity + 1,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id: s.id,
          name: s.name,
          quantity: 1,
          price: s.price,
        },
      ];
    });
  };

  const changeQty = (
    id: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? {
                ...i,
                quantity: Math.max(
                  0,
                  i.quantity + delta
                ),
              }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const submit = async (
    payload: Record<string, any>
  ) => {
    if (
      !name.trim() ||
      !phone.trim()
    ) {
      setError(
        "Please fill in your name and phone number."
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      const r = await fetch(
        `${API_ROOT}/appointments/public/businesses/${encodeURIComponent(
          businessId
        )}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...payload,
            customerName: name.trim(),
            customerPhone:
              phone.trim(),
            note:
              note.trim() ||
              undefined,
          }),
        }
      );

      const j = await r.json();
      if (!r.ok) {
        throw new Error(
          j?.message ||
            "Booking failed. Please try again."
        );
      }

      setDoneInfo({
        ref: j?.data?.id
          ? String(j.data.id)
              .slice(-6)
              .toUpperCase()
          : "",
        token:
          typeof j?.data?.tokenNumber ===
          "number"
            ? j.data.tokenNumber
            : undefined,
      });
      setStep("done");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Booking failed."
      );
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- render helpers ---------------- */

  const detailsForm = (
    summary: React.ReactNode,
    onConfirm: () => void,
    confirmLabel = "Confirm"
  ) => (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
        {summary}
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Your name"
        maxLength={80}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        placeholder="Phone number"
        maxLength={20}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
      <textarea
        value={note}
        onChange={(e) =>
          setNote(e.target.value)
        }
        placeholder="Note (optional)"
        maxLength={500}
        rows={2}
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="w-full rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow transition active:scale-[0.99] disabled:opacity-60"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        {busy ? "Please wait…" : confirmLabel}
      </button>
    </div>
  );

  const backBtn = (
    label: string,
    onBack: () => void
  ) => (
    <button
      type="button"
      onClick={onBack}
      className="text-xs font-semibold text-slate-400 hover:text-slate-600"
    >
      ← {label}
    </button>
  );

  const sectionLabel = (t: string) => (
    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {t}
    </p>
  );

  /* ================================================== */

  return (
    <section className="mt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-lg transition active:scale-[0.99]"
          style={{
            backgroundColor: primaryColor,
          }}
        >
          {meta.button}
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              {meta.title}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}

          {/* ============ APPOINTMENT ============ */}
          {activeMode === "APPOINTMENT" && (
            <>
              {step === "service" && (
                <div className="mt-4 space-y-2">
                  {sectionLabel(
                    "Choose a service"
                  )}
                  {list.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setService(s);
                        setStep("date");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <span>
                        <span className="block text-sm font-bold text-slate-900">
                          {s.name}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {s.durationMinutes}{" "}
                          min
                          {formatPrice(
                            s.price
                          )}
                        </span>
                      </span>
                      <span className="text-slate-300">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === "date" &&
                service && (
                  <div className="mt-4">
                    {backBtn(
                      service.name,
                      () =>
                        list.length === 1
                          ? setOpen(false)
                          : setStep(
                              "service"
                            )
                    )}
                    {sectionLabel(
                      "Choose a date"
                    )}
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {dateOptions.map(
                        (key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setDateKey(key);
                              setSlot(null);
                              setStep("slot");
                            }}
                            className="rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {formatDateLabel(
                              key
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

              {step === "slot" &&
                service &&
                dateKey && (
                  <div className="mt-4">
                    {backBtn(
                      formatDateLabel(
                        dateKey
                      ),
                      () =>
                        setStep("date")
                    )}
                    {sectionLabel(
                      "Choose a time"
                    )}
                    {slotsLoading ? (
                      <p className="mt-3 text-sm text-slate-400">
                        Loading slots…
                      </p>
                    ) : slots.filter(
                        (s) => s.available
                      ).length === 0 ? (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
                        No slots on this
                        day. Try another
                        date.
                      </p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {slots
                          .filter(
                            (s) =>
                              s.available
                          )
                          .map((s) => (
                            <button
                              key={
                                s.startTime
                              }
                              type="button"
                              onClick={() => {
                                setSlot(s);
                                setStep(
                                  "details"
                                );
                              }}
                              className="rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              {formatSlot(
                                s.startTime,
                                s.endTime
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

              {step === "details" &&
                service &&
                slot && (
                  <>
                    {backBtn(
                      "Change time",
                      () =>
                        setStep("slot")
                    )}
                    {detailsForm(
                      <>
                        <p className="font-bold text-slate-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateLabel(
                            dateKey
                          )}{" "}
                          ·{" "}
                          {formatSlot(
                            slot.startTime,
                            slot.endTime
                          )}
                          {formatPrice(
                            service.price
                          )}
                        </p>
                      </>,
                      () =>
                        submit({
                          serviceId:
                            service.id,
                          date: dateKey,
                          startTime:
                            slot.startTime,
                        }),
                      "Confirm Booking"
                    )}
                  </>
                )}
            </>
          )}

          {/* ============ TABLE ============ */}
          {activeMode === "TABLE" && (
            <>
              {step === "date" && (
                <div className="mt-4">
                  {sectionLabel(
                    "Choose a date"
                  )}
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {dateOptions.map(
                      (key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setDateKey(key);
                            setSlot(null);
                            setStep("slot");
                          }}
                          className="rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {formatDateLabel(
                            key
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {step === "slot" &&
                dateKey && (
                  <div className="mt-4">
                    {backBtn(
                      formatDateLabel(
                        dateKey
                      ),
                      () =>
                        setStep("date")
                    )}
                    {sectionLabel(
                      "Choose a time"
                    )}
                    {slotsLoading ? (
                      <p className="mt-3 text-sm text-slate-400">
                        Loading…
                      </p>
                    ) : slots.filter(
                        (s) => s.available
                      ).length === 0 ? (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
                        Fully booked this
                        day. Try another
                        date.
                      </p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {slots
                          .filter(
                            (s) =>
                              s.available
                          )
                          .map((s) => (
                            <button
                              key={
                                s.startTime
                              }
                              type="button"
                              onClick={() => {
                                setSlot(s);
                                setStep(
                                  "party"
                                );
                              }}
                              className="rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              {formatSlot(
                                s.startTime,
                                s.endTime
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

              {step === "party" &&
                slot && (
                  <div className="mt-4">
                    {backBtn(
                      "Change time",
                      () =>
                        setStep("slot")
                    )}
                    {sectionLabel(
                      "How many guests?"
                    )}
                    <div className="mt-2 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setPartySize((p) =>
                            Math.max(1, p - 1)
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="text-2xl font-extrabold">
                        {partySize}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPartySize((p) =>
                            Math.min(
                              maxParty,
                              p + 1
                            )
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setStep(
                          list.length > 0
                            ? "menu"
                            : "details"
                        )
                      }
                      className="mt-4 w-full rounded-xl px-5 py-3 text-sm font-bold text-white"
                      style={{
                        backgroundColor:
                          primaryColor,
                      }}
                    >
                      Continue
                    </button>
                  </div>
                )}

              {step === "menu" && (
                <div className="mt-4">
                  {backBtn(
                    "Change guests",
                    () =>
                      setStep("party")
                  )}
                  {sectionLabel(
                    "Pre-order food (optional)"
                  )}
                  <div className="mt-2 space-y-2">
                    {list.map((s) => {
                      const inCart =
                        cart.find(
                          (i) =>
                            i.id === s.id
                        );
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {s.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {s.price
                                ? `₹${s.price}`
                                : ""}
                            </p>
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  changeQty(
                                    s.id,
                                    -1
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold"
                              >
                                −
                              </button>
                              <span className="text-sm font-bold">
                                {
                                  inCart.quantity
                                }
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  changeQty(
                                    s.id,
                                    1
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                addToCart(s)
                              }
                              className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setStep("details")
                    }
                    className="mt-4 w-full rounded-xl px-5 py-3 text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        primaryColor,
                    }}
                  >
                    Continue
                    {cart.length > 0
                      ? ` · ${cart.reduce(
                          (s, i) =>
                            s + i.quantity,
                          0
                        )} items`
                      : ""}
                  </button>
                </div>
              )}

              {step === "details" &&
                slot && (
                  <>
                    {backBtn(
                      "Back",
                      () =>
                        setStep(
                          list.length > 0
                            ? "menu"
                            : "party"
                        )
                    )}
                    {detailsForm(
                      <>
                        <p className="font-bold text-slate-900">
                          Table for{" "}
                          {partySize}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateLabel(
                            dateKey
                          )}{" "}
                          ·{" "}
                          {formatSlot(
                            slot.startTime,
                            slot.endTime
                          )}
                        </p>
                        {cart.length >
                          0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            Pre-order:{" "}
                            {cart
                              .map(
                                (i) =>
                                  `${i.name} ×${i.quantity}`
                              )
                              .join(", ")}
                          </p>
                        )}
                      </>,
                      () =>
                        submit({
                          date: dateKey,
                          startTime:
                            slot.startTime,
                          partySize,
                          items:
                            cart.length > 0
                              ? cart
                              : undefined,
                        }),
                      "Confirm Table"
                    )}
                  </>
                )}
            </>
          )}

          {/* ============ ORDER ============ */}
          {activeMode === "ORDER" && (
            <>
              {step === "products" && (
                <div className="mt-4">
                  {sectionLabel(
                    "Choose products"
                  )}
                  <div className="mt-2 space-y-2">
                    {list.map((s) => {
                      const inCart =
                        cart.find(
                          (i) =>
                            i.id === s.id
                        );
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {s.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {s.price
                                ? `₹${s.price}`
                                : ""}
                            </p>
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  changeQty(
                                    s.id,
                                    -1
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold"
                              >
                                −
                              </button>
                              <span className="text-sm font-bold">
                                {
                                  inCart.quantity
                                }
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  changeQty(
                                    s.id,
                                    1
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                addToCart(s)
                              }
                              className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={
                      cart.length === 0
                    }
                    onClick={() =>
                      setStep("details")
                    }
                    className="mt-4 w-full rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
                    style={{
                      backgroundColor:
                        primaryColor,
                    }}
                  >
                    Continue ·{" "}
                    {cart.reduce(
                      (s, i) =>
                        s + i.quantity,
                      0
                    )}{" "}
                    items
                    {cartTotal(cart) > 0
                      ? ` · ₹${cartTotal(
                          cart
                        )}`
                      : ""}
                  </button>
                </div>
              )}

              {step === "details" && (
                <>
                  {backBtn(
                    "Back to products",
                    () =>
                      setStep("products")
                  )}
                  {detailsForm(
                    <>
                      <p className="font-bold text-slate-900">
                        Your order
                      </p>
                      <p className="text-xs text-slate-500">
                        {cart
                          .map(
                            (i) =>
                              `${i.name} ×${i.quantity}`
                          )
                          .join(", ")}
                      </p>
                      {cartTotal(cart) >
                        0 && (
                        <p className="mt-1 text-sm font-bold">
                          Total: ₹
                          {cartTotal(cart)}
                        </p>
                      )}
                    </>,
                    () =>
                      submit({
                        items: cart,
                      }),
                    "Place Order"
                  )}
                </>
              )}
            </>
          )}

          {/* ============ TOKEN ============ */}
          {activeMode === "TOKEN" && (
            <>
              {step === "service" && (
                <div className="mt-4 space-y-2">
                  {sectionLabel(
                    "Choose counter / department"
                  )}
                  {list.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setService(s);
                        setStep("details");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <span className="text-sm font-bold text-slate-900">
                        {s.name}
                      </span>
                      <span className="text-slate-300">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === "details" && (
                <>
                  {list.length > 1 &&
                    backBtn(
                      "Change",
                      () =>
                        setStep("service")
                    )}
                  {detailsForm(
                    <>
                      <p className="font-bold text-slate-900">
                        Token for today
                      </p>
                      <p className="text-xs text-slate-500">
                        {service?.name ??
                          "General"}{" "}
                        ·{" "}
                        {formatDateLabel(
                          toDateKey(new Date())
                        )}
                      </p>
                    </>,
                    () =>
                      submit({
                        serviceId:
                          service?.id,
                      }),
                    "Get Token"
                  )}
                </>
              )}
            </>
          )}

          {/* ============ EVENT ============ */}
          {activeMode === "EVENT" && (
            <>
              {step === "event" && (
                <div className="mt-4 space-y-2">
                  {sectionLabel(
                    "Choose an event"
                  )}
                  {eventsLoading ? (
                    <p className="text-sm text-slate-400">
                      Loading events…
                    </p>
                  ) : liveEvents.length ===
                    0 ? (
                    <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
                      No upcoming events.
                    </p>
                  ) : (
                    liveEvents.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        disabled={
                          (e.seatsLeft ??
                            1) <= 0
                        }
                        onClick={() => {
                          setEvent(e);
                          setPartySize(1);
                          setStep("seats");
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 disabled:opacity-40"
                      >
                        <span>
                          <span className="block text-sm font-bold text-slate-900">
                            {e.name}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {formatDateLabel(
                              e.date
                            )}
                            {typeof e.seatsLeft ===
                            "number"
                              ? ` · ${e.seatsLeft} seats left`
                              : ""}
                            {formatPrice(
                              e.price
                            )}
                          </span>
                        </span>
                        <span className="text-slate-300">
                          →
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {step === "seats" &&
                event && (
                  <div className="mt-4">
                    {backBtn(
                      event.name,
                      () =>
                        setStep("event")
                    )}
                    {sectionLabel(
                      "How many seats?"
                    )}
                    <div className="mt-2 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setPartySize((p) =>
                            Math.max(1, p - 1)
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="text-2xl font-extrabold">
                        {partySize}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPartySize((p) =>
                            Math.min(
                              20,
                              p + 1
                            )
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setStep("details")
                      }
                      className="mt-4 w-full rounded-xl px-5 py-3 text-sm font-bold text-white"
                      style={{
                        backgroundColor:
                          primaryColor,
                      }}
                    >
                      Continue
                    </button>
                  </div>
                )}

              {step === "details" &&
                event && (
                  <>
                    {backBtn(
                      "Change seats",
                      () =>
                        setStep("seats")
                    )}
                    {detailsForm(
                      <>
                        <p className="font-bold text-slate-900">
                          {event.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateLabel(
                            event.date
                          )}{" "}
                          · {partySize}{" "}
                          seat
                          {partySize > 1
                            ? "s"
                            : ""}
                          {formatPrice(
                            event.price
                          )}
                        </p>
                      </>,
                      () =>
                        submit({
                          serviceId:
                            event.id,
                          partySize,
                        }),
                      "Book Seats"
                    )}
                  </>
                )}
            </>
          )}

          {/* ============ RENTAL ============ */}
          {activeMode === "RENTAL" && (
            <>
              {step === "service" && (
                <div className="mt-4 space-y-2">
                  {sectionLabel(
                    "Choose an item"
                  )}
                  {list.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setService(s);
                        setStep("range");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <span>
                        <span className="block text-sm font-bold text-slate-900">
                          {s.name}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {s.price
                            ? `₹${s.price}/day`
                            : ""}
                        </span>
                      </span>
                      <span className="text-slate-300">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === "range" &&
                service && (
                  <div className="mt-4 space-y-3">
                    {backBtn(
                      service.name,
                      () =>
                        list.length === 1
                          ? setOpen(false)
                          : setStep(
                              "service"
                            )
                    )}
                    <div>
                      {sectionLabel(
                        "From date"
                      )}
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {dateOptions
                          .slice(0, 21)
                          .map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setDateKey(key);
                                setEndDateKey(
                                  ""
                                );
                              }}
                              className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                                dateKey ===
                                key
                                  ? "border-slate-950 bg-slate-950 text-white"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {formatDateLabel(
                                key
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                    {dateKey && (
                      <div>
                        {sectionLabel(
                          "To date"
                        )}
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {dateOptions
                            .filter(
                              (k) =>
                                k > dateKey
                            )
                            .slice(0, 21)
                            .map((key) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setEndDateKey(
                                    key
                                  );
                                  setStep(
                                    "details"
                                  );
                                }}
                                className="rounded-xl border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {formatDateLabel(
                                  key
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {step === "details" &&
                service &&
                dateKey &&
                endDateKey && (
                  <>
                    {backBtn(
                      "Change dates",
                      () =>
                        setStep("range")
                    )}
                    {detailsForm(
                      <>
                        <p className="font-bold text-slate-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateLabel(
                            dateKey
                          )}{" "}
                          →{" "}
                          {formatDateLabel(
                            endDateKey
                          )}
                          {service.price
                            ? ` · ₹${service.price}/day`
                            : ""}
                        </p>
                      </>,
                      () =>
                        submit({
                          serviceId:
                            service.id,
                          date: dateKey,
                          endDate:
                            endDateKey,
                        }),
                      "Request Rental"
                    )}
                  </>
                )}
            </>
          )}

          {/* ============ DONE ============ */}
          {step === "done" &&
            doneInfo && (
              <div className="mt-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                  ✅
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">
                  {activeMode === "TOKEN"
                    ? "Token issued!"
                    : activeMode ===
                        "ORDER"
                      ? "Order placed!"
                      : activeMode ===
                          "EVENT"
                        ? "Seats booked!"
                        : activeMode ===
                            "RENTAL"
                          ? "Rental requested!"
                          : activeMode ===
                              "TABLE"
                            ? "Table booked!"
                            : "Booking received!"}
                </p>
                {typeof doneInfo.token ===
                  "number" && (
                  <p className="mt-2 text-4xl font-extrabold text-slate-950">
                    #{doneInfo.token}
                  </p>
                )}
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {doneInfo.token ===
                  undefined
                    ? "The business will confirm shortly on your phone."
                    : "Show this token at the counter."}
                  {doneInfo.ref
                    ? ` Ref: ${doneInfo.ref}`
                    : ""}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="mt-4 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Done
                </button>
              </div>
            )}
        </div>
      )}
    </section>
  );
}
