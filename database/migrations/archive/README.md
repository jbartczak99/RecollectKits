# Archived migrations — do not replay

Files in this folder were committed to `database/migrations/` while the app
was in alpha. They are kept for historical reference but **must not** be
re-run on a fresh database — doing so will reintroduce known security
issues. They are no longer applied as part of the migration sequence
because they live outside the `database/migrations/` top-level folder.

| File | Why archived |
|---|---|
| `final_disable_rls.sql` | Disabled RLS on `profiles`. Opens an admin self-promotion path. Superseded by `hardening_pre_launch.sql`. |
| `disable_rls_jersey_submissions.sql` | Disabled RLS on `jersey_submissions`. Anyone could read every user's submissions. Superseded by `hardening_pre_launch.sql`. |
| `fix_approve_function.sql` | Created `approve_user_account(UUID, UUID, TEXT)` without verifying that the caller was the admin in the second argument. Anyone could approve any account by calling it directly. Superseded by the hardened two-arg version in `hardening_pre_launch.sql`. |
| `check_approve_function.sql` | Diagnostic SELECT used while debugging the approve function. Not a real migration. |
| `debug_approve_function.sql` | Diagnostic SELECT used while debugging. Not a real migration. |

If you ever need to investigate why something behaved a certain way during
alpha, the files are here. Otherwise leave them alone.
