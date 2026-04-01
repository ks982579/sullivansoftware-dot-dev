---
title: "Installing Claude Code"
topic: "Claude Code"
subtopic: "Introduction"
date: "2026-04-01"
description: "How to install Claude Code using native installers, Homebrew, or WinGet — and how to authenticate and verify"
tags: ["claude-code", "installation", "setup", "cli"]
draft: false
---

# Installing Claude Code

Claude Code is installed as a native binary. The old npm method (`npm install -g @anthropic-ai/claude-code`) is **deprecated** — the native installer is faster, has no Node.js dependency, and auto-updates in the background.

---

## System Requirements

- **OS**: macOS 13+, Windows 10 1809+ / Server 2019+, Ubuntu 20.04+, Debian 10+, Alpine 3.19+
- **RAM**: 4 GB+
- **Network**: internet connection required
- **Shell**: Bash, Zsh, PowerShell, or CMD
- **Windows**: [Git for Windows](https://git-scm.com/downloads/win) required (provides the Bash layer Claude Code uses internally)

---

## Install Methods

### Native Install (Recommended)

Auto-updates in the background. No dependencies required.

**macOS / Linux / WSL:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD:**
```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

### Homebrew (macOS/Linux)

```bash
brew install --cask claude-code
```

Does **not** auto-update. Run `brew upgrade claude-code` periodically, and `brew cleanup claude-code` to reclaim disk space from old versions.

### WinGet (Windows)

```powershell
winget install Anthropic.ClaudeCode
```

Does **not** auto-update. Run `winget upgrade Anthropic.ClaudeCode` to update manually.

---

## First Run

Navigate to your project and launch:

```bash
cd your-project
claude
```

On first launch, Claude Code opens a browser window to log in. Sign in with your Claude.ai account (Pro, Max, Teams, or Enterprise). Credentials are stored locally — you won't need to re-authenticate on subsequent runs.

---

## Verify Your Installation

```bash
claude --version
```

For a full health check of your installation and configuration:

```bash
claude doctor
```

`claude doctor` checks authentication, network connectivity, tool availability, and configuration — useful when something feels off.

---

## Authentication Details

Supported account types:

| Account | Notes |
|---------|-------|
| Claude Pro / Max / Teams / Enterprise | Standard — authenticate via browser on first run |
| Anthropic Console | API key or OAuth; see Console settings |
| Amazon Bedrock | Set `CLAUDE_CODE_USE_BEDROCK=1` + AWS credentials |
| Google Vertex AI | Set `CLAUDE_CODE_USE_VERTEX=1` + GCP credentials |
| Microsoft Foundry | Endpoint config in settings |

---

## Keeping Claude Code Updated

**Native install**: updates automatically in the background. Changes take effect on next launch.

**To update immediately:**
```bash
claude update
```

**Release channels** — control which updates you receive:

```json
// ~/.claude/settings.json
{
  "autoUpdatesChannel": "stable"
}
```

- `"latest"` (default): new features as soon as released
- `"stable"`: ~1 week delay, skips releases with major regressions

**To disable auto-updates entirely:**
```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  }
}
```

---

## Installing a Specific Version

```bash
# Latest
curl -fsSL https://claude.ai/install.sh | bash

# Stable channel
curl -fsSL https://claude.ai/install.sh | bash -s stable

# Specific version
curl -fsSL https://claude.ai/install.sh | bash -s 1.0.58
```

---

## Uninstalling

**Native (macOS/Linux/WSL):**
```bash
rm -f ~/.local/bin/claude
rm -rf ~/.local/share/claude
```

**Homebrew:** `brew uninstall --cask claude-code`

**WinGet:** `winget uninstall Anthropic.ClaudeCode`

**Remove all settings and history** (destructive — deletes MCP configs, session history, and settings):
```bash
rm -rf ~/.claude
rm ~/.claude.json
```

---

## Migrating from the Old npm Install

If you previously installed via npm:

```bash
# Install native binary
curl -fsSL https://claude.ai/install.sh | bash

# Remove old npm installation
npm uninstall -g @anthropic-ai/claude-code
```
