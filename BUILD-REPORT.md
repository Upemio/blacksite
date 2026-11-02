# BLACKSITE — Build Report

**Status:** Complete. All 9 completion criteria met (see checklist below).
**Deliverable:** `~/workspace/blacksite/` — static site, no build step, Vercel-deployable.
**Built:** 2026-11-01 (America/Chicago).

## What was built

A premium animated company website for BLACKSITE, an independent engineering company
(AI, cybersecurity, chaos engineering, data intelligence). Single-page, vanilla
HTML/CSS/JS — no framework, no build step, no runtime dependencies beyond Google Fonts.

### Sections
- **Nav** — fixed hairline bar, sharp wordmark (condensed caps + cyan square glyph),
  anchor links, contact button, mobile hamburger menu (Escape closes, focus managed).
- **Hero** — full viewport, cinematic entrance (orchestrated clip-reveal sequence),
  massive condensed wordmark, tagline "The keyboard cowboys.", lede, two CTAs,
  system strip, and a rendered ambient video loop underneath.
- **Capabilities (SEC.01)** — the four disciplines presented as an **interconnected
  system diagram**, not cards: a central BLACKSITE core node wired to four selectable
  discipline nodes (SVG, keyboard-operable). Selecting a node lights its wire and swaps
  a detail panel (description + focus areas). Mobile falls back to a button list.
  A second rendered loop (node field) plays faintly behind the diagram.
- **Divider** — rendered video sweep (hairline + traveling pulse + ticks), used twice.
- **Research (SEC.02)** — "Field files": dossier-style expandable rows, data-driven
  from `js/projects.js` (add a project = append an object, no redesign). All three
  entries are **honest placeholders**, visibly flagged PLACEHOLDER in intrusion red.
  No clients, results, certifications, or achievements are claimed anywhere.
- **About (SEC.03)** — identity statement + "We are / We refuse" creed lists.
- **Contact (SEC.04)** — `mailto:contact@blacksite.dev` button (opens the visitor's
  mail client; page states plainly that no backend exists and nothing is submitted).
- **Footer** — wordmark, nav, © MMXXVI.

### Motion assets (HyperFrames, rendered to MP4)
| File | Spec | Use |
|---|---|---|
| `assets/video/hero-ambient.mp4` | 1920×1080, 30fps, 10s seamless loop | Hero background |
| `assets/video/field-loop.mp4` | 1920×1080, 30fps, 8s seamless loop | Capabilities backdrop |
| `assets/video/divider-sweep.mp4` | 1920×1080, 30fps, 6s seamless loop | Section dividers (×2) |

All compositions passed `hyperframes check` with 0 errors / 0 warnings, were
snapshot-reviewed frame by frame, and verified by duration via ffprobe.
Projects live at `~/workspace/.hf-tmp/bs/{hero,divider,field}/` (kept for re-rendering).

### Design system (from DESIGN.md, applied exactly)
`#090B10` bg · `#00D4FF` accent · `#E4E8ED` text · `#171C25` surface ·
`#FF304F` destructive (placeholder flags + "refuse" markers only) ·
`#8993A1` muted · `#303846` border · radii 2/3/4px (sharp) · flat shadows ·
0.7s transitions · outline technical icon style.
Type: **Oswald** (condensed grotesque — closest Google Fonts match for Rules Gothic
Condensed) for display, **IBM Plex Mono** (closest match for Aeonik Fono Pro) for body.
Type scale follows the DESIGN.md table (h1 64/200, h2 48/400, h3 36/500,
body 14/400, labels 12/700); the hero wordmark is intentionally oversized as the
single memorable element.

## Structure

```
~/workspace/blacksite/
├── index.html            # all sections, semantic HTML
├── css/styles.css        # full design system + responsive + reduced-motion
├── js/app.js             # nav, reveals, videos, capabilities, accordion
├── js/projects.js        # field-file data (edit to add projects)
├── assets/video/         # 3 MP4s + 3 poster PNGs
├── screenshots/          # hero-desktop.png, capabilities.png, hero-mobile.png
└── BUILD-REPORT.md
```

## How to serve

```bash
cd ~/workspace/blacksite && python3 -m http.server 8000
# open http://localhost:8000
```
No build, no env vars. Deploy: point Vercel at this directory (static).

## Verification evidence

- **Screenshots reviewed** (headless Chromium): hero desktop, capabilities diagram,
  research rows, about, contact, footer, mobile 390px hero — see `screenshots/`.
- **Console:** zero JS errors on load.
- **Interactions tested** via scripted iframe driver (real clicks/keys):
  accordion expand (`aria-expanded` flips, body opens), SVG node select swaps detail
  panel + lights wire, mobile list buttons swap panel, keyboard Enter on nodes works,
  mobile menu opens/closes with visible links.
- **Responsive:** 1440px desktop, 390px mobile verified; breakpoints at 1024/720/480.
- **Reduced motion** (`--force-prefers-reduced-motion`): autoplay attributes stripped,
  all reveals/wipe animations disabled, content fully visible, no JS errors.
- **Videos:** all `ffprobe`-verified at exact durations (10s/8s/6s), posters in place,
  `preload="metadata"`, pause when off-screen (IntersectionObserver).
- **Accessibility:** skip link, semantic landmarks, aria-pressed/expanded/live regions,
  visible `:focus-visible` rings, keyboard-operable diagram nodes and accordion.

## Known limitations / handoffs

1. **Contact email is a placeholder** (`contact@blacksite.dev`). Replace with the real
   address before launch — it appears in `index.html` (mailto link + button label).
2. **Fonts load from Google Fonts** (network required). To go fully offline, self-host
   Oswald + IBM Plex Mono woff2 under `assets/fonts/` and swap the `<link>` for
   `@font-face`.
3. **Field files are placeholders by design** — add real projects in `js/projects.js`
   (set `placeholder:false`, drop the flag) as work ships.
4. **Videos are abstract ambient loops** (no text, no sound) — deliberate: they are
   atmosphere, never interactive components. The site is fully usable with video
   disabled/blocked (posters + flat backgrounds carry it).
5. HyperFrames composition sources kept at `~/workspace/.hf-tmp/bs/` for re-renders;
   always render with `TMPDIR=$HOME/workspace/.hf-tmp` (`/tmp` is a 512MB tmpfs).

## Completion criteria (brief §9)

- [x] Complete website implemented — all sections finished
- [x] UI/UX polished — spacing, hierarchy, states (hover/focus/active) throughout
- [x] Animations implemented and working — entrance, reveals, diagram, videos
- [x] Desktop and mobile layouts complete — verified at 1440px and 390px
- [x] All navigation and interactions work — tested, no dead buttons/links
- [x] Design system respected — tokens, type scale, radii, motion spec from DESIGN.md
- [x] No placeholder styling — every style is intentional; content placeholders are
      explicitly flagged, never disguised
- [x] No broken or misleading functionality — contact is an honest mailto, videos are
      honest atmosphere, no fake terminals/forms/success states
- [x] Application runs successfully — served locally, zero console errors
