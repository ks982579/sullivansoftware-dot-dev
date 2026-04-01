---
title: "Claude Code Resources"
topic: "Claude Code"
subtopic: "Introduction"
date: "2026-04-01"
description: "Official documentation, Anthropic resources, and community links for Claude Code"
tags: ["claude-code", "resources", "documentation", "reference"]
draft: false
---

# Claude Code Resources

A curated reference list. Everything here is either official Anthropic documentation or directly maintained by Anthropic.

---

## Official Documentation

**[code.claude.com/docs](https://code.claude.com/docs)**
The main documentation hub. Contains everything below under one roof.

Key sections to bookmark:

| Page | What it covers |
|------|---------------|
| [Overview](https://code.claude.com/docs/en/overview) | What Claude Code is and what it can do |
| [Quickstart](https://code.claude.com/docs/en/quickstart) | Guided walkthrough of your first real task |
| [Advanced Setup](https://code.claude.com/docs/en/setup) | Version management, release channels, uninstall |
| [CLI Reference](https://code.claude.com/docs/en/cli-reference) | Every flag and subcommand |
| [Settings](https://code.claude.com/docs/en/settings) | All settings.json options |
| [Memory & CLAUDE.md](https://code.claude.com/docs/en/memory) | Persistent instructions and auto-memory |
| [Hooks](https://code.claude.com/docs/en/hooks) | Pre/post tool shell commands |
| [Skills (Custom Commands)](https://code.claude.com/docs/en/skills) | Creating your own slash commands |
| [MCP](https://code.claude.com/docs/en/mcp) | Model Context Protocol integrations |
| [Sub-agents](https://code.claude.com/docs/en/sub-agents) | Running parallel agent teams |
| [Common Workflows](https://code.claude.com/docs/en/common-workflows) | Patterns for real tasks |
| [Best Practices](https://code.claude.com/docs/en/best-practices) | How to get the most out of Claude Code |
| [Troubleshooting](https://code.claude.com/docs/en/troubleshooting) | Solutions to common problems |
| [VS Code](https://code.claude.com/docs/en/vs-code) | VS Code extension guide |
| [JetBrains](https://code.claude.com/docs/en/jetbrains) | JetBrains plugin guide |
| [Desktop](https://code.claude.com/docs/en/desktop-quickstart) | Desktop app guide |
| [Web](https://code.claude.com/docs/en/claude-code-on-the-web) | claude.ai/code guide |

**Full docs index (machine-readable):**
```
https://code.claude.com/docs/llms.txt
```
Useful for feeding the full doc tree to Claude itself.

---

## Anthropic Platform

**[console.anthropic.com](https://console.anthropic.com)**
Anthropic Console — API key management, usage dashboards, team management, billing. Required if you're authenticating with an API key instead of a Claude.ai account.

**[claude.com/pricing](https://claude.com/pricing)**
Current plan details and feature comparison (Pro, Max, Teams, Enterprise).

**[anthropic.com/supported-countries](https://www.anthropic.com/supported-countries)**
Claude Code is not available in all regions. Check here if you're getting access errors.

**[Claude API / Agent SDK docs](https://platform.claude.com/docs/en/agent-sdk/overview)**
For building custom agents powered by Claude Code's tools. Relevant for the Mastery section.

---

## Model Reference

Claude Code uses Anthropic's Claude model family. Current models available in Claude Code:

| Model ID | Notes |
|----------|-------|
| `claude-opus-4-6` | Most capable, best for complex tasks |
| `claude-sonnet-4-6` | Balanced — default for most tasks |
| `claude-haiku-4-5-20251001` | Fastest, lowest cost |

Switch models with:
```bash
claude --model claude-opus-4-6
```

Or set a default in `~/.claude/settings.json`:
```json
{
  "model": "claude-sonnet-4-6"
}
```

---

## Third-Party Provider Docs

For teams running Claude Code through cloud providers instead of direct Anthropic accounts:

- [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)
- [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai)
- [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry)

---

## Bug Reports and Feedback

**GitHub Issues:** [github.com/anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)
The official place to report bugs, unexpected behaviour, and feature requests.

From within Claude Code:
```bash
/bug
```
Opens a pre-filled bug report with your session context attached.

---

## Live Product

**[claude.ai/code](https://claude.ai/code)**
The web interface for Claude Code — no install required.

**[code.claude.com](https://code.claude.com)**
Product landing page — demos, pricing, and product overview.
