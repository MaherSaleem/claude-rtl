# Chrome Web Store listing — source of record

This file is the source of truth for the text on the
[Chrome Web Store listing](https://chromewebstore.google.com/detail/rtlify-for-claude-%E2%80%94-arabi/bfnpdbijenopgolpjameikababikhcie).
The Web Store does **not** pull from GitHub — copy/paste these into the
[Developer Dashboard](https://chrome.google.com/webstore/devconsole) manually.

Chrome Web Store search matches primarily on **title + description text**, so
the native-language blurbs below are what make the extension findable by users
searching in Arabic, Persian, Urdu, Kurdish, and Pashto.

---

## Title — comes from `manifest.json` → `name` (NOT the dashboard)

The store title is **not editable in the dashboard** — it mirrors
`manifest.json` → `name`. To change it you must:
1. edit `name` in `manifest.json`,
2. bump `version`,
3. run `npm run build`,
4. re-upload the ZIP in the Developer Dashboard.

Proposed new `name`:

```
RTLify for Claude — Arabic, Persian & RTL Text Fix
```

- 50 characters. If the store rejects it (some locales cap at ~45), use
  `RTLify for Claude — Arabic, Persian & RTL Fix` (46 chars), or keep the
  current `RTLify for Claude — Arabic & RTL Fix`.
- The title is the single strongest ranking signal — keep the primary keywords
  (Arabic, Persian, RTL, Claude) in the first ~45 characters.

## Short summary (`manifest.json` → `description`, ≤132 chars)

```
Fix Arabic, Persian, Urdu & right-to-left (RTL) text in Claude AI. Open-source, 100% local, no tracking, no data.
```

---

## Full description (dashboard → "Store listing" → Description)

Paste everything below this line into the Description box.

---

Reading Arabic in Claude AI and the text comes out broken, left-aligned, and
hard to follow? **RTLify for Claude fixes right-to-left (RTL) text** so your
conversations read naturally — right to left — the way they should.

It automatically detects Arabic-script text and displays it correctly in
Claude's responses, in your own messages, and in the input box. It works for
**Arabic, Persian/Farsi, Urdu, Pashto, Kurdish, Sindhi**, and any other
Arabic-script language — no setup, it just works.

WHAT IT DOES
• Fixes broken Arabic / RTL text direction in the Claude AI web app (claude.ai)
• Automatic detection — flips paragraphs, lists, headings, tables, and quotes
• Correct mixed text — English words, links, and code stay left-to-right inside
  an RTL sentence, so everything reads naturally
• Code & math stay LTR — code blocks and LaTeX/KaTeX keep their order
• Input box support — the composer and edit box flip as you type (toggleable)
• Keeps up with streaming responses and page navigation
• Works on claude.ai and saved artifact pages (claude.site)
• Simple popup: enable/disable, toggle the input box, choose interface language
  (العربية / English)

PRIVATE BY DESIGN — AND OPEN SOURCE
• 100% local — no analytics, no telemetry, no servers, zero network requests
• Only one permission: storage (to remember your settings)
• Runs only on claude.ai / claude.site — nothing else is touched
• Fully open-source (MIT) — read every line on GitHub:
  https://github.com/MaherSaleem/rtlify-for-claude

Unlike closed-source RTL extensions you have to *trust*, every line here is
public and auditable.

──────────────────────────────

العربية
RTLify إضافة مجانية ومفتوحة المصدر لمتصفح كروم تُصلح اتجاه النص العربي في
Claude AI (كلود). تعرض ردود كلود ورسائلك ومربع الكتابة من اليمين إلى اليسار
تلقائيًا، فيظهر النص العربي بشكل صحيح بدلًا من أن يكون مقلوبًا أو غير مرتّب.
لا تتبّع ولا إرسال للبيانات — كل شيء يعمل محليًا داخل متصفحك. تدعم العربية
والفارسية والأردية والكردية والبشتو وبقية اللغات المكتوبة بالحروف العربية.
كلمات للبحث: إصلاح العربية في كلود، اتجاه النص، يمين لليسار، عربي.

فارسی
RTLify یک افزونه رایگان و متن‌باز برای مرورگر کروم است که جهت متن فارسی و عربی
را در Claude AI (کلود) درست می‌کند. پاسخ‌های کلود، پیام‌های شما و کادر نوشتن را
به‌طور خودکار راست‌چین نمایش می‌دهد تا متن فارسی به‌درستی و خوانا دیده شود، نه
به‌هم‌ریخته و چپ‌چین. بدون ردیابی و بدون ارسال هیچ داده‌ای — همه چیز به‌صورت
محلی در مرورگر شما اجرا می‌شود. کلمات جستجو: فارسی کلود، راست به چپ، اصلاح متن
فارسی، جهت متن.

اردو
RTLify ایک مفت اور اوپن سورس کروم ایکسٹینشن ہے جو Claude AI (کلاؤڈ) میں اردو اور
عربی متن کی سمت درست کرتی ہے۔ یہ کلاؤڈ کے جوابات، آپ کے پیغامات اور لکھنے کے
خانے کو خودکار طور پر دائیں سے بائیں دکھاتی ہے تاکہ اردو متن صحیح اور پڑھنے کے
قابل نظر آئے۔ کوئی ٹریکنگ نہیں، کوئی ڈیٹا نہیں بھیجا جاتا — سب کچھ آپ کے براؤزر
میں مقامی طور پر چلتا ہے۔ تلاش کے الفاظ: کلاؤڈ اردو، دائیں سے بائیں، متن کی سمت۔

کوردی
RTLify پێوەکراوەیەکی خۆڕایی و سەرچاوەکراوەیە بۆ Chrome کە ئاراستەی دەقی کوردی و
عەرەبی لە Claude AI دا ڕاست دەکاتەوە. وەڵامەکانی Claude و نامەکانت و سنووقی
نووسین بە شێوەیەکی خۆکار لە ڕاستەوە بۆ چەپ پیشان دەدات. هیچ شوێنکەوتنێک نییە و
هیچ داتایەک نانێردرێت — هەموو شتێک بە شێوەی خۆماڵی لە وێبگەڕەکەتدا کاردەکات.

پښتو
RTLify د Chrome لپاره یو وړیا او خلاص سرچینه توسیع دی چې په Claude AI کې د پښتو
او عربي متن لوري سموي. د Claude ځوابونه، ستاسو پیغامونه او د لیکلو بکس په اتوماتيک
ډول له ښي څخه کیڼ ته ښیي. هیڅ تعقیب نشته او هیڅ معلومات نه لیږل کیږي — هرڅه ستاسو
په براوزر کې محلي ډول کار کوي.

──────────────────────────────

Not affiliated with, endorsed by, or supported by Anthropic. "Claude" is a
trademark of Anthropic, used here only to describe what the extension works with.
