'use client';

import React, { useState, useEffect } from 'react';

interface PyramidLevel {
  question: string;
  answer: number;
  options: number[];
  level: number;
}

interface PharaohPyramidProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, accuracy: number, metadata: Record<string, any>) => void;
}

export default function PharaohPyramid({ difficulty, onComplete }: PharaohPyramidProps) {
  const [levels, setLevels] = useState<PyramidLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [lives, setLives] = useState(3);

  const totalLevels = 10;
  const range = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;

  useEffect(() => {
    generateLevels();
  }, [difficulty]);

  const generateLevels = () => {
    const newLevels: PyramidLevel[] = [];

    for (let i = 0; i < totalLevels; i++) {
      const levelDifficulty = Math.floor(i / 3); // Increases every 3 levels
      const operators = ['+', '-', '*'];

      // Add division for harder levels
      if (levelDifficulty >= 2 && difficulty !== 'easy') {
        operators.push('/');
      }

      const operator = operators[Math.floor(Math.random() * operators.length)];

      let num1 = Math.floor(Math.random() * (range + levelDifficulty * 10)) + 1;
      let num2 = Math.floor(Math.random() * (range + levelDifficulty * 10)) + 1;

      if (operator === '-' && num2 > num1) {
        [num1, num2] = [num2, num1];
      }

      if (operator === '*') {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
      }

      if (operator === '/') {
        // Ensure clean division
        num2 = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * (Math.floor(Math.random() * 10) + 1);
      }

      let answer: number;
      let questionText: string;

      switch (operator) {
        case '+':
          answer = num1 + num2;
          questionText = `${num1} + ${num2}`;
          break;
        case '-':
          answer = num1 - num2;
          questionText = `${num1} - ${num2}`;
          break;
        case '*':
          answer = num1 * num2;
          questionText = `${num1} × ${num2}`;
          break;
        case '/':
          answer = num1 / num2;
          questionText = `${num1} ÷ ${num2}`;
          break;
        default:
          answer = num1 + num2;
          questionText = `${num1} + ${num2}`;
      }

      // Generate wrong options
      const options = [answer];
      while (options.length < 4) {
        const wrongAnswer = answer + Math.floor(Math.random() * 30) - 15;
        if (wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }

      options.sort(() => Math.random() - 0.5);

      newLevels.push({
        question: questionText,
        answer,
        options,
        level: i + 1,
      });
    }

    setLevels(newLevels);
    setCurrentLevel(0);
    setScore(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsGameComplete(false);
    setLives(3);
  };

  const handleAnswerClick = (answer: number) => {
    if (showFeedback || isGameComplete) return;

    setSelectedAnswer(answer);
    const correct = answer === levels[currentLevel].answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
      const levelBonus = (currentLevel + 1) * 5;
      setScore((prev) => prev + 10 + levelBonus);
    } else {
      setLives((prev) => prev - 1);
    }

    setTimeout(() => {
      if (!correct && lives - 1 <= 0) {
        // Game over - ran out of lives
        setIsGameComplete(true);
        const accuracy = (correctAnswers / (currentLevel + 1)) * 100;
        setTimeout(() => {
          onComplete(score, accuracy, {
            totalLevels: currentLevel + 1,
            correctAnswers,
            difficulty,
            completedPyramid: false,
          });
        }, 1500);
      } else if (currentLevel + 1 < totalLevels) {
        setCurrentLevel((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Pyramid complete!
        setIsGameComplete(true);
        const accuracy = ((correctAnswers + (correct ? 1 : 0)) / totalLevels) * 100;
        const finalScore = score + (correct ? 10 + (currentLevel + 1) * 5 : 0);
        const bonus = 100; // Completion bonus
        setScore(finalScore + bonus);

        setTimeout(() => {
          onComplete(finalScore + bonus, accuracy, {
            totalLevels,
            correctAnswers: correctAnswers + (correct ? 1 : 0),
            difficulty,
            completedPyramid: true,
          });
        }, 1500);
      }
    }, 1500);
  };

  if (levels.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
        <p className="text-xl text-gray-600">Building the pyramid...</p>
      </div>
    );
  }

  const currentQuestion = levels[currentLevel];
  const pyramidProgress = ((currentLevel + 1) / totalLevels) * 100;

  return (
    <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-2xl shadow-xl p-8">
      {/* Header with Egyptian Theme */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-amber-900 mb-2">
          🏛️ Pharaoh&apos;s Math Pyramid 🏛️
        </h2>
        <p className="text-lg text-amber-700">Climb to the top and claim the treasure!</p>
      </div>

      {/* Stats Display */}
      <div className="mb-6 flex justify-between items-center bg-white/70 rounded-xl p-4">
        <div className="text-center">
          <p className="text-sm text-amber-700">Level</p>
          <p className="text-3xl font-bold text-amber-900">
            {currentLevel + 1} / {totalLevels}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-amber-700">Score</p>
          <p className="text-3xl font-bold text-yellow-600">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-amber-700">Lives</p>
          <p className="text-3xl">
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i}>💛</span>
            ))}
            {Array.from({ length: 3 - lives }).map((_, i) => (
              <span key={i} className="opacity-30">💛</span>
            ))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-amber-700">Correct</p>
          <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
        </div>
      </div>

      {/* Pyramid Progress Visualization */}
      <div className="mb-8 relative">
        <div className="text-center mb-2">
          <p className="text-sm text-amber-700">Pyramid Progress</p>
        </div>
        <div className="relative h-32 flex items-end justify-center">
          <div className="absolute bottom-0 w-full flex flex-col items-center gap-1">
            {[...Array(5)].map((_, idx) => {
              const levelThreshold = ((idx + 1) / 5) * 100;
              const isFilled = pyramidProgress >= levelThreshold;
              const width = 100 - idx * 15;
              return (
                <div
                  key={idx}
                  className={`h-6 transition-all duration-500 rounded ${
                    isFilled
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                      : 'bg-gray-300'
                  }`}
                  style={{ width: `${width}%` }}
                />
              );
            })}
          </div>
          <div className="absolute -top-2 text-4xl">⭐</div>
        </div>
      </div>

      {!isGameComplete ? (
        <>
          {/* Question with Egyptian Styling */}
          <div className="mb-8 text-center bg-gradient-to-r from-amber-200 to-yellow-200 rounded-xl p-6 border-4 border-amber-600">
            <p className="text-2xl text-amber-800 mb-2">Level {currentQuestion.level} Challenge</p>
            <p className="text-6xl font-bold text-amber-900">
              {currentQuestion.question} = ?
            </p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.answer;
              let buttonClass = 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600';

              if (showFeedback) {
                if (isSelected && isCorrect) {
                  buttonClass = 'bg-gradient-to-r from-green-500 to-green-600';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-gradient-to-r from-red-500 to-red-600';
                } else if (isCorrectAnswer) {
                  buttonClass = 'bg-gradient-to-r from-green-500 to-green-600';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  disabled={showFeedback}
                  className={`
                    ${buttonClass}
                    text-white font-bold text-3xl py-8 rounded-xl
                    transition-all transform hover:scale-105 shadow-lg
                    border-4 border-amber-700
                    disabled:cursor-not-allowed
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`mt-6 p-4 rounded-xl text-center text-xl font-bold border-4 ${
                isCorrect
                  ? 'bg-green-100 border-green-600 text-green-800'
                  : 'bg-red-100 border-red-600 text-red-800'
              }`}
            >
              {isCorrect
                ? `✅ Excellent! You climbed higher! +${10 + currentQuestion.level * 5} points`
                : `❌ Wrong! The answer is ${currentQuestion.answer}. Lost a life!`}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          {lives <= 0 ? (
            <>
              <p className="text-5xl mb-4">💔</p>
              <p className="text-4xl font-bold text-red-700 mb-4">
                The pyramid was too challenging!
              </p>
              <p className="text-2xl text-gray-700 mb-2">
                You reached Level {currentLevel + 1}
              </p>
              <p className="text-2xl text-gray-700 mb-2">
                Final Score: {score}
              </p>
              <p className="text-xl text-gray-600">
                Correct Answers: {correctAnswers} / {currentLevel + 1}
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl mb-4">🏆</p>
              <p className="text-4xl font-bold text-yellow-700 mb-4">
                You conquered the pyramid!
              </p>
              <p className="text-2xl text-gray-700 mb-2">
                Final Score: {score}
              </p>
              <p className="text-xl text-gray-600">
                Correct Answers: {correctAnswers} / {totalLevels}
              </p>
              <p className="text-lg text-green-600 mt-4 font-bold">
                +100 Pyramid Completion Bonus!
              </p>
            </>
          )}
          <p className="text-lg text-gray-500 mt-4">
            Calculating rewards...
          </p>
        </div>
      )}

      {/* Reset Button */}
      {!isGameComplete && (
        <div className="mt-8 text-center">
          <button
            onClick={generateLevels}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Restart Pyramid
          </button>
        </div>
      )}
    </div>
  );
}