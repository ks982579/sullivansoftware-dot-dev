'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getTTSSettings } from '@/lib/ttsStore';
import { getShell } from '@/lib/ttsShell';
import TTSSettingsPanel from '@/components/TTSSettingsPanel';

// ---------------------------------------------------------------------------
// Supported file types — extend this list as new parsers are added
// ---------------------------------------------------------------------------

const SUPPORTED_FILE_TYPES = [
    { extension: 'pdf', mimeType: 'application/pdf', label: 'PDF' },
    { extension: 'txt', mimeType: 'text/plain', label: 'Plain Text' },
    // Markdown MIME type varies by OS; we also accept by extension in handleFile
    { extension: 'md', mimeType: 'text/markdown', label: 'Markdown' },
] as const;

// Accept both MIME types and explicit extensions so browsers that report
// .md files as text/plain still pass the picker filter.
const ACCEPT = '.pdf,.txt,.md,application/pdf,text/plain,text/markdown,text/x-markdown';

// ---------------------------------------------------------------------------
// mupdf lazy loader — WASM is ~15 MB, only loaded when a file is dropped
// ---------------------------------------------------------------------------

type MupdfModule = typeof import('mupdf');
let cachedMupdf: MupdfModule | null = null;

async function getMupdf(): Promise<MupdfModule> {
    if (!cachedMupdf) cachedMupdf = await import('mupdf');
    return cachedMupdf;
}

// ---------------------------------------------------------------------------
// Content block types
// ---------------------------------------------------------------------------

interface TextContentBlock {
    type: 'text';
    subtype: 'paragraph' | 'heading' | 'code';
    text: string;
    headingLevel?: 1 | 2 | 3;
    pageNum: number;
    id: string;
}

interface ImageContentBlock {
    type: 'image';
    src: string;           // data:image/png;base64,…
    pageNum: number;
    id: string;
}

