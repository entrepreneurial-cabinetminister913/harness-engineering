# Bootstrap Kit Enhancement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make setup.sh a true one-command bootstrap and fill all documentation/code gaps so students go from empty directory to enforced Node.js project.

**Architecture:** Add generate-docs.js + helpers (adapted from sidecar), new template files (.gitignore, .env.example, .prettierrc), rewrite setup.sh for full bootstrap, fix all phantom references in docs/templates.

**Tech Stack:** Node.js, Jest, CommonJS, Husky, ESLint

**Spec:** [docs/superpowers/specs/2026-03-11-bootstrap-enhancement-design.md](../specs/2026-03-11-bootstrap-enhancement-design.md)

**Source reference:** Scripts adapted from `/Users/john_renaldi/claude-code-projects/sidecar/scripts/generate-docs.js` and `generate-docs-helpers.js`.

---

## File Structure

### New files
- `scaffolding/scripts/generate-docs.js` — Main doc generation script (write + check modes)
- `scaffolding/scripts/generate-docs-helpers.js` — JSDoc extraction, tree builder, module index
- `scaffolding/tests/scripts/generate-docs.test.js` — Full test suite
- `scaffolding/configs/.prettierrc` — Prettier config
- `scaffolding/templates/.gitignore` — .gitignore template for bootstrapped projects
- `scaffolding/templates/.env.example` — Env var placeholder template

### Modified files
- `scaffolding/setup.sh` — Full rewrite as one-command bootstrap
- `scaffolding/hooks/pre-commit` — Add generate-docs.js step
- `scaffolding/configs/lint-staged.config.js` — ESM to CommonJS fix
- `templates/project-claude.md` — Fix phantom links, AGENTS.md, doc-system ref
- `templates/global-claude.md` — Add memory/MEMORY.md guidance
- `README.md` — Update Getting Started, fix pre-commit docs
- `scaffolding/README.md` — Rewrite for new bootstrap flow

---

## Chunk 1: Core Scripts

### Task 1: Create generate-docs-helpers.js

Adapted from sidecar. Changes: removed `electron/`, `evals/` from SKIP_DIRS, added `dist/`, `build/`.

**Files:**
- Create: `scaffolding/scripts/generate-docs-helpers.js`

- [ ] **Step 1: Write the helpers file**

Copy from sidecar's `generate-docs-helpers.js` with these changes:
- `SKIP_DIRS`: `['node_modules', '.git', 'coverage', 'dist', 'build', 'fixtures']` (removed `workspace`, `screenshots`)
- All functions unchanged: `extractJSDocDescription`, `extractExports`, `buildDirectoryTree`, `buildTreeRecursive`, `buildModuleIndex`, `collectModules`

- [ ] **Step 2: Commit**

```bash
git add scaffolding/scripts/generate-docs-helpers.js
git commit -m "feat: add generate-docs-helpers.js adapted from sidecar"
```

---

### Task 2: Create generate-docs.js

Adapted from sidecar. Changes: `TREE_DIRS = ['src/', 'scripts/', 'tests/']` (removed `bin/`, `electron/`, `evals/`).

**Files:**
- Create: `scaffolding/scripts/generate-docs.js`

- [ ] **Step 1: Write the main script**

Copy from sidecar's `generate-docs.js` with these changes:
- `TREE_DIRS`: `['src/', 'scripts/', 'tests/']`
- All functions unchanged: `replaceMarkers`, `validateCrossLinks`, `buildPlansIndex`, `listMdFiles`, `checkMarkersAreCurrent`, `main`, `runCheckMode`, `runWriteMode`
- Uses `execFileSync` (not `exec`) for git staging — already safe against injection

- [ ] **Step 2: Commit**

```bash
git add scaffolding/scripts/generate-docs.js
git commit -m "feat: add generate-docs.js adapted from sidecar"
```

---

### Task 3: Create test suite

Adapted from sidecar's test suite. Import paths adjusted to bootstrap kit structure.

**Files:**
- Create: `scaffolding/tests/scripts/generate-docs.test.js`

- [ ] **Step 1: Write the test file**

