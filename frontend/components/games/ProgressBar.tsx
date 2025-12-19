'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const colorClasses = {
  purple: 'from-purple-500 to-pink-500',
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  yellow: 'from-yellow-500 to-orange-500',
  pink: 'from-pink-500 to-rose-500',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

export default function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  color = 'purple',
  size = 'md',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-gray-600">
              {current} / {total} ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all ${
            animated ? 'duration-500 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
