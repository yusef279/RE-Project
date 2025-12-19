'use client';

import React, { useState, useEffect } from 'react';

interface WordPuzzle {
  arabic: string;
  english: string;
  category: string;
  scrambled: string[];
}

interface ArabicWordPuzzleProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, accuracy: number, metadata: Record<string, any>) => void;
}

const WORD_LISTS = {
  easy: [
    { arabic: 'بيت', english: 'House', category: 'Home' },
    { arabic: 'قطة', english: 'Cat', category: 'Animals' },
    { arabic: 'كلب', english: 'Dog', category: 'Animals' },
    { arabic: 'شمس', english: 'Sun', category: 'Nature' },
    { arabic: 'قمر', english: 'Moon', category: 'Nature' },
    { arabic: 'ماء', english: 'Water', category: 'Nature' },
    { arabic: 'كتاب', english: 'Book', category: 'School' },
    { arabic: 'قلم', english: 'Pen', category: 'School' },
    { arabic: 'باب', english: 'Door', category: 'Home' },
    { arabic: 'نجم', english: 'Star', category: 'Nature' },
    { arabic: 'وردة', english: 'Rose', category: 'Nature' },
    { arabic: 'سمكة', english: 'Fish', category: 'Animals' },
  ],
  medium: [
    { arabic: 'مدرسة', english: 'School', category: 'Places' },
    { arabic: 'مكتبة', english: 'Library', category: 'Places' },
    { arabic: 'حديقة', english: 'Garden', category: 'Nature' },
    { arabic: 'فراشة', english: 'Butterfly', category: 'Animals' },
    { arabic: 'طائرة', english: 'Airplane', category: 'Transport' },
    { arabic: 'سيارة', english: 'Car', category: 'Transport' },
    { arabic: 'صديق', english: 'Friend', category: 'People' },
    { arabic: 'عائلة', english: 'Family', category: 'People' },
    { arabic: 'هرم', english: 'Pyramid', category: 'Egypt' },
    { arabic: 'نيل', english: 'Nile', category: 'Egypt' },
    { arabic: 'جمل', english: 'Camel', category: 'Animals' },
    { arabic: 'صحراء', english: 'Desert', category: 'Nature' },
  ],
  hard: [
    { arabic: 'متحف', english: 'Museum', category: 'Places' },
    { arabic: 'فرعون', english: 'Pharaoh', category: 'Egypt' },
    { arabic: 'هيروغليفية', english: 'Hieroglyphics', category: 'Egypt' },
    { arabic: 'حضارة', english: 'Civilization', category: 'History' },
    { arabic: 'معبد', english: 'Temple', category: 'Egypt' },
    { arabic: 'كنز', english: 'Treasure', category: 'History' },
    { arabic: 'مغامرة', english: 'Adventure', category: 'General' },
    { arabic: 'اكتشاف', english: 'Discovery', category: 'General' },
    { arabic: 'تاريخ', english: 'History', category: 'General' },
    { arabic: 'ثقافة', english: 'Culture', category: 'General' },
    { arabic: 'لغة', english: 'Language', category: 'General' },
    { arabic: 'معرفة', english: 'Knowledge', category: 'General' },
  ],
};

