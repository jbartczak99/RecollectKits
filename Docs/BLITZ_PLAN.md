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
- [x] Draft tomorrow's posts: personal IG + LinkedIn + collector Discords. Angle: "The World Cup starts today. I'm building the home for the kits we'll remember it by. Waitlist open." Keep it founder-voice, not ad-voice. *(done 6/10 — drafts finished night before opener)*

---

## PRE-CAMP PUSH — June 11–13 (Thu/Fri evenings + a full Saturday)

*Goal: every decision made, the build started, every autonomous task queued, marketing on autopilot — so the camping days cost zero momentum. The Saturday before departure is the gift here: a full build block.*

### Thu June 11 (opener day)
- [x] **Post the waitlist push** in the morning (opener traffic peaks early) *(done 6/11 — all channels posted)*
- [x] Evening: finish Sprint 0 — tighten 5 permissive RLS policies, dedupe legacy policies, ~~Postgres upgrade~~, partner_applications review *(done 6/11 morning, ahead of schedule — `sprint0_rls_tightening.sql` applied + verified; **Postgres upgrade done 6/12 evening** — now on Postgres 17.6, `vulnerable_postgres_version` advisor finding cleared)*
- [x] Capture live schema as baseline migration; commit; SQL-editor moratorium begins *(done 6/11 — `baseline_schema_2026_06_11.sql`, reconstructed via read-only MCP catalog queries, policies section verified post-tightening. Moratorium in effect.)*

### Fri June 12 — **the design night (most important pre-camp task)**
- [x] **Catalog-first add flow design session.** One page of decisions: search-first UI, found/not-found paths, uncataloged state and badge, approval-linkage behavior, edge cases (duplicate adds, kit edited while pending). Done tonight, tomorrow is pure execution. *(done 6/12 — all 6 decisions + edge cases settled in `Docs/CATALOG_FIRST_DESIGN.md`)*
- [x] Claude Code in parallel: `invite_codes` table + signup validation + per-channel batch generator *(done 6/12 — `add_invite_codes.sql` ready for founder paste; behind `app_settings.require_invite_code` flag, default off, flip on beta-open morning; generator: `node scripts/generate-invite-codes.mjs --channel X --count N`)*

