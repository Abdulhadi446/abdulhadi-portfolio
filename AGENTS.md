# AGENTS.md

## What this is

Single-page **fully static** portfolio site. No build step, no package manager, no dependencies, no backend:

- `index.html` — all content and markup, plus a tiny inline head script that applies the saved theme before paint
- `styles.css` — token-driven, compact, one rule per logical line
- `script.js` — vanilla JS, loaded at end of `<body>`; zero network calls
- `assets/work-*.{png,jpg}` — real screenshots of the live products (Trillionir, Sodeom, blog, B2B tier), lazy-loaded in the Work section

There is no lint, typecheck, test, or codegen command. Do not add tooling unless asked.

**Do not reintroduce a backend or AI assistant.** An OpenRouter-backed assistant panel previously existed and was deliberately removed so the site deploys to any static host. All widget ideas must work client-side or not at all.

## Local-only extras (not used by the site)

- `bg.md` — gitignored private briefing about the owner (contact details, job-hunt status, salary expectations, plans). Consumed by his AI agent fleet, **never** by the public site. Never commit it, never lift its private sections (phone, job hunt, offer details) into site copy.
- `server.py` + `.env` — an optional local RAG gateway (OpenRouter, serves `bg.md` context). The site makes no `/api/*` calls anymore; keep it that way. If kept, it still refuses to serve `.env`, `bg.md`, and `server.py` over HTTP.

## Preview

Any static server works; there is nothing to build:

```
python3 -m http.server 8000
```

`file://` also works (no fetch/modules), but use a server to test real link + anchor behavior. Chromium headless (`chromium --headless=new --screenshot=... --window-size=1440,7200 URL`) is available for visual checks; `--force-prefers-color-scheme` does NOT work here, so to screenshot light mode temporarily hardcode `data-theme="light"` in the inline head script, shoot, then revert.

The footer's "Website overview" button starts a scripted cursor tour. It is pure client-side: steps live in `script.js`, notes persist in a cookie (`abdulhadi_walkthrough_notes`), nothing is sent anywhere.

## Design system (field-manual)

Evolved redesign, October 2026. Keep these locks unless explicitly redesigning again:

