# Catalog-First Add Flow — Design Decisions

> Decided June 12, 2026 (design night, per BLITZ_PLAN). This page is the spec
> for the June 13 build day (found path) and June 20–21 (not-found path +
> approval linkage). Decisions here are settled — build, don't relitigate.

## The principle

A collector's kit is **in their collection the instant they add it** — never
parked in a review queue. Catalog review happens behind the scenes; approval
enriches the kit, it never gates the user.

## The six decisions

### 1. Uncataloged identity lives on the submission
`user_jerseys` gains a nullable `submission_id` → `jersey_submissions`.
A collection row is either cataloged (`public_jersey_id` set) or pending
(`submission_id` set); identity (team/season/type/images) is read via
`COALESCE(catalog, submission)`. No duplicated fields, and edits to a pending
submission reflect in the collection automatically.

### 2. Uncataloged kits are owner-only
Pending kits render in the owner's collection with a subtle pending badge.
They are excluded from public profile views (`all_kits_public` paths) until
approved. Nothing unreviewed ever renders publicly; `jersey_submissions` RLS
stays owner-or-admin.

### 3. Approval = auto-link, never touch user data, flag dupes
A new approval RPC (replacing the broken `approve_jersey_submission`, which
references a nonexistent `image_urls` column):
- creates the catalog row — or links to an existing one the admin picks;
- sets `public_jersey_id` on the submitter's `user_jerseys` row, clearing
  the pending state; size/condition/notes/photos are never modified;
- on a `(user_id, public_jersey_id)` unique conflict (user already had the
  kit cataloged), the row stays unlinked and the submission is marked
  `duplicate` for a quick manual merge in admin. No silent auto-merging.

### 4. Found path = instant add
Search → kit card → "I have this" → row written, done (2 clicks). The
existing details flag + notification loop (`details_completed`) chases
size/condition/photos afterward. No modal between the click and the add.

### 5. Not-found path = slim wizard
Required: **team (typeahead, prefilled from the search), season, kit type.**
Photo encouraged but optional. Everything else (colors, sponsors, player,
manufacturer) lives in a collapsed "add more details" expander — enthusiasts
can give everything, nobody is forced to. Rationale: the user uniquely knows
the identification and owns the photo; all other fields get normalized by
admin at approval anyway, so requiring them up front was duplicate work.
Submitting writes `user_jerseys` (pending) + queues `jersey_submissions`
in one action.

### 6. Single entry point
One "+ Add kit" (collection header + empty state) opens search-first. The
direct-to-wizard entry is removed; the slim wizard is reachable only as the
not-found fallback inside the flow. One funnel to measure; every add checks
the catalog first, so duplicate submissions drop structurally.

## Edge cases (decided)

- **Duplicate add, cataloged kit:** the `(user_id, public_jersey_id)` unique
  constraint already blocks it; UI shows an "In collection ✓" state on kit
  cards instead of the add button.
- **Duplicate add, uncataloged:** allowed (no reliable way to detect two
  pending descriptions of the same kit); admin dedupes at approval via the
  duplicate flag (decision 3).
- **Kit edited while pending:** identity reads live from the submission
  (decision 1), so owner edits and admin edits both auto-reflect. Owners can
  edit their submission until it's approved.
- **Kit approved while owner mid-edit:** approval sets `public_jersey_id`;
  the submission becomes read-only at that point (status != 'pending').

## Build slices

- **June 13 (pre-camp):** schema migration (`submission_id` column + index +
  updated collection-view queries), search-first entry + found path
  (instant add, "In collection" states). Stretch: slim wizard shell.
- **June 20–21 (return sprint):** slim wizard + dual write, pending badge in
  collection views, approval RPC + admin linkage + duplicate flag, full
  regression pass.
