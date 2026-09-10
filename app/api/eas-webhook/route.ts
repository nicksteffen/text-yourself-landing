import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Receives EAS BUILD webhooks (registered via `eas webhook:create`) and keeps
// the APK_DOWNLOAD_URL Vercel env var pointed at the newest finished Android
// preview build, then triggers a redeploy so the live /download page serves it.
// Only preview builds feed the landing site (develop stays yours via OTA/direct
// install); override with EAS_TRACKED_PROFILES if that ever changes.
//
// Required Vercel env vars (all server-side, never NEXT_PUBLIC_):
//   EAS_WEBHOOK_SECRET  - signing secret from `eas webhook:create --secret`
//   VERCEL_API_TOKEN    - account token (vercel.com/account/tokens), project access
//   VERCEL_PROJECT_ID   - `prj_...` id of this project (Settings -> General)
//   VERCEL_DEPLOY_HOOK_URL - Deploy Hook that rebuilds production (Settings -> Git)
// Optional:
//   VERCEL_TEAM_ID      - team id if the project lives under a team
//   EAS_TRACKED_PROFILES - comma list, default "preview"

const TRACKED_PROFILES = (process.env.EAS_TRACKED_PROFILES ?? 'preview')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 })
}

function vercelApi(path: string) {
  const teamId = process.env.VERCEL_TEAM_ID
  return `https://api.vercel.com${path}${teamId ? `?teamId=${encodeURIComponent(teamId)}` : ''}`
}

async function upsertEnvVar(key: string, value: string): Promise<'created' | 'updated'> {
  const projectId = process.env.VERCEL_PROJECT_ID
  const token = process.env.VERCEL_API_TOKEN
  if (!projectId || !token) throw new Error('VERCEL_PROJECT_ID / VERCEL_API_TOKEN not configured')

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const listRes = await fetch(vercelApi(`/v10/projects/${projectId}/env`), { headers })
  if (!listRes.ok) throw new Error(`vercel env list failed: ${listRes.status}`)
  const { envs } = (await listRes.json()) as { envs: Array<{ id: string; key: string; target: string[] }> }
  const existing = envs.find((e) => e.key === key && e.target.includes('production'))

  if (existing) {
    const patchRes = await fetch(vercelApi(`/v10/projects/${projectId}/env/${existing.id}`), {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ value }),
    })
    if (!patchRes.ok) throw new Error(`vercel env update failed: ${patchRes.status}`)
    return 'updated'
  }

  const createRes = await fetch(vercelApi(`/v10/projects/${projectId}/env`), {
    method: 'POST',
    headers,
    body: JSON.stringify({ key, value, type: 'encrypted', target: ['production'] }),
  })
  if (!createRes.ok) throw new Error(`vercel env create failed: ${createRes.status}`)
  return 'created'
}

async function triggerRedeploy() {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hookUrl) throw new Error('VERCEL_DEPLOY_HOOK_URL not configured')
  const res = await fetch(hookUrl, { method: 'POST' })
  if (!res.ok) throw new Error(`deploy hook failed: ${res.status}`)
}

export async function POST(request: Request) {
  try {
    const secret = process.env.EAS_WEBHOOK_SECRET ?? ''
    if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })

    // Verify expo-signature: hex HMAC-SHA1 of the RAW body, "sha1=" prefixed.
    const rawBody = await request.text()
    const signature = request.headers.get('expo-signature') ?? ''
    const expected = `sha1=${createHmac('sha1', secret).update(rawBody).digest('hex')}`
    if (signature.length !== expected.length) return unauthorized('Bad signature')
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return unauthorized('Bad signature')
    }

    const payload = JSON.parse(rawBody) as {
      id?: string
      status?: string
      platform?: string
      artifacts?: { buildUrl?: string }
      metadata?: { buildProfile?: string; channel?: string; appVersion?: string }
    }

    const profile = (payload.metadata?.buildProfile ?? payload.metadata?.channel ?? '').toLowerCase()
    const buildUrl = payload.artifacts?.buildUrl ?? ''

    if (payload.status !== 'finished' || payload.platform !== 'android' || !buildUrl) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'not a finished android build' })
    }
    if (!TRACKED_PROFILES.includes(profile)) {
      return NextResponse.json({ ok: true, ignored: true, reason: `profile ${profile} not tracked` })
    }

    const envResult = await upsertEnvVar('APK_DOWNLOAD_URL', buildUrl)
    await triggerRedeploy()

    return NextResponse.json({ ok: true, updated: true, envResult, buildId: payload.id, profile })
  } catch (error) {
    // Non-2xx makes Expo retry with backoff — right for transient Vercel hiccups.
    // Bad payloads are already filtered above, so 500 here means "try again".
    console.error('eas-webhook failed:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 })
  }
}
