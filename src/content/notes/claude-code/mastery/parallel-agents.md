---
title: "Parallel Agents"
topic: "Claude Code"
subtopic: "Mastery"
date: "2026-04-01"
description: "Running multiple agents simultaneously with worktree isolation and coordination patterns"
tags: ["claude-code", "parallel", "agents", "orchestration", "mastery"]
draft: false
---

# Parallel Agents

The highest-leverage capability in Claude Code is running multiple agents simultaneously. Instead of working sequentially through a task list, you can fan out — spawn several agents, let them work in parallel on independent problems, then synthesize the results.

There are two distinct mechanisms for this: **parallel subagents** (multiple Agent calls in one session) and **agent teams** (experimental: separate full Claude Code instances that communicate with each other). Worktree isolation underpins both, giving each agent its own copy of the repository.

---

## Parallel Subagents

The simplest form: ask Claude to spawn multiple subagents at once. Claude sends multiple `Agent` tool calls in a single message, each launching in parallel.

```
Research the authentication, database, and API modules simultaneously.
Use separate subagents for each so they don't interfere with each other.
```

Each subagent gets its own context window, runs its research, and returns a summary. Claude synthesizes the three results and presents a consolidated picture.

**Good candidates for parallel subagents:**
- Independent research paths (analyzing different modules, different potential root causes)
- Parallel test runs against different configurations
- Fetching documentation or context from multiple sources at once
- Running the same analysis with different models or approaches

**Key constraint:** Subagents cannot spawn other subagents. All delegation flows from the main conversation outward. Keep orchestration at one level.

---

## Worktree Isolation

When multiple agents edit files in the same repository, they'll conflict without isolation. Worktrees solve this by giving each agent its own working directory and branch.

### For subagents: `isolation: "worktree"`

Set this in a custom agent's frontmatter:

```yaml
---
name: feature-builder
description: Build features in an isolated environment
isolation: worktree
---
```

When invoked, the subagent gets a fresh git worktree at `.claude/worktrees/<name>/` on a new branch. Changes it makes are isolated from everything else.

**Cleanup rules:**
- If the subagent makes **no changes**: worktree and branch are deleted automatically
- If the subagent **makes changes**: Claude prompts to keep or remove. Keep preserves the branch for review and merge; remove discards all changes.

### For CLI sessions: `--worktree` / `-w`

Start Claude Code itself in an isolated worktree:

```bash
# Named worktree — creates .claude/worktrees/auth-refactor/ on branch worktree-auth-refactor
claude --worktree auth-refactor

# Auto-named — generates a random name like "bright-running-fox"
claude -w
```

This is how two developers can work on the same repo simultaneously without stepping on each other:

```bash
# Terminal 1: auth refactor
claude --worktree auth-refactor

# Terminal 2: payment integration, same repo, no conflicts
claude --worktree payment-feature
```

### Handling gitignored files

Fresh worktrees don't include untracked files like `.env`. Use `.worktreeinclude` to copy them:

```
# .worktreeinclude — uses .gitignore syntax
.env
.env.local
config/secrets.json
```

Files listed here are copied into new worktrees. Add `.claude/worktrees/` to `.gitignore` to prevent worktree contents from appearing as untracked files.

### Changing the base branch

