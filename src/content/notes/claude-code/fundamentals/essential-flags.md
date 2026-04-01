---
title: "Essential CLI Flags"
topic: "Claude Code"
subtopic: "Fundamentals"
date: "2026-04-01"
description: "The most useful claude command-line flags: --print, --model, --continue, --resume, and more"
tags: ["claude-code", "cli", "flags", "fundamentals"]
draft: false
---

# Essential CLI Flags

Most people use Claude Code interactively — type a message, get a response. But the CLI has flags that unlock non-interactive workflows, scripting, CI pipelines, and session management. These are the ones worth knowing.

---

## Non-Interactive Mode: `--print` / `-p`

The most important flag. `--print` runs Claude with a prompt and prints the response to stdout, then exits. No REPL, no waiting — perfect for shell scripts and automation.

```bash
# Basic usage
claude -p "summarize the changes in this PR"

# Pipe input in
cat error.log | claude -p "what caused this?"

# Use in shell scripts
REVIEW=$(claude -p "review this function for security issues" < auth.ts)
echo "$REVIEW"
```

Pair with `--output-format json` for structured output in scripts:

```bash
claude -p "list the API endpoints in this file" --output-format json < routes.ts
```

Or stream JSON events as they arrive (useful for long-running tasks):

```bash
claude -p "refactor this module" --output-format stream-json
```

---

## CI/CD and Automation Patterns

The `-p` flag is the bridge between Claude Code and your existing shell tooling:

```bash
# Analyze recent logs
tail -200 app.log | claude -p "flag any anomalies and suggest fixes"

# Review changed files before a commit
git diff --staged --name-only | claude -p "check these files for security issues"

# Generate a release summary
git log v1.2.0..HEAD --oneline | claude -p "write release notes from these commits"

# Automate repetitive tasks in CI
claude -p "translate any new i18n strings into French and open a PR"
```

---

## Model Selection: `--model` / `-m`

Override the default model for a session. Use aliases for convenience:

```bash
claude --model opus          # Claude Opus (most capable)
claude --model sonnet        # Claude Sonnet (balanced)
claude -m claude-opus-4-6    # Exact model ID
```

Available aliases: `sonnet`, `opus`. Full model IDs like `claude-sonnet-4-6` also work. The default model is set in `settings.json`.

---

## Session Continuity: `--continue` and `--resume`

### `--continue` / `-c`

Resume the most recent conversation in the current directory:

```bash
claude --continue
claude -c -p "now add tests for what you just wrote"
```

Useful after closing a session mid-task and picking it back up.

### `--resume` / `-r`

Resume a specific session by name or ID:

```bash
claude --resume auth-refactor
claude -r auth-refactor -p "finish the password reset flow"
```

Sessions can be named at start with `--name`:

```bash
claude --name "auth-refactor"
```

Then resumed by that name later. Run `claude --resume` with no argument to get an interactive picker showing recent sessions.

---

## Limiting Agent Actions: `--max-turns`

In `-p` mode, Claude will run as many "turns" as it needs to complete a task (reading files, running commands, editing code). Use `--max-turns` to cap this for scripts or safety:

```bash
# Stop after 5 agentic turns
claude -p --max-turns 5 "fix the failing tests"
```

Claude exits with an error if the turn limit is reached without completing the task.

---

## Budget Control: `--max-budget-usd`

Cap spending on a single run — useful for long-running automation:

```bash
claude -p --max-budget-usd 2.00 "audit the entire codebase for N+1 queries"
```

---

## Tool Control: `--allowedTools` and `--disallowedTools`

Restrict which tools Claude can use in a session:

```bash
# Only allow read operations — no edits, no shell commands
claude --allowedTools "Read,Glob,Grep"

# Allow specific bash patterns only
claude --allowedTools "Bash(git log *)" "Bash(git diff *)" "Read"

# Remove a specific tool entirely
claude --disallowedTools "Bash"
```

Useful for review-only workflows where you want Claude to analyze but not change anything.

---

## Permission Mode: `--permission-mode`

Start a session in a specific permission mode:

```bash
claude --permission-mode plan       # Plan only — no file edits or commands
claude --permission-mode acceptEdits # Accept file edits, prompt for commands
claude --permission-mode bypassPermissions  # Skip all permission prompts
```

The `plan` mode is particularly useful for reviewing what Claude intends to do before letting it act.

---

## Adding Extra Directories: `--add-dir`

Grant Claude access to directories outside your current working directory:

```bash
# Access a shared library alongside your project
claude --add-dir ../shared-lib ../design-tokens
```

Claude can read and edit files in these directories but won't pick up their `.claude/` configuration.

---

## Verbose Output: `--verbose`

Show full turn-by-turn output including tool calls and intermediate steps:

```bash
claude --verbose
claude -p --verbose "build the auth module"
```

Useful for debugging what Claude is doing — especially in CI where you want a full audit trail.

---

## MCP Config Override: `--mcp-config`

Load a specific MCP server configuration file for a session:

```bash
claude --mcp-config ./mcp-dev.json
claude --strict-mcp-config --mcp-config ./mcp-prod.json
```

`--strict-mcp-config` ignores all other MCP configuration and uses only the specified file — useful for isolated testing.

---

## Bare Mode: `--bare`

Strip out all auto-discovery: no CLAUDE.md, no hooks, no skills, no MCP, no auto memory. Claude starts with just Bash, Read, and Edit:

```bash
claude --bare -p "check this file" < myfile.ts
```

Useful for fast, focused scripted calls where startup overhead matters and project config is irrelevant.

---

## System Prompt Customization

Replace or extend Claude's default system prompt:

```bash
# Replace entirely
claude --system-prompt "You are a Python expert focused on performance"

# Append to the default prompt
claude --append-system-prompt "Always explain your reasoning before writing code"

# Load from file
claude --system-prompt-file ./review-mode-prompt.txt
```

---

## Quick Reference

| Flag | Short | What it does |
|------|-------|-------------|
| `--print` | `-p` | Non-interactive mode, print response to stdout |
| `--output-format` | | `text`, `json`, or `stream-json` |
| `--model` | `-m` | Override model (`sonnet`, `opus`, or full ID) |
| `--continue` | `-c` | Resume most recent session |
| `--resume` | `-r` | Resume session by name or ID |
| `--name` | `-n` | Name the current session |
| `--max-turns` | | Cap agentic turns (print mode only) |
| `--max-budget-usd` | | Cap API spend (print mode only) |
| `--allowedTools` | | Whitelist specific tools |
| `--disallowedTools` | | Remove specific tools |
| `--permission-mode` | | Start in `plan`, `acceptEdits`, or `bypassPermissions` |
| `--add-dir` | | Grant access to additional directories |
| `--verbose` | | Show full turn-by-turn output |
| `--mcp-config` | | Load MCP servers from a file |
| `--bare` | | Skip all auto-discovery for fast scripted calls |
| `--system-prompt` | | Replace default system prompt |
| `--append-system-prompt` | | Append to default system prompt |
| `--version` | `-v` | Print installed version |
