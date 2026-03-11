# Pipeline SVG Graphic — Design Spec

## Goal

Create an SVG graphic showing the full harness engineering pipeline from planning through production push. Embedded in the README as a hero-level visual between the opening text and the first content section.

## Visual Design

### Style: Dark Tech / Blueprint

- Background: `#0D1117` (GitHub dark)
- Card/node backgrounds: `#161B22`
- Border/accent colors per phase (GitHub palette):
  - PLAN: `#58A6FF` (blue)
  - EXECUTE: `#3FB950` (green)
  - COMMIT: `#D29922` (amber)
  - PUSH: `#F85149` (red)
- Text: `#C9D1D9` (primary), `#8B949E` (secondary)
- Font: monospace for phase labels, sans-serif for sub-steps

### Layout: Timeline with Numbered Nodes

- Horizontal left-to-right flow
- Gradient progress bar spanning full width behind the nodes
  - Gradient: `#58A6FF` → `#3FB950` → `#D29922` → `#F85149`
  - Opacity: 0.3 for subtlety
- 4 numbered circles (1-4) sitting on the progress bar
  - Dark fill (`#161B22`), colored border (2px), colored glow (`box-shadow` equivalent via SVG filter)
  - Size: ~40px diameter
- Phase label below each circle in monospace, colored to match
- Sub-steps hang below each label with colored left-border accent

### Title

- "From Idea to Production" in monospace, uppercase, letter-spacing: 3px, opacity 0.6
- Centered above the timeline

### Content Per Phase

**1. PLAN** (blue)
- Brainstorm / Spec
- Design Doc
- Adversarial Review
- Multi-LLM Debate

**2. EXECUTE** (green)
- Task Decomposition
- Subagent Dispatch
- TDD: Red → Green → Refactor
- Spec Compliance Review
- Code Quality Review

**3. COMMIT** (amber)
- ESLint Auto-Fix
- Secret Scan
- File Size Check
- Doc Generation
- Drift Warning

**4. PUSH** (red)
- Test Suite (SHA cached)
- Dependency Audit

## Technical Requirements

- Pure SVG (no external dependencies, no JavaScript)
- Renders correctly on GitHub (GitHub sanitizes SVG — no `<foreignObject>`, no CSS `@import`, no external fonts)
- Inline styles only (GitHub strips `<style>` blocks from SVGs in READMEs)
- SVG filters for glow effects (GitHub supports basic SVG filters)
- Viewbox-based sizing for responsiveness
- File location: `assets/pipeline.svg`
- README embedding: `<div align="center"><img src="assets/pipeline.svg" alt="Pipeline: Plan → Execute → Commit → Push" width="900"></div>`
- Place between the opening text and the Table of Contents

## Dimensions

- Target width: ~900px rendered in README
- SVG viewBox: `0 0 960 340` (approximate — adjust for content fit)
- Each phase column: ~220px wide with ~20px gaps
- EXECUTE column slightly wider (1.2x) to accommodate 5 sub-steps

## GitHub SVG Constraints

GitHub's SVG sanitizer strips:
- `<script>` tags
- `<foreignObject>` elements
- `<style>` blocks (must use inline `style` attributes)
- External resource references (`@import`, `url()` to external)
- Event handlers (`onclick`, etc.)

GitHub preserves:
- `<filter>` elements with `<feGaussianBlur>`, `<feFlood>`, `<feMerge>`
- Inline `style` attributes
- `<text>`, `<rect>`, `<circle>`, `<line>`, `<path>` elements
- `<linearGradient>`, `<radialGradient>` in `<defs>`
- `viewBox` and responsive sizing
