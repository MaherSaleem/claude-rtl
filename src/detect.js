/*
 * Arabic RTL for Claude — Arabic direction detection.
 *
 * Kept in its own file so the exact logic that ships in the content script is
 * also unit-tested under Node (required as a CommonJS module by the test
 * suite). In the browser it attaches `RTL_DETECT` to the content-script global.
 *
 *   detectDir(text) -> "rtl" | "ltr" | null   (null = no Arabic, leave as-is)
 */

(function (root) {
  "use strict";

  // Arabic Unicode blocks:
  //   0600-06FF Arabic
  //   0750-077F Arabic Supplement
  //   08A0-08FF Arabic Extended-A
  //   FB50-FDFF Arabic Presentation Forms-A
  //   FE70-FEFF Arabic Presentation Forms-B
  const ARABIC_RANGE = "\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF";
  const ARABIC_TEST = new RegExp("[" + ARABIC_RANGE + "]");
  const ARABIC_COUNT = new RegExp("[" + ARABIC_RANGE + "]", "g");
  const LATIN_COUNT = /[A-Za-z]/g;

  function countMatches(text, re) {
    const m = text.match(re);
    return m ? m.length : 0;
  }

  // Decide direction by a majority vote of strong characters. Returns null
  // when the text has no Arabic at all, so the caller leaves the element alone.
  function detectDir(text) {
    if (!text || !ARABIC_TEST.test(text)) return null;
    const arabic = countMatches(text, ARABIC_COUNT);
    const latin = countMatches(text, LATIN_COUNT);
    return arabic >= latin ? "rtl" : "ltr";
  }

  const api = { detectDir: detectDir };
  root.RTL_DETECT = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : globalThis);
