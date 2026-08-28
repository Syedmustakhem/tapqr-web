import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://tapqr.shop'),

  title: {
    default: 'TapQR — One SCAN. EVERYTHING.',
    template: '%s | TapQR',
  },

  description:
    'Create, share, and connect through one smart QR code with TapQR. Build your digital identity, share your links, and connect effortlessly.',

  keywords: [
    'TapQR',
    'QR code',
    'digital identity',
    'smart QR code',
    'QR profile',
    'digital profile',
    'business QR code',
    'QR sharing',
  ],

  authors: [{ name: 'TapQR' }],
  creator: 'TapQR',
  publisher: 'TapQR',

  alternates: {
    canonical: 'https://tapqr.shop',
  },

  openGraph: {
    type: 'website',
    url: 'https://tapqr.shop',
    siteName: 'TapQR',
    title: 'TapQR — One SCAN. EVERYTHING.',
    description:
      'Create, share, and connect through one smart QR code with TapQR.',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TapQR — One SCAN. EVERYTHING.',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'TapQR — One SCAN. EVERYTHING.',
    description:
      'Create, share, and connect through one smart QR code with TapQR.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  category: 'technology',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f6f2',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://tapqr.shop/#organization',
      name: 'TapQR',
      url: 'https://tapqr.shop',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tapqr.shop/logo.png',
      },
      description:
        'TapQR is a smart QR platform for creating, sharing, and connecting through one QR code.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://tapqr.shop/#website',
      name: 'TapQR',
      url: 'https://tapqr.shop',
      publisher: {
        '@id': 'https://tapqr.shop/#organization',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-paper">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {children}

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}