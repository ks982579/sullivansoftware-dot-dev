# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sullivansoftware-dot-dev** is a Next.js 15 portfolio website for Kevin Sullivan (Software Engineer), migrated from Astro. The site features a Japanese Retro design theme and includes pages for projects, blog posts, Master's programme notes with LaTeX support, a hierarchical todo list with localStorage persistence, a quiz application for creating and taking quizzes, and a text-to-speech utility tool.

- **Framework:** Next.js 15.5.9 (React 19, TypeScript 5)
- **Styling:** Tailwind CSS 3.4.1 + Material-UI 6.4.4
- **Deployment:** Netlify
- **Development:** Turbopack (via `next dev --turbopack`)

## Quick Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack (http://localhost:3000)
npm run build            # Production build
npm start                # Run production server
npm run lint             # ESLint check
npm run typecheck        # TypeScript type checking
npm run netlify          # Netlify CLI
```

## Project Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing/home page
│   ├── layout.tsx           # Root layout with MUI ThemeProvider
│   ├── globals.css          # Global styles and animations
│   ├── /about               # About page with timeline
│   ├── /projects            # Projects listing
│   ├── /blogs               # Blog index and dynamic [slug] routes
│   ├── /notes               # Master's programme notes with LaTeX support
│   │   ├── page.tsx         # Notes index with expandable topic cards
│   │   ├── /[topic]/[subtopic]/[slug]  # Dynamic route for individual notes
│   │   └── /components
│   │       ├── TopicCard.tsx           # Client component for expandable cards
│   │       ├── TTSSettings.tsx         # Collapsible TTS voice/rate/pitch panel (client)
│   │       ├── TTSParagraph.tsx        # Hoverable <p> wrapper with TTS start/stop (client)
│   │       └── TTSList.tsx             # Hoverable <ul>/<ol> wrapper with TTS start/stop (client)
│   ├── /tts                 # Text-to-speech utility tools
│   │   ├── page.tsx         # TTS interface with PDF text cleanup
│   │   └── /filetts
│   │       └── page.tsx     # File import → text extraction → per-paragraph TTS (PDF via mupdf)
│   ├── /todo                # Todo list feature (Projects/Epics/Stories/Tasks)
│   │   ├── page.tsx
│   │   ├── PROJECT.md       # Feature documentation
│   │   └── /components
│   │       ├── TodoItem.tsx          # Individual todo item with inline editing
│   │       ├── TodoForm.tsx          # Form to add new todos
│   │       ├── ProjectSection.tsx    # Top-level container (4-level hierarchy)
│   │       ├── EpicSection.tsx       # Epic + embedded StorySection
│   │       ├── ArchiveSection.tsx    # Archive view for soft-deleted items
│   │       └── WorkspaceTabs.tsx     # Workspace switcher/manager UI
│   └── /quiz-app            # Quiz application for creating and taking quizzes
│       ├── page.tsx         # Server component: reads templates, renders QuizAppClient
│       ├── QuizAppClient.tsx # Client component: quiz list, create/import, and templates
│       ├── /create          # Create new quiz page
│       ├── /edit/[id]       # Edit existing quiz page
│       ├── /take/[id]       # Take quiz with options, timer, and results
│       └── /components
│           ├── QuestionForm.tsx      # Reusable form for add/edit questions
│           ├── QuestionItem.tsx      # Question display with edit/delete/reorder
│           ├── QuizOptions.tsx       # Modal for quiz settings before starting
│           └── Timer.tsx             # Pause/resume timer component
├── components/              # Reusable components
│   ├── Footer.tsx           # Site footer with social links
│   ├── ThemeProvider.tsx    # MUI theme provider wrapper
│   ├── MdxContent.tsx       # MDX content renderer with KaTeX support
│   └── TTSSettingsPanel.tsx # Shared TTS settings panel (voice/rate/pitch); used by Notes, pdftts, blogs
├── lib/                     # Utility functions
│   ├── blog.ts             # Blog post file-based data layer
│   ├── notes.ts            # Notes file-based data layer (nested structure)
│   ├── useTodos.ts         # Custom React hook for todo management (workspace-aware)
│   ├── useWorkspaces.ts    # Custom React hook for workspace management
│   ├── useQuizzes.ts       # Custom React hook for quiz CRUD operations
│   ├── quizTypes.ts        # TypeScript interfaces for Quiz, Questions, Answers, Templates
│   ├── quizTemplates.ts    # Server-side reader for quiz template JSON files
│   ├── ttsStore.ts         # Module-level singleton for shared TTS settings (voiceId, rate, pitch) — all TTS pages
│   ├── ttsShell.ts         # Module-level lazy singleton: getShell() → shared TTSShell across all pages
│   └── tts/                # TTS service layer
│       ├── ITTSAdapter.ts          # ITTSAdapter, TTSSpeakOptions, IVoiceProvider interfaces
│       ├── TTSShell.ts             # Public API — delegates to active adapter, selectVoice() switches provider
│       ├── TTSFactory.ts           # Static async factory — constructs a ready TTSShell
│       ├── adapters/
│       │   ├── BrowserAdapter.ts   # Wraps window.speechSynthesis; handles sync/async voice loading
│       │   └── KokoroAdapter.ts    # Wraps kokoro-js; WebGPU detection, streaming audio via produce/consume queue
│       └── voices/
│           ├── ITTSVoice.ts        # Shared voice type (id, name, provider, lang)
│           └── VoiceRegistry.ts    # Aggregates voices from registered IVoiceProvider instances
├── theme/                   # Design system
│   ├── theme.ts            # MUI theme definition (Japanese Retro)
│   └── README.md           # Theme documentation
└── content/
    ├── /posts              # Markdown blog posts (frontmatter format)
    ├── /notes              # Markdown notes (nested: [topic]/[subtopic]/*.md)
    │   ├── /algorithms
    │   │   ├── /graph-theory
    │   │   │   └── dijkstra.md
    │   │   └── /sorting
    │   │       └── quicksort.md
    │   ├── /claude-code
    │   │   ├── /advanced
    │   │   │   ├── custom-slash-commands.md
    │   │   │   ├── hooks.md
    │   │   │   ├── mcp.md
    │   │   │   └── slash-commands.md
    │   │   ├── /comparisons
    │   │   │   ├── agents-md.md
    │   │   │   ├── vs-cursor.md
    │   │   │   └── vs-github-copilot.md
    │   │   ├── /fundamentals
    │   │   │   ├── claude-md.md
    │   │   │   ├── dot-claude-directory.md
    │   │   │   └── essential-flags.md
    │   │   ├── /introduction
    │   │   │   ├── installation.md
    │   │   │   ├── overview.md
    │   │   │   ├── resources.md
    │   │   │   └── ways-to-use.md
    │   │   └── /mastery
    │   │       ├── parallel-agents.md
    │   │       ├── planning-workflow.md
    │   │       └── subagents.md
    │   └── /machine-learning
    │       ├── /neural-networks
    │       │   └── backpropagation.md
    │       └── /optimization
    │           └── gradient-descent.md
    └── /quiz-templates     # Quiz template JSON files (auto-loaded as template buttons)
```

