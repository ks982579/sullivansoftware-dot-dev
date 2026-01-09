'use client';

import { useState } from 'react';

interface QuizOptionsProps {
  totalMultipleChoice: number;
  totalShortAnswer: number;
  onStart: (options: {
    randomize: boolean;
    mcCount: number | 'all';
    saCount: number | 'all';
  }) => void;
  onCancel: () => void;
}

export default function QuizOptions({
  totalMultipleChoice,
  totalShortAnswer,
  onStart,
  onCancel,
}: QuizOptionsProps) {
  const [randomize, setRandomize] = useState(true);
  const [mcCountType, setMcCountType] = useState<'all' | 'custom'>('all');
  const [saCountType, setSaCountType] = useState<'all' | 'custom'>('all');
  const [mcCustomCount, setMcCustomCount] = useState(totalMultipleChoice);
  const [saCustomCount, setSaCustomCount] = useState(totalShortAnswer);

  const handleStart = () => {
    const mcCount = mcCountType === 'all' ? 'all' : mcCustomCount;
    const saCount = saCountType === 'all' ? 'all' : saCustomCount;

    // Validation
    if (mcCountType === 'custom' && (mcCustomCount < 1 || mcCustomCount > totalMultipleChoice)) {
      alert(`Multiple choice count must be between 1 and ${totalMultipleChoice}`);
      return;
    }
    if (saCountType === 'custom' && (saCustomCount < 1 || saCustomCount > totalShortAnswer)) {
      alert(`Short answer count must be between 1 and ${totalShortAnswer}`);
      return;
    }

    onStart({ randomize, mcCount, saCount });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-primary/30 p-6 max-w-lg w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-secondary mb-6">Quiz Options</h2>

        {/* Randomize */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Question Order</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={randomize}
              onChange={(e) => setRandomize(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Randomize questions within each type</span>
          </label>
        </div>

        {/* Multiple Choice Count */}
        {totalMultipleChoice > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Multiple Choice Questions (Total: {totalMultipleChoice})
            </h3>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="radio"
                checked={mcCountType === 'all'}
                onChange={() => setMcCountType('all')}
                className="w-4 h-4"
              />
              <span>All questions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mcCountType === 'custom'}
                onChange={() => setMcCountType('custom')}
                className="w-4 h-4"
              />
              <span>Custom amount:</span>
              <input
                type="number"
                min={1}
                max={totalMultipleChoice}
                value={mcCustomCount}
                onChange={(e) => setMcCustomCount(parseInt(e.target.value) || 1)}
                disabled={mcCountType === 'all'}
                className="w-20 p-1 border-2 border-primary/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>
        )}

        {/* Short Answer Count */}
        {totalShortAnswer > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Short Answer Questions (Total: {totalShortAnswer})
            </h3>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="radio"
                checked={saCountType === 'all'}
                onChange={() => setSaCountType('all')}
                className="w-4 h-4"
              />
              <span>All questions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={saCountType === 'custom'}
                onChange={() => setSaCountType('custom')}
                className="w-4 h-4"
              />
              <span>Custom amount:</span>
              <input
                type="number"
                min={1}
                max={totalShortAnswer}
                value={saCustomCount}
                onChange={(e) => setSaCustomCount(parseInt(e.target.value) || 1)}
                disabled={saCountType === 'all'}
                className="w-20 p-1 border-2 border-primary/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
          >
            Start Quiz
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
