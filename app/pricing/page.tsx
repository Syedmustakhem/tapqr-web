"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  Crown,
  Palette,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Everything you need to start sharing.",
    price: "₹0",
    period: "forever",
    icon: QrCode,
    popular: false,
    features: [
      "1 dynamic QR profile",
      "Add links and social profiles",
      "Contact information",
      "Dynamic QR updates",
      "Basic analytics",
      "TapQR profile",
    ],
    cta: "Create Free QR",
    href: "/register",
  },
  {
    name: "Pro Monthly",
    description: "Build a branded digital identity.",
    price: "₹199",
    period: "/ month",
    icon: Sparkles,
    popular: true,
    features: [
      "Everything in Free",
      "Multiple QR profiles",
      "Custom QR colors",
      "Your own brand colors",
      "Add your own logo",
      "Advanced QR customization",
      "Analytics",
    ],
    cta: "Get TapQR Pro",
    href: "/register?plan=monthly",
  },
  {
    name: "Pro Yearly",
    description: "The best value for growing brands.",
    price: "₹999",
    period: "/ year",
    icon: Crown,
    popular: false,
    features: [
      "Everything in Pro Monthly",
      "Multiple QR profiles",
      "Custom QR colors",
      "Your own brand colors",
      "Your own logo",
      "Advanced customization",
      "Analytics",
    ],
    cta: "Choose Yearly",
    href: "/register?plan=yearly",
  },
];

const capabilities = [
  {
    icon: QrCode,
    title: "Dynamic QR Codes",
    description:
      "Update your TapQR profile from the backend without needing to replace the QR code.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Understand how your QR profile is being viewed and shared.",
  },
  {
    icon: Palette,
    title: "Your Brand",
    description:
      "Pro users can customize QR colors and add their own branding.",
  },
  {
    icon: Users,
    title: "Multiple Profiles",
    description:
      "Create separate QR profiles for different roles, people, or use cases.",
  },
];

