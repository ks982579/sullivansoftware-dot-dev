"use client";

// Module-level singleton so all pages and block components share one TTSShell instance.
// The shell is created once on first call; subsequent calls return the same Promise.

import { TTSFactory } from './tts/TTSFactory';
import type { TTSShell } from './tts/TTSShell';

let _shellPromise: Promise<TTSShell> | null = null;

export function getShell(): Promise<TTSShell> {
    if (!_shellPromise) {
        _shellPromise = TTSFactory.create();
    }
    return _shellPromise;
}
