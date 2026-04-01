---
title: "AGENTS.md and the Instruction File Landscape"
topic: "Claude Code"
subtopic: "Comparisons"
date: "2026-04-01"
description: "AGENTS.md, CLAUDE.md, .cursorrules, copilot-instructions.md — what's universal vs tool-specific"
tags: ["claude-code", "agents-md", "cursorrules", "comparison", "ai-tools"]
draft: false
---

# AGENTS.md and the Instruction File Landscape

Every major AI coding tool has invented its own version of the same idea: a markdown file that tells the AI how your project works, what conventions to follow, and what commands to run — loaded automatically at the start of every session so you don't have to repeat yourself.

The files have different names. The concept is the same.

---

## The Universal Pattern

All of these files solve the same problem: **AI models have no memory between sessions.** Without a persistent instruction file, you're re-explaining your project's conventions every time. With one, the AI starts every session already knowing the basics.

The pattern that's converged across tools:

- Plain Markdown, natural language instructions
- Lives in the repository (usually root or a config directory)
- Committed to version control so the whole team benefits
- Loaded automatically — no manual invocation
- Covers: build commands, test commands, coding conventions, architecture context, things the AI should or shouldn't do

---

## The Files, Compared

| Tool | File | Location | Notes |
|------|------|----------|-------|
| **Claude Code** | `CLAUDE.md` | `./`, `./.claude/`, `~/.claude/` | Multi-level hierarchy, `@import` syntax, path-scoped rules in `.claude/rules/` |
| **OpenAI Codex** | `AGENTS.md` | Repo root → CWD, `~/.codex/` | Hierarchical discovery, 32KB limit, now stewarded by the Agentic AI Foundation |
| **Cursor** | `.cursor/rules/*.md` | `.cursor/rules/` directory | YAML frontmatter, four application modes (always/intelligent/glob/manual) |
| **GitHub Copilot** | `copilot-instructions.md` | `.github/` | Single file, auto-included in every request |
| **Cursor (legacy)** | `.cursorrules` | Project root | Flat file, always applied, predates current rules system |

---

## AGENTS.md: The Emerging Cross-Tool Standard

`AGENTS.md` was introduced by OpenAI for their Codex tool and has since been adopted more broadly. It's now stewarded by the **Agentic AI Foundation** (under the Linux Foundation) as an open standard, and is described as compatible with GitHub Copilot, Cursor, OpenAI Codex, Google Jules, Aider, and other platforms.

The appeal: one file that works everywhere, rather than maintaining a separate instruction file for each tool your team uses.

**How Codex uses AGENTS.md:**

Codex reads AGENTS.md files before executing any task. Discovery works hierarchically — from `~/.codex/AGENTS.md` (global) down through the repo root to the current working directory, with files closer to the CWD taking higher precedence. Multiple files merge top-to-bottom. There's a 32KB combined limit.

You can also use nested `AGENTS.md` files in subdirectories for directory-specific rules — useful in monorepos where different packages have different conventions.

```markdown
# AGENTS.md

## Testing
Always run `npm test` after modifying any JavaScript files.
Never skip tests when submitting changes.

## Dependencies
Use `npm install` not `yarn` or `pnpm`.
Pin exact versions in package.json — no `^` or `~`.

## Code Style
TypeScript only — no `.js` files in src/.
Use 2-space indentation.
```

---

## How Claude Code Handles AGENTS.md

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. It will not automatically pick up an `AGENTS.md` file.

However, the official guidance for repos that already have an `AGENTS.md` is to import it into your `CLAUDE.md`:

```markdown
# CLAUDE.md

@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
Do not edit files in `generated/` — they are auto-generated.
```

Claude loads the imported AGENTS.md at session start, then appends the rest of CLAUDE.md. This means a single `AGENTS.md` can serve as the shared base for all tools, with tool-specific additions in each tool's native file.

**Practical approach for teams using multiple tools:**

1. Put shared conventions in `AGENTS.md` (testing requirements, build commands, coding standards)
2. Create `CLAUDE.md` that imports `AGENTS.md` and adds Claude Code-specific instructions
3. Cursor's `.cursor/rules/` can also reference the same content, or import from AGENTS.md
4. Keep tool-specific features (Claude Code hooks, Cursor rules modes, etc.) in their native files

---

## What's Universal vs. Tool-Specific

**Universal across all tools:**
- Build and test commands
- Coding conventions (indentation, naming, language preferences)
- Project structure and where things live
- What the AI should and shouldn't do
- Architecture context that isn't obvious from the code

**Claude Code-specific (don't put in AGENTS.md):**
- `@import` directives (only Claude Code understands this syntax)
- References to `.claude/rules/` for path-scoped rules
- Hook configurations
- MCP server references
- Auto-memory instructions

**Cursor-specific (use `.cursor/rules/` frontmatter for):**
- Glob-based file type scoping (`globs: ["**/*.tsx"]`)
- Apply mode control (`alwaysApply: false`)
- Intelligent application based on context description

**Copilot-specific:**
- GitHub-specific context (PR review behavior, issue linking)
- `@workspace` participant hints

---

## Cursor's Rules System in Detail

Cursor's current rules live in `.cursor/rules/` as Markdown files with optional YAML frontmatter:

```yaml
---
description: "React component conventions — applies when editing tsx files"
alwaysApply: false
globs: ["**/*.tsx", "**/*.jsx"]
---

- Functional components only, no class components
- Use named exports, not default exports
- Co-locate styles in a `.module.css` file with the same name
- All props should have explicit TypeScript types
```

**Four application modes:**

| Mode | When it fires |
|------|--------------|
| **Always Apply** | Every chat session, no matter what |
| **Apply Intelligently** | AI decides based on the `description` field |
| **Apply to Specific Files** | Active file matches the `globs` patterns |
| **Apply Manually** | Only when you `@rule-name` it explicitly |

This is more granular than CLAUDE.md's single-file approach — you can have rules that only fire when editing test files, or only when working in a specific package. Claude Code's `.claude/rules/` directory provides similar path-scoping, but with different syntax.

Notably, Cursor also now supports `AGENTS.md` as a simpler alternative to `.cursor/rules/`.

---

## GitHub Copilot's Instructions File

The simplest of the bunch. Create `.github/copilot-instructions.md` and write natural language instructions. That's it.

```markdown
# Project Instructions

This is a Django REST API. Use Python 3.12+.
Always run `pytest tests/` before suggesting changes.
API endpoints follow REST conventions: plural nouns, no verbs.
Authentication uses JWT — see src/auth/ for the middleware.
```

No YAML frontmatter, no scoping, no hierarchy. Every Copilot request in this repo includes this file. You can verify it was included by checking the "References" list in any Copilot chat response.

Simpler than CLAUDE.md or Cursor's rules — but no path scoping, no imports, no multi-level hierarchy.

---

## The Bigger Picture

The instruction file ecosystem is converging. AGENTS.md's adoption by the Agentic AI Foundation suggests a genuine push toward a cross-tool standard — similar to how `.editorconfig` standardized basic editor settings across tools in the 2010s.

In practice today, most teams maintain tool-specific files because:
1. Each tool has features that the shared standard doesn't cover (Cursor's glob modes, Claude Code's hooks and MCP)
2. The performance characteristics differ — a well-tuned CLAUDE.md behaves differently than the same content in AGENTS.md

The pragmatic approach: use `AGENTS.md` for the shared baseline (conventions, commands, architecture), and extend in each tool's native format for tool-specific capabilities.
