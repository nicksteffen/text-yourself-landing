import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'

// Mirroring the ~125 MB APK (download from EAS, multipart upload to Blob) needs
// far more than the default function budget.
export const maxDuration = 300

// Receives EAS BUILD webhooks (registered via `eas webhook:create`) and keeps
// the APK_DOWNLOAD_URL Vercel env var pointed at the newest finished Android
// preview build, then triggers a redeploy so the live /download page serves it.
// Only preview builds feed the landing site (develop stays yours via OTA/direct
// install); override with EAS_TRACKED_PROFILES if that ever changes.
//
// The finished EAS artifact URL expires after a couple of weeks, which used to
// leave /download serving a dead link whenever no new build shipped. So the APK
// is mirrored into Vercel Blob (`apk/text-yourself.apk` in the public
// `text-yourself-apk` store) and APK_DOWNLOAD_URL points at that permanent URL.
// If mirroring fails we fall back to the raw EAS URL and record `mirrored:false`
// in APK_BUILD_META so /api/latest-build reports expiry honestly.
//
// Required Vercel env vars (all server-side, never NEXT_PUBLIC_):
//   EAS_WEBHOOK_SECRET  - signing secret from `eas webhook:create --secret`
//   VERCEL_API_TOKEN    - account token (vercel.com/account/tokens), project access
//   VERCEL_PROJECT_ID   - `prj_...` id of this project (Settings -> General)
//   VERCEL_DEPLOY_HOOK_URL - Deploy Hook that rebuilds production (Settings -> Git)
//   BLOB_READ_WRITE_TOKEN  - from connecting the `text-yourself-apk` Blob store
//                            (OIDC works too when BLOB_STORE_ID is present)
// Optional:
//   VERCEL_TEAM_ID      - team id if the project lives under a team
//   EAS_TRACKED_PROFILES - comma list, default "preview"

const APK_BLOB_PATHNAME = 'apk/text-yourself.apk'

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

// Copies the finished EAS artifact into Vercel Blob under a stable pathname and
// returns its permanent public URL. The artifact URL itself expires, the blob
// does not. Overwriting keeps the store at a single APK (~125 MB of the 1 GB
// free tier) instead of accumulating one per build.
async function mirrorApkToBlob(sourceUrl: string): Promise<string> {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`apk fetch failed: ${res.status}`)
  const body = await res.arrayBuffer()

  const blob = await put(APK_BLOB_PATHNAME, body, {
    access: 'public',
    allowOverwrite: true,
    multipart: true, // recommended for files above 100 MB
    contentType: 'application/vnd.android.package-archive',
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  })
  return blob.url
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
      completedAt?: string
      expirationDate?: string
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

    // Prefer the durable Blob mirror. A Blob hiccup shouldn't stop the link from
    // updating at all, so fall back to the raw (expiring) EAS artifact URL.
    let downloadUrl = buildUrl
    let mirrored = false
    try {
      downloadUrl = await mirrorApkToBlob(buildUrl)
      mirrored = true
    } catch (error) {
      console.error(
        'apk mirror failed, falling back to EAS artifact:',
        error instanceof Error ? error.message : error
      )
    }

    // The blob pathname is stable across builds, so pin a per-build query param:
    // without it browsers and the CDN can keep serving the previous APK.
    const servedUrl = mirrored ? `${downloadUrl}?v=${payload.id ?? Date.now()}` : downloadUrl
    const envResult = await upsertEnvVar('APK_DOWNLOAD_URL', servedUrl)
    // Metadata the app's launch check reads via GET /api/latest-build.
    await upsertEnvVar(
      'APK_BUILD_META',
      JSON.stringify({
        buildId: payload.id ?? null,
        profile,
        appVersion: payload.metadata?.appVersion ?? null,
        completedAt: payload.completedAt ?? null,
        // Only the raw EAS artifact expires; a mirrored blob never does. The app
        // skips its update prompt while `expired` is true, so this must reflect
        // where the link actually points.
        expiresAt: mirrored ? null : payload.expirationDate ?? null,
        mirrored,
      })
    )
    await triggerRedeploy()

    return NextResponse.json({
      ok: true,
      updated: true,
      envResult,
      buildId: payload.id,
      profile,
      mirrored,
    })
  } catch (error) {
    // Non-2xx makes Expo retry with backoff — right for transient Vercel hiccups.
    // Bad payloads are already filtered above, so 500 here means "try again".
    console.error('eas-webhook failed:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 })
  }
}
