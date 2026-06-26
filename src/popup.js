/*
 * Arabic RTL for Claude — popup logic.
 * Reads/writes settings from chrome.storage.sync and handles the (Arabic /
 * English) interface localization. No network access.
 */

(() => {
  "use strict";

  const { storageArea, defaults } = RTL_CONFIG;

  const STRINGS = {
    ar: {
      title: "Arabic RTL for Claude",
      tagline: "عرض النص العربي من اليمين إلى اليسار في Claude",
      enable: "تفعيل الإضافة",
      enableInput: "تفعيل في مربع الكتابة",
      language: "لغة الواجهة",
      arabic: "العربية",
      english: "English",
      openSource: "مفتوح المصدر على GitHub",
      sourceTitle: "اعرض الكود المصدري على GitHub — يعمل محليًا بالكامل، بدون جمع أي بيانات",
    },
    en: {
      title: "Arabic RTL for Claude",
      tagline: "Show Arabic text right-to-left in Claude",
      enable: "Enable extension",
      enableInput: "Enable in the input box",
      language: "Interface language",
      arabic: "العربية",
      english: "English",
      openSource: "Open source on GitHub",
      sourceTitle: "View the source code on GitHub — runs fully locally, collects no data",
    },
  };

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
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (dict[key]) node.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      const key = node.getAttribute("data-i18n-title");
      if (dict[key]) node.setAttribute("title", dict[key]);
    });
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
