"use client";

/*
 * ============================================================
 * TODAY'S SPECIALS BANNER (Pro feature #2)
 * ============================================================
 *
 * Promotional strip on the public scan experience.
 *
 * Rendered by GuestExperience between the business header and
 * the content sections, when:
 *   - specialsBannerEnabled is true, AND
 *   - specialsTitle is set, AND
 *   - specialsValidUntil is unset or still in the future.
 *
 * The owner edits it from Dashboard → Business → "Today's
 * Specials" panel (Pro). The expiry is the magic: set tonight's
 * special and it disappears on its own tomorrow — no reprint,
 * no manual cleanup.
 */

type SpecialsBannerProps = {
  enabled?: boolean | null;
  title?: string | null;
  description?: string | null;
  validUntil?: string | null;
  primaryColor: string;
};

function formatEndDate(
  iso: string
): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    }
  );
}

export default function SpecialsBanner({
  enabled,
  title,
  description,
  validUntil,
  primaryColor,
}: SpecialsBannerProps) {
  if (!enabled) return null;

  const cleanTitle = title?.trim();

  if (!cleanTitle) return null;

  if (validUntil) {
    const expiry = new Date(validUntil);

    if (
      !Number.isNaN(expiry.getTime()) &&
      expiry.getTime() < Date.now()
    ) {
      return null;
    }
  }

  const endLabel = validUntil
    ? formatEndDate(validUntil)
    : "";

  return (
    <section
      aria-label="Today's special"
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
            ⭐ Today's Special
          </span>

          {endLabel && (
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
              Ends {endLabel}
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

        {description?.trim() && (
          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              lineHeight: 1.55,
              opacity: 0.92,
            }}
          >
            {description.trim()}
          </div>
        )}
      </div>
    </section>
  );
}