### Sat June 13 (full build day before departure)
- [x] Morning: remove manual-approval gate from signup; standard email verification on; strip "24–48 hours" copy; deploy *(done 6/12 evening, a day early — gate component deleted, copy stripped, deployed; founder pastes `remove_manual_approval_gate.sql` which also flips `require_invite_code` ON so signup hands over to invite codes with no open window)*
- [x] **Catalog-first build, head start:** found path — search-first "Find your kit" entry point → one-click add → instant `user_jerseys` write. Stretch goal if it's flowing: start the not-found path. *(found path done 6/12 evening, a day early — FindYourKit live behind the single "+ Add New Kit" entry; wizard now the not-found fallback; `add_user_jerseys_submission_link.sql` applied + verified 6/12; not-found path remains June 20)*
- [x] **Launch the autonomous Claude Code batch — all as PRs, nothing merges to prod unattended:** *(all 5 branches pushed 6/12 evening, a day early — open PRs from the links in the 6/12 log entry; review/merge on June 19 as planned)*
  - (a) Wikidata import script (48 World Cup nations + EPL + MLS), run against a branch/staging dataset for review *(branch `data/wikidata-club-import` — live-verified: EPL 21, MLS 33, nations 288 incl. women's; youth filtered; review CSVs regenerate via `--source all`)*
  - (b) Sentry wiring *(branch `observability/sentry-wiring` — inert until founder sets `VITE_SENTRY_DSN` in Vercel)*
  - (c) `all_kits_public` default→false migration + existing-row audit *(branch `privacy/all-kits-public-default-false` — audit: all 4 profiles on unchosen default; migration flips them; founder re-enables own in settings)*
  - (d) Product-analytics event scaffolding (signup → first kit → 5 kits → share) *(branch `analytics/event-scaffolding` — provider pluggable, buffers until week-3 provider decision)*
  - (e) Photo compression + EXIF-strip utility *(branch `media/photo-compression` — wired into wizard uploads; EXIF/GPS never leaves the browser)*
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

## Idea parking lot (post-launch, not before July 21)

- **"# of players to wear this kit" as a headline stat on kit details** *(founder, 6/12)* — the count already renders as the badge on the "Players to Wear This Kit" squad section (`JerseyDetails.jsx:626`, `${squadData.length} players`); idea is to also surface it as a top-level stat in the kit header area so it's visible without scrolling. Small lift; depends on squad-data coverage (Wikidata imports).

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
- **2026-06-12 (autonomous batch, late):** All five June 13 batch items built and pushed as PR branches (TDD where code: 54 tests total green; no gh CLI so founder opens PRs from: github.com/jbartczak99/RecollectKits/pull/new/{privacy/all-kits-public-default-false, observability/sentry-wiring, media/photo-compression, analytics/event-scaffolding, data/wikidata-club-import}). Notable findings: (1) Wikidata doesn't model 2026 WC participation on team entities — P1923 empty, P1344 lists players — so nations are a class sweep (288 senior teams incl. women's, youth filtered; superset of the 48); (2) senior men's national teams moved to class Q135408445 (Brazil etc. are no longer Q6979593); (3) `all_kits_public` audit: all 4 existing profiles on the unchosen default → migration flips them, founder re-toggles own. Founder actions when reviewing: create Sentry project + set `VITE_SENTRY_DSN`; pick analytics provider in week 3 (events buffer until then). Nothing merged — June 19 merge day stands.
- **2026-06-12 (found path):** Catalog-first found path built TDD-first (17 new tests specced before code; 43 total green) and deployed. FindYourKit: debounced search with team+season term parsing ("arsenal 2019/20" splits correctly), one-click "I have this" → instant `user_jerseys` write with `details_completed: false` (existing nag loop chases details, per founder), "In collection ✓" states, wizard demoted to not-found fallback. Single entry: Collection "+ Add New Kit" + dashboard empty-state CTA ("Find your first kit"). Schema slice `add_user_jerseys_submission_link.sql` (+rollback) ready for founder paste — adds `user_jerseys.submission_id` ahead of the June 20 not-found build. Found while building, not fixed (scope): AddJerseyToCollectionModal inserts a nonexistent `collection_id` column into `user_jerseys` — latent bug, queue with June 20 work.
- **2026-06-12 (approval gate removed):** June 13's first item pulled forward: ApprovalGate deleted, AppGateLayout unwrapped, createProfile now writes `approved`, all "under review / 24–48 hours" copy stripped (RegisterForm success + AuthLayout alpha banner), deployed. `remove_manual_approval_gate.sql` (+rollback) ready: approved default, pending-queue backfill, **and flips `require_invite_code` ON in the same paste** — signup control hands directly from human review to invite codes with no open-registration window (no codes distributed yet = effectively closed until June 26). Vestigial for the June 20 admin sweep: pending-accounts admin UI + approve/reject/get_pending RPCs. **Applied + verified same evening:** approved default live, 0 pending accounts remain, `require_invite_code=true`, 0 codes minted → registration closed until beta codes go out. Email confirmation confirmed on in dashboard. Gate handover complete.
- **2026-06-12 (infra):** Postgres upgraded in prod (17.4.1 → 17.6, dashboard) — `vulnerable_postgres_version` advisor finding cleared, zero ERRORs. **Sprint 0 is now 100% complete.** Advisor WARNs 80→89, all new ones traced to today's invite-code objects (graphql-introspection + definer-function lists, same accepted categories; RLS covers them). Remaining accepted risks: leaked-password protection (Pro-only) and the always-true waitlist INSERT (public form by design).
- **2026-06-12 (design night):** Catalog-first design session complete — all six decisions + edge cases recorded in `Docs/CATALOG_FIRST_DESIGN.md`: (1) uncataloged identity via `user_jerseys.submission_id` FK (COALESCE identity, no duplicated fields); (2) pending kits owner-only until approved; (3) approval RPC auto-links without touching user data, conflicts flagged `duplicate` for manual merge — also replaces the broken `approve_jersey_submission`; (4) found path = instant 2-click add, existing details flag/notify loop chases the rest; (5) not-found wizard slimmed to team+season+type (photo optional, extras in expander, admin canonicalizes at approval); (6) single search-first entry point, direct wizard entry removed. `add_invite_codes.sql` applied to prod + verified (3 tables, trigger live, flag off). Tomorrow (June 13) is pure execution: `submission_id` migration + found path, per the build slices in the design doc.
- **2026-06-12 (invite codes):** Invite-code system built TDD-first (26 tests specced and committed before implementation; all pass; build clean). Shipped: `add_invite_codes.sql` (+rollback) — `invite_codes`/`invite_redemptions` tables, `app_settings` flag table, anon `validate_invite_code` RPC, auth.users trigger that atomically redeems codes (row-lock serializes racing signups on a code's last use); per-channel generator script emitting paste-ready SQL + CSV (output gitignored — codes are secrets); RegisterForm shows + pre-validates the code field only when the flag is on. Decisions: (1) enforcement is server-side via signup trigger reading `app_settings.require_invite_code` — flip the flag beta-open morning with one UPDATE, no deploy; (2) flag defaults false so nothing changes for current signups; (3) one redemption per user, codes default single-use. **Founder action: paste `add_invite_codes.sql` via SQL editor** (committed migration, moratorium-compliant) — safe to apply any time before June 26.
- **2026-06-12 (morning status):** All opener-day posts confirmed out 6/11 (item closed). **Waitlist funnel verified live end-to-end** (test POST → 200 → row in `waitlist_signups` with interest segment; one `+opener-funnel-test` alias row left behind — MCP can't delete, ignore or remove in dashboard). **Finding: zero organic signups from the opener push** — Supabase logs show real visitors browsing kits (multiple devices) but no waitlist submissions; the pipeline is healthy, conversion is the gap. Worth considering before the June 14–18 scheduled posts: link posts straight to the waitlist form/section rather than the homepage, and check the form's prominence on mobile. Slipped: Postgres upgrade 6/11 → tonight 6/12 (founder dashboard action). Today is design night: catalog-first add-flow decisions + `invite_codes` build in parallel.
- **2026-06-11 (Sprint 0 close):** RLS tightening shipped and applied to prod (founder pasted `sprint0_rls_tightening.sql`; verified via pg_policies + advisors — zero ERRORs, WARNs 81→80). Root cause found: `hardening_pre_launch.sql` DROPs had targeted wrong policy names, so wide-open authenticated write policies survived on team_squads/kit_squad_cache/player_careers — now removed; notifications inserts scoped to recipient-or-actor; user_badges to self-award; partner_applications submissions pinned to status='pending', no admin-notes injection; ~13 duplicate legacy policies deduped. Baseline schema committed (`baseline_schema_2026_06_11.sql`) — **SQL-editor moratorium now in effect.** Slipped (same-day): Postgres upgrade deferred from 11am to tonight's low-traffic window (opener-day waitlist traffic). Found + flagged, deliberately not fixed (scope): `reject_user_account()` and `approve_jersey_submission()` both reference columns that don't exist on their live tables and will fail if called — fix with June 13 gate-removal and June 20 approval-linkage work respectively (noted in baseline file).
- **2026-06-11 (opener day):** Launch posts drafted last night (6/10 marketing-prep item closed). Founder is now working through publishing the waitlist push across channels (IG + LinkedIn + collector Discords) — opener-day morning window, as planned. Remaining today: confirm all posts are out, then evening Sprint 0 finish (RLS tightening, policy dedupe, Postgres upgrade, partner_applications review) + baseline schema migration.
- **2026-06-10 (later):** Security block done. Shipped: `pending_accounts` view dropped in prod (founder pasted `sprint0_security_remediation.sql` via SQL editor — MCP still read-only); anon EXECUTE revoked on 8 SECURITY DEFINER functions + trigger fn locked to owner; advisors re-run clean — **both ERROR findings cleared, zero ERRORs remain**. Decisions: (1) kept 5 functions anon-executable on purpose (public-profile/OG read paths + `is_admin_user` used in RLS) — these stay as accepted WARNs; (2) leaked-password protection is Supabase Pro-only → accepted risk, revisit on plan upgrade. Slipped: nothing. Remaining tonight: waitlist end-to-end check + launch-post drafts.