export default function ArabicWordPuzzle({ difficulty, onComplete }: ArabicWordPuzzleProps) {
  const [puzzles, setPuzzles] = useState<WordPuzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const totalPuzzles = 10;

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const scrambleWord = (word: string): string[] => {
    const letters = word.split('');
    // Add some extra random Arabic letters as distractors for harder difficulties
    const distractorCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    const distractors = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

    for (let i = 0; i < distractorCount; i++) {
      const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)];
      if (!letters.includes(randomDistractor)) {
        letters.push(randomDistractor);
      }
    }

    return letters.sort(() => Math.random() - 0.5);
  };

  const initializeGame = () => {
    const wordList = WORD_LISTS[difficulty];
    const selectedWords = [...wordList]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalPuzzles);

    const newPuzzles = selectedWords.map((word) => ({
      ...word,
      scrambled: scrambleWord(word.arabic),
    }));

    setPuzzles(newPuzzles);
    setCurrentPuzzleIndex(0);
    setSelectedLetters([]);
    setAvailableLetters(newPuzzles[0]?.scrambled || []);
    setScore(0);
    setCorrectWords(0);
    setShowFeedback(false);
    setIsGameComplete(false);
    setAttempts(0);
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (showFeedback) return;

    // Add letter to selected
    setSelectedLetters((prev) => [...prev, letter]);

    // Remove from available
    setAvailableLetters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveLetter = (index: number) => {
    if (showFeedback) return;

    const letter = selectedLetters[index];
    setSelectedLetters((prev) => prev.filter((_, i) => i !== index));
    setAvailableLetters((prev) => [...prev, letter]);
  };

  const handleSubmit = () => {
    if (selectedLetters.length === 0 || showFeedback) return;

    setAttempts((prev) => prev + 1);
    const userWord = selectedLetters.join('');
    const correct = userWord === puzzles[currentPuzzleIndex].arabic;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectWords((prev) => prev + 1);
      // More points for fewer attempts
      const pointsEarned = attempts === 0 ? 25 : attempts === 1 ? 20 : 15;
      setScore((prev) => prev + pointsEarned);

      setTimeout(() => {
        if (currentPuzzleIndex + 1 < totalPuzzles) {
          // Move to next puzzle
          setCurrentPuzzleIndex((prev) => prev + 1);
          setSelectedLetters([]);
          setAvailableLetters(puzzles[currentPuzzleIndex + 1].scrambled);
          setShowFeedback(false);
          setAttempts(0);
        } else {
          // Game complete
          setIsGameComplete(true);
          const accuracy = ((correctWords + 1) / totalPuzzles) * 100;

          setTimeout(() => {
            onComplete(score + pointsEarned, accuracy, {
              totalPuzzles,
              correctWords: correctWords + 1,
              difficulty,
              theme: 'arabic-language',
            });
          }, 2000);
        }
      }, 2000);
    } else {
      // Wrong answer - allow retry
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedLetters([]);
        setAvailableLetters(puzzles[currentPuzzleIndex].scrambled);
      }, 1500);
    }
  };

  const handleSkip = () => {
    if (showFeedback) return;

    if (currentPuzzleIndex + 1 < totalPuzzles) {
      setCurrentPuzzleIndex((prev) => prev + 1);
      setSelectedLetters([]);
      setAvailableLetters(puzzles[currentPuzzleIndex + 1].scrambled);
      setAttempts(0);
    } else {
      // End game
      setIsGameComplete(true);
      const accuracy = (correctWords / totalPuzzles) * 100;

      setTimeout(() => {
        onComplete(score, accuracy, {
          totalPuzzles,
          correctWords,
          difficulty,
          theme: 'arabic-language',
        });
      }, 1500);
    }
  };

  if (puzzles.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
        <p className="text-xl text-gray-600">Preparing Arabic puzzles...</p>
      </div>
    );
  }

  const currentPuzzle = puzzles[currentPuzzleIndex];

  return (
    <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-purple-900 mb-2">
          📖 Arabic Word Puzzle 📖
        </h2>
        <p className="text-lg text-purple-700">Unscramble the Arabic letters!</p>
      </div>

      {/* Progress Display */}
      <div className="mb-6 flex justify-between items-center bg-white/70 rounded-xl p-4">
        <div className="text-center">
          <p className="text-sm text-purple-700">Puzzle</p>
          <p className="text-3xl font-bold text-purple-900">
            {currentPuzzleIndex + 1} / {totalPuzzles}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-purple-700">Score</p>
          <p className="text-3xl font-bold text-pink-600">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-purple-700">Correct</p>
          <p className="text-3xl font-bold text-green-600">{correctWords}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-purple-700">Attempts</p>
          <p className="text-3xl font-bold text-orange-600">{attempts}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white/50 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full transition-all duration-300"
          style={{ width: `${((currentPuzzleIndex + 1) / totalPuzzles) * 100}%` }}
        />
      </div>

      {!isGameComplete ? (
        <>
          {/* Hint Card */}
          <div className="mb-8 bg-white/80 rounded-xl p-6 shadow-lg border-4 border-purple-400">
            <div className="text-center">
              <p className="text-sm text-purple-600 mb-2">Category: {currentPuzzle.category}</p>
              <p className="text-3xl font-bold text-purple-900 mb-2">
                {currentPuzzle.english}
              </p>
              <p className="text-lg text-purple-700">
                Arrange the letters to spell this word in Arabic
              </p>
            </div>
          </div>

          {/* Selected Letters Area */}
          <div className="mb-6 bg-white/90 rounded-xl p-6 min-h-[120px] border-4 border-dashed border-purple-400">
            <p className="text-center text-purple-700 mb-4 font-bold">Your Answer:</p>
            <div className="flex flex-wrap justify-center gap-3 min-h-[60px]" dir="rtl">
              {selectedLetters.map((letter, index) => (
                <button
                  key={index}
                  onClick={() => handleRemoveLetter(index)}
                  disabled={showFeedback}
                  className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 text-white text-3xl font-bold rounded-lg shadow-lg hover:scale-110 transition-transform disabled:cursor-not-allowed"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Available Letters */}
          <div className="mb-6">
            <p className="text-center text-purple-700 mb-4 font-bold">Available Letters:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {availableLetters.map((letter, index) => (
                <button
                  key={index}
                  onClick={() => handleLetterClick(letter, index)}
                  disabled={showFeedback}
                  className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 text-purple-900 text-3xl font-bold rounded-lg shadow-md hover:scale-110 hover:from-purple-300 hover:to-pink-300 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleSubmit}
              disabled={selectedLetters.length === 0 || showFeedback}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Submit
            </button>
            <button
              onClick={() => {
                setSelectedLetters([]);
                setAvailableLetters(puzzles[currentPuzzleIndex].scrambled);
              }}
              disabled={selectedLetters.length === 0 || showFeedback}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Clear
            </button>
            <button
              onClick={handleSkip}
              disabled={showFeedback}
              className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏭ Skip
            </button>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`p-6 rounded-xl text-center border-4 ${
                isCorrect
                  ? 'bg-green-100 border-green-600'
                  : 'bg-red-100 border-red-600'
              }`}
            >
              <p className={`text-2xl font-bold mb-2 ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {isCorrect ? '✅ Perfect! أحسنت (Well done!)' : '❌ Try again!'}
              </p>
              {isCorrect && (
                <p className="text-xl text-green-700" dir="rtl">
                  {currentPuzzle.arabic} = {currentPuzzle.english}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 bg-white/80 rounded-xl shadow-lg">
          <p className="text-6xl mb-4">🎓</p>
          <p className="text-4xl font-bold text-purple-900 mb-4">
            مبروك! Congratulations!
          </p>
          <p className="text-2xl text-purple-700 mb-2">
            Final Score: {score}
          </p>
          <p className="text-xl text-purple-600 mb-4">
            Correct Words: {correctWords} / {totalPuzzles}
          </p>
          <p className="text-lg text-gray-500 mt-6">
            Calculating rewards...
          </p>
        </div>
      )}

      {/* Reset Button */}
      {!isGameComplete && (
        <div className="mt-8 text-center">
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Restart Puzzle
          </button>
        </div>
      )}
    </div>
  );
}
