'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getTTSSettings, setTTSSettings } from '@/lib/ttsStore';

// ---------------------------------------------------------------------------
// PDF.js worker — use CDN to avoid Turbopack bundling issues with the worker
// ---------------------------------------------------------------------------
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const lib = await import('pdfjs-dist');
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsLib = lib;
  return lib;
}

// ---------------------------------------------------------------------------
// Text extraction helpers
// ---------------------------------------------------------------------------

interface TextLine {
  y: number;
  text: string;
  height: number;
}

interface PdfBlock {
  id: string;
  text: string;
  pageNum: number;
}

async function extractBlocks(buffer: ArrayBuffer): Promise<{ blocks: PdfBlock[]; numPages: number }> {
  const lib = await getPdfjs();
  const pdf = await lib.getDocument({ data: buffer }).promise;
  const blocks: PdfBlock[] = [];
  let blockIdx = 0;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Collect text items with position
    const lines: TextLine[] = [];
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = item.transform[5];
      const height = item.height || 12;
      const existing = lines.find((l) => Math.abs(l.y - y) < 2);
      if (existing) {
        existing.text += ' ' + item.str;
      } else {
        lines.push({ y, text: item.str, height });
      }
    }

    // Sort top-to-bottom (PDF y is bottom-up, so descending = reading order)
    lines.sort((a, b) => b.y - a.y);

    // Group lines into paragraph blocks by detecting large vertical gaps
    let current = '';
    let prevY: number | null = null;
    let prevHeight = 12;

    const flush = () => {
      const trimmed = current.trim();
      if (trimmed) {
        blocks.push({ id: `p-${pageNum}-${blockIdx++}`, text: trimmed, pageNum });
      }
      current = '';
    };

    for (const line of lines) {
      if (prevY !== null) {
        const gap = prevY - line.y;
        // New paragraph when gap exceeds 1.8× the previous line's height
        if (gap > prevHeight * 1.8) flush();
      }
      current += (current ? ' ' : '') + line.text;
      prevY = line.y;
      prevHeight = line.height;
    }
    flush();
  }

  return { blocks, numPages: pdf.numPages };
}

// ---------------------------------------------------------------------------
// Hoverable TTS block
// ---------------------------------------------------------------------------

function TtsBlock({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const active = hovered || speaking;

  function handleStart() {
    const t = ref.current?.textContent?.trim() ?? '';
    if (!t) return;
    window.speechSynthesis.cancel();
    const { voice, rate, pitch } = getTTSSettings();
    const utt = new SpeechSynthesisUtterance(t);
    if (voice) utt.voice = voice;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div
      className="relative my-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        ref={ref}
        className={`text-sm leading-relaxed text-text-primary transition-all duration-150 ${
          active ? 'rounded-lg border-2 px-3 py-1 -mx-3' : ''
        }`}
        style={
          active
            ? {
                borderColor: 'rgba(88, 28, 135, 0.7)',
                boxShadow: '0 0 8px 2px rgba(139, 92, 246, 0.35)',
              }
            : undefined
        }
      >
        {text}
      </p>

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
// TTS settings panel (self-contained, writes to ttsStore)
// ---------------------------------------------------------------------------

function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const loadedRef = useRef(false);

  useEffect(() => {
    const load = () => {
      if (loadedRef.current) return;
      const available = window.speechSynthesis.getVoices();
      if (!available.length) return;
      loadedRef.current = true;
      setVoices(available);
      const def = available.find((v) => v.lang.startsWith('en')) ?? available[0];
      setSelectedVoiceName(def.name);
      setTTSSettings({ voice: def, rate: 1, pitch: 1 });
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  return (
    <div className="mb-6 rounded-lg border-2 border-accent-blue/20 bg-paper overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-accent-blue hover:bg-accent-blue/5 transition-colors"
      >
        <span>🔊 Text-to-Speech Settings</span>
        <span className="text-xs text-text-secondary">{open ? '▲ collapse' : '▼ expand'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-accent-blue/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Voice</label>
            <select
              value={selectedVoiceName}
              onChange={(e) => {
                const v = voices.find((v) => v.name === e.target.value) ?? null;
                setSelectedVoiceName(e.target.value);
                setTTSSettings({ voice: v });
              }}
              className="rounded border border-primary/20 bg-background text-text-primary px-2 py-1.5 text-sm focus:outline-none focus:border-accent-blue"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Rate — {rate.toFixed(1)}×
            </label>
            <input type="range" min="0.1" max="2" step="0.1" value={rate}
              onChange={(e) => { const v = parseFloat(e.target.value); setRate(v); setTTSSettings({ rate: v }); }}
              className="accent-accent-blue" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Pitch — {pitch.toFixed(1)}
            </label>
            <input type="range" min="0.1" max="2" step="0.1" value={pitch}
              onChange={(e) => { const v = parseFloat(e.target.value); setPitch(v); setTTSSettings({ pitch: v }); }}
              className="accent-accent-blue" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PdfTtsPage() {
  const [blocks, setBlocks] = useState<PdfBlock[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setError('');
    setLoading(true);
    setFileName(file.name);
    setBlocks([]);
    try {
      const buffer = await file.arrayBuffer();
      const { blocks: extracted, numPages: pages } = await extractBlocks(buffer);
      setBlocks(extracted);
      setNumPages(pages);
    } catch (e) {
      setError(`Failed to parse PDF: ${e instanceof Error ? e.message : String(e)}`);
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

  // Group blocks by page for display
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">PDF Text-to-Speech</h1>
          <p className="text-text-secondary text-sm">
            Import a PDF — hover any paragraph to reveal audio controls. All processing happens in your browser.
          </p>
        </div>

        {/* TTS Settings */}
        <SettingsPanel />

        {/* Drop zone / file picker */}
        <div
          className="mb-8 rounded-lg border-2 border-dashed border-primary/30 bg-paper p-8 text-center transition-colors hover:border-primary/60"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p className="text-text-secondary text-sm mb-4">
            Drag &amp; drop a PDF here, or click to browse
          </p>
          <label className="cursor-pointer inline-block px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow hover:shadow-md transition-shadow text-sm">
            Choose PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleInputChange}
            />
          </label>
          {fileName && (
            <p className="mt-3 text-xs text-text-secondary">
              Loaded: <span className="font-medium text-primary">{fileName}</span>
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-text-secondary text-sm animate-pulse">
            Extracting text from PDF…
          </div>
        )}

        {/* Rendered pages */}
        {!loading && pages.length > 0 && (
          <div className="space-y-6">
            {pages.map(({ pageNum, blocks: pageBlocks }) => (
              <div key={pageNum} className="bg-paper rounded-lg border-2 border-primary/20 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-primary/10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                    Page {pageNum}
                  </span>
                  <span className="text-xs text-text-secondary/60">
                    {pageBlocks.length} block{pageBlocks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {pageBlocks.length === 0 ? (
                  <p className="text-xs text-text-secondary italic">No extractable text on this page.</p>
                ) : (
                  <div className="space-y-1">
                    {pageBlocks.map((block) => (
                      <TtsBlock key={block.id} text={block.text} />
                    ))}
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
