# Growth notes — SEO, ratings & traffic

Plain-English guidance for growing installs. No jargon.

## The one-line diagnosis

Your listing *converts fine* (~half of the people who see it install). The
problem is **not enough people see it** — 152 views in 28 days. So the goal is
**discovery**: help more people find the listing.

## 1. Store search SEO (biggest lever, already done in this PR)

Chrome Web Store search is basically a **text match on your title and
description**. It has no separate "keywords" box — the description *is* the
keyword field. Two rules:

- **Write in the languages your users search in.** An Egyptian user types
  `إصلاح العربية في كلود`, not "fix Arabic in Claude". The native-language
  blurbs in `store-listing.md` are what make you match those searches.
- **Don't keyword-stuff.** Google penalizes spammy repetition. Keywords must sit
  inside real, useful sentences (which the blurbs do).

There is no "GEO" setting to worry about — the store isn't split by country.
Writing in Arabic/Persian/Urdu *is* how you target those regions.

**Action:** paste the new title + description from `store-listing.md` into the
Developer Dashboard. Allow a few days — store search re-indexes, ranking shifts
gradually.

## 2. Ratings = ranking + trust (highest-impact next step)

You have 42 users but **only 1 rating**. Ratings do two things: they rank you
higher in search, and they're the #1 trust signal for a new visitor deciding to
install. Going from 1 → 10+ ratings will likely move the needle more than any
copy change.

How to get them (all policy-safe):
- The popup already has a "review on the Web Store" link (commit f815bac).
  Make sure it's visible — consider a gentle one-time nudge after the extension
  has clearly helped (e.g. after N days of use). *Advice only — not built here.*
- Personally ask early adopters / anyone who's messaged you or starred the repo.
- Post in the communities below and ask for honest feedback (not fake reviews).

**Never** offer anything in exchange for a review — it violates Google policy
and can get the listing removed.

## 3. Where to seed traffic (external)

Post value-first (the RTL problem + the open-source/privacy story), not "install
my thing". Good places, roughly by fit:

- **Reddit:** r/ClaudeAI (directly on-topic), r/artificial, and regional subs
  like r/Egypt, r/iran, r/Pakistan tech threads. Frame it as "I fixed the broken
  Arabic RTL in Claude and open-sourced it."
- **Hacker News — "Show HN":** the open-source, zero-network, MIT, no-build
  angle is exactly what HN rewards. One well-written post can drive a big spike.
- **X / Twitter:** Arabic & Persian dev / AI communities. A short before/after
  clip (once the screenshots are redone — see below) does well here.
- **Telegram / Discord:** Arabic and Persian developer groups, AI-tools groups.
- **Product Hunt:** decent for a launch-day bump; less durable than search SEO.
- **GitHub:** good README (you have one) → shows up in Google web search for
  "Claude Arabic RTL". Consider adding topics/tags to the repo.

Track what works: the analytics "Traffic acquisition" report already shows
Referral vs Organic Search — watch which channel converts.

## 4. Screenshots (recommended follow-up, not in this PR)

Your current before/after screenshots don't sell the value: the "RTL OFF /
before" image already shows text reading correctly right-to-left, so a viewer
can't see what the extension fixes. Redo them so the contrast is unmistakable:

- **Before:** genuinely broken — Arabic left-aligned, punctuation on the wrong
  side, mixed English/Arabic scrambled. This is what users actually see today.
- **After:** clean RTL.
- Put a short caption in Arabic *and* English on each (captions add context and
  look native to your audience).

Screenshots are the biggest *conversion* lever after ratings. Worth a follow-up
once the copy/SEO change is live.

## Priority order

1. **Ship this PR** → paste new title + description into the dashboard.
2. **Ask for ratings** → get from 1 to 10+.
3. **Seed 2–3 communities** (Show HN + r/ClaudeAI + one regional).
4. **Redo screenshots** (follow-up PR).
