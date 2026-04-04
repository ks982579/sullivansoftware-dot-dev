"use client";

import { BrowserAdapter } from "./adapters/BrowserAdapter";
import { KokoroAdapter } from "./adapters/KokoroAdapter";
import type { ITTSAdapter } from "./ITTSAdapter";
import { VoiceRegistry } from "./voices/VoiceRegistry";
import { TTSShell } from "./TTSShell";

export class TTSFactory {
    static async create(): Promise<TTSShell> {
        const browserAdapter = new BrowserAdapter();
        const kokoroAdapter = new KokoroAdapter();

        const registry = new VoiceRegistry();
        registry.register(browserAdapter);
        registry.register(kokoroAdapter);

        const adapters = new Map<"browser" | "kokoro", ITTSAdapter>([
            ["browser", browserAdapter],
            ["kokoro", kokoroAdapter],
        ]);

        return new TTSShell(adapters, registry);
    }
}