Copy from sidecar's `tests/scripts/generate-docs.test.js` with these changes:
- Import from `../../scripts/generate-docs` (same relative path)
- Import `extractJSDocDescription` and `extractExports` from `../../scripts/generate-docs-helpers` (separate import)
- `buildDirectoryTree` test for multiple dirs uses `['scripts/', 'src/']` instead of `['bin/', 'src/']`
- All 30 test cases retained

- [ ] **Step 2: Install Jest and run tests**

```bash
cd /Users/john_renaldi/claude-code-projects/harness-engineering/scaffolding
npm init -y
npm install --save-dev jest
npx jest tests/scripts/generate-docs.test.js --verbose
```

Expected: All 30 tests GREEN.

- [ ] **Step 3: Commit**

```bash
git add scaffolding/tests/ scaffolding/package.json scaffolding/package-lock.json
git commit -m "test: add generate-docs test suite (30 tests)"
```

---

## Chunk 2: Template Files + Config Fixes

### Task 4: Create template files

**Files:**
- Create: `scaffolding/templates/.gitignore`
- Create: `scaffolding/templates/.env.example`
- Create: `scaffolding/configs/.prettierrc`

- [ ] **Step 1: Create .gitignore template**

Contents:
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

- [ ] **Step 2: Create .env.example**

Contents:
```
# Add your environment variables here
# NODE_ENV=development
```

- [ ] **Step 3: Create .prettierrc**

Contents:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": true
}
```

- [ ] **Step 4: Commit**

```bash
git add scaffolding/templates/.gitignore scaffolding/templates/.env.example scaffolding/configs/.prettierrc
git commit -m "feat: add .gitignore, .env.example, and .prettierrc templates"
```

---

### Task 5: Fix lint-staged.config.js

**Files:**
- Modify: `scaffolding/configs/lint-staged.config.js`

- [ ] **Step 1: Change ESM to CommonJS**

Replace `export default` with `module.exports =`

- [ ] **Step 2: Commit**

```bash
git add scaffolding/configs/lint-staged.config.js
git commit -m "fix: lint-staged config ESM to CommonJS for consistency"
```

---

### Task 6: Update pre-commit hook

**Files:**
- Modify: `scaffolding/hooks/pre-commit`

- [ ] **Step 1: Add generate-docs.js as step 4**

Final hook should be:
```bash
#!/usr/bin/env bash

# Pre-commit hook: fast checks (<2s)
# 1. lint-staged (linter on staged files)
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

- [ ] **Step 2: Commit**

```bash
git add scaffolding/hooks/pre-commit
git commit -m "feat: add generate-docs.js to pre-commit hook"
```

---

## Chunk 3: Setup Script Rewrite

### Task 7: Rewrite setup.sh

**Files:**
- Modify: `scaffolding/setup.sh`

- [ ] **Step 1: Rewrite as full bootstrap**

Key behaviors:
- Accept optional project name argument (creates dir if given)
- `git init` if not a repo
- `npm init -y` if no package.json
- Install husky, lint-staged, jest, eslint
- Create `src/`, `tests/`, `scripts/`, `docs/`
- Copy all 5 enforcement scripts using `copy_file` helper (prompts before overwrite)
- Copy configs as `.eslintrc.js`, `.prettierrc`, `lint-staged.config.js`
- Copy `.gitignore` and `.env.example` from templates
- Init husky, install hooks
- Add npm scripts: test, test:all, posttest, validate-docs, generate-docs, lint
- Print CLAUDE.md setup reminder at end

- [ ] **Step 2: Test in temp directory**

```bash
TEMP_DIR=$(mktemp -d)
bash scaffolding/setup.sh "$TEMP_DIR/test-proj"
ls -la "$TEMP_DIR/test-proj"
cat "$TEMP_DIR/test-proj/package.json"
ls "$TEMP_DIR/test-proj/scripts/"
rm -rf "$TEMP_DIR"
```

- [ ] **Step 3: Commit**

```bash
git add scaffolding/setup.sh
git commit -m "feat: rewrite setup.sh as full one-command bootstrap"
```

---

## Chunk 4: Documentation Fixes

