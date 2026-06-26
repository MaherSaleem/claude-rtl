/*
 * RTLify for Claude — popup logic.
 * Reads/writes settings from chrome.storage.sync and handles the (Arabic /
 * English) interface localization. No network access.
 */

(() => {
  "use strict";

  const { storageArea, defaults } = RTL_CONFIG;
  const STRINGS = RTL_STRINGS; // from strings.js

  const els = {
    html: document.documentElement,
    enabled: document.getElementById("opt-enabled"),
    input: document.getElementById("opt-input"),
    langRadios: Array.from(document.querySelectorAll('input[name="ui-lang"]')),
    version: document.getElementById("version"),
  };

  function applyLanguage(lang) {
    const dict = STRINGS[lang] || STRINGS.ar;
    els.html.setAttribute("lang", lang);
    els.html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    const apply = (attr, set) =>
      document.querySelectorAll("[" + attr + "]").forEach((node) => {
        const value = dict[node.getAttribute(attr)];
        if (value) set(node, value);
      });
    apply("data-i18n", (node, value) => { node.textContent = value; });
    apply("data-i18n-title", (node, value) => { node.setAttribute("title", value); });
  }

  // The "input box" option only makes sense while the extension is on.
  function syncInputAvailability() {
    els.input.disabled = !els.enabled.checked;
  }

  function save(partial) {
    chrome.storage[storageArea].set(partial);
  }

  function init() {
    els.version.textContent = "v" + chrome.runtime.getManifest().version;

    chrome.storage[storageArea].get(defaults, (stored) => {
      const s = {
        enabled: stored.enabled !== false,
        inputBoxEnabled: stored.inputBoxEnabled !== false,
        uiLang: stored.uiLang === "en" ? "en" : "ar",
      };

      els.enabled.checked = s.enabled;
      els.input.checked = s.inputBoxEnabled;
      const radio = els.langRadios.find((r) => r.value === s.uiLang);
      if (radio) radio.checked = true;

      applyLanguage(s.uiLang);
      syncInputAvailability();
    });

    els.enabled.addEventListener("change", () => {
      save({ enabled: els.enabled.checked });
      syncInputAvailability();
    });

    els.input.addEventListener("change", () => {
      save({ inputBoxEnabled: els.input.checked });
    });

    els.langRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        save({ uiLang: radio.value });
        applyLanguage(radio.value);
      });
    });
  }

  init();
})();