- **Palette**: warm paper + ink + a single acid green accent (`--acid`). No second accent hue anywhere. All color flows through CSS custom properties.
- **THEME TOKEN TRAP**: dark mode swaps the same token names in **three places that must stay in sync**: `:root` (light), `@media (prefers-color-scheme: dark) html:not([data-theme="light"])`, and `html[data-theme="dark"]`. This includes the later `--glass-*` tokens (liquid-glass layer), which repeat the same three-place pattern. When adding or renaming a token, update all three. Effective theme = explicit `data-theme` attr if set, else system preference. The inline head script reads `localStorage.theme` before paint (prevents flash); `script.js` owns the toggle, persists the choice, and syncs the button label/`aria-label`.
- **Typography, migration in progress**: `index.html` loads **Space Grotesk** (400-700) + DM Mono from Google Fonts. `styles.css` has NOT caught up: it still declares `'Archivo'` (no longer loaded, so those rules silently fall back to system sans) and uses `font-stretch` (118% expanded, 68% for the hero's `.cond` word) which is inert because Space Grotesk has no width axis. Do not "fix" this by re-adding the Archivo link; the direction is Space Grotesk. When touching type, migrate the `'Archivo'` family names and replace the expanded-vs-condensed contrast device with one Space Grotesk actually supports. DM Mono is the mono/eyebrow face and is fine as-is.
- **Shape lock, relaxed by the glass layer**: core controls (buttons, tags, chips, inputs) stay sharp-cornered. The liquid-glass layer deliberately rounds the floating containers: `nav` 18px, `.work-item`/`.skill-card`/`.portrait` 18px, `.contact-box` 24px. Circles are reserved for status dots and the tour cursor (`.logo-mark`, `.live-dot`, walkthrough cursor), never for content UI.
- **Copy rules the owner enforces site-wide**: zero em-dashes or en-dashes in any visible string (use periods, commas, colons, or hyphens); no numbered section eyebrows (`01 /`, `02 /`); middle-dot is rare, do not introduce clusters of `·`; one label per CTA intent.
- **The portrait** in About is hotlinked from `https://github.com/Abdulhadi446.png`. It is the only external image; if it matters offline, vendor it.
- **Work screenshots are dated captures** of the live sites (October 2026), made with headless chromium (`chromium --headless=new --screenshot=... --window-size=1440,900 URL`), cropped/resized with ImageMagick. TriageDesk intentionally has no shot (no public URL). To refresh a shot, recapture, keep the crop tight to the hero, and re-check the file size budget (whole `assets/` folder should stay well under 1MB).

## Conventions that are easy to get wrong

- **Progressive enhancement contract**: `script.js` line 1 adds `.js` to `<html>`. All reveal animations are scoped as `.js .reveal` so content is fully visible when JS is off. Never hide `.reveal` unconditionally. Same rule for the hero load animation (`.js .hero-copy > *`).
- **No-JS mobile nav**: below 768px the hamburger needs JS, so CSS has `html:not(.js)` overrides that hide `.menu-toggle` and show `.mobile-menu` expanded. Preserve both when touching the menu.
- **`.reveal` / `.on` pattern**: elements animate in via `IntersectionObserver` adding `.on`. New animated blocks need the `reveal` class in HTML. The only stagger cascade is `.work-list > .reveal:nth-child(2..6)` (six work items now).
- **Scroll-spy wiring**: `script.js` observes `section[id]` and toggles `.active` on `.nav-links a` and `.mobile-menu a` by matching `href` to `id`. A new section needs an `id`, an entry in *both* the desktop nav and the mobile menu. Education has content but intentionally no nav link.
- **Mobile menu state** lives in three places kept in sync: `aria-expanded` on `.menu-toggle`, `aria-label` (Open/Close), and `.open` on `.mobile-menu`. Toggle/close helpers handle all three; Escape and menu-link clicks close it.
- **Keyboard parity**: work rows use `.work-item:hover, .work-item:focus-within` (acid edge marker + background). Keep `focus-within` if you touch that styling. Global focus ring is `outline: 2px solid var(--text)` so it flips with the theme (acid-on-paper would fail contrast).
- **Proof-strip numbers are real content**: `58` / `839` / `4` live in the HTML with `data-count` attrs; JS only animates them when the strip enters the viewport and `prefers-reduced-motion` is not set. Never leave the animation as the only source of the value.
- **External links**: always `target="_blank" rel="noopener"`, plus an `aria-label` when the link text isn't self-describing. The only form on the page is the Sodeom search box, a plain GET to `sodeom.com?q=` that needs no server.
- **Reduced motion**: `@media (prefers-reduced-motion:reduce)` disables reveals, hero load animation, pulse, count-up (via JS matchMedia), interface click sounds, tilt, smooth scrolling, and shortens the tour timings. Preserve this when changing animations.
- **Dot grid + grain are page-wide textures**: the body background dot pattern and the fixed `.grain` overlay (`pointer-events:none`) are part of the identity. The grain must never sit on a scrolling container.
- **Guided tour state**: `walkthroughSteps` in `script.js` must keep selectors that exist in `index.html`; if a section or footer control changes, update the steps. Tour notes are cookie-only and capped at 8.

## Content structure

All copy lives in `index.html`: hero, proof strip, About (prose + portrait + dossier), Work (Trillionir featured, then Sodeom, TriMind, TriageDesk, blog/video pipeline, Hermes growth loop, and a "More things that shipped" roundup), Skills matrix, Education band, Contact plate (site, email, GitHub, LinkedIn, HuggingFace), footer with the tour button. Anchor IDs (`#about`, `#work`, `#skills`, `#education`, `#contact`) are stable; don't rename them.

## Owner context (not this repo)

- Daily-driver agent fleet: Claude Code, Goose, Pi, OpenCode, Agy, Hermes, OpenClaw, GitHub Copilot, Codex, Paperclip. Deepest specialization: OpenCode, Hermes, OpenClaw. Prefer OpenCode conventions here unless told otherwise.
- Four external Hermes cron jobs run the Trillionir/Sodeom growth loop (blog writer, video composer, lead research, cold outreach); jobs 3-4 hand off through a saved companies file. Relevant only to Work-section copy.
- The private briefing in `bg.md` tracks live plans (Academy launch, B2B pricing, job hunt). When site copy touches those topics, treat `bg.md` as source and keep unpublished specifics out of the public page.
