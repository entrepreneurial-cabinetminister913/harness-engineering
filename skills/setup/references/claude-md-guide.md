# CLAUDE.md Quality Guide

Reference for Claude when generating or reviewing CLAUDE.md content. The goal is a dense, high-signal file — every line must save a future session from re-discovery.

---

## Good Content (add this)

These belong in CLAUDE.md because they are non-obvious and project-specific:

**Commands that save re-discovery**
- `npm run seed -- --reset` resets the dev database (drops all tables, re-seeds)
- `npm run dev:workers` must run alongside `npm run dev` — workers are a separate process
- `npx prisma migrate reset` is the nuclear option; drops the DB and re-runs all migrations

**Gotchas that prevent repeat debugging**
- Auth middleware must run before rate-limiter or tokens are rejected with 401 before the route runs
- The `userId` in session tokens is a UUID string, not an integer — comparisons with `===` will fail silently if the DB returns a number
- Redis TTL is in seconds; the cache helper takes milliseconds — always convert before calling `cache.set()`

**Config quirks**
- `PORT` must be 3001 in dev — 3000 conflicts with the frontend proxy
- `DATABASE_URL` in `.env.test` must point to a separate test database, not the dev one
- `VITE_API_URL` requires the trailing slash — fetch calls concatenate without it

**Architecture knowledge not obvious from code**
- Billing events are async — the webhook handler in `src/webhooks/` processes them; the API response is always 200 even if billing fails
- Email sending is fire-and-forget in `src/services/mailer.ts` — errors are logged but do not bubble up
- The `reports/` table is append-only; never `UPDATE` or `DELETE` rows there

---

## Bad Content (don't add this)

Omit anything that wastes space without saving a future session:

**Obvious code descriptions** — `UserService handles user operations` — the class name already says this. If the name is sufficient, skip it.

**Generic best practices** — `Always write tests`, `Use meaningful variable names`, `Handle errors gracefully` — these are universal advice, not project-specific knowledge. They belong in team guidelines, not CLAUDE.md.

**One-off fixes unlikely to recur** — `Bumped lodash to fix CVE-2024-XXXX` — the fix is done; this clutter persists forever without value.

**Verbose explanations** — one line per concept. If you need a paragraph to explain it, the architecture may need simplifying, not the documentation.

---

## Gotcha Capture Rule

When you discover a non-obvious gotcha during a session — a working command, a config quirk, an ordering constraint, a silent failure mode — add it to the `Critical Gotchas` section of `CLAUDE.md` **before ending the session**.

Do not put it in memory only. Memory is agent-local. CLAUDE.md is read by every session and every team member.

**Triggers for capture:**
- You spent more than 5 minutes debugging something that turned out to be a one-liner fix
- You found a flag or env var that makes something work that otherwise silently fails
- You discovered an ordering constraint between two components
- You found a command that the README doesn't mention but is required for local dev

---

## CLAUDE.md vs .claude.local.md

**CLAUDE.md** — committed to git, read by every session and every teammate.
- Project commands and scripts
- Architecture gotchas
- Config quirks that affect the whole team
- Ordering constraints and runtime dependencies

**.claude.local.md** — gitignored, personal to one machine.
- Local file paths (e.g. `DB_HOST=localhost:5433` because your Postgres runs on a non-default port)
- Personal workflow preferences
- Machine-specific setup notes
- Credentials or paths you don't want in version control

When in doubt: if it affects anyone else on the team, it goes in `CLAUDE.md`.

---

## Structure Guidelines

- One line per concept — no multi-line explanations
- Commands must be copy-paste ready — include flags, arguments, and any required env vars
- Everything must be project-specific — if it applies to every Node project, omit it
- Keep the file dense — it is part of the prompt on every invocation; every line costs tokens
- Use section headers sparingly — flat lists are faster to scan than deeply nested docs
- Prefer concrete examples over abstract descriptions: `npm run seed -- --reset` beats "there is a seed script"
