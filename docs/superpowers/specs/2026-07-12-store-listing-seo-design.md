# Store Listing SEO & Multilingual Copy — Design

**Date:** 2026-07-12
**Goal:** Grow installs of RTLify for Claude by (1) making the Chrome Web Store
listing discoverable to Arabic-script users searching in their own language, and
(2) advising on external traffic. Prioritized: store copy first, then external
SEO advice.

## Diagnosis (from analytics + live listing)

- **Traffic is the ceiling, not persuasion.** 152 listing views / 28 days.
  Install funnel is healthy (~50% of active users install; 82 users → 41
  installs). So the leverage is in *discovery*, not conversion tweaks.
- **Top countries:** Egypt (18), Iran (14), Israel (6), Saudi Arabia (6),
  Palestine (5), US (5), Germany (4). Arabic-script markets dominate.
- **Listing is 100% English.** Chrome Web Store search is primarily a text match
  on **title + description**. An Egyptian user typing `إصلاح العربية في كلود`
  or an Iranian typing `فارسی کلود` gets no match today. This is the single
  biggest, cheapest SEO fix.
- **Social proof is thin:** 42 users, 5.0★ but only **1 rating**. Ratings and
  install velocity feed ranking. Noted as advice, not in build scope.
- **Screenshots don't sell the value:** the "before (RTL OFF)" screenshot
  already reads correctly RTL, so the broken→fixed contrast is not visually
  obvious. Flagged as a follow-up, not in this scope.

## How Chrome Web Store search works (reference)

- No dedicated keywords field — the **description body IS the keyword field.**
- Title is the strongest single ranking signal (hard limit ~45 chars in some
  locales; keep the primary keywords in the first 45).
- Ratings count + average, and recent install velocity, boost ranking.
- Category matters (currently **Accessibility** — appropriate, keep it).
- Not heavily backlink-driven (unlike Google web search), but external traffic
  that converts to installs raises install velocity, which *does* help ranking.
- Writing native-language text effectively targets those users; the store is not
  geo-partitioned, so language is the targeting lever ("GEO" is not a concept
  here).
- Avoid keyword stuffing — Google penalizes spammy repetition and it reads badly.
  Keywords must appear inside genuinely useful prose.

## Deliverables

### 1. Title (dashboard)
`RTLify for Claude — Arabic, Persian & RTL Text Fix`
- English-only per user choice (cleaner). Adds "Persian" keyword.
- **Char check:** 50 chars. If the dashboard rejects (>45 in the active locale),
  fall back to `RTLify for Claude — Arabic, Persian & RTL Fix` (46) or
  `RTLify for Claude — Arabic & RTL Fix` (current, 37). Verify at paste time.
- Native-script keywords live in the description body, not the title.

### 2. Manifest `description` (repo — `manifest.json`, ≤132 chars, test-enforced)
Keyword-optimized summary line. Must include: Arabic, Persian, Urdu, RTL /
right-to-left, Claude. Stays under 132 (a test enforces this).

### 3. Long store description (paste into dashboard; copy saved in repo)
Saved to `store-assets/store-listing.md` as the source of truth. Structure:
1. **English hook** — one line, primary keywords (Arabic, Persian, Urdu,
   right-to-left / RTL, Claude AI, fix/broken text direction).
2. **Feature bullets** (English) — condensed from README Features.
3. **Native blurbs** — 2–3 sentences each, real value + keyword payload:
   - العربية (Arabic)
   - فارسی (Persian)
   - اردو (Urdu)
   - کوردی (Kurdish)
   - پښتو (Pashto)
4. **Privacy/trust block** — open source, 100% local, no network, `storage`-only.
   The differentiator vs. closed-source rivals.
5. **Natural search-terms line** — common phrasings woven into prose, not a dump.
6. **Links** — GitHub (source/trust), not-affiliated-with-Anthropic disclaimer.

Approved Arabic blurb tone (baseline for the others):
> **العربية:** إضافة مجانية ومفتوحة المصدر تُصلح اتجاه النص العربي في Claude AI
> (كلود). تعرض ردود كلود ورسائلك ومربع الكتابة من اليمين إلى اليسار تلقائيًا،
> بدون أي تتبّع أو إرسال للبيانات — كل شيء محلي داخل متصفحك. تدعم العربية
> والفارسية والأردية والكردية.

### 4. External traffic / ratings / screenshot advice (written summary + repo doc)
- **Ratings:** biggest ranking + conversion lever given only 1 rating. Options:
  ask early adopters directly; add a subtle "rate us" link in the popup (already
  has a store review link per commit f815bac — confirm it's prominent). Never
  incentivize reviews (against Google policy).
- **Where to seed:** relevant subreddits (r/arabs, r/Egypt, r/iran tech threads),
  X/Twitter Arabic dev community, Persian/Urdu dev Telegram/Discord groups,
  Product Hunt, Hacker News (Show HN — the open-source/privacy angle plays well).
  Post value-first (the RTL problem + the open-source trust story), not spam.
- **Screenshots (follow-up):** redo before/after so "broken LTR" vs "fixed RTL"
  is unmistakable; localized screenshot captions add indexed alt context.

## Out of scope (this pass)
- Screenshot/promo-tile redesign (flagged as follow-up).
- Any extension behavior change.
- In-extension ratings prompt implementation (advice only).

## Success criteria
- Listing findable via native-language searches in Arabic/Persian/Urdu.
- Manifest test (`≤132` desc) still passes; `npm run ci` green.
- User has ready-to-paste title + long description + a repo copy of record.
