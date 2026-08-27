import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

const APK_GOOGLE_DRIVE_URL = 'https://drive.google.com/uc?export=download&id=1ZtAUWyUgExgNoMGooxBODfXOvV6FX9U8'

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

    return NextResponse.json({ url: APK_GOOGLE_DRIVE_URL }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Unable to start download' }, { status: 400 })
  }
}