Worktrees branch from `origin/HEAD` (the remote's default branch). If your repo's default branch has changed:

```bash
git remote set-head origin -a
```

For full control, configure a `WorktreeCreate` hook to replace Claude's default `git worktree` logic with your own.

---

## Agent Teams (Experimental)

Agent teams are a step up from parallel subagents: multiple fully independent Claude Code sessions that can communicate directly with each other, share a task list, and coordinate without routing everything through you.

> Agent teams are experimental and disabled by default. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `settings.json` or the `--agent-teams` flag.

### Architecture

- **Team lead**: The main session that creates the team and coordinates work
- **Teammates**: Separate Claude Code instances working on assigned tasks
- **Task list**: Shared work items with dependency management (pending → in_progress → completed)
- **Mailbox**: Direct messaging between teammates via the `SendMessage` tool

### Creating a team

Describe what you want in natural language:

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review independently, then discuss findings.
```

Or for parallel development:

```
Spawn four teammates to implement these modules in parallel:
auth, payments, notifications, and search. Each teammate owns one module.
```

### The SendMessage tool

With agent teams enabled, `SendMessage` allows:
- The lead to resume a stopped subagent by agent ID
- Direct teammate-to-teammate communication without routing through the lead

This enables teammates to challenge each other's findings — useful for debugging with competing hypotheses:

```
Spawn 5 teammates to investigate why users are seeing intermittent 500 errors.
Each should develop a different hypothesis and actively try to disprove the others' theories.
```

### Display modes

| Mode | Description |
|------|-------------|
| `in-process` (default) | All teammates in your terminal. `Shift+Down` cycles through them. |
| `tmux` | Each teammate gets a split pane. Requires tmux or iTerm2. |

Configure with `--teammate-mode` flag or `"teammateMode"` in `~/.claude.json`.

### Quality gates with hooks

Three hook events let you enforce rules on team work:

| Hook | Fires when | Exit 2 behavior |
|------|-----------|----------------|
| `TeammateIdle` | Teammate about to go idle | Sends feedback; teammate keeps working |
| `TaskCreated` | Task is being created | Blocks task creation |
| `TaskCompleted` | Task is being marked complete | Prevents completion until criteria met |

Example — block task completion until tests pass:

```json
{
  "hooks": {
    "TaskCompleted": [{
      "hooks": [{
        "type": "command",
        "command": "npm test --silent || (echo 'Tests must pass before marking complete' >&2 && exit 2)"
      }]
    }]
  }
}
```

---

## Orchestration Patterns

### Pattern 1: Parallel independent research

```
Research the auth, database, and caching layers in parallel.
Use separate Explore subagents for each.
```

Each subagent investigates its domain independently. Claude synthesizes. Good when research paths don't depend on each other.

### Pattern 2: Competing hypotheses (debugging)

```
We have intermittent login failures. Spawn subagents to investigate
three different root causes simultaneously:
1. Token expiry edge case
2. Race condition in session creation
3. Database connection pool exhaustion
```

Multiple investigators working in parallel find the root cause faster than sequential investigation, and you avoid anchoring to the first plausible theory.

### Pattern 3: Parallel feature development

```bash
# Each developer (or each Claude session) owns different files
claude --worktree auth-oauth          # implements OAuth2 in src/auth/
claude --worktree notifications-v2    # implements push notifications
claude --worktree search-reindex      # rebuilds search index pipeline
```

Isolated branches mean no merge conflicts mid-work. Merge when each feature is complete.

### Pattern 4: Isolated risky operations

```yaml
---
name: db-migrator
description: Runs database migrations in isolation
isolation: worktree
permissionMode: acceptEdits
---
```

Dangerous or experimental operations run in an isolated worktree. If something goes wrong, discard the worktree — nothing in your main working directory was touched.

### Pattern 5: Sequential chain with subagents

```
Use the security-reviewer subagent to identify vulnerabilities in the auth module,
then use the patcher subagent to fix the issues it found.
```

Results from subagent 1 inform subagent 2. Each runs in isolation; Claude orchestrates the handoff.

---

## Subagents vs. Agent Teams

| | Parallel Subagents | Agent Teams |
|--|--|--|
| **Context** | Own window; results summarized back | Fully independent sessions |
| **Communication** | Report back to lead only | Direct teammate-to-teammate messaging |
| **Coordination** | Lead manages all work | Shared task list; self-coordinating |
| **Token cost** | Lower (results summarized) | Higher (each teammate = full Claude instance) |
| **File isolation** | Optional (`isolation: worktree`) | Recommended (separate worktrees per teammate) |
| **Status** | Stable | Experimental |

**Use parallel subagents** for most parallel work — research, analysis, parallel writes to non-overlapping files. Lower cost, simpler to reason about.

**Use agent teams** when teammates need to actively discuss, challenge, and build on each other's work mid-task — not just report results to you.

---

## Limitations and Gotchas

**Subagents:**
- Cannot spawn other subagents — one level of delegation only
- Each invocation starts fresh — no inherited conversation history
- Verbose results from many subagents can fill your main context quickly

**Agent teams (experimental):**
- No session resumption for in-process teammates (`/resume` and `/rewind` don't restore them)
- Task status can lag — teammates sometimes fail to mark tasks complete
- Slow shutdown — teammates finish their current request before exiting
- One team per session; teams can't be nested
- Split panes require tmux or iTerm2 — not VS Code, Windows Terminal, or Ghostty
- Token usage scales linearly with team size

**Worktrees:**
- Fresh checkouts don't include untracked files — configure `.worktreeinclude`
- Two teammates editing the same file will overwrite each other — divide work by file ownership
- `origin/HEAD` may be stale if the repo's default branch changed
