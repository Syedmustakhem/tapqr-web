'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BarChart3, ChevronRight, Download, Globe2, Link2, Mail, MapPin, Menu, Palette, Phone, QrCode, ScanLine, Share2, Sparkles, Users, WalletCards, X } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-80px' })
  return <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease }}>{children}</motion.div>
}

function QR({ small = false }: { small?: boolean }) {
  return <div className={`qr ${small ? 'qr-small' : ''}`} aria-label="TapQR code preview"><span className="qr-scan" /></div>
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#top"
      className={`flex items-center gap-2 font-semibold tracking-tight ${
        light ? 'text-white' : 'text-ink'
      }`}
    >
      <Image
        src="/tapqr-icon.webp"
        alt="TapQR"
        width={36}
        height={36}
        className="rounded-lg object-contain"
      />

      <span>TapQR</span>
    </a>
  )
}

function PlayStoreBadge() {
  return <a href="#download" className="play-store" aria-label="Download TapQR from Google Play">
    <span className="play-store-icon"><Download size={16} /></span>
    <span><small>GET IT ON</small><b>Google Play</b></span>
  </a>
}

function PhoneMockup() {
  return <div className="phone-wrap">
    <motion.div className="phone" animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="phone-top"><span>9:41</span><span className="phone-island" /><span>● ◒</span></div>
      <div className="profile-cover"><div className="avatar">AL</div></div>
      <div className="phone-content">
        <div className="flex items-start justify-between"><div><h3 className="text-xl font-semibold text-ink">Alex Morgan</h3><p className="text-xs text-muted">Product designer &amp; builder</p></div><button className="share-circle" aria-label="Share profile"><Share2 size={14} /></button></div>
        <p className="mt-4 text-xs leading-5 text-muted">Designing useful things for the internet. Say hello, I&apos;d love to connect.</p>
        <div className="phone-links"><div><Globe2 size={14} /> alexmorgan.design</div><div><Mail size={14} /> alex@amorgan.co</div><div><Phone size={14} /> +1 415 555 0198</div></div>
        <div className="social-row"><span><Link2 size={14} /></span><span><Link2 size={14} /></span><span><MapPin size={14} /></span><span className="ml-auto text-[10px] text-muted">San Francisco, CA</span></div>
      </div>
    </motion.div>
    <motion.div className="metric metric-one" animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}><span className="metric-icon"><ScanLine size={14} /></span><div><b>2,847</b><small>Total scans</small></div><span className="trend">+18%</span></motion.div>
    <motion.div className="metric metric-two" animate={{ y: [0, 9, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}><span className="metric-icon peach"><Users size={14} /></span><div><b>486</b><small>New connections</small></div></motion.div>
    <motion.div className="qr-float"><QR small /><span>Scan to connect</span></motion.div>
  </div>
}

const features = [
  [QrCode, 'Smart QR Codes', 'One code that always stays current, wherever you share it.'],
  [WalletCards, 'Digital Profile', 'A polished home for your links, contact details, and story.'],
  [Share2, 'One-Tap Sharing', 'Make your identity instantly accessible across every moment.'],
  [Globe2, 'Social & Contact Links', 'Bring every important way to reach you into one place.'],
  [BarChart3, 'Actionable Analytics', 'See what gets scanned, clicked, and connected in real time.'],
  [Palette, 'Custom Branding', 'Make the experience feel unmistakably yours, not generic.'],
] as const

function Dashboard() {
  return <div className="dashboard">
    <div className="dash-sidebar"><Logo /><div className="dash-nav"><span className="active"><BarChart3 size={15} /> Overview</span><span><QrCode size={15} /> My QR code</span><span><WalletCards size={15} /> Profile</span><span><Palette size={15} /> Customize</span></div><div className="dash-user"><div className="mini-avatar">AL</div><span>Alex Morgan</span><ChevronRight size={14} /></div></div>
    <div className="dash-main"><div className="flex items-center justify-between"><div><p className="eyebrow">Overview / May 2024</p><h3 className="mt-2 text-2xl font-semibold text-ink">Good morning, Alex</h3></div><button className="dash-share"><Share2 size={14} /> Share profile</button></div>
      <div className="dash-stats"><div><small>Total scans</small><b>12,482</b><span className="positive">↑ 24.8%</span></div><div><small>Profile views</small><b>8,924</b><span className="positive">↑ 18.2%</span></div><div><small>Link clicks</small><b>3,109</b><span className="positive">↑ 12.6%</span></div></div>
      <div className="dash-grid"><div className="chart-card"><div className="flex justify-between"><div><p className="eyebrow">Engagement</p><b className="text-lg text-ink">Scans over time</b></div><span className="select-pill">Last 30 days <ChevronRight size={12} /></span></div><div className="chart"><div className="chart-line" /><div className="chart-fill" /><div className="chart-labels"><span>May 01</span><span>May 15</span><span>May 30</span></div></div></div><div className="profile-card"><p className="eyebrow">Your profile</p><div className="profile-preview"><div className="mini-avatar large">AL</div><b>Alex Morgan</b><span>@alexmorgan</span><QR small /></div><button className="outline-button">View profile <ArrowRight size={13} /></button></div></div>
    </div>
  </div>
}

export default function TapQRLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const counter = useMotionValue(0)
  const spring = useSpring(counter, { stiffness: 80, damping: 20 })
  const [count, setCount] = useState(12482)
  useEffect(() => { counter.set(12482); return spring.on('change', v => setCount(Math.round(v))) }, [counter, spring])
  return <main id="top" className="min-h-screen overflow-hidden bg-paper">
    <nav className="nav"><Logo /><div className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}><a href="#product">Product</a><a href="#features">Features</a><a href="#solutions">Solutions</a><a href="#pricing">Pricing</a><a href="#resources">Resources</a><button className="mobile-close" onClick={() => setMenuOpen(false)}><X /></button></div><div className="nav-actions"><a href="#login" className="login">Log in</a><a href="#cta" className="button button-dark">Create Your TapQR <ArrowRight size={15} /></a><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button></div></nav>
    <section className="hero"><div className="hero-glow" /><div className="container hero-grid"><div className="hero-copy"><Reveal><div className="pill"><span className="pulse-dot" /> The smarter way to connect</div><h1>One QR.<br /><em>Your entire</em><br />digital identity.</h1><p>Create a powerful digital profile, share your links, connect with customers, and make every interaction effortless — all through one smart QR code.</p><div className="hero-actions"><a href="#cta" className="button button-lime">Create Your TapQR <ArrowRight size={16} /></a><a href="#product" className="text-link">See how it works <span>↗</span></a><PlayStoreBadge /></div><div className="hero-proof"><div className="proof-avatars"><span>JM</span><span>SK</span><span>TN</span><span>+</span></div><span>Trusted by <b>12,000+</b> people building better connections</span></div></Reveal></div><Reveal className="hero-visual" delay={0.2}><PhoneMockup /></Reveal></div></section>
    <section className="trust"><div className="container"><p className="eyebrow text-center">Built for the way you connect today</p><div className="trust-row"><span><BriefcaseIcon /> Businesses</span><span><Sparkles /> Creators</span><span><Users /> Professionals</span><span><CoffeeIcon /> Restaurants</span><span><CalendarIcon /> Events</span><span><Users /> Teams</span></div></div></section>
    <section id="product" className="section intro"><div className="container intro-grid"><Reveal><p className="eyebrow">The new digital handshake</p><h2>Your QR is<br /><em>more than a code.</em></h2><p className="body-copy">TapQR turns a simple scan into a complete digital experience. Everything you are, everything you do, and every way to connect — thoughtfully organized in one beautiful profile.</p><a className="text-link dark-link" href="#features">Explore the platform <ArrowRight size={15} /></a></Reveal><Reveal className="flow" delay={0.15}><div className="flow-line" /><div className="flow-item"><div className="flow-icon"><QrCode /></div><b>Scan</b><span>One quick scan</span></div><div className="flow-arrow">→</div><div className="flow-item featured"><div className="flow-icon"><Sparkles /></div><b>TapQR Profile</b><span>Your world, organized</span></div><div className="flow-arrow">→</div><div className="flow-item"><div className="flow-icon"><Users /></div><b>Connect</b><span>A lasting impression</span></div></Reveal></div></section>
    <section id="features" className="section features"><div className="container"><Reveal><div className="section-heading"><div><p className="eyebrow">Everything in one place</p><h2>Everything you need.<br /><em>One smart QR.</em></h2></div><p className="body-copy">Built for humans, designed for the moments that matter. TapQR gives your digital identity a place to live.</p></div></Reveal><div className="feature-grid">{features.map(([Icon, title, text], i) => <Reveal key={title} delay={i * 0.05}><button className={`feature-card ${activeFeature === i ? 'selected' : ''}`} onMouseEnter={() => setActiveFeature(i)} onFocus={() => setActiveFeature(i)}><span className="feature-icon"><Icon size={20} /></span><span className="feature-title">{title}</span><span className="feature-text">{text}</span><span className="feature-arrow"><ArrowRight size={15} /></span></button></Reveal>)}</div></div></section>
    <section className="section showcase"><div className="container"><Reveal><div className="showcase-head"><div><p className="eyebrow">A command center for your identity</p><h2>One profile.<br /><em>Infinite possibilities.</em></h2></div><p className="body-copy">Make updates once and your QR stays current everywhere. Your profile evolves as fast as you do.</p></div><Dashboard /></Reveal></div></section>
    <section className="section analytics"><div className="container analytics-grid"><Reveal><p className="eyebrow">Visibility without the guesswork</p><h2>Know how people<br /><em>connect with you.</em></h2><p className="body-copy">Turn every scan into a signal. Understand what resonates, where people find you, and which links open the door to your next opportunity.</p><div className="analytics-number"><b>{count.toLocaleString()}</b><span>Total scans<br /><strong>↑ 24.8% this month</strong></span></div></Reveal><Reveal className="analytics-card" delay={0.15}><div className="flex justify-between"><div><p className="eyebrow">Scan activity</p><b className="text-lg text-ink">12,482 scans</b></div><span className="select-pill">Last 30 days <ChevronRight size={12} /></span></div><div className="big-chart"><div className="big-chart-line" /><div className="big-chart-fill" /></div><div className="chart-legend"><span><i /> Scans</span><span><i className="legend-peach" /> Profile views</span></div><div className="device-row"><span>Mobile <b>72%</b></span><span>Desktop <b>28%</b></span></div></Reveal></div></section>
    <section className="section steps"><div className="container"><Reveal><div className="text-center"><p className="eyebrow">Simple by design</p><h2>From scan to <em>connection.</em></h2></div></Reveal><div className="steps-grid">{[['01','Create','Build your TapQR profile.'],['02','Customize','Add your information, links, and branding.'],['03','Share','Put your QR anywhere people find you.'],['04','Connect','Turn a scan into a real connection.']].map(([num,title,text],i) => <Reveal key={num} delay={i * .08}><div className="step"><span className="step-num">{num}</span><div className="step-icon">{i === 0 ? <WalletCards /> : i === 1 ? <Palette /> : i === 2 ? <Share2 /> : <Users />}</div><h3>{title}</h3><p>{text}</p>{i < 3 && <span className="step-connector" />}</div></Reveal>)}</div></div></section>
    <section id="solutions" className="section solutions"><div className="container"><Reveal><p className="eyebrow">One platform, every context</p><div className="section-heading"><h2>Made for everyone<br /><em>you want to connect with.</em></h2><p className="body-copy">Your identity is personal. Your use case can be anything.</p></div></Reveal><div className="use-grid">{['Businesses','Entrepreneurs','Freelancers','Creators','Restaurants','Events','Sales teams','Professionals'].map((x,i) => <Reveal key={x} delay={i*.04}><div className={`use-card use-${i}`}><span>{x}</span><ArrowUpRightIcon /></div></Reveal>)}</div></div></section>
    <section className="section cta" id="cta"><div className="cta-grid-lines" /><div className="container relative z-10 text-center"><Reveal><span className="cta-mark"><QrCode size={22} /></span><h2>Your next connection<br /><em>starts with one scan.</em></h2><p>Create your TapQR profile and turn every scan into an opportunity to connect.</p><div className="cta-actions"><a href="#top" className="button button-lime">Create Your TapQR <ArrowRight size={16} /></a><PlayStoreBadge /></div><small>No complicated setup. Just one smart QR.</small></Reveal></div></section>
    <footer id="resources" className="footer"><div className="container"><div className="footer-top"><div><Logo light /><p>One QR. Your entire digital identity.</p></div><div className="footer-links"><div><b>Product</b><a>Features</a><a>Analytics</a><a>QR Codes</a><a>Digital Profiles</a><a>Pricing</a></div><div><b>Solutions</b><a>Businesses</a><a>Creators</a><a>Professionals</a><a>Events</a></div><div><b>Resources</b><a>Help Center</a><a>Documentation</a><a>Contact</a></div><div><b>Company</b><a>About</a><a>Privacy Policy</a><a>Terms of Service</a></div></div></div><div className="footer-bottom"><span>© 2024 TapQR. All rights reserved.</span><span>Made for better connections.</span><span className="socials"><Link2 size={15} /><Link2 size={15} /></span></div></div></footer>
  </main>
}

function BriefcaseIcon() { return <WalletCards size={18} /> }
function CoffeeIcon() { return <Sparkles size={18} /> }
function CalendarIcon() { return <WalletCards size={18} /> }
function ArrowUpRightIcon() { return <ArrowRight size={16} /> }
