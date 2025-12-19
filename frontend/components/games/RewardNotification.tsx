'use client';

import React, { useEffect, useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
}

interface RewardNotificationProps {
  badges: Badge[];
  pointsEarned?: number;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function RewardNotification({
  badges,
  pointsEarned,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for animation
        }
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-4 border-yellow-400 p-6 max-w-md">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              🎉 Achievement Unlocked!
            </h3>
            {pointsEarned && (
              <p className="text-lg text-yellow-600 font-semibold">
                +{pointsEarned} Points Earned!
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-3">
            {badges.map((badge, index) => (
              <div
                key={badge.id || (badge as any)._id || `badge-${index}`}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 animate-in zoom-in duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{badge.iconEmoji}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{badge.name}</p>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Points Only (no badges) */}
        {badges.length === 0 && pointsEarned && (
          <div className="text-center py-4">
            <p className="text-4xl mb-2">⭐</p>
            <p className="text-xl font-bold text-gray-800">
              You earned {pointsEarned} points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
