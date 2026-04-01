---
title: "Subagents"
topic: "Claude Code"
subtopic: "Mastery"
date: "2026-04-01"
description: "Delegating work to specialized subagents: types, foreground vs background, and effective prompting"
tags: ["claude-code", "subagents", "agents", "mastery"]
draft: false
---

# Subagents

A subagent is a separate Claude instance with its own context window that Claude Code can spawn to handle a focused task. The main conversation delegates work, the subagent executes it, and the result comes back as a summary — keeping verbose output out of your main context.

The core value proposition: **isolation**. Subagents can have different tool access, different models, different permission modes, and their own independent context. They're how you keep a long session clean, run parallel research, and enforce least-privilege for specific operations.

---

## Built-in Subagent Types

Claude Code ships with several built-in subagent types:

| Type | Model | Tools | Best for |
|------|-------|-------|---------|
| **general-purpose** | Inherits from main | All tools | Complex multi-step tasks needing both exploration and action |
| **Explore** | Haiku (fast) | Read-only (no Write/Edit) | File discovery, code search, codebase analysis |
| **Plan** | Inherits from main | Read-only (no Write/Edit) | Codebase research during plan mode sessions |
| **claude-code-guide** | Haiku | Read-only | Questions about Claude Code features and docs |
| **statusline-setup** | Sonnet | Read/Edit | Configuring the status line via `/statusline` |

**Explore** is the one you'll encounter most often in practice — Claude uses it automatically when it needs to search the codebase without making changes. It runs on Haiku for speed and is restricted to read-only tools so it literally cannot modify anything.

---

## How Subagents Work

Claude spawns a subagent using the `Agent` tool. The subagent:

1. Gets a fresh context window (no history from the main conversation)
2. Loads project context: CLAUDE.md, MCP servers, skills
3. Runs its task with its own tool access and permission mode
4. Returns a result to the main conversation

**Subagents cannot spawn other subagents.** All delegation flows from the main conversation outward, not recursively.

---

## Foreground vs. Background

**Foreground** (default): The main conversation blocks until the subagent finishes. Permission prompts and `AskUserQuestion` calls pass through to you interactively.

**Background**: The subagent runs concurrently while you continue working. Before launch, Claude Code asks for tool permissions upfront — once running, the subagent auto-denies anything not pre-approved. If it needs to ask a clarifying question mid-task, that call fails silently and the subagent continues as best it can.

To run something in the background, ask Claude explicitly:
> "Run this analysis in the background while we continue."

Or press **Ctrl+B** to background a task that's already running.

To disable all background tasks: set `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`.

---

## Custom Subagents

Define your own subagents as markdown files with YAML frontmatter. They're discovered from multiple locations in priority order:

| Location | Scope | Priority |
|----------|-------|---------|
| `--agents` CLI flag | Session only | 1 (highest) |
| `.claude/agents/<name>.md` | Project (committed to git) | 2 |
| `~/.claude/agents/<name>.md` | All your projects (personal) | 3 |
| Plugin's `agents/` directory | Where plugin is enabled | 4 (lowest) |

**Example:** `.claude/agents/security-reviewer.md`

```markdown
---
name: security-reviewer
description: Reviews code changes for security vulnerabilities — OWASP top 10,
  injection, auth issues, data exposure. Use when reviewing PRs or sensitive modules.
tools: Read, Glob, Grep
model: opus
---

You are a security-focused code reviewer. Analyze code for:
- Injection vulnerabilities (SQL, command, XSS)
- Authentication and authorization flaws
- Sensitive data exposure
- Insecure direct object references
- Security misconfigurations

Be specific: cite the file, line number, and exact risk.
```

### Key frontmatter fields

| Field | Description |
|-------|-------------|
| `name` | Slug used to reference the agent. Lowercase, hyphens only. |
| `description` | **Required.** Claude uses this to decide when to delegate automatically. Be specific. |
| `tools` | Allowlist — only these tools are available. Omit to inherit all. |
| `disallowedTools` | Denylist — everything except these. Applied before `tools`. |
| `model` | `sonnet`, `opus`, `haiku`, full ID, or `inherit` (default). |
| `permissionMode` | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, or `plan`. |
| `isolation` | Set to `worktree` for an isolated git worktree. |
| `memory` | `user`, `project`, or `local` — enables persistent memory across sessions. |
| `maxTurns` | Cap on agentic turns before the subagent stops. |
| `background` | `true` to always run as a background task. |
| `hooks` | Lifecycle hooks (PreToolUse, PostToolUse, Stop) scoped to this subagent. |

---

## Invoking Subagents

Three levels of commitment:

**Natural language** — Claude decides whether to delegate based on the description:
> "Review the auth module for security issues."

**@-mention** — guarantees that specific subagent runs for the task:
> "@security-reviewer look at the new OAuth implementation"

**Session default** — every task in this session uses this subagent:
```bash
claude --agent security-reviewer
```

---

## Persistent Memory

Subagents can build knowledge across sessions with the `memory` field:

```yaml
memory: project
```

This creates a `MEMORY.md` at `.claude/agent-memory/<agent-name>/` that the subagent reads at the start of each session and updates as it learns. Useful for agents that repeatedly analyze the same codebase — they remember patterns, past findings, and what's already been fixed.

- `user` scope: `~/.claude/agent-memory/<name>/` — personal, across all projects
- `project` scope: `.claude/agent-memory/<name>/` — project-level, committable to git
- `local` scope: `.claude/agent-memory-local/<name>/` — project-level, not committed

---

## When to Delegate vs. Work Directly

**Use a subagent when:**
- The task produces large, verbose output you don't need in your main context
- You want strict tool restrictions (e.g., read-only analysis, no shell access)
- The work is self-contained and can return a clean summary
- You're running parallel research on independent questions

**Work directly when:**
- The task needs frequent back-and-forth or iterative refinement
- Multiple phases share significant context
- You're making a targeted, quick change
- Latency matters (subagents spin up from scratch)

**Use Skills instead when** you want reusable prompts that run in the main conversation context, not an isolated one.

---

## Prompting Subagents Effectively

Subagents don't inherit your conversation history — **include all relevant context in the spawn prompt**.

```
# Too thin — subagent has no context
"Review the auth code for issues."

# Better — gives the subagent what it needs to do good work
"Review src/auth/ for security vulnerabilities. The app is a Next.js API with JWT
authentication. We're migrating from session cookies. Pay particular attention to
token validation in src/auth/middleware.ts and the logout flow."
```

**Design focused subagents.** One subagent that does security review well beats one that tries to review security, performance, and code style. Each subagent should excel at exactly one thing.

**Limit tool access.** If the subagent only needs to read files, set `tools: Read, Glob, Grep`. This prevents accidents and makes the subagent's capabilities legible.

**For memory-enabled subagents**, instruct them explicitly:
> "Check your memory for patterns you've observed before starting, and update it when you're done."

---

## Managing Subagents

**List and create** subagents interactively:
```
/agents
```

**Create via CLI** (for scripting):
```bash
claude --agents '{
  "linter": {
    "description": "Runs linting and reports issues",
    "tools": ["Bash(npm run lint *)", "Read"],
    "model": "haiku"
  }
}'
```

**Prevent delegation** to a specific subagent:
```json
// .claude/settings.json
{
  "permissions": {
    "deny": ["Agent(security-reviewer)"]
  }
}
```

**Resume a stopped subagent** (requires agent teams enabled): Claude uses `SendMessage` with the subagent's agent ID to continue it. Resumed subagents retain their full conversation history.
