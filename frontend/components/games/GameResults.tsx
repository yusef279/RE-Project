'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RewardNotification from './RewardNotification';

interface Badge {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
}

interface GameResultsProps {
  childId: string;
  gameTitle: string;
  score: number;
  pointsEarned: number;
  totalPoints: number;
  newBadges: Badge[];
  accuracy?: number;
  metadata?: Record<string, any>;
}

export default function GameResults({
  childId,
  gameTitle,
  score,
  pointsEarned,
  totalPoints,
  newBadges,
  accuracy,
  metadata,
}: GameResultsProps) {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(newBadges.length > 0 || pointsEarned > 0);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleBackToLauncher = () => {
    router.push(`/child-launcher/${childId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center p-4">
      {/* Reward Notification Toast */}
      {showNotification && (
        <RewardNotification
          badges={newBadges}
          pointsEarned={pointsEarned}
          onClose={() => setShowNotification(false)}
          autoClose={true}
          autoCloseDelay={6000}
        />
      )}

      <div className="max-w-2xl w-full bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center">
        {/* Celebration Header */}
        <div className="mb-6">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Game Complete!</h1>
          <p className="text-xl text-gray-600">{gameTitle}</p>
        </div>

        {/* Score Display */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
          <p className="text-sm text-gray-600 mb-2">Your Score</p>
          <p className="text-6xl font-bold text-purple-600 mb-4">{score}</p>
          {accuracy !== undefined && (
            <p className="text-lg text-gray-700">Accuracy: {accuracy.toFixed(1)}%</p>
          )}
        </div>

        {/* Points Earned */}
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl">
          <p className="text-2xl font-bold text-orange-600 mb-2">
            +{pointsEarned} Points!
          </p>
          <p className="text-lg text-gray-700">Total Points: {totalPoints}</p>
        </div>

        {/* New Badges */}
        {newBadges.length > 0 && (
          <div className="mb-8">
            <p className="text-2xl font-bold text-gray-800 mb-4">
              🏆 New Badges Unlocked!
            </p>
            <div className="grid grid-cols-1 gap-4">
              {newBadges.map((badge, index) => (
                <div
                  key={badge.id || (badge as any)._id || `badge-${index}`}
                  className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl"
                >
                  <p className="text-4xl mb-2">{badge.iconEmoji}</p>
                  <p className="text-xl font-bold text-gray-800">{badge.name}</p>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Stats */}
        {metadata && (
          <div className="mb-8 p-4 bg-gray-100 rounded-xl">
            <p className="text-lg font-semibold text-gray-700 mb-2">Game Stats</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key}>
                  <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-gray-800">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleBackToLauncher}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🏠 Back to Launcher
          </button>
        </div>
      </div>
    </div>
  );
}