type ContentBlock = TextContentBlock | ImageContentBlock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uint8ToBase64(data: Uint8Array): string {
    let binary = '';
    // Process in chunks to avoid call-stack overflow on large images
    const chunkSize = 8192;
    for (let i = 0; i < data.length; i += chunkSize) {
        binary += String.fromCharCode(...data.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

// ---------------------------------------------------------------------------
// JSON types for mupdf structured-text output
// ---------------------------------------------------------------------------

interface MupdfLine {
    text: string;
    font?: { family?: string; weight?: string; size?: number };
}

interface MupdfTextNodeJson {
    type: 'text';
    lines: MupdfLine[];
}

interface MupdfStructureNodeJson {
    type: 'structure';
    std: string;
    contents: MupdfNodeJson[];
}

type MupdfNodeJson = MupdfTextNodeJson | MupdfStructureNodeJson | { type: string };

// ---------------------------------------------------------------------------
// Helpers for JSON-based text extraction
// ---------------------------------------------------------------------------

// Join lines, detecting hyphenated word-breaks: if a line ends with "-" and
// the character before the hyphen is a letter, and the next line starts with a
// letter, strip the hyphen and join directly so TTS reads the word whole.
function joinLines(texts: string[], isCode: boolean): string {
    if (isCode) return texts.join('\n');
    let out = texts[0] ?? '';
    for (let i = 1; i < texts.length; i++) {
        const next = texts[i];
        if (
            out.length >= 2 &&
            out[out.length - 1] === '-' &&
            /[a-zA-Z]/.test(out[out.length - 2]) &&
            next.length > 0 &&
            /[a-zA-Z]/.test(next[0])
        ) {
            out = out.slice(0, -1) + next; // drop hyphen, join directly
        } else {
            out += ' ' + next;
        }
    }
    return out;
}

// Recursively collect all line texts and font data from a node's entire subtree.
function gatherLines(node: MupdfNodeJson): { texts: string[]; lines: MupdfLine[] } {
    const texts: string[] = [];
    const lines: MupdfLine[] = [];

    function walk(n: MupdfNodeJson) {
        if (n.type === 'text') {
            for (const line of (n as MupdfTextNodeJson).lines ?? []) {
                const t = (line.text ?? '').trim();
                if (t) { texts.push(t); lines.push(line); }
            }
        } else if (n.type === 'structure') {
            for (const child of (n as MupdfStructureNodeJson).contents ?? []) walk(child);
        }
    }

    walk(node);
    return { texts, lines };
}

function emitBlock(
    texts: string[],
    lines: MupdfLine[],
    isStructureHeading: boolean,
    stdTag: string | undefined,
    pageNum: number,
    out: ContentBlock[],
    counter: { n: number },
) {
    if (texts.length === 0) return;

    const count = lines.length || 1;
    const families = lines.map((l) => (l.font?.family ?? '').toLowerCase());
    const weights = lines.map((l) => (l.font?.weight ?? '').toLowerCase());
    const sizes = lines.map((l) => l.font?.size ?? 0);

    const maxSize = sizes.reduce((m, s) => Math.max(m, s), 0);
    const monoCount = families.filter((f) => f === 'monospace' || f.includes('mono')).length;
    const boldCount = weights.filter((w) => w === 'bold').length;
    const monoRatio = monoCount / count;
    const boldRatio = boldCount / count;

    const isCode = monoRatio > 0.8;
    const isHeading = !isCode && (
        isStructureHeading ||
        maxSize >= 14 ||
        (boldRatio > 0.8 && texts.length <= 3)
    );

    let subtype: TextContentBlock['subtype'] = 'paragraph';
    let headingLevel: TextContentBlock['headingLevel'];

    if (isCode) {
        subtype = 'code';
    } else if (isHeading) {
        subtype = 'heading';
        const lvl = stdTag ? parseInt(stdTag.slice(1), 10) : NaN;
        headingLevel = (Number.isFinite(lvl) && lvl >= 1 && lvl <= 3
            ? lvl
            : maxSize >= 24 ? 1 : maxSize >= 18 ? 2 : 3) as 1 | 2 | 3;
    }

    const text = joinLines(texts, isCode).trim();
    if (!text) return;

    out.push({ type: 'text', subtype, text, headingLevel, pageNum, id: `b-${pageNum}-${counter.n++}` });
}

// Process one node from a page's block list.
// Known leaf tags (headings, list items, paragraphs) → gather all descendant
// text into one block so a heading or bullet reads as a single TTS unit.
// Container tags and unknowns → recurse so nothing is silently dropped.
function processJsonBlock(
    node: MupdfNodeJson,
    pageNum: number,
    out: ContentBlock[],
    counter: { n: number },
) {
    if (node.type === 'image') return; // pixel data not in JSON; handled by walker

    if (node.type === 'text') {
        const { texts, lines } = gatherLines(node);
        emitBlock(texts, lines, false, undefined, pageNum, out, counter);
        return;
    }

    if (node.type === 'structure') {
        const sb = node as MupdfStructureNodeJson;
        const std = sb.std ?? '';
        const isHeadingTag = std !== '' && /^H\d*$/.test(std);

        if (isHeadingTag || std === 'P' || std === 'LI') {
            // Single semantic unit — collect all descendant text as one block.
            const { texts, lines } = gatherLines(node);
            emitBlock(texts, lines, isHeadingTag, isHeadingTag ? std : undefined, pageNum, out, counter);
        } else {
            // Container (L, Sect, Div, Table, …) or unknown — recurse so
            // every descendant text node gets its own block and nothing is lost.
            for (const child of sb.contents ?? []) {
                processJsonBlock(child, pageNum, out, counter);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// PDF extraction — walker for images, JSON for text
// ---------------------------------------------------------------------------

async function extractFromPdf(
    buffer: ArrayBuffer
): Promise<{ blocks: ContentBlock[]; numPages: number }> {
    const mupdf = await getMupdf();
    const doc = mupdf.Document.openDocument(buffer, 'application/pdf');
    const numPages = doc.countPages();
    const blocks: ContentBlock[] = [];
    const counter = { n: 0 };

    for (let p = 0; p < numPages; p++) {
        const pageNum = p + 1;
        const page = doc.loadPage(p);
        const stext = page.toStructuredText('preserve-images,paragraph-break');

        // Images: pixel data is only available via the walker (not in JSON).
        stext.walk({
            onImageBlock(_bbox, _transform, image) {
                try {
                    const pixmap = image.toPixmap();
                    const pngData = pixmap.asPNG();
                    pixmap.destroy();
                    const src = `data:image/png;base64,${uint8ToBase64(pngData)}`;
                    blocks.push({ type: 'image', src, pageNum, id: `b-${pageNum}-${counter.n++}` });
                } catch {
                    // Skip images that fail to render (e.g. unsupported colour spaces)
                }
            },
        });

        // Text: parse the JSON representation so structure-tagged nodes
        // (headings, list items, paragraphs, etc.) are all captured.
        const pageJson = JSON.parse(stext.asJSON()) as { blocks: MupdfNodeJson[] };

        // if (pageNum === 21) {
        //     console.log(pageJson);
        // }

        for (const block of pageJson.blocks ?? []) {
            processJsonBlock(block, pageNum, blocks, counter);
        }

        stext.destroy();
    }

    return { blocks, numPages };
}

// ---------------------------------------------------------------------------
// Plain-text / Markdown extraction (no WASM required)
// ---------------------------------------------------------------------------

function extractFromText(raw: string): { blocks: ContentBlock[]; numPages: number } {
    const blocks: ContentBlock[] = raw
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((text, i) => ({
            type: 'text' as const,
            subtype: 'paragraph' as const,
            text,
            pageNum: 1,
            id: `b-1-${i}`,
        }));
    return { blocks, numPages: 1 };
}

// ---------------------------------------------------------------------------
// Bold Focus Reading — bold the first fraction of each word to guide the eye
// ---------------------------------------------------------------------------

// For each word: always bold the first letter, then bold Math.floor(len/3) more.
// Non-alphabetic tokens (spaces, numbers, punctuation) pass through unchanged.
function applyBoldFocus(text: string): React.ReactNode {
    return text.split(/([a-zA-Z]+)/).map((token, i) => {
        if (!/^[a-zA-Z]+$/.test(token)) return token;
        const boldLen = 1 + Math.floor(token.length / 3);
        return (
            <span key={i}>
                <strong className="font-bold">{token.slice(0, boldLen)}</strong>
                {token.slice(boldLen)}
            </span>
        );
    });
}

// ---------------------------------------------------------------------------
// Hoverable TTS wrapper (paragraphs, headings, code)
// ---------------------------------------------------------------------------

function TtsTextBlock({ block, boldFocus, fontSize }: { block: TextContentBlock; boldFocus: boolean; fontSize: number }) {
    const [hovered, setHovered] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const ref = useRef<HTMLElement>(null);
    const active = hovered || speaking;

    async function handleStart() {
        const text = ref.current?.textContent?.trim() ?? '';
        if (!text) return;
        const { voiceId, rate, pitch } = getTTSSettings();
        const shell = await getShell();
        shell.stop();
        shell.speak(text, {
            voiceId: voiceId ?? '',
            speed: rate,
            pitch,
            onStart: () => setSpeaking(true),
            onEnd: () => setSpeaking(false),
            onError: () => setSpeaking(false),
        });
    }

    function handleStop() {
        getShell().then((shell) => shell.stop());
        setSpeaking(false);
    }

    const borderStyle = active
        ? { borderColor: 'rgba(88, 28, 135, 0.7)', boxShadow: '0 0 8px 2px rgba(139, 92, 246, 0.35)' }
        : undefined;

    const activeClass = active ? 'rounded-lg border-2 px-3 py-1 -mx-3 transition-all duration-150' : 'transition-all duration-150';

    function renderContent() {
        if (block.subtype === 'code') {
            return (
                <pre
                    ref={ref as React.RefObject<HTMLPreElement>}
                    className={`text-xs font-mono bg-gray-50 border border-primary/10 rounded p-3 overflow-x-auto whitespace-pre-wrap ${activeClass}`}
                    style={borderStyle}
                >
                    {block.text}
                </pre>
            );
        }

        if (block.subtype === 'heading') {
            const sizeClass =
                block.headingLevel === 1 ? 'text-xl font-bold text-primary' :
                    block.headingLevel === 2 ? 'text-lg font-semibold text-primary' :
                        'text-base font-semibold text-secondary';
            return (
                <p
                    ref={ref as React.RefObject<HTMLParagraphElement>}
                    className={`${sizeClass} ${activeClass}`}
                    style={borderStyle}
                >
                    {boldFocus ? applyBoldFocus(block.text) : block.text}
                </p>
            );
        }

        return (
            <p
                ref={ref as React.RefObject<HTMLParagraphElement>}
                className={`leading-relaxed text-text-primary ${activeClass}`}
                style={{ ...borderStyle, fontSize: `${fontSize}rem` }}
            >
                {boldFocus ? applyBoldFocus(block.text) : block.text}
            </p>
        );
    }

    return (
        <div
            className="relative my-1"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {renderContent()}

            {active && (
                <div className="flex gap-2 mt-1">
                    {!speaking ? (
                        <button
                            onClick={handleStart}
                            className="px-3 py-0.5 text-xs font-semibold rounded border border-purple-700/60 text-purple-800 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                            ▶ Start
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="px-3 py-0.5 text-xs font-semibold rounded border border-purple-700/60 text-purple-800 bg-purple-100 hover:bg-purple-200 transition-colors"
                        >
                            ■ Stop
                        </button>
                    )}
                    {speaking && (
                        <span className="text-xs text-purple-600 self-center animate-pulse">speaking…</span>
                    )}
                </div>
            )}
        </div>
    );
}


// ---------------------------------------------------------------------------
// Page card — gates bold-focus spans to pages near the viewport so the DOM
// stays lean for textbooks with 100+ pages.
//
// FUTURE: second-pass optimisation — when boldFocus is off, pages still all
// render their full block list. For very large documents a further improvement
// would be to render a placeholder <div> at the page's measured height until
// the card enters the observer buffer, then swap in the real content. This
// keeps the scrollbar accurate while dropping ~97% of DOM nodes for off-screen
// pages. Deferred until needed.
// ---------------------------------------------------------------------------

function PageCard({
    pageNum,
    pageBlocks,
    sourceType,
    boldFocus,
    fontSize,
}: {
    pageNum: number;
    pageBlocks: ContentBlock[];
    sourceType: 'pdf' | 'text' | null;
    boldFocus: boolean;
    fontSize: number;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [nearViewport, setNearViewport] = useState(false);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setNearViewport(entry.isIntersecting),
            { rootMargin: '600px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Only generate bold-focus spans for pages that are in or near the viewport.
    // Off-screen pages render plain text: same layout, a fraction of the nodes.
    const effectiveBoldFocus = boldFocus && nearViewport;

    return (
        <div ref={cardRef} className="bg-paper rounded-lg border-2 border-primary/20 p-6 shadow-sm">
            {sourceType === 'pdf' && (
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-primary/10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                        Page {pageNum}
                    </span>
                    <span className="text-xs text-text-secondary/60">
                        {pageBlocks.length} block{pageBlocks.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {pageBlocks.length === 0 ? (
                <p className="text-xs text-text-secondary italic">No extractable content on this page.</p>
            ) : (
                <div className="space-y-1">
                    {pageBlocks.map((block) => {
                        if (block.type === 'image') {
                            return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={block.id}
                                    src={(block as ImageContentBlock).src}
                                    alt="PDF image"
                                    className="max-w-full rounded border border-primary/10 my-2"
                                />
                            );
                        }
                        return <TtsTextBlock key={block.id} block={block as TextContentBlock} boldFocus={effectiveBoldFocus} fontSize={fontSize} />;
                    })}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function isTextFile(file: File): boolean {
    return (
        file.type === 'text/plain' ||
        file.type === 'text/markdown' ||
        file.type === 'text/x-markdown' ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md')
    );
}

function isPdfFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
}

export default function PdfTtsPage() {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [numPages, setNumPages] = useState(0);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // 'pdf' shows per-page cards; 'text' shows a single card with no page header
    const [sourceType, setSourceType] = useState<'pdf' | 'text' | null>(null);

    const [boldFocus, setBoldFocus] = useState(false);
    const [fontSize, setFontSize] = useState(1);

    // Paste panel state
    const [pasteOpen, setPasteOpen] = useState(false);
    const [pasteText, setPasteText] = useState('');

    const handleFile = useCallback(async (file: File) => {
        if (!isPdfFile(file) && !isTextFile(file)) {
            setError(`Unsupported file type. Accepted: ${SUPPORTED_FILE_TYPES.map((t) => t.label).join(', ')}.`);
            return;
        }
        setError('');
        setLoading(true);
        setFileName(file.name);
        setBlocks([]);
        try {
            if (isPdfFile(file)) {
                const buffer = await file.arrayBuffer();
                const { blocks: extracted, numPages: pages } = await extractFromPdf(buffer);
                setBlocks(extracted);
                setNumPages(pages);
                setSourceType('pdf');
            } else {
                const text = await file.text();
                const { blocks: extracted, numPages: pages } = extractFromText(text);
                setBlocks(extracted);
                setNumPages(pages);
                setSourceType('text');
            }
        } catch (e) {
            setError(`Failed to parse file: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    function handlePasteLoad() {
        const trimmed = pasteText.trim();
        if (!trimmed) return;
        const { blocks: extracted, numPages: pages } = extractFromText(trimmed);
        setBlocks(extracted);
        setNumPages(pages);
        setSourceType('text');
        setFileName('');
        setError('');
    }

    const pages = Array.from({ length: numPages }, (_, i) => ({
        pageNum: i + 1,
        blocks: blocks.filter((b) => b.pageNum === i + 1),
    }));

    return (
        <main
            className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8"
            style={{
                backgroundImage: `
          linear-gradient(rgba(139, 69, 19, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 69, 19, 0.08) 1px, transparent 1px)
        `,
                backgroundSize: '50px 50px',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">Document Text-to-Speech</h1>
                    <p className="text-text-secondary text-sm">
                        Import a document — hover any block to reveal audio controls. All processing happens in your browser.
                    </p>
                </div>

                <TTSSettingsPanel />

                {/* Reading controls — Bold Focus toggle + paragraph font size */}
                <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
                    <div className="flex items-center gap-3">
                        <button
                            role="switch"
                            aria-checked={boldFocus}
                            onClick={() => setBoldFocus((v) => !v)}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${boldFocus ? 'bg-primary' : 'bg-primary/20'}`}
                        >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${boldFocus ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-sm text-text-secondary">Bold Focus Reading</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="font-size-input" className="text-sm text-text-secondary whitespace-nowrap">
                            Font Size
                        </label>
                        <input
                            id="font-size-input"
                            type="number"
                            min={1}
                            max={10}
                            step={0.1}
                            value={fontSize}
                            onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                if (!isNaN(v)) setFontSize(Math.min(10, Math.max(1, v)));
                            }}
                            className="w-20 rounded border border-primary/20 bg-background text-text-primary text-sm px-2 py-0.5 focus:outline-none focus:border-primary"
                        />
                        <span className="text-xs text-text-secondary/60">rem</span>
                    </div>
                </div>

                {/* Drop zone */}
                <div
                    className="mb-4 rounded-lg border-2 border-dashed border-primary/30 bg-paper p-8 text-center transition-colors hover:border-primary/60"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <p className="text-text-secondary text-sm mb-1">
                        Drag &amp; drop a file here, or click to browse
                    </p>
                    <p className="text-xs text-text-secondary/60 mb-4">
                        Supported file types:{' '}
                        {SUPPORTED_FILE_TYPES.map((t) => (
                            <span key={t.extension} className="font-medium text-text-secondary">{t.label}</span>
                        )).reduce<React.ReactNode[]>((acc, el, i) => (i === 0 ? [el] : [...acc, ', ', el]), [])}
                    </p>
                    <label className="cursor-pointer inline-block px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow hover:shadow-md transition-shadow text-sm">
                        Choose File
                        <input type="file" accept={ACCEPT} className="hidden" onChange={handleInputChange} />
                    </label>
                    {fileName && (
                        <p className="mt-3 text-xs text-text-secondary">
                            Loaded: <span className="font-medium text-primary">{fileName}</span>
                        </p>
                    )}
                </div>

                {/* Paste text — collapsible */}
                <div className="mb-8 rounded-lg border-2 border-primary/20 bg-paper overflow-hidden">
                    <button
                        onClick={() => setPasteOpen((o) => !o)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-primary/5 transition-colors"
                    >
                        <span>📋 Paste Text</span>
                        <span className="text-xs text-text-secondary/60">{pasteOpen ? '▲ collapse' : '▼ expand'}</span>
                    </button>

                    {pasteOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-primary/10">
                            <textarea
                                value={pasteText}
                                onChange={(e) => setPasteText(e.target.value)}
                                placeholder="Paste any text here — paragraphs separated by blank lines will become individual TTS blocks…"
                                rows={8}
                                className="w-full rounded border border-primary/20 bg-background text-text-primary text-sm px-3 py-2 focus:outline-none focus:border-accent-blue resize-y font-mono"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handlePasteLoad}
                                    disabled={!pasteText.trim()}
                                    className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Load
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-12 text-text-secondary text-sm animate-pulse">
                        Extracting content… (loading WASM on first use)
                    </div>
                )}

                {!loading && pages.length > 0 && (
                    <div className="space-y-6">
                        {pages.map(({ pageNum, blocks: pageBlocks }) => (
                            <PageCard
                                key={pageNum}
                                pageNum={pageNum}
                                pageBlocks={pageBlocks}
                                sourceType={sourceType}
                                boldFocus={boldFocus}
                                fontSize={fontSize}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
