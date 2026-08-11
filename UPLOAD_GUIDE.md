# Upload Guide — Code Editor Nav/Footer + AdSense Fix

This folder contains only the files that changed. Structure matches the repo exactly,
so you can drag-and-drop straight over the top of your existing files.

## What changed (23 files)

**Code Editor added to nav + footer:**
index.html, about.html, community.html, contact.html, privacy.html, terms.html,
testimonial.html, shop.html, learning.html, toolkit.html, chat.html,
css-flexbox-tutorial.html, css-grid-layout-guide.html, html-for-beginners-complete-guide.html,
javascript-dom-manipulation-guide.html, javascript-fetch-api-tutorial.html,
blog/index.html, blog/css-flexbox-tutorial.html, blog/css-grid-layout-guide.html,
blog/html-for-beginners-complete-guide.html, blog/javascript-dom-manipulation-guide.html,
blog/javascript-fetch-api-tutorial.html

**AdSense cookie disclosure fixed:**
privacy.html (§5 Cookies & Local Storage rewritten)

**Docs updated:**
README.md

`code-editor.html` itself was NOT changed — it already existed and already works. Only
links pointing to it were added.

## How to upload on github.com (no git needed)

1. Go to https://github.com/emezch93/codevent-digital
2. For each file above: open it in the repo, click the pencil (Edit) icon, select all,
   paste in the matching file from this folder, commit directly to `main`.
   — or —
3. Faster: click "Add file" → "Upload files" at the repo root, drag in `index.html`,
   `about.html`, etc. (GitHub will ask to replace existing files). Repeat once for the
   root-level files, then `cd` into `/blog` in the repo UI and repeat for the `blog/*.html`
   files.
4. Commit message suggestion: `Add Code Editor to nav/footer sitewide + fix AdSense cookie disclosure`

Cloudflare Pages will auto-deploy from `main` — no other steps needed.

## Quick sanity check after deploy

- Visit any page, confirm "Code Editor" appears in the nav and footer, and the link
  loads `/code-editor` without a redirect loop
- View source on `/code-editor` and confirm `<meta name="robots" content="noindex, follow" />`
  is still there
- Confirm `/code-editor` is still absent from `/sitemap.xml`
