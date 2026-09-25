# AGENTS.md

## What this is

Single-page static portfolio site. Three files, no build step, no package manager, no dependencies:

- `index.html` — all content and markup
- `styles.css` — minified-ish, one rule per logical line
- `script.js` — vanilla JS, loaded at end of `<body>`

There is no lint, typecheck, test, or codegen command. Do not add tooling unless asked.

## Preview

Any static server works; there is nothing to build:

```
python3 -m http.server 8000
```

`file://` also works (no fetch/modules), but use a server to test real link + anchor behavior.

## Conventions that are easy to get wrong

- **Progressive enhancement contract**: `script.js` line 1 adds `.js` to `<html>`. All reveal animations are scoped as `.js .reveal` so content is fully visible when JS is off. Never hide `.reveal` unconditionally — that breaks no-JS viewing.
- **`.reveal` / `.on` pattern**: elements animate in via `IntersectionObserver` adding `.on`. New animated blocks must have the `reveal` class in HTML. Stagger delays exist only for `.projects` / `.skills-grid` first 4 children (`:nth-child` in CSS) — new grids need matching delay rules if you want the cascade.
- **Duplicate/stale CSS blocks**: `.reveal` and the `max-width:800px` / `520px` media queries appear twice — an early plain block and a later block that also contains the `.js`-scoped rules, `.menu-toggle`, and `.mobile-menu`. The later block wins. When editing these selectors, update the later block (and consider whether the early one is now dead).
- **Scroll-spy wiring**: `script.js` observes `section[id]` and toggles `.active` on `.nav-links a` and `.mobile-menu a` by matching `href` to `id`. A new section needs: an `id`, an entry in *both* the desktop nav and the mobile menu, and the numbered `sec-tag` label (`01 /` …) kept in sync. Note the mobile menu numbers currently skip `04` (Education has no nav link).
- **Mobile menu state** lives in two places kept in sync: `aria-expanded` on `.menu-toggle` and `.open` on `.mobile-menu`. Toggle/close helpers in `script.js` handle both; Escape and menu-link clicks close it.
- **Focus/hover**: `.project:hover, .project:focus-within` — keep `focus-within` if you touch project card styling (keyboard parity).
- **External links**: always `target="_blank" rel="noopener"`, plus an `aria-label` when the link text isn't self-describing.
- **Reduced motion**: `@media (prefers-reduced-motion:reduce)` disables reveals, pulse, and transitions. Preserve this when changing animations.
- **Fonts** come from the Google Fonts CDN (Space Grotesk, DM Mono) — an offline preview falls back to system fonts; that's expected, not a bug.

## Content structure

All copy lives in `index.html` (hero, proof strip, About, Work projects, Skills, Education, Contact, footer). CSS custom properties in `:root` (`--ink`, `--paper`, `--acid`, `--dark`, `--line`, `--muted`, `--maxw`) drive the palette — use them instead of new hex values.

## Coding agents used by the owner

Catalog of AI coding agents used across projects: Claude Code, Goose, Pi, OpenCode, Agy, Hermes, OpenClaw, GitHub Copilot, Codex, Paperclip. Deepest specialization is in **OpenCode, Hermes, and OpenClaw** — prefer OpenCode conventions here unless told otherwise.

## Hermes cron jobs (external automation, not in this repo)

Four scheduled Hermes jobs run the Trillionir/Sodeom growth loop:

1. **Blog Writer** — searches the web for AI news and publishes posts to https://blogs.thetrillioniar.me/
2. **Video Composer** — reads those blogs, composes a video from them, uploads to https://www.linkedin.com/in/abdulhadi-junaid-485795378/
3. **Pricing Lead Research** — finds startups/companies with AI pricing complaints, researches them, saves the info to a file
4. **Cold Outreach** — reads that companies file and cold-emails leads, pointing them to the self-hosted-models B2B form at https://b2b-sodeom.netlify.app/

Jobs 3 and 4 hand off through the saved companies file — if you touch either, keep the file format compatible with the other.
