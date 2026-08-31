'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { getStoredUser, isAuthenticated } from '@/lib/auth'

import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  Globe2,
  GraduationCap,
  Hospital,
  Link2,
  Mail,
  MapPin,
  Menu,
  Palette,
  Phone,
  QrCode,
  ScanLine,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  WalletCards,
  X,
} from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)

  const visible = useInView(ref, {
    once: true,
    margin: '-80px',
  })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  )
}

function QR({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`qr ${small ? 'qr-small' : ''}`}
      aria-label="TapQR code preview"
    >
      <span className="qr-scan" />
    </div>
  )
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-semibold tracking-tight ${
        light ? 'text-white' : 'text-ink'
      }`}
      aria-label="TapQR home"
    >
      <Image
        src="/tapqr-icon.webp"
        alt="TapQR"
        width={36}
        height={36}
        className="rounded-lg object-contain"
      />
      <span>TapQR</span>
    </Link>
  )
}

/*
 * The Android application is not being advertised as live yet.
 * Keep this badge as a visual "coming soon" element instead of
 * sending visitors to a non-existent Play Store listing.
 */
function PlayStoreBadge() {
  return (
    <span
      className="play-store"
      aria-label="TapQR mobile app coming soon"
    >
      <span className="play-store-icon">
        <QrCode size={16} />
      </span>

      <span>
        <small>COMING SOON</small>
        <b>Mobile App</b>
      </span>
    </span>
  )
}

function PhoneMockup() {
  return (
    <div className="phone-wrap">
      <motion.div
        className="phone"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="phone-top">
          <span>9:41</span>
          <span className="phone-island" />
          <span>● ◒</span>
        </div>

        <div className="profile-cover">
          <div className="avatar">TQ</div>
        </div>

        <div className="phone-content">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-ink">
                TapQR Experience
              </h3>
              <p className="text-xs text-muted">
                Business, organization &amp; professional
              </p>
            </div>

            <button
              className="share-circle"
              aria-label="Share TapQR experience"
              type="button"
            >
              <Share2 size={14} />
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-muted">
            One scan gives people the information, links, services,
            products and contact options they need.
          </p>

          <div className="phone-links">
            <div>
              <Globe2 size={14} />
              Website
            </div>

            <div>
              <Mail size={14} />
              Email
            </div>

            <div>
              <Phone size={14} />
              Call
            </div>
          </div>

          <div className="social-row">
            <span>
              <Link2 size={14} />
            </span>
            <span>
              <Share2 size={14} />
            </span>
            <span>
              <MapPin size={14} />
            </span>
            <span className="ml-auto text-[10px] text-muted">
              TapQR digital experience
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="metric metric-one"
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      >
        <span className="metric-icon">
          <ScanLine size={14} />
        </span>
        <div>
          <b>Dynamic</b>
          <small>QR experience</small>
        </div>
      </motion.div>

      <motion.div
        className="metric metric-two"
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <span className="metric-icon peach">
          <Users size={14} />
        </span>
        <div>
          <b>One scan</b>
          <small>Many actions</small>
        </div>
      </motion.div>

      <motion.div
        className="qr-float"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <QR small />
        <span>Scan to explore</span>
      </motion.div>
    </div>
  )
}

const features = [
  [
    QrCode,
    'Smart QR Codes',
    'Create dynamic QR experiences that can be updated without replacing the printed code.',
  ],
  [
    WalletCards,
    'Digital Experiences',
    'Present your business, organization, services, products, links and contact details in one place.',
  ],
  [
    Share2,
    'Easy Sharing',
    'Give visitors simple actions such as website, call, email, WhatsApp, directions and social links.',
  ],
  [
    Globe2,
    'Products & Services',
    'Show products, services, catalogs, information and other content without turning TapQR into an ordering app.',
  ],
  [
    BarChart3,
    'Scan Analytics',
    'Understand QR activity and use scan data to improve how people discover your information.',
  ],
  [
    Palette,
    'Custom Branding',
    'Build a QR experience that feels like your organization instead of a generic QR landing page.',
  ],
] as const

const solutions = [
  ['Businesses', Building2],
  ['Hospitals & Clinics', Hospital],
  ['Schools & Colleges', GraduationCap],
  ['Retail & Stores', ShoppingBag],
  ['Restaurants & Hotels', Building2],
  ['Professionals', Users],
  ['Events & Conferences', CalendarDays],
  ['Organizations & NGOs', Users],
] as const

// What each type of business/organization typically puts behind
// their TapQR experience. Used to drive the interactive use-case
// tabs below — kept to real product capabilities, not invented stats.
const useCaseDetails: Record<string, string[]> = {
  'Businesses': [
    'Business profile & branding',
    'Contact & location details',
    'Product or service links',
  ],
  'Hospitals & Clinics': [
    'Department & doctor information',
    'Appointment & contact details',
    'Location & directions',
  ],
  'Schools & Colleges': [
    'Institution information',
    'Admissions & contact details',
    'Important links & updates',
  ],
  'Retail & Stores': [
    'Product information',
    'Store location & hours',
    'Customer contact options',
  ],
  'Restaurants & Hotels': [
    'Digital menu or services',
    'Business information',
    'Offers & updates',
  ],
  'Professionals': [
    'Digital profile',
    'Contact details',
    'Social & portfolio links',
  ],
  'Events & Conferences': [
    'Event information & schedule',
    'Location & directions',
    'Registration or contact links',
  ],
  'Organizations & NGOs': [
    'Mission & information',
    'Location & contact details',
    'Ways to connect or reach out',
  ],
}

const contentTypes = [
  ['Profile & contact', 'Name, role, phone, email and the information people need to reach you.', WalletCards],
  ['Social & web links', 'Bring Instagram, LinkedIn, website and other important links together.', Globe2],
  ['Products & services', 'Present what you offer in a simple digital destination.', ShoppingBag],
  ['Location & directions', 'Help visitors find your business, office, store or event location.', MapPin],
  ['Calls & messages', 'Give people direct actions instead of making them search for your contact details.', Phone],
  ['Business information', 'Share useful information, updates and other content from one place.', Sparkles],
] as const

const faqs = [
  ['What is TapQR?', 'TapQR is a smart QR platform that gives your QR code a useful digital destination. Instead of sending people to scattered links, you can bring your profile, contact details, social links, website, products, services and other information together in one experience.'],
  ['How is TapQR different from a normal QR code?', 'A normal QR code can simply point to a URL. TapQR is the digital experience behind the scan: people can see useful information and take actions such as calling, emailing, visiting your website, opening social links or finding your location.'],
  ['Can I update my information after sharing my QR?', 'TapQR is designed around a managed digital experience, so your destination can be updated from your workspace without needing to change every place where the QR has been shared.'],
  ['Where can I use TapQR?', 'You can use TapQR on business cards, posters, packaging, storefronts, event materials, websites, social media and other physical or digital touchpoints where people need quick access to information.'],
  ['Who is TapQR for?', 'TapQR can be used by businesses, professionals, creators, retailers, healthcare organizations, educational institutions, events and other organizations that need a simple way to share digital information.'],
  ['Do people need the TapQR app to scan it?', 'No. The QR experience is designed to be accessed through a normal QR scan and a web browser. A dedicated mobile app is not required for someone to view the experience.'],
] as const

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dash-sidebar">
        <Logo />

        <div className="dash-nav">
          <span className="active">
            <BarChart3 size={15} />
            Overview
          </span>

          <span>
            <QrCode size={15} />
            QR Experiences
          </span>

          <span>
            <WalletCards size={15} />
            Content
          </span>

          <span>
            <Palette size={15} />
            Customize
          </span>
        </div>

        <div className="dash-user">
          <div className="mini-avatar">TQ</div>
          <span>TapQR workspace</span>
          <ChevronRight size={14} />
        </div>
      </div>

      <div className="dash-main">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Workspace / Overview</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">
              Your TapQR workspace
            </h3>
          </div>

          <button className="dash-share" type="button">
            <Share2 size={14} />
            Share QR
          </button>
        </div>

        <div className="dash-stats">
          <div>
            <small>QR scans</small>
            <b>Live</b>
            <span className="positive">Track activity</span>
          </div>

          <div>
            <small>Digital actions</small>
            <b>Multiple</b>
            <span className="positive">Links, calls &amp; enquiries</span>
          </div>

          <div>
            <small>Experience</small>
            <b>Dynamic</b>
            <span className="positive">Update when needed</span>
          </div>
        </div>

        <div className="dash-grid">
          <div className="chart-card">
            <div className="flex justify-between">
              <div>
                <p className="eyebrow">Analytics</p>
                <b className="text-lg text-ink">Scan activity</b>
              </div>

              <span className="select-pill">
                Activity
                <ChevronRight size={12} />
              </span>
            </div>

            <div className="chart">
              <div className="chart-line" />
              <div className="chart-fill" />

              <div className="chart-labels">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <p className="eyebrow">QR preview</p>

            <div className="profile-preview">
              <div className="mini-avatar large">TQ</div>

              <b>TapQR Experience</b>
              <span>Business / Organization</span>

              <QR small />
            </div>

            <button className="outline-button" type="button">
              Preview experience
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Animates the analytics chart "drawing itself" once it scrolls
// into view, instead of always being static. No numbers are
// invented here — it's a motion treatment of the existing UI
// mock, not a claim about real data.
function AnimatedChart({ big = false }: { big?: boolean }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} className={big ? 'big-chart' : 'chart'}>
      <motion.div
        className={big ? 'big-chart-line' : 'chart-line'}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={visible ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.1, ease }}
        style={{ transformOrigin: 'left' }}
      />

      <motion.div
        className={big ? 'big-chart-fill' : 'chart-fill'}
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.5, ease }}
      />

      {!big && (
        <div className="chart-labels">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>
      )}
    </div>
  )
}

export default function TapQRLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [activeUseCase, setActiveUseCase] = useState(0)
  const [authenticated, setAuthenticated] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const syncAuth = () => {
      const loggedIn = isAuthenticated()
      const user = getStoredUser()

      setAuthenticated(loggedIn)
      setUserName(user?.fullName || null)
      setAuthReady(true)
    }

    syncAuth()

    const handleStorage = () => syncAuth()
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const dashboardHref = authenticated ? '/dashboard' : '/login'
  const primaryAuthLabel = authenticated ? 'Open Dashboard' : 'Get started'
  const secondaryAuthLabel = authenticated
    ? userName
      ? `Hi, ${userName.split(' ')[0]}`
      : 'Dashboard'
    : 'Login'

  const navLinks = [
    ['Product', '#product'],
    ['Features', '#features'],
    ['Solutions', '#solutions'],
    ['Pricing', '#pricing'],
    ['FAQ', '#faq'],
    ['Resources', '/resources'],
    ['About', '/about'],
    ['Contact', '/contact'],
  ] as const

  const activeSolution = solutions[activeUseCase]
  const activeSolutionDetails = useCaseDetails[activeSolution[0]] ?? []

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-paper">
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <Logo />

        <div className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          <button
            className="mobile-close"
            onClick={closeMenu}
            aria-label="Close menu"
            type="button"
          >
            <X />
          </button>

          {navLinks.map(([label, href]) =>
            href.startsWith('#') ? (
              <a key={label} href={href} onClick={closeMenu}>
                {label}
              </a>
            ) : (
              <Link key={label} href={href} onClick={closeMenu}>
                {label}
              </Link>
            )
          )}
        </div>

        <div className="nav-actions">
          {!authReady ? (
            <span className="h-9 w-20 animate-pulse rounded-full bg-black/5" aria-hidden="true" />
          ) : (
            <>
              <Link href={dashboardHref} className="login">
                {secondaryAuthLabel}
              </Link>

              <Link href={dashboardHref} className="button button-dark">
                {primaryAuthLabel}
                <ArrowRight size={15} />
              </Link>
            </>
          )}

          <button
            className="menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <Menu />
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-glow" />

        <div className="container hero-grid">
          <div className="hero-copy">
            <Reveal>
              <div className="pill">
                <span className="pulse-dot" />
                One QR. A complete digital experience.
              </div>

              <h1>
  One Scan.
  <br />
  <em>Everything.</em>
</h1>

<p>
  Turn one smart QR into your complete digital presence.
  Share your profile, contact details, social links, website,
  services and more — all from one simple scan.
</p>

             <div className="hero-actions">
  <Link href={dashboardHref} className="button button-lime">
    {authenticated ? 'Open Dashboard' : 'Create your TapQR'}
    <ArrowRight size={16} />
  </Link>

  <a href="#demo" className="text-link">
    See TapQR in action
    <span>↘</span>
  </a>

  <PlayStoreBadge />
</div>

              <div className="hero-proof">
                <div className="proof-avatars">
                  <span>✓</span>
                  <span>QR</span>
                  <span>∞</span>
                </div>

                <span>
                  One workspace for your <b>digital QR presence</b>
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal className="hero-visual" delay={0.2}>
            <PhoneMockup />
          </Reveal>
        </div>
      </section>

      <section className="trust">
        <div className="container">
          <p className="eyebrow text-center">
            One platform. Many real-world uses.
          </p>

          <div className="trust-row">
            <span><Building2 size={17} /> Businesses</span>
            <span><Hospital size={17} /> Healthcare</span>
            <span><GraduationCap size={17} /> Education</span>
            <span><ShoppingBag size={17} /> Retail</span>
            <span><CalendarDays size={17} /> Events</span>
            <span><Users size={17} /> Organizations</span>
          </div>
        </div>
      </section>

<section id="demo" className="section">
  <div className="container">
    <Reveal>
      <div className="section-heading">
        <div>
          <p className="eyebrow">See it in action</p>

          <h2>
            One scan.
            <br />
            <em>Then everything connects.</em>
          </h2>
        </div>

        <p className="body-copy">
          Your QR is only the starting point. TapQR gives every scan
          a professional digital destination where people can discover,
          explore and connect.
        </p>
      </div>
    </Reveal>

    <Reveal delay={0.12}>
      <div className="mt-12 grid items-center gap-10 rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
        <div>
          <p className="eyebrow">The TapQR experience</p>

          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Replace scattered links with one digital destination.
          </h3>

          <p className="mt-5 max-w-xl text-base leading-7 text-black/55">
            Give customers, clients, visitors or connections one place
            to find the information that matters. From contact details
            and social profiles to websites, services and business
            information.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              ['Scan', 'Open your TapQR experience'],
              ['Explore', 'Find useful information instantly'],
              ['Connect', 'Call, message, visit or follow'],
              ['Update', 'Keep your experience current'],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-4"
              >
                <b className="block text-sm text-ink">{title}</b>
                <span className="mt-1 block text-xs leading-5 text-black/50">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <PhoneMockup />
        </div>
      </div>
    </Reveal>
  </div>
</section>


      <section className="section bg-[#F8FAFC]">
        <div className="container">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">What you can share</p>
                <h2>
                  Everything your
                  <br />
                  <em>customers need.</em>
                </h2>
              </div>
              <p className="body-copy">
                TapQR is not just a place for a QR code. Build a useful digital destination around the information and actions that matter to your audience.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map(([title, text, Icon], index) => (
              <Reveal key={title} delay={index * 0.05}>
                <div className="group h-full rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#2563EB]">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/55">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="rounded-[32px] bg-[#08111F] px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-14">
              <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div>
                  <p className="eyebrow text-[#93C5FD]">Why businesses use TapQR</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Stop making people
                    <br />
                    <em className="text-[#93C5FD]">search for you.</em>
                  </h2>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                    Your customers should not have to type your name, search through social profiles, find the right website and then look for your contact details. Give them one clear starting point.
                  </p>
                  <Link href={dashboardHref} className="button button-lime mt-7">
                    {authenticated ? 'Open Dashboard' : 'Create your TapQR'}
                    <ArrowRight size={15} />
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['One destination', 'Bring important information together.'],
                    ['Easy to update', 'Keep your digital experience current.'],
                    ['Easy to share', 'Use the same QR across physical and digital touchpoints.'],
                    ['Built for action', 'Help people call, visit, follow, message or learn more.'],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <b className="text-sm">{title}</b>
                      <p className="mt-2 text-xs leading-5 text-white/50">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="product" className="section intro">
        <div className="container intro-grid">
          <Reveal>
            <p className="eyebrow">The digital layer behind your QR</p>

            <h2>
              More than a QR.
              <br />
              <em>A useful destination.</em>
            </h2>

            <p className="body-copy">
              A QR code is only the doorway. TapQR gives that scan a
              useful destination where people can understand who you
              are, what you offer, where to find you and how to contact
              you.
            </p>

            <Link className="text-link dark-link" href="#features">
              Explore the platform
              <ArrowRight size={15} />
            </Link>
          </Reveal>

          <Reveal className="flow" delay={0.15}>
            <div className="flow-line" />

            <div className="flow-item">
              <div className="flow-icon">
                <QrCode />
              </div>
              <b>Scan</b>
              <span>One quick scan</span>
            </div>

            <div className="flow-arrow">→</div>

            <div className="flow-item featured">
              <div className="flow-icon">
                <Sparkles />
              </div>
              <b>Experience</b>
              <span>Useful information</span>
            </div>

            <div className="flow-arrow">→</div>

            <div className="flow-item">
              <div className="flow-icon">
                <Users />
              </div>
              <b>Connect</b>
              <span>Take action</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="features" className="section features">
        <div className="container">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Everything in one place</p>

                <h2>
                  Built around the
                  <br />
                  <em>scan experience.</em>
                </h2>
              </div>

              <p className="body-copy">
                Create one digital destination instead of sending
                people across multiple links and disconnected pages.
              </p>
            </div>
          </Reveal>

          <div className="feature-grid">
            {features.map(([Icon, title, text], index) => (
              <Reveal key={title} delay={index * 0.05}>
                <button
                  className={`feature-card ${
                    activeFeature === index ? 'selected' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                  onFocus={() => setActiveFeature(index)}
                  type="button"
                >
                  <span className="feature-icon">
                    <Icon size={20} />
                  </span>

                  <span className="feature-title">{title}</span>

                  <span className="feature-text">{text}</span>

                  <span className="feature-arrow">
                    <ArrowRight size={15} />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10 text-center">
              <Link href="/features" className="text-link dark-link">
                Explore all features
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section showcase">
        <div className="container">
          <Reveal>
            <div className="showcase-head">
              <div>
                <p className="eyebrow">Your TapQR workspace</p>

                <h2>
                  Manage your QR.
                  <br />
                  <em>Manage your presence.</em>
                </h2>
              </div>

              <p className="body-copy">
                Update your digital experience from one workspace while
                the QR you have already shared continues to point to it.
              </p>
            </div>

            <Dashboard />
          </Reveal>
        </div>
      </section>

      <section className="section analytics">
        <div className="container analytics-grid">
          <Reveal>
            <p className="eyebrow">Understand your reach</p>

            <h2>
              See what happens
              <br />
              <em>after the scan.</em>
            </h2>

            <p className="body-copy">
              TapQR is designed to turn QR scans into useful signals:
              visits, actions and engagement with the information you
              choose to publish.
            </p>

            <div className="analytics-number">
              <b>Live</b>

              <span>
                QR activity
                <br />
                <strong>Built for measurable engagement</strong>
              </span>
            </div>
          </Reveal>

          <Reveal className="analytics-card" delay={0.15}>
            <div className="flex justify-between">
              <div>
                <p className="eyebrow">Scan activity</p>
                <b className="text-lg text-ink">Your QR analytics</b>
              </div>

              <span className="select-pill">
                Overview
                <ChevronRight size={12} />
              </span>
            </div>

            <AnimatedChart big />

            <div className="chart-legend">
              <span><i /> Scans</span>
              <span><i className="legend-peach" /> Actions</span>
            </div>

            <div className="device-row">
              <span>Mobile <b>QR-first</b></span>
              <span>Desktop <b>Supported</b></span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section steps">
        <div className="container">
          <Reveal>
            <div className="text-center">
              <p className="eyebrow">Simple by design</p>

              <h2>
                From QR to
                <br />
                <em>connection.</em>
              </h2>
            </div>
          </Reveal>

          <div className="steps-grid">
            {[
              ['01', 'Create', 'Create a TapQR experience for your use case.'],
              ['02', 'Add information', 'Add your profile, links, products, services or useful information.'],
              ['03', 'Share', 'Print or share the QR wherever people need access.'],
              ['04', 'Connect', 'Visitors scan, explore and choose how they want to connect.'],
            ].map(([num, title, text], index) => (
              <Reveal key={num} delay={index * 0.08}>
                <div className="step">
                  <span className="step-num">{num}</span>

                  <div className="step-icon">
                    {index === 0 ? (
                      <WalletCards />
                    ) : index === 1 ? (
                      <Palette />
                    ) : index === 2 ? (
                      <Share2 />
                    ) : (
                      <Users />
                    )}
                  </div>

                  <h3>{title}</h3>
                  <p>{text}</p>

                  {index < 3 && <span className="step-connector" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="section solutions">
        <div className="container">
          <Reveal>
            <p className="eyebrow">One platform, every context</p>

            <div className="section-heading">
              <h2>
                Made for real
                <br />
                <em>world use cases.</em>
              </h2>

              <p className="body-copy">
                TapQR isn't limited to restaurants or personal profiles.
                Select a category to see what businesses like yours
                typically put behind their TapQR.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="usecase-layout">
              <div className="usecase-tabs">
                {solutions.map(([name, Icon], index) => (
                  <button
                    key={name}
                    type="button"
                    className={`usecase-tab ${
                      activeUseCase === index ? 'active' : ''
                    }`}
                    onClick={() => setActiveUseCase(index)}
                    onMouseEnter={() => setActiveUseCase(index)}
                  >
                    <Icon size={16} />
                    {name}
                  </button>
                ))}
              </div>

              <div className="usecase-panel">
                <div className="usecase-panel-head">
                  <span className="usecase-panel-icon">
                    {(() => {
                      const ActiveIcon = activeSolution[1]
                      return <ActiveIcon size={20} />
                    })()}
                  </span>
                  <b>{activeSolution[0]}</b>
                </div>

                <div className="usecase-panel-list">
                  {activeSolutionDetails.map((detail) => (
                    <div key={detail}>
                      <span />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-10 text-center">
              <Link href="/solutions" className="text-link dark-link">
                Explore all solutions
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section team-showcase">
        <div className="container">
          <Reveal>
            <div className="team-panel">
              <div className="team-panel-copy">
                <p className="eyebrow">Built for teams</p>

                <h2>
                  Manage your business
                  <br />
                  <em>from one workspace.</em>
                </h2>

                <p>
                  Bring your team into TapQR. Give owners, managers
                  and staff the right level of access to manage QR
                  experiences and content together.
                </p>

                <div className="team-perms">
                  <div>
                    <ShieldCheck size={14} />
                    Owners control the full workspace and billing.
                  </div>

                  <div>
                    <ShieldCheck size={14} />
                    Managers can edit content and view analytics.
                  </div>

                  <div>
                    <ShieldCheck size={14} />
                    Staff get limited, scoped access where needed.
                  </div>
                </div>
              </div>

              <div className="team-roster">
                {[
                  ['Workspace Owner', 'Full access', 'owner'],
                  ['Content Manager', 'Edit & analytics', 'manager'],
                  ['Staff Member', 'Scoped access', 'staff'],
                ].map(([name, access, role]) => (
                  <div key={name} className="team-row">
                    <div className="mini-avatar">
                      {name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)}
                    </div>

                    <div className="team-row-name">
                      <b>{name}</b>
                      <span>{access}</span>
                    </div>

                    <span className={`team-role-badge ${role}`}>
                      {role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="section">
        <div className="container">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Simple pricing</p>

                <h2>
                  Start simple.
                  <br />
                  <em>Scale when you need.</em>
                </h2>
              </div>

              <p className="body-copy">
                Explore TapQR without committing to a complicated
                setup. Pricing can evolve as the product grows.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Reveal>
              <div className="h-full rounded-[20px] border border-[#E2E8F0] bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2563EB]">
                  Starter
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-ink">
                    Free
                  </span>
                </div>

                <p className="mt-4 min-h-[72px] text-sm leading-6 text-black/50">
                  Explore the core TapQR experience.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-black/60">
                  <li>✓ QR experience</li>
                  <li>✓ Digital information</li>
                  <li>✓ Contact links</li>
                  <li>✓ Basic experience controls</li>
                </ul>

                <Link
                  href={dashboardHref}
                  className="button button-dark mt-8 w-full justify-center"
                >
                  {authenticated ? 'Open Dashboard' : 'Get started'}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative h-full overflow-hidden rounded-[20px] bg-[#08111F] p-7 text-white shadow-lg">
                <div className="absolute right-5 top-5 rounded-full bg-[#2563EB] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Popular
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#93C5FD]">
                  Pro
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight">
                    Custom
                  </span>
                </div>

                <p className="mt-4 min-h-[72px] text-sm leading-6 text-white/50">
                  For teams and organizations that need more control.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-white/65">
                  <li>✓ Multiple QR experiences</li>
                  <li>✓ Custom branding</li>
                  <li>✓ Advanced controls</li>
                  <li>✓ Analytics</li>
                </ul>

                <Link
                  href={dashboardHref}
                  className="button button-lime mt-8 w-full justify-center"
                >
                  {authenticated ? 'Open Dashboard' : 'Get started'}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="h-full rounded-[20px] border border-[#E2E8F0] bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2563EB]">
                  Organization
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-ink">
                    Custom
                  </span>
                </div>

                <p className="mt-4 min-h-[72px] text-sm leading-6 text-black/50">
                  Designed for larger teams, institutions and specific
                  workflows.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-black/60">
                  <li>✓ Organization setup</li>
                  <li>✓ Multiple experiences</li>
                  <li>✓ Custom requirements</li>
                  <li>✓ Support</li>
                </ul>

                <Link
                  href={dashboardHref}
                  className="button button-dark mt-8 w-full justify-center"
                >
                  {authenticated ? 'Open Dashboard' : 'Get started'}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-10 text-center">
              <Link href="/pricing" className="text-link dark-link">
                See complete pricing
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="section bg-[#F8FAFC]">
        <div className="container">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Frequently asked questions</p>
                <h2>
                  Everything you need
                  <br />
                  <em>to know.</em>
                </h2>
              </div>
              <p className="body-copy">
                New to TapQR? Here are the answers to the questions people usually have before getting started.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-4xl space-y-3">
            {faqs.map(([question, answer], index) => (
              <Reveal key={question} delay={index * 0.04}>
                <details className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-semibold text-ink">
                    <span>{question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-black/50 transition-transform duration-300 group-open:rotate-90">
                      <ChevronRight size={15} />
                    </span>
                  </summary>
                  <p className="max-w-3xl pt-4 text-sm leading-7 text-black/55">{answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta" id="cta">
        <div className="cta-grid-lines" />

        <div className="container relative z-10 text-center">
          <Reveal>
            <span className="cta-mark">
              <QrCode size={22} />
            </span>

            <h2>
              Make every scan
              <br />
              <em>more useful.</em>
            </h2>

            <p>
              Tell us what you want to build with TapQR and we'll help
              you create the right digital experience.
            </p>

            <div className="cta-actions">
              <Link href={dashboardHref} className="button button-lime">
                {authenticated ? 'Open your Dashboard' : 'Create your TapQR'}
                <ArrowRight size={16} />
              </Link>

              <PlayStoreBadge />
            </div>

            <small>
              {authenticated
                ? 'Manage your QR experiences, content and analytics from your workspace.'
                : 'Create your digital QR experience and manage everything from one workspace.'}
            </small>
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <Logo light />

              <p>
                One QR. Everything people need to know.
              </p>
            </div>

            <div className="footer-links">
              <div>
                <b>Product</b>
                <a href="#product">Overview</a>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <Link href="/resources">Resources</Link>
              </div>

              <div>
                <b>Solutions</b>
                <Link href="/solutions">Businesses</Link>
                <Link href="/solutions">Healthcare</Link>
                <Link href="/solutions">Education</Link>
                <Link href="/solutions">Organizations</Link>
              </div>

              <div>
                <b>Company</b>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/resources">Resources</Link>
              </div>

              <div>
                <b>Legal</b>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 TapQR. All rights reserved.</span>

            <span>One scan. Everything.</span>

            <span className="socials">
              <Link href="/contact" aria-label="Contact TapQR">
                <Mail size={15} />
              </Link>

              <Link href="/resources" aria-label="TapQR resources">
                <Link2 size={15} />
              </Link>
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}