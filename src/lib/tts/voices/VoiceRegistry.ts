import type { IVoiceProvider } from "../ITTSAdapter";
import type { ITTSVoice } from "./ITTSVoice";

export class VoiceRegistry {
    private _providers: IVoiceProvider[] = [];

    register(provider: IVoiceProvider): void {
        this._providers.push(provider);
    }

    async loadVoices(): Promise<ITTSVoice[]> {
        const results = await Promise.all(this._providers.map(p => p.loadVoices()));
        return results.flat();
    }
}
