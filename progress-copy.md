## TTS Service Layer — Decouple `/src/app/tts/page.tsx`

> Introduce a `/src/lib/tts/` service layer with a provider-agnostic `TTSShell` API that supports both the browser `SpeechSynthesis` adapter and the Kokoro AI adapter, chosen lazily at voice-selection time.

---

### Phase 1 — Type Definitions

- [ ] **Create** `src/lib/tts/voices/ITTSVoice.ts` — define the `ITTSVoice` interface (`id`, `name`, `provider: "kokoro" | "browser"`, optional `lang`) exactly as specified in the plan
  - *Why: Every other file in the service layer depends on this shared voice type; creating it first removes circular imports.*

- [ ] **Create** `src/lib/tts/ITTSAdapter.ts` — define three interfaces: `ITTSAdapter` (`speak`, `stop`, `pause`, `resume`, `listVoices`), `TTSSpeakOptions` (`voiceId`, `speed`, `pitch?`, optional `onStart`/`onEnd`/`onError` callbacks), and `IVoiceProvider` (`loadVoices(): Promise<ITTSVoice[]>`)
  - *Why: The page component and all adapters must share a single contract so the shell can delegate to either adapter without knowing which is active; the callbacks let the page update `isSpeaking`/`isPaused` state without coupling to adapter internals.*

---

### Phase 2 — Voice Registry

- [ ] **Create** `src/lib/tts/voices/VoiceRegistry.ts` — define a `VoiceRegistry` class with a private `_providers: IVoiceProvider[]` array, a `register(provider: IVoiceProvider): void` method that pushes to the array, and a `loadVoices(): Promise<ITTSVoice[]>` method that calls `loadVoices()` on every registered provider and returns the concatenated results
  - *Why: Aggregating voices from an array of providers means adding a third voice source in future is a one-line `register()` call with no changes to the registry itself.*

---

### Phase 3 — Adapters

- [ ] **Create** `src/lib/tts/adapters/BrowserAdapter.ts` — implement `ITTSAdapter` and `IVoiceProvider` as a class; `speak()` creates a `SpeechSynthesisUtterance` with the voice looked up by `voiceId` from `window.speechSynthesis.getVoices()`, sets `rate` and `pitch`, calls `window.speechSynthesis.speak(utterance)`, and fires `onStart`/`onEnd`/`onError` via the utterance event callbacks; `stop()` calls `window.speechSynthesis.cancel()`; `pause()` calls `window.speechSynthesis.pause()`; `resume()` calls `window.speechSynthesis.resume()`; `listVoices()` and `loadVoices()` both resolve browser voices via `onvoiceschanged` and map each `SpeechSynthesisVoice` to `ITTSVoice` with `provider: "browser"` and `id: voice.name`
  - *Why: Isolating all `window.speechSynthesis` calls in one class ensures the page component never touches the browser API directly and the adapter can be swapped without touching the page.*

- [ ] **Create** `src/lib/tts/adapters/KokoroAdapter.ts` — implement `ITTSAdapter` and `IVoiceProvider`; define a private static `KOKORO_VOICES` array that lists all 26 known Kokoro voice IDs (from the frozen `$` object in kokoro-js: `af_heart`, `af_alloy`, `af_aoede`, `af_bella`, `af_jessica`, `af_kore`, `af_nicole`, `af_nova`, `af_river`, `af_sarah`, `af_sky`, `am_adam`, `am_echo`, `am_eric`, `am_fenrir`, `am_liam`, `am_michael`, `am_onyx`, `am_puck`, `am_santa`, `bf_emma`, `bf_isabella`, `bm_george`, `bm_lewis`, `bf_alice`, `bf_lily`, `bm_daniel`, `bm_fable`) each mapped to `ITTSVoice` with `provider: "browser"` corrected to `provider: "kokoro"`, `lang` from the voice metadata; `listVoices()` and `loadVoices()` return that static array (no model loading required); `speak()` lazily initialises `this._tts` via `KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "wasm" })` if `this._tts` is null, calls `this._tts.generate(text, { voice: options.voiceId, speed: options.speed })`, calls `audio.toBlob()`, creates a blob URL via `URL.createObjectURL(blob)`, creates `new Audio(blobUrl)`, calls `.play()`, fires `onStart` before play, fires `onEnd` on the `ended` event and revokes the URL there, fires `onError` on the `error` event; `stop()` pauses `this._currentAudio` and sets it to null; `pause()` calls `this._currentAudio?.pause()`; `resume()` calls `this._currentAudio?.play()`; add `"use client"` directive at top
  - *Why: Lazy model loading means the ~300 MB WASM download only happens the first time a Kokoro voice is spoken; using `audio.toBlob()` + `URL.createObjectURL()` + `HTMLAudioElement` plays audio inline without any file download.*

