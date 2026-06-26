/*
 * Arabic RTL for Claude — content script
 *
 * Detects Arabic text inside the Claude AI page and flips the affected
 * block elements (and, optionally, the message composer) to right-to-left.
 *
 * Design goals:
 *   - Only touch elements that actually contain Arabic. Anything that is
 *     pure English / UI chrome is left exactly as Claude renders it.
 *   - Keep code, inline code and math (KaTeX) in their natural left-to-right
 *     reading order even inside an RTL paragraph.
 *   - Re-apply continuously as Claude streams responses and as the SPA swaps
 *     views, using a debounced MutationObserver.
 *   - Everything runs locally. Nothing is read from or sent to the network.
 *
 * Shared settings (defaults, storage area) come from constants.js, which the
 * manifest loads immediately before this file.
 */

(() => {
  "use strict";

  let settings = { ...RTL_CONFIG.defaults };

  // ---- Direction detection -------------------------------------------------
  // The detection logic (Arabic Unicode ranges + majority vote) lives in
  // detect.js so it can be unit-tested under Node. The manifest loads it
  // immediately before this file, exposing RTL_DETECT on the shared global.
  //   detectDir(text) -> "rtl" | "ltr" | null
  const detectDir = RTL_DETECT.detectDir;

  // ---- Selectors -----------------------------------------------------------

  // Block-level text containers produced by Claude's markdown renderer.
  // NOTE: "[class*='whitespace-pre-wrap']" is the one Claude-specific hook
  // (it catches user-message bubbles, which are not semantic <p> elements).
  // It is the most likely thing to need maintenance if Claude changes its
  // markup; everything else here is standard HTML and stable.
  const CONTENT_SELECTOR = [
    "p", "li", "ul", "ol",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "dd", "dt", "td", "th", "summary", "figcaption",
    "[class*='whitespace-pre-wrap']",
  ].join(", ");

  // Never set direction on these (handled separately or must stay LTR).
  const SKIP_SELECTOR = "pre, code, .katex, .katex-display, [contenteditable], textarea, input, [data-rtl-skip]";

  // The message composer and the "edit message" box.
  const EDITABLE_SELECTOR = '[contenteditable="true"], textarea';

  // Attributes used to mark elements we have modified, so we can both avoid
  // redundant writes and cleanly revert when the extension is disabled.
  const CONTENT_MARK = "data-rtl-dir";
  const INPUT_MARK = "data-rtl-input";

  // ---- Applying direction --------------------------------------------------

  function applyContentDir(el) {
    if (!el || el.nodeType !== 1) return;

    const prev = el.getAttribute(CONTENT_MARK);
    // The skip-ancestry of a node never changes, so only test it once (before
    // the node has ever been marked). This keeps the per-token streaming path
    // off the relatively expensive closest() ancestor walk.
    if (prev === null && el.closest(SKIP_SELECTOR)) return;

    const dir = detectDir(el.textContent);
    if (!dir) {
      // Arabic disappeared (e.g. an edited or rewritten block). Undo our
      // change so the element returns to Claude's default direction.
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
    // While there is text, follow it (an English draft reads left-to-right).
    // While the box is empty, leave its direction untouched so we never
    // force-flip an empty (or RTL-defaulted) composer.
    const dir = detectDir(text) || (text && text.trim() ? "ltr" : null);
    if (!dir) return;
    if (el.getAttribute("dir") !== dir) el.setAttribute("dir", dir);
    if (!el.hasAttribute(INPUT_MARK)) el.setAttribute(INPUT_MARK, "1");
  }

  // Apply `fn` to `root` and every descendant matching `selector`.
  function eachMatch(root, selector, fn) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches(selector)) fn(root);
    if (root.querySelectorAll) {
      const nodes = root.querySelectorAll(selector);
      for (let i = 0; i < nodes.length; i++) fn(nodes[i]);
    }
  }

  function processTree(root) {
    eachMatch(root, CONTENT_SELECTOR, applyContentDir);
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
  //             (no subtree query needed)

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
          if (node.nodeType === 1) { pendingTrees.add(node); scheduled = true; }
          else if (node.nodeType === 3 && node.parentElement) { pendingTrees.add(node.parentElement); scheduled = true; }
        }
      } else if (m.type === "characterData") {
        const parent = m.target.parentElement;
        const block = parent && parent.closest(CONTENT_SELECTOR);
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
    // Bail if the extension context is gone (e.g. reloaded/updated).
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
