'use client';

import { useCallback, useRef, useState } from 'react';
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
// JSON types for mupdf asJSON() output (with preserve-spans)
// ---------------------------------------------------------------------------

interface JsonFont {
    name: string;
    family: string;  // "serif" | "monospace" | ...
    weight: string;  // "bold" | "normal"
    style: string;   // "italic" | "normal"
    size: number;
}

interface JsonLine {
    text: string;
    font: JsonFont;
    bbox: { x: number; y: number; w: number; h: number };
}

interface JsonTextBlock {
    type: 'text';
    bbox: { x: number; y: number; w: number; h: number };
    lines: JsonLine[];
}

interface JsonStructureBlock {
    type: 'structure';
    std: string;       // "H" = heading, "LI" = list item / figure label
    contents: Array<JsonTextBlock | JsonStructureBlock>;
}

type JsonBlock = JsonTextBlock | JsonStructureBlock;

interface JsonPage {
    blocks: JsonBlock[];
}

// ---------------------------------------------------------------------------
// PDF extraction via mupdf asJSON()
// ---------------------------------------------------------------------------

// Collect all JsonLine objects recursively from a block or its contents.
function collectLines(block: JsonBlock): JsonLine[] {
    if (block.type === 'text') return block.lines ?? [];
    return (block.contents ?? []).flatMap(collectLines);
}

// Join span texts — they already carry their own spacing, so concatenate directly.
function textFromLines(lines: JsonLine[]): string {
    return lines.map(l => l.text).join('').trim();
}

function isMonoLines(lines: JsonLine[]): boolean {
    if (lines.length === 0) return false;
    const mono = lines.filter(l =>
        l.font.family === 'monospace' ||
        /mono|courier|typewriter|teletype/i.test(l.font.name)
    ).length;
    return mono / lines.length > 0.8;
}

function maxSize(lines: JsonLine[]): number {
    return lines.reduce((m, l) => Math.max(m, l.font.size), 0);
}

// Classify and build a TextContentBlock from a set of lines; returns null if empty.
function classifyTextBlock(
    lines: JsonLine[],
    forceHeading: boolean,
    pageNum: number,
    id: string
): TextContentBlock | null {
    const text = textFromLines(lines);
    if (!text) return null;

    const isCode = !forceHeading && isMonoLines(lines);
    const size = maxSize(lines);
    const boldCount = lines.filter(l => l.font.weight === 'bold').length;
    const boldRatio = lines.length > 0 ? boldCount / lines.length : 0;

    // Heading: forced by structure std="H", or font size above body threshold,
    // or short block that is predominantly bold (same-size section headings).
    const isHeading = forceHeading || (!isCode && (size >= 14 || (boldRatio > 0.8 && lines.length <= 3)));

    const subtype: TextContentBlock['subtype'] = isCode ? 'code' : isHeading ? 'heading' : 'paragraph';
    const headingLevel: TextContentBlock['headingLevel'] = isHeading
        ? (size >= 24 ? 1 : size >= 14 ? 2 : 3)
        : undefined;

    return { type: 'text', subtype, text, headingLevel, pageNum, id };
}

async function extractFromPdf(
    buffer: ArrayBuffer
): Promise<{ blocks: ContentBlock[]; numPages: number }> {
    const mupdf = await getMupdf();
    const doc = mupdf.Document.openDocument(buffer, 'application/pdf');
    const numPages = doc.countPages();
    const blocks: ContentBlock[] = [];
    let blockIdx = 0;

    for (let p = 0; p < numPages; p++) {
        const pageNum = p + 1;
        const page = doc.loadPage(p);
        // preserve-spans: each font-run becomes a separate "line" in JSON with its own font metadata.
        // paragraph-break: MuPDF splits at paragraph boundaries.
        // preserve-images: exposes image blocks via the walker's onImageBlock callback.
        const stext = page.toStructuredText('preserve-images,preserve-spans,paragraph-break');

        // Collect images via walker — JSON output carries no pixel data.
        // Track the bbox y-coordinate so we can interleave images with text in reading order.
        const pageImages: Array<{ src: string; y: number; id: string }> = [];
        stext.walk({
            onImageBlock(bbox, _transform, image) {
                try {
                    const pixmap = image.toPixmap();
                    const pngData = pixmap.asPNG();
                    pixmap.destroy();
                    const src = `data:image/png;base64,${uint8ToBase64(pngData)}`;
                    pageImages.push({ src, y: bbox[1], id: `b-${pageNum}-${blockIdx++}` });
                } catch {
                    // Skip images that fail to render (e.g. unsupported colour spaces)
                }
            },
        });

        // Parse JSON for all text and structure blocks.
        const json: JsonPage = JSON.parse(stext.asJSON());
        stext.destroy();

        // Stage blocks with their top y-coordinate so we can sort into reading order.
        const staged: Array<{ block: ContentBlock; y: number }> = [];

        for (const imgEntry of pageImages) {
            staged.push({
                block: { type: 'image', src: imgEntry.src, pageNum, id: imgEntry.id },
                y: imgEntry.y,
            });
        }

        for (const jsonBlock of json.blocks) {
            if (jsonBlock.type === 'text') {
                const cb = classifyTextBlock(jsonBlock.lines, false, pageNum, `b-${pageNum}-${blockIdx++}`);
                if (cb) staged.push({ block: cb, y: jsonBlock.bbox.y });

            } else if (jsonBlock.type === 'structure') {
                // "LI" marks figure labels / image annotations — skip.
                if (jsonBlock.std === 'LI') continue;

                const lines = collectLines(jsonBlock);
                const isHeading = jsonBlock.std === 'H';
                const cb = classifyTextBlock(lines, isHeading, pageNum, `b-${pageNum}-${blockIdx++}`);
                if (!cb) continue;

                // Use the first content block's y-coordinate as position.
                const firstContent = jsonBlock.contents.find((c): c is JsonTextBlock => c.type === 'text');
                const y = firstContent?.bbox?.y ?? 0;
                staged.push({ block: cb, y });
            }
        }

        // Sort by y then emit — preserves document reading order across text and images.
        staged.sort((a, b) => a.y - b.y);
        for (const { block } of staged) blocks.push(block);
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
// Hoverable TTS wrapper (paragraphs, headings, code)
// ---------------------------------------------------------------------------

function TtsTextBlock({ block }: { block: TextContentBlock }) {
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
                    {block.text}
                </p>
            );
        }

        return (
            <p
                ref={ref as React.RefObject<HTMLParagraphElement>}
                className={`text-sm leading-relaxed text-text-primary ${activeClass}`}
                style={borderStyle}
            >
                {block.text}
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
                            <div key={pageNum} className="bg-paper rounded-lg border-2 border-primary/20 p-6 shadow-sm">
                                {/* Only show page header for PDFs — text/paste has no meaningful page concept */}
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
                                                        src={block.src}
                                                        alt="PDF image"
                                                        className="max-w-full rounded border border-primary/10 my-2"
                                                    />
                                                );
                                            }
                                            return <TtsTextBlock key={block.id} block={block} />;
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
