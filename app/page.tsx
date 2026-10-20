'use client'

import { useState } from 'react'
import { ArrowRight, Braces, Check, Clock, CloudOff, Inbox, Lock, Menu, MessageCircle, Palette, PenLine, Send, Tag, X } from 'lucide-react'

const SHOTS = [
  { src: '/screenshots/01-sign-in.png', label: 'Sign in', note: 'Your space starts locked to you.' },
  { src: '/screenshots/02-threads.png', label: 'Threads', note: 'Every list, as a chat with yourself.' },
  { src: '/screenshots/03-thread-text.png', label: 'A thread', note: 'Bubbles, timestamps, scheduled sends.' },
  { src: '/screenshots/04-notes.png', label: 'Notes', note: 'The same lists, as markdown notes.' },
  { src: '/screenshots/05-list-editor.png', label: 'Editor', note: 'Checklists, tags, rich blocks or raw markdown.' },
  { src: '/screenshots/06-review.png', label: 'Review queue', note: 'Triage new thoughts: bullet, task, text, code or quote.' },
  { src: '/screenshots/07-list-settings.png', label: 'List settings', note: 'Default format, auto-accept, notifications.' },
  { src: '/screenshots/08-settings.png', label: 'Settings', note: 'Seven themes, light and dark, JSON export.' },
]

