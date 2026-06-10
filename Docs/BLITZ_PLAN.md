# RecollectKits — World Cup Blitz Plan

> **This is the source of truth.** Lives at `Docs/BLITZ_PLAN.md` in the repo.
> **Claude Code:** read this at the start of every session; at the end of every session, check off completed items and append a dated entry to the Progress Log below. If a date slips, move the item — never delete it.
> **Founder:** strategy changes, replans, and decisions route through the Claude.ai planning thread; execution routes through Claude Code with this doc open.

**Created:** June 10, 2026 (eve of the World Cup opener)
**Mode:** Maximum velocity. ~25–30 hrs/week, founder + Claude Code.
**The window:** World Cup runs June 11 – July 19 (final at MetLife). Kit attention peaks now and stays elevated through late July.

## The three dates

| Milestone | Target | Tournament moment |
|---|---|---|
| **Waitlist capture live** | June 11 (tomorrow) | Opening match — attention begins |
| **Closed beta** | June 26 | Knockout rounds begin — drama peaks |
| **Public launch** | Week of July 20 | 48–72 hrs after the final, peak afterglow |

The strategy in one line: *capture attention now with the waitlist, convert the most engaged into beta testers mid-tournament, launch publicly into the post-final emotional hangover when everyone wishes the World Cup wasn't over — and a kit collection is how you keep it.*

**Calendar constraint built in:** founder is camping June 14–18. The plan frontloads all decisions and queues autonomous Claude Code work before departure; nothing requires founder hours during those five days.

---

## TONIGHT (June 10) — 2–3 hours

**Security (non-negotiable before any traffic):**
- [x] `DROP VIEW public.pending_accounts;` in production *(done 6/10 — `sprint0_security_remediation.sql`)*
- [x] Revoke anon EXECUTE on the 13 SECURITY DEFINER functions *(done 6/10 — 8 revoked + trigger fn fully locked; 5 kept anon-executable by design: `get_public_profile`, `get_public_profile_stats`, `get_public_collections`, `get_top_3_jerseys` (OG/public-profile paths), `is_admin_user` (used in RLS policies))*
- [ ] ~~Enable leaked-password protection~~ **Blocked: Supabase Pro-only feature; not on Pro plan. Accepted risk for now — revisit if/when upgrading Supabase plan.**
- [x] Re-run Supabase advisors — confirm both ERROR findings cleared *(done 6/10 — zero ERROR findings; `auth_users_exposed` + `security_definer_view` gone; anon-definer WARNs 13→5, all intentional)*

**Marketing prep (30 min):**
- [x] Confirm waitlist flow works end-to-end (api/waitlist.js → Resend confirmation) *(done 6/10 — live prod test, confirmation email verified in inbox; send-failure bug fixed; signups now also stored in `waitlist_signups` table with interest segment for beta targeting; email copy now teases beta invites)*
- [ ] Draft tomorrow's posts: personal IG + LinkedIn + collector Discords. Angle: "The World Cup starts today. I'm building the home for the kits we'll remember it by. Waitlist open." Keep it founder-voice, not ad-voice.

---

## PRE-CAMP PUSH — June 11–13 (Thu/Fri evenings + a full Saturday)

*Goal: every decision made, the build started, every autonomous task queued, marketing on autopilot — so the camping days cost zero momentum. The Saturday before departure is the gift here: a full build block.*

### Thu June 11 (opener day)
- [ ] **Post the waitlist push** in the morning (opener traffic peaks early)
- [ ] Evening: finish Sprint 0 — tighten 5 permissive RLS policies, dedupe legacy policies, Postgres upgrade, partner_applications review
- [ ] Capture live schema as baseline migration; commit; SQL-editor moratorium begins

### Fri June 12 — **the design night (most important pre-camp task)**
- [ ] **Catalog-first add flow design session.** One page of decisions: search-first UI, found/not-found paths, uncataloged state and badge, approval-linkage behavior, edge cases (duplicate adds, kit edited while pending). Done tonight, tomorrow is pure execution.
- [ ] Claude Code in parallel: `invite_codes` table + signup validation + per-channel batch generator

