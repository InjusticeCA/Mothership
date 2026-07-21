# Mothership

Landing page / portfolio site for Cole Allen — video editing and social media
management for content creators.

Plain static HTML/CSS/JS. No build step, no dependencies, no framework.

## Running it locally

Any static file server works. For example:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Project structure

```
index.html            all page content, section by section
assets/css/style.css  all styling (colors/fonts as CSS variables at the top)
assets/js/main.js     mobile nav toggle, scroll animations, contact form
```

Every section in `index.html` that still needs real content is marked with an
`<!-- EDIT ME -->` comment — search the file for that to find everything left
to fill in.

## Activating the contact form

The form in the "Get In Touch" section doesn't send anywhere yet. The
easiest way to wire it up with no server of your own:

1. Create a free form at [formspree.io](https://formspree.io) and grab its
   form ID (the part after `/f/` in the endpoint they give you).
2. In `index.html`, find the `<form class="contact-form" ...>` tag and set:
   ```html
   <form class="contact-form reveal" id="contact-form" data-formspree-id="YOUR_FORM_ID">
   ```
3. That's it — `assets/js/main.js` already posts to Formspree once an ID is
   present, and shows a fallback message if it isn't.

(Netlify Forms is a fine alternative if you end up hosting on Netlify —
ask if you want that wired up instead.)

## Adding portfolio work

In the "Selected Work" section of `index.html`, there are two placeholder
`<article class="work-card work-card--placeholder">` cards. Copy the
structure of the real Loadedwombat card above them, swap in a title,
description, and a thumbnail/video link, and remove the `--placeholder`
modifier class once it's real.

## Adding testimonials

The "What Clients Say" section is fully placeholder. Replace the quote and
`<cite>` text in each `.testimonial-card`, add more cards by copying the
existing markup, or delete the whole `<section class="testimonials">` block
if you'd rather not show it yet.

## Social links

Footer social links (Instagram/YouTube/TikTok) currently point nowhere
(`href="#"`) — update them in the `<footer>` at the bottom of `index.html`.

## Before going live

- Update the `og:url` meta tag in `<head>` once the site has a real domain,
  so link previews (iMessage, Slack, Twitter/X) show correctly.

## Deploying

This is a static site, so any static host works with zero configuration.
Easiest options:

- **Vercel** / **Netlify**: connect the GitHub repo, no build command needed,
  output directory is the repo root.
- **GitHub Pages**: enable Pages on this repo pointing at the `main` branch
  root.
