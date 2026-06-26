"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

test("manifest is V3 with the required fields", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.ok(manifest.name, "name");
  assert.ok(manifest.version, "version");
  assert.ok(manifest.description, "description");
});

test("description is within Chrome's 132-character limit", () => {
  assert.ok(
    manifest.description.length <= 132,
    `description is ${manifest.description.length} chars`
  );
});

test("permissions are minimal (storage only, no host_permissions)", () => {
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.ok(!manifest.host_permissions, "should not request host_permissions");
});

test("every file referenced by the manifest exists", () => {
  const files = [];
  for (const p of Object.values(manifest.icons)) files.push(p);
  for (const p of Object.values(manifest.action.default_icon)) files.push(p);
  files.push(manifest.action.default_popup);
  files.push(manifest.background.service_worker);
  for (const cs of manifest.content_scripts) {
    files.push(...(cs.js || []), ...(cs.css || []));
  }
  for (const f of new Set(files)) {
    assert.ok(fs.existsSync(path.join(root, f)), `missing referenced file: ${f}`);
  }
});

test("content script loads constants + detect before content", () => {
  const js = manifest.content_scripts[0].js;
  assert.ok(js.indexOf("src/constants.js") < js.indexOf("src/content.js"), "constants first");
  assert.ok(js.indexOf("src/detect.js") < js.indexOf("src/content.js"), "detect before content");
});

test("content script targets only claude.ai / claude.site", () => {
  for (const pattern of manifest.content_scripts[0].matches) {
    assert.match(pattern, /^https:\/\/(\*\.)?claude\.(ai|site)\/\*$/, pattern);
  }
});

test("icons exist and are valid PNG files for every declared size", () => {
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (const size of [16, 32, 48, 128]) {
    const p = path.join(root, "icons", `icon${size}.png`);
    assert.ok(fs.existsSync(p), `missing icon${size}.png`);
    const head = [...fs.readFileSync(p).subarray(0, 8)];
    assert.deepEqual(head, PNG_SIGNATURE, `icon${size}.png is not a PNG`);
  }
});

test("popup i18n keys are defined in both Arabic and English", () => {
  const html = fs.readFileSync(path.join(root, "src/popup.html"), "utf8");
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-title)?="([^"]+)"/g)) keys.add(m[1]);
  assert.ok(keys.size > 0, "found at least one i18n key in popup.html");

  const popupSrc = fs.readFileSync(path.join(root, "src/popup.js"), "utf8");
  const block = popupSrc.match(/const STRINGS = (\{[\s\S]*?\n {2}\};)/);
  assert.ok(block, "located the STRINGS table in popup.js");
  const STRINGS = eval("(" + block[1].slice(0, -1) + ")");

  for (const lang of ["ar", "en"]) {
    for (const key of keys) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(STRINGS[lang], key),
        `missing i18n key ${lang}.${key}`
      );
    }
  }
});
