# CodeVent Digital

**Building Developers One Step at a Time.**

CodeVent Digital is a web development training and digital product platform that takes beginners from zero to shipping real projects through a structured, free-to-start learning path. It combines a curriculum, a community, a shop, and an AI-powered assistant into one connected experience.

🔗 **Live site:** [codeventdigital.site](https://codeventdigital.site)
📧 **Email:** codeventdigitalinfo@gmail.com
💬 **WhatsApp:** [+234 818 594 7780](https://wa.me/2348185947780)
📍 **Based in:** Surulere, Lagos, Nigeria

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
| `index.html` | Homepage — roadmap, stats, testimonials, sign in/up |
| `learning.html` | Structured course curriculum |
| `community.html` | WhatsApp groups, channel, and mentorship access |
| `shop.html` | Digital products — eBooks, courses, source code |
| `testimonial.html` | Learner success stories and platform stats |
| `toolkit.html` | CodeVent Developer Toolkit — cheat sheets, checklists, templates, planners |
| `blog/index.html` | Blog overview — free HTML/CSS/JS tutorials |
| `blog/*.html` | Individual tutorial articles (long-form, SEO-optimized) |
| `chat.html` | AI learning assistant (CodeVent AI) |
| `code-editor.html` | Standalone sandboxed live code editor (linked from `chat.html`) |
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
proper canonical tag" indexing issues in July–August 2026. If you add a new page, give it a canonical tag
and internal links using the extensionless path from the start.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript — no framework, no build step
- **Hosting:** Cloudflare Pages, custom domain (`codeventdigital.site`)
- **PWA:** Full manifest + service worker (`sw.js`), installable, offline-capable
- **AI Chat:** `chat.html` → Cloudflare Worker → Gemini 2.5 Flash (stateless backend, frontend owns memory via `localStorage`)
- **Enrollment:** Google Form + linked Google Sheet, wired through `enroll-config.js`
- **Analytics-free stat counters:** `counter.js` — IntersectionObserver-based, animates in view

## Project Structure

```
codevent-digital/
├── index.html
├── learning.html
├── community.html
├── shop.html
├── testimonial.html
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
