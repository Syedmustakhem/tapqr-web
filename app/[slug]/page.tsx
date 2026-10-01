import { notFound } from "next/navigation";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.tapqr.shop"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API_ROOT = `${API_BASE}/api`;

type PublicProfile = {
  tagline: string | null;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  externalReviewUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  openingHours: unknown;
  socialLinks: unknown;
  coverImage: string | null;
};

type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  country: string | null;
  profile: PublicProfile | null;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPublicBusiness(
  slug: string,
): Promise<PublicBusiness | null> {
  const clean = slug.trim();

  if (!clean) {
    return null;
  }

  const response = await fetch(
    `${API_ROOT}/businesses/public/${encodeURIComponent(clean)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (
    response.status === 404 ||
    response.status === 410
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load business: ${response.status}`,
    );
  }

  const payload = await response.json();

  return (
    (payload?.data as PublicBusiness) ??
    (payload as PublicBusiness) ??
    null
  );
}

function formatAddress(
  profile: PublicProfile | null,
): string | null {
  if (!profile) {
    return null;
  }

  const parts = [
    profile.addressLine1,
    profile.addressLine2,
    profile.city,
    profile.state,
    profile.postalCode,
    profile.country,
  ].filter(
    (part) =>
      typeof part === "string" &&
      part.trim().length > 0,
  ) as string[];

  return parts.length > 0
    ? parts.join(", ")
    : null;
}

function socialEntries(
  socialLinks: unknown,
): Array<{ label: string; url: string }> {
  if (
    !socialLinks ||
    typeof socialLinks !== "object"
  ) {
    return [];
  }

  return Object.entries(
    socialLinks as Record<string, unknown>,
  )
    .filter(
      ([, url]) =>
        typeof url === "string" &&
        url.trim().length > 0,
    )
    .map(([label, url]) => ({
      label:
        label.charAt(0).toUpperCase() +
        label.slice(1),
      url: (url as string).trim(),
    }));
}

export default async function PublicBusinessPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const business = await getPublicBusiness(
    String(slug || ""),
  );

  if (!business) {
    notFound();
  }

  const profile = business.profile ?? null;
  const tagline =
    profile?.tagline?.trim() ||
    business.description?.trim() ||
    null;
  const description =
    profile?.description?.trim() ||
    business.description?.trim() ||
    null;
  const cover =
    profile?.coverImage ||
    business.coverImage ||
    null;
  const phone =
    profile?.phone || business.phone;
  const email =
    profile?.email || business.email;
  const website =
    profile?.website || business.website;
  const whatsappNumber = (
    profile?.whatsapp ||
    business.whatsapp ||
    ""
  ).replace(/\D/g, "");
  const address = formatAddress(profile);
  const socials = socialEntries(
    profile?.socialLinks,
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Cover */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 sm:h-72">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Identity card */}
        <div className="-mt-16 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-start gap-4">
            {business.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo}
                alt={business.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-bold text-white">
                {business.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950">
                {business.name}
              </h1>

              {tagline && (
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {tagline}
                </p>
              )}
            </div>
          </div>

          {description && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}

          {/* Contact actions */}
          <div className="mt-6 flex flex-wrap gap-2">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Call
              </a>
            )}

            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                WhatsApp
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Email
              </a>
            )}

            {website && (
              <a
                href={
                  website.startsWith("http")
                    ? website
                    : `https://${website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Website
              </a>
            )}
          </div>
        </div>

        {/* Location */}
        {address && (
          <section className="mt-4 rounded-3xl border border-slate-200/70 bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Location
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
              {address}
            </p>
          </section>
        )}

        {/* Social */}
        {socials.length > 0 && (
          <section className="mt-4 rounded-3xl border border-slate-200/70 bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Follow
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {socials.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {entry.label}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <p className="py-8 text-center text-xs text-slate-400">
          Powered by{" "}
          <span className="font-bold text-slate-500">
            TapQR
          </span>{" "}
          · One Scan. Everything.
        </p>
      </div>
    </main>
  );
}
