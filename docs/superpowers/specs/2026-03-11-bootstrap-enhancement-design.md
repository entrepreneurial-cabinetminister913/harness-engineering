# Bootstrap Kit Enhancement — Design Spec

**Date:** 2026-03-11
**Status:** Approved

## Problem

The harness-engineering bootstrap kit has documentation/code mismatches and an incomplete `setup.sh` that requires students to do significant manual setup. Key issues:

1. `generate-docs.js` is referenced everywhere but doesn't exist (causes runtime errors)
2. `setup.sh` only copies enforcement scripts + hooks — doesn't create a full project
3. README pre-commit hook example doesn't match actual hook
4. Templates reference phantom files (`docs/*.md`, `docs/doc-system.md`)
5. No `.gitignore`, `.env.example`, or Prettier config included
6. ESM/CommonJS inconsistency in configs

## Solution

Enhance `setup.sh` to be a true one-command bootstrap and fill all documentation/code gaps.

## Design

### Enhanced `setup.sh`

Single command: `bash /path/to/harness-engineering/scaffolding/setup.sh [project-name]`

**Behavior:**
- If `project-name` given: create directory and work inside it
- If omitted: use current directory
- Detect if `package.json` exists; if not, run `npm init -y`

**Steps:**

| # | Action | Detail |
|---|--------|--------|
| 1 | Init project | `npm init -y` if no package.json |
| 2 | Install dev deps | husky, lint-staged, jest, eslint |
| 3 | Copy enforcement scripts | `check-secrets.js`, `check-file-sizes.js`, `validate-docs.js` |
| 4 | Copy doc generation | `generate-docs.js`, `generate-docs-helpers.js` |
| 5 | Copy configs | `.eslintrc.js`, `.prettierrc` |
| 6 | Set up git hooks | `husky init`, copy pre-commit + pre-push |
| 7 | Create `.gitignore` | From `scaffolding/templates/.gitignore` |
| 8 | Create `.env.example` | From `scaffolding/templates/.env.example` |
| 9 | Create starter dirs | `src/`, `tests/`, `scripts/`, `docs/` |
| 10 | Add npm scripts | test, test:all, posttest, validate-docs, lint, generate-docs |
| 11 | Init git | `git init` if not already a repo |
| 12 | Print CLAUDE.md reminder | Echo copy/customize instructions |

**Overwrite protection:** Prompt before overwriting existing files (same pattern as current setup.sh).

**End-of-setup echo:**
```
Done! Next steps:
  1. Copy and customize your CLAUDE.md templates:
     cp /path/to/harness-engineering/templates/global-claude.md ~/projects/CLAUDE.md
     cp /path/to/harness-engineering/templates/project-claude.md ./CLAUDE.md
  2. Fill in the [bracketed placeholders] in both files
  3. git add -A && git commit -m "Initial project setup"
```

### New Files

#### `scaffolding/scripts/generate-docs.js` (~260 lines)

Ported from sidecar project (`/Users/john_renaldi/claude-code-projects/sidecar/scripts/generate-docs.js`).

- **Write mode** (default): Regenerates AUTO markers in CLAUDE.md, auto-stages changes
- **Check mode** (`--check`): Validates markers and cross-links, exits 1 if stale (for CI)
- Core functions: `replaceMarkers()`, `validateCrossLinks()`, `checkMarkersAreCurrent()`, `runCheckMode()`, `runWriteMode()`
- Adapted tracked directories for generic projects: `src/`, `scripts/`, `tests/`

#### `scaffolding/scripts/generate-docs-helpers.js` (~220 lines)

Ported from sidecar project.

- `extractJSDocDescription(filePath)` — first JSDoc line from JS files
- `extractExports(filePath)` — CommonJS export names (capped at 5)
- `buildDirectoryTree(rootDir, dirs)` — ASCII tree with JSDoc annotations
- `buildModuleIndex(rootDir)` — markdown table of modules
- Configurable tracked directories

#### `scaffolding/tests/scripts/generate-docs.test.js` (~480 lines)

Full test suite ported from sidecar, adapted for bootstrap kit's version.

#### `scaffolding/configs/.prettierrc`

```json
{ "singleQuote": true, "trailingComma": "es5", "semi": true }
```

#### `scaffolding/templates/.gitignore`

```
node_modules/
.test-passed
.env
.env.local
coverage/
dist/
build/
*.log
```

#### `scaffolding/templates/.env.example`

```
# Add your environment variables here
# NODE_ENV=development
```

### Modified Files

#### `scaffolding/hooks/pre-commit`

Add `generate-docs.js` as step 4 (between file-size check and validate-docs):

```bash
#!/usr/bin/env bash
# Pre-commit hook: fast checks (<2s)
# 1. lint-staged
# 2. Secret detection
# 3. File size enforcement
# 4. Auto-regenerate doc sections
# 5. CLAUDE.md drift warning

npx lint-staged
node scripts/check-secrets.js
node scripts/check-file-sizes.js
node scripts/generate-docs.js
node scripts/validate-docs.js
```

#### `scaffolding/configs/lint-staged.config.js`

Fix ESM to CommonJS for consistency with all other scripts:

```javascript
module.exports = { 'src/**/*.js': ['eslint --fix'] };
```

#### `README.md`

- Update Getting Started to reflect single-command bootstrap
- Fix pre-commit hook example to show 5 steps including generate-docs.js
- Remove manual "Add package.json scripts" step (setup.sh handles it)
- Clarify AUTO markers step (project template already has them)

#### `templates/project-claude.md`

- Docs Map: Replace phantom links with TIP guidance ("create these as your project grows")
- `docs/doc-system.md` reference: Replace with inline explanation
- AGENTS.md: Change "is a symlink" to "create with: `ln -s CLAUDE.md AGENTS.md`"

#### `templates/global-claude.md`

- Add TIP comment explaining `memory/MEMORY.md` — what it is, how to create it

#### `scaffolding/README.md`

- Update Quick Start for new bootstrap flow (project name argument, npm init)
- Remove ".test-passed gitignore" note (setup.sh handles it)
- Add generate-docs.js and helpers to script descriptions
- Add .prettierrc and .gitignore template to Config Templates section

### Out of Scope (YAGNI)

- CI/CD template (GitHub Actions) — students have different platforms
- Example app code in `src/` — student fills it
- Example test files — generate-docs test suite serves as pattern
- `docs/` stub files — Docs Map becomes TIP guidance
- `AGENTS.md` symlink in setup.sh — documented, not automated
- Prettier npm installation — config included, dep is add-your-own

## File Inventory

### New (6 files)
- `scaffolding/scripts/generate-docs.js`
- `scaffolding/scripts/generate-docs-helpers.js`
- `scaffolding/tests/scripts/generate-docs.test.js`
- `scaffolding/configs/.prettierrc`
- `scaffolding/templates/.gitignore`
- `scaffolding/templates/.env.example`

### Modified (7 files)
- `scaffolding/setup.sh`
- `scaffolding/hooks/pre-commit`
- `scaffolding/configs/lint-staged.config.js`
- `scaffolding/README.md`
- `README.md`
- `templates/project-claude.md`
- `templates/global-claude.md`

### Unchanged
- `scaffolding/scripts/check-secrets.js`
- `scaffolding/scripts/check-file-sizes.js`
- `scaffolding/scripts/validate-docs.js`
- `scaffolding/configs/eslint-base.js`
- `scaffolding/hooks/pre-push`
