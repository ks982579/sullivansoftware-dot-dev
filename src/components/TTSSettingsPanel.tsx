'use client';

import { useEffect, useRef, useState } from 'react';
import { setTTSSettings } from '@/lib/ttsStore';
import { getShell } from '@/lib/ttsShell';
import type { ITTSVoice } from '@/lib/tts/voices/ITTSVoice';

export default function TTSSettingsPanel() {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<ITTSVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    getShell().then(async (shell) => {
      const allVoices = await shell.getRegistry().loadVoices();
      setVoices(allVoices);
      const defaultVoice =
        allVoices.find((v) => v.provider === 'browser' && v.lang?.startsWith('en')) ??
        allVoices[0];
      if (defaultVoice) {
        setSelectedVoiceId(defaultVoice.id);
        shell.selectVoice(defaultVoice);
        setTTSSettings({ voiceId: defaultVoice.id, rate: 1, pitch: 1 });
      }
    });
  }, []);

  function handleVoiceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const voiceId = e.target.value;
    const voice = voices.find((v) => v.id === voiceId);
    if (!voice) return;
    setSelectedVoiceId(voiceId);
    setTTSSettings({ voiceId });
    getShell().then((shell) => shell.selectVoice(voice));
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

  const isKokoro = voices.find((v) => v.id === selectedVoiceId)?.provider === 'kokoro';

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
              value={selectedVoiceId}
              onChange={handleVoiceChange}
              className="rounded border border-primary/20 bg-background text-text-primary px-2 py-1.5 text-sm focus:outline-none focus:border-accent-blue"
            >
              {voices.length === 0 && <option>Loading voices…</option>}
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} [{v.provider}] ({v.lang ?? ''})
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

          {/* Pitch — disabled for Kokoro voices */}
          <div className={`flex flex-col gap-1 ${isKokoro ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Pitch — {pitch.toFixed(1)}{isKokoro ? ' (n/a for AI voices)' : ''}
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={pitch}
              onChange={handlePitchChange}
              disabled={isKokoro}
              className="accent-accent-blue"
            />
          </div>
        </div>
      )}
    </div>
  );
}
