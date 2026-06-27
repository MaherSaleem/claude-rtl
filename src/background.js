/*
 * RTLify for Claude — background service worker (Manifest V3).
 * Seeds default settings on install so the extension works out of the box.
 */

// NOTE: importScripts paths are resolved relative to THIS worker file (src/),
// so "constants.js" -> src/constants.js. Do not change it to "src/constants.js".
importScripts("constants.js");

chrome.runtime.onInstalled.addListener(() => {
  const { storageArea, defaults } = RTL_CONFIG;
  chrome.storage[storageArea].get(defaults, (stored) => {
    chrome.storage[storageArea].set({ ...defaults, ...stored });
  });
});
