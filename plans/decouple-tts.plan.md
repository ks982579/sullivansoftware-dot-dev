# TTS Refactor Plan — SullySoftTTS Service Layer

## Overview

This plan covers decoupling the text-to-speech logic from `/src/app/tts/page.tsx` by
introducing a proper service layer under `/src/lib/tts/`. The goal is a stable, provider-agnostic
public API (`TTSShell`) that supports both the browser's built-in `SpeechSynthesis` API and the
Kokoro AI TTS model (`kokoro-js`, already installed). The active adapter is chosen lazily based on
the user's voice selection.

**Scope constraint:** Only `/src/app/tts/page.tsx` and `/src/lib/ttsStore.ts` are in scope.
`/src/app/tts/pdftts/page.tsx` must not be touched.

---

## Background & Context

### Current state
- `/src/lib/ttsStore.ts` manages TTS settings (voice, speech rate, pitch) and contains an
  experimental `SullySoftTTS` class added as a proof of concept.
- `/src/app/tts/page.tsx` uses the browser `SpeechSynthesis` API directly. The experimental
  Kokoro integration was added manually but currently downloads and saves audio files rather than
  playing audio inline.
- Voice selection UI exists for browser voices only.

### Desired state
- TTS logic lives in `/src/lib/tts/` as an independent service.
- `TTSShell` is the single stable API the page component talks to.
- Adapters for Kokoro and browser TTS implement a shared `ITTSAdapter` interface.
- A `VoiceRegistry` aggregates voices from all registered providers.
- The correct adapter is activated lazily when the user selects a voice.
- Audio plays immediately in the browser — no file downloads.
- `ttsStore.ts` is cleaned up; the experimental `SullySoftTTS` class is removed from it.
- The page component is updated to use the new service layer.

---

## Target Directory Structure

```
/src/lib/tts/
    ITTSAdapter.ts          # Shared adapter interface
    TTSShell.ts             # Public API shell, holds active adapter, exposes setAdapter()
    TTSFactory.ts           # Async static factory — constructs a ready TTSShell
    adapters/
        BrowserAdapter.ts   # Wraps browser SpeechSynthesis API
        KokoroAdapter.ts    # Wraps kokoro-js, handles async model loading
    voices/
        ITTSVoice.ts        # Shared voice type
        VoiceRegistry.ts    # Aggregates voices from registered providers
```

---

## Interfaces & Contracts

### `ITTSVoice`
```ts
export interface ITTSVoice {
    id: string;
    name: string;
    provider: "kokoro" | "browser";
    lang?: string;
}
```

### `ITTSAdapter`
```ts
export interface ITTSAdapter {
    speak(text: string, options: TTSSpeakOptions): Promise<void>;
    stop(): void;
    listVoices(): Promise<ITTSVoice[]>;
}

export interface TTSSpeakOptions {
    voiceId: string;
    speed: number;
    pitch?: number; // browser only, ignored by Kokoro
}
```

### `IVoiceProvider`
```ts
export interface IVoiceProvider {
    loadVoices(): Promise<ITTSVoice[]>;
}
```

---

## Key Design Decisions

1. **Lazy adapter creation via `setAdapter()`** — `TTSShell` starts with no active adapter.
   When the user selects a voice, the provider is inferred from `ITTSVoice.provider` and
   `setAdapter()` is called with the appropriate adapter. `KokoroAdapter` initialises the model
   at this point.

2. **Factory pattern for async setup** — `TTSFactory.create()` is a static async method that
   returns a fully constructed `TTSShell`. This keeps constructors synchronous.

3. **Kokoro plays audio inline** — `KokoroAdapter.speak()` should generate audio, convert to a
   blob URL via `URL.createObjectURL()`, play it with a standard `HTMLAudioElement`, and revoke
   the URL on the `ended` event. No file saving.

4. **VoiceRegistry is subscribable** — adapters register themselves with the registry.
   `loadVoices()` iterates registered providers and aggregates results, tagging each voice with
   its provider. This makes adding a third provider in future a one-line registration.

5. **`ttsStore.ts` retains settings only** — voice, speed, and pitch state stays in the store.
   The experimental `SullySoftTTS` class is removed. The store does not import or reference the
   new service layer directly; the page component wires them together.

6. **Next.js client boundary** — all TTS classes must be client-side only. Any file that
   references `window`, `Audio`, or `SpeechSynthesis` must have `"use client"` at the top, or be
   imported only within client components. Claude Code should be careful not to import these into
   any server component or server action.

7. **`/src/app/tts/pdftts/page.tsx` is off limits** — do not read, modify, or reference this
   file at any point.

---

## Out of Scope (Future Work)

- Expanded voice selection UI beyond wiring Kokoro voices into the existing selector.
- Pitch control for Kokoro (not supported by the model).
- Multiple simultaneous adapters.
- Persisting the selected voice across sessions.

---

## Acceptance Criteria

- [ ] `/src/lib/tts/` directory exists with all files above.
- [ ] `TTSFactory.create()` returns a `TTSShell` instance.
- [ ] Selecting a browser voice calls `BrowserAdapter` and speaks via `SpeechSynthesis`.
- [ ] Selecting a Kokoro voice calls `KokoroAdapter`, loads the model lazily, and plays audio
      inline without downloading a file.
- [ ] `VoiceRegistry.loadVoices()` returns combined voices from both providers, tagged by
      provider.
- [ ] Voice selection UI on `/src/app/tts/page.tsx` lists both browser and Kokoro voices.
- [ ] `ttsStore.ts` contains no TTS logic — settings only.
- [ ] `/src/app/tts/pdftts/page.tsx` is unchanged.
- [ ] No TypeScript errors.