function Shot({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return <img className={className} src={src} alt={alt} width={1206} height={2622} decoding="async" loading={eager ? 'eager' : 'lazy'} />
}

function ShotStrip() {
  return (
    <div className="shot-strip">
      {SHOTS.map((shot) => (
        <figure className="shot" key={shot.src}>
          <Shot src={shot.src} alt={`Text Yourself — ${shot.label}`} />
          <figcaption><strong>{shot.label}</strong><span>{shot.note}</span></figcaption>
        </figure>
      ))}
    </div>
  )
}

const VIEWS = {
  threads: {
    label: 'Threads',
    title: 'Text it like a chat.',
    body: 'Every list opens as a thread: right-aligned bubbles, timestamps, and a composer at the bottom. It feels like texting, because it is — just to the one person who always replies: you.',
    points: ['Emoji avatars and swipe-to-archive', 'Schedule a message for next Tuesday', 'Search across every thread'],
    src: '/screenshots/02-threads.png',
    alt: 'Text Yourself threads screen with emoji avatars and a search bar',
  },
  notes: {
    label: 'Notes',
    title: 'Read it like a note.',
    body: 'Flip the same list over and it becomes a note — the thoughts you kept, in order, rendered as markdown. Nothing to move, nothing to copy: your thread already is the note.',
    points: ['Tag chips and a grid view', 'Checklists you can tap off', 'Sensitive lists hide their previews'],
    src: '/screenshots/04-notes.png',
    alt: 'Text Yourself notes screen with tag chips and list cards',
  },
}

function ViewSwitch() {
  const [side, setSide] = useState<keyof typeof VIEWS>('threads')
  const view = VIEWS[side]
  return (
    <div className="view-wrap">
      <div className="segment" role="tablist" aria-label="Threads and Notes views">
        {(Object.keys(VIEWS) as Array<keyof typeof VIEWS>).map((key) => (
          <button key={key} role="tab" aria-selected={side === key} onClick={() => setSide(key)}>{VIEWS[key].label}</button>
        ))}
      </div>
      <div className="view-grid">
        <div className="view-copy">
          <h3>{view.title}</h3>
          <p>{view.body}</p>
          <ul>
            {view.points.map((point) => <li key={point}><Check size={16} />{point}</li>)}
          </ul>
        </div>
        <div className="shot-frame" key={side}>
          <Shot src={view.src} alt={view.alt} eager />
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: <MessageCircle />, tone: 'blue', title: 'Chat-first capture', body: 'Send yourself a message the way you’d text anyone else. No new system to learn.' },
  { icon: <Clock />, tone: 'yellow', title: 'Schedule to yourself', body: 'Pick a date and the message arrives with a local notification, right when you need it.' },
  { icon: <Inbox />, tone: 'green', title: 'Review queue', body: 'New thoughts wait in a queue. Accept each as a bullet, task, text, code or quote — or accept all.' },
  { icon: <PenLine />, tone: 'coral', title: 'Rich editor', body: 'Checklists, bold, links, quotes and code blocks. Prefer raw markdown? That’s one tap away.' },
  { icon: <Tag />, tone: 'blue', title: 'Tags and search', body: 'Tag each list and filter with a tap. Search runs through your notes when you need them back.' },
  { icon: <CloudOff />, tone: 'green', title: 'Offline first', body: 'Everything lives on your device in a local database. Cloud sync is optional, and quiet.' },
  { icon: <Palette />, tone: 'yellow', title: 'Seven themes', body: 'Classic, pink, forest, cyber, sunset, lavender, monolith — in light, dark, or system.' },
  { icon: <Braces />, tone: 'coral', title: 'Export anytime', body: 'Your thoughts leave as JSON whenever you want them. No lock-in, ever.' },
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <main>
      <header className="site-header"><a href="#top" className="brand"><span className="brand-mark"><img src="/favicon.png" alt="" /></span><span>text yourself</span></a><nav className={menuOpen ? 'nav nav-collapse open' : 'nav nav-collapse'}><a href="#how">How it works</a><a href="#features">Features</a><a href="#screens">Screens</a><a href="/privacy">Privacy</a><a href="/download" className="nav-cta">Download beta <ArrowRight size={15} /></a></nav><button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button></header>

      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="kicker"><span className="pulse" /> A private place for your thoughts</p>
          <h1>Message yourself,<br /><em>remember forever.</em></h1>
          <p className="hero-text">Text Yourself is a chat with yourself that turns into notes. Catch a thought the way you’d text a friend — then find it again weeks later, as a note you can search, tag and export.</p>
          <div className="cta-row"><a href="/download" className="btn btn-primary">Download the Android beta <ArrowRight size={17} /></a><a href="#how" className="btn btn-link">See how it works</a></div>
          <p className="microcopy"><Lock size={12} /> Private beta · Passcode protected · Works offline</p>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <Shot className="hero-shot hero-shot-back" src="/screenshots/02-threads.png" alt="" eager />
          <Shot className="hero-shot hero-shot-front" src="/screenshots/03-thread-text.png" alt="" eager />
        </div>
      </section>

      <section className="marquee" aria-hidden="true"><span>TEXT YOUR FUTURE SELF</span><span>SCHEDULE IT FOR LATER</span><span>REVIEW IT, KEEP IT</span><span>TEXT YOUR FUTURE SELF</span></section>

      <section id="how" className="section">
        <div className="section-intro">
          <p className="kicker">Threads ⇄ Notes</p>
          <h2>One list,<br />two <em>views.</em></h2>
          <p>Some thoughts need the speed of a text and the shape of a note. Text Yourself gives you both at once — the same list, seen from either side.</p>
        </div>
        <ViewSwitch />
      </section>

      <section className="steps">
        <div className="steps-inner">
          <div className="steps-head"><p className="kicker">How it works</p><h2>Three steps.<br />One <em>habit.</em></h2></div>
          <div className="step-grid">
            <div className="step"><span className="step-num">01</span><Send /><h3>Catch it</h3><p>Send yourself a message the moment an idea, task or tiny thought shows up. Schedule it now, or for later.</p></div>
            <div className="step"><span className="step-num">02</span><Inbox /><h3>Review it</h3><p>New arrivals wait in a review queue. Accept each one as a bullet, task, text, code or quote — or accept all and move on.</p></div>
            <div className="step"><span className="step-num">03</span><Braces /><h3>Keep it</h3><p>Everything you keep lands in a note you can search, tag and export. On your phone, working offline.</p></div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-intro"><p className="kicker">Made for your mind</p><h2>Everything you need.<br /><em>Nothing you don’t.</em></h2></div>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title}><div className={`feature-icon ${feature.tone}`}>{feature.icon}</div><h3>{feature.title}</h3><p>{feature.body}</p></article>
          ))}
        </div>
      </section>

      <section id="screens" className="section shots">
        <div className="section-intro"><p className="kicker">Every screen</p><h2>Take a <em>look around.</em></h2><p>Every screen is built for one thing: giving your thoughts somewhere to land.</p></div>
        <ShotStrip />
      </section>

      <section id="privacy" className="privacy">
        <div className="privacy-mark"><Lock size={28} /></div>
        <div><p className="kicker">Your space, your rules</p><h2>Private thoughts<br /><em>stay private.</em></h2><p>Your notes live on your phone first. We don’t sell your data, we don’t show you ads, and we don’t build a profile of you. Sync is optional — it copies your own thoughts back to your own devices, nothing more.</p><a href="/privacy" className="text-link">Read our privacy promise <ArrowRight size={15} /></a></div>
        <div className="privacy-checks"><p><Check size={16} /> Stored on your device first</p><p><Check size={16} /> No ads, no trackers</p><p><Check size={16} /> Export or delete anytime</p></div>
      </section>

      <section id="download" className="download section">
        <div><p className="kicker">Start with one thought</p><h2>Make space for<br /><em>what matters.</em></h2><p className="download-note">Your future self will thank you.</p></div>
        <div className="download-cta"><a href="/download" className="btn btn-primary">Download the Android beta <ArrowRight size={17} /></a><p className="microcopy">Passcode protected · iOS build in progress</p></div>
      </section>

      <footer><a href="#top" className="brand"><span className="brand-mark"><img src="/favicon.png" alt="" /></span><span>text yourself</span></a><p>© 2026 Text Yourself. A little more space in your day.</p><div><a href="/download">Download</a><a href="/privacy">Privacy</a><a href="#top">Back to top ↑</a></div></footer>
    </main>
  )
}
