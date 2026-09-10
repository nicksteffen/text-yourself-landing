import { NextResponse } from 'next/server'

// Public metadata about the newest finished preview Android build.
// No APK URL here (that stays behind the passcode in POST /api/download-apk);
// the app's launch check uses buildId to decide whether to prompt.
export async function GET() {
  try {
    const raw = process.env.APK_BUILD_META ?? ''
    if (!raw) return NextResponse.json({ buildId: null }, { headers: { 'Cache-Control': 'no-store' } })

    const meta = JSON.parse(raw) as {
      buildId?: string
      profile?: string
      appVersion?: string
      completedAt?: string
      expiresAt?: string
    }
    if (!meta.buildId) return NextResponse.json({ buildId: null }, { headers: { 'Cache-Control': 'no-store' } })

    const expired =
      typeof meta.expiresAt === 'string' ? Date.now() > new Date(meta.expiresAt).getTime() : false

    return NextResponse.json(
      {
        buildId: meta.buildId,
        profile: meta.profile ?? 'preview',
        appVersion: meta.appVersion ?? null,
        completedAt: meta.completedAt ?? null,
        expiresAt: meta.expiresAt ?? null,
        expired,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json({ buildId: null }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
