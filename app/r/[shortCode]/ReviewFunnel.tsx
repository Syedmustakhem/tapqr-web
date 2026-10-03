"use client";

import { useState } from "react";

/*
 * ============================================================
 * REVIEW FUNNEL (Pro feature)
 * ============================================================
 *
 * Star-first rating gate for the public scan experience.
 *
 *   4-5 stars -> happy path: big Google-review CTA
 *                (+ optional in-house review)
 *   1-3 stars -> private path: feedback goes ONLY to the
 *                owner (isPrivateFeedback: true) — it never
 *                appears on the public review list.
 *
 * Rendered by ReviewsSection when reviewFunnelEnabled is true.
 */

type ReviewFunnelProps = {
  businessId: string;
  qrCodeId?: string | null;
  verificationToken?: string | null;
  verificationReady?: boolean;
  externalReviewUrl?: string | null;
  primaryColor: string;
  buttonRadius: number;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.tapqr.shop"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API_ROOT = `${API_BASE}/api`;

type Step =
  | "rate"
  | "happy"
  | "private"
  | "done";

export default function ReviewFunnel({
  businessId,
  qrCodeId,
  verificationToken,
  verificationReady = false,
  externalReviewUrl,
  primaryColor,
  buttonRadius,
}: ReviewFunnelProps) {
  const [step, setStep] =
    useState<Step>("rate");
  const [stars, setStars] =
    useState(0);
  const [hoverStars, setHoverStars] =
    useState(0);

  const [name, setName] =
    useState("");
  const [comment, setComment] =
    useState("");

  const [showLocalForm, setShowLocalForm] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState("");
  const [doneKind, setDoneKind] = useState<
    "google" | "local" | "private" | null
  >(null);

  const pickStars = (value: number) => {
    setStars(value);
    setError("");

    if (value >= 4) {
      setStep("happy");
    } else {
      setStep("private");
    }
  };

  const submitFeedback = async (
    isPrivate: boolean
  ) => {
    if (!name.trim()) {
      setError(
        "Please tell us your name so the owner can follow up."
      );
      return;
    }

    if (comment.trim().length < 2) {
      setError(
        "Please write a few words about your visit."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_ROOT}/reviews/businesses/${encodeURIComponent(
          businessId
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            qrCodeId: qrCodeId || null,
            verificationToken:
              verificationToken || null,
            reviewerName:
              name.trim() || null,
            reviewerEmail: null,
            rating: stars,
            title: null,
            comment:
              comment.trim() || null,
            isPrivateFeedback:
              isPrivate,
          }),
        }
      );

      const data =
        (await response.json()) as {
          message?: string;
        };

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit. Please try again."
        );
      }

      setDoneKind(
        isPrivate
          ? "private"
          : "local"
      );
      setStep("done");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle: React.CSSProperties =
    {
      marginTop: 15,
      padding: "18px 16px",
      borderRadius: 16,
      background: "#ffffff",
      border:
        "1px solid #e2e8f0",
      boxShadow:
        "0 8px 24px rgba(15, 23, 42, 0.06)",
    };

  const starRow = (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        margin: "12px 0 4px",
      }}
    >
      {[1, 2, 3, 4, 5].map(
        (value) => {
          const active =
            value <=
            (hoverStars || stars);

          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${
                value > 1 ? "s" : ""
              }`}
              onClick={() =>
                pickStars(value)
              }
              onMouseEnter={() =>
                setHoverStars(value)
              }
              onMouseLeave={() =>
                setHoverStars(0)
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                fontSize: 38,
                lineHeight: 1,
                color: active
                  ? "#f59e0b"
                  : "#e2e8f0",
                transition:
                  "transform 0.12s ease",
                transform:
                  hoverStars ===
                  value
                    ? "scale(1.15)"
                    : "scale(1)",
              }}
            >
              ★
            </button>
          );
        }
      )}
    </div>
  );

  const fieldStyle: React.CSSProperties =
    {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      borderRadius: 10,
      border:
        "1px solid #e2e8f0",
      fontSize: 13,
      outline: "none",
    };

  /* ================= DONE ================= */

  if (step === "done") {
    return (
      <div style={cardStyle}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            color: "#111827",
            textAlign: "center",
          }}
        >
          {doneKind === "private"
            ? "Thank you for telling us privately."
            : "Thank you for your review!"}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          {doneKind === "private"
            ? "Your feedback went straight to the owner, who will personally look into it."
            : doneKind === "google"
              ? "Your Google review helps this business more than you know."
              : "Your review is on its way."}
        </p>
      </div>
    );
  }

  /* ================= RATE ================= */

  if (step === "rate") {
    return (
      <div style={cardStyle}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            color: "#111827",
            textAlign: "center",
          }}
        >
          How was your visit?
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Tap a star — it takes 3 seconds.
        </p>
        {starRow}
      </div>
    );
  }

  /* ================= HAPPY (4-5) ================= */

  if (step === "happy") {
    return (
      <div style={cardStyle}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            color: "#111827",
            textAlign: "center",
          }}
        >
          {stars === 5
            ? "Wow — 5 stars!"
            : "Great — 4 stars!"}{" "}
          🎉
        </p>

        {externalReviewUrl ? (
          <>
            <p
              style={{
                margin: "6px 0 12px",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "#64748b",
                textAlign: "center",
              }}
            >
              Loved it? A Google review
              takes 20 seconds and
              helps this business
              enormously.
            </p>
            <a
              href={externalReviewUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => {
                setDoneKind("google");
                setStep("done");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                gap: 8,
                width: "100%",
                boxSizing:
                  "border-box",
                padding: "12px",
                borderRadius:
                  buttonRadius,
                background:
                  primaryColor,
                color: "#ffffff",
                textDecoration:
                  "none",
                fontSize: 13.5,
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  fontSize: 17,
                }}
              >
                G
              </span>
              Review us on Google
            </a>
          </>
        ) : (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12.5,
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Thank you! Tell us a
            little more below.
          </p>
        )}

        {/* Optional in-house review */}
        {!showLocalForm ? (
          <button
            type="button"
            onClick={() =>
              setShowLocalForm(true)
            }
            style={{
              marginTop: 10,
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              color: primaryColor,
            }}
          >
            …or leave a review here
            instead
          </button>
        ) : (
          <div
            style={{ marginTop: 12 }}
          >
            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Your name"
              maxLength={100}
              style={{
                ...fieldStyle,
                marginBottom: 8,
              }}
            />
            <textarea
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="What did you love? (optional)"
              rows={3}
              maxLength={2000}
              style={{
                ...fieldStyle,
                resize: "vertical",
                marginBottom: 8,
              }}
            />
            {error && (
              <p
                style={{
                  margin:
                    "0 0 8px",
                  fontSize: 12,
                  color: "#dc2626",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={
                submitting ||
                !verificationReady
              }
              onClick={() =>
                void submitFeedback(
                  false
                )
              }
              style={{
                width: "100%",
                padding: "11px",
                borderRadius:
                  buttonRadius,
                border: "none",
                background:
                  primaryColor,
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 800,
                cursor:
                  submitting ||
                  !verificationReady
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  submitting ||
                  !verificationReady
                    ? 0.55
                    : 1,
              }}
            >
              {submitting
                ? "Submitting…"
                : "Submit review"}
            </button>
            {!verificationReady && (
              <p
                style={{
                  margin:
                    "8px 0 0",
                  fontSize: 10,
                  color: "#94a3b8",
                  textAlign:
                    "center",
                }}
              >
                Preparing a secure
                QR interaction…
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setStep("rate");
            setStars(0);
            setShowLocalForm(false);
            setError("");
          }}
          style={{
            marginTop: 10,
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 11.5,
            color: "#94a3b8",
          }}
        >
          ← Change my rating
        </button>
      </div>
    );
  }

  /* ================= PRIVATE (1-3) ================= */

  return (
    <div style={cardStyle}>
      <p
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 800,
          color: "#111827",
          textAlign: "center",
        }}
      >
        We&apos;re sorry to hear
        that.
      </p>
      <p
        style={{
          margin: "6px 0 12px",
          fontSize: 12.5,
          lineHeight: 1.6,
          color: "#64748b",
          textAlign: "center",
        }}
      >
        Tell us privately what went
        wrong — this goes{" "}
        <strong>
          straight to the owner
        </strong>
        , not on the public page.
      </p>

      <input
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Your name"
        maxLength={100}
        style={{
          ...fieldStyle,
          marginBottom: 8,
        }}
      />
      <textarea
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        placeholder="What happened? How can we make it right?"
        rows={4}
        maxLength={2000}
        style={{
          ...fieldStyle,
          resize: "vertical",
          marginBottom: 8,
        }}
      />

      {error && (
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            color: "#dc2626",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={
          submitting ||
          !verificationReady
        }
        onClick={() =>
          void submitFeedback(true)
        }
        style={{
          width: "100%",
          padding: "11px",
          borderRadius:
            buttonRadius,
          border: "none",
          background:
            primaryColor,
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 800,
          cursor:
            submitting ||
            !verificationReady
              ? "not-allowed"
              : "pointer",
          opacity:
            submitting ||
            !verificationReady
              ? 0.55
              : 1,
        }}
      >
        {submitting
          ? "Sending…"
          : "Send private feedback"}
      </button>
      {!verificationReady && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 10,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          Preparing a secure QR
          interaction…
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setStep("rate");
          setStars(0);
          setError("");
        }}
        style={{
          marginTop: 10,
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 11.5,
          color: "#94a3b8",
        }}
      >
        ← Change my rating
      </button>
    </div>
  );
}
