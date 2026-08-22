# CodeVent Digital

**Building Developers One Step at a Time.**

CodeVent Digital is a web development training and digital product platform that takes beginners from zero to shipping real projects through a structured, free-to-start learning path. It combines a curriculum, a community, a shop, and an AI-powered assistant into one connected experience.

🔗 **Live site:** [codeventdigital.site](https://codeventdigital.site)
📧 **Email:** codeventdigitalinfo@gmail.com
💬 **WhatsApp:** [+234 818 594 7780](https://wa.me/2348185947780)
📺 **YouTube:** [@codeventdigital](https://youtube.com/@codeventdigital)
🌍 **Based:** Online, worldwide — CodeVent Digital is a digital-first platform, not positioned as tied to any single physical location

---

## What This Is

CodeVent Digital follows a four-stage roadmap:

1. **Learn** — free, structured, bitesize courses (HTML, CSS, JavaScript and beyond)
2. **Build** — guided projects that scale from simple pages to full web apps
3. **Validate** — community and mentor feedback on real submitted projects
4. **Monetize** — access to the Shop, mentorship, and real-world opportunities

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Homepage — roadmap, platform capabilities, sign in/up |
| `learning.html` | Structured course curriculum |
| `community.html` | WhatsApp groups, channel, and mentorship access |
| `shop.html` | Digital products — eBooks, courses, source code |
| `toolkit.html` | CodeVent Developer Toolkit — cheat sheets, checklists, templates, planners |
| `blog/index.html` | Blog overview — free HTML/CSS/JS tutorials |
| `blog/*.html` | Individual tutorial articles (long-form, SEO-optimized) |
| `chat.html` | AI learning assistant (CodeVent AI) |
| `code-editor.html` | Standalone sandboxed live code editor (HTML/CSS/JS with live preview) — linked from the nav and footer of every page |
| `about.html` | Founder and platform background |
| `contact.html` | Contact form and direct channels |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service |
| `offline.html` | PWA offline fallback page (served by `sw.js` when there's no connection) |

## Blog

A public `/blog/` section with free, long-form HTML/CSS/JS tutorials for beginners. Built to satisfy AdSense
E-E-A-T requirements (original written content, author attribution, structured data) and to give the platform
an organic-search entry point beyond the core product pages.

- `blog/index.html` — overview grid, links to every article
- `blog/<slug>.html` — one static file per article, same navbar/footer as the rest of the site
- Each article ships its own `Article` JSON-LD schema, canonical URL, and Open Graph tags
- New articles are added the same way: create a new `blog/<slug>.html`, list it in `blog/index.html`, add it to `sitemap.xml`

## Code Editor — noindex by design

`code-editor.html` is a tool page, not content, so it's kept out of Google's index the same way `chat.html`
and `toolkit.html` are:

- `<meta name="robots" content="noindex, follow" />` in its `<head>`
- Not listed in `sitemap.xml`
- Still fully linked from the nav and footer on every other page, using the extensionless `/code-editor` path
  everywhere, including inside `/blog/` (`../code-editor`)

This mirrors the exact pattern that fixed the earlier AdSense content-policy rejection: interactive tools stay
linked and usable, but only genuine long-form content pages are indexable and listed in the sitemap. If you
ever add a new interactive tool page, follow this same pattern — noindex it and leave it out of `sitemap.xml`.

## AdSense Compliance Notes (August 2026 pass)

- `ads.txt` confirmed correct: `google.com, pub-1629598637562109, DIRECT, f08c47fec0942fa0`
- `privacy.html` §5 (Cookies & Local Storage) previously stated the site does **not** use advertising cookies —
  contradicting the live `adsbygoogle.js` loader already present on every page. Rewritten to correctly disclose
  Google/third-party ad cookies, link to Google Ads Settings for opt-out, and link to Google's partner-sites
  policy. Keep this section accurate if the AdSense ad units (currently commented out, pending approval) are
  turned on.
- All utility/tool pages (`chat.html`, `toolkit.html`, `code-editor.html`) remain `noindex` and excluded from
  `sitemap.xml` — required for AdSense's "sufficient original content" review.
- No page loads more than one `adsbygoogle.js` script instance; ad `<ins>` units are commented out until the
  account is approved — uncomment per page when ready.

## Site Audit & Technical SEO Pass (August 2026)

- **Instagram → YouTube:** the Instagram footer icon/link (all pages, 13 instances including every blog article)
  replaced with the official channel, `https://youtube.com/@codeventdigital`, using the `fa-youtube` icon and a
  proper `aria-label`. No Instagram references remain anywhere in the repo.
- **Hero messaging:** "Now Enrolling — Free Entry" (implied a temporary window; inaccurate — the platform has
  been enrolling continuously) replaced with the evergreen "Build Your Developer Future".
- **Lagos-based positioning removed:** CodeVent Digital is now consistently positioned as an online, global
  platform in all company-facing copy (hero, trust line, homepage stats card, About/Terms/Contact, sitewide
  footer location badge). The founder's personal bio (About page, blog author bylines) and individual
  testimonial authors' locations were left untouched — those are personal facts, not company positioning.
- **Blog URL architecture bug:** every internal link inside `/blog/` (nav, footer, cross-article links, "browse
  all tutorials") was still pointing to `.html` filenames instead of the extensionless production paths used
  everywhere else on the site. Fixed across all 6 blog files.
- **Canonical / `og:url` mismatches:** all 5 blog articles had `<link rel="canonical">` and `og:url` pointing to
  `.html` URLs while `sitemap.xml` listed the extensionless version — a direct cause of Search Console's
  "Alternate page with proper canonical tag" / "Page with redirect" reports. Now aligned.
- **Structured data:** `BlogPosting`/`Person` `url` fields in `blog/index.html` and all 5 articles were still
  `.html` — fixed to match each page's canonical.
- **`shop.html` domain bug:** `og:url` and the `Store` JSON-LD `url` pointed to the old
  `emezch93.github.io/codevent-digital` GitHub Pages domain instead of `codeventdigital.site` — real duplicate-
  content risk, now fixed.
- **`blog/index.html` link inconsistency:** every other page linked to the blog via `blog/index.html`
  (a `.html` filename) instead of `/blog/` — fixed sitewide.
- **Removed 5 orphaned files** at repo root (`css-flexbox-tutorial.html`, `css-grid-layout-guide.html`,
  `html-for-beginners-complete-guide.html`, `javascript-dom-manipulation-guide.html`,
  `javascript-fetch-api-tutorial.html`) — stale duplicates of the real articles in `blog/`, not linked from
  anywhere on the live site, left behind from an earlier upload.
- **After uploading these fixes:** the affected URLs (homepage, About, Terms, Contact, Shop, and all 5 blog
  articles) were already indexed before this pass, but their canonical/content signals changed. Use Search
  Console's URL Inspection → **Request Indexing** on each, and resubmit `sitemap.xml`, to get Google to recrawl
  and pick up the corrected canonicals and copy — an already-indexed URL doesn't get re-crawled automatically
  just because the underlying page changed.

## Credibility & Social Proof Pass (August 2026)

CodeVent Digital does not use fabricated social proof. This pass removed unsubstantiated numbers and
invented testimonials rather than replacing them with new invented figures:

- **`testimonial.html` removed entirely.** The page presented fictional learner reviews (names, roles,
  star ratings, avatars) as real. It has been deleted from the repo, `sitemap.xml`, both service worker
  precache lists, and every nav/footer link across the site. `/testimonial` and `/testimonial.html` now
  301 to `/community`, the closest genuine equivalent (real, live community access) rather than a fake
  successor page.
- **Homepage stats bar:** removed the "500+ Learners Enrolled" figure, which was not backed by verifiable
  platform data. It was not replaced with a different invented number.
- **Homepage trust line:** removed the fake avatar cluster, 5-star rating, and "Trusted by 500+ learners"
  claim from the hero. Replaced with an accurate, verifiable statement ("Free to start — no credit card
  required").
- **Homepage social-proof section:** the three fabricated testimonial cards were replaced with a genuine
  "Everything You Need, In One Place" section describing actual platform capabilities (Learning, Code
  Editor, CodeVent AI, Community, Toolkit, Blog) — demonstrating value through the real product instead of
  invented traction.
- **The Learn → Build → Validate → Monetize framework is unchanged** — same four stages, same names,
  same order, everywhere it appears.
- No new numbers, ratings, avatars, or claims were invented to fill the space; genuine platform
  information (courses, tools, pricing model) was used instead.

## URL Structure — Important

Cloudflare Pages automatically strips `.html` from every URL and 301-redirects the `.html` version to the
clean one (e.g. `about.html` → `/about`). This happens at the hosting layer, not in this repo, and there is
no build config here to change it.

Because of this, every internal link, the `canonical` tag on every page, `sitemap.xml`, and `manifest.json`
must all point to the **extensionless** URL, not the filename:

- Correct: `href="/about"`, `<link rel="canonical" href="https://codeventdigital.site/about" />`
- Wrong: `href="about.html"` — this is a live file that still exists and is still linked to and edited as
  `about.html`, but it should never be referenced by its filename anywhere Google or a visitor can follow it,
  only the extensionless path.

Mismatches here caused a full round of Google Search Console "Page with redirect" and "Alternate page with
proper canonical tag" indexing issues in July–August 2026, including inside `/blog/` where every internal link,
canonical tag, and structured-data `url` field was still using `.html` filenames as of the August 2026 audit —
now fixed sitewide. If you add a new page, give it a canonical tag and internal links using the extensionless
path from the start.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript — no framework, no build step
- **Hosting:** Cloudflare Pages, custom domain (`codeventdigital.site`)
- **PWA:** Full manifest + service worker (`sw.js`), installable, offline-capable
- **AI Chat:** `chat.html` → Cloudflare Worker → Gemini 3.6 Flash (stateless backend, frontend owns memory via `localStorage`)
- **Enrollment:** Google Form + linked Google Sheet, wired through `enroll-config.js`
- **Analytics-free stat counters:** `counter.js` — IntersectionObserver-based, animates in view

## Project Structure

```
codevent-digital/
├── index.html
├── learning.html
├── community.html
├── shop.html
├── toolkit.html
├── chat.html
├── blog/
│   ├── index.html
│   ├── html-for-beginners-complete-guide.html
│   ├── css-flexbox-tutorial.html
│   ├── css-grid-layout-guide.html
│   ├── javascript-dom-manipulation-guide.html
│   └── javascript-fetch-api-tutorial.html
├── about.html
├── contact.html
├── privacy.html
├── terms.html
├── enroll-config.js       # single source of truth for enrollment link
├── counter.js             # animated stat counters
├── pwa-register.js        # service worker registration + install prompt
├── sw.js                  # active service worker (cache-first assets, network-first HTML)
├── favicon.svg            # brand mark, gradient "</>" logo
├── icons/                 # full PWA icon set (any + maskable)
├── manifest.json
├── robots.txt
└── sitemap.xml
```

## Running Locally

No build step required — this is a static site.

```bash
git clone https://github.com/emezch93/codevent-digital.git
cd codevent-digital
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

Deployed via Cloudflare Pages, connected directly to this repository's `main` branch. Pushing to `main` triggers an automatic rebuild and deploy to `codeventdigital.site`.

## Contributing

This is a solo-maintained project. Issues and suggestions are welcome, but direct pull requests are not currently accepted.

## License

© 2026 CodeVent Digital. All rights reserved.
