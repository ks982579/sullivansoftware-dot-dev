'use client';

import { useRef, useState } from 'react';
import { getTTSSettings } from '@/lib/ttsStore';
import { getShell } from '@/lib/ttsShell';

interface TTSListProps {
  tag: 'ul' | 'ol';
  children: React.ReactNode;
}

function TTSList({ tag: Tag, children }: TTSListProps) {
  const [hovered, setHovered] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const listRef = useRef<HTMLElement>(null);

  async function handleStart() {
    const text = listRef.current?.textContent?.trim() ?? '';
    if (!text) return;

    const { voiceId, rate, pitch } = getTTSSettings();
    const shell = await getShell();
    // Stop whatever is currently playing (resets the previous block's speaking state via onError)
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

  const active = hovered || speaking;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={listRef as any}
        className={
          active
            ? 'rounded-lg border-2 px-3 py-1 -mx-3 -my-1 transition-all duration-200'
            : 'transition-all duration-200'
        }
        style={
          active
            ? {
                borderColor: 'rgba(88, 28, 135, 0.7)',
                boxShadow: '0 0 8px 2px rgba(139, 92, 246, 0.35)',
              }
            : undefined
        }
      >
        {children}
      </Tag>

      {active && (
        <div className="flex gap-2 mt-1 mb-1">
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
            <span className="text-xs text-purple-600 self-center animate-pulse">
              speaking…
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function TTSOl({ children }: { children: React.ReactNode }) {
  return <TTSList tag="ol">{children}</TTSList>;
}

export function TTSUl({ children }: { children: React.ReactNode }) {
  return <TTSList tag="ul">{children}</TTSList>;
}
