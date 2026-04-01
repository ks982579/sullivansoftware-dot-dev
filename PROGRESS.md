# Claude Code Notes Series — Progress

Zero-to-hero notes series for the `/notes` section. Each note follows a 4-step atomic workflow: **Research → Write → Review → Publish**.

> **Atomic step legend:**
> - **Research** — identify sources, key concepts, and examples to cover before writing
> - **Write** — draft the full note content in the markdown file
> - **Review** — verify accuracy, check examples run/work, proofread for clarity
> - **Publish** — set `draft: false` in frontmatter to make the note live

---

## Introduction

### `overview.md` — What is Claude Code?
- [x] **Research** — read code.claude.com/docs overview; collect comparisons to Copilot/Cursor/chat AI
  - *Why: establishes the correct framing before any content is written*
- [x] **Write** — draft: what it is, agentic model, tool use, typical use cases
  - *Why: produces the actual note content*
- [x] **Review** — verify claims are accurate; ensure tone is accessible to shell-comfortable devs
  - *Why: prevents misinformation reaching readers*
- [x] **Publish** — set `draft: false` in `overview.md`
  - *Why: makes the note visible on the live site*

### `installation.md` — Installing Claude Code
- [x] **Research** — confirm current install methods (native curl, Homebrew, WinGet, Windows CMD) from docs; test auth flow
  - *Why: install steps change frequently and stale instructions cause immediate frustration*
- [x] **Write** — draft platform-specific install commands, auth step, first `claude` invocation
  - *Why: produces the actual note content*
- [x] **Review** — run each install command mentally; verify flags and URLs are current
  - *Why: a broken install guide is the worst first impression*
- [x] **Publish** — set `draft: false` in `installation.md`
  - *Why: makes the note visible on the live site*

### `ways-to-use.md` — Ways to Use Claude Code
- [x] **Research** — document terminal, Desktop App, VS Code ext, JetBrains ext, and Web; note feature gaps between modes
  - *Why: trade-off accuracy requires hands-on knowledge of each mode*
- [x] **Write** — draft each interface with a trade-off summary and "best for..." callout
  - *Why: produces the actual note content*
- [x] **Review** — check that extension names and install paths are current
  - *Why: IDE extension names and install flows change with versions*
- [x] **Publish** — set `draft: false` in `ways-to-use.md`
  - *Why: makes the note visible on the live site*

### `resources.md` — Claude Code Resources
- [x] **Research** — compile: official docs, Anthropic console, model API reference, GitHub repo, changelog, community links
  - *Why: a curated list is only useful if every link is valid*
- [x] **Write** — draft annotated link list with one-line description per resource
  - *Why: produces the actual note content*
- [x] **Review** — verify all URLs resolve; check for outdated or deprecated pages
  - *Why: dead links undermine credibility of the entire series*
- [x] **Publish** — set `draft: false` in `resources.md`
  - *Why: makes the note visible on the live site*

---

## Fundamentals

### `claude-md.md` — The CLAUDE.md File
- [ ] **Research** — read docs on CLAUDE.md lookup order; reference this repo's own CLAUDE.md as a real example
  - *Why: CLAUDE.md is the single most important concept for new users to internalize*
- [ ] **Write** — draft: purpose, file discovery order, recommended structure, annotated real-world example
  - *Why: produces the actual note content*
- [ ] **Review** — confirm lookup order is accurate; verify the embedded example reflects current repo state
  - *Why: an incorrect lookup order is a subtle, hard-to-debug mistake for new users*
- [ ] **Publish** — set `draft: false` in `claude-md.md`
  - *Why: makes the note visible on the live site*

### `dot-claude-directory.md` — The .claude Directory
- [ ] **Research** — explore `~/.claude/` and `.claude/` in this repo; document each key file/dir and its purpose
  - *Why: the .claude directory is opaque to new users and demystifying it builds confidence*
- [ ] **Write** — draft: global vs local scope, settings.json, MEMORY.md, memory/, plans/, tasks/, commands/
  - *Why: produces the actual note content*
- [ ] **Review** — verify file paths are correct; check that described features match current Claude Code version
  - *Why: wrong paths cause confusion when readers try to follow along*
- [ ] **Publish** — set `draft: false` in `dot-claude-directory.md`
  - *Why: makes the note visible on the live site*

### `essential-flags.md` — Essential CLI Flags
- [ ] **Research** — run `claude --help`; document the most useful flags with their effect and a usage example each
  - *Why: flags unlock non-interactive and automation workflows that aren't obvious from default usage*
- [ ] **Write** — draft: --print, --model, --continue, --resume, --no-tools, --allowedTools, --output-format, --max-turns, --verbose, --add-dir
  - *Why: produces the actual note content*
- [ ] **Review** — test each flag mentally with a concrete command; verify names haven't changed
  - *Why: a flag that doesn't exist breaks reader trust immediately*
- [ ] **Publish** — set `draft: false` in `essential-flags.md`
  - *Why: makes the note visible on the live site*

---

## Advanced

### `hooks.md` — Hooks
- [ ] **Research** — read hooks docs; review the PostToolUse lint hook added to this repo's `.claude/settings.json` as a live example
  - *Why: hooks are a power feature — concrete examples anchor abstract concepts*
- [ ] **Write** — draft: hook types (PreToolUse, PostToolUse, Stop, SubagentStop), settings.json format, env vars, use cases, this repo's hook as worked example
  - *Why: produces the actual note content*
