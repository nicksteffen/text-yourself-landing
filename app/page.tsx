'use client'

import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, CloudOff, Hash, Lock, Menu, MessageCircle, Play, Send, Sparkles, Tag, X, Zap } from 'lucide-react'

function PhoneMockup() {
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  return (
    <div className="phone-wrap" aria-label="Text Yourself app preview">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-top"><span>9:41</span><span>● ● ▰</span></div>
        <div className="phone-head"><div><p className="eyebrow">TEXT YOURSELF</p><h3>Future me</h3></div><div className="avatar">TY</div></div>
        <div className="chat-date">Today</div>
        <div className="bubble bubble-blue">A place for the thoughts worth keeping.<span>9:40 AM</span></div>
        <div className="bubble bubble-cream">Your next big idea just arrived.<span>9:41 AM</span></div>
        {sent && <div className="bubble bubble-blue">{message || 'A thought worth keeping.'}<span>now</span></div>}
        <div className="note-card"><div className="note-icon"><Sparkles size={15} /></div><div><strong>Reminder set</strong><p>Next Tuesday · 9:00 AM</p></div></div>
        <div className="phone-space" />
        <div className="compose"><span>Message future me...</span><button onClick={() => setSent(!sent)} aria-label="Send message"><Send size={15} /></button></div>
        {sent && <div className="sent-toast"><Check size={14} /> Saved for future you</div>}
        <div className="home-bar" />
      </div>
    </div>
  )
}

function StoreButton({ store, icon }: { store: string; icon: React.ReactNode }) {
  return <a href="#download" className="store-button"><span>{icon}</span><small>Download on the</small><strong>{store}</strong></a>
}

function ThreadDemo() {
  return <div className="workflow-card thread-card screenshot-card"><div className="card-label"><MessageCircle size={15} /> Threads</div><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5GEtOlJM4Mhc3dajw0q9OHi8knxd1A.png" alt="Text Yourself chat view showing saved notes" /><span className="card-note">A quiet place for quick thoughts</span></div>
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <main>
      <header className="site-header"><a href="#top" className="brand"><span className="brand-mark"><img src="/favicon.png" alt="" /></span><span>text yourself</span></a><nav className={menuOpen ? 'nav open' : 'nav'}><a href="#how">How it works</a><a href="#features">Features</a><a href="/privacy">Privacy</a><a href="/download" className="nav-cta">Download APK <ArrowRight size={15} /></a></nav><button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button></header>

      <section id="top" className="hero"><div className="hero-copy"><p className="kicker"><span className="pulse" /> Your thoughts, on your timeline</p><h1>Message your<br /><em>future self.</em></h1><p className="hero-text">Text Yourself is a quiet place for your ideas, reminders, and everything you don&apos;t want to lose in the noise.</p><div className="store-row"><StoreButton store="App Store" icon={<AppleMark />} /><StoreButton store="Google Play" icon={<Play size={17} fill="currentColor" />} /></div><p className="microcopy"><Lock size={12} /> Private by default. No feeds. No followers. Just you.</p></div><PhoneMockup /></section>

      <section className="marquee" aria-hidden="true"><span>CAPTURE THE MOMENT</span><span>MAKE SPACE TO THINK</span><span>KEEP WHAT MATTERS</span><span>CAPTURE THE MOMENT</span></section>

      <section id="how" className="workflow section"><div className="section-intro"><p className="kicker">A better inbox</p><h2>From passing thought<br />to <em>kept note.</em></h2><p>Some thoughts need a little room before they become something. Text Yourself gives them that room.</p></div><div className="workflow-grid"><ThreadDemo /><div className="workflow-arrow"><ArrowRight /></div><div className="workflow-card note-preview screenshot-card"><div className="card-label"><Tag size={15} /> Notes</div><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-u9wAfPsNIGG5Pkz303uwnhtmqY2kHX.png" alt="Text Yourself notes view showing a checklist and reminders" /><span className="card-note">A thought worth returning to</span></div></div></section>

      <section className="steps section"><div className="steps-head"><p className="kicker">How it works</p><h2>Simple by design.</h2></div><div className="step-grid"><div className="step"><span className="step-num">01</span><Zap /><h3>Catch it</h3><p>Send a message whenever an idea, task, or tiny thought shows up.</p></div><div className="step"><span className="step-num">02</span><Sparkles /><h3>Shape it</h3><p>Turn the passing thought into a note you&apos;ll actually find again.</p></div><div className="step"><span className="step-num">03</span><CloudOff /><h3>Come back</h3><p>Set a reminder for the version of you who needs it most.</p></div></div></section>

      <section id="features" className="features section"><div className="section-intro"><p className="kicker">Made for your mind</p><h2>Less managing.<br /><em>More remembering.</em></h2></div><div className="feature-grid"><article><div className="feature-icon blue"><MessageCircle /></div><h3>Chat first</h3><p>It feels like texting. Because it is. No new system to learn.</p></article><article><div className="feature-icon yellow"><Sparkles /></div><h3>Timely reminders</h3><p>Send a thought to tomorrow, next week, or whenever it matters.</p></article><article><div className="feature-icon green"><Hash /></div><h3>Tags that stick</h3><p>Organize naturally with markdown, tags, and a search that gets you.</p></article><article><div className="feature-icon coral"><CloudOff /></div><h3>Works offline</h3><p>Your notes are there when the signal isn&apos;t. Sync happens quietly later.</p></article></div></section>

      <section id="privacy" className="privacy"><div className="privacy-mark"><Lock size={28} /></div><div><p className="kicker">Your space, your rules</p><h2>Private thoughts<br /><em>stay private.</em></h2><p>We don&apos;t sell your data. We don&apos;t build a profile of you. Text Yourself is a tool, not a social network.</p><a href="#download" className="text-link">Read our privacy promise <ArrowRight size={15} /></a></div><div className="privacy-checks"><p><Check size={16} /> End-to-end encrypted</p><p><Check size={16} /> No ads, ever</p><p><Check size={16} /> Export anytime</p></div></section>

      <section id="download" className="download section"><div><p className="kicker">Start with one thought</p><h2>Make space for<br /><em>what matters.</em></h2><p>Your future self will thank you.</p></div><div className="store-row"><StoreButton store="App Store" icon={<AppleMark />} /><StoreButton store="Google Play" icon={<Play size={17} fill="currentColor" />} /></div></section>
      <footer><a href="#top" className="brand"><span className="brand-mark"><img src="/favicon.png" alt="" /></span><span>text yourself</span></a><p>© 2026 Text Yourself. A little more space in your day.</p><div><a href="/privacy">Privacy</a><a href="#top">Back to top ↑</a></div></footer>
    </main>
  )
}
function AppleMark() { return <span className="apple-mark">●</span> }
