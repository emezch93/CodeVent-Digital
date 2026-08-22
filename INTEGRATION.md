# CodeVent Digital — PWA Integration Guide

## Files to Add to Your Repo Root (`/codevent-digital/`)

```
codevent-digital/
├── manifest.json          ← NEW
├── service-worker.js      ← NEW
├── offline.html           ← NEW
├── pwa-register.js        ← NEW
└── icons/                 ← NEW (folder)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png   ← maskable
    ├── icon-384x384.png
    ├── icon-512x512.png   ← maskable
    ├── screenshot-wide.png
    └── screenshot-narrow.png
```

---

## Step 1 — Add to `<head>` of EVERY HTML page

Paste this block inside `<head>` (replace or add alongside your existing meta tags):

```html
<!-- ── PWA ─────────────────────────────────────────── -->
<link rel="manifest" href="/codevent-digital/manifest.json" />
<meta name="theme-color" content="#5b4cff" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="CodeVent" />
<link rel="apple-touch-icon" href="/codevent-digital/icons/icon-192x192.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/codevent-digital/icons/icon-152x152.png" />
<link rel="apple-touch-icon" sizes="144x144" href="/codevent-digital/icons/icon-144x144.png" />
<link rel="apple-touch-startup-image" href="/codevent-digital/icons/icon-512x512.png" />
<!-- ── /PWA ────────────────────────────────────────── -->
```

Pages: `index.html`, `learning.html`, `community.html`, `shop.html`, `contact.html`

---

## Step 2 — Add before `</body>` of EVERY HTML page

```html
<script src="/codevent-digital/pwa-register.js" defer></script>
```

---

## What Each File Does

| File | Purpose |
|------|---------|
| `manifest.json` | Makes the site installable — name, icons, shortcuts, theme colour |
| `service-worker.js` | Offline caching (cache-first shell, network-first pages), push notification skeleton, background sync |
| `offline.html` | Branded fallback page shown when user is offline and no cache hit |
| `pwa-register.js` | Registers SW, auto-detects updates + shows banner, shows "Install App" button |
| `icons/` | All required sizes for Android, iOS, Chrome, Edge, and Lighthouse audit |

---

## Lighthouse PWA Checklist — All Covered ✓

- [x] `manifest.json` with `name`, `short_name`, `icons` (192 + 512 maskable), `start_url`, `display: standalone`
- [x] `theme-color` meta + manifest field
- [x] HTTPS (GitHub Pages provides this automatically)
- [x] Service worker registered on `load` with correct scope
- [x] Offline fallback page for HTML navigation requests
- [x] `apple-touch-icon` + `apple-mobile-web-app-capable` for iOS
- [x] `beforeinstallprompt` intercepted → custom "Install App" badge
- [x] Auto-update banner on new SW install
- [x] `skipWaiting` + `clients.claim()` for zero-stale activations
- [x] Periodic `reg.update()` every 60s for long sessions
- [x] Push notification structure (ready to wire to any backend)
- [x] App shortcuts (Learn, Community, Shop)

---

## GitHub Pages Deployment

No build step needed. All files are static. Just commit and push:

```bash
git add manifest.json service-worker.js offline.html pwa-register.js icons/
git commit -m "feat: convert CodeVent Digital to PWA"
git push origin main
```

After deploy, run a Lighthouse audit in Chrome DevTools → **PWA** tab.
Expected score: **100 / all checks green**.
