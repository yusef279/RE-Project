'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CreativeSandboxProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, accuracy: number, metadata: Record<string, any>) => void;
}

const DRAWING_PROMPTS = {
  easy: [
    { prompt: 'Draw a happy sun', emoji: '☀️' },
    { prompt: 'Draw a house', emoji: '🏠' },
    { prompt: 'Draw a tree', emoji: '🌳' },
    { prompt: 'Draw a flower', emoji: '🌸' },
    { prompt: 'Draw a cat', emoji: '🐱' },
  ],
  medium: [
    { prompt: 'Draw a pyramid', emoji: '🔺' },
    { prompt: 'Draw a camel', emoji: '🐪' },
    { prompt: 'Draw the Nile River', emoji: '🌊' },
    { prompt: 'Draw a palm tree', emoji: '🌴' },
    { prompt: 'Draw a pharaoh', emoji: '👑' },
  ],
  hard: [
    { prompt: 'Draw the Sphinx', emoji: '🗿' },
    { prompt: 'Draw hieroglyphics', emoji: '📜' },
    { prompt: 'Draw an ancient Egyptian boat', emoji: '⛵' },
    { prompt: 'Draw the pyramids of Giza', emoji: '🏛️' },
    { prompt: 'Draw an Egyptian temple', emoji: '🕌' },
  ],
};

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Brown', value: '#92400e' },
  { name: 'Gold', value: '#fbbf24' },
];

const BRUSH_SIZES = [2, 5, 10, 15, 20];

export default function CreativeSandbox({ difficulty, onComplete }: CreativeSandboxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [drawingsCompleted, setDrawingsCompleted] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const prompts = DRAWING_PROMPTS[difficulty];
  const totalDrawings = 3;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleFinishDrawing = () => {
    const newDrawingsCompleted = drawingsCompleted + 1;
    setDrawingsCompleted(newDrawingsCompleted);

    // Award points for completing a drawing
    const pointsEarned = 50;
    setScore((prev) => prev + pointsEarned);

    if (newDrawingsCompleted >= totalDrawings) {
      // Game complete
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setIsGameComplete(true);
      const finalScore = score + pointsEarned;

      setTimeout(() => {
        onComplete(finalScore, 100, {
          totalDrawings,
          drawingsCompleted: newDrawingsCompleted,
          timeSpent,
          difficulty,
          theme: 'creative-art',
        });
      }, 1500);
    } else {
      // Move to next prompt
      setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
      clearCanvas();
    }
  };

  const handleSkipDrawing = () => {
    const newDrawingsCompleted = drawingsCompleted + 1;
    setDrawingsCompleted(newDrawingsCompleted);

    // Award fewer points for skipping
    const pointsEarned = 25;
    setScore((prev) => prev + pointsEarned);

    if (newDrawingsCompleted >= totalDrawings) {
      // Game complete
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setIsGameComplete(true);
      const finalScore = score + pointsEarned;

      setTimeout(() => {
        onComplete(finalScore, 100, {
          totalDrawings,
          drawingsCompleted: newDrawingsCompleted,
          timeSpent,
          difficulty,
          theme: 'creative-art',
        });
      }, 1500);
    } else {
      // Move to next prompt
      setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
      clearCanvas();
    }
  };

  const currentPrompt = prompts[currentPromptIndex];

  return (
    <div className="bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-orange-900 mb-2">
          🎨 Creative Sandbox 🎨
        </h2>
        <p className="text-lg text-orange-700">Express your creativity with Egyptian themes!</p>
      </div>

      {/* Progress Display */}
      <div className="mb-6 flex justify-between items-center bg-white/70 rounded-xl p-4">
        <div className="text-center">
          <p className="text-sm text-orange-700">Drawing</p>
          <p className="text-3xl font-bold text-orange-900">
            {drawingsCompleted + 1} / {totalDrawings}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-orange-700">Score</p>
          <p className="text-3xl font-bold text-yellow-600">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-orange-700">Time</p>
          <p className="text-3xl font-bold text-blue-600">
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-orange-700">Completed</p>
          <p className="text-3xl font-bold text-green-600">{drawingsCompleted}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-white/50 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-full transition-all duration-300"
          style={{ width: `${((drawingsCompleted + 1) / totalDrawings) * 100}%` }}
        />
      </div>

      {!isGameComplete ? (
        <>
          {/* Current Prompt */}
          <div className="mb-6 bg-white/80 rounded-xl p-6 shadow-lg border-4 border-orange-400">
            <div className="text-center">
              <p className="text-6xl mb-3">{currentPrompt.emoji}</p>
              <p className="text-3xl font-bold text-orange-900">
                {currentPrompt.prompt}
              </p>
            </div>
          </div>

          {/* Drawing Canvas */}
          <div className="mb-6 bg-white rounded-xl p-4 shadow-lg">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="border-4 border-orange-300 rounded-lg cursor-crosshair w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>

          {/* Color Palette */}
          <div className="mb-6 bg-white/80 rounded-xl p-4">
            <p className="text-center text-orange-800 font-bold mb-3">Colors:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-12 h-12 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                    color === c.value ? 'ring-4 ring-orange-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="mb-6 bg-white/80 rounded-xl p-4">
            <p className="text-center text-orange-800 font-bold mb-3">Brush Size:</p>
            <div className="flex justify-center gap-3">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`w-16 h-16 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center transition-all ${
                    brushSize === size ? 'ring-4 ring-orange-500 bg-orange-400' : ''
                  }`}
                >
                  <div
                    className="rounded-full bg-orange-800"
                    style={{ width: size * 2, height: size * 2 }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={clearCanvas}
              className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🗑️ Clear
            </button>
            <button
              onClick={handleFinishDrawing}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              ✓ Finish Drawing (+50 pts)
            </button>
            <button
              onClick={handleSkipDrawing}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              ⏭ Skip (+25 pts)
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 bg-white/80 rounded-xl shadow-lg">
          <p className="text-6xl mb-4">🏆</p>
          <p className="text-4xl font-bold text-orange-900 mb-4">
            Amazing Artwork!
          </p>
          <p className="text-2xl text-orange-700 mb-2">
            Final Score: {score}
          </p>
          <p className="text-xl text-orange-600 mb-2">
            Drawings Completed: {drawingsCompleted} / {totalDrawings}
          </p>
          <p className="text-xl text-orange-600 mb-4">
            Time Spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </p>
          <p className="text-lg text-gray-500 mt-6">
            Calculating rewards...
          </p>
        </div>
      )}
    </div>
  );
}
