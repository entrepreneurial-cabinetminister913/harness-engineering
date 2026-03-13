# Enforcement Scripts Reference

Reference for Claude when explaining or adapting enforcement scripts installed by `/setup`. All scripts live in `scripts/lib/` after installation and are invoked by git hooks.

---

## Script Details

### check-secrets.js

Scans staged files for hardcoded API keys and private key material. Exits 1 if any pattern matches, blocking the commit.

**CONFIG object:**
```js
const CONFIG = {
  patterns: [
    { regex: /sk-or-[\w-]{3,}/g,             description: 'OpenRouter API key' },
    { regex: /sk-ant-[\w-]{3,}/g,            description: 'Anthropic API key' },
    { regex: /AKIA[0-9A-Z]{16}/g,            description: 'AWS access key' },
    { regex: /ghp_[A-Za-z0-9_]{10,}/g,      description: 'GitHub personal access token' },
    { regex: /-----BEGIN\s[\w\s]*?PRIVATE\sKEY-----/g, description: 'Private key block' },
  ],
  allowlistPaths: [
    'tests/**',
    '**/*.test.js',
    '**/*.spec.js',
    '**/*.md',
    'docs/**',
  ],
};
```

**Allowlist mechanism:** Files whose path matches any allowlist glob are skipped entirely. The match is done with a simple glob-to-regex conversion (`**` → `.*`, `*` → `[^/]*`). Test files and documentation are allowlisted by default so fixture data and example keys don't block commits.

**To add a new secret pattern:** append to `CONFIG.patterns` with a `regex`, `name`, and `description`. The `name` field is displayed in the error message.

**To allowlist a path:** add a glob to `CONFIG.allowlistPaths`, e.g. `'vendor/**'`.

---

### check-file-sizes.js

Enforces a 300-line limit on source files in `src/`. Exits 1 if any staged file exceeds the limit.

**CONFIG object:**
```js
const CONFIG = {
  maxLines: 300,
  include: ['src/**/*.js'],
  exclude: [],
};
```

**How it counts lines:** splits content on `\n` and subtracts 1 if the file ends with a newline (trailing newline is not a real line).

**To change the limit:** update `CONFIG.maxLines`.

**To include TypeScript files:** change `include` to `['src/**/*.js', 'src/**/*.ts']`.

**To exclude generated files:** add globs to `CONFIG.exclude`, e.g. `['src/generated/**']`.

---

### validate-docs.js

CLAUDE.md drift detection. Compares what's documented against what's on disk.

**Two modes:**

- **Pre-commit (default):** Checks whether staged files touch `src/`, `bin/`, or `scripts/` without also staging `CLAUDE.md`. If so, prints a warning (does not block the commit).
- **Full analysis (`--full`):** Reads the `Directory Structure` and `Key Modules` sections of `CLAUDE.md` and compares the filenames mentioned there against actual files on disk. Exits 1 if there is drift.

**CONFIG object:**
```js
const CONFIG = {
  docFile: 'CLAUDE.md',
  trackedDirs: ['src/', 'bin/', 'scripts/'],
  mappings: [
    { section: 'Directory Structure', dirs: ['src/', 'bin/', 'scripts/'] },
    { section: 'Key Modules',         dir: 'src/', pattern: /\.js$/ },
  ],
};
```

**To track a new directory:** add it to `CONFIG.trackedDirs` and add a mapping to `CONFIG.mappings`.

**Usage:**
```bash
node scripts/validate-docs.js         # pre-commit mode
node scripts/validate-docs.js --full  # full drift analysis
```

---

### generate-docs.js

Auto-regenerates sections of `CLAUDE.md` that are bounded by `<!-- AUTO:name -->` ... `<!-- /AUTO:name -->` markers. Also writes a plans index to `docs/plans/index.md`.

**Two modes:**

- **Write mode (default):** Regenerates `tree` and `modules` markers in `CLAUDE.md`, writes `docs/plans/index.md`, and auto-stages both files with `git add`.
- **Check mode (`--check`):** Generates the same content and compares it against what's currently in the file. Exits 1 if any marker is stale or if any markdown cross-link points to a non-existent file.

