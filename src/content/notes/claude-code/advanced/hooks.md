---
title: "Hooks"
topic: "Claude Code"
subtopic: "Advanced"
date: "2026-04-01"
description: "Automating actions with Claude Code hooks — PreToolUse, PostToolUse, Stop, and more"
tags: ["claude-code", "hooks", "automation", "advanced"]
draft: false
---

# Hooks

Hooks are shell commands (or HTTP calls, or LLM prompts) that Claude Code runs automatically in response to lifecycle events. They're how you enforce rules, automate repetitive actions, and integrate Claude Code into your existing tooling — without modifying any code.

**What hooks can do:**
- Run a linter after every file edit
- Block dangerous shell commands before they execute
- Send a desktop notification when Claude needs your attention
- Log every bash command to an audit file
- Prevent Claude from stopping until tests pass

---

## Hook Types

| Event | When it fires |
|-------|--------------|
| `PreToolUse` | Before a tool executes — can block or modify the tool call |
| `PostToolUse` | After a tool succeeds — can provide feedback or block on the result |
| `PostToolUseFailure` | After a tool call fails |
| `Stop` | When Claude finishes responding — can prevent stopping to request more work |
| `SubagentStop` | When a subagent finishes |
| `SubagentStart` | When a subagent is spawned |
| `UserPromptSubmit` | When the user submits a prompt, before Claude processes it |
| `PermissionRequest` | When a permission dialog appears — can auto-approve or deny |
| `Notification` | When Claude sends a notification (idle, permission prompt, auth, etc.) |
| `SessionStart` | When a session begins or resumes |
| `SessionEnd` | When a session terminates |
| `FileChanged` | When a watched file changes on disk |
| `CwdChanged` | When the working directory changes |
| `PreCompact` / `PostCompact` | Before/after context compaction |
| `ConfigChange` | When a configuration file changes during a session |
| `TaskCreated` / `TaskCompleted` | When tasks are created or marked complete |
| `WorktreeCreate` / `WorktreeRemove` | When git worktrees are created or removed |

---

## Settings.json Format

Hooks live in `settings.json` — either at `.claude/settings.json` (project-level, shared via git) or `~/.claude/settings.json` (personal, all projects):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint --silent 2>&1 | tail -20"
          }
        ]
      }
    ]
  }
}
```

Each hook event gets an array of **hook groups**, each with:
- `matcher` — a regex that filters which tool calls (or events) trigger the hook
- `hooks` — the list of actions to run when the matcher matches

---

## Hook Action Types

### Command (`type: "command"`)

Runs a shell command. The most common type.

```json
{
  "type": "command",
  "command": "npx prettier --write \"$(jq -r '.tool_input.file_path')\"",
  "async": false
}
```

Set `"async": true` for fire-and-forget (notifications, logging) — Claude won't wait for the result.

### HTTP (`type: "http"`)

Calls a local or remote endpoint with the hook event data as JSON body.

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/post-edit",
  "timeout": 30,
  "headers": { "Authorization": "Bearer $MY_TOKEN" },
  "allowedEnvVars": ["MY_TOKEN"]
}
```

### Prompt (`type: "prompt"`)

Asks a fast Claude model a yes/no question. Returns `{"ok": true}` or `{"ok": false, "reason": "..."}`.

```json
{
  "type": "prompt",
  "prompt": "Does this bash command look safe to run? $ARGUMENTS",
  "model": "fast",
  "timeout": 30
}
```

### Agent (`type: "agent"`)

Spawns a full subagent to evaluate the situation. Useful for complex verification like running a test suite.

```json
{
  "type": "agent",
  "prompt": "Run the test suite and verify all tests pass before Claude stops.",
  "timeout": 120
}
```

---

## The `matcher` Field

`matcher` is a regex matched against the event's primary field:

| Event | Matched against |
|-------|----------------|
| `PreToolUse`, `PostToolUse`, `PermissionRequest` | Tool name |
| `Notification` | Notification type |
| `SessionStart` | Session source (`startup`, `resume`, `clear`, `compact`) |
| `SessionEnd` | End reason |
| `FileChanged` | Filename (basename) |
| `ConfigChange` | Config source |
| `SubagentStart`, `SubagentStop` | Agent type |

