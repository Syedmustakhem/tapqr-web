"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Globe,
  Link2,
  Package,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";

const benefits = [
  "Give customers instant access to your business information",
  "Connect websites, social profiles, and important links",
  "Use one QR across physical and digital touchpoints",
  "Update connected information without replacing a dynamic QR",
  "Create a simpler way for people to connect with your business",
];

const useCases = [
  {
    icon: Smartphone,
    title: "Customer contact",
    description:
      "Give customers a simple way to discover your contact information, website, social profiles, and other important business details.",
  },
  {
    icon: Package,
    title: "Products & packaging",
    description:
      "Place a QR code on packaging or physical products and connect customers to useful digital information.",
  },
  {
    icon: Globe,
    title: "Websites & marketing",
    description:
      "Connect printed marketing materials and physical campaigns to your online business presence.",
  },
  {
    icon: Users,
    title: "Events & networking",
    description:
      "Help customers, prospects, partners, and event attendees discover your business information quickly.",
  },
];

const faqs = [
  {
    question: "What is a QR code for business?",
    answer:
      "A business QR code is a QR code used to connect customers or other audiences to digital business information such as a website, profile, contact information, social media, products, or other online destinations.",
  },
  {
    question: "Where can businesses use QR codes?",
    answer:
      "Businesses can use QR codes on business cards, packaging, posters, brochures, storefronts, displays, event materials, websites, and many other physical or digital touchpoints.",
  },
  {
    question: "What is the difference between a static and dynamic QR code?",
    answer:
      "A static QR generally contains a fixed destination or information. A dynamic QR can point through a managed destination, allowing the information or destination behind the QR to be updated without replacing the QR itself.",
  },
  {
    question: "Can I use one QR code for multiple business links?",
    answer:
      "Yes. A QR-powered digital profile can bring multiple business links and information together so people can access them from one destination.",
  },
  {
    question: "How can TapQR help my business?",
    answer:
      "TapQR lets businesses create a digital profile connected to a dynamic QR. The profile can bring together business information, links, social profiles, contact options, and other useful details.",
  },
];

