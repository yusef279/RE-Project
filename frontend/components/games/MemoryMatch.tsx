'use client';

import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, accuracy: number, metadata: Record<string, any>) => void;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐢', '🐍', '🦎', '🦖', '🦕'];

export default function MemoryMatch({ difficulty, onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const gridSize = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const totalPairs = (gridSize * gridSize) / 2;

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    if (matches === totalPairs && matches > 0 && !isGameComplete) {
      setIsGameComplete(true);
      const accuracy = (matches / moves) * 100;
      const finalScore = score;

      setTimeout(() => {
        onComplete(finalScore, accuracy, {
          moves,
          matches,
          difficulty,
          gridSize,
        });
      }, 1000);
    }
  }, [matches, totalPairs]);

  const initializeGame = () => {
    const selectedEmojis = EMOJIS.slice(0, totalPairs);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];

    // Shuffle cards
    const shuffled = cardPairs
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setMatches(0);
    setIsGameComplete(false);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId)) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setMatches((prev) => prev + 1);
        setScore((prev) => prev + 10);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
      {/* Score Display */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-center">
          <p className="text-sm text-gray-600">Score</p>
          <p className="text-3xl font-bold text-purple-600">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Moves</p>
          <p className="text-3xl font-bold text-pink-600">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Matches</p>
          <p className="text-3xl font-bold text-yellow-600">
            {matches} / {totalPairs}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Difficulty</p>
          <p className="text-xl font-bold text-blue-600 capitalize">{difficulty}</p>
        </div>
      </div>

      {/* Game Grid */}
      <div
        className="grid gap-4 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: `${gridSize * 100}px`,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              aspect-square rounded-xl cursor-pointer transition-all duration-300 transform
              flex items-center justify-center text-5xl font-bold
              ${
                card.isFlipped || card.isMatched
                  ? 'bg-white shadow-lg scale-100'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-md hover:scale-105'
              }
              ${card.isMatched ? 'opacity-50 cursor-default' : ''}
            `}
          >
            {(card.isFlipped || card.isMatched) && card.emoji}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {isGameComplete && (
        <div className="mt-6 p-4 bg-green-100 border-2 border-green-500 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-700">
            🎉 Congratulations! You matched all pairs!
          </p>
          <p className="text-lg text-green-600 mt-2">
            Score: {score} | Moves: {moves}
          </p>
        </div>
      )}

      {/* Reset Button */}
      <div className="mt-6 text-center">
        <button
          onClick={initializeGame}
          className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
