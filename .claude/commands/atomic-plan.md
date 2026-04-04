---
name: atomic-plan
description: Generate an atomic progress checklist for a feature or task. Each step is a single, concrete action with a one-sentence "Why". Use when the user asks to plan a feature, create a checklist, or uses /atomic-plan. Writes output to PROGRESS.md (or a specified file).
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash(ls *)
---

# /atomic-plan — Atomic Progress Checklist Generator

Generate a structured, atomic checklist for a feature or task. Each step must be a single concrete action — small enough that it cannot be meaningfully subdivided. Each step includes a one-sentence *Why* that explains the purpose clearly to both human and AI.

Arguments passed: `$ARGUMENTS`

---

## What "Atomic" Means

A step is atomic when:
- It has exactly one deliverable (one file written, one command run, one decision made)
- It can be checked off in one sitting without ambiguity about when it is done
- It is specific enough that an AI can execute it without asking follow-up questions
- It is not "implement feature X" — it is "write the `handleSubmit` function in `src/app/form/page.tsx`"

A step is **not** atomic when it contains the words "and", "then", or "also" describing two distinct actions.

---

## Output Format

Each step follows this structure:

```
- [ ] **<Verb>** <specific object or file> — <concrete action detail>
  - *Why: <one sentence explaining the value of this step>*
```

Good verbs: Research, Read, Write, Draft, Edit, Create, Delete, Run, Verify, Test, Publish, Configure, Refactor, Review, Extract, Move, Rename.

---

## Steps to Follow

1. **Understand the task** — read `$ARGUMENTS`. If the description is vague, ask one clarifying question before proceeding. Do not generate a plan based on assumptions.

2. **Explore the codebase** — use Glob and Grep to find files relevant to the task. Read the critical ones. Identify:
   - Files that will be created
   - Files that will be modified
   - Existing utilities/functions that can be reused (do not plan to recreate what already exists)
   - Tests or build steps that must pass after the change

3. **Identify phases** — group the atomic steps into logical phases. Common phases:
   - **Research** — reading docs, exploring code, understanding context
   - **Implementation** — writing, editing, or deleting code/content
   - **Verification** — running tests, linting, typechecking, or manual review
   - **Release/Publish** — deploying, merging, setting draft: false, etc.
   Phases are labels, not constraints — use whatever grouping makes the plan readable.

4. **Generate atomic steps** — for each phase, list every discrete action. Apply the atomicity rules above strictly. When in doubt, split.

5. **Add a Why to every step** — the Why must be one sentence. It should answer "what goes wrong if we skip this?" or "what value does this specifically deliver?". Generic Whys like "completes the task" are not acceptable.

6. **Write to PROGRESS.md** — append the new section to `PROGRESS.md` in the project root (create the file if it does not exist). Preserve any existing content. Use this structure:

```markdown
## <Feature or Task Name>

> <One-sentence description of the goal>

### <Phase Name>

- [ ] **<Verb>** <object> — <detail>
  - *Why: <one sentence>*
```

7. **Confirm** — report how many steps were generated and which file was written to. If any steps felt uncertain (e.g., you weren't sure about a file path), flag them explicitly.

---

## Quality Checks Before Writing

- No step contains two verbs describing two different actions (if it does, please split it).
- Every step has a small explanation of why it is required.
- Steps are ordered so that each one can be executed given only the steps before it.
- Please write explicit steps; no step says "implement", "handle", or "deal with" — these are too vague.
- Repo setup or config steps are included if they are prerequisites.
- The checklist could be handed to someone unfamiliar with the task and they could execute it without asking questions.

## Final Note

Breaking down the plan into atomic executable steps is the main objective of this process.
For example, if the plan states to implement a solution with a particular algorithm, the correct steps to write would list the steps to write the algorithm so the human understands how the algorithm is being implemented.
An incorrect write-up would be to list the step as implement said algorithm, and explaining why as per the instructions. 

That said, the explanations of 'why' a step is being done is to help with reasoning, extending thinking, and aid the human during review.
An example could be if a step is to create a new class with certain properties, then the why might explain no class existed with these features, or the class will be used to decouple the project.
If an atomic step stems from a direct instruction in the plan, it is alright to list the reason 'why' the step is necessary as "per human instructions". 
