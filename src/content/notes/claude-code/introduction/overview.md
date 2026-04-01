---
title: "What is Claude Code?"
topic: "Claude Code"
subtopic: "Introduction"
date: "2026-04-01"
description: "High-level overview of Claude Code: agentic AI for software development, how it differs from chat AI, and what it can do"
tags: ["claude-code", "ai", "developer-tools", "overview"]
draft: false
---

# What is Claude Code?

Claude Code is an **agentic coding tool** — not a chat interface. The distinction matters. Chat AI responds to one message at a time and forgets the conversation when you close the window. Claude Code reads your entire codebase, edits files, runs shell commands, manages git, and executes multi-step tasks across your project — then keeps working until the job is done.

> "Claude Code is an AI-powered coding assistant that understands your entire codebase and can work across multiple files and tools to get things done." — Anthropic

It runs in your terminal, your IDE, a desktop app, and a browser. The same engine powers all of them.

---

## How It Differs from Chat AI

| | Chat AI (ChatGPT, Claude.ai) | Claude Code |
|---|---|---|
| **Codebase access** | Copy-paste only | Reads your full project |
| **File editing** | Suggests code in chat | Edits files directly |
| **Commands** | Cannot run anything | Runs shell commands, tests, builds |
| **Git** | Describes what to do | Commits, branches, opens PRs |
| **Multi-step** | One response at a time | Plans and executes task sequences |
| **Memory** | Resets per session | CLAUDE.md + auto-memory persists |

Tools like GitHub Copilot and Cursor are autocomplete and chat tools embedded in your editor. Claude Code is an **autonomous agent** — it can be handed an entire task and work through it, including the parts you didn't anticipate.

---

## What You Can Do With It

### Automate the work you keep putting off

Tests for untested code, lint fixes across a project, merge conflict resolution, dependency updates, release notes:

```bash
claude "write tests for the auth module, run them, and fix any failures"
```

### Build features and fix bugs

Describe what you want in plain English. Claude Code plans the approach, writes code across multiple files, and verifies it works. For bugs, paste the error message — it traces the root cause and implements a fix.

### Git operations

Claude Code works directly with git: staging, commit messages, branching, pull requests.

```bash
claude "commit my changes with a descriptive message"
```

### CI/CD and automation

Claude Code is composable and follows the Unix philosophy — pipe into it, run it in CI, chain with other tools:

```bash
# Analyze recent logs
tail -200 app.log | claude -p "flag any anomalies"

# Security review of changed files
git diff main --name-only | claude -p "review these files for security issues"
```

### Connect external tools with MCP

The Model Context Protocol (MCP) connects Claude Code to Google Drive, Jira, Slack, databases, and custom tooling. More in the Advanced section.

### Run agent teams

Spawn multiple Claude Code agents that work on different parts of a task simultaneously. A lead agent coordinates subtasks and merges results. More in the Mastery section.

### Schedule recurring tasks

Run Claude on a schedule: morning PR reviews, overnight CI analysis, weekly dependency audits.

---

## The Mental Model

Think of Claude Code as a **junior developer with full repo access** who executes tasks rather than just describing how to do them. You give direction; it does the work; you review and approve.

It is not infallible — it will make mistakes, miss context, and occasionally need course correction. The workflow is iterative: prompt, review the diff, approve or redirect.

The key habit to build: **describe outcomes, not steps**. Instead of "edit line 42 to change the return value", say "make the API return a 404 when the record doesn't exist instead of a 500".

---

## Subscription and Access

Claude Code requires a **paid Claude account** (Pro, Max, Teams, or Enterprise) or an Anthropic Console account. The free Claude.ai plan does not include Claude Code. Third-party providers (Amazon Bedrock, Google Vertex AI, Microsoft Foundry) are also supported.

See [claude.com/pricing](https://claude.com/pricing) for current plan details.
