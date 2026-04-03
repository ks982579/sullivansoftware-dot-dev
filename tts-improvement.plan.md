# TTS Improvement Plan — `/tts/pdftts`

High-level improvement plan for the Document TTS page. This is not a code-level spec — it captures goals, current state, and research directions for each area.

---

## 0. Copy-Paste Text Improvements

**Current state:** The input field allows for new line characters. When clicking 'load' these newlines are not preserved in the output. 
**Goal**: Preserver the newline character in the output so we can wrap individual paragraphs in the text-to-speech feature component. Check for multiple new lines and only add non-empty text to the page, I like to use 2-newlines to separate paragraphs when writing in txt files. 

## 1. PDF Rendering Improvements

### Math Equations
**Current state:** Math regions are extracted as garbled character sequences (symbol font glyphs decoded as wrong Unicode). **Goal:** Detect math blocks by font name patterns (STIX, Symbol, Math, CMSY, etc.) or mupdf structural flags, then either render with KaTeX if LaTeX source is available, display the raw block with a visual "math" badge, and skip or summarise for TTS. **Research needed:** mupdf `StructuredText` span flags for math regions; font name patterns reliably associated with math fonts; whether `preserve-spans` mode exposes enough metadata to reconstruct LaTeX; remark-math/rehype-katex integration path for dynamic rendering.

### Tables
**Current state:** Table cells flow together as one undifferentiated text blob, losing all row/column structure. **Goal:** Detect tabular structure by analysing bounding box alignment (rows share y-ranges, columns share x-ranges), then render an HTML `<table>` instead of a flat paragraph block. **Research needed:** Whether `toStructuredText("preserve-spans")` provides sufficient per-span bbox data; x/y clustering threshold strategies for common academic PDF layouts; how to handle merged cells or borderless tables.

### Code Snippets
**Current state:** Monospace-ratio detection works but multi-line code blocks often lose indentation because leading spaces are collapsed during text extraction. **Goal:** Preserve whitespace and indentation exactly as in the source; optionally add syntax highlighting via highlight.js. **Research needed:** mupdf `preserve-whitespace` extraction option and its interaction with `preserve-spans`; whether character-level x-position data can be used to reconstruct indent levels when the flag is insufficient.

### Image Quality
**Current state:** Pages are rasterised at the mupdf default resolution (72 dpi), producing blurry images for diagrams and figures. **Goal:** Render at 150–300 dpi for legibility, particularly for dense figures. **Implementation path:** Pass a scale matrix (e.g. `Matrix.scale(2, 2)`) to `page.toPixmap()`; expose a quality setting in the UI so users can trade file size for sharpness.

### Multi-Column Layouts
**Current state:** Text from left and right columns interleaves in reading order because mupdf returns blocks in document order, not visual column order. **Goal:** Detect column boundaries by clustering block x-positions, then sort blocks column-by-column and top-to-bottom within each column before rendering. **Research needed:** Simple x-coordinate gap/clustering algorithms suited to 2–3 column academic layouts; edge cases such as full-width headings and figures that span columns.

---

## 2. New File Type Parsers

Each new parser maps its content to the existing `ContentBlock` type union (`paragraph`, `heading`, `code`, `image`) and registers itself in the `SUPPORTED_FILE_TYPES` constant.

### Plain Text (.txt)
**Approach:** Split on double newlines to produce paragraph blocks; single newlines within a paragraph are preserved as-is. No heading or code detection — all blocks are `paragraph` type. **Complexity:** Low. Already being added in the same session.

### Markdown (.md)
**Current state:** Treated as plain text, losing all heading, code, and table structure. **Goal:** Parse with `remark` + `remark-gfm` + `remark-math` to get a typed AST, then walk nodes and map `heading`, `code`, `paragraph`, `table`, and `image` node types directly to `ContentBlock` variants. **Complexity:** Medium — requires adding remark as a client-side dependency and writing the AST-to-block mapper.

### pymupdf JSON
**Approach:** pymupdf (Python MuPDF) can export a structured JSON document with `blocks`, `lines`, `spans`, and image metadata. Accept that JSON as an import, map its block type integers to `ContentBlock` types, and skip the WASM pipeline entirely for pre-processed documents. This is useful for heavy documents that are slow to process in-browser. **Complexity:** Low-Medium — the WASM is bypassed; the work is format mapping and validation.

