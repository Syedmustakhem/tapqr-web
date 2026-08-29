import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://tapqr.shop";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "TapQR — One Scan. Everything.",
    template: "%s | TapQR",
  },

  description:
    "TapQR — One Scan. Everything. Create a powerful digital profile, share your links, connect with customers, and make every interaction effortless through one smart QR.",

  applicationName: "TapQR",

  keywords: [
    "TapQR",
    "Tap QR",
    "QR code",
    "smart QR code",
    "digital business card",
    "digital profile",
    "QR business card",
    "digital identity",
    "QR networking",
    "business QR code",
    "digital contact card",
    "smart QR experience",
  ],

  authors: [
    {
      name: "TapQR",
      url: siteUrl,
    },
  ],

  creator: "TapQR",
  publisher: "TapQR",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/tapqr-icon.webp",
        type: "image/webp",
      },
    ],
    shortcut: "/tapqr-icon.webp",
    apple: "/tapqr-icon.webp",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "TapQR",

    title: "TapQR — One Scan. Everything.",

    description:
      "Create a powerful digital profile, share your links, connect with customers, and make every interaction effortless through one smart QR.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TapQR — One Scan. Everything.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "TapQR — One Scan. Everything.",

    description:
      "One smart QR for your digital profile, links, services, products and contact options.",

    images: ["/og-image.png"],
  },

  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "Organization",

      "@id": `${siteUrl}/#organization`,

      name: "TapQR",

      url: siteUrl,

      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/tapqr-icon.webp`,
      },

      description:
        "TapQR is a digital QR platform that helps businesses, organizations and professionals create useful digital experiences through one smart QR.",

      sameAs: [
        "https://www.instagram.com/tapqr.shop/",
        "https://www.linkedin.com/company/tapqr/",
      ],

      knowsAbout: [
        "QR codes",
        "Digital business cards",
        "Digital profiles",
        "QR networking",
        "Digital identity",
        "QR experiences",
      ],
    },

    {
      "@type": "WebSite",

      "@id": `${siteUrl}/#website`,

      url: siteUrl,

      name: "TapQR",

      description: "One Scan. Everything.",

      publisher: {
        "@id": `${siteUrl}/#organization`,
      },

      inLanguage: "en-IN",
    },

    {
      "@type": "WebPage",

      "@id": `${siteUrl}/#webpage`,

      url: siteUrl,

      name: "TapQR — One Scan. Everything.",

      description:
        "Create a powerful digital profile, share your links, connect with customers, and make every interaction effortless through one smart QR.",

      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },

      about: {
        "@id": `${siteUrl}/#organization`,
      },

      inLanguage: "en-IN",
    },

    {
      "@type": "SoftwareApplication",

      name: "TapQR",

      applicationCategory: "BusinessApplication",

      operatingSystem: "Web",

      url: siteUrl,

      description:
        "TapQR helps businesses, organizations and professionals create smart QR experiences for digital information, links, services, products and contact options.",

      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}