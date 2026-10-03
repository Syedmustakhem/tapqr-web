"use client";

import { useEffect, useState } from "react";

/*
 * ============================================================
 * DIGITAL LOYALTY CARD (Pro feature #3)
 * ============================================================
 *
 * Stamp card on the public scan experience. No login, no app —
 * the card lives on the scanner's device (localStorage, keyed
 * by business id).
 *
 * Rules:
 *   - One stamp per calendar day per device (rescanning the
 *     same day doesn't farm stamps).
 *   - Stamps stop accumulating once the goal is reached.
 *   - When stamps reach the goal, the reward-unlocked state
 *     shows; the scanner shows the screen to claim.
 *
 * Rendered by GuestExperience below the Specials banner, when:
 *   - loyaltyCardEnabled is true, AND
 *   - stampsRequired >= 2.
 *
 * The owner edits it from Dashboard → Business → "Loyalty Card"
 * panel (Pro).
 */

type LoyaltyCardProps = {
  enabled?: boolean | null;
  businessId: string;
  title?: string | null;
  stampsRequired?: number | null;
  rewardDescription?: string | null;
  primaryColor: string;
};

type StampState = {
  stamps: number;
  lastStampDate: string; // "YYYY-MM-DD" local
};

function storageKey(
  businessId: string
): string {
  return `tapqr_loyalty_${businessId}`;
}

function todayKey(): string {
  const now = new Date();
  const pad = (n: number) =>
    String(n).padStart(2, "0");

  return (
    `${now.getFullYear()}-` +
    `${pad(now.getMonth() + 1)}-` +
    `${pad(now.getDate())}`
  );
}

function loadState(
  businessId: string
): StampState {
  const empty: StampState = {
    stamps: 0,
    lastStampDate: "",
  };

  try {
    const raw = localStorage.getItem(
      storageKey(businessId)
    );

    if (!raw) return empty;

    const parsed = JSON.parse(raw);

    if (
      typeof parsed?.stamps !==
      "number"
    ) {
      return empty;
    }

    return {
      stamps: Math.max(
        0,
        Math.floor(parsed.stamps)
      ),
      lastStampDate:
        typeof parsed.lastStampDate ===
        "string"
          ? parsed.lastStampDate
          : "",
    };
  } catch {
    return empty;
  }
}

function saveState(
  businessId: string,
  state: StampState
): void {
  try {
    localStorage.setItem(
      storageKey(businessId),
      JSON.stringify(state)
    );
  } catch {
    /* Storage unavailable — card still renders. */
  }
}

export default function LoyaltyCard({
  enabled,
  businessId,
  title,
  stampsRequired,
  rewardDescription,
  primaryColor,
}: LoyaltyCardProps) {
  const required = Math.min(
    Math.max(stampsRequired ?? 10, 2),
    30
  );

  const [state, setState] =
    useState<StampState>({
      stamps: 0,
      lastStampDate: "",
    });

  const [ready, setReady] =
    useState(false);

  const [justStamped, setJustStamped] =
    useState(false);

  useEffect(() => {
    if (!enabled || !businessId) {
      setReady(true);
      return;
    }

    const current =
      loadState(businessId);
    const today = todayKey();

    let next = current;
    let stamped = false;

    if (
      current.lastStampDate !==
        today &&
      current.stamps < required
    ) {
      next = {
        stamps: current.stamps + 1,
        lastStampDate: today,
      };
      saveState(businessId, next);
      stamped = true;
    }

    setState(next);
    setJustStamped(stamped);
    setReady(true);
  }, [enabled, businessId, required]);

  if (!enabled || !ready || !businessId) {
    return null;
  }

  const cleanTitle =
    title?.trim() || "Loyalty Card";
  const cleanReward =
    rewardDescription?.trim() || "";

  const complete =
    state.stamps >= required;

  const dots = Array.from(
    { length: required },
    (_, index) => index < state.stamps
  );

  return (
    <section
      aria-label="Loyalty card"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          borderRadius: 20,
          padding: "18px 20px",
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
          color: "#ffffff",
          boxShadow:
            "0 12px 32px rgba(15,23,42,0.18)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.12)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform:
                "uppercase",
              background:
                "rgba(255,255,255,0.22)",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            🎟️ Loyalty
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background:
                "rgba(0,0,0,0.22)",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            {state.stamps}/{required}{" "}
            stamps
          </span>

          {justStamped &&
            !complete && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background:
                    "rgba(255,255,255,0.22)",
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                +1 stamp today 🎉
              </span>
            )}
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
          }}
        >
          {cleanTitle}
</div>

{cleanReward && !complete && (
  <div
    style={{
      marginTop: 6,
      fontSize: 13,
      lineHeight: 1.5,
      opacity: 0.92,
    }}
  >
    🎁 Reward: {cleanReward}
  </div>
)}

{complete ? (

          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              🎉 Reward unlocked!
            </div>

            {cleanReward && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  lineHeight: 1.55,
                  opacity: 0.92,
                }}
              >
                {cleanReward}
              </div>
            )}

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                opacity: 0.75,
              }}
            >
              Show this screen to claim
              your reward.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {dots.map(
                (filled, index) => (
                  <span
                    key={index}
                    aria-hidden
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize: 12,
                      background: filled
                        ? "#ffffff"
                        : "rgba(255,255,255,0.25)",
                      border: filled
                        ? "none"
                        : "1.5px dashed rgba(255,255,255,0.6)",
                    }}
                  >
                    {filled ? "★" : ""}
                  </span>
                )
              )}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                opacity: 0.75,
              }}
            >
              {state.lastStampDate ===
              todayKey()
                ? "See you tomorrow for your next stamp."
                : "Scan again on your next visit to collect a stamp."}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
