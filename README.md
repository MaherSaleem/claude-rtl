# Arabic RTL for Claude

> Make Arabic text display **right-to-left** in [Claude AI](https://claude.ai) —
> in responses, in your messages, and in the input box.

**Repository:** https://github.com/MaherSaleem/claude-rtl
**License:** [MIT](LICENSE) · **Manifest:** V3 · **Dependencies:** none

A small, **fully open-source** Chrome/Chromium extension (Manifest V3, vanilla
JavaScript — no build step, no bundler, no libraries). It exists because the
popular closed-source RTL extensions can't be audited: you have to *trust* that
they don't read or exfiltrate your conversations. This one is different — every
line is here for you to read. It runs **entirely in your browser**, requests
only the `storage` permission, and **never makes a single network request**.

> 🟢 **Why you can trust it:** it's open source (read the code below), runs 100%
> locally, collects nothing, and only touches `claude.ai` / `claude.site`.
> See [PRIVACY.md](PRIVACY.md).

---

## Table of contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Install](#install-load-unpacked)
- [Usage & settings](#usage--settings)
- [Privacy & permissions](#privacy--permissions)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Development](#development)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Automatic Arabic detection.** Scans block-level text and flips paragraphs,
  lists, headings, tables, and quotes to RTL when they contain Arabic.
- **Non-intrusive.** Only elements that actually contain Arabic are touched —
  pure-English content and Claude's own UI are left exactly as they are.
- **Code & math stay LTR.** Code blocks, inline code, and LaTeX/KaTeX math keep
  their natural left-to-right reading order even inside an Arabic paragraph, so
  formulas and snippets don't break.
- **Input box support.** The message composer and the *edit-message* box flip
  direction live as you type (can be toggled off).
- **Keeps up with streaming.** A debounced `MutationObserver` re-applies RTL as
  Claude streams responses and as you navigate the single-page app.
- **Artifacts.** Works on `claude.ai` and saved artifact pages (`claude.site`).
- **Simple popup.** Enable/disable the whole extension, toggle the input box,
  and choose the interface language (العربية / English).
- **Zero data, zero network.** Nothing is collected or sent anywhere.

## Screenshots

> _(Add screenshots of the popup and an Arabic conversation here.)_

## Install (load unpacked)

Until it's published on the Chrome Web Store, install it manually — it takes a
minute:

1. **Download the code:**
   ```bash
   git clone https://github.com/MaherSaleem/claude-rtl.git
   ```
   (or download the ZIP from GitHub and unzip it).
2. Open `chrome://extensions` in Chrome / Edge / Brave / any Chromium browser.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the project folder — the one that
   contains `manifest.json`.
5. Open [claude.ai](https://claude.ai) and chat in Arabic. 🎉

To update later: `git pull`, then click the **Reload** ↻ icon on the extension
card.

## Usage & settings

Click the extension's toolbar icon to open the popup:

| Setting | Default | What it does |
| --- | --- | --- |
| **تفعيل الإضافة** / *Enable extension* | On | Master switch. When off, the page is left completely untouched and any changes are reverted. |
| **تفعيل في مربع الكتابة** / *Enable in the input box* | On | Also flips the composer and the edit-message box based on what you type. |
| **لغة الواجهة** / *Interface language* | العربية | Language of the popup itself (Arabic or English). Does not affect detection. |

Settings are saved via `chrome.storage.sync`, so they persist and follow you
across browsers where you're signed in.

## Privacy & permissions

- **100% local.** No analytics, no telemetry, no remote servers, **no network
  requests of any kind.**
- **One permission:** `storage` — used solely to remember your three settings.
- **Host access:** the content script runs **only** on `https://claude.ai/*`,
  `https://*.claude.ai/*`, `https://claude.site/*`, and `https://*.claude.site/*`.

Full details in [PRIVACY.md](PRIVACY.md). And because it's open source, you don't
have to take any of this on faith — read [`src/content.js`](src/content.js).

## How it works

1. [`src/content.js`](src/content.js) walks block-level text elements and counts
   Arabic vs. Latin characters in each.
2. Elements that contain Arabic get `dir="rtl"` (or `dir="ltr"` when Latin
   dominates a mixed block); elements with no Arabic are left alone.
3. [`src/content.css`](src/content.css) handles alignment and wraps code/math in
   `unicode-bidi: isolate` so they stay LTR inside RTL text.
4. A `MutationObserver` — batched with `requestAnimationFrame` and split into
   "new subtree" vs. "text changed in an existing block" work — re-applies all
   of this efficiently while responses stream in.

Direction is decided by a simple majority vote of strong characters, so mostly
Arabic paragraphs go RTL and mostly Latin ones stay LTR. The only Claude-specific
markup hook is a class match for user-message bubbles; everything else relies on
standard HTML and degrades gracefully if Claude changes its UI.

## Project structure

```
manifest.json            Manifest V3 definition
src/
  constants.js           shared settings (defaults + storage area) — one source of truth
  detect.js              Arabic direction detection (unit-tested, shared with content.js)
  content.js             DOM scanning + applies direction (the core)
  content.css            alignment + code/math isolation
  background.js          seeds default settings on install
  popup.html             popup markup
  popup.css              popup styling
  popup.js               popup logic + Arabic/English localization
icons/                   generated PNG icons (16/32/48/128)
scripts/
  make_icons.py          regenerates the icons (pure Python, no dependencies)
test/                    Node test suite (detection + manifest validation)
.github/workflows/ci.yml CI: syntax check + tests on every push / PR
PRIVACY.md               privacy policy
LICENSE                  MIT
```

## Development

There is **no build step** — it's plain HTML/CSS/JS loaded directly by the
browser.

- Edit any file, then click **Reload** ↻ on the extension card in
  `chrome://extensions`.
- Regenerate the icons after changing the design:
  ```bash
  npm run icons     # python3 scripts/make_icons.py
  ```

### Packaging for the Chrome Web Store

There is no transpile/bundle step. To produce the upload-ready ZIP (just the
runtime files — `manifest.json`, `src/`, `icons/`, `LICENSE`):

```bash
npm run build     # -> dist/arabic-rtl-for-claude-v<version>.zip
```

Then upload that ZIP in the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
Bump `"version"` in `manifest.json` before each store release.
### Tests & CI

The project has a small, dependency-free test suite that runs on Node's
built-in test runner — no `npm install` needed:

```bash
npm run check   # node --check on every JS file (syntax/lint gate)
npm test        # unit tests: Arabic detection + manifest validation
npm run ci      # both of the above (what CI runs)
```

[GitHub Actions](.github/workflows/ci.yml) runs `npm run check`, `npm test`,
and regenerates the icons on **every push and pull request**, so changes are
verified before they're merged. (Tip: enable branch protection on `main` and
require the **CI** check to make it a hard gate.)

## FAQ

**Does it send my chats anywhere?**
No. It makes zero network requests. The only data it stores is your three
settings, locally.

**Why does some mixed Arabic/English text stay left-to-right?**
Direction is decided by which script has more characters in a block. A block
with mostly English (e.g. a long code-heavy line) stays LTR by design.

**It stopped flipping after a Claude update — what now?**
Claude occasionally changes its markup. Open an issue and it can be fixed;
because it's open source, anyone can patch the selector.

## Contributing

Issues and pull requests are welcome on
[GitHub](https://github.com/MaherSaleem/claude-rtl). This is a small, dependency-free
codebase that's easy to read and hack on.

## License

[MIT](LICENSE). This is an independent project and is **not** affiliated
with, endorsed by, or supported by Anthropic. "Claude" is a trademark of
Anthropic; it is used here only to describe what the extension works with.
