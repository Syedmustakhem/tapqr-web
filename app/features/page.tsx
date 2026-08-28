'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  ExternalLink,
  Link2,
  Palette,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'

const features = [
  {
    number: '01',
    icon: QrCode,
    title: 'Dynamic QR Codes',
    description:
      'Create a QR code once and keep using it. Update the information behind it from TapQR without replacing the QR code.',
    points: [
      'Backend-controlled QR destination',
      'Update your profile anytime',
      'No need to reprint shared QR codes',
    ],
  },
  {
    number: '02',
    icon: UserRound,
    title: 'Everything in One Profile',
    description:
      'Bring your important information together in one easy-to-share TapQR profile.',
    points: [
      'Contact information',
      'Social profiles',
      'Links and important pages',
    ],
  },
  {
    number: '03',
    icon: Palette,
    title: 'Make It Your Brand',
    description:
      'Pro users can customize their QR experience with their own colors and branding.',
    points: [
      'Custom QR colors',
      'Your own brand colors',
      'Add your own logo',
    ],
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'QR Analytics',
    description:
      'Understand how your TapQR profile is being discovered and interacted with.',
    points: [
      'Track QR activity',
      'Understand engagement',
      'Use insights to improve your profile',
    ],
  },
  {
    number: '05',
    icon: Users,
    title: 'Multiple QR Profiles',
    description:
      'Create separate profiles for different people, roles, or purposes with TapQR Pro.',
    points: [
      'Different profiles for different roles',
      'Separate identities under one account',
      'Useful for teams and businesses',
    ],
  },
  {
    number: '06',
    icon: Share2,
    title: 'Share Everywhere',
    description:
      'One TapQR profile can be shared through your QR code, links, and other digital touchpoints.',
    points: [
      'Simple QR sharing',
      'Easy profile access',
      'One destination for your information',
    ],
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your profile',
    description:
      'Add your links, contact details, social profiles, and the information you want people to see.',
  },
  {
    number: '02',
    title: 'Generate your QR',
    description:
      'TapQR creates a dynamic QR code connected to your profile.',
  },
  {
    number: '03',
    title: 'Share it anywhere',
    description:
      'Put your QR on cards, posters, packaging, screens, websites, or share it digitally.',
  },
  {
    number: '04',
    title: 'Update without replacing',
    description:
      'Change your profile from TapQR while keeping the same QR code you already shared.',
  },
]

export default function FeaturesPage() {
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
              className="text-[#2F6BFF]"
            >
              Features
            </Link>

            <Link
              href="/pricing"
              className="transition-opacity hover:opacity-60"
            >
              Pricing
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
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[130px]" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/20 bg-[#2F6BFF]/5 px-4 py-2 text-sm font-medium text-[#1748C7]">
            <Sparkles size={15} />
            One QR. Everything you want to share.
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Everything behind
            <span className="block text-[#2F6BFF]">
              one QR code.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/55 sm:text-xl">
            TapQR gives you a dynamic QR-powered profile where your links,
            contact information, social profiles, branding, and analytics can
            live together.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2F6BFF] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(47,107,255,0.22)] transition-transform hover:-translate-y-0.5"
            >
              Create Your TapQR
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              View pricing
              <ChevronRight size={17} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Dynamic QR showcase */}
      <section className="px-6 pb-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto grid max-w-6xl overflow-hidden rounded-[36px] bg-[#0B0D0C] text-white lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]">
              <RefreshCw size={22} />
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#5E8BFF]">
              The TapQR difference
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Change what people see.
              <span className="block text-[#2F6BFF]">
                Keep the same QR.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/55">
              Your TapQR QR code is dynamic. The information connected to it
              can be updated from the backend, so you don't have to replace
              the QR code every time your information changes.
            </p>

            <div className="mt-9 space-y-4">
              {[
                'Create once',
                'Share anywhere',
                'Update whenever you need',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/75"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2F6BFF]/20 text-[#6F98FF]">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-[#111A31] p-10">
            <div className="absolute h-72 w-72 rounded-full bg-[#2F6BFF]/20 blur-[90px]" />

            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 1.5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full max-w-[330px] rounded-[30px] bg-white p-5 text-black shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            >
              <div className="rounded-[22px] bg-[#2F6BFF] p-6">
                <div className="mx-auto flex aspect-square max-w-[180px] items-center justify-center rounded-2xl bg-white p-4">
                  <div
                    className="grid aspect-square w-full grid-cols-7 gap-1"
                    aria-label="Decorative QR code illustration"
                  >
                    {Array.from({ length: 49 }).map((_, index) => {
                      const finder =
                        (index < 16 && index % 4 !== 3) ||
                        (index >= 35 && index % 7 !== 3) ||
                        (index % 7 === 0 && index < 28)

                      return (
                        <span
                          key={index}
                          className={`rounded-[1px] ${
                            finder ? 'bg-[#0B0D0C]' : 'bg-black/10'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">TapQR Profile</p>
                  <p className="mt-1 text-xs text-black/45">
                    Your information, one scan away.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
                  <ExternalLink size={16} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="border-y border-black/5 bg-white px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Features
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Everything you need to share smarter.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              Build one flexible profile and connect everything important to
              you through a single dynamic QR.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.article
                  key={feature.number}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.06,
                  }}
                  className="group rounded-[28px] border border-black/8 bg-paper p-7 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <Icon size={20} />
                    </div>

                    <span className="text-xs font-semibold tracking-[0.15em] text-black/25">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black/50">
                    {feature.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {feature.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm text-black/65"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-[#2F6BFF]"
                          strokeWidth={2.5}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
                How it works
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                One profile.
                <span className="block text-[#2F6BFF]">
                  One dynamic QR.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-lg leading-8 text-black/50">
                TapQR keeps the experience simple for the person sharing and
                the person scanning.
              </p>
            </div>

            <div className="space-y-5">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="group flex gap-5 rounded-[26px] border border-black/8 bg-white p-6 sm:p-7"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-sm font-bold text-white">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-black/50">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-y border-black/5 bg-[#F0F4FA] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Built for more than one use case
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              One TapQR. Many ways to use it.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: UserRound,
                title: 'Individuals',
                text: 'Share your contact information and important links instantly.',
              },
              {
                icon: Users,
                title: 'Teams',
                text: 'Create separate profiles for different people and roles.',
              },
              {
                icon: Link2,
                title: 'Creators',
                text: 'Bring your social channels and important links together.',
              },
              {
                icon: ShieldCheck,
                title: 'Businesses',
                text: 'Use your brand colors and logo to create a branded QR experience.',
              },
            ].map((item, index) => {
              const Icon = item.icon

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
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    {item.text}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#0B0D0C] px-7 py-16 text-center text-white sm:px-12 lg:py-20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]">
            <QrCode size={23} />
          </div>

          <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to put everything behind one QR?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">
            Create your TapQR and start sharing your information through one
            dynamic QR code.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2F6BFF] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Create Your TapQR
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
            >
              See pricing
              <ChevronRight size={17} />
            </Link>
          </div>
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
              href="/pricing"
              className="transition-colors hover:text-black"
            >
              Pricing
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