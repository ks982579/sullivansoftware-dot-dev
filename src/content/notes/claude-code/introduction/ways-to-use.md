---
title: "Ways to Use Claude Code"
topic: "Claude Code"
subtopic: "Introduction"
date: "2026-04-01"
description: "Terminal, Desktop App, VS Code, JetBrains, and Web — what each interface offers and when to use it"
tags: ["claude-code", "ide", "terminal", "desktop-app", "vs-code", "jetbrains"]
draft: false
---

# Ways to Use Claude Code

Claude Code runs on five surfaces — all powered by the same engine. Your `CLAUDE.md` files, MCP servers, hooks, and settings work across all of them. You can start a task in the terminal and continue it in the desktop app, or vice versa.

---

## Terminal (Primary)

The full-featured CLI. Everything else is built on top of this.

**Install:** `curl -fsSL https://claude.ai/install.sh | bash`

**Launch:** `cd your-project && claude`

**What it uniquely offers:**
- Every feature and flag available — the other surfaces expose subsets
- Unix composability: pipe logs, file output, git diffs into Claude
- Tab completion and command history (`↑` arrow)
- `!` prefix to run raw bash commands mid-session
- Full slash command menu (`/`)
- Best for scripting, CI/CD integration, and automation

**One-off queries without entering interactive mode:**
```bash
claude -p "what does this function do?" src/lib/auth.ts
claude -p "write a regex for UK postcodes"
git diff main | claude -p "summarise these changes"
```

**Best for:** power users, automation, CI pipelines, anyone comfortable in a terminal.

---

## VS Code Extension

An extension panel embedded in VS Code (also works in Cursor).

**Install:** Search "Claude Code" in the Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`), or:
```bash
code --install-extension anthropic.claude-code
```

Requires VS Code 1.98.0+.

**What it uniquely offers:**
- **Inline visual diffs** — side-by-side before/after with Accept/Reject buttons per change
- **Checkpointing** — rewind to any previous code state; fork conversations
- **Plan mode** — Claude describes its full plan as a markdown document; you add inline comments before it starts
- **@-mentions** — reference specific files, folders, or line ranges with fuzzy matching (`Option+K` / `Alt+K`)
- **Selection context** — highlight code and Claude auto-includes it as context
- **Browser integration** — type `@browser` to connect Chrome; Claude can read console logs, test UI, and debug web apps
- **Diagnostic integration** — Claude sees language server errors and warnings
- **Jupyter notebook support** — cell execution available via `/` menu
- **Conversation history** — searchable dropdown of past sessions

**Keyboard shortcuts:**
- `Cmd/Ctrl+Esc` — toggle focus between chat and editor
- `Cmd/Ctrl+Shift+Esc` — open new Claude Code tab
- `Option/Alt+K` — insert @-mention reference

**Limitations vs terminal:**
- Not all slash commands available
- No `!` bash shortcut
- No tab completion
- MCP servers must be added via CLI first

**Best for:** developers who live in VS Code and want Claude embedded in their existing editor workflow.

---

## Desktop App

A standalone native application. macOS and Windows only (Linux not supported).

**Install:** Download from [claude.ai](https://claude.ai) — macOS (Intel + Apple Silicon) or Windows (x64, ARM64).

Requires a paid subscription (Pro, Max, Teams, or Enterprise).

**The Code tab has three environment modes:**
- **Local** — Claude accesses your machine's files directly
- **Remote** — cloud-hosted VM (Claude runs on Anthropic infrastructure)
- **SSH** — connects to a remote machine you specify

**What it uniquely offers:**
- **Live app preview** — run your dev server in the desktop; Claude views the running app, tests endpoints, reads logs
- **PR monitoring** — watches CI checks; can auto-fix failures or merge when checks pass
- **Parallel sessions** — multiple tasks simultaneously, each in its own git worktree with full isolation
- **Scheduled tasks** — recurring Claude runs (daily reviews, weekly audits) that run even when you close the app (cloud sessions)
- **Remote execution** — kick off long-running tasks to cloud infrastructure; check back when done
- **Visual diff review** with Accept/Reject per file
- **Drag-and-drop files and images**
- **Plugin browser** — graphical interface for installing and managing plugins

**Session continuity:** switch a desktop session to the web or IDE mid-task. Use `/teleport` to pull a web session into your terminal.

**Best for:** developers who prefer a GUI, tasks that run overnight, or anyone who wants parallel worktree sessions without manual git setup.

---

## JetBrains Plugin

A plugin for IntelliJ IDEA, PyCharm, WebStorm, GoLand, and other JetBrains IDEs.

**Install:** JetBrains Marketplace → search "Claude Code Beta" → install → restart IDE.

**What it offers:**
- Interactive diff viewing
- Selection context sharing (highlight code → Claude sees it)
- Sidebar panel embedded in JetBrains UI
- Same session continuity as other surfaces

**Best for:** developers on JetBrains IDEs who want Claude integrated without switching to a terminal.

---

## Web (claude.ai/code)

Run Claude Code in a browser with zero local setup. Available on desktop browsers and the Claude iOS app.

**Access:** [claude.ai/code](https://claude.ai/code)

**What it uniquely offers:**
- **No installation required** — useful for repos you don't have locally
- **Long-running tasks** — kick off work and check back later; tasks continue in the cloud
- **Parallel tasks** — run multiple sessions simultaneously
- **Mobile** — the Claude iOS app supports web sessions; start a task on your phone
- **Remote Control** — continue a local session from any device by opening the same session URL

**Best for:** quick tasks without local setup, working on repos you don't have cloned, continuing sessions from a different device, or delegating long-running work to cloud infrastructure.

---

## Feature Comparison

| Feature | Terminal | VS Code | Desktop | JetBrains | Web |
|---------|:---:|:---:|:---:|:---:|:---:|
| All slash commands | ✅ | Subset | Subset | Subset | Subset |
| Visual diffs (GUI) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Checkpointing | ❌ | ✅ | ❌ | ❌ | ❌ |
| Inline diff Accept/Reject | ❌ | ✅ | ✅ | ✅ | ✅ |
| Browser integration | ❌ | ✅ | ❌ | ❌ | ❌ |
| App preview / live server | ❌ | ❌ | ✅ | ❌ | ❌ |
| Parallel sessions (worktrees) | Manual | ❌ | ✅ | ❌ | ✅ |
| Scheduled tasks | `/loop` | ❌ | ✅ | ❌ | ✅ |
| Remote/cloud execution | ❌ | ❌ | ✅ | ❌ | ✅ |
| Unix piping / `!` bash | ✅ | ❌ | ❌ | ❌ | ❌ |
| No local install needed | ❌ | ❌ | ❌ | ❌ | ✅ |
| Linux support | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## Which Should You Start With?

- **You're comfortable in a terminal** → start with the CLI, it's the most capable
- **You live in VS Code** → install the extension and use it from day one
- **You prefer a GUI** → Desktop App
- **You're on JetBrains** → JetBrains plugin
- **You just want to try it** → Web, no install required

All surfaces share config — adding a MCP server in the terminal makes it available in VS Code and the Desktop App too.
