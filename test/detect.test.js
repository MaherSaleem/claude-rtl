"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { detectDir } = require("../src/detect.js");

test("pure Arabic -> rtl", () => {
  assert.equal(detectDir("مرحبا كيف حالك"), "rtl");
});

test("Persian / Farsi -> rtl", () => {
  assert.equal(detectDir("سلام دنیا چطوری"), "rtl");
});

test("Urdu -> rtl", () => {
  assert.equal(detectDir("ہیلو دنیا"), "rtl");
});

test("pure English -> null (left untouched)", () => {
  assert.equal(detectDir("Hello world"), null);
});

test("empty string -> null", () => {
  assert.equal(detectDir(""), null);
});

test("null / undefined -> null", () => {
  assert.equal(detectDir(null), null);
  assert.equal(detectDir(undefined), null);
});

test("digits and punctuation only -> null", () => {
  assert.equal(detectDir("123 + 456 = 579!"), null);
});

test("RTL text with many inline English terms -> rtl (not majority-vote)", () => {
  // The key fix: an Arabic sentence full of English technical words must
  // still be RTL, not left-aligned.
  assert.equal(
    detectDir("Conductor هو أداة تخليك تشغّل Claude Code وCodex بالتوازي عبر workspace و branch منفصل"),
    "rtl"
  );
});

test("mostly English with a single Arabic word -> rtl", () => {
  assert.equal(detectDir("the value is مرحبا"), "rtl");
});

test("Arabic presentation forms are detected -> rtl", () => {
  assert.equal(detectDir("ﺍﺎﺠ"), "rtl");
});

test("non-Arabic accented Latin stays untouched -> null", () => {
  assert.equal(detectDir("¿Cómo estás?"), null);
});
