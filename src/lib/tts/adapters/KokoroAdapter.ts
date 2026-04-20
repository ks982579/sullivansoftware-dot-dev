"use client";

/// <reference types="@webgpu/types" />

import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import type { ITTSAdapter, IVoiceProvider, TTSSpeakOptions } from "../ITTSAdapter";
import type { ITTSVoice } from "../voices/ITTSVoice";

// Static voice list derived from the frozen VOICES constant inside kokoro-js.
// These are fixed for Kokoro-82M-v1.0-ONNX and do not require the model to be loaded.
const KOKORO_VOICES: ITTSVoice[] = [
    { id: "af_heart", name: "Heart (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_alloy", name: "Alloy (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_aoede", name: "Aoede (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_bella", name: "Bella (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_jessica", name: "Jessica (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_kore", name: "Kore (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_nicole", name: "Nicole (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_nova", name: "Nova (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_river", name: "River (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_sarah", name: "Sarah (US F)", provider: "kokoro", lang: "en-us" },
    { id: "af_sky", name: "Sky (US F)", provider: "kokoro", lang: "en-us" },
    { id: "am_adam", name: "Adam (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_echo", name: "Echo (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_eric", name: "Eric (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_fenrir", name: "Fenrir (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_liam", name: "Liam (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_michael", name: "Michael (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_onyx", name: "Onyx (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_puck", name: "Puck (US M)", provider: "kokoro", lang: "en-us" },
    { id: "am_santa", name: "Santa (US M)", provider: "kokoro", lang: "en-us" },
    { id: "bf_emma", name: "Emma (GB F)", provider: "kokoro", lang: "en-gb" },
    { id: "bf_isabella", name: "Isabella (GB F)", provider: "kokoro", lang: "en-gb" },
    { id: "bf_alice", name: "Alice (GB F)", provider: "kokoro", lang: "en-gb" },
    { id: "bf_lily", name: "Lily (GB F)", provider: "kokoro", lang: "en-gb" },
    { id: "bm_george", name: "George (GB M)", provider: "kokoro", lang: "en-gb" },
    { id: "bm_lewis", name: "Lewis (GB M)", provider: "kokoro", lang: "en-gb" },
    { id: "bm_daniel", name: "Daniel (GB M)", provider: "kokoro", lang: "en-gb" },
    { id: "bm_fable", name: "Fable (GB M)", provider: "kokoro", lang: "en-gb" },
];

export class KokoroAdapter implements ITTSAdapter, IVoiceProvider {
    private _tts: KokoroTTS | null = null;
    private _currentAudio: HTMLAudioElement | null = null;
    private _currentResolve: (() => void) | null = null; // lets stop() unblock consume's awaited promise
    private _stopped: boolean = false;
    private _generation: number = 0; // incremented per speak() call; old produce loops self-terminate
    private _currentOptions: TTSSpeakOptions | null = null;
    private _device: 'webgpu' | 'wasm' | 'cpu' | null = null;
    private _dtype?: 'fp32' | 'fp16' | 'q8' | 'q4f16' | 'q4' = 'q8';

    async speak(text: string, options: TTSSpeakOptions): Promise<void> {
        // Each speak() gets its own generation ID. Old produce loops check this to self-terminate
        // instead of competing with the new call on the shared WASM/WebGPU runtime.
        const gen = ++this._generation;
        this._stopped = false;
        this._currentOptions = options;

        // Checking if webgpu compatible.
        if (!this._device) {
            this._device = 'wasm';
            if (!!navigator.gpu) {
                const adapter = await navigator.gpu.requestAdapter();
                if (!!adapter) {
                    this._device = 'webgpu';
                    this._dtype = 'fp32'; // change to fp16 if too slow.
                    console.info('WebGPU enabled.');
                }
            }
        }

        // Initiate TTS if not instantiated.
        if (!this._tts) {
            this._tts = await KokoroTTS.from_pretrained(
                "onnx-community/Kokoro-82M-v1.0-ONNX",
                {
                    dtype: this._dtype,
                    device: this._device
                }
            );
        }

        const splitter = new TextSplitterStream();
        const stream = this._tts?.stream(
            splitter,
            {
                voice: options.voiceId as Parameters<KokoroTTS["generate"]>[1] extends { voice?: infer V } ? V : never,
                speed: options.speed,
            }
        );

        splitter.push(text); // can push more than once (like for LLM)
        splitter.close(); // can keep open with 'flush'

        options.onStart?.();

        const audioQueue: Array<() => Promise<void>> = [];
        let playbackDone = false;

        const produce = async () => {
            try {
                for await (const { audio } of stream) {
                    // Stop if stop() was called or a newer speak() has started
                    if (this._stopped || this._generation !== gen) break;
                    const blob = audio.toBlob();
                    const url = URL.createObjectURL(blob);

                    audioQueue.push(() => new Promise<void>((resolve) => {
                        const audioEl = new Audio(url);
                        this._currentAudio = audioEl;
                        // Expose resolve so stop() can unblock consume without nulling DOM handlers
                        this._currentResolve = resolve;

                        audioEl.onended = () => {
                            this._currentResolve = null;
                            URL.revokeObjectURL(url);
                            resolve();
                        };

                        audioEl.onerror = (e) => {
                            this._currentResolve = null;
                            URL.revokeObjectURL(url);
                            options.onError?.(e instanceof Event ? e : new Error(String(e)));
                            resolve();
                        };

                        audioEl.play().catch((e: Error) => {
                            this._currentResolve = null;
                            URL.revokeObjectURL(url);
                            options.onError?.(e);
                            resolve();
                        });
                    }));
                }
            } catch (e) {
                // Kokoro inference error (e.g. OOM, context limit). Report it so the UI resets.
                if (!this._stopped && this._generation === gen) {
                    options.onError?.(e instanceof Error ? e : new Error(String(e)));
                }
            } finally {
                // Always mark done so consume can exit — even if produce threw mid-stream.
                playbackDone = true;
            }
        };

        const consume = async () => {
            while (!playbackDone || audioQueue.length > 0) {
                if (this._stopped || this._generation !== gen) break;
                if (audioQueue.length === 0) {
                    await new Promise(r => setTimeout(r, 50)); // wait for next chunk
                    continue;
                }
                await audioQueue.shift()!();
            }
        };

        await Promise.all([produce(), consume()]);

        this._currentAudio = null;
        this._currentResolve = null;
        this._currentOptions = null;
        if (!this._stopped && this._generation === gen) options.onEnd?.();
    }

    stop(): void {
        this._stopped = true;
        const opts = this._currentOptions;
        this._currentOptions = null;
        if (this._currentAudio) {
            this._currentAudio.pause();
            URL.revokeObjectURL(this._currentAudio.src);
            this._currentAudio = null;
        }
        // Resolve consume's awaited promise so its loop can observe _stopped and exit cleanly.
        // Previously stop() would null onended/onerror on the live DOM element, which left
        // consume permanently hung on a Promise that could never resolve.
        const resolve = this._currentResolve;
        this._currentResolve = null;
        resolve?.();
        // Notify the interrupted caller so its UI (e.g. "speaking…" badge) resets
        opts?.onError?.(new Error('stopped'));
    }

    pause(): void {
        this._currentAudio?.pause();
    }

    resume(): void {
        this._currentAudio?.play().catch(() => { });
    }

    listVoices(): Promise<ITTSVoice[]> {
        return this.loadVoices();
    }

    loadVoices(): Promise<ITTSVoice[]> {
        return Promise.resolve(KOKORO_VOICES);
    }
}
