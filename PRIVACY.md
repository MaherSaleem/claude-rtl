# Privacy Policy — RTLify for Claude

**Last updated: 2026**

This extension is designed to do as little as possible, locally.

## What it does

It reads the text already shown on `claude.ai` / `claude.site` pages in order to
detect Arabic and set the correct text direction (`dir="rtl"` / `dir="ltr"`) on
those elements. All of this happens inside your browser tab.

## Data collection

**None.** The extension does not collect, store, transmit, or share any
personal data or page content. There are no analytics, no telemetry, no remote
servers, and no network requests of any kind.

## Permissions

- **`storage`** — used only to save your three preferences (extension enabled,
  input-box enabled, interface language) so they persist between sessions. This
  data stays in your browser's extension storage (`chrome.storage.sync`) and is
  synced by Chrome across your own signed-in browsers if you have sync on. It is
  never sent to us — we have no servers.

## Host access

The content script runs only on:

- `https://claude.ai/*` and `https://*.claude.ai/*`
- `https://claude.site/*` and `https://*.claude.site/*`

It does not run on any other site.

## Open source

The complete source code is available in this repository so anyone can verify
exactly what the extension does.

## Contact

Open an issue on the project's GitHub repository for any questions.
