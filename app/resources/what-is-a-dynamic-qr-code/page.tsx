import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, QrCode, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "What Is a Dynamic QR Code? Complete Guide | TapQR",

  description:
    "Learn what a dynamic QR code is, how it works, how it differs from a static QR code, and how businesses and professionals can use dynamic QR experiences.",

  alternates: {
    canonical: "https://tapqr.shop/resources/what-is-a-dynamic-qr-code",
  },

  openGraph: {
    title: "What Is a Dynamic QR Code? Complete Guide | TapQR",

    description:
      "Learn how dynamic QR codes work, how they differ from static QR codes, and how they can make digital information easier to update and share.",

    url: "https://tapqr.shop/resources/what-is-a-dynamic-qr-code",

    siteName: "TapQR",

    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",

  headline: "What Is a Dynamic QR Code?",

  description:
    "A practical guide to dynamic QR codes, how they work, their benefits, and how businesses and professionals can use them.",

  url: "https://tapqr.shop/resources/what-is-a-dynamic-qr-code",

  mainEntityOfPage: {
    "@type": "WebPage",
    "@id":
      "https://tapqr.shop/resources/what-is-a-dynamic-qr-code",
  },

  publisher: {
    "@type": "Organization",
    name: "TapQR",
    url: "https://tapqr.shop",
  },

  author: {
    "@type": "Organization",
    name: "TapQR",
    url: "https://tapqr.shop",
  },

  about: {
    "@type": "Thing",
    name: "Dynamic QR Code",
  },

  inLanguage: "en-IN",
};

const faqSchema = {
  "@context": "https://schema.org",

  "@type": "FAQPage",

  mainEntity: [
    {
      "@type": "Question",
      name: "What is a dynamic QR code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A dynamic QR code connects people to a destination that can be updated without replacing the QR code itself.",
      },
    },
    {
      "@type": "Question",
      name: "Can a dynamic QR code be updated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A dynamic QR experience can allow the information or destination behind the QR code to be updated while the same QR code continues to be shared.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between dynamic and static QR codes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A static QR code generally contains its destination directly and cannot easily be changed after printing. A dynamic QR code can point to an editable destination, allowing the experience behind the QR to change without replacing the printed QR.",
      },
    },
    {
      "@type": "Question",
      name: "Can businesses use dynamic QR codes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Businesses can use dynamic QR experiences for contact information, digital profiles, marketing materials, packaging, posters, networking, and other customer touchpoints.",
      },
    },
  ],
};

