/*
 * RTLify for Claude — popup interface strings (Arabic / English).
 *
 * Kept in its own file (like detect.js) so the test suite can `require()` the
 * exact table that ships, instead of scraping it out of popup.js. In the popup
 * it attaches `RTL_STRINGS` to the window; the manifest loads it before popup.js.
 */

(function (root) {
  "use strict";

  const STRINGS = {
    ar: {
      title: "RTLify for Claude",
      tagline: "عرض النصوص من اليمين إلى اليسار في Claude",
      enable: "تفعيل الإضافة",
      enableInput: "تفعيل في مربع الكتابة",
      language: "لغة الواجهة",
      arabic: "العربية",
      english: "English",
      sourceTitle: "اعرض الكود المصدري على GitHub — يعمل محليًا بالكامل، بدون جمع أي بيانات",
      coffeeTitle: "ادعمني بكوب قهوة ☕",
    },
    en: {
      title: "RTLify for Claude",
      tagline: "Show right-to-left text in Claude",
      enable: "Enable extension",
      enableInput: "Enable in the input box",
      language: "Interface language",
      arabic: "العربية",
      english: "English",
      sourceTitle: "View the source code on GitHub — runs fully locally, collects no data",
      coffeeTitle: "Buy me a coffee",
    },
  };

  root.RTL_STRINGS = STRINGS;
  if (typeof module !== "undefined" && module.exports) module.exports = STRINGS;
})(typeof self !== "undefined" ? self : globalThis);
