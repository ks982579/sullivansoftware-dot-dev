---
title: "Planning Workflow"
topic: "Claude Code"
subtopic: "Mastery"
date: "2026-04-01"
description: "Using /plan mode effectively: the 5-phase workflow from exploration to implementation"
tags: ["claude-code", "planning", "workflow", "mastery"]
draft: false
---

# Planning Workflow

The most common mistake with Claude Code is skipping planning entirely — handing over a complex task and hoping it comes out right. For anything that touches more than a few files or requires design decisions, plan mode is the right starting point.

**Plan mode restricts Claude to read-only operations.** It can read files, explore the codebase, run shell commands to research, and ask clarifying questions — but it cannot edit your source code. You get a full picture of what Claude intends to do before any changes happen.

---

## Activating Plan Mode

Three ways to enter plan mode:

**For a single request:**
```
/plan refactor the auth module to use OAuth2
```

**Cycling through modes during a session:**

Press `Shift+Tab` to cycle: `default` → `acceptEdits` → `plan` → `auto`. The status bar shows `⏸ plan mode on` when active.

**Starting a session in plan mode:**
```bash
claude --permission-mode plan
claude --permission-mode plan -p "create a migration plan for the auth refactor"
```

**As your default** (useful if you want to always plan before acting):
```json
// ~/.claude/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

---

## What Claude Does in Plan Mode

Claude uses plan mode to research before proposing. In a typical plan session it will:

1. Read relevant files across the codebase
2. Run shell commands to understand structure (`find`, `grep`, `git log`, etc.)
3. Ask clarifying questions using `AskUserQuestion` to resolve ambiguities
4. Write a plan document proposing the approach, file changes, and sequence

**Permission prompts still appear** for Bash commands and network requests — plan mode only prevents code editing, not other actions that normally require approval.

---

## The Planning Workflow

### Phase 1: Frame the problem

Start with the outcome you want, not the implementation. Claude will figure out the approach.

```
I need to migrate our authentication from session cookies to JWT tokens.
The app is a Next.js API with a PostgreSQL database. Create a detailed plan.
```

The more context you give upfront — current state, constraints, what must not break — the better the plan.

### Phase 2: Refine through questions

After the initial plan, iterate. Push on the things that matter:

```
What's the backward compatibility story for existing sessions?
How do we handle the database migration without downtime?
What happens to users who are mid-session during the cutover?
```

Plan mode is designed for this back-and-forth. Multiple refinement rounds before implementation beats discovering surprises mid-execution.

### Phase 3: Review the plan

Claude presents a written plan. Read it carefully. Things to check:

- Does it touch the right files?
- Is the sequence logical — does it avoid circular dependencies?
- Are there steps you'd do differently?
- Are there missing steps (migrations, tests, docs)?

Press `Ctrl+G` to open the plan in your editor and annotate it directly before handing it back.

### Phase 4: Approve and choose your execution mode

When you're satisfied, you have four approval options:

| Option | What happens |
|--------|-------------|
| **Approve and start in auto mode** | Claude executes the plan with minimal interruptions |
| **Approve and accept edits** | Claude executes; prompts only for shell commands, not file edits |
| **Approve and manually review each edit** | Full review of every change — slowest but most control |
| **Keep planning** | Send feedback and plan another round |

Each option also offers to clear the planning context first, so implementation starts with a fresh context focused only on the task.

### Phase 5: Monitor implementation

Even with a solid plan, watch the first few steps. Claude may encounter something the plan didn't anticipate — a file with unexpected structure, a dependency that's already partially updated, a test that reveals an assumption was wrong.

If it goes sideways, `/rewind` rolls back to a checkpoint and you can re-plan with the new information.

---

## When to Use Plan Mode

**Good fits:**
- Refactors that touch many files
- Feature additions that require new abstractions
- Database migrations with multiple steps
- Anything where the "right" approach isn't immediately obvious
- Tasks where you want to review scope before committing

**Overkill for:**
- Single-file fixes with a clear solution
- Typo corrections or small formatting changes
- Anything you already know exactly how to do

---

## Prompting Tips for Plan Mode

**Describe the outcome, not the steps.** Claude will determine the steps — your job is to define what "done" looks like and what constraints apply.

**Surface constraints early.** "We can't take the database down for more than 30 seconds" or "this must remain backward-compatible with v1 clients" shapes the entire plan. Mention them in the first message.

**Provide scope.** "The auth module" is vague. "The files in `src/auth/` and the session handling in `src/middleware/`" gives Claude a starting point for exploration.

**Ask about risks.** After the initial plan: "What could go wrong with this approach?" or "What's the riskiest step?" surfaces assumptions Claude made that you should verify.

---

## Plan Mode vs. Just Asking Claude to Plan

You can ask Claude to write a plan without entering plan mode — it'll just write markdown in the chat. The difference:

| | Plan mode | Asking in chat |
|--|-----------|---------------|
| Can read files | Yes | Yes |
| Can run exploration commands | Yes | Yes |
| Can edit source code | **No** | Yes |
| Creates a structured plan file | Yes | Inline in chat |
| Session named from plan | Yes | No |

Plan mode is the right tool when you want a hard guarantee that nothing changes until you approve it. If you're comfortable with Claude reading and then acting, you can skip it — but for complex tasks, the explicit approval step is worth it.

---

## This Project's Planning Setup

This project has a `/atomic-plan` skill at `.claude/commands/atomic-plan.md` that structures planning into discrete atomic tasks with a research → write → review → publish workflow. The PROGRESS.md file you're reading this series through is an output of that workflow — it provides a shared checklist that both human and AI can track across multiple sessions.