### Data Flow

**Blog Posts (File-based, Japanese Retro Themed):**
- Markdown files in `src/content/posts/` with YAML frontmatter
- Parsed by `src/lib/blog.ts` using gray-matter
- Published to `/blogs` page and dynamic routes at `/blogs/[slug]`
- Both blog pages (`/blogs` and `/blogs/[slug]`) styled with Japanese Retro theme, including tan grid background and brown/slate color scheme
- MDX rendering via next-mdx-remote with light theme code highlighting (atom-one-light.css)
- Text colors optimized for readability: dark brown text on light background, primary color headings
- Code blocks styled with light backgrounds and proper contrast

**Todo Feature (localStorage with Workspaces):**
- Client-side state management via `useTodos(workspaceId)` hook in `src/lib/useTodos.ts`
- Workspace management via `useWorkspaces()` hook in `src/lib/useWorkspaces.ts`
- Hierarchical structure: Project → Epic → Story → Task (4-level nesting)
- Each workspace has isolated todo data: localStorage keys use format `todos_workspace_[id]`
- Default "Personal" workspace (id: "default") auto-created for backward compatibility
- Native HTML5 drag-and-drop for reordering/moving items within same parent
- Soft-delete archive pattern (items marked `archived: true` not displayed in main view)
- Inline editing: Click titles to edit Project/Epic/Story names; Task types use textarea
- Shift+Enter in task textarea adds newline; Enter alone saves the task

**Notes Feature (File-based with LaTeX Support + per-block TTS):**
- Master's programme notes organized in nested folder structure: `src/content/notes/[topic]/[subtopic]/*.md`
- Data layer: `src/lib/notes.ts` with recursive folder traversal and hierarchical grouping
- Full LaTeX/KaTeX support for mathematical equations (inline `$...$` and display `$$...$$`)
- Routes:
  - `/notes` - Index page with click-to-expand topic/subtopic cards
  - `/notes/[topic]/[subtopic]/[slug]` - Individual note pages with breadcrumbs
