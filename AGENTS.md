# AGENTS.md

## What this is

Fully static, multi-page portfolio. No build step, no package manager, no dependencies, no backend:

- `index.html` — the **gateway**: a terminal boot sequence, then five role buttons on black that link to the five full portfolio pages.
- `ai-ml-engineer.html`, `ai-automation-engineer.html`, `founder.html`, `fullstack-developer.html`, `forward-deployed-engineer.html` — the five full portfolios, one per role. Each sets `<html data-role="...">` which swaps that page's accent color.
- `styles/` — **split stylesheets** (there is no top-level `styles.css` anymore; it was deleted):
  - `styles/base.css` — shared by every page: tokens, reset, nav, footer, reveals, skip-link, keyboard overlay. Change carefully; it affects all six pages.
  - `styles/gateway.css` — boot + gateway, index.html only.
  - `styles/<page>.css` (five files, one per role page) — that page's ENTIRE section design (hero, proof, work, skills, education, about, contact). Each role page loads `base.css` then its own file. **Ownership**: the five role stylesheets are each owned by that page's redesign pass; do not edit another page's file casually, and never push design changes through `base.css` when they belong to one page.
- `script.js` — vanilla JS, end of `<body>`; zero network calls. Hosts reveals, menu, scroll-spy, proof-strip count-up, boot sequence, **and the site-wide keyboard layer** (see Keyboard navigation).
- `generate_pages.py` — **legacy/stale**: it once generated the five role pages from one template, but the pages have since diverged into independent designs. **Do not run it** (it would overwrite them). The HTML files are the source of truth; delete the generator only if the owner asks.
- `assets/work-*.{png,jpg}` — product screenshots used in the Work sections.

There is no lint, typecheck, or test command. Do not add tooling unless asked.

**Do not reintroduce a backend or AI assistant.** An OpenRouter-backed panel previously existed and was removed so the site deploys to any static host. All widgets must work client-side or not at all. The site is **dark-only**: there is no theme toggle, no `data-theme`, no light mode.

## Local-only extras (not used by the site)

- `bg.md` — gitignored private briefing (contact, job-hunt status, salary, plans). Consumed by his agent fleet, **never** the public site. Never commit it, never lift its private sections into site copy.
- `server.py` + `.env` — optional local RAG gateway (OpenRouter, serves `bg.md`). The site makes no `/api/*` calls; keep it that way. If kept, it refuses to serve `.env`, `bg.md`, `server.py` over HTTP.

## Preview

Any static server works; there is nothing to build:

```
python3 -m http.server 8000
```

Chromium headless for visual checks (works here):

```
chromium --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --force-prefers-reduced-motion --virtual-time-budget=4000 \
  --window-size=1440,1150 --screenshot=OUT.png URL
```

`--force-prefers-reduced-motion` **works** and is the reliable way to screenshot the gateway: reduced motion skips the boot so the five buttons render stably. `--force-prefers-color-scheme` does **NOT** work here. Plain `--virtual-time-budget` captures of the boot/gateway race the `finishBoot` opacity transition and can look wrong even when the page is fine; trust reduced-motion captures. Headless uses of `pkill -f "http.server PORT"` tend to SIGTERM the calling shell; if the server dies, restart with `setsid python3 -m http.server 8124 >/tmp/opencode/srv.log 2>&1 </dev/null & disown`.

## Keyboard navigation (the site is fully keyboard-operable)

