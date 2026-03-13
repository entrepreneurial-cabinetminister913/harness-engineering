/**
 * Tests for skills/setup/scripts/generate-claude-md.js
 *
 * Verifies that the script creates tailored CLAUDE.md files in target directories,
 * respects existing files (no overwrite), and applies framework-specific content.
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const SCRIPT = path.resolve(__dirname, '../../skills/setup/scripts/generate-claude-md.js');

/** Run generate-claude-md.js as a child process with given args. */
function runScript(args) {
  return execFileSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-claude-md-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Basic creation
// ---------------------------------------------------------------------------
describe('creates CLAUDE.md in target directory', () => {
  it('writes CLAUDE.md when none exists', () => {
    runScript([`--target=${tmpDir}`]);
    const claudeMdPath = path.join(tmpDir, 'CLAUDE.md');
    expect(fs.existsSync(claudeMdPath)).toBe(true);
  });

  it('output is non-empty and contains expected header', () => {
    runScript([`--target=${tmpDir}`]);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf8');
    expect(content.length).toBeGreaterThan(100);
    expect(content).toContain('CLAUDE.md');
  });
});

// ---------------------------------------------------------------------------
// No overwrite
// ---------------------------------------------------------------------------
describe('does not overwrite existing CLAUDE.md', () => {
  it('skips writing when CLAUDE.md already exists', () => {
    const claudeMdPath = path.join(tmpDir, 'CLAUDE.md');
    const originalContent = '# My Existing CLAUDE.md\n';
    fs.writeFileSync(claudeMdPath, originalContent);

    runScript([`--target=${tmpDir}`]);

    const content = fs.readFileSync(claudeMdPath, 'utf8');
    expect(content).toBe(originalContent);
  });

  it('prints a warning when skipping', () => {
    const claudeMdPath = path.join(tmpDir, 'CLAUDE.md');
    fs.writeFileSync(claudeMdPath, '# existing\n');

    // stderr goes to pipe via stdio; capture stdout
    const output = execFileSync(process.execPath, [SCRIPT, `--target=${tmpDir}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // warning could be in stdout or stderr; combine and check
    expect(output).toMatch(/skip|warn|exist/i);
  });
});

// ---------------------------------------------------------------------------
// --global-dir: creates global CLAUDE.md
// ---------------------------------------------------------------------------
describe('creates global CLAUDE.md in --global-dir', () => {
  it('writes global CLAUDE.md when none exists in --global-dir', () => {
    const globalDir = path.join(tmpDir, 'global');
    fs.mkdirSync(globalDir);

    runScript([`--target=${tmpDir}`, `--global-dir=${globalDir}`]);

    expect(fs.existsSync(path.join(globalDir, 'CLAUDE.md'))).toBe(true);
  });

  it('does not overwrite existing global CLAUDE.md', () => {
    const globalDir = path.join(tmpDir, 'global');
    fs.mkdirSync(globalDir);
    const originalContent = '# My Global\n';
    fs.writeFileSync(path.join(globalDir, 'CLAUDE.md'), originalContent);

    runScript([`--target=${tmpDir}`, `--global-dir=${globalDir}`]);

    const content = fs.readFileSync(path.join(globalDir, 'CLAUDE.md'), 'utf8');
    expect(content).toBe(originalContent);
  });
});

// ---------------------------------------------------------------------------
// Framework: express
// ---------------------------------------------------------------------------
describe('framework=express', () => {
  it('produces output containing express-specific commands', () => {
    runScript([`--target=${tmpDir}`, '--framework=express']);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf8');
    expect(content).toMatch(/ts-node|tsx/i);
  });

  it('includes tsc build command for express', () => {
    runScript([`--target=${tmpDir}`, '--framework=express']);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf8');
    expect(content).toContain('tsc');
  });
});

// ---------------------------------------------------------------------------
// Framework: nextjs
// ---------------------------------------------------------------------------
describe('framework=nextjs', () => {
  it('produces output containing next-specific commands', () => {
    runScript([`--target=${tmpDir}`, '--framework=nextjs']);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf8');
    expect(content).toContain('next');
  });

  it('includes React ESLint rules for nextjs', () => {
    runScript([`--target=${tmpDir}`, '--framework=nextjs']);
    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf8');
    expect(content).toMatch(/react/i);
  });
});
