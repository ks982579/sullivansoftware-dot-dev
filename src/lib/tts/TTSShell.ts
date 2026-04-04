"use client";

import type { ITTSAdapter, TTSSpeakOptions } from "./ITTSAdapter";
import type { ITTSVoice } from "./voices/ITTSVoice";
import type { VoiceRegistry } from "./voices/VoiceRegistry";

export class TTSShell {
    private _adapter: ITTSAdapter | null = null;
    private _adapters: Map<"browser" | "kokoro", ITTSAdapter>;
    private _registry: VoiceRegistry;

    constructor(adapters: Map<"browser" | "kokoro", ITTSAdapter>, registry: VoiceRegistry) {
        this._adapters = adapters;
        this._registry = registry;
    }

    setAdapter(adapter: ITTSAdapter): void {
        this._adapter = adapter;
    }

    selectVoice(voice: ITTSVoice): void {
        const adapter = this._adapters.get(voice.provider);
        if (adapter) this.setAdapter(adapter);
    }

    async speak(text: string, options: TTSSpeakOptions): Promise<void> {
        if (!this._adapter) throw new Error("No TTS adapter selected. Select a voice first.");
        return this._adapter.speak(text, options);
    }

    stop(): void {
        this._adapter?.stop();
    }

    pause(): void {
        this._adapter?.pause();
    }

    resume(): void {
        this._adapter?.resume();
    }

    getRegistry(): VoiceRegistry {
        return this._registry;
    }
}
