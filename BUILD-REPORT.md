# BLACKSITE v2 — Overhaul Build Report (2026-11-01)

Full visual rebuild after Blake rejected v1 ("No this is not good at all").
Reference: https://hermes-agent.nousresearch.com/ — Hermes design language,
translated to a dark ominous cybersecurity motif.

## What changed (v1 → v2)

- **Typography**: Oversized light Didone serif headlines (Bodoni Moda 300,
  one italic accent line per headline, Hermes-style), letterspaced uppercase
  IBM Plex Mono eyebrows/labels/buttons, Inter body. Replaces the old
  condensed-gothic look entirely.
- **Layout**: Full-bleed animated canvas base with centered content column;
  alternating full-width surface bands with rounded corners and canvas
  gutters visible at viewport edges (Hermes band language).
- **Hero**: Two-column split — giant serif "The keyboard / *cowboys.*",
  subcopy, two CTAs (solid cyan mailto, outline secondary), framed
  engraving illustration right with scroll-lagged parallax.
- **Motion**: Single-canvas animated operations-floor backdrop — 21 drifting
  volumetric light streaks (cyan + red), rising ember particles, horizontal
  cyan + vertical red scan sweeps, rotating conic radar glow, drifting
  nebula blobs, vignette + faint grid. Obviously alive within 2s of load.
  `prefers-reduced-motion` freezes to a static frame; mobile gets fewer
  particles. (~29fps in headless software rendering; GPU-backed browsers
  will run it at 60.)
- **Parallax panels (exact Hermes technique)**: inset framed panels,
  `overflow: clip`, img absolutely positioned at `scale(1.22)`,
  `translate3d(0, var(--py-img), 0)` driven by a rAF scroll handler,
  clamped ±64px, IntersectionObserver-gated, film-grain noise overlay
  (`mix-blend-mode: overlay`). Used for the signal showpiece panel and the
  research strip header.
- **Showpiece**: big raven-over-server-tower panel + floating terminal card
  overlapping it with differential scroll drift; terminal types a realistic
  session (framed as a synthetic training range — no live targets, no
  invented results).
- **Capabilities**: 4-card grid (RECON / BREACH / PERSIST / EXFIL) with
  duotone engraving headers (BREACH in intrusion red), numbered eyebrows,
  serif titles, keyboard-focusable cards.
- **Field files**: 3 placeholder entries kept from `js/projects.js`, still
  honestly flagged PLACEHOLDER (red chips); duotone thumbs; parallax strip
  header.
- **About**: "An independent / *engineering company.*" + We are / We refuse
  creed in a deep band.
- **Contact**: mailto:contact@blacksite.dev (STILL A PLACEHOLDER — swap
  before launch). No forms, no fake success states.
- **Footer**: deep black, giant gradient serif BLACKSITE, link columns.
- **Nav**: transparent over hero → pinned blurred pill on scroll; mobile
  hamburger menu.
- **Imagery**: 6 AI engravings in one consistent old-master copperplate
  style, duotoned in post (cyan-on-black; breach in red-on-black) with
  grain: hero-engraving, panel-omen, cap-recon, cap-breach, cap-persist,
  cap-exfil. Total image weight ~1.5MB.
- Removed: all v1 HyperFrames MP4s/posters (assets/video/), the interactive
  node diagram, divider videos.

## Verification (headless Chromium, local server)

- Screenshots reviewed: `screenshots/hero-desktop.png`,
  `screenshots/signal-panel.png`, `screenshots/capabilities.png`,
  `screenshots/hero-mobile.png` (390px), `screenshots/field-files.png`.
- Parallax confirmed live: `--py-img` changes with scroll, img transform
  shows `translateY + scale(1.22)`; hero `--py-hero` = scrollY × 0.14.
- All 16 in-page anchors resolve; mailto intact; no lorem ipsum;
  no root-absolute asset paths; no JS errors; mobile menu opens.
- Honest-content rules kept: no invented clients/certs/results/stats/
  testimonials; PLACEHOLDER flags intact; terminal labeled synthetic.

## Testing hook

`?noreveal=1` disables reveal choreography + instant-completes the
terminal (for screenshots). Harmless in production.

## Known notes for reviewer

- Google Fonts (Bodoni Moda / IBM Plex Mono / Inter) via CDN with
  Georgia/system fallbacks — needs network (as before).
- Contact email is still the placeholder `contact@blacksite.dev`.
- `.vercel/` and `.env.local` are git-ignored and NOT committed.
