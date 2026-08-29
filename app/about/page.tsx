"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Globe,
  Lightbulb,
  Link2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const principles = [
  {
    icon: Lightbulb,
    title: "Keep it simple",
    description:
      "Sharing your information should not require complicated steps. TapQR is built around one simple QR experience.",
  },
  {
    icon: RefreshCw,
    title: "Stay flexible",
    description:
      "Your information can change. Your dynamic QR is designed to keep connecting people to your profile.",
  },
  {
    icon: Globe,
    title: "Connect everywhere",
    description:
      "Use your TapQR across physical and digital touchpoints wherever people need to connect with you.",
  },
  {
    icon: ShieldCheck,
    title: "Build with purpose",
    description:
      "Every part of the product is designed around making digital identity and sharing more useful.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your TapQR",
    description:
      "Build a profile with the information, links, and details you want people to discover.",
  },
  {
    number: "02",
    title: "Get your dynamic QR",
    description:
      "Your profile is connected to a dynamic QR that can continue pointing to your profile as your information changes.",
  },
  {
    number: "03",
    title: "Share it anywhere",
    description:
      "Place your QR on cards, posters, packaging, websites, screens, or wherever you want to connect.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      {/* Navbar */}
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
              className="transition-opacity hover:opacity-60"
            >
              Pricing
            </Link>

            <Link
              href="/resources"
              className="transition-opacity hover:opacity-60"
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

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24 lg:px-8 lg:pb-32 lg:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[140px]" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/20 bg-[#2F6BFF]/5 px-4 py-2 text-sm font-medium text-[#1748C7]">
            <Sparkles size={15} />
            One scan. Everything.
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Making digital identity
            <span className="block text-[#2F6BFF]">
              easier to share.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/55 sm:text-xl">
            TapQR brings the information people need to connect with you into
            one simple, dynamic QR experience.
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
              href="/features"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              Explore features
              <ArrowRight size={17} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* What is TapQR */}
      <section className="border-y border-black/5 bg-white px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              What is TapQR?
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              One place for everything you want to share.
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/50">
              Instead of sharing different links and pieces of information
              separately, TapQR gives you a single destination that can bring
              them together.
            </p>

            <p className="mt-5 text-lg leading-8 text-black/50">
              Your TapQR profile can contain your important links, contact
              information, social profiles, and other details you want people
              to discover.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[34px] bg-[#0B0D0C] p-7 text-white sm:p-10">
            <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-[#2F6BFF]/20 blur-[80px]" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]">
                  <QrCode size={21} />
                </div>

                <div>
                  <p className="font-semibold">TapQR</p>

                  <p className="text-xs text-white/40">
                    Your digital profile
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[26px] bg-white p-5 text-black">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Users size={24} />
                  </div>

                  <div>
                    <p className="font-semibold">Your identity</p>

                    <p className="text-sm text-black/40">
                      One profile. Many connections.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {[
                    "Contact",
                    "Social links",
                    "Websites",
                    "Other links",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-black/6 bg-paper p-3 text-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              The idea
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your information changes.
              <span className="block text-[#2F6BFF]">
                Your QR shouldn't have to.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-black/50">
              TapQR is built around the idea of a dynamic connection. You can
              update the information behind your QR while continuing to use
              the QR you have already shared.
            </p>
          </div>

          <div className="mt-14 rounded-[34px] bg-[#F0F4FA] p-7 sm:p-10 lg:p-14">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: QrCode,
                  title: "One QR",
                  text: "A single QR can become the gateway to your profile.",
                },
                {
                  icon: Link2,
                  title: "Everything connected",
                  text: "Bring your important information and links together.",
                },
                {
                  icon: RefreshCw,
                  title: "Keep it updated",
                  text: "Change your profile without needing to replace the QR.",
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
                    className="rounded-[25px] border border-black/7 bg-white p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-6 text-xl font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-black/50">
                      {item.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-black/5 bg-white px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              How it works
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Simple by design.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              From creating your profile to sharing your QR, the experience is
              designed around fewer steps and more useful connections.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="rounded-[28px] border border-black/8 bg-paper p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-bold text-white">
                  {step.number}
                </div>

                <h3 className="mt-7 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-black/50">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              What we believe
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Built around better connections.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {principles.map((principle, index) => {
              const Icon = principle.icon;

              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.07,
                  }}
                  className="rounded-[28px] border border-black/8 bg-white p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {principle.title}
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-black/50">
                    {principle.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product promise */}
      <section className="border-y border-black/5 bg-[#F0F4FA] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              The TapQR experience
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              One scan should take people exactly where they need to go.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-black/50">
              That's why TapQR focuses on a single, flexible destination for
              your digital identity instead of making people search through
              multiple links.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "One dynamic QR",
                "Your important information",
                "Flexible profile",
                "Analytics",
                "Optional Pro branding",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2F6BFF] text-white">
                    <Check size={13} strokeWidth={3} />
                  </span>

                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-[#0B0D0C] p-8 text-white sm:p-10">
            <QrCode
              size={34}
              className="text-[#2F6BFF]"
            />

            <p className="mt-8 text-3xl font-semibold tracking-tight">
              One scan.
            </p>

            <p className="mt-1 text-3xl font-semibold tracking-tight text-[#2F6BFF]">
              Everything.
            </p>

            <div className="mt-8 h-px bg-white/10" />

            <p className="mt-7 text-sm leading-7 text-white/50">
              Your QR becomes a simple bridge between the physical world and
              your digital identity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#2F6BFF] px-7 py-16 text-center text-white sm:px-12 lg:py-20">
          <Sparkles className="mx-auto" size={30} />

          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to make every connection simpler?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/75">
            Create your TapQR and start sharing everything through one dynamic
            QR.
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
            <Link
              href="/"
              className="transition-colors hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/features"
              className="transition-colors hover:text-black"
            >
              Features
            </Link>

            <Link
              href="/solutions"
              className="transition-colors hover:text-black"
            >
              Solutions
            </Link>

            <Link
              href="/pricing"
              className="transition-colors hover:text-black"
            >
              Pricing
            </Link>

            <Link
              href="/resources"
              className="transition-colors hover:text-black"
            >
              Resources
            </Link>

            <Link
              href="/login"
              className="transition-colors hover:text-black"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}