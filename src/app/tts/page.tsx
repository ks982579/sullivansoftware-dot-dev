'use client'

import React, { useEffect, useState, useRef } from 'react';

const Tts: React.FC = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [textSpeech, setTextSpeech] = useState('');
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const voicesLoadedRef = useRef(false);

    // Load voices after component mounts (SSR-safe)
    useEffect(() => {
        const loadVoices = () => {
            if (!voicesLoadedRef.current && typeof window !== 'undefined') {
                const availableVoices = window.speechSynthesis.getVoices();
                if (availableVoices.length > 0) {
                    setVoices(availableVoices);
                    // Set default voice (prefer English voices)
                    const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
                    setSelectedVoice(defaultVoice);
                    voicesLoadedRef.current = true;
                }
            }
        };

        // Initial load
        loadVoices();

        // Listen for voices changed event (some browsers load voices asynchronously)
        if (typeof window !== 'undefined') {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const voice = voices.find(v => v.name === e.target.value);
        if (voice) {
            setSelectedVoice(voice);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextSpeech(e.target.value);
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRate(parseFloat(e.target.value));
    };

    const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPitch(parseFloat(e.target.value));
    };

    const onSpeak = () => {
        if (!textSpeech.trim()) {
            alert('Please enter some text to speak');
            return;
        }

        if (typeof window === 'undefined') return;

        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        // Format text for speech (removes PDF artifacts, references, etc.)
        const formattedText = _fmtTextForSpeech(textSpeech);

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(formattedText);
        utterance.voice = selectedVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const onPause = () => {
        if (typeof window !== 'undefined' && isSpeaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const onResume = () => {
        if (typeof window !== 'undefined' && isSpeaking && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    const onStop = () => {
        if (typeof window !== 'undefined') {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    };

    const copyText = () => {
        if (!textSpeech.trim()) {
            alert('No text to copy');
            return;
        }

        // Clean up PDF text: remove hyphenated line breaks and extra newlines
        let cleanedText = textSpeech;

        // Remove hyphens at end of lines (PDF word breaks)
        cleanedText = cleanedText.replaceAll('-\n', '');

        // Replace single newlines with spaces (but preserve double newlines for paragraphs)
        cleanedText = cleanedText.replace(/([^\n])\n([^\n])/g, '$1 $2');

        // Trim and normalize whitespace
        const lines = cleanedText.split('\n');
        cleanedText = lines.map(line => line.trim()).filter(line => line.length > 0).join('\n\n');

        navigator.clipboard.writeText(cleanedText);
        alert('Cleaned text copied to clipboard');
    };

    const pasteText = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setTextSpeech(text);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            alert('Failed to paste from clipboard. Please paste manually.');
        }
    };

    return (
        <main className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-paper rounded-lg border-2 border-primary/20 shadow-lg p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-secondary mb-2">Text-to-Speech</h1>
                        <p className="text-text-secondary">Convert text to speech using your browser&apos;s built-in voices</p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        {/* Voice Selection */}
                        <div>
                            <label htmlFor="voices" className="block text-sm font-semibold text-text-primary mb-2">
                                Select Voice:
                            </label>
                            <select
                                id="voices"
                                value={selectedVoice?.name || ''}
                                onChange={handleVoiceChange}
                                className="w-full px-4 py-2 border-2 border-primary/30 rounded-lg bg-background focus:border-primary focus:outline-none transition-colors"
                            >
                                {voices.length === 0 ? (
                                    <option>Loading voices...</option>
                                ) : (
                                    voices.map((voice) => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Rate Control */}
                        <div>
                            <label htmlFor="rate" className="block text-sm font-semibold text-text-primary mb-2">
                                Rate: {rate.toFixed(1)}x
                            </label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-text-secondary">0.1x</span>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2"
                                    value={rate}
                                    step="0.1"
                                    id="rate"
                                    onChange={handleRateChange}
                                    className="flex-1 h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-sm text-text-secondary">2x</span>
                            </div>
                        </div>

                        {/* Pitch Control */}
                        <div>
                            <label htmlFor="pitch" className="block text-sm font-semibold text-text-primary mb-2">
                                Pitch: {pitch.toFixed(1)}
                            </label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-text-secondary">0.1</span>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2"
                                    value={pitch}
                                    step="0.1"
                                    id="pitch"
                                    onChange={handlePitchChange}
                                    className="flex-1 h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-sm text-text-secondary">2</span>
                            </div>
                        </div>

                        {/* Text Input */}
                        <div>
                            <label htmlFor="theSpeech" className="block text-sm font-semibold text-text-primary mb-2">
                                Text to Speak:
                            </label>
                            <textarea
                                id="theSpeech"
                                cols={30}
                                rows={10}
                                placeholder="Type or paste your text here..."
                                onChange={handleTextChange}
                                value={textSpeech}
                                className="w-full px-4 py-3 border-2 border-primary/30 rounded-lg bg-background focus:border-primary focus:outline-none transition-colors resize-y"
                            />
                        </div>

                        {/* Control Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={onSpeak}
                                disabled={!textSpeech.trim() || (isSpeaking && !isPaused)}
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                Speak
                            </button>
                            <button
                                type="button"
                                onClick={onPause}
                                disabled={!isSpeaking || isPaused}
                                className="px-6 py-2 bg-accent-orange text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-accent-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                Pause
                            </button>
                            <button
                                type="button"
                                onClick={onResume}
                                disabled={!isPaused}
                                className="px-6 py-2 bg-accent-blue text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                Resume
                            </button>
                            <button
                                type="button"
                                onClick={onStop}
                                disabled={!isSpeaking}
                                className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                Stop
                            </button>
                        </div>

                        {/* Utility Buttons */}
                        <div className="pt-4 border-t-2 border-primary/10">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">Text Utilities:</h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={pasteText}
                                    className="px-6 py-2 bg-accent-green text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-accent-green/90 transition-all duration-300"
                                >
                                    Paste from Clipboard
                                </button>
                                <button
                                    type="button"
                                    onClick={copyText}
                                    disabled={!textSpeech.trim()}
                                    className="px-6 py-2 bg-accent-green text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    Copy Cleaned Text
                                </button>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Copy Cleaned Text removes PDF artifacts like mid-sentence line breaks and hyphenated words.
                            </p>
                        </div>
                    </form>

                    {/* Status Indicator */}
                    {isSpeaking && (
                        <div className="mt-6 p-4 bg-primary/10 border-l-4 border-primary rounded">
                            <p className="text-text-primary font-semibold">
                                {isPaused ? '⏸️ Paused' : '🔊 Speaking...'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-paper rounded-lg border-2 border-primary/20 shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-secondary mb-4">About This Tool</h2>
                    <div className="space-y-3 text-text-primary">
                        <p>
                            This text-to-speech tool uses your browser&apos;s built-in speech synthesis API,
                            with special features for cleaning up text copied from PDFs.
                        </p>
                        <div>
                            <h3 className="font-semibold text-primary mb-1">Features:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary ml-4">
                                <li>Multiple voices with different languages and accents</li>
                                <li>Adjustable speech rate (0.1x to 2x speed)</li>
                                <li>Adjustable pitch (0.1 to 2)</li>
                                <li>Pause, resume, and stop controls</li>
                                <li>PDF text cleanup (removes hyphenated line breaks and extra newlines)</li>
                                <li>Smart speech formatting (removes references, handles underscores)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Tts;

/**
 * Format text for speech synthesis
 * - Handles "__" as "underscore" for reading
 * - Removes PDF hyphenated line breaks
 * - Normalizes whitespace and newlines
 * - Removes square bracket references [1], [2], etc.
 */
const _fmtTextForSpeech = (text: string): string => {
    let tmp = text.split("__");
    text = tmp.join("\ndunder-score\n");

    // PDFs have this word-connect over new line
    text = text.replaceAll("-\n", "");

    // Remove newline for more fluent speech
    const lectureList = text.split('\n');
    text = lectureList.map(x => x.trim()).join(' ');

    // Remove square brackets and what is inside (usually references)
    text = text.replace(/\[[^\]]*\]/g, '');

    return text;
}
