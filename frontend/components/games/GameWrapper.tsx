'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface GameWrapperProps {
  childId: string;
  gameTitle: string;
  iconEmoji: string;
  children: ReactNode;
  onGameComplete: (score: number, accuracy: number, metadata: Record<string, any>) => void;
}

export default function GameWrapper({
  childId,
  gameTitle,
  iconEmoji,
  children,
  onGameComplete,
}: GameWrapperProps) {
  const router = useRouter();
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Progress will be lost.')) {
      router.push(`/child-launcher/${childId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{iconEmoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{gameTitle}</h1>
              <p className="text-sm text-gray-600">Time: {formatTime(elapsedSeconds)}</p>
            </div>
          </div>
          <button
            onClick={handleExit}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Exit Game
          </button>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
