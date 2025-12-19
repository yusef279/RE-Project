'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import GameWrapper from '@/components/games/GameWrapper';
import MemoryMatch from '@/components/games/MemoryMatch';
import MathQuiz from '@/components/games/MathQuiz';
import PharaohPyramid from '@/components/games/PharaohPyramid';
import NileScience from '@/components/games/NileScience';
import ArabicWordPuzzle from '@/components/games/ArabicWordPuzzle';
import CreativeSandbox from '@/components/games/CreativeSandbox';
import GameResults from '@/components/games/GameResults';
import apiClient from '@/lib/api-client';

interface Game {
  id: string;
  title: string;
  description: string;
  type: 'play' | 'learn';
  category: string;
  iconEmoji: string;
  minAge: number;
  maxAge: number;
  basePoints: number;
  config: Record<string, any>;
}

interface GameProgress {
  id: string;
  currentDifficulty: string;
  highScore: number;
  timesCompleted: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
}

interface CompletionResult {
  pointsEarned: number;
  totalPoints: number;
  newBadges: Badge[];
  progress: GameProgress;
}

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.gameId as string;
  const childId = searchParams.get('childId') as string;

  const [game, setGame] = useState<Game | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [gameMetadata, setGameMetadata] = useState<Record<string, any>>({});
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (gameId && childId) {
      fetchGameData();
    }
  }, [gameId, childId]);

  const fetchGameData = async () => {
    try {
      setLoading(true);

      // Fetch game details
      const gameResponse = await apiClient.get(`/api/games/${gameId}`);
      console.log('Game data received:', gameResponse.data);
      setGame(gameResponse.data);

      // Fetch child's progress for this game
      const progressResponse = await apiClient.get(
        `/api/games/progress/${childId}/${gameId}`
      );
      setProgress(progressResponse.data);
      console.log('Successfully loaded game and progress:', { game: gameResponse.data, progress: progressResponse.data });
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching game data:', err);
      setError(err.response?.data?.message || 'Failed to load game');
      setLoading(false);
    }
  };

  const handleGameComplete = async (
    score: number,
    accuracy: number,
    metadata: Record<string, any>
  ) => {
    try {
      const duration = Math.floor((Date.now() - startTime) / 1000);

      const response = await apiClient.post('/api/games/complete', {
        childId,
        gameId,
        score,
        duration,
        accuracyPercent: accuracy,
        metadata,
      });

      setCompletionResult(response.data);
      setGameMetadata(metadata);
      setShowResults(true);
    } catch (err: any) {
      console.error('Error completing game:', err);
      alert('Failed to save game results. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-4xl mb-4">🎮</p>
          <p className="text-2xl font-bold">Loading game...</p>
        </div>
      </div>
    );
  }

  console.log('Checking render conditions:', { error, hasGame: !!game, hasProgress: !!progress, game, progress });

  if (error || !game || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
          <p className="text-4xl mb-4">❌</p>
          <p className="text-2xl font-bold text-red-600 mb-4">{error || 'Game not found'}</p>
          <p className="text-sm text-gray-600 mt-2">Debug: error={String(error)}, game={game ? 'exists' : 'null'}, progress={progress ? 'exists' : 'null'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showResults && completionResult) {
    return (
      <GameResults
        childId={childId}
        gameTitle={game.title}
        score={completionResult.progress.highScore}
        pointsEarned={completionResult.pointsEarned}
        totalPoints={completionResult.totalPoints}
        newBadges={completionResult.newBadges}
        metadata={gameMetadata}
      />
    );
  }

  const difficulty = (progress.currentDifficulty || 'easy') as 'easy' | 'medium' | 'hard';

  console.log('Rendering game:', {
    title: game.title,
    category: game.category,
    categoryType: typeof game.category,
    willRenderMemory: game.category === 'memory',
    willRenderMath: game.category === 'math',
    willRenderQuiz: game.category === 'quiz',
    willRenderLanguage: game.category === 'language',
    willRenderCreative: game.category === 'creative',
  });

  return (
    <GameWrapper
      childId={childId}
      gameTitle={game.title}
      iconEmoji={game.iconEmoji}
      onGameComplete={handleGameComplete}
    >
      {game.category === 'memory' && (
        <MemoryMatch difficulty={difficulty} onComplete={handleGameComplete} />
      )}
      {game.category === 'math' && game.title === 'Math Quiz' && (
        <MathQuiz difficulty={difficulty} onComplete={handleGameComplete} />
      )}
      {game.category === 'math' && game.title.includes('Pyramid') && (
        <PharaohPyramid difficulty={difficulty} onComplete={handleGameComplete} />
      )}
      {game.category === 'quiz' && (
        <NileScience difficulty={difficulty} onComplete={handleGameComplete} />
      )}
      {game.category === 'language' && (
        <ArabicWordPuzzle difficulty={difficulty} onComplete={handleGameComplete} />
      )}
      {game.category === 'creative' && (
        <CreativeSandbox difficulty={difficulty} onComplete={handleGameComplete} />
      )}
      {!['memory', 'math', 'quiz', 'language', 'creative'].includes(game.category) && (
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
          <p className="text-2xl text-gray-600">This game is not yet implemented.</p>
        </div>
      )}
    </GameWrapper>
  );
}
