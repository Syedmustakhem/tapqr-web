"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  GuestExperience,
} from "./page";
import ReviewsSection from "./ReviewsSection";
type CatalogItem = GuestExperience["business"]["catalogs"][number]["categories"][number]["items"][number];

type Category =
  GuestExperience["business"]["catalogs"][number]["categories"][number];

function formatPrice(
  price: string | number | null | undefined,
  currency = "INR"
) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return null;
  }

  const numericPrice =
    typeof price === "string"
      ? Number(price)
      : price;

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(numericPrice);
  } catch {
    return `₹${numericPrice}`;
  }
}

function getAddress(
  profile: GuestExperience["business"]["profile"]
) {
  if (!profile?.address) {
    return "";
  }

  const parts = [
    profile.address.line1,
    profile.address.line2,
    profile.address.city,
    profile.address.state,
    profile.address.postalCode,
    profile.address.country,
  ].filter(Boolean);

  return parts.join(", ");
}

function getGoogleMapsUrl(
  profile: GuestExperience["business"]["profile"]
) {
  const location = profile?.location;

  if (
    location?.latitude !== null &&
    location?.latitude !== undefined &&
    location?.longitude !== null &&
    location?.longitude !== undefined
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  const address = getAddress(profile);

  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  }

  return null;
}

function getWhatsAppUrl(
  profile: GuestExperience["business"]["profile"]
) {
  const whatsapp =
    profile?.whatsapp ||
    profile?.phone;

  if (!whatsapp) {
    return null;
  }

  const number = whatsapp.replace(
    /\D/g,
    ""
  );

  if (!number) {
    return null;
  }

  return `https://wa.me/${number}`;
}

function getWebsiteUrl(
  website?: string | null
) {
  if (!website) {
    return null;
  }

  if (
    website.startsWith("http://") ||
    website.startsWith("https://")
  ) {
    return website;
  }

  return `https://${website}`;
}

function getImage(item: CatalogItem) {
  if (item.image) {
    return item.image;
  }

  if (
    Array.isArray(item.gallery) &&
    item.gallery.length > 0
  ) {
    const first = item.gallery[0];

    if (typeof first === "string") {
      return first;
    }

    if (
      first &&
      typeof first === "object" &&
      "url" in first &&
      typeof first.url === "string"
    ) {
      return first.url;
    }
  }

  return null;
}

function getButtonRadius(
  buttonStyle?: string | null
) {
  switch (
    buttonStyle?.toUpperCase()
  ) {
    case "SQUARE":
      return 6;

    case "ROUNDED":
      return 12;

    case "PILL":
      return 999;

    case "CIRCLE":
      return 999;

    default:
      return 12;
  }
}

