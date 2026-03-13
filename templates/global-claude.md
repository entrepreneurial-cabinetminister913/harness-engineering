<!-- Template: Customize this file for your development environment -->

# Global CLAUDE.md

This file provides universal guidance to Claude Code when working with projects in this directory. For project-specific guidance, see the CLAUDE.md file in each individual project directory.

---

## MANDATORY: Test-Driven Development (TDD) First

**EVERY feature request MUST start with writing tests before any implementation.**

When receiving ANY feature request, your FIRST response should be:
1. "Following TDD - I'll write tests first to define what success looks like"
2. Write comprehensive failing tests using the Red-Green-Refactor cycle
3. Only then proceed with implementation to make tests pass

### TDD Process - ALWAYS FOLLOW

1. **Red Phase** (REQUIRED FIRST STEP):
   - Write failing tests for the functionality you want to implement
   - Run tests to confirm they fail (shows "red" in test runner)
   - This validates that your test actually tests something

2. **Green Phase**:
   - Implement the simplest code that makes the test pass
   - Focus on making it work, not making it optimal
   - Run tests to confirm they now pass (shows "green")

3. **Refactor Phase**:
   - Clean up and optimize your implementation without changing behavior
   - Run tests after each refactor to ensure nothing is broken
   - Improve both implementation code AND test code

4. **Finalization Phase**:
   - Run full test suite
   - Validate test coverage >90% where applicable

5. **Documentation Check**:
   - If `src/`, `bin/`, or `scripts/` files were added/removed/renamed, run `node scripts/generate-docs.js` to auto-update CLAUDE.md (if available)
   - Run `node scripts/validate-docs.js --full` to verify no drift (if available)

### TDD Enforcement Checklist

**Before writing ANY implementation code, Claude MUST:**

1. **Explicitly state**: "Following TDD - writing tests first"
2. **Create test file** in appropriate `tests/` or `__tests__/` directory
3. **Write failing tests** that define expected behavior
4. **Run tests and show RED output** proving tests fail
5. **Only then write implementation**
6. **Run tests again and show GREEN output** proving tests pass

**Red Flags - STOP immediately if:**
- Creating files in `src/` before creating tests
- Using `Write` tool for implementation before tests exist
- Planning describes implementation details before test strategy
- User asks for feature and you immediately start coding

### TDD Self-Check Questions

Before writing implementation, ask yourself:
1. Have I written tests that will fail without this code?
2. Have I run those tests and confirmed they're RED?
3. Can I describe what "passing" looks like in concrete test assertions?

If the answer to ANY of these is "no", STOP and write tests first.

### When TDD Can Be Skipped

TDD may be relaxed ONLY for:
- Documentation-only changes (*.md files)
- Configuration files (package.json, tsconfig.json)
- Simple refactoring with existing test coverage
- Emergency hotfixes (with tests added immediately after)

**All other code changes require tests first.**

---

## Claude Code Operating Principles

These are high-priority behavioral rules that govern how Claude Code approaches all work.

### 1. Plan First

- For ANY non-trivial task (3+ steps or architectural decisions), create a plan before writing code.
- If something goes sideways, STOP and re-plan immediately. Do not keep pushing a failing approach.

### 2. Subagent Strategy

- Use subagents liberally to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `memory/MEMORY.md` with the pattern
- Write rules for yourself that prevent the same mistake repeating
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for the relevant project

<!-- TIP: Create the memory directory with: mkdir -p memory && touch memory/MEMORY.md
     This file persists learnings across Claude Code sessions. Add it to .gitignore
     if you don't want it tracked. -->

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff your behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes. Do not over-engineer.

### 6. Staleness Detection

- At the start of any work session, run `node scripts/validate-docs.js --full` (if available)
- If auto-generated sections are stale, run `node scripts/generate-docs.js` to regenerate (if available)
- Fix any remaining inconsistencies before proceeding with the task
- If CLAUDE.md references files, functions, or counts that don't match reality, fix them immediately
- This is the agent's half of the two-way documentation maintenance loop

### 7. Autonomous Bug Fixing

- When given a bug report: just fix it. Do not ask for hand-holding.
- Point at logs, errors, failing tests, then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

### 8. Capture Discoveries

- When you discover non-obvious gotchas, working commands, config quirks, or patterns that would save a future session from re-discovery — add them to the **Critical Gotchas** section of the project's CLAUDE.md, not to memory.
- Keep entries to one line each: `**[thing]**: [brief explanation]`
- Only add project-specific knowledge. Do not add generic best practices, obvious code descriptions ("UserService handles users"), one-off fixes unlikely to recur, or verbose explanations.

### Core Development Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

---

## Universal Workflow Guidelines

### Bash & CLI
<!-- TIP: Add your preferred shell and any non-standard tool paths here -->
- Use full paths for non-standard tool installations
- Use npm for Node.js projects (or your preferred package manager)

### Version Control
- Use the GitHub CLI (`gh`) for all GitHub-related tasks
- Use `git` for version control operations
- Never use destructive commands without explicit user approval (force push, hard reset, etc.)

### External Services & APIs
<!-- TIP: Add your cloud provider, auth setup, and API-specific guidance here -->
- Test authentication and external API connections with simple scripts before building features
- Always verify library versions before installation

