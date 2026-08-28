'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Globe,
  Link2,
  Palette,
  QrCode,
  Share2,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'

const solutions = [
  {
    icon: UserRound,
    title: 'Individuals',
    label: 'For your personal identity',
    description:
      'Share your contact details, social profiles, links, and important information through one simple QR code.',
    features: [
      'One dynamic personal QR',
      'Contact and social links',
      'Easy digital sharing',
    ],
  },
  {
    icon: Sparkles,
    title: 'Creators',
    label: 'For your digital presence',
    description:
      'Bring your social channels, content, portfolio, and important links together in one profile.',
    features: [
      'All your important links',
      'One QR for your audience',
      'Profile analytics',
    ],
  },
  {
    icon: BriefcaseBusiness,
    title: 'Professionals',
    label: 'For better networking',
    description:
      'Give people a faster way to save your information and discover your professional presence.',
    features: [
      'Digital professional profile',
      'Contact information',
      'Simple QR networking',
    ],
  },
  {
    icon: Users,
    title: 'Teams',
    label: 'For people working together',
    description:
      'Create separate QR profiles for different members and roles while keeping everything organized.',
    features: [
      'Multiple QR profiles',
      'Different team roles',
      'Individual profile sharing',
    ],
  },
  {
    icon: Globe,
    title: 'Businesses',
    label: 'For your brand',
    description:
      'Give customers and connections a branded digital experience with your own colors, logo, and QR identity.',
    features: [
      'Branded QR experience',
      'Custom colors and logo',
      'Business profile',
    ],
  },
  {
    icon: Palette,
    title: 'Agencies',
    label: 'For multiple identities',
    description:
      'Manage different QR profiles for different people, roles, campaigns, or client-facing identities.',
    features: [
      'Multiple profiles',
      'Different branded identities',
      'Flexible QR management',
    ],
  },
]

const workflow = [
  {
    number: '01',
    title: 'Create',
    description:
      'Build your TapQR profile with the information and links you want people to access.',
  },
  {
    number: '02',
    title: 'Customize',
    description:
      'Pro users can add their own branding, colors, and logo to create a recognizable QR experience.',
  },
  {
    number: '03',
    title: 'Share',
    description:
      'Put your QR wherever people need to find you — from cards and posters to digital screens.',
  },
  {
    number: '04',
    title: 'Update',
    description:
      'Change your profile from TapQR while keeping the same dynamic QR code.',
  },
]

