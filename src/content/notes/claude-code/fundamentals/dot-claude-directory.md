---
title: "The .claude Directory"
topic: "Claude Code"
subtopic: "Fundamentals"
date: "2026-04-01"
description: "Exploring ~/.claude/ and project .claude/ — settings, memory, plans, tasks, and skills"
tags: ["claude-code", "configuration", "memory", "fundamentals"]
draft: false
---

# The .claude Directory

Claude Code uses two `.claude/` directories: one at your home directory (`~/.claude/`) for global personal config, and one at the root of each project (`.claude/`) for project-specific config. Understanding which is which — and what lives where — is the key to getting the most out of Claude Code.

---

## Two Scopes: Global vs. Project

| | Global (`~/.claude/`) | Project (`.claude/`) |
|--|--|--|
| **Scope** | All projects | This project only |
| **Committed to git** | No — never | Yes — usually |
| **Who sees it** | Just you | Your whole team |
| **Use for** | Personal preferences | Team standards |
| **Takes precedence** | Lower | Higher |

When the same setting exists in both, the **project-level wins** for scalar values (like `model`). For array settings (like `permissions.allow`), values from both scopes are **combined**.

---

## Project-Level: `.claude/`

These files live at the root of your repo and are usually committed to version control.

### `.claude/settings.json`

The main enforcement file. Controls permissions, hooks, model defaults, and environment variables for everyone on the team:

```json
{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git log *)", "Read"],
    "deny": ["Bash(rm -rf *)"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npm run lint --silent 2>&1 | tail -20" }]
      }
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

Key fields: `model`, `permissions.allow`, `permissions.deny`, `hooks`, `env`, `statusLine`, `outputStyle`.

### `.claude/settings.local.json`

Your personal overrides for this project. **Auto-added to `.gitignore`** — not shared with the team. Useful when you need different permissions than the team config, or want to experiment without affecting others. Same schema as `settings.json`.

### `.claude/commands/`

Single-file slash commands. Drop a markdown file here and it becomes `/filename` in Claude Code:

```
.claude/commands/
├── new-note.md       → /new-note
└── atomic-plan.md    → /atomic-plan
```

Each file is a prompt template that Claude runs when you type the command. Commands are a simpler format than skills — no subdirectory required, just a `.md` file.

### `.claude/agents/`

Custom subagent definitions. Each `.md` file defines a specialized agent with its own prompt, tool access, and optionally its own model. Claude can delegate tasks to these agents, or you can invoke them directly. Agents run in a fresh context window, isolated from the main conversation.

---

## Global-Level: `~/.claude/`

These files are personal to your machine and never committed to any repo.

### `~/.claude/settings.json`

Your default settings for all projects — permissions you always allow, your preferred model, notification hooks. Project settings override matching keys here.

### `~/.claude/CLAUDE.md`

Personal preferences that apply in every project. Use this for response style preferences, commit format rules, or personal conventions that have nothing to do with the specific project.

### `~/.claude/commands/`

Personal slash commands available in every project. Same format as project commands.

### `~/.claude/projects/`

**Auto memory** — Claude's notes to itself, per project. This is machine-local and never shared:

```
~/.claude/projects/
└── -home-user-code-myapp/
    └── memory/
        ├── MEMORY.md        ← index (first 200 lines loaded at session start)
        ├── architecture.md
        ├── build-and-test.md
        └── debugging.md
```

Claude creates and maintains these files automatically. The `MEMORY.md` index is loaded at session start (up to 200 lines or 25KB). Topic files are loaded on-demand when relevant to the current task. You can read, edit, or delete any of these files — they're plain markdown.

**This is separate from CLAUDE.md.** Auto memory is for notes Claude writes to itself about things it discovers (build commands, debugging insights, architectural patterns). CLAUDE.md is instructions you write for Claude.

### `~/.claude/plans/`

Claude Code's saved plans from `/plan` mode sessions. Plans are stored per-project and per-session here. You typically don't interact with these directly — they're managed through Claude Code's UI.

### `~/.claude/sessions/`

Conversation history. Each session is stored here and can be resumed with `claude --resume <id>` or `claude --continue`.

### `~/.claude.json`

App state file (note: it's at `~/.claude.json`, not inside `~/.claude/`). Stores OAuth tokens, UI preferences, personal MCP server configs, and per-project state. Managed via `/config` — don't edit manually.

---

## Settings Precedence (Highest to Lowest)

1. Managed policy (`/etc/claude-code/managed-settings.json`) — set by IT, cannot be overridden
2. CLI flags (`--permission-mode`, `--settings`, etc.)
3. Local settings (`.claude/settings.local.json`)
4. Project settings (`.claude/settings.json`)
5. User settings (`~/.claude/settings.json`)

---

## Useful Inspection Commands

| Command | What it shows |
|---------|--------------|
| `/memory` | Loaded CLAUDE.md files, rules, and auto memory |
| `/permissions` | Current allow and deny rules |
| `/hooks` | Active hook configurations |
| `/context` | Token usage breakdown (system prompt, memory, tools, messages) |
| `/skills` | Available skills from project and user |
| `/mcp` | Connected MCP servers |
| `claude doctor` | Full health check of installation and config |

---

## This Project's .claude/ Directory

```
.claude/
├── settings.json         ← PostToolUse hook: runs ESLint after every file edit
├── settings.local.json   ← Local overrides (gitignored)
└── commands/
    ├── new-note.md       → /new-note: scaffolds a new note with frontmatter
    └── atomic-plan.md    → /atomic-plan: creates an atomic task plan
```

The `PostToolUse` hook is the most immediately useful thing here — it runs ESLint after every `Edit` or `Write` operation, so Claude sees lint errors immediately and can fix them in the same turn.
