# Rollbacks — emergency use only

Files in this folder are **not** part of the regular migration sequence.
They live outside `database/migrations/` on purpose so a migration runner
that processes that directory lexicographically won't pick them up and
silently undo hardening.

Run a rollback only when something is actively broken in production (e.g.
the hardening migration locked users out and you need to regain access).
Apply by pasting the file's contents into the Supabase SQL editor.

After running a rollback, the database is in an **insecure state**:
known issues like admin self-promotion are reopened. Diagnose the
underlying issue, write a corrected hardening migration, and re-run it.
Do not leave the DB in the rolled-back state with public users.

| File | Reverses |
|---|---|
| `rollback_hardening_pre_launch.sql` | `database/migrations/hardening_pre_launch.sql` + `hardening_pre_launch_hotfix_profiles_recursion.sql` |