function getItemActions(
  experienceType: string,
  itemType: string
) {
  const experience =
    `${experienceType || ""}`.toUpperCase();

  const type =
    `${itemType || ""}`.toUpperCase();

  /*
   * INFORMATION / EDUCATION
   */
  if (
    experience.includes("INFORMATION") ||
    experience.includes("INFO") ||
    experience.includes("SCHOOL") ||
    experience.includes("COLLEGE") ||
    experience.includes("EDUCATION")
  ) {
    return [
      "DETAILS",
      "ENQUIRE",
    ];
  }

  /*
   * HOSPITAL / HEALTHCARE
   */
  if (
    experience.includes("HOSPITAL") ||
    experience.includes("CLINIC") ||
    experience.includes("HEALTH")
  ) {
    return [
      "DETAILS",
      "ENQUIRE",
      "CONTACT",
    ];
  }

  /*
   * SERVICES
   */
  if (
    experience.includes("SERVICE") ||
    type.includes("SERVICE")
  ) {
    return [
      "DETAILS",
      "ENQUIRE",
      "BOOK",
    ];
  }

  /*
   * EVENTS
   */
  if (
    experience.includes("EVENT")
  ) {
    return [
      "DETAILS",
      "REGISTER",
    ];
  }

  /*
   * PRODUCTS / RETAIL
   *
   * No ordering.
   */
  if (
    experience.includes("PRODUCT") ||
    experience.includes("RETAIL") ||
    experience.includes("SHOP")
  ) {
    return [
      "DETAILS",
      "ENQUIRE",
    ];
  }

  /*
   * MENU
   *
   * This is only informational.
   * No ordering.
   */
  if (
    experience.includes("MENU") ||
    experience.includes("RESTAURANT") ||
    experience.includes("CAFE")
  ) {
    return [
      "DETAILS",
      "ENQUIRE",
    ];
  }

  /*
   * DEFAULT
   */
  return [
    "DETAILS",
    "ENQUIRE",
  ];
}
function getActionLabel(
  action: string
) {
  switch (action) {
    case "DETAILS":
      return "View Details";

    case "ENQUIRE":
      return "Enquire";

    case "CONTACT":
      return "Contact";

    case "BOOK":
      return "Book";

    case "REGISTER":
      return "Register";

    default:
      return "View Details";
  }
}
function getActionStyle(
  action: string,
  primaryColor: string
) {
  switch (action) {
    case "ENQUIRE":
      return {
        background: primaryColor,
        color: "#ffffff",
        border: `1px solid ${primaryColor}`,
      };

    case "CONTACT":
      return {
        background: "#111827",
        color: "#ffffff",
        border: "1px solid #111827",
      };

    case "BOOK":
      return {
        background: primaryColor,
        color: "#ffffff",
        border: `1px solid ${primaryColor}`,
      };

    case "REGISTER":
      return {
        background: primaryColor,
        color: "#ffffff",
        border: `1px solid ${primaryColor}`,
      };

    default:
      return {
        background: "#ffffff",
        color: "#111827",
        border: "1px solid #e5e7eb",
      };
  }
}


