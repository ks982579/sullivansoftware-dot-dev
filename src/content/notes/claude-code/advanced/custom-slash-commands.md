---
title: "Custom Slash Commands (Skills)"
topic: "Claude Code"
subtopic: "Advanced"
date: "2026-04-01"
description: "Creating your own / commands using the Skills system, with a worked /new-note example"
tags: ["claude-code", "skills", "slash-commands", "customization", "advanced"]
draft: false
---

# Custom Slash Commands (Skills)

Claude Code lets you create your own `/commands` — reusable prompts that you invoke with a slash command. The modern format is **skills**; the older format is **commands**. Both work, but skills are more powerful.

---

## Commands vs Skills

**Commands** (`.claude/commands/<name>.md`) are the simple format: one markdown file, one slash command. Still supported, but skills supersede them.

**Skills** (`.claude/skills/<name>/SKILL.md`) are the full-featured format: a directory that can bundle supporting files (templates, reference docs, scripts) alongside the main prompt file.

If both exist with the same name, the skill wins.

---

## The Simple Format: Commands

Drop a markdown file in `.claude/commands/`:

```
.claude/commands/review.md  →  /review
.claude/commands/new-note.md  →  /new-note
```

The file content is the prompt Claude runs when you type the command. Use `$ARGUMENTS` to capture what you type after the command name:

```markdown
Review the following code for security issues and suggest improvements.

Code to review: $ARGUMENTS
```

Invoke with: `/review src/auth.ts`

---

## The Full Format: Skills

Skills live in a directory with a `SKILL.md` file:

```
.claude/skills/
└── deploy/
    ├── SKILL.md          ← required
    ├── checklist.md      ← reference doc Claude can read
    └── scripts/
        └── verify.sh     ← helper script
```

The `SKILL.md` file has YAML frontmatter followed by the prompt:

```markdown
---
name: deploy
description: Run the deployment checklist and deploy to staging. Use when the user asks to deploy or push to staging.
argument-hint: [environment]
allowed-tools:
  - Bash(npm run *)
  - Bash(git *)
  - Read
---

# Deploy to $0

Run through @checklist.md before deploying.

Arguments: $ARGUMENTS
```

---

## SKILL.md Frontmatter Fields

| Field | Description |
|-------|-------------|
| `name` | The slash command name — becomes `/name`. Lowercase, hyphens, numbers only (max 64 chars). Defaults to directory name if omitted. |
| `description` | **Recommended.** What the skill does and when to use it. Claude reads this to decide whether to auto-invoke. Front-load the key use case — descriptions truncate at 250 chars. |
| `argument-hint` | Hint shown in autocomplete. E.g., `[filename]` or `[issue-number]`. |
| `allowed-tools` | Tools Claude can use without prompting when this skill runs. E.g., `Read, Bash(git *)`. |
| `model` | Override the model for this skill. |
| `effort` | Override effort level: `low`, `medium`, `high`, `max`. |
| `context` | Set to `fork` to run the skill in an isolated subagent (fresh context window). |
| `agent` | Which subagent type to use with `context: fork`. |
| `paths` | Glob patterns that limit when the skill auto-activates. E.g., `src/**/*.ts`. |
| `disable-model-invocation` | `true` = only you can trigger it manually. Claude won't auto-invoke. |
| `user-invocable` | `false` = hidden from the `/` menu. Only Claude can invoke it. |
| `shell` | Shell for `!` commands: `bash` (default) or `powershell`. |

---

## String Substitutions

| Variable | Value |
|----------|-------|
| `$ARGUMENTS` | Everything typed after the command name |
| `$0`, `$1`, `$2` | Positional arguments (space-separated) |
| `$ARGUMENTS[0]`, `$ARGUMENTS[1]` | Same as `$0`, `$1` |
| `${CLAUDE_SESSION_ID}` | Current session ID — useful for logging |
| `${CLAUDE_SKILL_DIR}` | Absolute path to the skill's directory — use to reference bundled files |

If the prompt doesn't contain `$ARGUMENTS` at all, Claude Code appends `ARGUMENTS: <your input>` automatically so Claude still sees what you typed.

---

## Shell Injection: `!` Commands

Prefix a line with `` !`command` `` to run a shell command **before** Claude sees the prompt. The output replaces the placeholder:

```markdown
---
name: pr-summary
description: Summarize the current pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context

- Diff: !`gh pr diff`
- Comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

Summarize this pull request for a reviewer who hasn't seen it before.
```

When you run `/pr-summary`, the `gh` commands execute first, their output is injected, and Claude receives the fully-rendered prompt with real PR data.

---

## Auto-Invocation

Claude reads all `description` fields at session start. If your description matches what a user is asking, Claude loads and runs the skill automatically — without you typing `/skill-name`.

Control this with:
- `disable-model-invocation: true` — only manual invocation
- `user-invocable: false` — Claude can invoke but it won't appear in the `/` menu
- `paths: src/**/*.ts` — only auto-activates when working with matching files

---

## Scope: Project vs Global

| Location | Applies to |
|----------|-----------|
| `.claude/skills/<name>/` | This project only — committed to git |
| `.claude/commands/<name>.md` | This project only — committed to git |
| `~/.claude/skills/<name>/` | All your projects — personal |
| `~/.claude/commands/<name>.md` | All your projects — personal |

Project-level takes precedence over global when names conflict.

---

## Worked Example: `/new-note`

This project has a `/new-note` command at `.claude/commands/new-note.md`. Here's how it's structured:

```markdown
---
name: new-note
description: Scaffold a new note file in src/content/notes/ with frontmatter pre-filled.
  Use when the user asks to create a new note, add a note, or uses /new-note.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash(ls *)
  - Bash(mkdir *)
---

# /new-note — Scaffold a New Note

Create a new note file in `src/content/notes/` with proper frontmatter.

Arguments passed: $ARGUMENTS

## Steps

1. **Parse arguments** — expect format: `<topic-folder>/<subtopic-folder>/<slug>` ...
2. **Check the target path** — if it doesn't exist, confirm before creating
3. **Check for existing file** — warn and stop if slug already exists
4. **Write the file** with frontmatter and a placeholder body
5. **Confirm** — report the created path; remind user `draft: true` hides it
```

Key design decisions:
- `user-invocable: true` — shows in the `/` menu, intentional for this workflow
- `allowed-tools` — scoped to just what the note scaffolding needs; no Bash(rm *) or network calls
- `$ARGUMENTS` — captures the path/slug typed after `/new-note`
- Numbered steps — clear structure helps Claude follow the workflow reliably

---

## Tips

**Be specific in descriptions.** Claude uses descriptions to match user intent. "Scaffold a new note file in `src/content/notes/`" is better than "create a note" because it anchors to the specific action and location.

**Use `context: fork` for isolated tasks.** If your skill does something self-contained (e.g., a PR review), forking to a subagent keeps it out of your main conversation history.

**Bundle reference files.** Skills can pull in supporting files with `@path/to/file` imports in the SKILL.md. Put a checklist, style guide, or template in the skill directory and reference it: `Follow @${CLAUDE_SKILL_DIR}/checklist.md`.

**Use `allowed-tools` to scope permissions.** Don't give a read-only analysis skill access to `Bash(rm *)`. The tighter the tool list, the less likely the skill causes unintended side effects.
