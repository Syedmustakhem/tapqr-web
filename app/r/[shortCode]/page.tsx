import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import GuestExperience from "./GuestExperience";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.tapqr.shop"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API_ROOT = `${API_BASE}/api`;

export interface GuestExperience {
  qr: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    experienceType: string;
    shortCode: string;
    enabledSections: unknown;
    catalogId: string | null;

    sourceType: string;
    placementLabel: string | null;
    locationLabel: string | null;
    campaignName: string | null;
  };

  branding: {
    primaryColor: string | null;
    secondaryColor: string | null;
    backgroundColor: string | null;
    qrForegroundColor: string | null;
    qrBackgroundColor: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    buttonStyle: string | null;
    fontFamily: string | null;
  } | null;

  business: {
    id: string;
    name: string;
    slug: string | null;
    email: string | null;
    phone: string | null;
    logo: string | null;
    description: string | null;

    profile: {
      tagline: string | null;
      description: string | null;
      website: string | null;
      email: string | null;
      phone: string | null;
      whatsapp: string | null;
      externalReviewUrl: string | null;

      address: {
        line1: string | null;
        line2: string | null;
        city: string | null;
        state: string | null;
        postalCode: string | null;
        country: string | null;
      };

      location: {
        latitude: number | null;
        longitude: number | null;
      };

      openingHours: unknown;
      socialLinks: unknown;
      coverImage: string | null;
    } | null;

    catalogs: Array<{
      id: string;
      name: string;
      description: string | null;
      type: string;

      categories: Array<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;

        items: Array<{
          id: string;
          name: string;
          description: string | null;
          type: string;

          price: string | number | null;
          compareAtPrice: string | number | null;
          currency: string;

          image: string | null;
          gallery: unknown;

          sku: string | null;
          unit: string | null;
          stock: number | null;
          durationMinutes: number | null;

          isAvailable: boolean;
          isFeatured: boolean;

          metadata: unknown;

          variants: Array<{
            id: string;
            name: string;

            price: string | number | null;
            compareAtPrice: string | number | null;

            sku: string | null;
            stock: number | null;

            isAvailable: boolean;
          }>;

          optionGroups: Array<{
            id: string;
            name: string;

            required: boolean;
            minSelect: number;
            maxSelect: number;

            options: Array<{
              id: string;
              name: string;
              price: string | number;
              isAvailable: boolean;
            }>;
          }>;
        }>;
      }>;
    }>;
  };
}

type PageProps = {
  params: Promise<{
    shortCode: string;
  }>;
};

/**
 * Load the public QR experience.
 *
 * IMPORTANT:
 * The visitor key is read from the cookie on the server
 * and forwarded to the QR routing engine.
 *
 * This allows A/B experiments to assign the visitor
 * before GuestExperience is rendered on the client.
 */
async function getGuestExperience(
  shortCode: string,
  visitorKey?: string
): Promise<GuestExperience | null> {
  const code = shortCode.trim();

  if (!code) {
    return null;
  }

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (visitorKey) {
    headers["x-tapqr-visitor-key"] = visitorKey;
  }

  const response = await fetch(
    `${API_ROOT}/qrcodes/public/${encodeURIComponent(code)}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  if (response.status === 404 || response.status === 410) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load QR experience: ${response.status}`
    );
  }

  const payload = await response.json();

  return payload?.data ?? payload ?? null;
}

export default async function QRGuestPage({
  params,
}: PageProps) {
  const { shortCode } = await params;

  const code = String(shortCode || "").trim();

  if (!code) {
    notFound();
  }

  /**
   * Read the anonymous visitor identity.
   *
   * The middleware will create this cookie for new visitors.
   * We intentionally do not generate it here because a value
   * generated only during server rendering would not persist
   * to the next request.
   */
  const cookieStore = await cookies();

  const visitorKey =
    cookieStore.get("tapqr_visitor_key")?.value?.trim() || undefined;

  const experience = await getGuestExperience(
    code,
    visitorKey
  );

  if (!experience) {
    notFound();
  }

  return (
    <GuestExperience
      experience={experience}
      visitorKey={visitorKey}
    />
  );
}