**AUTO markers (place these in CLAUDE.md):**
```
<!-- AUTO:tree -->
<!-- /AUTO:tree -->

<!-- AUTO:modules -->
<!-- /AUTO:modules -->
```

**What it generates:**
- `tree`: ASCII directory tree of `src/`, `scripts/`, and `tests/`, with JSDoc descriptions annotated on `.js` files.
- `modules`: Markdown table of `src/` modules with columns `Module`, `Purpose` (from JSDoc), and `Key Exports` (up to 5 exports extracted from `module.exports`).
- Plans index: lists `.md` files under `docs/plans/` and `docs/archive/plans/`.

**Usage:**
```bash
node scripts/generate-docs.js          # write mode
node scripts/generate-docs.js --check  # check mode (CI / pre-push)
```

---

### generate-docs-helpers.js

Helper module used by `generate-docs.js`. Not invoked directly.

**JSDoc extraction (`extractJSDocDescription`):** Reads a `.js` file and returns the first description line from the file-level `/** ... */` comment. Handles both single-line (`/** desc */`) and multi-line block comments. Returns an empty string if no JSDoc is found.

**Export extraction (`extractExports`):** Reads a `.js` file and returns up to 5 exported names. Parses two patterns:
- `module.exports = { name1, name2, ... }` (object destructure)
- `exports.name = ...` (named property assignment)

**Directory tree builder (`buildDirectoryTree`):** Walks the specified top-level directories recursively, skips `node_modules`, `.git`, `coverage`, `dist`, `build`, and `fixtures`. Outputs an ASCII tree with `├──` / `└──` connectors. Annotates `.js` files with their JSDoc description (`  # description`).

**Module index builder (`buildModuleIndex`):** Walks `src/` recursively, collects all `.js` files, and builds a markdown table row for each using `extractJSDocDescription` and `extractExports`.

---

## Git Hook Chain

### pre-commit (fast, <2s)

```bash
npx lint-staged                  # ESLint + Prettier on staged files
node scripts/check-secrets.js    # block if secrets found
node scripts/check-file-sizes.js # block if file >300 lines
node scripts/generate-docs.js    # regenerate AUTO markers + auto-stage
node scripts/validate-docs.js    # warn if CLAUDE.md may need updating
```

### pre-push (thorough)

```bash
# SHA-based test cache: skip if tests already passed for HEAD
if HEAD_SHA == $(cat .test-passed); then skip
else npm run test:all

npm audit --audit-level=moderate  # warn only, does not block push
```

The `.test-passed` file stores the SHA of the last commit for which the full test suite passed. This avoids re-running tests on every push for the same commit.

---

## Adapting to Non-Node Stacks

### Secret scanning

The regex patterns in `check-secrets.js` operate on raw text and work on any file type. To reimplement for a non-Node stack:

- **Shell script:** use `grep -P` with the same patterns, loop over `git diff --cached --name-only`
- **Python:** use the `re` module with the same patterns; call from a `.git/hooks/pre-commit` script

The allowlist logic is a simple glob match — trivial to reimplement in any language.

### File size limits

Line counting is language-agnostic. To adapt:

- Change `include` globs to match the target language (e.g. `['src/**/*.py']` for Python, `['**/*.go']` for Go)
- The 300-line limit applies to any language — adjust `maxLines` if needed
- In a non-Node project, replace the Node script with a shell one-liner: `wc -l <file>`

### Pre-commit hooks

The git hook mechanism (`hooks/pre-commit`) is the same regardless of language. Replace Node invocations with the appropriate tools:

| Node command | Equivalent for other stacks |
|---|---|
| `npx lint-staged` + ESLint | `ruff check --fix` (Python), `golangci-lint run` (Go) |
| `jest` / `npm test` | `pytest`, `go test ./...` |
| `tsc --noEmit` | `mypy src/`, `go vet ./...` |

### Doc generation

The AUTO marker concept (`<!-- AUTO:name -->` ... `<!-- /AUTO:name -->`) works in any markdown file. To adapt for a non-Node project:

- Write a script in the target language that reads the markers and replaces content between them
- For the directory tree, any language can walk the filesystem and emit ASCII tree output
- For module index, parse JSDoc equivalents: Python docstrings, Go doc comments, etc.
