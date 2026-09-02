 "use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Star,
} from "lucide-react";

type Review = {
  id: string;
  reviewerName?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerified?: boolean;
  ownerResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
};

type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  distribution: Array<{
    rating: number;
    count: number;
  }>;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

interface ReviewsSectionProps {
  businessId: string;
  qrCodeId?: string | null;
  verificationToken?: string | null;
  verificationReady?: boolean;
  externalReviewUrl?: string | null;
  primaryColor: string;
  buttonRadius: number;
}

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ||
    "https://api.tapqr.shop")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const API_ROOT =
  `${API_BASE}/api`;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(
  name?: string | null
) {
  const value = name?.trim();

  if (!value) return "G";

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

export default function ReviewsSection({
  businessId,
  qrCodeId,
  verificationToken,
  verificationReady = false,
  externalReviewUrl,
  primaryColor,
  buttonRadius,
}: ReviewsSectionProps) {
  const [summary, setSummary] =
    useState<ReviewSummary | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [rating, setRating] =
    useState(0);

  const [hoverRating, setHoverRating] =
    useState(0);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [submittedRating, setSubmittedRating] =
    useState<number | null>(null);

  const ratingLabel =
    useMemo(() => {
      switch (
        hoverRating || rating
      ) {
        case 5:
          return "Excellent";
        case 4:
          return "Very good";
        case 3:
          return "Good";
        case 2:
          return "Needs improvement";
        case 1:
          return "Poor";
        default:
          return "Select a rating";
      }
    }, [hoverRating, rating]);

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        reviewsResponse,
      ] = await Promise.all([
        fetch(
          `${API_ROOT}/reviews/businesses/${encodeURIComponent(
            businessId
          )}/summary`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        ),
        fetch(
          `${API_ROOT}/reviews/businesses/${encodeURIComponent(
            businessId
          )}?page=1&limit=5`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        ),
      ]);

      if (summaryResponse.ok) {
        const data =
          (await summaryResponse.json()) as ApiEnvelope<ReviewSummary>;

        if (
          data.success &&
          data.data
        ) {
          setSummary(data.data);
        }
      }

      if (reviewsResponse.ok) {
        const data =
          (await reviewsResponse.json()) as ApiEnvelope<{
            reviews: Review[];
          }>;

        if (
          data.success &&
          data.data
        ) {
          setReviews(
            data.data.reviews || []
          );
        }
      }
    } catch (requestError) {
      console.error(
        "TapQR Reviews load error:",
        requestError
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [businessId]);

  async function submitReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (rating < 1 || rating > 5) {
      setError(
        "Please select a star rating."
      );
      return;
    }

    if (
      !name.trim() &&
      !email.trim()
    ) {
      setError(
        "Please provide your name or email address."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await fetch(
          `${API_ROOT}/reviews/businesses/${encodeURIComponent(
            businessId
          )}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              qrCodeId:
                qrCodeId || null,
              verificationToken:
                verificationToken || null,
              reviewerName:
                name.trim() || null,
              reviewerEmail:
                email.trim() || null,
              rating,
              title:
                title.trim() || null,
              comment:
                comment.trim() || null,
            }),
          }
        );

      const data =
        (await response.json()) as ApiEnvelope<unknown>;

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit your review."
        );
      }

      setSubmittedRating(rating);
      setMessage(
        data.message ||
          "Thank you. Your review has been submitted for moderation."
      );

      setRating(0);
      setHoverRating(0);
      setTitle("");
      setComment("");

      await loadReviews();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      style={{
        marginTop: 40,
      }}
    >
      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: 24,
          padding:
            "24px 20px",
          boxShadow:
            "0 8px 30px rgba(15,23,42,.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent:
              "space-between",
            gap: 18,
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color:
                  primaryColor,
                fontSize: 11,
                fontWeight: 800,
                textTransform:
                  "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Customer feedback
            </p>

            <h2
              style={{
                margin:
                  "5px 0 0",
                fontSize: 28,
                lineHeight: 1.15,
                fontWeight: 800,
                color:
                  "#111827",
              }}
            >
              Reviews
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                fontSize: 14,
                lineHeight: 1.6,
                color:
                  "#6b7280",
              }}
            >
              Share your experience with this business.
            </p>
          </div>

          <div
            style={{
              minWidth: 145,
              padding:
                "12px 14px",
              borderRadius: 16,
              background:
                "#f8fafc",
              border:
                "1px solid #eef2f7",
              textAlign:
                "center",
            }}
          >
            {loading ? (
              <div
                style={{
                  color:
                    "#94a3b8",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Loading...
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 25,
                    fontWeight: 800,
                    color:
                      "#111827",
                  }}
                >
                  {(
                    summary?.averageRating ??
                    0
                  ).toFixed(1)}
                  <span
                    style={{
                      marginLeft: 3,
                      fontSize: 16,
                      color:
                        "#f59e0b",
                    }}
                  >
                    ★
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    color:
                      "#64748b",
                    fontWeight: 600,
                  }}
                >
                  {summary?.totalReviews ??
                    0}{" "}
                  reviews
                </div>
              </>
            )}
          </div>
        </div>

        {!loading &&
          summary &&
          summary.totalReviews > 0 && (
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gap: 7,
              }}
            >
              {[5, 4, 3, 2, 1].map(
                (star) => {
                  const count =
                    summary.distribution.find(
                      (item) =>
                        item.rating ===
                        star
                    )?.count ??
                    0;

                  const percentage =
                    summary.totalReviews >
                    0
                      ? (count /
                          summary.totalReviews) *
                        100
                      : 0;

                  return (
                    <div
                      key={star}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "30px 1fr 35px",
                        alignItems:
                          "center",
                        gap: 8,
                        fontSize: 11,
                        color:
                          "#64748b",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                        }}
                      >
                        {star}★
                      </span>

                      <div
                        style={{
                          height: 7,
                          overflow:
                            "hidden",
                          borderRadius: 999,
                          background:
                            "#eef2f7",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            borderRadius:
                              999,
                            background:
                              "#f59e0b",
                          }}
                        />
                      </div>

                      <span
                        style={{
                          textAlign:
                            "right",
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}

        <form
          onSubmit={submitReview}
          style={{
            marginTop: 25,
            paddingTop: 22,
            borderTop:
              "1px solid #eef2f7",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 800,
              color:
                "#111827",
            }}
          >
            Leave a review
          </h3>

          <div
            style={{
              marginTop: 13,
              display: "flex",
              alignItems:
                "center",
              gap: 5,
              flexWrap:
                "wrap",
            }}
          >
            {[1, 2, 3, 4, 5].map(
              (star) => {
                const active =
                  star <=
                  (hoverRating ||
                    rating);

                return (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star`}
                    onMouseEnter={() =>
                      setHoverRating(
                        star
                      )
                    }
                    onMouseLeave={() =>
                      setHoverRating(
                        0
                      )
                    }
                    onClick={() =>
                      setRating(
                        star
                      )
                    }
                    style={{
                      width: 38,
                      height: 38,
                      border: "none",
                      background:
                        "transparent",
                      padding: 0,
                      cursor:
                        "pointer",
                      color: active
                        ? "#f59e0b"
                        : "#cbd5e1",
                    }}
                  >
                    <Star
                      fill={
                        active
                          ? "currentColor"
                          : "none"
                      }
                      style={{
                        width: 28,
                        height: 28,
                      }}
                    />
                  </button>
                );
              }
            )}

            <span
              style={{
                marginLeft: 7,
                fontSize: 12,
                fontWeight: 700,
                color:
                  "#64748b",
              }}
            >
              {ratingLabel}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
              marginTop: 14,
            }}
          >
            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target
                    .value
                )
              }
              placeholder="Your name"
              autoComplete="name"
              maxLength={100}
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "12px 13px",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  12,
                outline: "none",
                fontSize: 13,
                color:
                  "#111827",
              }}
            />

            <input
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target
                    .value
                )
              }
              placeholder="Email (optional)"
              type="email"
              autoComplete="email"
              maxLength={254}
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "12px 13px",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  12,
                outline: "none",
                fontSize: 13,
                color:
                  "#111827",
              }}
            />
          </div>

          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Review title (optional)"
            maxLength={120}
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              marginTop: 10,
              padding:
                "12px 13px",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                12,
              outline: "none",
              fontSize: 13,
              color:
                "#111827",
            }}
          />

          <textarea
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value
              )
            }
            placeholder="Tell us about your experience..."
            maxLength={2000}
            rows={4}
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              marginTop: 10,
              padding:
                "12px 13px",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                12,
              outline: "none",
              resize: "vertical",
              fontSize: 13,
              lineHeight: 1.5,
              color:
                "#111827",
            }}
          />

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 10,
                padding:
                  "10px 12px",
                borderRadius:
                  11,
                background:
                  "#fef2f2",
                border:
                  "1px solid #fecaca",
                color:
                  "#b91c1c",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              style={{
                marginTop: 10,
                padding:
                  "10px 12px",
                borderRadius:
                  11,
                background:
                  "#ecfdf5",
                border:
                  "1px solid #a7f3d0",
                color:
                  "#047857",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems:
                    "flex-start",
                }}
              >
                <CheckCircle2
                  style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                  }}
                />

                <span>
                  {message}
                </span>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems:
                "center",
              justifyContent:
                "space-between",
              flexWrap:
                "wrap",
              marginTop: 13,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color:
                  "#94a3b8",
              }}
            >
              {!verificationReady
                ? "Preparing a secure QR interaction..."
                : verificationToken
                  ? "This review can be marked as verified after moderation."
                  : "Reviews are moderated before publication."}
            </span>

            <button
              type="submit"
              disabled={
                submitting ||
                rating === 0 ||
                !verificationReady
              }
              style={{
                border: "none",
                padding:
                  "11px 17px",
                borderRadius:
                  buttonRadius,
                background:
                  primaryColor,
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                cursor:
                  submitting ||
                  rating === 0
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  submitting ||
                  rating === 0
                    ? 0.55
                    : 1,
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 7,
              }}
            >
              <MessageSquare
                style={{
                  width: 15,
                  height: 15,
                }}
              />

              {submitting
                ? "Submitting..."
                : "Submit review"}
            </button>
          </div>
        </form>

        {submittedRating ===
          5 &&
          externalReviewUrl && (
            <div
              style={{
                marginTop: 15,
                padding:
                  "14px 15px",
                borderRadius:
                  14,
                background:
                  `${primaryColor}0d`,
                border:
                  `1px solid ${primaryColor}25`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color:
                    "#111827",
                }}
              >
                Thanks for the 5-star rating!
              </p>

              <p
                style={{
                  margin:
                    "4px 0 11px",
                  fontSize: 11,
                  lineHeight: 1.5,
                  color:
                    "#64748b",
                }}
              >
                You can also share your experience publicly.
              </p>

              <a
                href={
                  externalReviewUrl
                }
                target="_blank"
                rel="noopener noreferrer nofollow"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: 7,
                  padding:
                    "9px 12px",
                  borderRadius:
                    buttonRadius,
                  background:
                    "#111827",
                  color: "#ffffff",
                  textDecoration:
                    "none",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                Continue to public review
                <ExternalLink
                  style={{
                    width: 14,
                    height: 14,
                  }}
                />
              </a>
            </div>
          )}

        {!loading &&
          reviews.length > 0 && (
            <div
              style={{
                marginTop: 28,
                paddingTop: 22,
                borderTop:
                  "1px solid #eef2f7",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 7,
                  fontSize: 14,
                  fontWeight: 800,
                  color:
                    "#111827",
                }}
              >
                <MessageSquare
                  style={{
                    width: 17,
                    height: 17,
                    color:
                      primaryColor,
                  }}
                />
                Recent reviews
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gap: 12,
                  marginTop: 13,
                }}
              >
                {reviews.map(
                  (review) => (
                    <article
                      key={
                        review.id
                      }
                      style={{
                        padding:
                          "14px 0",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          gap: 10,
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius:
                              11,
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              `${primaryColor}12`,
                            color:
                              primaryColor,
                            fontSize: 11,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {initials(
                            review.reviewerName
                          )}
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              gap: 8,
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: 13,
                                color:
                                  "#111827",
                              }}
                            >
                              {review.reviewerName ||
                                "Customer"}
                            </strong>

                            <span
                              style={{
                                fontSize: 10,
                                color:
                                  "#94a3b8",
                              }}
                            >
                              {formatDate(
                                review.createdAt
                              )}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: 3,
                              color:
                                "#f59e0b",
                              letterSpacing:
                                1,
                              fontSize: 13,
                            }}
                          >
                            {"★".repeat(
                              Math.max(
                                0,
                                Math.min(
                                  5,
                                  review.rating
                                )
                              )
                            )}
                            <span
                              style={{
                                color:
                                  "#cbd5e1",
                              }}
                            >
                              {"★".repeat(
                                5 -
                                  Math.max(
                                    0,
                                    Math.min(
                                      5,
                                      review.rating
                                    )
                                  )
                              )}
                            </span>
                          </div>

                          {review.title && (
                            <p
                              style={{
                                margin:
                                  "7px 0 0",
                                fontSize: 13,
                                fontWeight: 800,
                                color:
                                  "#334155",
                              }}
                            >
                              {review.title}
                            </p>
                          )}

                          {review.comment && (
                            <p
                              style={{
                                margin:
                                  "4px 0 0",
                                fontSize: 12,
                                lineHeight: 1.6,
                                color:
                                  "#64748b",
                              }}
                            >
                              {review.comment}
                            </p>
                          )}

                          {review.ownerResponse && (
                            <div
                              style={{
                                marginTop: 10,
                                padding:
                                  "10px 12px",
                                borderRadius:
                                  11,
                                background:
                                  "#f8fafc",
                                border:
                                  "1px solid #e2e8f0",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  textTransform:
                                    "uppercase",
                                  letterSpacing:
                                    0.8,
                                  color:
                                    primaryColor,
                                }}
                              >
                                Business response
                              </div>

                              <p
                                style={{
                                  margin:
                                    "4px 0 0",
                                  fontSize: 11,
                                  lineHeight:
                                    1.5,
                                  color:
                                    "#475569",
                                }}
                              >
                                {
                                  review.ownerResponse
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