export default function SolutionsPage() {
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
              className="text-[#2F6BFF]"
            >
              Solutions
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
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[140px]" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/20 bg-[#2F6BFF]/5 px-4 py-2 text-sm font-medium text-[#1748C7]">
            <Sparkles size={15} />
            Built around the way you connect
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            One QR for
            <span className="block text-[#2F6BFF]">
              every kind of connection.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/55 sm:text-xl">
            Whether you're building your personal presence, growing a brand,
            networking professionally, or managing a team, TapQR gives you
            one dynamic place to connect everything.
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

      {/* Solution cards */}
      <section className="border-y border-black/5 bg-white px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Solutions
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Designed for the way you connect.
            </h2>

            <p className="mt-5 text-lg leading-8 text-black/50">
              TapQR adapts to different people, roles, and organizations
              without making sharing complicated.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution, index) => {
              const Icon = solution.icon

              return (
                <motion.article
                  key={solution.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.07,
                  }}
                  className="group rounded-[28px] border border-black/8 bg-paper p-7 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(11,13,12,0.06)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <Icon size={21} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-black/20 transition-transform group-hover:translate-x-1 group-hover:text-[#2F6BFF]"
                    />
                  </div>

                  <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6BFF]">
                    {solution.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    {solution.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black/50">
                    {solution.description}
                  </p>

                  <div className="my-6 h-px bg-black/6" />

                  <ul className="space-y-3">
                    {solution.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-black/65"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
                          <Check size={12} strokeWidth={3} />
                        </span>

                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Business showcase */}
      <section className="px-6 py-24 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto grid max-w-6xl overflow-hidden rounded-[36px] bg-[#0B0D0C] text-white lg:grid-cols-[1fr_0.9fr]"
        >
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]">
              <Palette size={22} />
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#6F98FF]">
              For businesses & brands
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Your QR should look like
              <span className="block text-[#2F6BFF]">
                your brand.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/55">
              With TapQR Pro, your QR experience can use your own brand
              colors and logo, giving every scan a more recognizable
              experience.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {[
                'Custom QR colors',
                'Your own logo',
                'Multiple profiles',
                'Profile analytics',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/75"
                >
                  <Check
                    size={16}
                    className="text-[#5E8BFF]"
                    strokeWidth={2.5}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden bg-[#101A32] p-10">
            <div className="absolute h-80 w-80 rounded-full bg-[#2F6BFF]/20 blur-[100px]" />

            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 1, 0],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full max-w-[340px] rounded-[30px] bg-white p-5 text-black shadow-[0_35px_90px_rgba(0,0,0,0.4)]"
            >
              <div className="rounded-[22px] bg-[#2F6BFF] p-6">
                <div className="mx-auto flex aspect-square max-w-[185px] items-center justify-center rounded-2xl bg-white p-5">
                  <div className="grid aspect-square w-full grid-cols-9 gap-1">
                    {Array.from({ length: 81 }).map((_, index) => {
                      const row = Math.floor(index / 9)
                      const col = index % 9

                      const topLeft =
                        row < 3 && col < 3
                      const topRight =
                        row < 3 && col > 5
                      const bottomLeft =
                        row > 5 && col < 3

                      const finder =
                        topLeft || topRight || bottomLeft

                      const innerFinder =
                        (row === 1 && col === 1) ||
                        (row === 1 && col === 7) ||
                        (row === 7 && col === 1)

                      return (
                        <span
                          key={index}
                          className={`rounded-[1px] ${
                            finder
                              ? innerFinder
                                ? 'bg-white'
                                : 'bg-[#0B0D0C]'
                              : (row + col) % 3 === 0
                                ? 'bg-[#0B0D0C]'
                                : 'bg-black/10'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold">
                  Your Brand
                </p>

                <p className="mt-1 text-xs text-black/45">
                  Branded digital identity
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2F6BFF]" />
                  <span className="h-2.5 w-10 rounded-full bg-black/10" />
                  <span className="h-2.5 w-6 rounded-full bg-black/10" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Workflow */}
      <section className="border-y border-black/5 bg-[#F0F4FA] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
                One simple workflow
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Create it once.
                <span className="block text-[#2F6BFF]">
                  Keep it useful.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-lg leading-8 text-black/50">
                TapQR is designed around a simple idea: your QR should keep
                working even when your information changes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {workflow.map((item, index) => (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="rounded-[26px] border border-black/8 bg-white p-6"
                >
                  <span className="text-xs font-bold tracking-[0.15em] text-[#2F6BFF]">
                    {item.number}
                  </span>

                  <h3 className="mt-5 text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
              <BarChart3 size={22} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              Understand your reach
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your QR can tell you more than you think.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-black/50">
              TapQR analytics help you understand activity around your
              digital profile so you can make better decisions about how and
              where you share it.
            </p>

            <Link
              href="/features"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF]"
            >
              Explore all features
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-[32px] border border-black/8 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-black/40">
                  QR activity
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  2,847
                </p>
              </div>

              <div className="rounded-full bg-[#2F6BFF]/10 px-3 py-1.5 text-xs font-semibold text-[#2F6BFF]">
                +18%
              </div>
            </div>

            <div className="mt-10 flex h-48 items-end gap-2">
              {[32, 45, 39, 58, 51, 74, 68, 86, 78, 94, 82, 100].map(
                (height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
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
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-10 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#0B0D0C] px-7 py-16 text-center text-white sm:px-12 lg:py-20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]">
            <QrCode size={23} />
          </div>

          <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Whatever you do, make every connection count.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">
            Start with one dynamic QR profile and build your digital identity
            around the way you connect.
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