### Sat June 13 (full build day before departure)
- [ ] Morning: remove manual-approval gate from signup; standard email verification on; strip "24–48 hours" copy; deploy
- [ ] **Catalog-first build, head start:** found path — search-first "Find your kit" entry point → one-click add → instant `user_jerseys` write. Stretch goal if it's flowing: start the not-found path.
- [ ] **Launch the autonomous Claude Code batch — all as PRs, nothing merges to prod unattended:**
  - (a) Wikidata import script (48 World Cup nations + EPL + MLS), run against a branch/staging dataset for review
  - (b) Sentry wiring
  - (c) `all_kits_public` default→false migration + existing-row audit
  - (d) Product-analytics event scaffolding (signup → first kit → 5 kits → share)
  - (e) Photo compression + EXIF-strip utility
- [ ] **Schedule social posts for June 14–18** (group-stage kit content, 1/day) via Meta scheduler/Buffer — the brand stays alive while you're gone
- [ ] Pack. Leave the laptop home if you can stand it.

---

## CAMPING — Sun June 14 – Thu June 18 (zero obligations)

- Waitlist accrues from opener-week buzz + scheduled posts
- Claude Code PRs sit awaiting review — by design, nothing self-merges
- Optional, signal permitting: glance at waitlist numbers or nudge a Claude Code task from the mobile app. Optional means optional — the plan needs nothing from these five days. Catch fish.

---

## RETURN SPRINT — June 19–25 (the compressed Week 1+2)

### Fri June 19 — merge day
- [ ] Review and land the autonomous batch PRs (invite codes, Sentry, analytics, privacy migration, photo utils)
- [ ] Run the Wikidata import against prod; review pass on aliases/duplicates

### Sat June 20 (big block) — catalog-first build, continued
- [ ] Finish the not-found path (started June 13 if the stretch goal landed): wizard writes `user_jerseys` immediately (uncataloged) + queues `jersey_submissions`
- [ ] Approval linkage: admin approval links canonical record back without touching user data
- *(Design decided June 12, found path built June 13 — this should be the back half, not the whole thing.)*

### Sun June 21 (big block) — catalog-first wrap + onboarding
- [ ] Collection views render uncataloged kits + subtle pending badge; full wizard regression test
- [ ] Guided first-kit onboarding (reuses search-first add); surface bulk import at signup

### Mon June 22
- [ ] Metadata fields: condition scale v0, match-worn/signed/player-issue flags, acquisition price/date
- [ ] Activation funnel dashboard live; empty-state sweep

### Tue June 23 — QA day
- [ ] Cross-device pass (iPhone Safari / Android Chrome / desktop); funnel walk-through ×5 fresh accounts; fix list triaged same-day
- [ ] Seed-data check: typical collector finds ≥80% of their clubs? Backfill gaps.

### Wed June 24
- [ ] Fix-list burn-down
- [ ] **Beta recruitment:** personal invites to 15–25 collectors (hottest waitlist signups + collector circles + Josh); founder-status decided ("founding collector" — free Pro for life or steep lifetime discount, decide now, honor forever)
- [ ] Feedback channel live (small Discord recommended — doubles as community seed)

### Thu June 25 — buffer day. Something from QA will need it.

### Fri June 26 — 🚀 **CLOSED BETA OPENS**
- [ ] Codes out in the morning; watch the activation dashboard live; personal note to each tester — first-48-hours feedback is gold


---

## WEEKS 3–5 — Beta runs, billing builds (June 27 – July 12)

*Beta needs calendar time, not your hours — so your hours go to Stripe.*

**Billing track (the critical path to launch):**
- [ ] Week 3: entitlements model + Stripe products/Checkout/customer portal/webhook handler (signature-verified) + entitlement sync; also sweep the small deferred item — promote hardcoded manufacturers/competitions arrays to reference tables
- [ ] Week 3–4: server-side tier limits as triggers/RPCs (15 kits / 3 photos / 3 collections); upgrade prompts at all three walls; **finalize prices, remove comingSoon**
- [ ] Week 4: wire dormant Resend templates (confirm/expiring/dunning); founder-badge entitlement logic; downgrade behavior = read-only never delete
- [ ] Week 5: real-money gauntlet — subscribe/cancel/downgrade/failed-card cycles until boring

