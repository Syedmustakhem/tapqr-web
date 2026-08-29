import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "QR Codes for Business: How Businesses Can Use QR Codes | TapQR",

  description:
    "Learn how businesses can use QR codes for customer connections, websites, social media, products, packaging, marketing, events, and digital profiles.",

  alternates: {
    canonical:
      "https://tapqr.shop/resources/qr-code-for-business",
  },

  openGraph: {
    title:
      "QR Codes for Business: How Businesses Can Use QR Codes | TapQR",

    description:
      "Discover practical ways businesses can use QR codes to connect customers with digital information, websites, products, and business profiles.",

    url:
      "https://tapqr.shop/resources/qr-code-for-business",

    siteName: "TapQR",

    type: "article",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "QR Codes for Business: How Businesses Can Use QR Codes | TapQR",

    description:
      "Learn practical ways businesses can use QR codes to connect customers with digital information.",
  },
};

export default function QRCodeForBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}