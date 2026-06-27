/*
 * RTLify for Claude — RTL direction detection.
 *
 * Kept in its own file so the exact logic that ships in the content script is
 * also unit-tested under Node (required as a CommonJS module by the test
 * suite). In the browser it attaches `RTL_DETECT` to the content-script global.
 *
 *   detectDir(text) -> "rtl" | null   (null = no Arabic, leave as-is)
 *
 * Policy: any Arabic in the text makes the element RTL. This matches how
 * readers expect an Arabic message to flow even when it contains English
 * technical terms, URLs, or code (which the browser's bidi algorithm keeps
 * left-to-right inline).
 */

(function (root) {
  "use strict";

  // Arabic-script Unicode blocks. This covers Arabic, Persian/Farsi, Urdu,
  // Pashto, Kurdish, Sindhi and other languages written in the Arabic script:
  //   0600-06FF Arabic
  //   0750-077F Arabic Supplement
  //   08A0-08FF Arabic Extended-A
  //   FB50-FDFF Arabic Presentation Forms-A
  //   FE70-FEFF Arabic Presentation Forms-B
  const RTL_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

  function detectDir(text) {
    return text && RTL_SCRIPT.test(text) ? "rtl" : null;
  }

  const api = { detectDir: detectDir };
  root.RTL_DETECT = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : globalThis);
