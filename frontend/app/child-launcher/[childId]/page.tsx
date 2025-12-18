'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Child {
  id: string;
  fullName: string;
  age: number;
  totalPoints: number;
}

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
}

export default function ChildLauncherPage() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGamesMenu, setShowGamesMenu] = useState(false);
  const [selectedType, setSelectedType] = useState<'play' | 'learn' | null>(null);

  useEffect(() => {
    fetchChild();
    fetchGames();
    logActivity('launcher_open');
  }, [params.childId]);

  const fetchChild = async () => {
    try {
      const response = await apiClient.get(`/api/parent/children/${params.childId}`);
      setChild(response.data);
    } catch (error) {
      console.error('Failed to fetch child:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await apiClient.get('/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const logActivity = async (eventType: string, metadata?: any) => {
    try {
      await apiClient.post('/api/activity/log', {
        childId: params.childId,
        eventType,
        metadata,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const handleActivityClick = (activity: string, type?: 'play' | 'learn') => {
    logActivity('activity_click', { activity });

    if (type === 'play' || type === 'learn') {
      setSelectedType(type);
      setShowGamesMenu(true);
    } else {
      // Other activities not yet implemented
      alert(`🎮 ${activity} - Coming soon!`);
    }
  };

  const handleGameSelect = (gameId: string, gameTitle: string) => {
    logActivity('game_start', { gameId, gameTitle });
    router.push(`/games/${gameId}?childId=${params.childId}`);
  };

  const handleBackToLauncher = () => {
    setShowGamesMenu(false);
    setSelectedType(null);
  };

  const handleExit = () => {
    logActivity('launcher_exit');
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredGames = games.filter((game) => game.type === selectedType);

  if (showGamesMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg">
              <h1 className="text-2xl md:text-4xl font-bold text-purple-600">
                {selectedType === 'play' ? '🎮 Play Games' : '📚 Learn Games'}
              </h1>
            </div>
            <button
              onClick={handleBackToLauncher}
              className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full shadow-lg text-lg"
            >
              ← Back
            </button>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id, game.title)}
                className="bg-white/90 backdrop-blur hover:bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{game.iconEmoji}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{game.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                  <div className="flex justify-center gap-2 text-xs text-gray-500">
                    <span>Ages {game.minAge}-{game.maxAge}</span>
                    <span>•</span>
                    <span>{game.basePoints} pts</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl text-white font-bold">No games available yet!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white rounded-full px-6 py-3 shadow-lg">
            <h1 className="text-2xl md:text-4xl font-bold text-purple-600">
              👋 Hi {child?.fullName?.split(' ')[0] || 'Friend'}!
            </h1>
          </div>
          <div className="bg-yellow-300 rounded-full px-6 py-3 shadow-lg">
            <p className="text-xl md:text-3xl font-bold text-orange-600">
              ⭐ {child?.totalPoints || 0}
            </p>
          </div>
        </div>

        {/* Main Activity Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Play Button */}
          <button
            onClick={() => handleActivityClick('Play Games', 'play')}
            className="bg-green-400 hover:bg-green-500 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-4">🎮</div>
              <p className="text-2xl md:text-4xl font-bold text-white">Play</p>
            </div>
          </button>

          {/* Learn Button */}
          <button
            onClick={() => handleActivityClick('Learn', 'learn')}
            className="bg-blue-400 hover:bg-blue-500 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-4">📚</div>
              <p className="text-2xl md:text-4xl font-bold text-white">Learn</p>
            </div>
          </button>

          {/* Stories Button */}
          <button
            onClick={() => handleActivityClick('Stories')}
            className="bg-purple-400 hover:bg-purple-500 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-4">📖</div>
              <p className="text-2xl md:text-4xl font-bold text-white">Stories</p>
            </div>
          </button>

          {/* Art Button */}
          <button
            onClick={() => handleActivityClick('Art & Create')}
            className="bg-pink-400 hover:bg-pink-500 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-4">🎨</div>
              <p className="text-2xl md:text-4xl font-bold text-white">Art</p>
            </div>
          </button>

          {/* Music Button */}
          <button
            onClick={() => handleActivityClick('Music')}
            className="bg-yellow-400 hover:bg-yellow-500 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-4">🎵</div>
              <p className="text-2xl md:text-4xl font-bold text-white">Music</p>
            </div>
          </button>

          {/* Videos Button */}
          <button
            onClick={() => handleActivityClick('Videos')}
            className="bg-red-400 hover:bg-red-500 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-4">📺</div>
              <p className="text-2xl md:text-4xl font-bold text-white">Videos</p>
            </div>
          </button>
        </div>

        {/* Exit Button */}
        <div className="text-center">
          <button
            onClick={handleExit}
            className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-4 px-8 rounded-full shadow-lg text-xl md:text-2xl"
          >
            ← Back to Parent
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white/80 rounded-lg px-6 py-3">
            <p className="text-sm text-gray-600">
              🎯 Click Play or Learn to start games! • All activities logged • Earn points & badges!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
