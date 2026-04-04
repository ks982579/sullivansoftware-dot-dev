"use client";

import type { ITTSAdapter, IVoiceProvider, TTSSpeakOptions } from "../ITTSAdapter";
import type { ITTSVoice } from "../voices/ITTSVoice";

export class BrowserAdapter implements ITTSAdapter, IVoiceProvider {
    async speak(text: string, options: TTSSpeakOptions): Promise<void> {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === options.voiceId) ?? null;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = options.speed;
        utterance.pitch = options.pitch ?? 1;

        options.onStart?.();

        return new Promise<void>((resolve) => {
            utterance.onend = () => {
                options.onEnd?.();
                resolve();
            };
            utterance.onerror = (e) => {
                options.onError?.(e);
                resolve();
            };
            window.speechSynthesis.speak(utterance);
        });
    }

    stop(): void {
        window.speechSynthesis.cancel();
    }

    pause(): void {
        window.speechSynthesis.pause();
    }

    resume(): void {
        window.speechSynthesis.resume();
    }

    listVoices(): Promise<ITTSVoice[]> {
        return this.loadVoices();
    }

    loadVoices(): Promise<ITTSVoice[]> {
        return new Promise<ITTSVoice[]>((resolve) => {
            const map = (voices: SpeechSynthesisVoice[]): ITTSVoice[] =>
                voices.map(v => ({
                    id: v.name,
                    name: v.name,
                    provider: "browser" as const,
                    lang: v.lang,
                }));

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                resolve(map(voices));
                return;
            }

            // Some browsers (Firefox, Safari) populate voices asynchronously
            window.speechSynthesis.onvoiceschanged = () => {
                resolve(map(window.speechSynthesis.getVoices()));
            };
        });
    }
}
