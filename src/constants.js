/*
 * Arabic RTL for Claude — shared configuration.
 *
 * Loaded first in every context (content script, popup, service worker) so the
 * settings keys, their defaults, and the storage area live in exactly one
 * place. Assigned onto `self` so it is reachable as a global in all three:
 *   - content script: listed before content.js in the manifest (same world)
 *   - popup:          <script src="constants.js"> before popup.js
 *   - service worker: importScripts("constants.js")
 */

self.RTL_CONFIG = Object.freeze({
  storageArea: "sync",
  defaults: Object.freeze({
    enabled: true, // master on/off
    inputBoxEnabled: true, // also flip the composer / edit box
    uiLang: "ar", // popup interface language ("ar" | "en")
  }),
});
