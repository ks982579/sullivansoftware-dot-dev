'use client';

import { useEffect, useRef, useState } from 'react';
import { setTTSSettings } from '@/lib/ttsStore';

export default function TTSSettings() {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const voicesLoadedRef = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      if (voicesLoadedRef.current) return;
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;
      voicesLoadedRef.current = true;
      setVoices(available);
      const defaultVoice = available.find((v) => v.lang.startsWith('en')) ?? available[0];
      setSelectedVoiceName(defaultVoice.name);
      setTTSSettings({ voice: defaultVoice, rate: 1, pitch: 1 });
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function handleVoiceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const voice = voices.find((v) => v.name === e.target.value) ?? null;
    setSelectedVoiceName(e.target.value);
    setTTSSettings({ voice });
  }

  function handleRateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setRate(val);
    setTTSSettings({ rate: val });
  }

  function handlePitchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setPitch(val);
    setTTSSettings({ pitch: val });
  }

  return (
    <div className="mb-6 rounded-lg border-2 border-accent-blue/20 bg-paper overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-accent-blue hover:bg-accent-blue/5 transition-colors"
      >
        <span>🔊 Text-to-Speech Settings</span>
        <span className="text-xs text-text-secondary">{open ? '▲ collapse' : '▼ expand'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-accent-blue/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Voice selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Voice
            </label>
            <select
              value={selectedVoiceName}
              onChange={handleVoiceChange}
              className="rounded border border-primary/20 bg-background text-text-primary px-2 py-1.5 text-sm focus:outline-none focus:border-accent-blue"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Rate — {rate.toFixed(1)}×
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              className="accent-accent-blue"
            />
          </div>

          {/* Pitch */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Pitch — {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={pitch}
              onChange={handlePitchChange}
              className="accent-accent-blue"
            />
          </div>
        </div>
      )}
    </div>
  );
}
