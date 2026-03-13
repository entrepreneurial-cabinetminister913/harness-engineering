#!/usr/bin/env node
/**
 * Generate tailored CLAUDE.md files for a project from templates.
 *
 * Reads project-claude.md and global-claude.md templates, applies
 * framework-specific substitutions, and writes them to target directories.
 * Never overwrites existing files.
 *
 * Usage:
 *   node generate-claude-md.js --target=<dir> [--framework=<fw>] [--global-dir=<dir>]
 *
 * Flags:
 *   --target=<dir>      Target project directory (required)
 *   --framework=<fw>    One of: vite, nextjs, express, fastify, none (default: none)
 *   --global-dir=<dir>  Parent directory for global CLAUDE.md (optional)
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// ---------------------------------------------------------------------------
// Framework-specific substitution maps
// ---------------------------------------------------------------------------
const FRAMEWORK_COMMANDS = {
  vite: {
    devCmd: 'npm run dev                  # vite',
    buildCmd: 'npm run build              # vite build',
  },
  nextjs: {
    devCmd: 'npx next dev                 # Next.js dev server',
    buildCmd: 'npx next build             # Next.js production build',
  },
  express: {
    devCmd: 'npm run dev                  # ts-node/tsx src/index.ts',
    buildCmd: 'npm run build              # tsc',
  },
  fastify: {
    devCmd: 'npm run dev                  # ts-node/tsx src/index.ts',
    buildCmd: 'npm run build              # tsc',
  },
  none: null,
};

/** Replace the dev and build command lines in template content. */
function applyFrameworkCommands(content, framework) {
  const cmds = FRAMEWORK_COMMANDS[framework];
  if (!cmds) { return content; }

  content = content.replace(
    /npm run dev\s+# Development mode with hot reload/,
    cmds.devCmd
  );
  content = content.replace(
    /npm run build\s+# Production build/,
    cmds.buildCmd
  );
  return content;
}

/** Add React-specific ESLint rules for vite/nextjs frameworks. */
function applyFrameworkEslint(content, framework) {
  if (framework !== 'vite' && framework !== 'nextjs') { return content; }

  const reactRules = [
    "    'react/jsx-uses-react': 'error',",
    "    'react/react-in-jsx-scope': 'off',",
    "    'react/prop-types': 'warn',",
  ].join('\n');

  // Insert React rules after the no-unused-vars line in the ESLint block
  const marker = "    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],";
  if (content.includes(marker)) {
    return content.replace(marker, `${marker}\n${reactRules}`);
  }
  return content;
}

/** Apply all framework-specific transformations to template content. */
function applyFramework(content, framework) {
  content = applyFrameworkCommands(content, framework);
  content = applyFrameworkEslint(content, framework);
  return content;
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    args[key] = rest.join('=') || true;
  }
  return args;
}

// ---------------------------------------------------------------------------
// File writing helpers
// ---------------------------------------------------------------------------
/** Write content to dest if it does not already exist. Returns true if written. */
function writeIfMissing(dest, content, label) {
  if (fs.existsSync(dest)) {
    console.log(`[generate-claude-md] skip: ${label} already exists at ${dest}`);
    return false;
  }
  fs.writeFileSync(dest, content, 'utf8');
  console.log(`[generate-claude-md] wrote: ${dest}`);
  return true;
}

/** Attempt to run generate-docs.js if present in the target's scripts/ dir. */
function tryGenerateDocs(targetDir) {
  const script = path.join(targetDir, 'scripts', 'generate-docs.js');
  if (!fs.existsSync(script)) { return; }
  try {
    execFileSync(process.execPath, [script], { cwd: targetDir, stdio: 'inherit' });
  } catch {
    console.warn('[generate-claude-md] warn: generate-docs.js failed, skipping.');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const args = parseArgs(process.argv);

  if (!args.target) {
    console.error('[generate-claude-md] error: --target is required');
    process.exit(1);
  }

  const targetDir = path.resolve(args.target);
  const framework = args.framework || 'none';
  const globalDir = args['global-dir'] ? path.resolve(args['global-dir']) : null;

  // Ensure target exists
  fs.mkdirSync(targetDir, { recursive: true });

  // Write project CLAUDE.md
  const projectTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'project-claude.md'), 'utf8'
  );
  const projectContent = applyFramework(projectTemplate, framework);
  const wrote = writeIfMissing(path.join(targetDir, 'CLAUDE.md'), projectContent, 'project CLAUDE.md');

  // Run generate-docs.js if present and we wrote a new file
  if (wrote) { tryGenerateDocs(targetDir); }

  // Write global CLAUDE.md if requested
  if (globalDir) {
    const globalTemplate = fs.readFileSync(
      path.join(TEMPLATES_DIR, 'global-claude.md'), 'utf8'
    );
    fs.mkdirSync(globalDir, { recursive: true });
    writeIfMissing(path.join(globalDir, 'CLAUDE.md'), globalTemplate, 'global CLAUDE.md');
  }
}

main();
