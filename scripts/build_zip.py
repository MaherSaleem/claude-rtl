#!/usr/bin/env python3
"""Package the extension into a ZIP for the Chrome Web Store.

There is no build/transpile step — the extension is plain HTML/CSS/JS. This
just bundles the runtime files (manifest, src/, icons/, LICENSE) into a clean
ZIP, excluding dev-only files (tests, CI, docs, this script). Pure standard
library, no dependencies.

Output: dist/rtlify-for-claude-v<version>.zip
"""

import json
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Only what the browser needs to run the extension.
INCLUDE_FILES = ["manifest.json", "LICENSE"]
INCLUDE_DIRS = ["src", "icons"]


def collect():
    members = []
    for rel in INCLUDE_FILES:
        full = os.path.join(ROOT, rel)
        if os.path.exists(full):
            members.append((full, rel))
    for d in INCLUDE_DIRS:
        for base, _dirs, files in os.walk(os.path.join(ROOT, d)):
            for fn in files:
                full = os.path.join(base, fn)
                members.append((full, os.path.relpath(full, ROOT)))
    return sorted(members, key=lambda m: m[1])


def main():
    with open(os.path.join(ROOT, "manifest.json"), encoding="utf-8") as f:
        version = json.load(f)["version"]

    dist = os.path.join(ROOT, "dist")
    os.makedirs(dist, exist_ok=True)
    out = os.path.join(dist, f"rtlify-for-claude-v{version}.zip")

    members = collect()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for full, rel in members:
            z.write(full, rel)

    size = os.path.getsize(out)
    print(f"Created {os.path.relpath(out, ROOT)}  ({len(members)} files, {size} bytes)")
    for _full, rel in members:
        print("  ", rel)


if __name__ == "__main__":
    main()
