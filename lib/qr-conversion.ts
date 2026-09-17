
export type QRConversionType =
  | "CALL"
  | "WHATSAPP"
  | "WEBSITE"
  | "DIRECTIONS"
  | "ITEM_VIEW"
  | "CONTACT"
  | "CUSTOM";

export type TrackQRConversionInput = {
  shortCode: string;
  conversionType: QRConversionType | string;
  visitorKey?: string;
  externalId?: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};

export type TrackQRConversionResponse = {
  success?: boolean;
  message?: string;
  data?: {
    conversionId: string;
    attributed: boolean;
    ruleId: string | null;
    ruleVersion: number | null;
    experimentId: string | null;
    variantId: string | null;
  };
};

const PUBLIC_API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.tapqr.shop"
)
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

export async function trackQRConversion(
  input: TrackQRConversionInput
): Promise<TrackQRConversionResponse | null> {
  const shortCode = input.shortCode.trim();

  if (!shortCode || !input.conversionType) {
    return null;
  }

  try {
    const response = await fetch(
      `${PUBLIC_API_ROOT}/api/qrcodes/public/${encodeURIComponent(shortCode)}/conversion`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(input.visitorKey
            ? { "x-tapqr-visitor-key": input.visitorKey }
            : {}),
        },
        body: JSON.stringify({
          conversionType: input.conversionType,
          ...(input.externalId ? { externalId: input.externalId } : {}),
          ...(typeof input.value === "number" ? { value: input.value } : {}),
          ...(input.currency ? { currency: input.currency } : {}),
          ...(input.metadata ? { metadata: input.metadata } : {}),
        }),
        cache: "no-store",
        keepalive: true,
      }
    );

    if (!response.ok) {
      console.warn(
        `TapQR conversion endpoint returned ${response.status}.`
      );
      return null;
    }

    return (await response.json()) as TrackQRConversionResponse;
  } catch (error) {
    console.warn("TapQR conversion tracking failed:", error);
    return null;
  }
}