const faqs = [
  {
    question: "What is included in the free plan?",
    answer:
      "The Free plan includes one dynamic QR profile, links and social profiles, contact information, dynamic QR updates, basic analytics, and your TapQR profile.",
  },
  {
    question: "Can I create multiple QR profiles?",
    answer:
      "Free accounts include one QR profile. Pro plans support multiple QR profiles for different roles, people, or use cases.",
  },
  {
    question: "Can I use my own brand colors?",
    answer:
      "Yes. Custom QR colors and your own branding are available with TapQR Pro.",
  },
  {
    question: "Can I change my QR after sharing it?",
    answer:
      "Yes. TapQR dynamic QR codes are designed so your profile can be updated without changing the QR code you have already shared.",
  },
  {
    question: "What is a dynamic QR code?",
    answer:
      "Your QR code points to your TapQR profile. When you update your profile from TapQR, the destination stays the same, so you do not need to replace or reprint the QR code.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Header */}
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
            <Link
              href="/"
              className="transition-opacity hover:opacity-60"
            >
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
              className="text-[#2F6BFF]"
            >
              Pricing
            </Link>

            <Link
              href="/resources"
              className="transition-opacity hover:opacity-60"
            >
              Resources
            </Link>

            <Link
              href="/about"
              className="transition-opacity hover:opacity-60"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="transition-opacity hover:opacity-60"
            >
              Contact
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
              className="inline-flex items-center gap-2 rounded-full bg-[#2F6BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(47,107,255,0.22)] transition-transform hover:-translate-y-0.5"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-24 lg:px-8 lg:pb-20 lg:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/20 bg-[#2F6BFF]/5 px-4 py-2 text-sm font-medium text-[#1748C7]">
            <Sparkles size={15} />
            Simple pricing. Powerful QR technology.
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Choose the plan that
            <span className="block text-[#2F6BFF]">
              fits your identity.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/55 sm:text-xl">
            Start free with one dynamic QR profile, or unlock powerful
            branding, customization, analytics, and multiple profiles with
            TapQR.
          </p>
        </motion.div>
      </section>

      {/* Pricing cards */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.1,
                }}
                className={`relative flex flex-col rounded-[28px] border p-7 shadow-sm ${
                  plan.popular
                    ? "border-[#2F6BFF]/40 bg-[#0B0D0C] text-white shadow-[0_25px_80px_rgba(47,107,255,0.16)]"
                    : "border-black/8 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-6 top-6 rounded-full bg-[#2F6BFF] px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}

                <div
                  className={`mb-7 flex h-12 w-12 items-center justify-center rounded-2xl ${
                    plan.popular
                      ? "bg-[#2F6BFF] text-white"
                      : "bg-[#2F6BFF]/10 text-[#2F6BFF]"
                  }`}
                >
                  <Icon size={22} />
                </div>

                <h2 className="text-2xl font-semibold">
                  {plan.name}
                </h2>

                <p
                  className={`mt-2 min-h-[48px] text-sm leading-6 ${
                    plan.popular ? "text-white/55" : "text-black/50"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-8 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tight">
                    {plan.price}
                  </span>

                  <span
                    className={`pb-1 text-sm ${
                      plan.popular ? "text-white/50" : "text-black/45"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <Link
                  href={plan.href}
                  className={`mt-8 flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                    plan.popular
                      ? "bg-[#2F6BFF] text-white"
                      : "bg-[#0B0D0C] text-white"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>

                <div
                  className={`my-8 h-px ${
                    plan.popular ? "bg-white/10" : "bg-black/8"
                  }`}
                />

                <p
                  className={`mb-5 text-xs font-semibold uppercase tracking-[0.16em] ${
                    plan.popular ? "text-white/40" : "text-black/40"
                  }`}
                >
                  Includes
                </p>

                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.popular
                            ? "bg-[#2F6BFF] text-white"
                            : "bg-[#2F6BFF]/10 text-[#2F6BFF]"
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>

                      <span
                        className={
                          plan.popular
                            ? "text-white/75"
                            : "text-black/65"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-y border-black/5 bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Built into TapQR
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              One QR. More possibilities.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              TapQR gives you a flexible digital identity that can evolve
              without replacing the QR code you&apos;ve already shared.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item, index) => {
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
                  className="rounded-3xl border border-black/8 bg-paper p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              FAQ
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Simple answers.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-black/50">
              Everything you need to know about TapQR plans and features.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-black/8 bg-white p-6"
              >
                <summary className="cursor-pointer list-none text-base font-semibold">
                  <div className="flex items-center justify-between gap-6">
                    {faq.question}

                    <span className="text-2xl font-light text-[#2F6BFF] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-black/50">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-10 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#0B0D0C] px-7 py-16 text-center text-white sm:px-12 lg:py-20">
          <ShieldCheck
            className="mx-auto text-[#2F6BFF]"
            size={32}
          />

          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Your identity deserves one simple link.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">
            Create your TapQR today and start sharing everything through one
            dynamic QR code.
          </p>

          <Link
            href="/register"
            className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-[#2F6BFF] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(47,107,255,0.25)] transition-transform hover:-translate-y-0.5"
          >
            Create your TapQR
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-black/5 pt-8 text-sm text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-semibold text-black"
          >
            TapQR
          </Link>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/"
              className="hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/features"
              className="hover:text-black"
            >
              Features
            </Link>

            <Link
              href="/solutions"
              className="hover:text-black"
            >
              Solutions
            </Link>

            <Link
              href="/pricing"
              className="hover:text-black"
            >
              Pricing
            </Link>

            <Link
              href="/resources"
              className="hover:text-black"
            >
              Resources
            </Link>

            <Link
              href="/about"
              className="hover:text-black"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="hover:text-black"
            >
              Contact
            </Link>

            <Link
              href="/login"
              className="hover:text-black"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}