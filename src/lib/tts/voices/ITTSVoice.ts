export interface ITTSVoice {
    id: string;
    name: string;
    provider: "kokoro" | "browser";
    lang?: string;
}
