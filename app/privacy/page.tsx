import { ArrowRight, Lock } from 'lucide-react'

function Section({ children, id, title }: { children: React.ReactNode; id?: string; title: string }) {
  return (
    <section id={id} className="policy-block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export default function PrivacyPage() {
  const updated = 'August 28, 2026'
  return (
    <main className="privacy-page">
      <header className="site-header">
        <a href="/" className="brand"><span className="brand-mark"><img src="/favicon.png" alt="" /></span><span>text yourself</span></a>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/download" className="nav-cta">Download APK <ArrowRight size={15} /></a>
        </nav>
      </header>

      <section className="privacy-title">
        <p className="kicker">PRIVACY POLICY</p>
        <h1>Private by design<span>.</span></h1>
        <p className="privacy-intro">Text Yourself is built to be a quiet, private space for your thoughts. This page explains, in plain language, what data we handle, how we protect it, and what you can do about it. Last updated: {updated}.</p>
        <a href="mailto:hello@txtyourself.app" className="text-link privacy-contact"><Lock size={14} /> Questions? hello@txtyourself.app</a>
      </section>

      <section className="policy-wrap">
        <Section title="The short version">
          <p>Your notes belong to you. We don&apos;t sell your data, we don&apos;t build a profile of you, and we don&apos;t show you ads. Text Yourself is a tool, not a social network. Your thoughts are encrypted and stay under your control.</p>
        </Section>

        <Section title="What we collect">
          <p><strong>Local-first by default.</strong> The app works on your device. Your messages, notes, and reminders live on your phone. When you&apos;re offline, everything keeps working — your thoughts aren&apos;t sitting on our servers.</p>
          <p><strong>Optional cloud sync.</strong> You can choose to enable sync between your devices. When you do, your notes are <strong>end-to-end encrypted</strong> — they&apos;re scrambled in a way that means we can&apos;t read them. We only hold encrypted copies so they can be delivered back to you.</p>
          <p><strong>Basic technical data.</strong> To keep sync working reliably, we may handle small amounts of technical information such as timestamps, device type, and app version. This helps us make sure things work and isn&apos;t used to build a profile of you.</p>
          <p><strong>On this website.</strong> This site uses Vercel Analytics to understand aggregate traffic (for example, which pages are visited). It doesn&apos;t tell us who you are.</p>
        </Section>

        <Section title="Product analytics (future)">
          <p>Today the app itself doesn&apos;t collect analytics. To make the product better, we may later use privacy-respecting analytics tools such as <a href="https://posthog.com">PostHog</a>, which let us understand how features are used and where we can improve. We&apos;ll keep that data aggregated and anonymized, and we&apos;ll update this page before we start.</p>
        </Section>

        <Section title="How we use your data">
          <p>Everything we do with data is in service of one thing: storing and syncing your own thoughts back to you. We don&apos;t use it for advertising, we don&apos;t sell it, and we don&apos;t share it with data brokers.</p>
        </Section>

        <Section title="Storage &amp; security">
          <p>Your notes are encrypted on your device and during sync. Where cloud services are involved, we use reputable providers with strong security practices, and notes are stored in an encrypted form we can&apos;t read. No system is perfect, but we design everything around the principle of holding as little as possible.</p>
        </Section>

        <Section title="Sharing">
          <p>We don&apos;t sell or rent your personal information. The limited technical data we handle is only shared with the service providers needed to run the app (for example, app stores, cloud infrastructure, and analytics), each bound to use it solely to provide their service.</p>
        </Section>

        <Section title="Your control">
          <p>Your data is yours. You can export your notes anytime, delete them whenever you like, and turn sync off. If you ever want to know exactly what we hold or have something removed, just email us — we respond within a reasonable time.</p>
        </Section>

        <Section title="Children">
          <p>Text Yourself is intended for grown-up thoughts, not children. We don&apos;t knowingly collect personal information from anyone under 13. If you believe a child has provided us data, please contact us and we&apos;ll delete it.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>If this policy changes, we&apos;ll update this page and refresh the date above. Material changes will be made obvious inside the app too.</p>
        </Section>

        <Section title="Contact">
          <p>Questions, concerns, or deletion requests? Email us any time at <a href="mailto:hello@txtyourself.app">hello@txtyourself.app</a>.</p>
        </Section>
      </section>

      <footer>
        <a href="/" className="brand"><span className="brand-mark"><img src="/favicon.png" alt="" /></span><span>text yourself</span></a>
        <p>© 2026 Text Yourself. A little more space in your day.</p>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/">Back to home ↑</a>
        </div>
      </footer>
    </main>
  )
}