---

### Phase 4 — Shell and Factory

- [ ] **Create** `src/lib/tts/TTSShell.ts` — define a `TTSShell` class with a constructor that accepts `(browserAdapter: BrowserAdapter, kokoroAdapter: KokoroAdapter, registry: VoiceRegistry)` and stores them as private fields; add `private _adapter: ITTSAdapter | null = null`; implement `setAdapter(adapter: ITTSAdapter): void` to set `_adapter`; implement `selectVoice(voice: ITTSVoice): void` that calls `setAdapter(this._browserAdapter)` when `voice.provider === "browser"` and `setAdapter(this._kokoroAdapter)` when `voice.provider === "kokoro"`; implement `speak`, `stop`, `pause`, `resume` as delegating calls to `this._adapter` (throw if adapter is null); implement `getRegistry(): VoiceRegistry` returning `this._registry`; add `"use client"` directive at top
  - *Why: The shell is the single stable surface the page component calls — the page never imports an adapter directly, so switching adapters remains an internal implementation detail.*

- [ ] **Create** `src/lib/tts/TTSFactory.ts` — define a class with a single `static async create(): Promise<TTSShell>` method that constructs a `BrowserAdapter`, a `KokoroAdapter`, and a `VoiceRegistry`, calls `registry.register(browserAdapter)` and `registry.register(kokoroAdapter)`, then returns `new TTSShell(browserAdapter, kokoroAdapter, registry)`; add `"use client"` directive at top
  - *Why: Keeping construction in a static async factory means all adapter setup is colocated and the page can initialise the shell with a single `await TTSFactory.create()` call.*

---

### Phase 5 — Clean Up ttsStore.ts

- [ ] **Delete** the `import { KokoroTTS, TextSplitterStream } from "kokoro-js"` line from `src/lib/ttsStore.ts`
  - *Why: The store is settings-only per the plan; the import is only needed by the `SullySoftTTS` class being removed, and leaving it causes a lint/type error once that class is gone.*

- [ ] **Delete** the `ISullySoftTTS` interface and the entire `SullySoftTTS` class from `src/lib/ttsStore.ts` (lines 27–81)
  - *Why: Per human instructions, the experimental proof-of-concept class moves into the new service layer; keeping it in the store would leave dead code and two competing TTS implementations.*

---

### Phase 6 — Update the Page Component

- [ ] **Replace** the `import { SullySoftTTS } from '@/lib/ttsStore'` line in `src/app/tts/page.tsx` with imports for `TTSFactory` from `@/lib/tts/TTSFactory`, `TTSShell` from `@/lib/tts/TTSShell`, and `ITTSVoice` from `@/lib/tts/voices/ITTSVoice`
  - *Why: The page must import from the new service layer rather than the store so it compiles after `SullySoftTTS` is removed.*

