# AGENTS.md

## What this is

Single-page static portfolio site. Three source files plus an `assets/` folder of product screenshots. No build step, no package manager, no dependencies:

- `index.html` — all content and markup, plus a tiny inline head script that applies the saved theme before paint
- `styles.css` — token-driven, compact, one rule per logical line
- `script.js` — vanilla JS, loaded at end of `<body>`
- `assets/work-*.{png,jpg}` — real screenshots of the live products (Trillionir, Sodeom, blog, B2B tier), lazy-loaded in the Work section

There is no lint, typecheck, test, or codegen command. Do not add tooling unless asked.

## Preview

Any static server works; there is nothing to build:

```
python3 -m http.server 8000
```

`file://` also works (no fetch/modules), but use a server to test real link + anchor behavior. Chromium headless (`chromium --headless=new --screenshot=... --window-size=1440,7200 URL`) is available for visual checks; `--force-prefers-color-scheme` does NOT work here, so to screenshot light mode temporarily hardcode `data-theme="light"` in the inline head script, shoot, then revert.

## Design system (field-manual)

Evolved redesign, October 2026. Keep these locks unless explicitly redesigning again:

- **Palette**: warm paper + ink + a single acid green accent (`--acid`). No second accent hue anywhere. All color flows through CSS custom properties.
- **THEME TOKEN TRAP**: dark mode swaps the same token names in **three places that must stay in sync**: `:root` (light), `@media (prefers-color-scheme: dark) html:not([data-theme="light"])`, and `html[data-theme="dark"]`. When adding or renaming a token, update all three. Effective theme = explicit `data-theme` attr if set, else system preference. The inline head script reads `localStorage.theme` before paint (prevents flash); `script.js` owns the toggle, persists the choice, and syncs the button label/`aria-label`.
- **Typography**: Archivo **variable** (wdth 62–125) + DM Mono, both from Google Fonts CDN. `font-stretch` is load-bearing: display headlines use ~118% (expanded), the hero's `.cond` word uses ~68% (condensed) for same-family contrast. Never replace Archivo with a static font or the headline contrast dies. An offline preview falls back to system fonts; that's expected.
- **Shape lock**: all UI is sharp corners (radius 0). The only circle is `.logo-mark` (brand mark, not UI).
- **Copy rules the owner enforces site-wide**: zero em-dashes or en-dashes in any visible string (use periods, commas, colons, or hyphens); no numbered section eyebrows (`01 /`, `02 /`); middle-dot rationed to ~1 per metadata line; one label per CTA intent.
- **The portrait** in About is hotlinked from `https://github.com/Abdulhadi446.png`. It is the only external image; if it matters offline, vendor it.
- **Work screenshots are dated captures** of the live sites (October 2026), made with headless chromium (`chromium --headless=new --screenshot=... --window-size=1440,900 URL`), cropped/resized with ImageMagick. TriageDesk intentionally has no shot (no public URL). To refresh a shot, recapture, keep the crop tight to the hero, and re-check the file size budget (whole `assets/` folder should stay well under 1MB).

## Conventions that are easy to get wrong

- **Progressive enhancement contract**: `script.js` line 1 adds `.js` to `<html>`. All reveal animations are scoped as `.js .reveal` so content is fully visible when JS is off. Never hide `.reveal` unconditionally. Same rule for the hero load animation (`.js .hero-copy > *`).
- **No-JS mobile nav**: below 768px the hamburger needs JS, so CSS has `html:not(.js)` overrides that hide `.menu-toggle` and show `.mobile-menu` expanded. Preserve both when touching the menu.
- **`.reveal` / `.on` pattern**: elements animate in via `IntersectionObserver` adding `.on`. New animated blocks need the `reveal` class in HTML. The only stagger cascade is `.work-list > .reveal:nth-child(2..4)`.
- **Scroll-spy wiring**: `script.js` observes `section[id]` and toggles `.active` on `.nav-links a` and `.mobile-menu a` by matching `href` to `id`. A new section needs an `id`, an entry in *both* the desktop nav and the mobile menu. Education has content but intentionally no nav link.
- **Mobile menu state** lives in three places kept in sync: `aria-expanded` on `.menu-toggle`, `aria-label` (Open/Close), and `.open` on `.mobile-menu`. Toggle/close helpers handle all three; Escape and menu-link clicks close it.
- **Keyboard parity**: work rows use `.work-item:hover, .work-item:focus-within` (acid edge marker + background). Keep `focus-within` if you touch that styling. Global focus ring is `outline: 2px solid var(--text)` so it flips with the theme (acid-on-paper would fail contrast).
- **Proof-strip numbers are real content**: `58` / `839` / `4` live in the HTML with `data-count` attrs; JS only animates them when the strip enters the viewport and `prefers-reduced-motion` is not set. Never leave the animation as the only source of the value.
- **External links**: always `target="_blank" rel="noopener"`, plus an `aria-label` when the link text isn't self-describing.
- **Reduced motion**: `@media (prefers-reduced-motion:reduce)` disables reveals, hero load animation, pulse, count-up (via JS matchMedia), and transitions. Preserve this when changing animations.
- **Dot grid + grain are page-wide textures**: the body background dot pattern and the fixed `.grain` overlay (`pointer-events:none`) are part of the identity. The grain must never sit on a scrolling container.

## Content structure

All copy lives in `index.html`: hero, proof strip, About (prose + portrait + dossier), Work (one featured plate + list), Skills matrix, Education band, Contact plate, footer. Anchor IDs (`#about`, `#work`, `#skills`, `#education`, `#contact`) are stable; don't rename them.

## Owner context (not this repo)

- Daily-driver agent fleet: Claude Code, Goose, Pi, OpenCode, Agy, Hermes, OpenClaw, GitHub Copilot, Codex, Paperclip. Deepest specialization: OpenCode, Hermes, OpenClaw. Prefer OpenCode conventions here unless told otherwise.
- Four external Hermes cron jobs run the Trillionir/Sodeom growth loop (blog writer, video composer, lead research, cold outreach). Jobs 3-4 hand off through a saved companies file; irrelevant to this site unless the Work section copy about the growth loop changes.