### Code Quality & Tools
- Use ESLint and Prettier (or your language's equivalent) for consistent code formatting
- Implement pre-commit hooks to run linting and basic tests
- Use TypeScript in strict mode for maximum type safety (if applicable)
- Set up automated quality checks in the development workflow
- Use consistent import ordering and structure

---

## Universal Best Practices

### Error Handling & Resilience
- Implement comprehensive error handling patterns at all levels
- Create standardized error response formats for APIs
- Implement retry logic for network requests and external API calls
- Handle edge cases and empty states gracefully
- Use proper error logging with contextual information
- Validate and sanitize all inputs at API boundaries

### Security Best Practices
- Store sensitive configuration in environment variables, never in code
- Use HTTPS for all production communications
- Follow the principle of least privilege for database/API access
- Validate and sanitize user inputs to prevent injection attacks
- Implement proper authentication and authorization patterns

### File Size Limits

| Entity | Max Lines | Action If Exceeded |
|--------|-----------|-------------------|
| **Any file** | 300 lines | MUST refactor immediately |
| **Any function** | 50 lines | MUST break into smaller functions |

### Complexity Red Flags

**STOP and refactor immediately if you see:**

- **>5 nested if/else statements** -> Extract to separate functions
- **>3 try/catch blocks in one function** -> Split error handling
- **>10 imports** -> Consider splitting the module
- **Duplicate logic** -> Extract to shared utilities

### Code Organization
- Write concise, technical code with accurate examples
- Use functional and declarative programming patterns
- Prefer iteration and modularization over code duplication
- Write clear and concise comments, focusing on **why** rather than **what**
- Maintain a clean project structure separating concerns

### Logging & Observability
- Implement structured logging with consistent log levels (error, warn, info, debug)
- Log all critical operations with timing and context information
- Set up error tracking to capture and alert on application errors
- Use correlation IDs to track requests across services where applicable
- Implement health check endpoints for services

### Naming Conventions
- Use meaningful and descriptive names for variables, functions, and components
- Use PascalCase for type names and interfaces
- Use camelCase for variables and functions
- Use UPPER_CASE for constants
- Use lowercase with dashes for directories (e.g., `utils/auth-helper`)

### TypeScript Import/Export Best Practices
- Use path aliases for clean, maintainable imports (e.g., `@/lib/...`)
- Use explicit `type` imports for TypeScript types
- Use explicit file paths for type imports (include `/index`)
- When encountering module resolution errors, check import syntax, file extensions, and `tsconfig.json` paths
- Prefer explicit imports over barrel exports for better tree-shaking

### Testing Focus
- **Unit Tests**: Test critical functionality (business logic, utility functions)
- **Integration Tests**: Test full request/response cycles for APIs
- **Component Tests**: Test behavior with different props/state combinations
- **Prefer single test runs** during development for performance: `npm test path/to/test.ts`
- Run unit tests after completing medium-sized tasks to catch bugs early
- Mock dependencies until they're built, then swap to real implementations
- Write maintainable tests with descriptive names grouped in describe blocks

### Development Server Validation
After starting any development server:
- ALWAYS check the server output for warnings, errors, or compilation issues
- Monitor logs and address any issues before proceeding
- Ensure environment variables are properly loaded

---

## Production Deployment Essentials

### Pre-Deployment Checklist
- **Clean Build Verification**: Start with a clean build (remove cache directories)
- **Environment Variables**: Verify all required environment variables are documented and available
- **Build Testing**: Test build process locally to catch strict mode issues early
- **Dependency Check**: Ensure all external services and dependencies are accessible
- **Security Review**: Validate security configuration is production-ready
- **Performance**: Check for obvious performance bottlenecks before deployment

### Monitoring Post-Deployment
- Monitor application logs for errors and warnings
- Track critical metrics (response times, error rates, availability)
- Set up alerts for failure conditions
- Test all critical user flows after deployment
- Document service URLs and deployment details for future reference

---

## Response Constraints

- Do not remove existing code unless necessary
- Do not remove comments or commented-out code unless necessary
- Do not change code formatting unless important for new functionality
- Maintain existing patterns and conventions in the codebase

---

## Project-Specific Guidance

Each project in this directory may have its own CLAUDE.md file with project-specific guidance. Always check for and follow the project-specific rules in addition to this global guidance.

**Project-specific files take precedence over global guidance** when there are conflicts.

**Personal vs team config**: Use `CLAUDE.md` (committed to git) for team-shared guidance. Use `.claude.local.md` (gitignored) for personal preferences, local paths, or machine-specific setup that shouldn't be shared.

Examples of project-specific guidance:
- Framework choices (Next.js, Express, etc.)
- Database providers (Supabase, MongoDB, etc.)
- UI frameworks (React, Vue, etc.)
- CSS frameworks (Tailwind, Bootstrap, etc.)
- Deployment platforms (Cloud Run, Vercel, etc.)
- Architecture patterns and design decisions
- Domain-specific best practices

---

## Maintenance Guidelines

Update this file when:
- [ ] Adding new universal best practices
- [ ] Discovering patterns that apply across multiple projects
- [ ] Adding new testing or TDD guidance
- [ ] Changing global security or deployment practices
