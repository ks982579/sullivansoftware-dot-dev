---
name: new-note
description: Scaffold a new note file in src/content/notes/ with frontmatter pre-filled. Use when the user asks to create a new note, add a note, or uses /new-note. Prompts for topic, subtopic, title, and description, then creates the correctly structured .md file.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash(ls *)
  - Bash(mkdir *)
---

# /new-note — Scaffold a New Note

Create a new note file in `src/content/notes/` with proper frontmatter.

Arguments passed: `$ARGUMENTS`

---

## Steps

1. **Parse arguments** — expect format: `<topic-folder>/<subtopic-folder>/<slug>` optionally followed by `"Title"` and `"Description"`. If arguments are incomplete or missing, ask the user for:
   - Topic (display name, e.g. "Claude Code") and its folder slug (e.g. `claude-code`)
   - Subtopic (display name, e.g. "Fundamentals") and its folder slug (e.g. `fundamentals`)
   - Note slug (kebab-case filename without `.md`, e.g. `my-new-note`)
   - Title (display title for the note)
   - Description (one-sentence summary)

2. **Check the target path** — `src/content/notes/<topic-folder>/<subtopic-folder>/`. If it does not exist, ask the user to confirm before creating it.

3. **Check for existing file** — if `<slug>.md` already exists at that path, warn the user and stop (do not overwrite).

4. **Write the file** with this frontmatter and a placeholder body:

```markdown
---
title: "<Title>"
topic: "<Topic Display Name>"
subtopic: "<Subtopic Display Name>"
date: "<today's date YYYY-MM-DD>"
description: "<Description>"
tags: ["<topic-folder>"]
draft: true
---

# <Title>

_Placeholder — content coming soon._
```

5. **Confirm** — report the created file path and remind the user that `draft: true` means it won't appear on the live site until changed to `draft: false`.