- Frontmatter schema: `topic`, `subtopic`, `title`, `date`, `description`, `tags`, `draft`
- Styling: Accent-blue (#0288D1) theme, left-aligned text, centered display math
- Features:
  - Static site generation (SSG) for all notes at build time
  - Expandable topic cards (mobile-friendly click-to-expand)
  - Count badges showing number of notes per topic/subtopic
  - Code syntax highlighting via highlight.js
  - Japanese Retro theme with grid background
  - **Per-block Text-to-Speech:** hover any paragraph, unordered list, or ordered list to reveal a dark-purple glowing border and Start/Stop buttons; reads the block's text content via Web Speech API
  - **TTS Settings panel:** collapsible panel above the content card with voice selector, rate slider, and pitch slider; settings apply to all blocks on the page via `ttsStore.ts`
- Architecture: Server component for data fetching, client components for interactivity and TTS
- TTS implementation files:
  - `src/lib/ttsStore.ts` — module-level singleton (`voiceId`, `rate`, `pitch`); avoids React Context issues across the RSC/client boundary
  - `src/lib/ttsShell.ts` — module-level lazy singleton (`getShell()`) returning the shared `TTSShell`; all block components call this instead of touching browser APIs directly
  - `src/components/TTSSettingsPanel.tsx` — canonical shared settings panel; loads voices from the registry (browser + Kokoro), calls `shell.selectVoice()` + writes to store; also used by filetts and blog pages
  - `src/app/notes/components/TTSSettings.tsx` — one-line re-export of `TTSSettingsPanel` for backward compatibility
  - `src/app/notes/components/TTSParagraph.tsx` — wraps MDX `<p>` elements; calls `getShell()` + `shell.speak()/stop()` on click
  - `src/app/notes/components/TTSList.tsx` — wraps MDX `<ul>` and `<ol>` elements (exports `TTSOl`, `TTSUl`); same shell integration as TTSParagraph
  - `src/components/MdxContent.tsx` accepts optional `components` prop (`MDXRemoteProps["components"]`) so any page can inject custom element renderers

**Text-to-Speech Tools (Browser-based):**

`/tts` — Manual TTS (`src/app/tts/page.tsx`):
- Uses its own local `TTSShell` ref (from `TTSFactory.create()`) rather than the shared singleton, since this page manages its own full playback controls (pause/resume)
- Provider-agnostic; the page calls only `TTSShell` — never a browser or Kokoro API directly
- Voice dropdown lists both browser and Kokoro AI voices; selecting a voice activates the matching adapter via `shell.selectVoice(voice)`
- Pitch slider is visually disabled when a Kokoro voice is selected (Kokoro ignores pitch)
- Two text processing modes:
  - **Copy Cleaned Text**: Removes hyphenated line breaks (`-\n`) and normalizes newlines for general use
  - **Speech Processing** (`_fmtTextForSpeech`): Strips square bracket references, handles double underscores
- Styled with Japanese Retro theme

**TTS Service Layer (`src/lib/tts/`):**
- `TTSFactory.create()` — static async factory; constructs `BrowserAdapter`, `KokoroAdapter`, `VoiceRegistry` (both registered), returns a `TTSShell`
- `TTSShell` — single stable API the page uses; `selectVoice(voice)` infers provider and calls `setAdapter()`; `speak/stop/pause/resume` delegate to the active adapter
- `BrowserAdapter` — wraps `window.speechSynthesis`; `loadVoices()` tries `getVoices()` synchronously then falls back to `onvoiceschanged` (cross-browser safe)
- `KokoroAdapter` — wraps `kokoro-js`; lazy model load on first `speak()`:
  - Detects WebGPU via `navigator.gpu.requestAdapter()` and uses `device: "webgpu", dtype: "fp32"` if available; falls back to `device: "wasm", dtype: "q8"`
  - Uses `TextSplitterStream` + `tts.stream()` to process text sentence-by-sentence, enabling long paragraphs without timeout
  - Produce/consume queue pattern: `produce()` iterates the async stream and pushes blob-URL playback functions onto `audioQueue`; `consume()` plays them sequentially; both run concurrently via `Promise.all` so the next chunk is being synthesised while the current one plays
  - `stop()` sets `_stopped = true` (breaks the produce loop) and pauses any current `HTMLAudioElement`
  - Voice list is a hardcoded static array — no model load required just to populate the dropdown
- `VoiceRegistry` — aggregates voices from registered `IVoiceProvider` instances; adding a third TTS provider is a one-line `registry.register()` call
- `ttsStore.ts` stores `voiceId: string | null`, `rate`, `pitch` — shared by all block components (Notes paragraphs/lists, filetts blocks, blog paragraphs/lists); it does not import the service layer
- `ttsShell.ts` provides a single shared `TTSShell` via `getShell()` — block components call `shell.stop()` before `shell.speak()` so only one block can speak at a time; stopping a block triggers its `onError` callback to reset the "speaking…" badge
- **Blog pages** now include `<TTSSettingsPanel />` and pass `{ p: TTSParagraph, ul: TTSUl, ol: TTSOl }` to `<MdxContent>`, giving blog post readers the same hover-to-speak experience as Notes pages

`/tts/filetts` — Document TTS (`src/app/tts/filetts/page.tsx`):
- Generic file-type architecture: `SUPPORTED_FILE_TYPES` constant at top of file — add new parsers by extending it
- Currently supports: **PDF** (via `mupdf` WASM)
- Imports a file entirely client-side (no server involvement) via drag-and-drop or file picker
- Uses **`mupdf`** (MuPDF.js v1.27, AGPL-3.0) for structured PDF extraction
  - WASM (~15 MB) is lazy-loaded only when a file is dropped — no cost on page load
  - `mupdf.js` uses a top-level `await` so `await import('mupdf')` fully initialises the WASM automatically
  - `next.config.ts` sets `experiments.asyncWebAssembly: true` and uses `NormalModuleReplacementPlugin` to strip `node:` prefixes + `resolve.fallback` to map Node.js built-ins to empty in browser builds (mupdf has conditional Node.js code paths that webpack analyses statically)
- Text extracted via `StructuredText.walk()` walker with a **median-spacing paragraph heuristic**:
  - `beginTextBlock` / `endTextBlock` = MuPDF's block boundaries (often an entire column of body text)
  - `beginLine(bbox)` captures each line's y-coordinates (`bbox[1]`, `bbox[3]`)
  - `onChar` per-character: `font.isMono()` → code detection (threshold: > 80% mono chars); `size` → heading detection (≥ 14 pt); h1/h2/h3 at 24/18/14 pt
  - `endTextBlock` computes midpoint-to-midpoint spacings between consecutive lines, finds the **median** spacing, and splits at any gap ≥ 1.5× median — this is the paragraph boundary heuristic (adaptive to single-, 1.5×-, and double-spaced documents)
  - `onImageBlock` → `image.toPixmap().asPNG()` → base64 `data:image/png` rendered inline
- Content block types: `paragraph` (TTS hover), `heading` (bold/sized, TTS hover), `code` (monospace dark bg, TTS hover), `image` (inline `<img>`, no TTS)
- TTS settings panel uses shared `<TTSSettingsPanel />` component; `TtsTextBlock` calls `getShell()` for playback — fully integrated with the TTS service layer

**Quiz Application (localStorage-based):**
- Located at `/quiz-app` route with create, edit, and take sub-routes
- Client-side state management via `useQuizzes()` hook in `src/lib/useQuizzes.ts`
- All data persisted in localStorage (no external database or API calls)
- Question types: Multiple Choice, Short Answer, and Long Answer
- Routes:
  - `/quiz-app` - Home page with create/import options and quiz list
  - `/quiz-app/create` - Create new quiz with save-as-you-go question builder
  - `/quiz-app/edit/[id]` - Edit existing quiz (reuses create page components)
  - `/quiz-app/take/[id]` - Take quiz with options modal, timer, and results
- Features:
  - **Quiz Creation**: Manual creation with title and optional description
  - **Question Management**: Add questions one at a time with inline editing and reordering (up/down arrows); all answer inputs use textarea for formatting preservation
  - **Multiple Choice**: 1 correct answer + minimum 1 incorrect answer (unlimited options); max 5 randomized choices shown during quiz; textarea inputs preserve formatting
  - **Short Answer**: Question + correct answer textarea (supports multi-line answers) for manual grading with fixed 2-point value
  - **Long Answer**: Question + correct answer textarea (supports multi-line answers) with custom point value (set during creation); manual grading with variable points
  - **JSON Import/Export**: Import quizzes from JSON with validation (available in both create and edit modes); export any quiz to JSON for backup or sharing
  - **Quiz Options**: Randomize questions (default on), custom question count per type (including long answer)
  - **Timer**: Pause/resume timer in top right during quiz
  - **Automatic Grading**: Multiple choice auto-graded with green checkmarks/red X's
  - **Manual Grading - Short Answer**: Display user and correct answers side-by-side with three grading buttons (Correct: 2 pts, Partial: 1 pt, Incorrect: 0 pts)
  - **Manual Grading - Long Answer**: Display user and correct answers side-by-side with two number inputs (Points Obtained, Total Points) for custom scoring
  - **Dynamic Scoring**: Results show Multiple Choice Score, Short Answer Score, Long Answer Score (all update as graded), and Final Grade with real-time percentage calculations
  - **Formatting Preservation**: All textareas and answer displays use `whitespace-pre-wrap` CSS to preserve line breaks and spacing
  - **Retake Option**: Ability to retake quiz with different settings
  - **Templates**: Pre-built quizzes loaded from `src/content/quiz-templates/*.json`; buttons appear automatically based on each file's `title` field; loaded at build time via server component
- Styled with Japanese Retro theme (Burnt Orange accent for secondary buttons, Dark Slate for long answer buttons)

### Design System: Japanese Retro Theme

The site uses a cohesive color palette inspired by 1980s Sony consumer electronics and vintage Tokyo aesthetics.

**Core Colors (defined in theme.ts and tailwind.config.ts):**
- **Primary:** Saddle Brown `#8B4513` - buttons, borders, main accents
- **Secondary:** Dark Slate Gray `#2F4F4F` - headers, secondary elements
- **Accent:** Burnt Orange `#FF6F00`, Retro Blue `#0288D1`, Forest Green `#388E3C`
- **Background:** Cornsilk `#FFF8DC` (main), Floral White `#FFFAF0` (paper)
- **Text:** Very Dark Brown `#2C1810` (primary), Medium Brown `#5C4033` (secondary)

**Design Patterns:**
- Cards: `p-6 bg-paper rounded-lg border-2 border-primary/20 hover:border-primary/50`
- Buttons: `px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-xl`
- Subtle corner accent borders (2-4px borders in corners for retro flair)
- Grid background pattern at 50px spacing (opacity 0.08)
- Smooth transitions: `transition-all duration-300`
- Border radius: 4-8px

**CSS Animations** (in `src/app/globals.css`):
- `fadeIn`, `slideInUp`, `slideInDown`, `float` - used on page load and interactions
- Implemented via CSS keyframes with classes like `.animate-fade-in`

### State Management & Data Persistence

**No Global State Library** - The project uses React's built-in hooks:
- `useState` for local component state
- `useEffect` for side effects
- Custom hook `useTodos()` for complex todo logic with localStorage sync

**localStorage Details:**
- Key: `todos_data`
- Format: JSON-stringified array of Todo objects
- Syncs on every state change (via useEffect)
- Loads on component mount (client-side only)

**Workspace Data Model:**
```typescript
interface Workspace {
  id: string;              // Unique identifier
  name: string;            // Display name
  createdAt: number;       // Timestamp
}
```

**Todo Data Model:**
```typescript
interface Todo {
  id: string;              // Unique ID (timestamp + random)
  title: string;
  type: 'project' | 'epic' | 'story' | 'task';
  completed: boolean;      // For archive/restore workflow
  archived: boolean;       // Soft-delete flag
  createdAt: number;       // Timestamp
  parentId: string | null; // Reference to parent (project/epic/story)
  order: number;           // Drag-and-drop sort order
}
```

**Quiz Data Model:**
```typescript
interface Quiz {
  id: string;              // Unique ID (timestamp + random)
  title: string;
  description?: string;
  questions: {
    multiplechoice: MultipleChoiceQuestion[];
    shortanswer: ShortAnswerQuestion[];
    longanswer: LongAnswerQuestion[];
  };
  createdAt: number;       // Timestamp
}

interface MultipleChoiceQuestion {
  id: string;
  question: string;
  choices: {
    correct: string;
    incorrect: string[];
  };
  order: number;
}

interface ShortAnswerQuestion {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface LongAnswerQuestion {
  id: string;
  question: string;
  answer: string;
  totalPoints: number;     // Custom point value (variable)
  order: number;
}
```

**Quiz Template Data Model** (on-disk format, no `id` or `createdAt`):
```typescript
interface QuizTemplateData {
  title: string;
  description?: string;
  questions: {
    multiplechoice: Array<{ question: string; choices: { correct: string; incorrect: string[] } }>;
    shortanswer: Array<{ question: string; answer: string }>;
    longanswer: Array<{ question: string; answer: string; totalPoints: number }>;
  };
}
```

**localStorage Keys:**
- `workspaces` - JSON array of all workspaces
- `active_workspace` - Current workspace ID
- `todos_workspace_[id]` - Todo array for specific workspace (e.g., `todos_workspace_default` for Personal workspace)
- `quizzes` - JSON array of all quizzes

## Common Development Tasks

### Adding a New Page

1. Create `src/app/[route]/page.tsx`
2. Use `"use client"` directive if page needs interactivity
3. Import and apply the Japanese Retro styling patterns
4. The Footer is automatically included via the root layout

### Styling Components

Use Tailwind with the theme colors defined in `tailwind.config.ts`:
```tsx
<div className="p-6 bg-paper rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-all duration-300">
  {/* Content */}
</div>
```

For MUI components, use `theme.ts` overrides. For CSS animations, add keyframes to `globals.css`.

### Adding Blog Posts

1. Create markdown file in `src/content/posts/[slug].md`
2. Include YAML frontmatter:
   ```yaml
   ---
   title: "Post Title"
   pubDate: "2025-01-15"
   description: "Brief description"
   author: "Kevin Sullivan"
   tags: ["tag1", "tag2"]
   draft: false
   ---
   ```
3. Posts are auto-indexed; use `/blogs` to list or `/blogs/[slug]` for individual post

### Adding Notes

1. Create nested folder structure: `src/content/notes/[topic]/[subtopic]/[note-name].md`
2. Include YAML frontmatter:
   ```yaml
   ---
   title: "Note Title"
   topic: "Machine Learning"        # Display name (e.g., "Machine Learning")
   subtopic: "Neural Networks"      # Display name (e.g., "Neural Networks")
   date: "2025-01-15"
   description: "Brief description" # Optional
   tags: ["tag1", "tag2"]           # Optional
   draft: false                     # Set to true to hide from production
   ---
   ```
3. Use LaTeX for equations:
   - Inline math: `$E = mc^2$`
   - Display math (centered): `$$\int_a^b f(x) dx$$`
4. Notes are auto-indexed by topic and subtopic
5. URL structure: `/notes/[topic-slug]/[subtopic-slug]/[note-slug]`
   - Slugs are auto-generated from display names (lowercase, hyphens)

### Modifying the Todo Feature

The todo feature is self-contained in `src/app/todo/` with workspace support:

**Core Hooks:**
- `useWorkspaces()` in `src/lib/useWorkspaces.ts` - Manages workspace CRUD operations and active workspace switching
- `useTodos(workspaceId)` in `src/lib/useTodos.ts` - All todo operations are workspace-scoped via the workspaceId parameter

**Components:**
- `src/app/todo/page.tsx` - Main page, integrates both hooks, renders WorkspaceTabs and all sections
- `src/app/todo/components/ProjectSection.tsx` - Top-level container with inline title editing
- `src/app/todo/components/EpicSection.tsx` - Mid-level container with inline editing, contains StorySection component
- `src/app/todo/components/TodoItem.tsx` - Individual items (complete with inline editing, checkbox, type badge, action buttons)
- `src/app/todo/components/TodoForm.tsx` - Add new items form with type selector
- `src/app/todo/components/WorkspaceTabs.tsx` - Tab UI for switching/creating/renaming/deleting workspaces
- `src/app/todo/components/ArchiveSection.tsx` - Soft-deleted items with restore functionality

**Editing & Input:**
- **Project/Epic/Story titles:** Click to edit inline with pencil button. Enter saves, Escape cancels.
- **Task textarea:** Multi-line editing. Shift+Enter adds newline, Enter alone saves. Escape cancels.
- **Workspaces:** Click workspace name to edit, or use dedicated edit buttons.

**Reference:** See `src/app/todo/PROJECT.md` for detailed feature documentation

### Using the Quiz Feature

**Creating Quizzes:**
1. Navigate to `/quiz-app`
2. Click "Create New Quiz" and enter title and optional description
3. Add questions one at a time using "Multiple Choice" or "Short Answer" buttons
4. Use up/down arrows to reorder questions within their type
5. Click "Finish Quiz" when done

**Importing Quizzes:**
1. Click "Import from JSON" on the quiz app home page
2. Paste JSON in the specified format (validation errors shown inline)
3. Quiz is immediately available in the quiz list

**Loading from Templates:**
1. Template buttons appear automatically under "Use a template" in the Create a Quiz section
2. Each button is labelled with the `title` from its JSON file
3. Click a template button to load it into Your Quizzes; it can then be taken or edited
4. To add new templates, drop a `.json` file into `src/content/quiz-templates/`

**Taking Quizzes:**
1. Click "Take Quiz" on any quiz from the list
2. Configure options: randomization, question count per type
3. Click "Start Quiz" to begin
4. Use pause/resume timer as needed
5. Click "Complete Quiz" to view results
6. Multiple choice questions are auto-graded; short answer questions show grading buttons (Correct/Partial/Incorrect) to manually assign points
7. Short Answer Score updates dynamically as questions are graded; Final Grade combines both MC and SA scores

### Modifying the Quiz Feature

The quiz feature is self-contained in `src/app/quiz-app/`:

**Core Hook:**
- `useQuizzes()` in `src/lib/useQuizzes.ts` - Manages all quiz CRUD operations with localStorage sync

**Pages:**
- `src/app/quiz-app/page.tsx` - Server component: reads quiz templates from disk, renders QuizAppClient
- `src/app/quiz-app/QuizAppClient.tsx` - Client component: quiz list, create/import/template UI, and action buttons
- `src/app/quiz-app/create/page.tsx` - Create new quiz with question builder
- `src/app/quiz-app/edit/[id]/page.tsx` - Edit existing quiz (reuses QuestionForm and QuestionItem components)
- `src/app/quiz-app/take/[id]/page.tsx` - Take quiz with options modal, timer, and results display

**Components:**
- `src/app/quiz-app/components/QuestionForm.tsx` - Reusable form for creating/editing questions (supports all three question types)
- `src/app/quiz-app/components/QuestionItem.tsx` - Display question with edit/delete/reorder controls (up/down arrows)
- `src/app/quiz-app/components/QuizOptions.tsx` - Modal for quiz settings (randomize, question count for all types)
- `src/app/quiz-app/components/Timer.tsx` - Pause/resume timer component

**Question Types:**
- **Multiple Choice**: Requires 1 correct answer and minimum 1 incorrect answer (all use textarea inputs). During quiz, shows max 5 randomized choices. Auto-graded (1 point per correct answer).
- **Short Answer**: Requires question text and correct answer textarea (multi-line support). Results display both user and correct answers side-by-side with three grading buttons. Each question worth 2 points: Correct (2 pts), Partial (1 pt), Incorrect (0 pts).
- **Long Answer**: Requires question text, correct answer textarea (multi-line support), and custom total points value. Results display both user and correct answers side-by-side with two number inputs for custom grading: Points Obtained (0 to totalPoints) and Total Points (read-only display).

**JSON Import/Export Format:**
```json
{
  "title": "Quiz Title",
  "description": "Optional description",
  "questions": {
    "multiplechoice": [
      {
        "question": "Question text",
        "choices": {
          "correct": "Correct answer",
          "incorrect": ["Wrong 1", "Wrong 2"]
        }
      }
    ],
    "shortanswer": [
      {
        "question": "Question text",
        "answer": "Correct answer"
      }
    ],
    "longanswer": [
      {
        "question": "Question text",
        "answer": "Correct answer",
        "totalPoints": 10
      }
    ]
  }
}
```

**Quiz Templates:**
- JSON files stored in `src/content/quiz-templates/`
- Read at build time by `src/lib/quizTemplates.ts` (same pattern as `blog.ts` and `notes.ts`)
- No `id` or `createdAt` fields needed in the JSON; `importQuiz()` generates them on load
- Button labels are derived from each file's `title` property; buttons sorted alphabetically
- Template format is identical to the JSON Import/Export format above

**Important Implementation Details:**
- Timer component uses separate useEffect cycles to avoid React state update errors during render
- All buttons use specific accent colors (`bg-accent-orange` for secondary, `bg-secondary` for long answer) for proper contrast with white text
- Quiz Options modal uses `bg-white` with dark overlay (`bg-black/50`) for visibility
- Questions are grouped by type and maintain separate order indices within their type
- Short answer grading uses state management (`shortAnswerGrades`) to track points per question; scoring updates dynamically
- Long answer grading uses state management (`longAnswerGrades`) with `{ obtained: number; total: number }` structure to track custom points per question; scoring updates dynamically
- QuestionForm uses textarea for ALL answer inputs (multiple choice, short answer, long answer) to support multi-line formatting
- All textareas and answer displays use `whitespace-pre-wrap` CSS class to preserve line breaks and spacing
- Grading buttons (short answer) use color-coded styling: green (Correct), yellow (Partial), red (Incorrect) with active state highlighting
- Long answer grading uses two number inputs: Points Obtained (editable, 0 to totalPoints) and Total Points (read-only display)

## TypeScript & ESLint Configuration

**TypeScript:**
- Strict mode enabled (`noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`)
- Target: ES2017
- Path aliases configured (e.g., `@/components/*` → `./src/components/*`)

**ESLint:**
- Uses ESLint 9 with Next.js config
- Enforces React best practices and accessibility rules
- React rule: no `children` prop (use element nesting instead)
- HTML rule: no nested buttons (convert outer button to clickable div)

**Common Fixes:**
- Unescaped quotes in JSX: use `&apos;` or `&#39;`
- Unused variables: remove or prefix with `_` if intentional
- Type issues: always specify explicit types, avoid `any`

## Netlify Deployment

The site is configured for Netlify with:
- `netlify.toml` for build configuration
- Auto-deploy on git pushes to the main branch
- Redirects and build settings configured in netlify.toml

To deploy locally: `npm run build` then push to git or use Netlify CLI.

## File Path Aliases

Configured in `tsconfig.json`:
```
@/*          → ./src/*
@/components → ./src/components/*
@/lib        → ./src/lib/*
@/theme      → ./src/theme/*
@/app        → ./src/app/*
@/content    → ./src/content/*
```

Always use these aliases in imports for consistency and maintainability.

## Browser Compatibility

Target modern browsers (Chrome, Firefox, Safari, Edge) that support:
- HTML5 Drag and Drop API (for todo drag-and-drop)
- localStorage (for todo and quiz persistence)
- Web Speech API (for text-to-speech functionality)
- Clipboard API (for paste/copy utilities in TTS tool)
- ES6+ JavaScript and CSS Grid/Flexbox
- CSS custom properties (for theme variables)

## Key Dependencies

- **next-mdx-remote:** MDX processing for blog posts and notes (server-side)
- **gray-matter:** YAML frontmatter parsing for blog and note metadata
- **highlight.js:** Syntax highlighting for code blocks
- **katex:** LaTeX math rendering engine for notes (fast, lightweight)
- **remark-math:** Remark plugin to parse math syntax in markdown
- **rehype-katex:** Rehype plugin to render math with KaTeX
- **@mui/material:** Pre-built React components (used selectively alongside Tailwind)
- **tailwindcss:** Utility-first CSS framework (primary styling approach)
- **remark/rehype:** Markdown processing and HTML transformation

## Recent Updates

- **filetts paragraph detection — median spacing heuristic (April 2026):** Fixed paragraph detection in `/tts/filetts`. MuPDF groups entire text columns into a single text block, so the old one-block-per-MuPDF-block logic produced one giant paragraph for all body text. The fix: `beginLine(bbox)` captures each line's y-coordinates; `endTextBlock` computes midpoint-to-midpoint spacings between consecutive lines, finds the **median** spacing, and treats any gap ≥ 1.5× median as a paragraph boundary. This approach is adaptive — it works correctly for single-, 1.5×-, and double-spaced documents without any hard-coded point thresholds. The page was also renamed from `pdftts` to `filetts` to reflect its generic file-type architecture.
- **TTS integration — Notes, filetts, blogs (April 2026):** Extended the TTS service layer to all reading pages. A new `src/lib/ttsShell.ts` module-level singleton (`getShell()`) provides a single shared `TTSShell` across Notes, pdftts, and blog pages — clicking Start on any block stops whatever is currently playing. The duplicate `SettingsPanel` in pdftts was removed; the Notes `TTSSettings.tsx` component was replaced by a canonical `src/components/TTSSettingsPanel.tsx` that loads both browser and Kokoro voices from the registry and disables the pitch control for AI voices. `ttsStore.ts` was updated to store `voiceId: string | null` instead of the browser-specific `SpeechSynthesisVoice`. Blog post pages now render with `TTSSettingsPanel` and hover-to-speak on all paragraphs and lists, matching the Notes experience. `KokoroAdapter` was also fixed: `_stopped` flag is now reset at the start of each `speak()` call, and `stop()` notifies the interrupted caller via `onError` so UI badges reset correctly.
- **TTS Service Layer — `/src/lib/tts/` (April 2026):** Decoupled all TTS logic from `/src/app/tts/page.tsx` into a provider-agnostic service layer. `TTSFactory.create()` returns a `TTSShell` backed by a `BrowserAdapter` (wraps `window.speechSynthesis`) and a `KokoroAdapter` (wraps `kokoro-js`). The active adapter is chosen lazily when the user selects a voice. `KokoroAdapter` detects WebGPU at runtime (falls back to WASM), loads the model lazily on first `speak()`, and uses a streaming produce/consume queue to handle long paragraphs without timeout. `ttsStore.ts` was stripped to settings-only — the `SullySoftTTS` proof-of-concept class was removed. The `/tts` page now lists both browser and Kokoro voices; pitch control is disabled when a Kokoro voice is selected.
- **Document TTS page — mupdf rewrite (April 2026):** Replaced `pdfjs-dist` with `mupdf` (MuPDF.js v1.27) for proper structured extraction. The page now uses MuPDF's `StructuredText` walker to get MuPDF's own paragraph boundaries, per-character font metadata (`.isMono()` for code detection, `size` for headings), and inline image extraction (`image.toPixmap().asPNG()` → base64). `next.config.ts` updated with `asyncWebAssembly: true`, `NormalModuleReplacementPlugin` to strip `node:` prefixes, and `resolve.fallback` to stub out Node.js built-ins in browser builds. Page is now a generic multi-file-type architecture controlled by a `SUPPORTED_FILE_TYPES` constant. `pdfjs-dist` package remains installed but is no longer used by this page.
- **Notes TTS — list support (April 2026):** Extended per-block TTS in the Notes feature to cover `<ul>` and `<ol>` elements in addition to paragraphs. `TTSList.tsx` contains a shared `TTSList` component parameterised by tag, exporting `TTSOl` and `TTSUl`. Both are passed via the `components` prop to `MdxContent` alongside `TTSParagraph`.
- **Notes per-block Text-to-Speech (April 2026):** Added hover-activated TTS to every note page. Hovering a paragraph, unordered list, or ordered list shows a dark-purple glowing border and ▶ Start / ■ Stop buttons beneath the block. A collapsible "Text-to-Speech Settings" panel above the content card exposes voice, rate, and pitch controls. State is shared between the settings panel and paragraph/list components via a module-level singleton (`src/lib/ttsStore.ts`) — this sidesteps the React Context / RSC boundary issue that arises when `MDXRemote` (server-only) and interactive client components must share state. `MdxContent` was updated to accept an optional `components` prop so the pattern can be reused elsewhere.
- **Quiz JSON Import Fix (February 2026):** Fixed React state batching issue in JSON import functionality for both create and edit modes. Previously, when importing multiple questions via JSON, only the last question of each type would be added due to React batching state updates. The fix batches all imported questions into a single state update, ensuring all questions are properly imported. Also added migration logic to `useQuizzes` hook to ensure old quizzes in localStorage have all three question type arrays (multiplechoice, shortanswer, longanswer) to prevent undefined errors.
- **Long Answer Questions & Formatting Preservation (February 2026):** Added new Long Answer question type with custom point values (set during creation). Long answer grading uses two number inputs (Points Obtained and Total Points) for flexible scoring. All answer inputs now use textarea instead of text input for all question types (multiple choice, short answer, long answer). Added `whitespace-pre-wrap` CSS class to all textareas and answer displays to preserve formatting, line breaks, and spacing throughout creation, taking, and grading workflows. Updated JSON import/export format, quiz options, and all related components to support long answer questions.
- **Quiz Manual Grading System (February 2026):** Enhanced short answer grading in quiz results with three-button grading interface (Correct: 2 pts, Partial: 1 pt, Incorrect: 0 pts). Results now display dynamic scoring with Multiple Choice Score, Short Answer Score (updates in real-time as questions are graded), and Final Grade combining both scores. Short answer correct answer input changed from single-line input to textarea for multi-line formatting support. Grading state persists during results view and resets on quiz retake.
- **Quiz Templates & Footer Link (February 2026):** Added file-based quiz templates in `src/content/quiz-templates/`. Template JSON files are read at build time and rendered as buttons under "Use a template" on the quiz app home page. Buttons are auto-generated from the `title` field — adding a new template is as simple as dropping a `.json` file in the directory. Includes a starter "Networks Quiz" template. The quiz app page was split into a server component (`page.tsx`) and client component (`QuizAppClient.tsx`) to support server-side template loading. A Quiz App link was also added to the site footer Quick Links.
- **Quiz Application (January 2026):** New `/quiz-app` feature for creating and taking quizzes with localStorage persistence. Supports multiple choice and short answer questions with save-as-you-go editing. Features include JSON import/export, randomization options, pause/resume timer, automatic grading for multiple choice, and manual review for short answers. Fully styled with Japanese Retro theme using Burnt Orange accent color.
- **Notes Feature (December 2025):** New `/notes` section for Master's programme study materials with full LaTeX/KaTeX support. Features nested folder organization (topic/subtopic/note), expandable topic cards, accent-blue theme, static generation, and proper left-aligned text with centered display equations. Includes sample notes demonstrating math equations, code blocks, and tables.
- **Next.js Security Update:** Upgraded to Next.js 15.5.9 to patch critical CVE-2025-55182, CVE-2025-55184, and CVE-2025-55183 vulnerabilities.
- **Text-to-Speech Tool:** New `/tts` page provides browser-based text-to-speech with PDF cleanup utilities. Features voice selection, rate/pitch controls, playback management, and two text processing modes (basic cleanup vs. speech-optimized formatting). Fully styled with Japanese Retro theme.
- **Blog Theme Integration:** Both `/blogs` and `/blogs/[slug]` now fully themed with Japanese Retro design system (tan grid background, brown/slate colors). Text colors optimized for readability with dark brown body text and primary color headings.
- **Workspace System:** Todo feature now supports multiple workspaces with isolated data and workspace-specific localStorage keys.
- **4-Level Todo Hierarchy:** Project → Epic → Story → Task structure with proper parent-child relationships.
- **Inline Editing:** All hierarchy levels (Project/Epic/Story) support click-to-edit with pencil buttons; Task items use textarea with Shift+Enter for newlines.

## Documentation Sync

After making structural changes to the project (new pages, routes, components, features, or content directories), update this file to reflect:
- New files/directories in the Directory Structure section
- New features in the Project Overview or Recent Updates sections
- Any new commands, development patterns, or data models

Also update `README.md` if the change affects how someone would set up or run the project.

The Directory Structure and Recent Updates sections are especially important to keep current, as they are the primary reference for understanding the codebase.

## Next Steps & Known Considerations

- **Quiz Feature:** Architecture supports IndexedDB migration path if localStorage limit is reached; future enhancements could include more question types (true/false, fill-in-blank, matching), automated short/long answer grading (keyword matching, fuzzy matching, AI-based scoring), quiz attempt history tracking, and customizable rubrics for long answer questions
- **Todo Feature:** Architecture supports IndexedDB migration path if localStorage limit is reached
- **Drag-and-Drop:** Uses native HTML5 API; consider react-beautiful-dnd for advanced features if needed
- **Performance:** Currently no image optimization; consider next/image for future image-heavy content
- **Testing:** No automated tests configured; consider adding Jest/Vitest for critical paths
- **Mobile Responsiveness:** Todo and Quiz pages could benefit from mobile-first design improvements for smaller screens
