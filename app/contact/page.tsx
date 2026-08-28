'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Mail,
  MessageCircle,
  QrCode,
  Send,
  Sparkles,
} from 'lucide-react'

const topics = [
  {
    icon: MessageCircle,
    title: 'General questions',
    description:
      'Have a question about TapQR, your account, or how the platform works?',
  },
  {
    icon: QrCode,
    title: 'QR & product help',
    description:
      'Need help with your QR, profile, branding, analytics, or another product feature?',
  },
  {
    icon: Mail,
    title: 'Business enquiries',
    description:
      'Interested in TapQR for your business, team, or organization?',
  },
]

export default function ContactPage() {
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

            <Link
              href="/about"
              className="transition-opacity hover:opacity-60"
            >
              About
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
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#2F6BFF]/10 blur-[140px]" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/20 bg-[#2F6BFF]/5 px-4 py-2 text-sm font-medium text-[#1748C7]">
            <Sparkles size={15} />
            We're here to help
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Let's talk about
            <span className="block text-[#2F6BFF]">
              TapQR.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/55 sm:text-xl">
            Have a question, need help, or want to explore TapQR for your
            business? Send us a message.
          </p>
        </motion.div>
      </section>

      {/* Contact area */}
      <section className="px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          {/* Contact information */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] bg-[#0B0D0C] p-8 text-white sm:p-10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]">
              <Mail size={22} />
            </div>

            <h2 className="mt-8 text-3xl font-semibold tracking-tight">
              Get in touch.
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/50">
              Whether you're getting started with TapQR or exploring how it
              can work for your business, we'd love to hear from you.
            </p>

           <div className="mt-10 space-y-4">
  <a
    href="mailto:support@tapqr.shop"
    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]"
  >
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F98FF]">
      Email
    </p>

    <p className="mt-2 text-sm text-white/75">
      support@tapqr.shop
    </p>
  </a>

  <a
    href="tel:+919441586322"
    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]"
  >
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F98FF]">
      Phone
    </p>

    <p className="mt-2 text-sm text-white/75">
      +91 94415 86322
    </p>
  </a>

  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F98FF]">
      Support
    </p>

    <p className="mt-2 text-sm leading-6 text-white/55">
      Have questions about your TapQR account or product? We're here to help.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F98FF]">
      Business
    </p>

    <p className="mt-2 text-sm leading-6 text-white/55">
      Looking to use TapQR across a team or organization? Get in touch with us.
    </p>
  </div>
</div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-black/8 bg-white p-7 sm:p-10"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2F6BFF]">
                Contact form
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Send us a message
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/45">
                Fill in the details below and tell us how we can help.
              </p>
            </div>

            <form className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-black/10 bg-paper px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  name="subject"
                  defaultValue=""
                  className="w-full appearance-none rounded-2xl border border-black/10 bg-paper px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                >
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option value="general">
                    General question
                  </option>
                  <option value="support">
                    Product support
                  </option>
                  <option value="business">
                    Business enquiry
                  </option>
                  <option value="billing">
                    Billing & pricing
                  </option>
                  <option value="other">
                    Something else
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-none rounded-2xl border border-black/10 bg-paper px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(47,107,255,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(47,107,255,0.24)]"
              >
                Send message
                <Send size={16} />
              </button>

              <p className="text-center text-xs text-black/35">
                We'll connect this form to the TapQR backend next.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Contact topics */}
      <section className="border-y border-black/5 bg-white px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
              How can we help?
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Start with what you need.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {topics.map((topic, index) => {
              const Icon = topic.icon

              return (
                <motion.div
                  key={topic.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="rounded-[28px] border border-black/8 bg-paper p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {topic.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black/50">
                    {topic.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ link */}
      <section className="px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl rounded-[34px] bg-[#F0F4FA] px-7 py-14 text-center sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F6BFF]">
            Before you contact us
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            You might find the answer in our resources.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/50">
            Learn how dynamic QR codes, profiles, analytics, branding, and
            other parts of TapQR work.
          </p>

          <Link
            href="/resources"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0B0D0C] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Explore resources
            <ArrowRight size={16} />
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
              href="/about"
              className="transition-colors hover:text-black"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="transition-colors hover:text-black"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}