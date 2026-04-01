---
title: "Model Context Protocol (MCP)"
topic: "Claude Code"
subtopic: "Advanced"
date: "2026-04-01"
description: "What MCP is, how to add MCP servers, and popular servers for GitHub, databases, and more"
tags: ["claude-code", "mcp", "integrations", "advanced"]
draft: false
---

# Model Context Protocol (MCP)

Out of the box, Claude Code can read files, run shell commands, and use git. MCP extends that — it's how you connect Claude Code to GitHub, databases, Slack, Figma, Jira, and hundreds of other tools.

**The mental model:** MCP servers are integrations that give Claude additional tools. Once connected, Claude can use them naturally mid-conversation:

> "Implement the feature described in JIRA issue ENG-4521 and create a PR on GitHub."

With the right MCP servers connected, that single prompt spans your issue tracker, your codebase, and your version control — automatically.

---

## Three Ways to Add MCP Servers

### 1. The `claude mcp` CLI (recommended)

```bash
# Add a remote HTTP server
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Add a local stdio server
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server

# Add from raw JSON
claude mcp add-json my-server '{"type":"http","url":"https://mcp.example.com/mcp"}'

# Import all servers from Claude Desktop
claude mcp add-from-claude-desktop

# List, inspect, remove
claude mcp list
claude mcp get notion
claude mcp remove notion
```

### 2. `.mcp.json` (project-shared config)

Add a `.mcp.json` to your project root and commit it — your whole team picks it up automatically:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub"],
      "env": {
        "DB_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

Note the `${DATABASE_URL}` syntax — Claude Code expands environment variables in `.mcp.json`. Use `${VAR:-default}` for a fallback value.

### 3. `--mcp-config` flag

Pass a config file (or JSON string) at launch for a single session:

```bash
claude --mcp-config ./mcp-dev.json
claude --strict-mcp-config --mcp-config ./mcp-prod.json  # ignore all other MCP config
```

---

## Server Transports

| Transport | When to use |
|-----------|------------|
| `http` | Remote servers with a stable URL. Modern standard — prefer this. |
| `sse` | Remote servers using Server-Sent Events. Deprecated; use `http` for new servers. |
| `stdio` | Local servers that run as a subprocess (e.g., `npx ...`). |

---

## Scopes: Local, Project, User

```bash
# local (default) — private to you, only in this project directory
claude mcp add --scope local sentry https://mcp.sentry.dev/mcp

# project — stored in .mcp.json, committed to git, shared with team
claude mcp add --scope project github https://api.githubcopilot.com/mcp

# user — private to you, available in all projects
claude mcp add --scope user figma https://www.figma.com/api/mcp/mcp
```

When the same server name exists at multiple scopes, **local wins** over project wins over user.

---

## Authentication

### OAuth (most remote servers)

```bash
# 1. Add the server
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# 2. In a Claude Code session, run:
/mcp

# 3. Follow the browser login flow
```

Tokens are stored securely (system keychain on macOS) and refresh automatically.

### Static headers (API key auth)

```json
{
  "mcpServers": {
    "my-api": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${MY_API_KEY}",
        "X-API-Key": "${MY_API_KEY}"
      }
    }
  }
}
```

### Dynamic headers (short-lived tokens)

For tokens that need refreshing on each connection:

```json
{
  "mcpServers": {
    "internal": {
      "type": "http",
      "url": "https://internal.example.com/mcp",
      "headersHelper": "/opt/bin/get-auth-headers.sh"
    }
  }
}
```

The helper script runs before each connection, writes a JSON object of headers to stdout, and must complete within 10 seconds.

---

## Popular MCP Servers

| Server | Use case |
|--------|---------|
| **GitHub** | Code reviews, PR management, issue creation |
| **PostgreSQL / DBHub** | Natural language queries against your database |
| **Sentry** | Check error logs, view stack traces, identify breaking deployments |
| **Figma** | Pull design specs directly into your workflow |
| **Notion** | Read and write docs and databases |
| **Asana** | Manage tasks and projects |
| **Slack** | Send messages, read channel history |
| **Gmail** | Draft and send emails |
| **Airtable** | Query and update spreadsheet databases |
| **Playwright** | Browser automation and testing |
| **Stripe / PayPal** | Payment integration and lookup |
| **HubSpot** | CRM data |

Hundreds more are available at the [MCP GitHub repository](https://github.com/modelcontextprotocol/servers). You can also build custom servers using the MCP SDK.

---

## Managing Servers In-Session

Run `/mcp` in any Claude Code session to:
- See all connected servers and their status
- Authenticate with servers that require OAuth
- Clear authentication for a server
- Diagnose connection issues

---

## Security Considerations

**Third-party servers carry risk.** MCP servers can execute code and access data on your behalf. Only install servers you trust.

**Project-scoped servers require approval.** When Claude Code encounters a `.mcp.json` from a project for the first time, it prompts before connecting. Reset that approval with `claude mcp reset-project-choices`.

**Prompt injection risk.** Servers that fetch external content (web pages, issue comments, email) can expose you to prompt injection — malicious instructions embedded in content that Claude reads. Be especially cautious with these.

**Token output limits.** MCP tool output is capped at 25,000 tokens by default (warning at 10,000). Override with `MAX_MCP_OUTPUT_TOKENS=50000`.

**Connection timeout.** Default startup timeout is 10 seconds. Override with `MCP_TIMEOUT=10000`.

---

## Claude Code as an MCP Server

Claude Code itself can act as an MCP server, exposing its capabilities to other tools:

```bash
claude mcp serve
```

This lets other MCP-compatible applications (including other Claude Code instances) use Claude Code as a tool.

---

## Windows Note

On native Windows (not WSL), local stdio servers using `npx` need a `cmd /c` wrapper:

```bash
claude mcp add --transport stdio my-server -- cmd /c npx -y @some/mcp-package
```
