"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react";

const benefits = [
  "Share your contact information instantly",
  "Connect social profiles and important links",
  "Use one QR code instead of carrying multiple links",
  "Update your information without replacing your QR",
  "Create a professional digital identity",
];

const useCases = [
  {
    title: "Professionals",
    description:
      "Share your contact details, portfolio, LinkedIn profile, website, and other professional information from one place.",
  },
  {
    title: "Businesses",
    description:
      "Give customers a simple way to discover your business information, website, social profiles, and contact options.",
  },
  {
    title: "Creators",
    description:
      "Bring social media, websites, content, and other important links together in one easy-to-share profile.",
  },
];

const faqs = [
  {
    question: "What is a digital business card?",
    answer:
      "A digital business card is an online version of a traditional business card. Instead of relying only on printed contact information, it can provide a profile containing your contact details, social links, websites, and other information.",
  },
  {
    question: "Can a digital business card use a QR code?",
    answer:
      "Yes. A QR code can provide a fast way for someone to open your digital business card or profile using their smartphone.",
  },
  {
    question: "What is the difference between a QR business card and a traditional business card?",
    answer:
      "A traditional business card contains printed information that generally stays fixed. A digital business card can contain links and information that can be updated over time.",
  },
  {
    question: "Can I update my TapQR profile after sharing my QR?",
    answer:
      "Yes. TapQR uses a dynamic QR experience, allowing the profile connected to your QR to be updated without requiring you to replace the QR code you have already shared.",
  },
  {
    question: "How do I create a digital business card with TapQR?",
    answer:
      "Create a TapQR account, build your digital profile, add the information and links you want people to discover, and use your generated QR to share the profile.",
  },
];

