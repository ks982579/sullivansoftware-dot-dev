'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  onTimeUpdate?: (seconds: number) => void;
}

export default function Timer({ onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  // Update parent component when seconds changes
  useEffect(() => {
    if (seconds > 0) {
      onTimeUpdateRef.current?.(seconds);
    }
  }, [seconds]);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-paper rounded-lg border-2 border-primary/20">
      <div className="text-lg font-mono font-semibold text-secondary">
        {formatTime(seconds)}
      </div>
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}