An empty string `""` matches everything. Patterns are case-sensitive regex.

MCP tools follow the naming convention `mcp__<server>__<tool>`, so `mcp__github__.*` matches all GitHub MCP tools.

For finer control, add an `if` field using permission-rule syntax to filter by tool name **and** arguments:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "if": "Bash(git *)",
      "command": "./check-git-policy.sh"
    }
  ]
}
```

---

## Exit Codes and Blocking

| Exit code | Meaning |
|-----------|---------|
| `0` | Success — stdout is processed (added to context or parsed as JSON) |
| `2` | **Blocking error** — stderr becomes feedback to Claude; the action is prevented |
| Any other | Non-blocking error — shown only in verbose mode (`Ctrl+O`) |

**Exit 2 blocks the action.** For `PreToolUse`, the tool call is cancelled. For `Stop`, Claude continues working instead of stopping.

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command' < /dev/stdin)

if [[ "$COMMAND" == rm* ]]; then
  echo "rm commands are blocked in this project" >&2
  exit 2
fi

exit 0
```

---

## Context Passed to Hooks

All hooks receive JSON on stdin with at minimum:

```json
{
  "session_id": "...",
  "hook_event_name": "PreToolUse",
  "cwd": "/home/user/myproject",
  "permission_mode": "default",
  "transcript_path": "/path/to/session.jsonl"
}
```

Tool events also include `tool_name`, `tool_input`, and (for PostToolUse) `tool_response`.

Environment variables available in hook commands:

| Variable | Value |
|----------|-------|
| `$CLAUDE_PROJECT_DIR` | Project root directory |
| `$CLAUDE_ENV_FILE` | File to write `export` statements into (persists env for Bash tool) |
| `$CLAUDE_CODE_REMOTE` | `"true"` in remote web environments |

---

## Structured JSON Output

For `PreToolUse`, a hook can return JSON (exit 0) to control what happens:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "rm commands are not allowed",
    "additionalContext": "Remind the user about our safe-delete script"
  }
}
```

Or to modify the tool's input before it runs:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": { "command": "rm -i /tmp/build" }
  }
}
```

**Security note:** A hook returning `"deny"` blocks the tool even in `bypassPermissions` mode. Hooks can enforce restrictions that users cannot bypass through permission settings.

---

## Real-World Examples

### Lint after every edit (this project's hook)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "cd $CLAUDE_PROJECT_DIR && npm run lint --silent 2>&1 | tail -20"
          }
        ]
      }
    ]
  }
}
```

Claude sees lint errors immediately and can fix them in the same turn — no waiting for a separate CI check.

### Desktop notification when Claude needs input

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "async": true,
            "command": "osascript -e 'display notification \"Claude needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### Reload environment when `.envrc` changes

```json
{
  "hooks": {
    "FileChanged": [
      {
        "matcher": ".envrc|.env",
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash >> \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

### Re-inject reminders after context compaction

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing.'"
          }
        ]
      }
    ]
  }
}
```

### Log every bash command

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "async": true,
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

---

## Debugging Hooks

View active hook configurations in any session with `/hooks`.

Test a hook manually by piping sample JSON:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /tmp"},"hook_event_name":"PreToolUse"}' \
  | ./.claude/hooks/protect-files.sh
```

See hook output during a session with `Ctrl+O` (verbose mode).

---

## Tips

- **Use absolute paths.** Reference scripts with `$CLAUDE_PROJECT_DIR/.claude/hooks/script.sh` so hooks work regardless of where `claude` is invoked from.
- **Make scripts executable.** `chmod +x .claude/hooks/your-hook.sh`
- **Check `stop_hook_active` in Stop hooks.** If a Stop hook itself causes Claude to run more code, the next Stop event will have `stop_hook_active: true` — check this to prevent infinite loops.
- **Use `async: true` for notifications and logging.** Don't make Claude wait for things that don't affect its next action.
- **Keep matchers narrow.** A hook that fires on every tool use slows things down and creates noise. Match exactly what you need.
