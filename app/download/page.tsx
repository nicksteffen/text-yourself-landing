'use client'

import { FormEvent, useState } from 'react'
import { ArrowLeft, Download, LockKeyhole } from 'lucide-react'

export default function DownloadPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/download-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        setError(response.status === 401 ? 'That passcode is not correct.' : 'The APK is not available yet.')
        return
      }

      const { url } = await response.json()
      window.location.href = url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="apk-page">
      <a href="/" className="apk-back"><ArrowLeft size={16} /> Back to Text Yourself</a>
      <section className="apk-panel" aria-labelledby="download-title">
        <div className="apk-icon"><LockKeyhole size={25} /></div>
        <p className="kicker">Android beta</p>
        <h1 id="download-title">Download the<br /><em>Text Yourself</em> APK.</h1>
        <p>Enter the private passcode to download the Android build. The passcode keeps this early version in the right hands.</p>
        <form onSubmit={handleSubmit} className="apk-form">
          <label htmlFor="download-code">Download passcode</label>
          <input id="download-code" type="password" value={code} onChange={(event) => setCode(event.target.value)} autoComplete="off" required placeholder="Enter your passcode" />
          <button type="submit" disabled={loading}><Download size={17} /> {loading ? 'Checking…' : 'Download APK'}</button>
          {error && <p className="apk-error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  )
}
