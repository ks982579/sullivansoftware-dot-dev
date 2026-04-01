---
title: "Built-in Slash Commands"
topic: "Claude Code"
subtopic: "Advanced"
date: "2026-04-01"
description: "Complete reference for Claude Code's built-in / commands — /plan, /compact, /model, and more"
tags: ["claude-code", "slash-commands", "reference", "advanced"]
draft: false
---

# Built-in Slash Commands

Type `/` at any Claude Code prompt to see available commands. This is the full reference for built-in commands — the ones that ship with Claude Code itself, before any custom skills or MCP server prompts are added.

MCP servers can also expose commands using the format `/mcp__<server>__<prompt>`, discovered automatically from connected servers.

---

## Session Management

| Command | What it does |
|---------|-------------|
| `/clear` | Clear conversation history and free up context. Aliases: `/reset`, `/new` |
| `/compact [instructions]` | Summarize the conversation to free context, with optional focus instructions. Use before long tasks when context is getting full. |
| `/resume [session]` | Resume a conversation by ID or name, or open an interactive picker. Alias: `/continue` |
| `/rename [name]` | Rename the current session. Without a name, auto-generates one from conversation history. |
| `/branch [name]` | Create a branch of the current conversation at this point. Alias: `/fork` |
| `/rewind` | Rewind the conversation and/or code to a previous point, or summarize from a selected message. Alias: `/checkpoint` |
| `/exit` | Exit the CLI. Alias: `/quit` |

---

## Planning and Mode Control

| Command | What it does |
|---------|-------------|
| `/plan [description]` | Enter plan mode. Pass an optional description to immediately start planning: `/plan fix the auth bug` |
| `/fast [on\|off]` | Toggle fast mode on or off. Fast mode uses the same model but with faster output. |
| `/effort [level]` | Set model effort: `low`, `medium`, `high`, `max` (Opus 4.6 only), or `auto`. `low`–`high` persist across sessions; `max` is session-only. Takes effect immediately. |
| `/sandbox` | Toggle sandbox mode (supported platforms only). |

---

## Model and Configuration

| Command | What it does |
|---------|-------------|
| `/model [model]` | Select or change the AI model. Use arrow keys to adjust effort level for models that support it. Takes effect immediately. |
| `/config` | Open the Settings interface — theme, model, output style, preferences. Alias: `/settings` |
| `/theme` | Change color theme, including light/dark variants, colorblind-accessible (daltonized) themes, and ANSI themes. |
| `/color [color\|default]` | Set prompt bar color for the session: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan`, or `default`. |
| `/vim` | Toggle Vim/Normal editing mode. |

---

## Context and Cost Visibility

| Command | What it does |
|---------|-------------|
| `/context` | Visualize context usage as a colored grid. Shows optimization suggestions for context-heavy tools, memory bloat, and capacity warnings. |
| `/cost` | Show token usage statistics for the current session. |
| `/usage` | Show plan usage limits and rate limit status. |
| `/stats` | Visualize daily usage, session history, streaks, and model preferences across sessions. |
| `/extra-usage` | Configure extra usage to keep working when rate limits are hit. |

---

## Memory and Instructions

| Command | What it does |
|---------|-------------|
| `/memory` | Edit CLAUDE.md memory files, toggle auto-memory on/off, and view auto-memory entries. |
| `/init` | Initialize the project with a CLAUDE.md guide by analyzing your codebase. Set `CLAUDE_CODE_NEW_INIT=1` for an interactive flow that also walks through skills, hooks, and personal memory files. |

---

## Permissions and Tools

| Command | What it does |
|---------|-------------|
| `/permissions` | View or update permission rules — the allow/deny lists for tools. Alias: `/allowed-tools` |
| `/hooks` | View active hook configurations for tool events. |
| `/mcp` | Manage MCP server connections, check server status, and handle OAuth authentication. |
| `/add-dir <path>` | Add a working directory for file access during the current session. |

---

## Code and Git Utilities

| Command | What it does |
|---------|-------------|
| `/diff` | Open an interactive diff viewer for uncommitted changes and per-turn diffs. Arrow keys switch between git diff and individual Claude turns. |
| `/security-review` | Analyze pending changes on the current branch for security vulnerabilities — injection, auth issues, data exposure. |
| `/pr-comments [PR]` | Fetch and display comments from a GitHub pull request. Auto-detects the PR for the current branch, or pass a URL/number. Requires `gh` CLI. |

---

## Output and Export

| Command | What it does |
|---------|-------------|
| `/copy [N]` | Copy the last assistant response to clipboard. Pass `N` to copy the Nth-latest response. When code blocks are present, shows a picker. Press `w` to write to a file instead (useful over SSH). |
| `/export [filename]` | Export the current conversation as plain text. Pass a filename to write directly, or open a dialog to copy/save. |

---

## Skills and Plugins

| Command | What it does |
|---------|-------------|
| `/skills` | List available skills from project, user, and plugin sources. |
| `/plugin` | Manage Claude Code plugins. |
| `/reload-plugins` | Reload all active plugins to apply pending changes without restarting. |

---

## Remote and Collaboration

| Command | What it does |
|---------|-------------|
| `/desktop` | Continue the current session in the Claude Code Desktop app (macOS/Windows). Alias: `/app` |
| `/remote-control` | Make the session available for remote control from claude.ai. Alias: `/rc` |
| `/remote-env` | Configure the default remote environment for web sessions started with `--remote`. |
| `/schedule [description]` | Create, update, list, or run Cloud scheduled tasks. |
| `/tasks` | List and manage background tasks. |

---

## Integrations

| Command | What it does |
|---------|-------------|
| `/ide` | Manage IDE integrations and show connection status. |
| `/install-github-app` | Set up the Claude GitHub Actions app for a repository. |
| `/install-slack-app` | Install the Claude Slack app via OAuth flow. |
| `/keybindings` | Open or create your keybindings configuration file. |
| `/statusline` | Configure Claude Code's status line display. |
| `/terminal-setup` | Configure terminal keybindings for Shift+Enter (VS Code, Alacritty, Warp, etc.). |

---

## Help and Account

| Command | What it does |
|---------|-------------|
| `/help` | Show help and available commands. |
| `/doctor` | Diagnose your Claude Code installation and settings. |
| `/btw <question>` | Ask a quick side question without adding it to the main conversation history. |
| `/login` | Sign in to your Anthropic account. |
| `/logout` | Sign out from your Anthropic account. |
| `/status` | Show version, model, account, and connectivity (Settings → Status tab). Works while Claude is responding. |
| `/feedback [report]` | Submit feedback. Alias: `/bug` |
| `/insights` | Generate a report analyzing your Claude Code sessions — project areas, interaction patterns, friction points. |
| `/privacy-settings` | View and update privacy settings (Pro and Max subscribers). |
| `/release-notes` | View the full changelog, most recent version shown first. |

---

## A Few Worth Highlighting

**`/compact`** is the most important command to know for long sessions. When context gets heavy, `/compact` summarizes the conversation and frees up space without losing the thread. You can pass instructions: `/compact focus on the auth module refactor` to control what gets preserved.

**`/plan`** puts Claude into a read-only planning mode — it will analyze your codebase and write a plan but make no changes. Essential before handing over a big task.

**`/context`** shows a visual grid of context usage, helping you decide when to `/compact` before hitting the limit.

**`/btw`** is a hidden gem — ask a side question (like "what does this regex do?") without polluting the main conversation history. The response is shown but not retained.

**`/review`** is deprecated — install the `code-review` plugin instead: `claude plugin install code-review@claude-plugins-official`
