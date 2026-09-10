import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

// Last-resort fallback so the button never bricks if APK_DOWNLOAD_URL is
// unset. Normally the URL comes from the env var, kept fresh automatically
// by POST /api/eas-webhook on every finished preview EAS build.
const APK_GOOGLE_DRIVE_FALLBACK = 'https://drive.google.com/uc?export=download&id=1ZtAUWyUgExgNoMGooxBODfXOvV6FX9U8'

const APK_DOWNLOAD_URL = process.env.APK_DOWNLOAD_URL || APK_GOOGLE_DRIVE_FALLBACK

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const submittedCode = typeof body.code === 'string' ? body.code : ''
    const configuredCode = process.env.APK_DOWNLOAD_CODE ?? ''

    if (!configuredCode || submittedCode.length !== configuredCode.length) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
    }

    const submittedBuffer = Buffer.from(submittedCode)
    const configuredBuffer = Buffer.from(configuredCode)
    if (!timingSafeEqual(submittedBuffer, configuredBuffer)) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
    }

    return NextResponse.json({ url: APK_DOWNLOAD_URL }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Unable to start download' }, { status: 400 })
  }
}
