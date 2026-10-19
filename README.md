# text-yourself-landing

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_mh7rYRL15kNY1KkRDu8kujBgkQsq)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## APK download pipeline

Visitors hit `/download`, enter the passcode, and `POST /api/download-apk` returns
`APK_DOWNLOAD_URL` (the passcode itself is `APK_DOWNLOAD_CODE`, a server-side secret).

An EAS `BUILD` webhook (`https://text-yourself.vercel.app/api/eas-webhook`) fires on
every finished Android **preview** build and:

1. mirrors the APK into Vercel Blob (`apk/text-yourself.apk` in the public
   `text-yourself-apk` store, overwriting the previous build) — EAS artifact URLs
   expire after a couple of weeks, blob URLs don't, so the download link can no
   longer go stale between builds;
2. writes `APK_DOWNLOAD_URL` (blob URL + `?v=<buildId>`) and `APK_BUILD_META` as
   Vercel production env vars;
3. hits the production Deploy Hook so the running deployment picks up the new values.

If mirroring fails the route falls back to the raw EAS artifact URL and records
`"mirrored": false` in `APK_BUILD_META` (visible at `GET /api/latest-build`) so
expiry is reported honestly.

Required Vercel production env vars: `EAS_WEBHOOK_SECRET`, `VERCEL_API_TOKEN`,
`VERCEL_PROJECT_ID`, `VERCEL_DEPLOY_HOOK_URL`, `APK_DOWNLOAD_CODE`,
`BLOB_READ_WRITE_TOKEN` (optional `VERCEL_TEAM_ID`).

### Replaying the webhook by hand

Useful to backfill a build that finished before a deploy, or after a Blob hiccup.
Pull the secret locally (`vercel env pull`), then sign the payload exactly like
Expo does (hex HMAC-SHA1 of the raw body):

```bash
node --env-file=.env.local -e '
const {createHmac} = require("node:crypto");
const payload = JSON.stringify({
  id: "<eas-build-id>",
  status: "finished",
  platform: "android",
  completedAt: new Date().toISOString(),
  expirationDate: null,
  artifacts: { buildUrl: "<eas artifact url from `eas build:list`>" },
  metadata: { buildProfile: "preview", channel: "preview", appVersion: "1.0.0" },
});
const sig = "sha1=" + createHmac("sha1", process.env.EAS_WEBHOOK_SECRET).update(payload).digest("hex");
fetch("https://text-yourself.vercel.app/api/eas-webhook", {
  method: "POST",
  headers: { "content-type": "application/json", "expo-signature": sig },
  body: payload,
}).then(async (r) => console.log(r.status, await r.text()));
'
```
