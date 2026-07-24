# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Mothership is a landing page / portfolio site for Cole Allen — video editing and social media management for content creators. It's a **plain static HTML/CSS/JS site**: no build step, no package manager, no framework, no dependencies.

## Running it locally

Any static file server works:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`. There is no build, lint, or test command in this repo — there's nothing to compile and no test suite.

## File structure

```
index.html            all page content, section by section
assets/css/style.css  all styling (design tokens as CSS variables at the top)
assets/js/main.js     mobile nav, scroll/reveal animations, contact form, cursor effects
```

Everything lives in these three files — there's no componentization or templating; each `<section>` in `index.html` is a self-contained block of markup styled by matching class names in `style.css`.

## Key conventions

- **CSS variables drive the design**: all colors, fonts, radii, and layout constants are defined once in `:root` at the top of `assets/css/style.css` (e.g. `--bg`, `--accent`, `--font-display`, `--container-w`). Change the look of the site by editing these tokens rather than hunting for hardcoded values throughout the file.
- **`<!-- EDIT ME -->` markers**: placeholder or not-yet-real content (og/twitter meta tags, portfolio placeholder cards, testimonials, footer social links, contact form Formspree ID, status ticker) is flagged inline with `<!-- EDIT ME -->` comments in `index.html`. Search for that string to find everything still left to fill in before the site is truly "live."
- **Behavior is data-attribute driven**: `main.js` wires up behavior by querying `data-*` attributes rather than IDs/classes alone — e.g. `data-count` (count-up stats), `data-tilt` (3D tilt-on-hover cards), `data-magnetic` (buttons that nudge toward the cursor), `data-depth` (hero parallax chips), `data-step`/`data-connector` (roadmap scroll-reveal sequencing), `data-formspree-id` (contact form endpoint). When adding new interactive elements, follow this pattern instead of adding new IDs.
- **Motion is gated behind `wantsMotion`**: cursor effects, magnetic buttons, hero parallax, and tilt cards are all skipped when `prefers-reduced-motion` is set or the device lacks a fine pointer (touch). Respect this gate when adding new hover/motion-driven JS — don't wire new effects outside of it.
- **Contact form**: posts to Formspree via `fetch` if `#contact-form` has a `data-formspree-id`; otherwise shows an inline fallback message. No backend of its own.

## Content-editing workflows (see README.md for full detail)

- **Contact form**: create a Formspree form and set `data-formspree-id` on `<form class="contact-form" id="contact-form">` in `index.html`.
- **Portfolio work**: copy the real `work-card` (Loadedwombat) markup in the "Selected Work" section, fill it in, and drop the `work-card--placeholder` modifier class.
- **Testimonials**: replace placeholder quotes in `.testimonial-card` blocks, or delete the whole `.testimonials` section if unused.
- **Social links**: footer and `.social-dock` links currently point to `href="#"` — update both places when real profile URLs exist.
- **Before going live**: update the `og:url` meta tag once the site has a real domain, so link previews render correctly.

## Deployment

Static site — any static host works with zero build configuration (Vercel/Netlify with repo root as output directory, or GitHub Pages pointed at `main`).

## Claude Code setup in this repo

- `.claude/settings.json` — allowlists read-only/inspection commands (git status/diff/log, the preview server) and denies destructive git/shell commands, plus a SessionStart hook.
- `.claude/hooks/session-start.sh` — runs at session start and reports how many `<!-- EDIT ME -->` placeholders remain in `index.html`.
- `.claude/commands/` — project slash commands mirroring the README workflows: `/preview` (start the local server), `/edit-me` (list outstanding placeholders), `/launch-check` (run the "before going live" checklist).
