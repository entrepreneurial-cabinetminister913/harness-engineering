#!/usr/bin/env node

/**
 * Bootstrap a fully enforced Node.js project from scratch.
 *
 * Usage:
 *   node setup.js [project-name]
 *
 * If project-name is given, creates the directory first.
 * If omitted, bootstraps in the current directory.
 *
 * Cross-platform: works on macOS, Linux, and Windows.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const readline = require('node:readline');

const SCRIPT_DIR = __dirname;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'ignore', ...opts });
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function copyFile(src, dest) {
  if (fs.existsSync(dest)) {
    const answer = await prompt(`  ${dest} exists. Overwrite? [y/N] `);
    if (answer !== 'y') {
      console.log(`  Skipping ${dest}`);
      return;
    }
  }
  fs.copyFileSync(src, dest);
  console.log(`  Copied ${dest}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const projectName = process.argv[2];

  // --- Project directory setup ---
  if (projectName) {
    console.log(`Creating project directory: ${projectName}`);
    fs.mkdirSync(projectName, { recursive: true });
    process.chdir(projectName);
  }

  const projectDir = process.cwd();
  console.log(`Bootstrapping project in ${projectDir}...`);

  // --- Git init ---
  if (!fs.existsSync('.git')) {
    run('git', ['init']);
    console.log('  Initialized git repository');
  }

  // --- package.json ---
  if (!fs.existsSync('package.json')) {
    run('npm', ['init', '-y']);
    console.log('  Created package.json');
  }

  // --- Install dev dependencies ---
  console.log('Installing dev dependencies (husky, lint-staged, jest, eslint)...');
  run('npm', ['install', '--save-dev', 'husky', 'lint-staged', 'jest', 'eslint']);
  console.log('  Installed dev dependencies');

  // --- Create directories ---
  for (const dir of ['src', 'tests', 'scripts', 'docs']) {
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log('  Created src/, tests/, scripts/, docs/');

  // --- Copy enforcement scripts ---
  const scripts = [
    'check-secrets.js',
    'check-file-sizes.js',
    'validate-docs.js',
    'generate-docs.js',
    'generate-docs-helpers.js',
  ];
  for (const script of scripts) {
    await copyFile(
      path.join(SCRIPT_DIR, 'scripts', script),
      path.join('scripts', script)
    );
  }

  // --- Copy config files ---
  await copyFile(path.join(SCRIPT_DIR, 'configs', 'eslint-base.js'), '.eslintrc.js');
  await copyFile(path.join(SCRIPT_DIR, 'configs', '.prettierrc'), '.prettierrc');
  await copyFile(path.join(SCRIPT_DIR, 'configs', 'lint-staged.config.js'), 'lint-staged.config.js');

  // --- Copy templates ---
  await copyFile(path.join(SCRIPT_DIR, 'templates', '.gitignore'), '.gitignore');
  await copyFile(path.join(SCRIPT_DIR, 'templates', '.env.example'), '.env.example');

  // --- Set up husky hooks ---
  console.log('Setting up git hooks...');
  run('npx', ['husky', 'init']);

  const huskyDir = '.husky';
  fs.copyFileSync(path.join(SCRIPT_DIR, 'hooks', 'pre-commit'), path.join(huskyDir, 'pre-commit'));
  fs.copyFileSync(path.join(SCRIPT_DIR, 'hooks', 'pre-push'), path.join(huskyDir, 'pre-push'));

  // Make hooks executable (no-op on Windows, needed on Mac/Linux)
  try {
    fs.chmodSync(path.join(huskyDir, 'pre-commit'), 0o755);
    fs.chmodSync(path.join(huskyDir, 'pre-push'), 0o755);
  } catch {
    // chmodSync may not work on Windows — hooks still work via husky
  }
  console.log('  Installed pre-commit and pre-push hooks');

  // --- Add npm scripts to package.json ---
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const pkgScripts = pkg.scripts || {};
  if (!pkgScripts.test) pkgScripts.test = 'jest';
  if (!pkgScripts['test:all']) pkgScripts['test:all'] = 'jest --testPathPattern="\\.(test|integration\\.test)\\.js$"';
  if (!pkgScripts.posttest) pkgScripts.posttest = 'git rev-parse HEAD > .test-passed';
  if (!pkgScripts['validate-docs']) pkgScripts['validate-docs'] = 'node scripts/validate-docs.js --full';
  if (!pkgScripts['generate-docs']) pkgScripts['generate-docs'] = 'node scripts/generate-docs.js';
  if (!pkgScripts.lint) pkgScripts.lint = 'eslint src/';
  pkg.scripts = pkgScripts;
  if (!pkg['lint-staged']) pkg['lint-staged'] = { 'src/**/*.js': ['eslint --fix'] };
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('  Added npm scripts (test, test:all, posttest, validate-docs, generate-docs, lint)');

  // --- Done ---
  const templatesDir = path.join(SCRIPT_DIR, '..', 'templates');
  console.log('');
  console.log('Bootstrap complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Copy and customize your CLAUDE.md templates:');
  console.log(`     cp ${path.join(templatesDir, 'global-claude.md')} ~/projects/CLAUDE.md`);
  console.log(`     cp ${path.join(templatesDir, 'project-claude.md')} ./CLAUDE.md`);
  console.log('  2. Fill in the [bracketed placeholders] in both files');
  console.log('  3. git add -A && git commit -m "Initial project setup"');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
