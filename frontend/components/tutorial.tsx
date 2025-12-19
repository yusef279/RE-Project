'use client';

import { useState, useEffect } from 'react';

interface TutorialStep {
  title: string;
  description: string;
  emoji: string;
  position?: 'center' | 'top' | 'bottom';
}

interface TutorialProps {
  steps: TutorialStep[];
  storageKey: string;
  onComplete?: () => void;
}

export function Tutorial({ steps, storageKey, onComplete }: TutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem(storageKey);
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-4 border-amber-500 transform transition-all animate-in zoom-in duration-300">
        {/* Progress bar */}
        <div className="h-2 bg-amber-100 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Emoji */}
          <div className="text-center mb-6">
            <div className="text-8xl animate-bounce">{step.emoji}</div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-4">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-amber-700 text-center mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-amber-500'
                    : index < currentStep
                    ? 'w-2 bg-amber-400'
                    : 'w-2 bg-amber-200'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