- [ ] **Review** — verify the settings.json snippet is valid JSON and the hook actually fires as described
  - *Why: a hook example that doesn't work is worse than no example*
- [ ] **Publish** — set `draft: false` in `hooks.md`
  - *Why: makes the note visible on the live site*

### `mcp.md` — Model Context Protocol (MCP)
- [ ] **Research** — read MCP docs; survey popular MCP servers (GitHub, Postgres, Puppeteer, Brave); document `claude mcp` subcommand
  - *Why: MCP is the primary extension point for connecting Claude Code to external systems*
- [ ] **Write** — draft: what MCP is, adding servers via settings.json or --mcp-config, popular server list with use cases
  - *Why: produces the actual note content*
- [ ] **Review** — confirm server names and config formats are current; verify `claude mcp` commands are accurate
  - *Why: MCP server names and APIs evolve quickly*
- [ ] **Publish** — set `draft: false` in `mcp.md`
  - *Why: makes the note visible on the live site*

### `slash-commands.md` — Built-in Slash Commands
- [ ] **Research** — run `/help` in Claude Code; enumerate all built-in commands with their effect and any keyboard shortcuts
  - *Why: slash commands are discovered piecemeal by most users — a complete reference has high value*
- [ ] **Write** — draft: /help, /clear, /compact, /plan, /fast, /model, /memory, /review, /cost, /bug, /doctor
  - *Why: produces the actual note content*
- [ ] **Review** — verify each command exists in current Claude Code version; check for new or removed commands
  - *Why: listing a command that doesn't exist is immediately verifiable and damaging to credibility*
- [ ] **Publish** — set `draft: false` in `slash-commands.md`
  - *Why: makes the note visible on the live site*

### `custom-slash-commands.md` — Custom Slash Commands (Skills)
- [ ] **Research** — read skills/commands docs; examine the `/new-note` skill in this repo as a worked example
  - *Why: readers need a concrete, runnable example to model their own skills on*
- [ ] **Write** — draft: what skills are, where they live (.claude/commands/), SKILL.md format, trigger description, the /new-note skill dissected line-by-line
  - *Why: produces the actual note content*
- [ ] **Review** — verify the /new-note skill actually works end-to-end; confirm file paths and frontmatter fields are accurate
  - *Why: the worked example must be runnable or the note teaches a broken pattern*
- [ ] **Publish** — set `draft: false` in `custom-slash-commands.md`
  - *Why: makes the note visible on the live site*

---

## Mastery

### `planning-workflow.md` — Planning Workflow
- [x] **Research** — use /plan mode during this project and document observations; read plan mode docs
  - *Why: first-hand experience of the workflow produces more honest and useful notes*
- [x] **Write** — draft: why plan before coding, /plan activation, plan file location, the 5-phase workflow, prompting strategies
  - *Why: produces the actual note content*
- [x] **Review** — walk through the 5-phase workflow step-by-step to verify it matches actual Claude Code behaviour
  - *Why: plan mode is nuanced — imprecise description leads to cargo-culting rather than understanding*
- [x] **Publish** — set `draft: false` in `planning-workflow.md`
  - *Why: makes the note visible on the live site*

### `subagents.md` — Subagents
- [x] **Research** — read Agent tool docs; list all available subagent types with their descriptions and tool access
  - *Why: each subagent type has a specific purpose that isn't obvious from the name alone*
- [x] **Write** — draft: Agent tool, available types, foreground vs background, SendMessage continuation, when to delegate vs work directly, prompting tips
  - *Why: produces the actual note content*
- [x] **Review** — verify subagent type names and capabilities are current; check that examples illustrate real trade-offs
  - *Why: subagent types evolve — accurate type names prevent reader confusion*
- [x] **Publish** — set `draft: false` in `subagents.md`
  - *Why: makes the note visible on the live site*

### `parallel-agents.md` — Parallel Agents
- [x] **Research** — review parallel agent patterns used in this project; read worktree isolation docs
  - *Why: parallel orchestration is the highest-leverage capability and deserves concrete, tested patterns*
- [x] **Write** — draft: multiple Agent calls in one message, worktree isolation, coordination patterns, SendMessage, practical orchestration example
  - *Why: produces the actual note content*
- [x] **Review** — trace through the example step-by-step to verify it's coherent and achievable
  - *Why: an orchestration example that can't be reproduced teaches false confidence*
- [x] **Publish** — set `draft: false` in `parallel-agents.md`
  - *Why: makes the note visible on the live site*

---

## Repo Setup

- [x] **Create** `.claude/settings.json` with PostToolUse lint hook
  - *Why: surfaces ESLint errors in Claude's context immediately after every file edit*
- [x] **Create** `.claude/commands/new-note.md` — `/new-note` skill
  - *Why: automates boilerplate note scaffolding so the focus stays on content*
- [x] **Create** `.claude/commands/atomic-plan.md` — `/atomic-plan` skill
  - *Why: codifies the atomic planning process so it can be reused on any future feature*
- [x] **Edit** `CLAUDE.md` — Documentation Sync section
  - *Why: ensures Claude Code is reminded to keep docs current after structural changes*
- [x] **Create** `PROGRESS.md` — this file
  - *Why: shared atomic checklist gives both human and AI a clear, agreed-upon picture of what remains*
