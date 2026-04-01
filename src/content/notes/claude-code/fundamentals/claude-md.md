---
title: "The CLAUDE.md File"
topic: "Claude Code"
subtopic: "Fundamentals"
date: "2026-04-01"
description: "What CLAUDE.md is, why it matters, how it's structured, and how Claude Code discovers it"
tags: ["claude-code", "claude-md", "configuration", "fundamentals"]
draft: false
---

# The CLAUDE.md File

`CLAUDE.md` is the primary way to give Claude Code persistent, project-level instructions. Unlike a chat message, CLAUDE.md is loaded into Claude's context at the start of every session — it's always there, without you having to repeat yourself.

Think of it as the README for Claude: it tells the AI how your project works, what conventions to follow, and what commands to run.

---

## How Claude Code Discovers CLAUDE.md

When you run `claude` in a directory, Claude Code walks **up the directory tree** and loads every CLAUDE.md it finds. The lookup order, from highest to lowest priority:

| Priority | Location | When to Use |
|----------|----------|-------------|
| **1 — Managed policy** | `/etc/claude-code/CLAUDE.md` (Linux/WSL) | Organization-wide rules, set by IT |
| **2 — Project root** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project conventions, committed to git |
| **3 — User global** | `~/.claude/CLAUDE.md` | Personal preferences across all projects |

More specific locations take precedence over broader ones. If your project is at `~/code/myapp/`, Claude loads both `~/code/myapp/CLAUDE.md` and `~/code/CLAUDE.md` if both exist. Subdirectory CLAUDE.md files are loaded **on demand** — only when Claude reads a file in that directory, not at launch.

> **Key insight:** All discovered CLAUDE.md files are loaded together (not merged or overridden). The project file doesn't replace the user file — both are active simultaneously.

---

## What Belongs in CLAUDE.md

CLAUDE.md is for **team-shared, project-level instructions** that Claude should always know:

- Build and test commands (`npm run dev`, `pytest tests/`, etc.)
- Coding standards ("use 2-space indentation", "prefer `const` over `let`")
- Architectural context ("API handlers live in `src/api/handlers/`")
- Naming conventions
- Common workflows ("always run `npm run lint` before committing")
- Rules about what Claude should or shouldn't do in this repo

**What doesn't belong here:**
- Personal preferences — put those in `~/.claude/CLAUDE.md`
- Task-specific one-off instructions — just type them in the chat
- Information already obvious from the code

---

## Recommended Structure

Keep CLAUDE.md **under 200 lines**. Longer files consume more context window and reduce how reliably Claude follows the instructions. Use headers and bullets — organized structure is easier for Claude to parse than dense paragraphs.

Write instructions concrete enough to verify:

```markdown
# ✅ Good (specific and verifiable)
- Use 2-space indentation for all TypeScript files
- Run `npm run test:unit` before submitting any PR

# ❌ Bad (too vague to act on)
- Format code properly
- Make sure tests pass
```

A typical CLAUDE.md for a web project:

```markdown
# Project Instructions

## Build & Test
- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm run test`
- Lint: `npm run lint`

## Conventions
- TypeScript everywhere — no plain JS files
- Components live in `src/components/`
- API routes live in `src/app/api/`
- Use `kebab-case` for file names

## Git Workflow
- Branch from `main`, name branches `feature/<slug>` or `fix/<slug>`
- Commit messages follow Conventional Commits format

## What NOT to Do
- Do not edit files in `generated/` — they are auto-generated
- Do not add `console.log` to production code
```

---

## Import Additional Files

Use `@path/to/file` to pull in content from other files:

```markdown
# CLAUDE.md

See @README for project overview and @package.json for available npm scripts.

## Additional rules
- Coding style: @docs/style-guide.md
- Git workflow: @docs/git-workflow.md
```

Both relative and absolute paths work. Home-directory paths (`@~/.claude/personal-rules.md`) also work. Imports are expanded into the context at session start — limit recursive imports to 5 hops.

> **First use:** When Claude encounters a new external import, it shows an approval dialog before loading it.

---

## HTML Comments for Human Notes

Block-level HTML comments are stripped before the file is loaded into Claude's context, so you can add maintainer notes without consuming tokens:

```markdown
<!-- Last updated: 2026-01-15. Review quarterly. -->

## Build Commands
- `npm run build`
```

Comments inside code blocks are preserved as-is.

---

## Multiple CLAUDE.md Files in a Monorepo

In large repos, ancestor CLAUDE.md files may be picked up from parent directories. To exclude specific files:

```json
// .claude/settings.local.json
{
  "claudeMdExcludes": [
    "**/other-team/.claude/rules/**",
    "/home/user/monorepo/legacy/CLAUDE.md"
  ]
}
```

Organization-wide managed policy files cannot be excluded.

---

## Generating a CLAUDE.md with /init

If you're starting from scratch, run `/init` inside a Claude Code session. It analyzes your codebase and generates a starting CLAUDE.md with your build commands, test setup, and conventions. If a CLAUDE.md already exists, it suggests improvements instead of overwriting.

---

## Inspecting What's Loaded

Run `/memory` in any Claude Code session to see:
- Which CLAUDE.md and rules files are currently loaded
- The auto-memory state
- Options to edit any loaded file directly

---

## This Repo's CLAUDE.md

The project you're reading this note in uses CLAUDE.md to record the migration plan, current status, and component conventions — it's checked into git so any contributor (or Claude Code session) gets the same context automatically.
