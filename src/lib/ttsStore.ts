// Module-level singleton for TTS settings shared across TTSSettingsPanel and block components.
// Using a simple store avoids React Context issues across the server/client boundary in Next.js RSC.

interface TTSSettings {
    voiceId: string | null;
    rate: number;
    pitch: number;
}

const settings: TTSSettings = {
    voiceId: null,
    rate: 1,
    pitch: 1,
};

export function getTTSSettings(): TTSSettings {
    return settings;
}

export function setTTSSettings(patch: Partial<TTSSettings>): void {
    if (patch.voiceId !== undefined) settings.voiceId = patch.voiceId;
    if (patch.rate !== undefined) settings.rate = patch.rate;
    if (patch.pitch !== undefined) settings.pitch = patch.pitch;
}