- [ ] **Replace** the `voices: SpeechSynthesisVoice[]` and `selectedVoice: SpeechSynthesisVoice | null` state declarations in `src/app/tts/page.tsx` with `voices: ITTSVoice[]` and `selectedVoice: ITTSVoice | null`; add a `shellRef = useRef<TTSShell | null>(null)` ref; remove the `utteranceRef` and `voicesLoadedRef` refs
  - *Why: The page state must use the provider-agnostic `ITTSVoice` type so it can hold both browser and Kokoro voices in the same list.*

- [ ] **Replace** the entire `useEffect` that calls `window.speechSynthesis.getVoices()` and registers `onvoiceschanged` in `src/app/tts/page.tsx` with a new `useEffect` that calls `TTSFactory.create()`, stores the returned shell in `shellRef.current`, calls `shell.getRegistry().loadVoices()`, sets the result into `voices` state, and sets the default `selectedVoice` to the first English browser voice (where `v.provider === "browser"` and `v.lang?.startsWith("en")`) or the first voice in the list
  - *Why: Voice loading now goes through the registry so both browser and Kokoro voices appear in a single list; the shell must be initialised before any speak/stop calls.*

- [ ] **Rewrite** the `handleVoiceChange` function in `src/app/tts/page.tsx` to find the matching `ITTSVoice` by `v.id === e.target.value` (instead of `v.name`), set it as `selectedVoice`, and call `shellRef.current?.selectVoice(voice)` to switch the shell's active adapter
  - *Why: `ITTSVoice.id` is the stable identifier used by both adapters; calling `selectVoice` at selection time activates the correct adapter so `speak()` later delegates to the right provider.*

- [ ] **Rewrite** the `onSpeak` function in `src/app/tts/page.tsx` to remove the `window.speechSynthesis.cancel()` call, `SpeechSynthesisUtterance` construction, `utteranceRef` update, and `SullySoftTTS.create()` call; replace them with a single `await shellRef.current?.speak(formattedText, { voiceId: selectedVoice.id, speed: rate, pitch, onStart: () => { setIsSpeaking(true); setIsPaused(false); }, onEnd: () => { setIsSpeaking(false); setIsPaused(false); }, onError: () => { setIsSpeaking(false); setIsPaused(false); } })` call; guard with an early return if `!selectedVoice` or `!shellRef.current`
  - *Why: All TTS dispatch now goes through the shell so the page has no direct dependency on any browser API or Kokoro import.*

- [ ] **Rewrite** `onPause`, `onResume`, and `onStop` in `src/app/tts/page.tsx` to call `shellRef.current?.pause()`, `shellRef.current?.resume()`, and `shellRef.current?.stop()` respectively instead of calling `window.speechSynthesis.*` directly
  - *Why: Routing control calls through the shell ensures they reach whichever adapter is currently active — e.g. `pause()` on Kokoro calls `HTMLAudioElement.pause()` rather than `SpeechSynthesis.pause()`.*

- [ ] **Update** the voice `<select>` element in `src/app/tts/page.tsx` — change `value={selectedVoice?.name || ''}` to `value={selectedVoice?.id || ''}`, and change each `<option key={voice.name} value={voice.name}>` to `<option key={voice.id} value={voice.id}>` with display text `{voice.name} [{voice.provider}] ({voice.lang ?? ''})` so users can distinguish browser from Kokoro voices in the dropdown
  - *Why: Options must key and value on `id` (not `name`) because `handleVoiceChange` now looks up by `id`; the provider label makes it clear to users which voices are AI-generated.*

---

### Phase 7 — Verification

- [ ] **Run** `npm run typecheck` in the project root and fix any TypeScript errors before proceeding
  - *Why: The new service layer introduces several interfaces that must align exactly — type errors surface missing method implementations or wrong field names that would cause runtime failures.*

- [ ] **Run** `npm run lint` in the project root and fix any ESLint errors
  - *Why: ESLint enforces the `"use client"` boundary rules and no-unused-variable checks that would catch any import left dangling after the ttsStore cleanup.*