- Every page starts with `<a class="skip-link" href="#main">Skip to content</a>` as the first element in `<body>` (gateway uses `href="#gateway"`; role pages put `id="main"` on their main container). This is load-bearing markup: keep it.
- `?` toggles a shortcuts overlay. The overlay (`.kbd-overlay`) is **injected by script.js at runtime** — never hardcode it into HTML. Esc closes it; Tab is trapped inside while open.
- On role pages: `g` then `w` / `s` / `e` / `a` / `c` jumps to Work / Skills / Education / About / Contact; `j` / `k` scroll; `0` returns to the gateway; `n` / `p` cycle through the five tracks. On the gateway: Arrow keys or `j`/`k` choose a track, `1`-`5` open one directly, Enter opens.
- Shortcuts are suppressed while focus is in an input/textarea/select/contenteditable (the Sodeom search box) and while Ctrl/Cmd/Alt is held. The `g` sequence times out after 1.2s.
- Load-bearing hooks: `.skip-link` + `#main`, `section[id]` for the `g` jumps, `.nav-shell > nav` with `.nav-links` / `.menu-toggle` / `#mobile-menu` (menu focuses its first link on open and returns focus to `.menu-toggle` on Escape). Mobile menu state stays in three places in sync (`aria-expanded`, `aria-label`, `.open`).
- Any new interactive element must be reachable and operable by keyboard with a visible `:focus-visible` state. If you redesign a page, re-run the keyboard sanity check: first Tab = skip-link, `?` opens the overlay, Esc closes.

## Design system (Signal Terminal)

Redesign, October 2026. The site embodies Abdulhadi's work (reducing huge noisy models to precise essence: quantization, ternary, small models): a dark "instrument terminal" with a client-side boot, one confident action, green as a disciplined signal, and Liquid Glass on the floating nav only. Keep these locks unless redesigning again:

- **Palette, dark-only, semantic tokens**: canvas `--bg` (`#08090b`), raised `--surface`, ink `--text`/`--text-2`/`--text-3`, inverted `--plate` (`#05060a`) for the contact section. Because it is dark-only there is **no** three-place theme-token trap and no light-mode block; do not add one unless reintroducing a theme toggle. Every text/surface pair clears WCAG AA (4.5:1). All color flows through custom properties.
- **Per-role accent**: the gateway defaults to green `--accent` (`#4ade80`). Each role swaps the accent via `html[data-role]` (on the pages) and `.role-btn[data-role]` (on the gateway buttons): `ai-ml` green `#4ade80`, `ai-automation` cyan `#22d3ee`, `founder` amber `#fbbf24`, `fullstack` blue `#60a5fa`, `fde` violet `#a78bfa`. The token definitions live in `styles/base.css`; a page may override them in its own file only if contrast still clears 4.5:1. **The accent is a signal, not decoration**: primary button fill, status/live dots, list bullets, one accent card, one accent line, the `/ROLE` nav label. Never spray it on borders, arrows, or links.
- **Typography**: `Space Grotesk` 300-700 + `DM Mono` from Google Fonts. Display contrast is **weight, not width**: the hero's `.cond` word is weight 300 (light) inside a 600 headline. There is no `font-stretch` and no Archivo (Space Grotesk has no width axis; never reintroduce). DM Mono is the label/eyebrow/metadata face at 10-12px. Keep small mono text readable. A page may add a third Google Font only if it clearly serves its direction.
- **Shape lock, Apple-native**: rounded corners everywhere (buttons ~12px, tags ~7px, cards 16-24px, `nav` 18px). Circles are for status dots and the logo mark. Elevation is soft multi-stop shadow (`--sh-1`/`--sh-2`/`--sh-glow`), never hard offset blocks.
- **Liquid Glass discipline (two-layer rule)**: glass (`backdrop-filter`) belongs ONLY on the floating `nav` (class scoped as `.nav-shell > nav` — a bare `nav { }` selector leaks the header's `height`/`align-items` onto the gateway's `<nav class="roles">` and breaks its grid; keep it scoped). Content cards use opaque `--surface` + soft shadow, never blur.
- **Terminal boot**: `#boot` is a client-side sequence (8 `bootLines`, animated `#bootFill`/`#bootPct`) that ends by adding `boot.done` + `gateway.show`. Skip via `#bootSkip` / Enter / Space. Reduced motion skips it.
- **Copy rules the owner enforces site-wide**: zero em-dashes or en-dashes in any visible string (periods, commas, colons, hyphens); no numbered section eyebrows (`01 /`); middle-dot is rare, no clusters of `·`; one label per CTA intent.
- **The portrait** in About is hotlinked from `https://github.com/Abdulhadi446.png`. Only external image; vendor it if offline matters.
- **Work screenshots** are dated captures of the live sites (October 2026), headless chromium + ImageMagick crop. TriageDesk intentionally has no shot (no public URL). Keep the `assets/` folder well under 1MB total.

