## TTS Service Layer — Decouple `/src/app/tts/page.tsx`

> Introduce a `/src/lib/tts/` service layer with a provider-agnostic `TTSShell` API that supports both the browser `SpeechSynthesis` adapter and the Kokoro AI adapter, chosen lazily at voice-selection time.

---

### Phase 1 — Type Definitions

- [x] **Create** `src/lib/tts/voices/ITTSVoice.ts` — define the `ITTSVoice` interface (`id`, `name`, `provider: "kokoro" | "browser"`, optional `lang`) exactly as specified in the plan
  - *Why: Every other file in the service layer depends on this shared voice type; creating it first removes circular imports.*

- [x] **Create** `src/lib/tts/ITTSAdapter.ts` — define three interfaces: `ITTSAdapter` (`speak`, `stop`, `pause`, `resume`, `listVoices`), `TTSSpeakOptions` (`voiceId`, `speed`, `pitch?`, optional `onStart`/`onEnd`/`onError` callbacks), and `IVoiceProvider` (`loadVoices(): Promise<ITTSVoice[]>`)
  - *Why: The page component and all adapters must share a single contract so the shell can delegate to either adapter without knowing which is active; the callbacks let the page update `isSpeaking`/`isPaused` state without coupling to adapter internals.*

---

### Phase 2 — Voice Registry

- [x] **Create** `src/lib/tts/voices/VoiceRegistry.ts` — define a `VoiceRegistry` class with a private `_providers: IVoiceProvider[]` array, a `register(provider: IVoiceProvider): void` method that pushes to the array, and a `loadVoices(): Promise<ITTSVoice[]>` method that calls `loadVoices()` on every registered provider and returns the concatenated results
  - *Why: Aggregating voices from an array of providers means adding a third voice source in future is a one-line `register()` call with no changes to the registry itself.*

---

### Phase 3 — Adapters

- [x] **Create** `src/lib/tts/adapters/BrowserAdapter.ts` — implement `ITTSAdapter` and `IVoiceProvider` as a class; `speak()` creates a `SpeechSynthesisUtterance` with the voice looked up by `voiceId` from `window.speechSynthesis.getVoices()`, sets `rate` and `pitch`, calls `window.speechSynthesis.speak(utterance)`, and fires `onStart`/`onEnd`/`onError` via the utterance event callbacks; `stop()` calls `window.speechSynthesis.cancel()`; `pause()` calls `window.speechSynthesis.pause()`; `resume()` calls `window.speechSynthesis.resume()`; `listVoices()` and `loadVoices()` both resolve browser voices via `onvoiceschanged` and map each `SpeechSynthesisVoice` to `ITTSVoice` with `provider: "browser"` and `id: voice.name`
  - *Why: Isolating all `window.speechSynthesis` calls in one class ensures the page component never touches the browser API directly and the adapter can be swapped without touching the page.*

- [x] **Create** `src/lib/tts/adapters/KokoroAdapter.ts` — implement `ITTSAdapter` and `IVoiceProvider`; define a private static `KOKORO_VOICES` array that lists all 28 known Kokoro voice IDs mapped to `ITTSVoice` with `provider: "kokoro"`; `listVoices()` and `loadVoices()` return that static array (no model loading required); `speak()` lazily initialises `this._tts` via `KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "wasm" })` if `this._tts` is null, calls `this._tts.generate(text, { voice: options.voiceId, speed: options.speed })`, calls `audio.toBlob()`, creates a blob URL via `URL.createObjectURL(blob)`, creates `new Audio(blobUrl)`, calls `.play()`, fires `onStart` before play, fires `onEnd` on the `ended` event and revokes the URL there; `stop()` pauses and clears `_currentAudio`, resolves any pending speak Promise; add `"use client"` directive at top
  - *Why: Lazy model loading means the ~300 MB WASM download only happens the first time a Kokoro voice is spoken; using `audio.toBlob()` + `URL.createObjectURL()` + `HTMLAudioElement` plays audio inline without any file download.*

---

### Phase 4 — Shell and Factory

- [x] **Create** `src/lib/tts/TTSShell.ts` — holds a `Map<"browser"|"kokoro", ITTSAdapter>` and a `VoiceRegistry`; `setAdapter()` sets the active adapter; `selectVoice(voice)` looks up the adapter by `voice.provider` and calls `setAdapter`; `speak`, `stop`, `pause`, `resume` delegate to the active adapter; `getRegistry()` exposes the registry; add `"use client"` directive at top
  - *Why: The shell is the single stable surface the page component calls — the page never imports an adapter directly, so switching adapters remains an internal implementation detail.*

- [x] **Create** `src/lib/tts/TTSFactory.ts` — `static async create(): Promise<TTSShell>` constructs `BrowserAdapter`, `KokoroAdapter`, `VoiceRegistry` (registers both), builds the adapter `Map`, returns a new `TTSShell`; add `"use client"` directive at top
  - *Why: Keeping construction in a static async factory means all adapter setup is colocated and the page can initialise the shell with a single `await TTSFactory.create()` call.*

---

### Phase 5 — Clean Up ttsStore.ts

- [x] **Delete** the `import { KokoroTTS, TextSplitterStream } from "kokoro-js"` line from `src/lib/ttsStore.ts`
  - *Why: The store is settings-only per the plan; the import is only needed by the `SullySoftTTS` class being removed.*

- [x] **Delete** the `ISullySoftTTS` interface and the entire `SullySoftTTS` class from `src/lib/ttsStore.ts`
  - *Why: Per human instructions, the experimental proof-of-concept class moves into the new service layer; keeping it in the store would leave dead code and two competing TTS implementations.*

---

### Phase 6 — Update the Page Component

- [x] **Replace** `import { SullySoftTTS }` with imports for `TTSFactory`, `TTSShell`, `ITTSVoice`; update state types to `ITTSVoice[]` / `ITTSVoice | null`; add `shellRef`; remove old refs
- [x] **Replace** voice-loading `useEffect` with one that calls `TTSFactory.create()`, stores the shell, calls `shell.getRegistry().loadVoices()`, and selects the default voice
- [x] **Rewrite** `handleVoiceChange` to look up by `v.id` and call `shell.selectVoice(voice)`
- [x] **Rewrite** `onSpeak` to call `shell.speak()` with callbacks for `onStart`/`onEnd`/`onError`
- [x] **Rewrite** `onPause`, `onResume`, `onStop` to delegate to `shellRef.current`
- [x] **Update** voice `<select>` to key/value on `id` and label voices with provider

---

### Phase 7 — Verification

- [x] **Run** `npm run typecheck` — 0 errors
- [x] **Run** `npm run lint` — 0 warnings or errors