export default function DigitalBusinessCardPage() {
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
          className="flex items-center gap-2 text-sm text-black/40"
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
            Digital Business Card
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
            TapQR Guide
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Digital Business Card:
            <span className="block text-[#2F6BFF]">
              The Complete Guide
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-black/55 sm:text-xl">
            Learn what a digital business card is, how QR business cards work,
            why they are useful, and how TapQR can help you share your digital
            identity through one simple QR.
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
              href="/resources/what-is-a-dynamic-qr-code"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              Learn about dynamic QR
              <ChevronRight size={17} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* What is it */}
      <section className="border-y border-black/5 bg-white px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <article>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              What is a digital business card?
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your professional information, available digitally.
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/55">
              A digital business card is an online profile that can contain
              your professional and contact information. Instead of relying
              only on a printed card, you can give people a digital destination
              where they can discover more about you.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/55">
              A digital business card can include information such as your
              name, phone number, email address, website, social profiles,
              portfolio, and other important links.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/55">
              With a QR code, accessing that information can become as simple
              as scanning once with a smartphone.
            </p>
          </article>

          <div className="rounded-[32px] bg-[#0B0D0C] p-8 text-white sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2F6BFF]">
              <Smartphone size={25} />
            </div>

            <h3 className="mt-8 text-2xl font-semibold">
              One digital destination
            </h3>

            <p className="mt-3 text-sm leading-7 text-white/50">
              Instead of asking someone to type several links or manually save
              contact information, a QR-powered digital profile can bring the
              experience together.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Contact information",
                "Social profiles",
                "Websites and links",
                "Professional information",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/75"
                >
                  <Check
                    size={15}
                    className="text-[#5E8BFF]"
                    strokeWidth={3}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QR section */}
      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-[34px] bg-[#F0F4FA] p-8 sm:p-12">
              <div className="mx-auto max-w-[310px] rounded-[28px] bg-white p-6 shadow-sm">
                <div className="rounded-[22px] bg-[#2F6BFF] p-6">
                  <div className="mx-auto flex aspect-square max-w-[190px] items-center justify-center rounded-2xl bg-white p-5">
                    <div
                      className="grid aspect-square w-full grid-cols-8 gap-1"
                      aria-label="Decorative QR code illustration"
                    >
                      {Array.from({ length: 64 }).map((_, index) => {
                        const row = Math.floor(index / 8);
                        const col = index % 8;

                        const finder =
                          (row < 3 && col < 3) ||
                          (row < 3 && col > 4) ||
                          (row > 4 && col < 3);

                        const pattern =
                          (index * 11 + row * 7 + col * 3) % 5 < 2;

                        return (
                          <span
                            key={index}
                            className={`rounded-[1px] ${
                              finder || pattern
                                ? "bg-[#0B0D0C]"
                                : "bg-black/10"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="font-semibold">Your Digital Profile</p>

                  <p className="mt-1 text-sm text-black/40">
                    Scan to connect.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <article className="order-1 lg:order-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <QrCode size={23} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Digital business card QR code
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Why put your digital card behind a QR code?
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/55">
              QR codes provide a quick bridge between physical interactions
              and digital information. Someone can scan the code and open your
              digital profile from their smartphone.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/55">
              This makes a QR business card useful at meetings, events,
              networking opportunities, storefronts, packaging, printed
              materials, and many other physical touchpoints.
            </p>

            <Link
              href="/resources/what-is-a-dynamic-qr-code"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF]"
            >
              Learn how dynamic QR codes work
              <ArrowRight size={16} />
            </Link>
          </article>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-black/5 bg-white px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Benefits
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Why use a digital business card?
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              A digital profile can make sharing information simpler while
              giving you more flexibility than a printed card.
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
                className="rounded-[26px] border border-black/8 bg-paper p-6"
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

      {/* Comparison */}
      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Digital vs traditional
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              A business card that can keep evolving.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              Traditional cards are useful, but the information printed on
              them can become outdated. A digital business card gives you a
              flexible destination for information that can change over time.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-[30px] border border-black/8 bg-white">
            <div className="grid grid-cols-2 border-b border-black/8">
              <div className="p-5 text-sm font-semibold">
                Traditional business card
              </div>

              <div className="border-l border-black/8 p-5 text-sm font-semibold text-[#2F6BFF]">
                Digital business card
              </div>
            </div>

            {[
              ["Printed information", "Digital information"],
              ["Harder to update", "Can be updated"],
              ["Limited space", "Can contain multiple links"],
              ["Physical sharing", "Digital + physical sharing"],
              ["Replace when outdated", "Keep the same profile"],
            ].map(([traditional, digital]) => (
              <div
                key={traditional}
                className="grid grid-cols-2 border-b border-black/8 last:border-b-0"
              >
                <div className="p-5 text-sm text-black/55">
                  {traditional}
                </div>

                <div className="border-l border-black/8 p-5 text-sm font-medium text-black/75">
                  {digital}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-y border-black/5 bg-[#F0F4FA] px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Who can use it?
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Useful for different kinds of people.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {useCases.map((item, index) => (
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
                  {index === 0 ? (
                    <UserRoundIcon />
                  ) : index === 1 ? (
                    <UsersIcon />
                  ) : (
                    <Share2 size={20} />
                  )}
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-black/50">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How TapQR works */}
      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
                How TapQR works
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Create once.
                <span className="block text-[#2F6BFF]">
                  Share everywhere.
                </span>
              </h2>

              <p className="mt-5 text-lg leading-8 text-black/50">
                TapQR brings your digital business card and QR experience
                together in one place.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  number: "01",
                  title: "Create your TapQR profile",
                  text: "Add your name, contact details, social profiles, websites, and other important information.",
                },
                {
                  number: "02",
                  title: "Get your dynamic QR",
                  text: "Your profile is connected to a QR that can continue pointing to your digital identity.",
                },
                {
                  number: "03",
                  title: "Share your QR",
                  text: "Put it on your business card, website, poster, packaging, screen, or other touchpoint.",
                },
                {
                  number: "04",
                  title: "Keep your profile updated",
                  text: "Update your digital information without needing to replace the QR you have already shared.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-5 rounded-[24px] border border-black/8 bg-white p-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-bold text-white">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-black/50">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-black/5 bg-white px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              FAQ
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Digital business card questions.
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-black/8 bg-paper p-6"
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
          <Sparkles className="mx-auto" size={30} />

          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to create your digital business card?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/75">
            Create your TapQR profile and put your digital identity behind one
            simple QR.
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

function UserRoundIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}