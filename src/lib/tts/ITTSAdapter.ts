import type { ITTSVoice } from "./voices/ITTSVoice";

export type { ITTSVoice };

export interface TTSSpeakOptions {
    voiceId: string;
    speed: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (e: Event | Error) => void;
}

export interface ITTSAdapter {
    speak(text: string, options: TTSSpeakOptions): Promise<void>;
    stop(): void;
    pause(): void;
    resume(): void;
    listVoices(): Promise<ITTSVoice[]>;
}

export interface IVoiceProvider {
    loadVoices(): Promise<ITTSVoice[]>;
}
