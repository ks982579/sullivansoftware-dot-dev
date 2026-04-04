// Module-level singleton for TTS settings shared across TTSSettings and TTSParagraph components.
// Using a simple store avoids React Context issues across the server/client boundary in Next.js RSC.
import { KokoroTTS, TextSplitterStream } from "kokoro-js";

interface TTSSettings {
    voice: SpeechSynthesisVoice | null;
    rate: number;
    pitch: number;
}

const settings: TTSSettings = {
    voice: null,
    rate: 1,
    pitch: 1,
};

export function getTTSSettings(): TTSSettings {
    return settings;
}

export function setTTSSettings(patch: Partial<TTSSettings>): void {
    if (patch.voice !== undefined) settings.voice = patch.voice;
    if (patch.rate !== undefined) settings.rate = patch.rate;
    if (patch.pitch !== undefined) settings.pitch = patch.pitch;
}

export interface ISullySoftTTS {
    tts: KokoroTTS; // Somehow Extract
    splitter: TextSplitterStream;
    // create: () => Promise<ISullySoftTTS>; // interface describes instance, not class.
    generate: (text: string) => Promise<void>
}

export class SullySoftTTS implements ISullySoftTTS {
    tts: KokoroTTS;
    splitter: TextSplitterStream;
    constructor(tts: KokoroTTS) {
        this.tts = tts;
        this.splitter = new TextSplitterStream();
    }

    static async create(): Promise<SullySoftTTS> {
        const tts = await KokoroTTS.from_pretrained(
            "onnx-community/Kokoro-82M-v1.0-ONNX",
            {
                dtype: 'q8',
                device: 'wasm'
            }
        );

        return new SullySoftTTS(tts);
    }

    async generate(text: string): Promise<void> {
        // Setting up stream
        const stream = this.tts.stream(this.splitter);
        (async () => {
            let i = 0;
            for await (const { text, phonemes, audio } of stream) {
                console.log({ text, phonemes });
                audio.save(`audio-${i++}.wav`);
            }
        })();

        // Adding Stream
        const tokens = text.match(/\s*\S+/g);
        if (!!tokens) {
            for (const token of tokens) {
                this.splitter.push(token);
                await new Promise((resolve) => setTimeout(resolve, 10))
            }
        }
        // Closing stream to signal no more text
        this.splitter.close();

        // Could use splitter.flush(); if you want to keep stream open
    }
}