**Beta care (≤30 min/day):** triage feedback, ship small fixes continuously, one mid-beta "what's changed" note to testers (~July 3).

**Structured feedback (the quiet testers matter as much as the loud ones):**
- [ ] **Mid-beta pulse (~July 3, 5 questions, 2 min):** sent with the "what's changed" note. (1) Did you find your clubs/kits in the catalog — what was missing? (2) Anything confusing or broken in adding kits? (3) **Pricing:** "Pro will include [unlimited kits, analytics, …] — what feels fair monthly: $4 / $6 / $8 / $10+?" plus annual interest. (4) What's the one thing you'd add before public launch? (5) Have you shown this to anyone — why/why not? → *Question 3 feeds directly into the week-3–4 "finalize prices" task; this is the only pricing data you'll get before committing.*
- [ ] **End-of-beta survey (July 10–11, ~10 questions, 5 min):** the PMF question ("How disappointed if you could no longer use RecollectKits: very / somewhat / not" — Sean Ellis benchmark, ≥40% "very" is the signal); NPS + why; feature-by-feature usefulness rating (catalog, collections, profile, dashboard, sharing); top frustration; would-you-pay restated against the now-real price; what would make you tell a collector friend; permission to quote for launch testimonials. → *Results land before week 6 so the top fixes make the hardening sprint, and the testimonial harvest feeds launch assets.*
- [ ] Survey tooling: Tally or Google Forms — zero build, link in email + Discord; personal nudge to non-responders (15–25 people means every response counts)

**Marketing beat (1–2 posts/week, tournament-pegged):** knockout-round kit moments, "kit of the tournament" engagement bait, behind-the-build founder posts. Waitlist keeps growing — second batch of beta codes ~July 1 if capacity allows.

---

## WEEK 6 — Launch hardening (July 13–19, semifinals → final)

- [ ] **Beta triage:** end-of-beta survey results + Discord/notes synthesized → fix the top recurring issues, deliberately defer the rest; pull launch testimonials from permissioned quotes
- [ ] Sharing surface: kit/collection OG meta (extend existing middleware pattern), dynamic profile OG image, social cards v1, collection slugs, real unfurl tests (X/Discord/Slack/iMessage)
- [ ] Legal close-out: account deletion/export path, DMCA agent registration (~$6, 10 min), FAQ page, trademark posture doc, consent decision recorded
- [ ] Dashboard-only confirmations: PITR/backups + restore drill, dev project split, Resend domain, uptime monitor
- [ ] QA gauntlet: messy CSVs ×3, 100+ kit load check, RLS re-verify, Lighthouse
- [ ] Launch assets finalized: LinkedIn, IG, r/SoccerJerseys (community-rules compliant), founding-collector shoutouts
- [ ] **Decision:** open signup at launch vs. invite-codes-as-scarcity for week one

### Sun July 19 — **the final.** Don't work. Watch it. Post something human about it from the brand account.

---

## 🚀 LAUNCH — Mon/Tue July 20–21

The pitch writes itself: *"The World Cup is over. Your kits are how you keep it."* Every person who bought a shirt in the last six weeks is the exact user, at the exact moment.

- [ ] Billing live with ≥1 real transaction completed
- [ ] Advisors clean, zero critical bugs
- [ ] Activation metric green across late-beta cohort
- [ ] Phase 2 kickoff doc drafted (Josh/Retro Screamers first conversation scheduled)

---

## OUTREACH TRACK — the right people at the right moments

*Runs alongside the build. Each tier gets the version of the product that matches what their input is worth.*