### Task 8: Fix templates/project-claude.md

**Files:**
- Modify: `templates/project-claude.md`

- [ ] **Step 1: Fix Docs Map** (lines 309-320)

Replace hard links with backtick paths and add TIP comment explaining these are files to create as the project grows. Remove `docs/doc-system.md` row.

- [ ] **Step 2: Fix Auto-Generated Sections text** (line 284)

Replace `See [docs/doc-system.md](docs/doc-system.md) for details.` with `Use \`--check\` flag for CI validation.`

- [ ] **Step 3: Fix AGENTS.md section** (lines 299-305)

Replace claim that symlink exists with TIP comment showing how to create it: `ln -s CLAUDE.md AGENTS.md`

- [ ] **Step 4: Commit**

```bash
git add templates/project-claude.md
git commit -m "fix: remove phantom references from project-claude.md"
```

---

### Task 9: Fix templates/global-claude.md

**Files:**
- Modify: `templates/global-claude.md`

- [ ] **Step 1: Add memory/MEMORY.md guidance** (after line 102)

Add TIP comment after Self-Improvement Loop section explaining how to create the memory directory.

- [ ] **Step 2: Commit**

```bash
git add templates/global-claude.md
git commit -m "fix: add memory/MEMORY.md guidance to global template"
```

---

### Task 10: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rewrite Getting Started section** (lines 319-382)

Replace manual 7-step process with new 3-step flow:
1. Bootstrap your project (one command)
2. Copy and customize CLAUDE.md templates
3. Commit and verify

Include both Option A (new dir) and Option B (current dir) examples. List everything setup.sh does.

- [ ] **Step 2: Verify pre-commit hook example matches actual hook** (lines 181-197)

The README's code block should show the 5-step hook including `generate-docs.js`. Verify it matches `scaffolding/hooks/pre-commit`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README for new bootstrap flow"
```

---

### Task 11: Update scaffolding/README.md

**Files:**
- Modify: `scaffolding/README.md`

- [ ] **Step 1: Rewrite for new bootstrap**

Update to reflect:
- New Quick Start with project name argument
- Full list of what setup.sh does (8 steps)
- Add generate-docs.js to script descriptions and customization section
- Update Hook Details table to include generate-docs.js as step 4
- Add Config Files section listing .prettierrc and template files
- Update Standalone Usage to include generate-docs commands

- [ ] **Step 2: Commit**

```bash
git add scaffolding/README.md
git commit -m "docs: rewrite scaffolding README for bootstrap flow"
```

---

## Chunk 5: Final Verification

### Task 12: Verify everything works

- [ ] **Step 1: Run test suite**

```bash
cd /Users/john_renaldi/claude-code-projects/harness-engineering/scaffolding
npx jest tests/scripts/generate-docs.test.js --verbose
```

Expected: All tests GREEN.

- [ ] **Step 2: Verify all new files exist**

```bash
ls -la scaffolding/scripts/generate-docs.js scaffolding/scripts/generate-docs-helpers.js
ls -la scaffolding/tests/scripts/generate-docs.test.js
ls -la scaffolding/configs/.prettierrc
ls -la scaffolding/templates/.gitignore scaffolding/templates/.env.example
```

- [ ] **Step 3: Dry-run setup.sh**

```bash
TEMP_DIR=$(mktemp -d)
bash scaffolding/setup.sh "$TEMP_DIR/test-proj"
# Verify: package.json has all scripts, scripts/ has all 5 files,
# .husky/ has hooks, .gitignore exists, .eslintrc.js exists
cat "$TEMP_DIR/test-proj/package.json" | grep -E "test|lint|validate|generate"
ls "$TEMP_DIR/test-proj/scripts/"
ls "$TEMP_DIR/test-proj/.husky/"
rm -rf "$TEMP_DIR"
```

- [ ] **Step 4: Verify no phantom references remain**

```bash
cd /Users/john_renaldi/claude-code-projects/harness-engineering
grep -r "docs/doc-system.md" templates/ README.md || echo "No phantom doc-system refs"
grep -r "AGENTS.md is a symlink" templates/ || echo "No phantom AGENTS.md claims"
```