## Conventions that are easy to get wrong

- **Progressive enhancement contract**: `script.js` line 1 adds `.js` to `<html>`. Reveals are scoped `.js .reveal` so content shows when JS is off; never hide `.reveal` unconditionally. Same for hero load (`.js .hero-copy > *`). The boot honors this too: `html:not(.js) .boot { display:none }` and the gateway's hidden state is gated on `html.js .gateway` / `html.js .gateway.show`, so with JS off the boot hides and the gateway shows.
- **No-JS mobile nav**: below 768px, `html:not(.js)` hides `.menu-toggle` and shows `.mobile-menu` expanded. Preserve both.
- **`.reveal` / `.on`**: `IntersectionObserver` adds `.on`. New animated blocks need the `reveal` class. Only stagger is `.work-list > .reveal:nth-child(2..N)`.
- **Scroll-spy**: observes `section[id]`, toggles `.active` on `.nav-links a` + `.mobile-menu a` by `href == id`. A new section needs an `id` and an entry in *both* navs.
- **Mobile menu state**, three places in sync: `aria-expanded` on `.menu-toggle`, `aria-label` Open/Close, `.open` on `.mobile-menu`. Escape + link clicks close it; Escape also returns focus to `.menu-toggle`.
- **Keyboard parity**: work rows use `.work-item:hover, .work-item:focus-within` (accent edge + background). Keep `focus-within`. Global focus ring is `:focus-visible { outline: 2px solid var(--text) }` in `base.css`.
- **Proof-strip numbers are real content**: each lives in the HTML with a `data-count` attr (values differ per role page). JS only animates on viewport entry and not under reduced motion. Never let the animation be the only source of the value.
- **External links**: always `target="_blank" rel="noopener"`, plus `aria-label` when the text isn't self-describing. The Sodeom search box (on pages that have it) is a plain GET to `sodeom.com?q=`.
- **Reduced motion**: `@media (prefers-reduced-motion:reduce)` disables reveals, hero load, pulse, count-up (JS matchMedia), click sounds, tilt, smooth scroll, **skips the boot**, and neutralizes the `g`-jump smooth scroll. Preserve this for any new animation.
- **Grain is a whisper**: fixed `.grain` overlay (`pointer-events:none`) at ~.03 opacity, never on a scrolling container. The old dot-grid was removed; do not reintroduce it.

## Content structure

`index.html` is the gateway only (boot + five role buttons + footer). Each role page is a full portfolio: sticky glass nav (logo, `/ROLE`, section links, "All tracks" back-to-gateway, "Start a conversation"), hero (eyebrow, `.cond` headline, lede, primary + secondary CTA, `.signal-card`), proof strip, Work (featured plate + list), Skills matrix, Education, About (prose + portrait + dossier), Contact plate, footer. The **sections and their ids** (`#work #skills #education #about #contact`) are stable: keyboard jumps, scroll-spy, and nav hrefs all depend on them; don't rename them. The five role filenames are what the gateway buttons and nav link to; don't rename them without updating both ends. Per-page redesigns may restructure presentation freely as long as these contracts hold.

## Owner context (not this repo)

- Daily-driver agent fleet: Claude Code, Goose, Pi, OpenCode, Agy, Hermes, OpenClaw, GitHub Copilot, Codex, Paperclip. Deepest: OpenCode, Hermes, OpenClaw. Prefer OpenCode conventions unless told otherwise.
- Four external Hermes cron jobs run the Trillionir/Sodeom growth loop (blog writer, video composer, lead research, cold outreach); jobs 3-4 hand off through a saved companies file. Relevant only to Work copy.
- The private briefing in `bg.md` tracks live plans (Academy launch, B2B pricing, job hunt). When copy touches those, treat `bg.md` as source and keep unpublished specifics out of the public pages. The Academy has **no public evidence**; do not cite it as a fact.
