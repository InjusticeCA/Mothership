#!/usr/bin/env bash
# Orients a fresh Claude Code session: this is a static site with no build/test
# tooling, so the useful signal at session start is how much placeholder
# content is still left to fill in (see README.md).
count=$(grep -c '<!-- EDIT ME' index.html 2>/dev/null || echo 0)
context="Static HTML/CSS/JS site, no build step or dependencies. ${count} outstanding <!-- EDIT ME --> placeholder(s) remain in index.html (run /edit-me for the list, or see README.md). Preview locally with: python3 -m http.server 8080"
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$context"
