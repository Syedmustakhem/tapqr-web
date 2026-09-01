import { notFound } from "next/navigation";
import GuestExperience from "./GuestExperience";

type Params = {
  shortCode: string;
};

type Branding = {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  buttonStyle?: string | null;
  fontFamily?: string | null;
};

type Profile = {
  tagline?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;

  externalReviewUrl?: string | null;

  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;

  location?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;

  openingHours?: unknown;
  socialLinks?: unknown;
  coverImage?: string | null;
};

type Option = {
  id: string;
  name: string;
  price: string | number;
  isAvailable: boolean;
};

type OptionGroup = {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: Option[];
};

type Variant = {
  id: string;
  name: string;
  price: string | number | null;
  compareAtPrice: string | number | null;
  sku?: string | null;
  stock?: string | number | null;
  isAvailable: boolean;
};

type CatalogItem = {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  price: string | number | null;
  compareAtPrice: string | number | null;
  currency: string;
  image?: string | null;
  gallery?: unknown;
  sku?: string | null;
  unit?: string | null;
  stock?: string | number | null;
  durationMinutes?: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  metadata?: unknown;
  variants: Variant[];
  optionGroups: OptionGroup[];
};

type Category = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  items: CatalogItem[];
};

type Catalog = {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  categories: Category[];
};

export type GuestExperience = {
  qr: {
    id: string;
    name: string;
    description?: string | null;
    type: string;
    experienceType: string;
    shortCode: string;
    enabledSections?: string[];
  };

  branding: Branding | null;

  business: {
    id: string;
    name: string;
    slug: string;
    email?: string | null;
    phone?: string | null;
    logo?: string | null;
    description?: string | null;
    profile: Profile | null;
    catalogs: Catalog[];
  };
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: GuestExperience;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.tapqr.shop";

async function getGuestExperience(
  shortCode: string
): Promise<GuestExperience | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/qrcodes/public/${encodeURIComponent(
        shortCode
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Guest API returned ${response.status}`
      );
    }

    const result =
      (await response.json()) as ApiResponse;

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error(
      "TapQR Guest Experience error:",
      error
    );

    return null;
  }
}

export default async function QRGuestPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { shortCode } = await params;

  const code = String(shortCode || "").trim();

  if (!code) {
    notFound();
  }

  const experience =
    await getGuestExperience(code);

  if (!experience) {
    notFound();
  }

  return (
    <GuestExperience
      experience={experience}
    />
  );
}