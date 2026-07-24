---
description: Start a local static server and preview the site
---
This is a static site with no build step. Start a local preview server:

1. Run `python3 -m http.server 8080` in the background (use `run_in_background` if your Bash tool supports it).
2. Tell the user to open http://localhost:8080 in a browser.
3. If port 8080 is already taken, pick another free port and say which one.