export default function GuestExperience({
  experience,
}: {
  experience: GuestExperience;
}) {
  const {
    qr,
    business,
    branding,
  } = experience;

  const profile =
    business.profile;

  const primaryColor =
    branding?.primaryColor ||
    "#2563eb";

  const secondaryColor =
    branding?.secondaryColor ||
    "#111827";

  const backgroundColor =
    branding?.backgroundColor ||
    "#f7f8fa";

  const logo =
    branding?.logoUrl ||
    business.logo ||
    null;

  const cover =
    branding?.coverImageUrl ||
    profile?.coverImage ||
    null;

  const address =
    getAddress(profile);

  const whatsappUrl =
    getWhatsAppUrl(profile);

  const mapsUrl =
    getGoogleMapsUrl(profile);

  const websiteUrl =
    getWebsiteUrl(
      profile?.website
    );

  const buttonRadius =
    getButtonRadius(
      branding?.buttonStyle
    );

  const catalogs =
    business.catalogs || [];

  /*
   * Search state
   */
  const [
    search,
    setSearch,
  ] = useState("");

  /*
   * Selected category.
   *
   * null = all categories
   */
  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string | null>(
    null
  );

  /*
   * Selected item for detail panel
   */
  const [
    selectedItem,
    setSelectedItem,
  ] = useState<CatalogItem | null>(
    null
  );

  /*
   * Flatten all categories.
   */
  const allCategories =
    useMemo(() => {
      const result: Category[] = [];

      for (const catalog of catalogs) {
        for (const category of
          catalog.categories || []) {
          result.push(category);
        }
      }

      return result;
    }, [catalogs]);

  /*
   * Search helper.
   */
  function itemMatchesSearch(
    item: CatalogItem
  ) {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.name
        .toLowerCase()
        .includes(query) ||
      item.description
        ?.toLowerCase()
        .includes(query) ||
      item.type
        ?.toLowerCase()
        .includes(query)
    );
  }

  /*
   * Filter categories/items.
   */
  const filteredCatalogs =
    useMemo(() => {
      return catalogs
        .map((catalog) => {
          const categories =
            (catalog.categories || [])
              .map((category) => {
                const matchesCategory =
                  !selectedCategory ||
                  selectedCategory ===
                    category.id;

                const items =
                  (category.items || [])
                    .filter(
                      itemMatchesSearch
                    );

                if (
                  selectedCategory &&
                  !matchesCategory
                ) {
                  return {
                    ...category,
                    items: [],
                  };
                }

                return {
                  ...category,
                  items,
                };
              })
              .filter(
                (category) =>
                  category.items.length >
                  0
              );

          return {
            ...catalog,
            categories,
          };
        })
        .filter(
          (catalog) =>
            catalog.categories.length >
            0
        );
    }, [
      catalogs,
      search,
      selectedCategory,
    ]);

  const totalItems =
    allCategories.reduce(
      (total, category) =>
        total +
        (category.items?.length ||
          0),
      0
    );

  const hasCatalogs =
    catalogs.length > 0;

  const hasSearchResults =
    filteredCatalogs.length > 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          backgroundColor,
        color: "#111827",
        fontFamily:
          branding?.fontFamily ||
          "Inter, Arial, sans-serif",
      }}
    >
      {/* =========================
          COVER
      ========================== */}

      <section
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {cover ? (
          <div
            style={{
              height:
                "clamp(180px, 35vw, 300px)",
              width: "100%",
              overflow: "hidden",
              background:
                "#e5e7eb",
            }}
          >
            <img
              src={cover}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              height:
                "clamp(150px, 25vw, 220px)",
              background:
                `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          />
        )}
      </section>

      {/* =========================
          BUSINESS HEADER
      ========================== */}

      <section
        style={{
          maxWidth: 900,
          margin:
            "-55px auto 0",
          padding:
            "0 16px 25px",
          position: "relative",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 24,
            padding:
              "28px 24px",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 18,
              flexWrap:
                "wrap",
            }}
          >
            {logo ? (
              <img
                src={logo}
                alt={
                  business.name
                }
                style={{
                  width: 84,
                  height: 84,
                  objectFit: "cover",
                  borderRadius: 20,
                  border:
                    "4px solid white",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,.12)",
                  marginTop: -55,
                  background:
                    "#fff",
                }}
              />
            ) : (
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 20,
                  background:
                    primaryColor,
                  color: "#fff",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize: 30,
                  fontWeight: 800,
                  marginTop: -55,
                  flexShrink: 0,
                }}
              >
                {business.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div
              style={{
                flex: 1,
                minWidth: 220,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 800,
                  color:
                    primaryColor,
                  letterSpacing:
                    1.5,
                  textTransform:
                    "uppercase",
                }}
              >
                {qr.experienceType ||
                  "EXPERIENCE"}
              </p>

              <h1
                style={{
                  margin:
                    "4px 0 5px",
                  fontSize:
                    "clamp(26px, 5vw, 38px)",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color:
                    "#111827",
                }}
              >
                {business.name}
              </h1>

              {profile?.tagline && (
                <p
                  style={{
                    margin: 0,
                    color:
                      "#6b7280",
                    fontSize: 15,
                  }}
                >
                  {
                    profile.tagline
                  }
                </p>
              )}
            </div>
          </div>

          {business.description && (
            <p
              style={{
                margin:
                  "22px 0 0",
                color:
                  "#4b5563",
                lineHeight: 1.7,
              }}
            >
              {
                business.description
              }
            </p>
          )}

          {profile?.description && (
            <p
              style={{
                margin:
                  "10px 0 0",
                color:
                  "#6b7280",
                lineHeight: 1.7,
              }}
            >
              {
                profile.description
              }
            </p>
          )}

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 22,
            }}
          >
            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                style={{
                  padding:
                    "11px 17px",
                  borderRadius:
                    buttonRadius,
                  background:
                    primaryColor,
                  color: "#fff",
                  textDecoration:
                    "none",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Call
              </a>
            )}

            {whatsappUrl && (
              <a
                href={
                  whatsappUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:
                    "11px 17px",
                  borderRadius:
                    buttonRadius,
                  background:
                    "#25D366",
                  color: "#fff",
                  textDecoration:
                    "none",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                WhatsApp
              </a>
            )}

            {websiteUrl && (
              <a
                href={
                  websiteUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:
                    "11px 17px",
                  borderRadius:
                    buttonRadius,
                  background:
                    secondaryColor,
                  color: "#fff",
                  textDecoration:
                    "none",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Website
              </a>
            )}

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:
                    "11px 17px",
                  borderRadius:
                    buttonRadius,
                  background:
                    "#f3f4f6",
                  color:
                    "#111827",
                  textDecoration:
                    "none",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Directions
              </a>
            )}
          </div>

          {address && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 18,
                borderTop:
                  "1px solid #e5e7eb",
                color:
                  "#6b7280",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              📍 {address}
            </div>
          )}
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================== */}

      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding:
            "0 16px 60px",
        }}
      >
        {!hasCatalogs ? (
          <EmptyCatalog
            businessName={
              business.name
            }
            primaryColor={
              primaryColor
            }
          />
        ) : (
          <>
            {/* =====================
                SEARCH
            ====================== */}

            <div
              style={{
                position:
                  "sticky",
                top: 0,
                zIndex: 20,
                padding:
                  "10px 0",
                background:
                  backgroundColor,
              }}
            >
              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <span
                  style={{
                    position:
                      "absolute",
                    left: 15,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    fontSize: 18,
                    color:
                      "#9ca3af",
                  }}
                >
                  🔎
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    `Search ${getSearchPlaceholder(
                      qr.experienceType
                    )}`
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "14px 45px 14px 45px",
                    borderRadius: 14,
                    border:
                      "1px solid #e5e7eb",
                    background:
                      "#fff",
                    outline:
                      "none",
                    fontSize: 14,
                    color:
                      "#111827",
                    boxShadow:
                      "0 3px 15px rgba(0,0,0,.04)",
                  }}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    style={{
                      position:
                        "absolute",
                      right: 12,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background:
                        "#f3f4f6",
                      borderRadius:
                        999,
                      width: 28,
                      height: 28,
                      cursor:
                        "pointer",
                      fontWeight: 700,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* =====================
                CATEGORY NAVIGATION
            ====================== */}

            {allCategories.length >
              0 && (
              <div
                style={{
                  display:
                    "flex",
                  gap: 8,
                  overflowX:
                    "auto",
                  padding:
                    "5px 0 18px",
                  scrollbarWidth:
                    "none",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      null
                    )
                  }
                  style={{
                    flexShrink: 0,
                    border:
                      selectedCategory ===
                      null
                        ? `1px solid ${primaryColor}`
                        : "1px solid #e5e7eb",
                    background:
                      selectedCategory ===
                      null
                        ? primaryColor
                        : "#fff",
                    color:
                      selectedCategory ===
                      null
                        ? "#fff"
                        : "#374151",
                    padding:
                      "9px 15px",
                    borderRadius: 999,
                    cursor:
                      "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  All
                </button>

                {allCategories.map(
                  (category) => (
                    <button
                      key={
                        category.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedCategory(
                          category.id
                        )
                      }
                      style={{
                        flexShrink: 0,
                        border:
                          selectedCategory ===
                          category.id
                            ? `1px solid ${primaryColor}`
                            : "1px solid #e5e7eb",
                        background:
                          selectedCategory ===
                          category.id
                            ? primaryColor
                            : "#fff",
                        color:
                          selectedCategory ===
                          category.id
                            ? "#fff"
                            : "#374151",
                        padding:
                          "9px 15px",
                        borderRadius:
                          999,
                        cursor:
                          "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {category.name}
                    </button>
                  )
                )}
              </div>
            )}

            {/* =====================
                RESULT COUNT
            ====================== */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 800,
                    color:
                      primaryColor,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      1.5,
                  }}
                >
                  {qr.experienceType ||
                    "EXPERIENCE"}
                </p>

                <h2
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize: 28,
                    fontWeight: 800,
                    color:
                      "#111827",
                  }}
                >
                  {search
                    ? "Search results"
                    : "Explore"}
                </h2>
              </div>

              <span
                style={{
                  background:
                    "#fff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: 999,
                  padding:
                    "7px 11px",
                  color:
                    "#6b7280",
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace:
                    "nowrap",
                }}
              >
                {search
                  ? countFilteredItems(
                      filteredCatalogs
                    )
                  : totalItems}{" "}
                items
              </span>
            </div>

            {/* =====================
                NO SEARCH RESULTS
            ====================== */}

            {!hasSearchResults ? (
              <div
                style={{
                  background:
                    "#fff",
                  borderRadius: 20,
                  border:
                    "1px solid #e5e7eb",
                  padding: 40,
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    marginBottom:
                      10,
                  }}
                >
                  🔎
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  Nothing found
                </h3>

                <p
                  style={{
                    color:
                      "#6b7280",
                    margin:
                      "8px 0 18px",
                  }}
                >
                  Try another search
                  term or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(
                      null
                    );
                  }}
                  style={{
                    border: "none",
                    background:
                      primaryColor,
                    color: "#fff",
                    borderRadius:
                      buttonRadius,
                    padding:
                      "11px 18px",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredCatalogs.map(
                (catalog) => (
                  <section
                    key={
                      catalog.id
                    }
                    style={{
                      marginBottom:
                        45,
                    }}
                  >
                    <div
                      style={{
                        marginBottom:
                          20,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 11,
                          fontWeight: 800,
                          color:
                            primaryColor,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            1.5,
                        }}
                      >
                        {catalog.type}
                      </p>

                      <h2
                        style={{
                          margin:
                            "4px 0",
                          fontSize: 30,
                          fontWeight: 800,
                          color:
                            "#111827",
                        }}
                      >
                        {catalog.name}
                      </h2>

                      {catalog.description && (
                        <p
                          style={{
                            margin: 0,
                            color:
                              "#6b7280",
                            lineHeight:
                              1.5,
                          }}
                        >
                          {
                            catalog.description
                          }
                        </p>
                      )}
                    </div>

                    {catalog.categories.map(
                      (
                        category
                      ) => (
                        <div
                          key={
                            category.id
                          }
                          style={{
                            marginBottom:
                              34,
                          }}
                        >
                          {/* CATEGORY HEADER */}

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 12,
                              marginBottom:
                                15,
                            }}
                          >
                            {category.image && (
                              <img
                                src={
                                  category.image
                                }
                                alt=""
                                style={{
                                  width: 48,
                                  height: 48,
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    12,
                                  flexShrink:
                                    0,
                                }}
                              />
                            )}

                            <div>
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize: 21,
                                  fontWeight: 800,
                                  color:
                                    "#111827",
                                }}
                              >
                                {
                                  category.name
                                }
                              </h3>

                              {category.description && (
                                <p
                                  style={{
                                    margin:
                                      "3px 0 0",
                                    fontSize: 13,
                                    color:
                                      "#6b7280",
                                  }}
                                >
                                  {
                                    category.description
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ITEMS */}

                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                              gap: 14,
                            }}
                          >
                            {category.items.map(
                              (
                                item
                              ) => (
                                <ItemCard
                                  key={
                                    item.id
                                  }
                                  item={
                                    item
                                  }
                                  primaryColor={
                                    primaryColor
                                  }
                                  buttonRadius={
                                    buttonRadius
                                  }
                                  experienceType={
                                    qr.experienceType
                                  }
                                  onOpen={() =>
                                    setSelectedItem(
                                      item
                                    )
                                  }
                                />
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </section>
                )
              )
            )}
          </>
        )}
      </section>

      {/* =========================
          ITEM DETAIL MODAL
      ========================== */}

      {selectedItem && (
        <ItemDetail
          item={
            selectedItem
          }
          primaryColor={
            primaryColor
          }
          buttonRadius={
            buttonRadius
          }
          experienceType={
            qr.experienceType
          }
          onClose={() =>
            setSelectedItem(
              null
            )
          }
        />
      )}
<ReviewsSection
  businessId={business.id}
  qrCodeId={qr.id}
  externalReviewUrl={
    profile?.externalReviewUrl
  }
  primaryColor={primaryColor}
  buttonRadius={buttonRadius}
/>
      {/* =========================
          FOOTER
      ========================== */}

      <footer
        style={{
          borderTop:
            "1px solid #e5e7eb",
          background:
            "#ffffff",
          padding:
            "25px 20px 35px",
          textAlign:
            "center",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color:
              "#111827",
          }}
        >
          {business.name}
        </div>

        <p
          style={{
            margin:
              "6px 0 0",
            fontSize: 12,
            color:
              "#9ca3af",
          }}
        >
          Powered by TapQR
        </p>
      </footer>
    </main>
  );
}

/* =====================================================
   ITEM CARD
===================================================== */

function ItemCard({
  item,
  primaryColor,
  buttonRadius,
  experienceType,
  onOpen,
}: {
  item: CatalogItem;
  primaryColor: string;
  buttonRadius: number;
  experienceType: string;
  onOpen: () => void;
}) {
  const image =
    getImage(item);

  const price =
    formatPrice(
      item.price,
      item.currency
    );

  const compareAt =
    formatPrice(
      item.compareAtPrice,
      item.currency
    );

  const actions = getItemActions(
  experienceType,
  item.type
);

  return (
    <article
      style={{
        background:
          "#ffffff",
        borderRadius: 18,
        overflow:
          "hidden",
        border:
          "1px solid #e5e7eb",
        boxShadow:
          "0 4px 18px rgba(0,0,0,.04)",
        transition:
          "transform .15s ease, box-shadow .15s ease",
      }}
    >
      {image ? (
        <div
          style={{
            width: "100%",
            height: 190,
            background:
              "#f3f4f6",
          }}
        >
          <img
            src={image}
            alt={
              item.name
            }
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit:
                "cover",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: 100,
            background:
              `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}05)`,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            color:
              primaryColor,
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          {item.name
            .charAt(0)
            .toUpperCase()}
        </div>
      )}

      <div
        style={{
          padding: 17,
        }}
      >
        {item.isFeatured && (
          <span
            style={{
              display:
                "inline-block",
              marginBottom:
                8,
              padding:
                "5px 8px",
              borderRadius: 7,
              background:
                `${primaryColor}15`,
              color:
                primaryColor,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            FEATURED
          </span>
        )}

        <h4
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            color:
              "#111827",
          }}
        >
          {item.name}
        </h4>

        {item.description && (
          <p
            style={{
              margin:
                "7px 0 0",
              color:
                "#6b7280",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {item.description}
          </p>
        )}

        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap: 10,
            marginTop: 15,
          }}
        >
          <div>
            {price && (
              <strong
                style={{
                  fontSize: 18,
                  color:
                    "#111827",
                }}
              >
                {price}
              </strong>
            )}

            {compareAt &&
              compareAt !==
                price && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 13,
                    color:
                      "#9ca3af",
                    textDecoration:
                      "line-through",
                  }}
                >
                  {compareAt}
                </span>
              )}

            {item.unit && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color:
                    "#6b7280",
                }}
              >
                / {item.unit}
              </span>
            )}
          </div>

          {!item.isAvailable ? (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color:
                  "#ef4444",
              }}
            >
              Unavailable
            </span>
          ) : (
            <div
  style={{
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  }}
>
  {actions.map((action) => {
    const actionStyle =
      getActionStyle(
        action,
        primaryColor
      );

    return (
      <button
        key={action}
        type="button"
        onClick={onOpen}
        style={{
          ...actionStyle,
          borderRadius: buttonRadius,
          padding: "8px 10px",
          fontSize: 11,
          fontWeight: 800,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {getActionLabel(action)}
      </button>
    );
  })}
</div>
          )}
        </div>

        {/* VARIANTS PREVIEW */}

        {item.variants &&
          item.variants
            .length > 0 && (
            <div
              style={{
                marginTop: 15,
                paddingTop: 13,
                borderTop:
                  "1px solid #f0f0f0",
              }}
            >
              <p
                style={{
                  margin:
                    "0 0 8px",
                  fontSize: 12,
                  fontWeight: 800,
                  color:
                    "#374151",
                }}
              >
                Variants
              </p>

              <div
                style={{
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap: 6,
                }}
              >
                {item.variants.map(
                  (
                    variant
                  ) => (
                    <span
                      key={
                        variant.id
                      }
                      style={{
                        padding:
                          "7px 9px",
                        border:
                          "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 12,
                        color:
                          "#374151",
                      }}
                    >
                      {
                        variant.name
                      }

                      {variant.price !==
                        null &&
                        ` · ${formatPrice(
                          variant.price,
                          item.currency
                        )}`}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    </article>
  );
}

/* =====================================================
   ITEM DETAIL
===================================================== */

function ItemDetail({
  item,
  primaryColor,
  buttonRadius,
  experienceType,
  onClose,
}: {
  item: CatalogItem;
  primaryColor: string;
  buttonRadius: number;
  experienceType: string;
  onClose: () => void;
}) {
  const image =
    getImage(item);

  const price =
    formatPrice(
      item.price,
      item.currency
    );

  const compareAt =
    formatPrice(
      item.compareAtPrice,
      item.currency
    );

  return (
    <div
      onClick={onClose}
      style={{
        position:
          "fixed",
        inset: 0,
        zIndex: 100,
        background:
          "rgba(15,23,42,.55)",
        display:
          "flex",
        alignItems:
          "flex-end",
        justifyContent:
          "center",
        padding: 0,
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width:
            "min(100%, 720px)",
          maxHeight:
            "90vh",
          overflowY:
            "auto",
          background:
            "#ffffff",
          borderRadius:
            "24px 24px 0 0",
          boxShadow:
            "0 -10px 40px rgba(0,0,0,.18)",
        }}
      >
        {/* MODAL HEADER */}

        <div
          style={{
            position:
              "sticky",
            top: 0,
            zIndex: 5,
            display:
              "flex",
            justifyContent:
              "flex-end",
            padding:
              "12px 14px",
            background:
              "#ffffff",
            borderBottom:
              "1px solid #f1f5f9",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border:
                "none",
              background:
                "#f3f4f6",
              width: 36,
              height: 36,
              borderRadius:
                999,
              fontSize: 20,
              cursor:
                "pointer",
            }}
          >
            ×
          </button>
        </div>

        {image && (
          <div
            style={{
              width:
                "100%",
              height: 280,
              background:
                "#f3f4f6",
            }}
          >
            <img
              src={image}
              alt={
                item.name
              }
              style={{
                width:
                  "100%",
                height:
                  "100%",
                objectFit:
                  "cover",
              }}
            />
          </div>
        )}

        <div
          style={{
            padding:
              "22px 20px 35px",
          }}
        >
          <p
            style={{
              margin: 0,
              color:
                primaryColor,
              fontSize: 11,
              fontWeight: 800,
              textTransform:
                "uppercase",
              letterSpacing:
                1.5,
            }}
          >
            {experienceType ||
              item.type}
          </p>

          <h2
            style={{
              margin:
                "5px 0 8px",
              fontSize: 28,
              lineHeight:
                1.15,
              fontWeight: 800,
              color:
                "#111827",
            }}
          >
            {item.name}
          </h2>

          {item.description && (
            <p
              style={{
                margin: 0,
                color:
                  "#6b7280",
                lineHeight:
                  1.7,
              }}
            >
              {
                item.description
              }
            </p>
          )}

          {/* PRICE */}

          <div
            style={{
              marginTop: 18,
            }}
          >
            {price && (
              <strong
                style={{
                  fontSize: 23,
                  color:
                    "#111827",
                }}
              >
                {price}
              </strong>
            )}

            {compareAt &&
              compareAt !==
                price && (
                <span
                  style={{
                    marginLeft: 8,
                    color:
                      "#9ca3af",
                    textDecoration:
                      "line-through",
                  }}
                >
                  {compareAt}
                </span>
              )}

            {item.unit && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 13,
                  color:
                    "#6b7280",
                }}
              >
                /{" "}
                {item.unit}
              </span>
            )}
          </div>

          {/* VARIANTS */}

          {item.variants &&
            item.variants
              .length > 0 && (
              <section
                style={{
                  marginTop: 25,
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 12px",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  Choose a variant
                </h3>

                <div
                  style={{
                    display:
                      "grid",
                    gap: 8,
                  }}
                >
                  {item.variants.map(
                    (
                      variant
                    ) => (
                      <div
                        key={
                          variant.id
                        }
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: 12,
                          padding:
                            "13px 14px",
                          border:
                            "1px solid #e5e7eb",
                          borderRadius: 12,
                          background:
                            variant.isAvailable
                              ? "#fff"
                              : "#f9fafb",
                          opacity:
                            variant.isAvailable
                              ? 1
                              : 0.5,
                        }}
                      >
                        <div>
                          <strong>
                            {
                              variant.name
                            }
                          </strong>

                          {!variant.isAvailable && (
                            <div
                              style={{
                                marginTop: 3,
                                fontSize: 11,
                                color:
                                  "#ef4444",
                              }}
                            >
                              Unavailable
                            </div>
                          )}
                        </div>

                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              "#111827",
                          }}
                        >
                          {formatPrice(
                            variant.price,
                            item.currency
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          {/* OPTIONS */}

          {item.optionGroups &&
            item.optionGroups
              .length > 0 && (
              <section
                style={{
                  marginTop: 25,
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 14px",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  Options
                </h3>

                {item.optionGroups.map(
                  (group) => (
                    <div
                      key={
                        group.id
                      }
                      style={{
                        marginBottom:
                          18,
                      }}
                    >
                      <p
                        style={{
                          margin:
                            "0 0 8px",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {
                          group.name
                        }

                        {group.required &&
                          " *"}
                      </p>

                      <div
                        style={{
                          display:
                            "grid",
                          gap: 7,
                        }}
                      >
                        {group.options.map(
                          (
                            option
                          ) => (
                            <div
                              key={
                                option.id
                              }
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                padding:
                                  "11px 12px",
                                border:
                                  "1px solid #e5e7eb",
                                borderRadius:
                                  10,
                                opacity:
                                  option.isAvailable
                                    ? 1
                                    : 0.5,
                              }}
                            >
                              <span>
                                {
                                  option.name
                                }
                              </span>

                              <span
                                style={{
                                  fontWeight:
                                    700,
                                }}
                              >
                                {Number(
                                  option.price
                                ) >
                                  0
                                  ? `+${formatPrice(
                                      option.price,
                                      item.currency
                                    )}`
                                  : "Included"}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </section>
            )}

          {/* FUTURE ACTION */}

          <button
            type="button"
            style={{
              width:
                "100%",
              marginTop: 10,
              padding:
                "14px 18px",
              border:
                "none",
              borderRadius:
                buttonRadius,
              background:
                primaryColor,
              color:
                "#ffffff",
              fontWeight: 800,
              fontSize: 15,
              cursor:
                "pointer",
            }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY CATALOG
===================================================== */

function EmptyCatalog({
  businessName,
  primaryColor,
}: {
  businessName: string;
  primaryColor: string;
}) {
  return (
    <div
      style={{
        background:
          "#ffffff",
        borderRadius: 20,
        padding: 40,
        textAlign:
          "center",
        border:
          "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: 42,
          marginBottom: 10,
        }}
      >
        ✨
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 800,
          color:
            "#111827",
        }}
      >
        Welcome to{" "}
        {businessName}
      </h2>

      <p
        style={{
          color:
            "#6b7280",
          marginTop: 8,
        }}
      >
        This TapQR experience
        is ready.
      </p>

      <div
        style={{
          width: 50,
          height: 4,
          borderRadius: 999,
          background:
            primaryColor,
          margin:
            "18px auto 0",
        }}
      />
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function countFilteredItems(
  catalogs: GuestExperience["business"]["catalogs"]
) {
  return catalogs.reduce(
    (total, catalog) =>
      total +
      catalog.categories.reduce(
        (
          categoryTotal,
          category
        ) =>
          categoryTotal +
          category.items.length,
        0
      ),
    0
  );
}

function getSearchPlaceholder(
  experienceType: string
) {
  const type =
    experienceType.toUpperCase();

  if (
    type.includes("SERVICE")
  ) {
    return "services";
  }

  if (
    type.includes("PRODUCT")
  )
    return "products";

  if (
    type.includes("INFORMATION") ||
    type.includes("INFO")
  ) {
    return "information";
  }

  return "menu, products or services";
}