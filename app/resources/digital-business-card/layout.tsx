import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Digital Business Card: What It Is, How It Works & Benefits | TapQR",

  description:
    "Learn what a digital business card is, how QR business cards work, their benefits, and how TapQR helps you share your digital identity through one smart QR.",

  alternates: {
    canonical:
      "https://tapqr.shop/resources/digital-business-card",
  },

  openGraph: {
    title:
      "Digital Business Card: What It Is, How It Works & Benefits | TapQR",

    description:
      "A complete guide to digital business cards, QR business cards, digital profiles, and sharing your professional identity with TapQR.",

    url:
      "https://tapqr.shop/resources/digital-business-card",

    siteName: "TapQR",

    type: "article",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Digital Business Card: What It Is, How It Works & Benefits | TapQR",

    description:
      "Learn how digital business cards and QR codes can make sharing your professional identity easier.",
  },
};

export default function DigitalBusinessCardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}