export default function QRCodeForBusinessPage() {
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

            <Link
              href="/resources"
              className="text-[#2F6BFF]"
            >
              Resources
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium transition-opacity hover:opacity-60 sm:block"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#0B0D0C] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Create Your TapQR
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-6 pt-8 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-black/40"
        >
          <Link href="/" className="hover:text-black">
            Home
          </Link>

          <ChevronRight size={14} />

          <Link href="/resources" className="hover:text-black">
            Resources
          </Link>

          <ChevronRight size={14} />

          <span className="text-black/60">
            QR Codes for Business
          </span>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[140px]" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/20 bg-[#2F6BFF]/5 px-4 py-2 text-sm font-medium text-[#1748C7]">
            <Sparkles size={15} />
            TapQR Business Guide
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            QR Codes for Business:
            <span className="block text-[#2F6BFF]">
              A Complete Guide
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-black/55 sm:text-xl">
            Learn how businesses can use QR codes to connect customers with
            websites, contact information, social profiles, products, and
            other digital experiences.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#2F6BFF] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(47,107,255,0.2)] transition-transform hover:-translate-y-0.5"
            >
              Create Your TapQR
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              Explore business solutions
              <ChevronRight size={17} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Introduction */}
      <section className="border-y border-black/5 bg-white px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <article>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              What is a business QR code?
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Turn a simple scan into a digital connection.
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/55">
              A business QR code gives people a quick way to access digital
              information from a smartphone. Instead of typing a web address
              or searching for your business online, someone can scan the QR
              and open the destination connected to it.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/55">
              Depending on how it is configured, a QR code can connect people
              to a website, contact information, social media, product
              information, a digital business card, or a broader digital
              profile.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/55">
              With TapQR, businesses can bring multiple important links and
              pieces of information together behind one dynamic QR-powered
              profile.
            </p>
          </article>

          <div className="rounded-[32px] bg-[#0B0D0C] p-8 text-white sm:p-10">
            <div className="mx-auto flex aspect-square max-w-[230px] items-center justify-center rounded-[28px] bg-[#2F6BFF] p-7">
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white p-5">
                <div
                  className="grid aspect-square w-full grid-cols-9 gap-1"
                  aria-label="Decorative QR code illustration"
                >
                  {Array.from({ length: 81 }).map((_, index) => {
                    const row = Math.floor(index / 9);
                    const col = index % 9;

                    const finder =
                      (row < 3 && col < 3) ||
                      (row < 3 && col > 5) ||
                      (row > 5 && col < 3);

                    const innerFinder =
                      ((row === 1 && col === 1) ||
                        (row === 1 && col === 7) ||
                        (row === 7 && col === 1));

                    const pattern =
                      (index * 13 + row * 5 + col * 7) % 5 < 2;

                    return (
                      <span
                        key={index}
                        className={`rounded-[1px] ${
                          finder
                            ? innerFinder
                              ? "bg-white"
                              : "bg-[#0B0D0C]"
                            : pattern
                              ? "bg-[#0B0D0C]"
                              : "bg-black/10"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-7 text-center">
              <p className="text-lg font-semibold">
                Scan once.
              </p>

              <p className="mt-1 text-sm text-white/45">
                Discover your business online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why businesses use QR codes */}
      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Why use QR codes?
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Make it easier for customers to connect.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              QR codes can reduce friction between physical interactions and
              your digital business presence.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
                className="rounded-[26px] border border-black/8 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
                  <Check size={18} strokeWidth={3} />
                </div>

                <p className="mt-5 text-base font-semibold leading-7">
                  {benefit}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-y border-black/5 bg-[#F0F4FA] px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Business use cases
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Put your QR where your customers are.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              A business QR can be useful across many physical and digital
              touchpoints.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="rounded-[28px] bg-white p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-black/50">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic QR */}
      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <article>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <RefreshIcon />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Dynamic QR codes
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Keep the QR.
              <span className="block text-[#2F6BFF]">
                Change the information.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/55">
              Business information changes over time. Your website may change,
              your contact details may change, and your marketing campaigns
              may change.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/55">
              A dynamic QR experience can make it possible to update the
              destination or profile connected to your QR without replacing
              the physical QR code.
            </p>

            <Link
              href="/resources/what-is-a-dynamic-qr-code"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF]"
            >
              Read our dynamic QR guide
              <ArrowRight size={16} />
            </Link>
          </article>

          <div className="rounded-[32px] bg-[#0B0D0C] p-8 text-white sm:p-10">
            <div className="space-y-4">
              {[
                "Print your QR once",
                "Share it across physical touchpoints",
                "Update your digital profile",
                "Keep using the same QR",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-sm font-bold">
                    {index + 1}
                  </span>

                  <span className="text-sm text-white/75">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TapQR business profile */}
      <section className="border-y border-black/5 bg-white px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[32px] bg-[#F0F4FA] p-8 sm:p-10">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2F6BFF] text-white">
                  <QrCode size={22} />
                </div>

                <div>
                  <p className="font-semibold">
                    TapQR Business Profile
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    One destination for your business.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Business information",
                  "Website",
                  "Social profiles",
                  "Contact options",
                  "Important links",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-black/6 bg-paper p-3 text-sm"
                  >
                    <Check
                      size={15}
                      className="text-[#2F6BFF]"
                      strokeWidth={3}
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <article>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              TapQR for business
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Put your important business information behind one scan.
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/55">
              Instead of sending customers to several different places, a
              TapQR profile can act as one digital destination for your
              business information.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/55">
              Your QR can be placed on business cards, posters, packaging,
              storefronts, event materials, websites, and other places where
              customers interact with your brand.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 rounded-full bg-[#0B0D0C] px-6 py-3 text-sm font-semibold text-white"
              >
                Explore features
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold"
              >
                View pricing
                <ChevronRight size={16} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Practical examples */}
      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Practical examples
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Small scan.
              <span className="block text-[#2F6BFF]">
                Useful destination.
              </span>
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Share2,
                title: "Business card",
                text: "Let people scan your card and open your digital profile.",
              },
              {
                icon: Package,
                title: "Product packaging",
                text: "Connect customers to product information, your website, or other digital resources.",
              },
              {
                icon: Link2,
                title: "Marketing material",
                text: "Turn posters, brochures, displays, and campaigns into digital entry points.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="rounded-[28px] border border-black/8 bg-white p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-black/50">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-black/5 bg-[#F0F4FA] px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              FAQ
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              QR codes for business questions.
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-black/8 bg-white p-6"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between gap-6">
                    <span className="font-semibold">
                      {faq.question}
                    </span>

                    <span className="text-2xl font-light text-[#2F6BFF] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>

                <p className="mt-4 text-sm leading-7 text-black/50">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#2F6BFF] px-7 py-16 text-center text-white sm:px-12 lg:py-20">
          <QrCode className="mx-auto" size={31} />

          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to connect your business through one smart QR?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/75">
            Create your TapQR business profile and give customers one simple
            way to discover everything important about your business.
          </p>

          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0B0D0C] transition-transform hover:-translate-y-0.5"
          >
            Create Your TapQR
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 border-t border-black/5 pt-8 text-sm text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-semibold text-black"
          >
            TapQR
          </Link>

          <div className="flex flex-wrap gap-5">
            <Link href="/" className="hover:text-black">
              Home
            </Link>

            <Link href="/features" className="hover:text-black">
              Features
            </Link>

            <Link href="/solutions" className="hover:text-black">
              Solutions
            </Link>

            <Link href="/pricing" className="hover:text-black">
              Pricing
            </Link>

            <Link href="/resources" className="hover:text-black">
              Resources
            </Link>

            <Link href="/about" className="hover:text-black">
              About
            </Link>

            <Link href="/contact" className="hover:text-black">
              Contact
            </Link>

            <Link href="/login" className="hover:text-black">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}