# Scaffolding Kit: One-Command Project Bootstrap

A portable toolkit that bootstraps a fully enforced Node.js project from scratch. Run one command and get a project with secret detection, file size limits, auto-generated documentation sections, drift warnings, and SHA-based test caching.

For the concepts behind these tools, see the [main README](../README.md).

## Quick Start

From anywhere:

```bash
# Create a new project
node /path/to/harness-engineering/scaffolding/setup.js my-project

# Or bootstrap in current directory
node /path/to/harness-engineering/scaffolding/setup.js
```

This will:

1. Initialize `package.json` and git repository (if not present).
2. Install dev dependencies: `husky`, `lint-staged`, `jest`, `eslint`.
3. Copy enforcement scripts into `scripts/`.
4. Copy config files (`.eslintrc.js`, `.prettierrc`, `lint-staged.config.js`).
5. Copy templates (`.gitignore`, `.env.example`).
6. Initialize husky and install pre-commit and pre-push hooks.
7. Add npm scripts to `package.json`.
8. Create starter directories (`src/`, `tests/`, `scripts/`, `docs/`).

After setup, copy and customize your CLAUDE.md templates (setup.js will remind you).

## Customization

Each script has a `CONFIG` object at the top of the file that you can edit:

### check-secrets.js

- `CONFIG.patterns`: Add or remove secret patterns (regex + description).
- `CONFIG.allowlistPaths`: Glob patterns for files that should be skipped (e.g., test files).

### check-file-sizes.js

- `CONFIG.maxLines`: Maximum lines per file (default: 300).
- `CONFIG.include`: Glob patterns for files to check (default: `src/**/*.js`).
- `CONFIG.exclude`: Glob patterns for files to skip.

### validate-docs.js

- `CONFIG.docFile`: The documentation file to validate (default: `CLAUDE.md`).
- `CONFIG.trackedDirs`: Directories that trigger a docs-drift warning when modified.
- `CONFIG.mappings`: Section-to-directory mappings for full drift analysis.

### generate-docs.js

- `TREE_DIRS`: Top-level directories included in the auto-generated tree (default: `src/`, `scripts/`, `tests/`).
- Modify `generate-docs-helpers.js` `SKIP_DIRS` to change which subdirectories are excluded from the tree.

## Hook Details

### Pre-commit (blocks commit on failure)

| Step | Enforcement | Script |
|------|-------------|--------|
| 1. Lint staged files | **Block** | `npx lint-staged` |
| 2. Secret detection | **Block** (exit 1) | `scripts/check-secrets.js` |
| 3. File size limit | **Block** (exit 1) | `scripts/check-file-sizes.js` |
| 4. Doc generation | **Auto-stage** (exit 0) | `scripts/generate-docs.js` |
| 5. Documentation drift | **Warn** (exit 0) | `scripts/validate-docs.js` |

### Pre-push (blocks push on failure)

| Step | Enforcement | Script |
|------|-------------|--------|
| 1. Test suite | **Block** (exit 1), skipped if cached | `npm run test:all` |
| 2. Dependency audit | **Warn** (exit 0) | `npm audit` |

## Bypassing Hooks

When you need to skip hooks (emergency hotfix, WIP commit, etc.):

```bash
git commit --no-verify -m "hotfix: ..."
git push --no-verify
```

Use sparingly. Add tests immediately after any emergency bypass.

## Config Files

The `configs/` directory contains starter configurations copied by `setup.js`:

- `configs/eslint-base.js`: Baseline ESLint rules (ES2022, strict mode). Copied as `.eslintrc.js`.
- `configs/lint-staged.config.js`: Default lint-staged config (ESLint auto-fix on `src/**/*.js`).
- `configs/.prettierrc`: Prettier formatting rules.

The `templates/` directory contains project starter files:

- `templates/.gitignore`: Standard Node.js gitignore including `.test-passed`.
- `templates/.env.example`: Placeholder environment variable file.

## Standalone Usage

The scripts can be run directly or imported as modules:

```bash
node scripts/check-secrets.js             # Scan staged files for secrets
node scripts/check-file-sizes.js          # Check staged files against size limit
node scripts/validate-docs.js             # Pre-commit drift warning
node scripts/validate-docs.js --full      # Full drift analysis
node scripts/generate-docs.js             # Regenerate AUTO markers in CLAUDE.md
node scripts/generate-docs.js --check     # Validate markers are current (for CI)
```

```js
// Library usage
const { scanForSecrets } = require('./scripts/check-secrets');
const { checkFileSize } = require('./scripts/check-file-sizes');
const { checkDrift } = require('./scripts/validate-docs');
const { replaceMarkers, validateCrossLinks } = require('./scripts/generate-docs');
```