export default function DynamicQrCodePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F6BFF] text-white shadow-sm">
              <QrCode size={20} strokeWidth={2.4} />
            </span>

            <span className="text-xl">TapQR</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/" className="transition-opacity hover:opacity-60">
              Home
            </Link>

            <Link
              href="/features"
              className="transition-opacity hover:opacity-60"
            >
              Features
            </Link>

            <Link
              href="/solutions"
              className="transition-opacity hover:opacity-60"
            >
              Solutions
            </Link>

            <Link
              href="/pricing"
              className="transition-opacity hover:opacity-60"
            >
              Pricing
            </Link>

            <Link href="/resources" className="text-[#2F6BFF]">
              Resources
            </Link>
          </nav>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-[#0B0D0C] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Create Your TapQR
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Article Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[140px]" />

        <div className="mx-auto max-w-4xl">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF]"
          >
            <ArrowLeft size={16} />
            Back to Resources
          </Link>

          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Dynamic QR
            </p>

            <h1 className="mt-5 text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              What Is a Dynamic QR Code?
            </h1>

            <p className="mt-7 max-w-3xl text-xl leading-9 text-black/55">
              A practical guide to understanding dynamic QR codes, how they
              work, how they differ from static QR codes, and why they are
              useful for modern digital experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[32px] border border-black/8 bg-white p-7 shadow-sm sm:p-10 lg:p-12">
            <section>
              <h2 className="text-3xl font-semibold tracking-tight">
                What is a dynamic QR code?
              </h2>

              <p className="mt-5 text-lg leading-8 text-black/60">
                A dynamic QR code is a QR experience that can connect people
                to information that can be updated after the QR code has
                already been created and shared.
              </p>

              <p className="mt-5 text-lg leading-8 text-black/60">
                This is useful when the information behind the QR code may
                change over time. Instead of replacing every printed QR code,
                you can update the destination or profile connected to it.
              </p>
            </section>

            <section className="mt-14">
              <h2 className="text-3xl font-semibold tracking-tight">
                How does a dynamic QR code work?
              </h2>

              <p className="mt-5 text-lg leading-8 text-black/60">
                The QR code acts as a gateway to a digital destination. When
                someone scans it, they are taken to the experience connected
                to that QR code.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Create your digital profile or destination.",
                  "Generate your dynamic QR code.",
                  "Share or print the QR code.",
                  "Update the information behind the QR when needed.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl bg-paper p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-white">
                      <Check size={13} strokeWidth={3} />
                    </span>

                    <p className="text-sm leading-6 text-black/65">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14">
              <h2 className="text-3xl font-semibold tracking-tight">
                Dynamic QR vs. static QR
              </h2>

              <p className="mt-5 text-lg leading-8 text-black/60">
                The main difference is flexibility. A static QR code generally
                contains a fixed destination, while a dynamic QR experience
                can allow the destination or information behind the QR code
                to change.
              </p>

              <div className="mt-8 overflow-hidden rounded-2xl border border-black/8">
                <div className="grid grid-cols-2 bg-paper text-sm font-semibold">
                  <div className="p-4">Static QR</div>
                  <div className="p-4">Dynamic QR</div>
                </div>

                <div className="grid grid-cols-2 border-t border-black/8 text-sm">
                  <div className="p-4 text-black/55">
                    Fixed destination
                  </div>

                  <div className="border-l border-black/8 p-4 text-black/55">
                    Updateable destination
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-black/8 text-sm">
                  <div className="p-4 text-black/55">
                    Changes may require a new QR
                  </div>

                  <div className="border-l border-black/8 p-4 text-black/55">
                    Same QR can continue to be shared
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-14">
              <h2 className="text-3xl font-semibold tracking-tight">
                Why businesses use dynamic QR codes
              </h2>

              <p className="mt-5 text-lg leading-8 text-black/60">
                Businesses and professionals often share information across
                physical and digital touchpoints. Dynamic QR codes can make
                those experiences easier to maintain.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Digital business cards",
                  "Business contact information",
                  "Marketing materials",
                  "Posters and displays",
                  "Product packaging",
                  "Professional networking",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-black/8 bg-paper p-5"
                  >
                    <p className="font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14">
              <h2 className="text-3xl font-semibold tracking-tight">
                How TapQR uses dynamic QR codes
              </h2>

              <p className="mt-5 text-lg leading-8 text-black/60">
                TapQR connects your dynamic QR code to your digital profile.
                Your profile can bring together contact information, social
                profiles, links, and other information you want people to
                discover.
              </p>

              <p className="mt-5 text-lg leading-8 text-black/60">
                When your information changes, you can update your TapQR
                profile while continuing to use the QR code you have already
                shared.
              </p>

              <Link
                href="/features"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-[#2F6BFF]"
              >
                Explore TapQR Features
                <ArrowRight size={17} />
              </Link>
            </section>

            <section className="mt-14">
              <h2 className="text-3xl font-semibold tracking-tight">
                Frequently asked questions
              </h2>

              <div className="mt-8 space-y-4">
                {faqSchema.mainEntity.map((faq) => (
                  <details
                    key={faq.name}
                    className="group rounded-2xl border border-black/8 p-5"
                  >
                    <summary className="cursor-pointer list-none font-semibold">
                      {faq.name}
                    </summary>

                    <p className="mt-4 text-sm leading-7 text-black/55">
                      {faq.acceptedAnswer.text}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-8 rounded-[32px] bg-[#2F6BFF] px-7 py-14 text-center text-white sm:px-12">
            <Sparkles className="mx-auto" size={28} />

            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to create your dynamic QR?
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
              Start with one QR and bring your digital identity together with
              TapQR.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0B0D0C]"
            >
              Create Your TapQR
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </article>

      <footer className="px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 border-t border-black/5 pt-8 text-sm text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-semibold text-black">
            TapQR
          </Link>

          <div className="flex flex-wrap gap-5">
            <Link href="/">Home</Link>
            <Link href="/features">Features</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/resources">Resources</Link>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </main>
  );
}