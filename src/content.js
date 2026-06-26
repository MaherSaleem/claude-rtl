/*
 * RTLify for Claude — content script
 *
 * Detects right-to-left (Arabic-script) text inside Claude AI message content
 * and flips the affected elements to RTL — and, optionally, the composer.
 *
 * Design goals:
 *   - Only touch CONVERSATION content (assistant responses + user messages)
 *     and the input box. The sidebar, top bar and menus are never affected.
 *   - An element that contains RTL text is set to dir="rtl" as a whole, so
 *     Arabic/Persian/Urdu sentences with inline English, URLs or code still
 *     read right-to-left (the browser keeps the LTR runs inline via bidi).
 *   - Keep code, inline code and math (KaTeX) left-to-right via content.css.
 *   - Re-apply continuously as Claude streams responses and swaps views, using
 *     a debounced MutationObserver.
 *   - Everything runs locally. Nothing is read from or sent to the network.
 *
 * Shared settings come from constants.js and detection from detect.js, both
 * loaded by the manifest immediately before this file.
 */

(() => {
  "use strict";

  const detectDir = RTL_DETECT.detectDir; // (text) -> "rtl" | null
  let settings = { ...RTL_CONFIG.defaults };

  // ---- Claude DOM hooks ----------------------------------------------------
  // These class/attribute selectors are the one place tied to Claude's markup;
  // they are the maintenance point if RTL ever stops working after a Claude UI
  // update. Scoping to them is what keeps the sidebar and chrome untouched.
  const RESPONSE_ROOTS = ".font-claude-message, .font-claude-response-body, .standard-markdown";
  const USER_MESSAGE = ".whitespace-pre-wrap.break-words";
  const MESSAGE_SCOPE = RESPONSE_ROOTS + ", " + USER_MESSAGE;

  // Block elements inside a message whose direction we also set individually
  // (for per-paragraph alignment and correct list-marker / table column sides).
  const BLOCK_TAGS = "p, li, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, td, th, summary, figcaption";

  // Everything we may try to flip; applyContentDir() self-guards to MESSAGE_SCOPE.
  const PROCESS_SELECTOR = MESSAGE_SCOPE + ", " + BLOCK_TAGS;

  // Never set direction on these (must stay LTR, or handled separately).
  // The code/math entries here mirror the LTR-isolation rules in content.css —
  // keep the two in sync if you add another element that must stay LTR.
  const SKIP_SELECTOR = "pre, code, .katex, .katex-display, [contenteditable], textarea, input, [data-rtl-skip]";

  // The message composer and the "edit message" box.
  const EDITABLE_SELECTOR = '[contenteditable="true"], textarea';

  // Markers for elements we modified — used to skip redundant writes and to
  // cleanly revert when the extension is disabled.
  const CONTENT_MARK = "data-rtl-dir";
  const INPUT_MARK = "data-rtl-input";

  // ---- Applying direction --------------------------------------------------

  function applyContentDir(el) {
    if (!el || el.nodeType !== 1) return;

    const prev = el.getAttribute(CONTENT_MARK);
    if (prev === null) {
      // First encounter: validate the element is in-scope and not a no-flip
      // zone. Scope/skip status doesn't change later, so we only test once.
      if (el.closest(SKIP_SELECTOR)) return;
      if (!el.closest(MESSAGE_SCOPE)) return;
    }

    const dir = detectDir(el.textContent); // "rtl" | null
    if (!dir) {
      // RTL text disappeared (edited/rewritten block) — undo our change.
      if (prev !== null) {
        el.removeAttribute("dir");
        el.removeAttribute(CONTENT_MARK);
      }
      return;
    }
    if (prev === dir) return; // already correct

    el.setAttribute("dir", dir);
    el.setAttribute(CONTENT_MARK, dir);
  }

  function applyEditorDir(el) {
    if (!el || el.nodeType !== 1) return;
    const text = "value" in el && typeof el.value === "string" ? el.value : el.textContent;
    // While there is text, follow it (a Latin draft reads left-to-right). While
    // the box is empty, leave its direction untouched.
    const dir = detectDir(text) || (text && text.trim() ? "ltr" : null);
    if (!dir) return;
    if (el.getAttribute("dir") !== dir) el.setAttribute("dir", dir);
    if (!el.hasAttribute(INPUT_MARK)) el.setAttribute(INPUT_MARK, "1");
  }

  // Apply `fn` to `root` (an Element) and every descendant matching `selector`.
  function eachMatch(root, selector, fn) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches(selector)) fn(root);
    const nodes = root.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function processTree(root) {
    eachMatch(root, PROCESS_SELECTOR, applyContentDir);
  }

  function processEditors(root) {
    if (!settings.inputBoxEnabled) return;
    eachMatch(root, EDITABLE_SELECTOR, applyEditorDir);
  }

  // ---- Revert --------------------------------------------------------------

  function revert(markAttr) {
    const nodes = document.querySelectorAll("[" + markAttr + "]");
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].removeAttribute("dir");
      nodes[i].removeAttribute(markAttr);
    }
  }

  // ---- Batched processing --------------------------------------------------
  //
  // The observer fires constantly while a response streams. We coalesce work
  // into one animation frame and split it by kind:
  //   - trees:  newly added subtrees -> full scan (structure may be new)
  //   - blocks: text changed in an existing block -> just re-check that block

  let pendingTrees = new Set();
  let pendingBlocks = new Set();
  let frameRequested = false;

  function requestFlush() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(flush);
  }

  function flush() {
    frameRequested = false;
    const trees = pendingTrees;
    const blocks = pendingBlocks;
    pendingTrees = new Set();
    pendingBlocks = new Set();
    if (!settings.enabled) return;
    trees.forEach((node) => {
      processTree(node);
      processEditors(node);
    });
    blocks.forEach(applyContentDir);
  }

  // ---- Observer / listeners ------------------------------------------------

  const observer = new MutationObserver((mutations) => {
    if (!settings.enabled) return;
    let scheduled = false;
    for (const m of mutations) {
      if (m.type === "childList") {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            pendingTrees.add(node); scheduled = true;
          } else if (node.nodeType === 3 && node.parentElement) {
            // An added text node only needs its enclosing block re-checked, not
            // a full subtree scan (this is the common streaming case).
            const block = node.parentElement.closest(PROCESS_SELECTOR);
            if (block) { pendingBlocks.add(block); scheduled = true; }
          }
        }
      } else if (m.type === "characterData") {
        const parent = m.target.parentElement;
        const block = parent && parent.closest(PROCESS_SELECTOR);
        if (block) { pendingBlocks.add(block); scheduled = true; }
      }
    }
    if (scheduled) requestFlush();
  });

  // Live-update the composer as the user types.
  function onInput(e) {
    if (!settings.enabled || !settings.inputBoxEnabled) return;
    const t = e.target;
    if (!t || !t.closest) return;
    const editor = t.matches(EDITABLE_SELECTOR) ? t : t.closest(EDITABLE_SELECTOR);
    if (editor) applyEditorDir(editor);
  }

  // ---- State transitions ---------------------------------------------------

  function applyState() {
    if (!settings.enabled) {
      revert(CONTENT_MARK);
      revert(INPUT_MARK);
      return;
    }
    const root = document.body || document.documentElement;
    processTree(root);
    if (settings.inputBoxEnabled) processEditors(root);
    else revert(INPUT_MARK);
  }

  function start() {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    document.addEventListener("input", onInput, true);

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== RTL_CONFIG.storageArea) return;
      if (!changes.enabled && !changes.inputBoxEnabled) return; // uiLang is popup-only
      if (changes.enabled) settings.enabled = changes.enabled.newValue !== false;
      if (changes.inputBoxEnabled) settings.inputBoxEnabled = changes.inputBoxEnabled.newValue !== false;
      applyState();
    });

    applyState();
  }

  function init() {
    if (!chrome.runtime || !chrome.runtime.id || !chrome.storage) return;
    chrome.storage[RTL_CONFIG.storageArea].get(RTL_CONFIG.defaults, (stored) => {
      if (chrome.runtime.lastError) stored = RTL_CONFIG.defaults;
      settings.enabled = stored.enabled !== false;
      settings.inputBoxEnabled = stored.inputBoxEnabled !== false;
      start();
    });
  }

  init();
})();
