'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Palette,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Share2,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'

const resources = [
  {
    icon: BookOpen,
    category: 'Getting started',
    title: 'How TapQR works',
    description:
      'Learn how to create your profile, generate your dynamic QR, and start sharing your digital identity.',
    href: '#getting-started',
  },
  {
    icon: RefreshCw,
    category: 'Dynamic QR',
    title: 'Understanding dynamic QR codes',
    description:
      'Learn why your TapQR QR can continue working even when the information behind your profile changes.',
    href: '#dynamic-qr',
  },
  {
    icon: BarChart3,
    category: 'Analytics',
    title: 'Understanding QR analytics',
    description:
      'See how analytics can help you understand activity around your TapQR profile.',
    href: '#analytics',
  },
  {
    icon: Palette,
    category: 'Branding',
    title: 'Customize your QR',
    description:
      'Discover how Pro users can use custom QR colors, their own brand colors, and their logo.',
    href: '#branding',
  },
  {
    icon: Users,
    category: 'Profiles',
    title: 'Using multiple profiles',
    description:
      'Learn how multiple QR profiles can help you manage different roles, identities, or use cases.',
    href: '#profiles',
  },
  {
    icon: ShieldCheck,
    category: 'Sharing',
    title: 'Share your TapQR',
    description:
      'Explore practical ways to use your dynamic QR across digital and physical touchpoints.',
    href: '#sharing',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your profile',
    text: 'Add your contact information, social profiles, links, and other information you want people to access.',
  },
  {
    number: '02',
    title: 'Generate your dynamic QR',
    text: 'Your TapQR profile is connected to a dynamic QR code that can keep pointing to your profile as it changes.',
  },
  {
    number: '03',
    title: 'Share your QR',
    text: 'Use your QR on cards, posters, packaging, websites, screens, or wherever people need to connect with you.',
  },
  {
    number: '04',
    title: 'Keep your information updated',
    text: 'Update your TapQR profile from the platform without needing to replace the QR code you have already shared.',
  },
]

const faqs = [
  {
    question: 'What is a TapQR dynamic QR code?',
    answer:
      'A TapQR dynamic QR code connects people to your TapQR profile. When you update the information behind your profile, you can keep using the same QR code.',
  },
  {
    question: 'Can I change my profile after sharing my QR?',
    answer:
      'Yes. The purpose of a dynamic QR is to let you update the profile connected to the QR without having to replace the QR code you have already shared.',
  },
  {
    question: 'Can I add social media and contact information?',
    answer:
      'Yes. TapQR profiles are designed to bring your links, social profiles, contact information, and other important details together.',
  },
  {
    question: 'Can I create multiple profiles?',
    answer:
      'Free accounts include one QR profile. Pro plans support multiple QR profiles for different roles, people, or use cases.',
  },
  {
    question: 'Can I use my own branding?',
    answer:
      'Pro users can customize QR colors and use their own brand colors and logo.',
  },
]

