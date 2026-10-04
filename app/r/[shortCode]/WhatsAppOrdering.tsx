"use client";

import { useMemo, useState } from "react";

/*
 * ============================================================
 * SCAN-TO-WHATSAPP ORDERING (Pro feature #5)
 * ============================================================
 *
 * Scanner builds a cart from the business catalog and sends
 * the order straight to the business on WhatsApp — no login,
 * no app, no backend order record. The order lands in the
 * owner's WhatsApp chat as a formatted message.
 *
 * Rendered by GuestExperience when:
 *   - whatsappOrderingEnabled is true, AND
 *   - the business has a WhatsApp number, AND
 *   - the catalog has at least one priced item.
 *
 * The owner enables it from Dashboard → Business →
 * "WhatsApp Ordering" panel (Pro). Products come from the
 * regular catalog — no separate menu to maintain.
 */

type CatalogItem = {
  id: string;
  name: string;
  price?: string | number | null;
  image?: string | null;
};

type Category = {
  id: string;
  name: string;
  items: CatalogItem[];
};

type Catalog = {
  id: string;
  name: string;
  categories: Category[];
};

type CartLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  enabled?: boolean | null;
  businessName: string;
  whatsappUrl?: string | null;
  catalogs?: Catalog[] | null;
  primaryColor: string;
};

function numericPrice(
  price: string | number | null | undefined
): number | null {
  if (
    price === null ||
    price === undefined ||
    price === ""
  )
    return null;
  const n =
    typeof price === "string"
      ? Number(price)
      : price;
  return Number.isNaN(n) || n < 0
    ? null
    : n;
}

function formatINR(n: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `₹${n}`;
  }
}

function phoneFromWaUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const m = url.match(
    /wa\.me\/(\d+)/
  );
  return m ? m[1] : null;
}

export default function WhatsAppOrdering({
  enabled,
  businessName,
  whatsappUrl,
  catalogs,
  primaryColor,
}: Props) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<
    CartLine[]
  >([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

const businessPhone = phoneFromWaUrl(whatsappUrl);

  const items = useMemo(() => {
    const out: {
      id: string;
      name: string;
      price: number;
      category: string;
      image?: string | null;
    }[] = [];
    for (const catalog of catalogs ??
      []) {
      for (const cat of catalog.categories ??
        []) {
        for (const item of cat.items ??
          []) {
          const p = numericPrice(
            item.price
          );
          if (p === null || !item.name)
            continue;
          out.push({
            id: item.id,
            name: item.name,
            price: p,
            category: cat.name,
            image: item.image,
          });
        }
      }
    }
    return out;
  }, [catalogs]);

  if (
    !enabled ||
!businessPhone ||
items.length === 0

  )
    return null;

  const addItem = (item: {
    id: string;
    name: string;
    price: number;
  }) => {
    setCart((prev) => {
      const found = prev.find(
        (l) => l.id === item.id
      );
      if (found) {
        return prev.map((l) =>
          l.id === item.id
            ? {
                ...l,
                quantity:
                  l.quantity + 1,
              }
            : l
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
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
        .map((l) =>
          l.id === id
            ? {
                ...l,
                quantity: Math.max(
                  0,
                  l.quantity + delta
                ),
              }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  };

  const total = cart.reduce(
    (s, l) => s + l.price * l.quantity,
    0
  );
  const count = cart.reduce(
    (s, l) => s + l.quantity,
    0
  );

  const orderOnWhatsApp = () => {
if (cart.length === 0 || !businessPhone)
      return;

    const lines = [
      `Hello ${businessName}! 👋`,
      "",
      "I'd like to order:",
      "",
      ...cart.map(
        (l) =>
          `• ${l.name} × ${
            l.quantity
          } — ${formatINR(
            l.price * l.quantity
          )}`
      ),
      "",
      `Total: ${formatINR(total)}`,
    ];

    if (name.trim())
      lines.push(
        "",
        `Name: ${name.trim()}`
      );
    if (phone.trim())
      lines.push(
        `Phone: ${phone.trim()}`
      );
    if (note.trim())
      lines.push(
        `Note: ${note.trim()}`
      );

    lines.push("", "— sent via TapQR");

const url = `https://wa.me/${businessPhone}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;

    window.open(url, "_blank");
  };

  // Group items by category for display.
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      typeof items
    >();
    for (const item of items) {
      const key =
        item.category || "Menu";
      if (!map.has(key))
        map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <section className="mt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-lg transition active:scale-[0.99]"
          style={{
            backgroundColor: "#25D366",
          }}
        >
          <span aria-hidden>💬</span>
          Order on WhatsApp
          {count > 0 ? (
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">
              {count}
            </span>
          ) : null}
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              💬 Order on WhatsApp
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Add items, then send your
            order straight to{" "}
            {businessName} on WhatsApp.
          </p>

          <div className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-1">
            {grouped.map(
              ([category, catItems]) => (
                <div key={category}>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {category}
                  </p>
                  <div className="mt-2 space-y-2">
                    {catItems.map(
                      (item) => {
                        const line =
                          cart.find(
                            (l) =>
                              l.id ===
                              item.id
                          );
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs font-semibold text-slate-500">
                                {formatINR(
                                  item.price
                                )}
                              </p>
                            </div>
                            {line ? (
                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeQty(
                                      item.id,
                                      -1
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold"
                                >
                                  −
                                </button>
                                <span className="text-sm font-bold">
                                  {
                                    line.quantity
                                  }
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeQty(
                                      item.id,
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
                                  addItem(
                                    item
                                  )
                                }
                                className="shrink-0 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  Total ({count} items)
                </span>
                <span className="text-base font-extrabold text-slate-950">
                  {formatINR(total)}
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name (optional)"
                maxLength={80}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Your phone (optional)"
                maxLength={20}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
              <input
                type="text"
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="Note for the shop (optional)"
                maxLength={200}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
              <button
                type="button"
                onClick={
                  orderOnWhatsApp
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow transition active:scale-[0.99]"
                style={{
                  backgroundColor:
                    "#25D366",
                }}
              >
                <span aria-hidden>
                  💬
                </span>
                Send order on WhatsApp
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
