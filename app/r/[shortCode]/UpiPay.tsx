"use client";

import {
  useEffect,
  useState,
} from "react";

import QRCode from "qrcode";

/*
 * ============================================================
 * UPI PAY-ON-SCAN (Pro feature #6)
 * ============================================================
 *
 * Scanner pays the business straight from the QR experience —
 * no login, no app, no backend involved. They enter an amount
 * (or tap a preset), then:
 *   - on mobile: the Pay button opens their UPI app
 *     (GPay / PhonePe / Paytm) with the business VPA,
 *     payee name and amount pre-filled;
 *   - on desktop: a QR of the same UPI intent is shown,
 *     scannable with any UPI app.
 *
 * Rendered by GuestExperience when:
 *   - upiPayEnabled is true, AND
 *   - the business has a valid UPI VPA.
 *
 * The owner enables it from Dashboard → Business →
 * "UPI Pay" panel (Pro): VPA + payee name + preset amounts.
 *
 * NOTE: UPI intents are client-side only. TapQR never sees
 * the money — like cash, the owner confirms receipt.
 */

type Props = {
  enabled?: boolean | null;
  businessName: string;
  upiVpa?: string | null;
  upiPayeeName?: string | null;
  upiPresetAmounts?: unknown;
  primaryColor: string;
};

function parsePresets(
  raw: unknown
): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (n): n is number =>
        typeof n === "number" &&
        Number.isFinite(n) &&
        n > 0
    )
    .slice(0, 6);
}

function isValidVpa(
  vpa: string | null | undefined
): vpa is string {
  return (
    typeof vpa === "string" &&
    /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(
      vpa.trim()
    )
  );
}

function formatINR(n: number): string {
  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(n);
  } catch {
    return `₹${n}`;
  }
}

function buildUpiIntent(
  vpa: string,
  payeeName: string,
  amount: number
): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName || vpa,
    cu: "INR",
    tn: "TapQR payment",
  });

  if (amount > 0) {
    params.set(
      "am",
      amount.toFixed(2)
    );
  }

  return `upi://pay?${params.toString()}`;
}

export default function UpiPay({
  enabled,
  businessName,
  upiVpa,
  upiPayeeName,
  upiPresetAmounts,
  primaryColor,
}: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [qrDataUrl, setQrDataUrl] =
    useState<string | null>(null);

  const vpaValid = isValidVpa(upiVpa);
  const vpa = vpaValid
    ? upiVpa.trim()
    : "";
  const payee =
    upiPayeeName?.trim() ||
    businessName;
  const presets = parsePresets(
    upiPresetAmounts
  );

  const numericAmount = Number(amount);
  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= 1000000;

  const intent =
    enabled && vpaValid && validAmount
      ? buildUpiIntent(
          vpa,
          payee,
          numericAmount
        )
      : null;

  /*
   * Render the UPI intent as a QR for
   * desktop scanners / second phones.
   */
  useEffect(() => {
    if (!open || !intent) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(intent, {
      width: 220,
      margin: 1,
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, intent]);

  const payNow = () => {
    if (!intent) return;
    window.location.href = intent;
  };

  if (!enabled || !vpaValid) {
    return null;
  }

  return (
    <section className="mt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-lg transition active:scale-[0.99]"
          style={{
            backgroundColor:
              primaryColor,
          }}
        >
          <span aria-hidden>💸</span>
          Pay {businessName} via UPI
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              💸 Pay via UPI
            </h3>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setAmount("");
              }}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Paying{" "}
            <span className="font-bold text-slate-700">
              {payee}
            </span>{" "}
            ·{" "}
            <span className="font-mono">
              {vpa}
            </span>
          </p>

          {presets.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setAmount(String(p))
                  }
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                    Number(amount) === p
                      ? "text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                  style={
                    Number(amount) === p
                      ? {
                          backgroundColor:
                            primaryColor,
                          borderColor:
                            primaryColor,
                        }
                      : undefined
                  }
                >
                  {formatINR(p)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label
              htmlFor="tapqr-upi-amount"
              className="text-xs font-bold text-slate-500"
            >
              Amount (₹)
            </label>
            <input
              id="tapqr-upi-amount"
              type="number"
              min={1}
              max={1000000}
              inputMode="decimal"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="Enter amount"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={payNow}
            disabled={!validAmount}
            className="mt-4 w-full rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor:
                primaryColor,
            }}
          >
            {validAmount
              ? `Pay ${formatINR(
                  numericAmount
                )} via UPI`
              : "Enter an amount to pay"}
          </button>

          {qrDataUrl && (
            <div className="mt-5 flex flex-col items-center rounded-2xl bg-slate-50 p-4">
              <img
                src={qrDataUrl}
                alt="UPI payment QR"
                width={220}
                height={220}
                className="rounded-xl bg-white p-2 shadow-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                On a computer? Scan
                this QR with any UPI
                app to pay{" "}
                {formatINR(
                  numericAmount
                )}
                .
              </p>
            </div>
          )}

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
            Opens your UPI app with
            the details filled in.
            Confirm the VPA{" "}
            <span className="font-mono">
              {vpa}
            </span>{" "}
            before paying.
          </p>
        </div>
      )}
    </section>
  );
}