export default function ResourcesPage() {
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

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[140px]" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/20 bg-[#2F6BFF]/5 px-4 py-2 text-sm font-medium text-[#1748C7]">
            <Sparkles size={15} />
            Learn. Create. Share.
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Everything you need to
            <span className="block text-[#2F6BFF]">
              get more from TapQR.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/55 sm:text-xl">
            Learn how dynamic QR codes, profiles, branding, analytics, and
            sharing work together to create a simpler digital identity.
          </p>
        </motion.div>
      </section>

      {/* Resource cards */}
      <section className="px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => {
              const Icon = resource.icon

              return (
                <motion.a
                  key={resource.title}
                  href={resource.href}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.06,
                  }}
                  className="group rounded-[28px] border border-black/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(11,13,12,0.07)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <Icon size={21} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-black/20 transition-all group-hover:translate-x-1 group-hover:text-[#2F6BFF]"
                    />
                  </div>

                  <p className="mt-7 text-xs font-semibold uppercase tracking-[0.15em] text-[#2F6BFF]">
                    {resource.category}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {resource.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-black/50">
                    {resource.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF]">
                    Learn more
                    <ChevronRight size={16} />
                  </div>
                </motion.a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Getting started */}
      <section
        id="getting-started"
        className="border-y border-black/5 bg-white px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Getting started
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Start with one QR.
              <span className="block text-[#2F6BFF]">
                Build from there.
              </span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              The TapQR experience is designed to stay simple from your first
              profile to a fully branded QR identity.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                className="rounded-[26px] border border-black/8 bg-paper p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-bold text-white">
                  {step.number}
                </span>

                <h3 className="mt-6 text-lg font-semibold">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic QR explanation */}
      <section
        id="dynamic-qr"
        className="px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <RefreshCw size={22} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Dynamic QR
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your QR doesn't have to change when your information does.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-black/50">
              TapQR keeps your QR connected to your profile. Update the
              information from TapQR and continue using the QR you already
              shared.
            </p>
          </div>

          <div className="rounded-[32px] bg-[#0B0D0C] p-7 text-white sm:p-10">
            <div className="space-y-4">
              {[
                {
                  title: 'Your QR',
                  text: 'Remains the same',
                },
                {
                  title: 'Your profile',
                  text: 'Can be updated',
                },
                {
                  title: 'Your destination',
                  text: 'Stays connected',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.1,
                  }}
                  className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm text-white/45">
                      {item.text}
                    </p>
                  </div>

                  <Check
                    size={19}
                    className="shrink-0 text-[#5E8BFF]"
                    strokeWidth={2.5}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Branding */}
      <section
        id="branding"
        className="border-y border-black/5 bg-[#F0F4FA] px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <Palette size={22} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Branding
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Make your QR look like you.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-black/50">
              Pro users can customize their QR experience with their own
              colors and logo, making the QR feel like part of their brand.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Custom QR colors',
                'Your own brand colors',
                'Your own logo',
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

          <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[32px] bg-[#0B0D0C] p-10">
            <div className="absolute h-64 w-64 rounded-full bg-[#2F6BFF]/20 blur-[90px]" />

            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 1, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full max-w-[280px] rounded-[26px] bg-white p-5 text-black shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
            >
              <div className="rounded-[20px] bg-[#2F6BFF] p-5">
                <div className="mx-auto flex aspect-square max-w-[155px] items-center justify-center rounded-xl bg-white p-4">
                  <div
                    className="grid aspect-square w-full grid-cols-8 gap-1"
                    aria-label="Decorative QR illustration"
                  >
                    {Array.from({ length: 64 }).map((_, index) => (
                      <span
                        key={index}
                        className={`rounded-[1px] ${
                          (index * 7 + Math.floor(index / 8) * 3) % 5 < 2
                            ? 'bg-[#0B0D0C]'
                            : 'bg-black/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm font-semibold">
                Your Brand
              </p>

              <p className="mt-1 text-xs text-black/45">
                Branded TapQR profile
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section
        id="analytics"
        className="px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[32px] border border-black/8 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-black/40">
                  Profile activity
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  2,847
                </p>
              </div>

              <div className="rounded-full bg-[#2F6BFF]/10 px-3 py-1.5 text-xs font-semibold text-[#2F6BFF]">
                +18%
              </div>
            </div>

            <div className="mt-10 flex h-44 items-end gap-2">
              {[30, 43, 36, 52, 47, 69, 61, 78, 72, 91, 83, 97].map(
                (height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.04,
                    }}
                    className="flex-1 rounded-t-lg bg-[#2F6BFF]"
                  />
                ),
              )}
            </div>

            <div className="mt-5 flex justify-between text-xs text-black/35">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <BarChart3 size={22} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Analytics
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Understand what happens after the scan.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              Analytics give you insight into activity around your TapQR
              profile, helping you understand how your digital identity is
              being discovered.
            </p>
          </div>
        </div>
      </section>

      {/* Profiles */}
      <section
        id="profiles"
        className="border-y border-black/5 bg-white px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Multiple profiles
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              One account.
              <span className="block text-[#2F6BFF]">
                Different identities.
              </span>
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              Pro users can create multiple QR profiles for different roles,
              people, or situations.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Agent',
                text: 'A profile for customer-facing work and networking.',
              },
              {
                title: 'Manager',
                text: 'A separate profile for professional communication.',
              },
              {
                title: 'Support',
                text: 'A focused identity for customer support and contact.',
              },
            ].map((profile, index) => (
              <motion.div
                key={profile.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                className="rounded-[28px] border border-black/8 bg-paper p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                  <UserRound size={20} />
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {profile.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  {profile.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sharing */}
      <section
        id="sharing"
        className="px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-6xl rounded-[36px] bg-[#0B0D0C] px-7 py-16 text-center text-white sm:px-12 lg:py-20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]">
            <Share2Icon />
          </div>

          <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Share your digital identity wherever people meet you.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">
            From business cards to posters and digital screens, your dynamic
            TapQR can become a simple gateway to everything you want people
            to discover.
          </p>

          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#2F6BFF] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Create Your TapQR
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-black/5 bg-[#F0F4FA] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Frequently asked
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Common questions.
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

      {/* Final CTA */}
      <section className="px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#2F6BFF] px-7 py-16 text-center text-white sm:px-12 lg:py-20">
          <Sparkles className="mx-auto" size={30} />

          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to create your digital identity?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/75">
            Start with one dynamic QR and share everything through TapQR.
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
            <Link href="/" className="transition-colors hover:text-black">
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
  )
}

function Share2Icon() {
  return (
    <Share2
      size={23}
      strokeWidth={2.2}
    />
  )
}