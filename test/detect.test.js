"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { detectDir } = require("../src/detect.js");

test("pure Arabic -> rtl", () => {
  assert.equal(detectDir("مرحبا كيف حالك"), "rtl");
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

test("Arabic majority with an embedded English word -> rtl", () => {
  assert.equal(detectDir("استخدم function في الكود"), "rtl");
});

test("Latin-majority mixed text -> ltr", () => {
  assert.equal(detectDir("السلام function map filter reduce return const value array"), "ltr");
});

test("Arabic with a Latin acronym -> rtl", () => {
  assert.equal(detectDir("كلاود AI رائع"), "rtl");
});

test("Arabic presentation forms are detected -> rtl", () => {
  // U+FE8D ARABIC LETTER ALEF ISOLATED FORM, etc.
  assert.equal(detectDir("ﺍﺎﺠ"), "rtl");
});

test("non-Arabic accented Latin stays untouched -> null", () => {
  assert.equal(detectDir("¿Cómo estás?"), null);
});