### HTML
**Approach:** Parse with the browser's built-in `DOMParser`, then walk the DOM extracting `h1`–`h6` as headings, `p` as paragraphs, `pre`/`code` as code blocks, and `img` as image blocks (using `src`). Inline styles and scripts are ignored. **Complexity:** Medium — DOM walking is straightforward, but handling deeply nested or non-semantic HTML requires defensive traversal logic.

### EPUB (future)
**Approach:** mupdf itself supports EPUB via `Document.openDocument`; the same structured-text walk pipeline used for PDF should work with minimal changes since mupdf normalises the format internally. **Complexity:** Medium — the pipeline reuse is high, but EPUB internal structure (spine order, NCX/NAV navigation) may require additional sequencing logic to present chapters in the correct order.

---

## 3. TTS Quality Improvements

- **Per-block pre-processing:** Before passing text to `speechSynthesis`, strip residual markdown syntax characters (`**`, `_`, `#`), LaTeX commands (`\frac`, `\sum`, etc.), and reference brackets (`[1]`, `[2]`). This extends the existing `_fmtTextForSpeech` function rather than replacing it.
- **Math blocks:** Skip TTS entirely for detected math blocks and display a "Contains math — not read aloud" badge. As an alternative mode, read the raw LaTeX string with a spoken disclaimer ("math expression follows"); let the user toggle between skip and read modes.
- **Code blocks:** Offer a "read identifiers only" mode that strips operators, brackets, and punctuation before speaking, so only variable/function names and keywords are vocalised. The default remains skipping code blocks or reading them verbatim.
- **Heading level announcement:** Optionally prepend the heading level to the spoken text ("Heading 2: Introduction") so listeners following along without looking at the screen have structural context.

---

## 4. UX Improvements

- **"Read all" queue:** A single button that enqueues all visible blocks and speaks them sequentially, advancing automatically when each block finishes. A stop button cancels the queue at any point.
- **Active block highlight:** The currently-speaking block receives a visual highlight (border or background shift) and scrolls into view automatically, making it easy to follow along visually while listening.
- **Keyboard shortcut:** A global key binding (e.g. `Escape`) stops all active speech immediately, without requiring the user to find and click a Stop button.
- **Persist TTS settings:** Voice selection, rate, and pitch are saved to `localStorage` on change and restored on page load, so users do not need to reconfigure on every visit.

---

## 5. Architecture Notes

- The `SUPPORTED_FILE_TYPES` constant plus a per-type `extractFrom*` function is the established extension point and must be preserved. Adding a new file type means registering it there and writing one self-contained extractor — nothing else in the page changes.
- Each parser is isolated: it receives a `File` object and returns `ContentBlock[]`. The page dispatches on `file.type` or the file name extension and calls the appropriate extractor.
- mupdf WASM must remain lazy-loaded (`dynamic import` on first PDF/EPUB upload). Parsers for txt, md, JSON, and HTML must not trigger the WASM load.
- All processing stays entirely client-side. No backend, server actions, or API routes are introduced.

---

## Status

### 0. Copy-Paste Text Improvements
- [ ] TODO: Create these steps...

### 1. PDF Rendering Improvements
- [ ] Math equations — Not started
- [ ] Tables — Not started
- [ ] Code snippets (indentation preservation) — Not started
- [ ] Image quality (higher dpi) — Not started
- [ ] Multi-column layout detection — Not started

### 2. New File Type Parsers
- [ ] Plain text (.txt) — Not started
- [ ] Markdown (.md) — Not started
- [ ] pymupdf JSON — Not started
- [ ] HTML — Not started
- [ ] EPUB (future) — Not started

### 3. TTS Quality Improvements
- [ ] Per-block pre-processing (strip markdown/LaTeX/refs) — Not started
- [ ] Math block TTS skip + badge — Not started
- [ ] Code block "read identifiers only" mode — Not started
- [ ] Heading level announcement — Not started

### 4. UX Improvements
- [ ] "Read all" sequential queue — Not started
- [ ] Active block highlight + scroll into view — Not started
- [ ] Keyboard shortcut to stop speech — Not started
- [ ] Persist TTS settings to localStorage — Not started