| When | Who | The ask | Why this moment |
|---|---|---|---|
| **Pre-camp (June 11–13)** | TikTok creators on the list, key collector contacts | No ask. Warm DM: "building this, World Cup waitlist live, thought of you." | Costs 30 min; converts launch-week outreach from cold pitch to follow-up |
| **Beta open (June 26)** | 15–25 collectors + **Josh (as a collector, not a vendor)** | Founding-collector beta code + personal note | They judge the core: cataloging feel, catalog depth, metadata fit. Josh experiences the product as a user — the Phase 2 vendor pitch later becomes "you've seen it" |
| **Mid-beta (~July 3)** | 2–3 most-trusted creators | Beta codes + "tell me what would make you post this" | Lands exactly as Sprint 4 (social cards, unfurls) is built — creators are the best QA for shareability that exists |
| **Launch week (July 20–21)** | Full creator list | Launch assets + founding-collector shoutouts + personal codes if scarcity model chosen | Finished product, finished share surfaces, peak post-final attention |
| **Post-launch (Aug)** | Josh — the vendor conversation | Phase 2 partner rack / attribution walkthrough | After he's a happy user, with real traffic numbers to show |

**Decide on purpose (June 13, before camping):** creators leak by profession — a beta code is a soft reveal. Either restrict to creators you trust to hold it, or embrace organic "I'm testing something" teasers as free pre-launch buzz. Both are valid; drifting into it isn't.

- [ ] Pre-camp warm DMs sent (June 11–13)
- [ ] Creator-leak posture decided (June 13)
- [ ] Mid-beta creator codes out (~July 3)
- [ ] Launch-week creator push assets ready (week 6)

---

## Scope discipline (the cut list — touching these before July 21 is self-sabotage)

Per-kit privacy toggle · comments/moderation · collector archetype + gap analysis · browse-by-club SEO pages · bulk edit · activity feed · day-3/7 email sequences · StorySplat spike (slide to August — the partnership isn't going anywhere) · any Phase 2+ feature, however tempting mid-tournament.

## Honest risk register

1. **The day job + the return-sprint crunch.** June 19–25 is now the densest stretch of the plan, with zero slack before it (camping) and one buffer day inside it. If it cracks, slip beta to June 29/30 — *not* the launch date; compress beta instead.
2. **Catalog-first rework scope creep.** It's 3 days of building only if Friday's design session actually decides things. Undecided design = a week lost.
3. **Stripe edge cases.** The gauntlet in Week 5 is the only schedule item you must never trim. Slip launch by a week before you slip billing QA.
4. **Burnout.** Six weeks at 30 hours on top of full-time is sprint-finish territory, not a lifestyle. The July 19 rest day is in the plan on purpose.

---

## Progress Log

*Appended by Claude Code at the end of each working session: date · what shipped · what slipped · decisions made.*

- **2026-06-10:** Plan created. Sprint 0 security items begin tonight.
- **2026-06-10 (waitlist):** Waitlist e2e verified against prod (test signup → confirmation email received). Shipped: send-failure bug fix in api/waitlist.js; `waitlist_signups` table migration (insert-only RLS, admin-read) capturing email/first_name/interest for June 24 beta targeting; beta-invite tease added to confirmation email. Decisions: one waitlist for both beta and launch — no separate beta funnel; invite codes (June 12) handle conversion. Launch-post drafts delivered for founder edit. Migration applied to prod + deployed via push; verified live end-to-end (test row + first real signup captured with interest segment).
- **2026-06-10 (later):** Security block done. Shipped: `pending_accounts` view dropped in prod (founder pasted `sprint0_security_remediation.sql` via SQL editor — MCP still read-only); anon EXECUTE revoked on 8 SECURITY DEFINER functions + trigger fn locked to owner; advisors re-run clean — **both ERROR findings cleared, zero ERRORs remain**. Decisions: (1) kept 5 functions anon-executable on purpose (public-profile/OG read paths + `is_admin_user` used in RLS) — these stay as accepted WARNs; (2) leaked-password protection is Supabase Pro-only → accepted risk, revisit on plan upgrade. Slipped: nothing. Remaining tonight: waitlist end-to-end check + launch-post drafts.
