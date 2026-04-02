// Module-level singleton for TTS settings shared across TTSSettings and TTSParagraph components.
// Using a simple store avoids React Context issues across the server/client boundary in Next.js RSC.

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
