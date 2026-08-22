# How to apply this update

Structure matches the repo root exactly — drag-and-drop these 13 files straight
over your existing files (overwrite when prompted):

INTEGRATION.md, README.md, _redirects, about.html, community.html,
contact.html, index.html, offline.html, privacy.html, service-worker.js,
sitemap.xml, sw.js, terms.html

## One manual step this zip can't do for you

**Delete `testimonial.html` from the repo root.** It's no longer linked from
anywhere, but the file itself still needs to be removed (or deleted via GitHub's
web UI / your git client).

## What changed, at a glance

- Removed the testimonial page and every nav/footer link to it.
- Added `/testimonial` and `/testimonial.html` → `/community` redirects in `_redirects`.
- Removed `testimonial.html` from `sitemap.xml` and both service worker caches.
- Homepage: removed the unverified "500+ Learners Enrolled" stat, the fake
  avatar/star trust line, and the three invented testimonial cards — replaced
  with a genuine "Everything You Need, In One Place" section describing real
  platform features.
- Learn → Build → Validate → Monetize left untouched.
- README and INTEGRATION.md updated to match.

Full details are in the "Credibility & Social Proof Pass (August 2026)" section
now in README.md.
