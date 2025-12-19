'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tutorial } from '@/components/tutorial';
import { GroupChat } from '@/components/group-chat';
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
  type: 'play' | 'learn' | 'create';
  category: string;
  iconEmoji: string;
  minAge: number;
  maxAge: number;
  basePoints: number;
  isEgyptianThemed?: boolean;
}

export default function ChildLauncherPage() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGamesMenu, setShowGamesMenu] = useState(false);
  const [selectedType, setSelectedType] = useState<'play' | 'learn' | 'create' | null>(null);
  const [showChat, setShowChat] = useState(false);

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

  const handleActivityClick = (activity: string, type?: 'play' | 'learn' | 'create') => {
    logActivity('activity_click', { activity });

    if (type === 'play' || type === 'learn' || type === 'create') {
      setSelectedType(type);
      setShowGamesMenu(true);
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
    router.push('/parent');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-200 via-orange-300 to-amber-400">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🏺</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-800 mx-auto"></div>
          <p className="mt-4 text-amber-900 text-2xl font-bold">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  // Filter games based on selected type and child's age
  const filteredGames = games.filter((game) => {
    if (selectedType === 'create') {
      return game.category === 'creative' || game.type === 'create';
    }
    return game.type === selectedType;
  }).filter((game) => {
    // Age-appropriate filtering
    if (child) {
      return child.age >= game.minAge && child.age <= game.maxAge;
    }
    return true;
  });

  const getMenuTitle = () => {
    switch (selectedType) {
      case 'play': return { icon: '🎮', text: 'Play Games', color: 'text-emerald-700' };
      case 'learn': return { icon: '📚', text: 'Learn Games', color: 'text-blue-700' };
      case 'create': return { icon: '🎨', text: 'Creative Sandbox', color: 'text-pink-700' };
      default: return { icon: '🎯', text: 'Games', color: 'text-gray-700' };
    }
  };

  const menuStyle = getMenuTitle();

  if (showGamesMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-200 via-orange-300 to-amber-400 p-4 md:p-8">
        {/* Decorative pyramids background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 w-48 h-48 opacity-20">
            <div className="w-0 h-0 border-l-[96px] border-r-[96px] border-b-[160px] border-l-transparent border-r-transparent border-b-amber-800"></div>
          </div>
          <div className="absolute bottom-0 right-10 w-32 h-32 opacity-15">
            <div className="w-0 h-0 border-l-[64px] border-r-[64px] border-b-[110px] border-l-transparent border-r-transparent border-b-amber-700"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white/90 backdrop-blur rounded-2xl px-6 py-4 shadow-xl border-4 border-amber-600">
              <h1 className={`text-2xl md:text-4xl font-bold ${menuStyle.color}`}>
                {menuStyle.icon} {menuStyle.text}
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/games?childId=${params.childId}`)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl text-lg border-4 border-purple-600 transform hover:scale-105 transition-all"
              >
                📚 Browse All
              </button>
              <button
                onClick={handleBackToLauncher}
                className="bg-white hover:bg-amber-50 text-amber-800 font-bold py-4 px-8 rounded-2xl shadow-xl text-xl border-4 border-amber-600 transform hover:scale-105 transition-all"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id, game.title)}
                className="bg-white/95 backdrop-blur hover:bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-200 border-4 border-amber-500 hover:border-amber-600"
              >
                <div className="text-center">
                  <div className="text-7xl mb-4">{game.iconEmoji}</div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-2">{game.title}</h3>
                  <p className="text-base text-amber-700 mb-4">{game.description}</p>
                  <div className="flex justify-center gap-3 text-sm">
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
                      Ages {game.minAge}-{game.maxAge}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                      ⭐ {game.basePoints} pts
                    </span>
                  </div>
                  {game.isEgyptianThemed && (
                    <div className="mt-3">
                      <span className="bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                        🏺 Egyptian Theme
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/90 rounded-3xl p-8 inline-block shadow-xl">
                <div className="text-6xl mb-4">🏺</div>
                <p className="text-2xl text-amber-900 font-bold">No games available for your age yet!</p>
                <p className="text-amber-700 mt-2">Check back soon for more adventures!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get age group for display
  const getAgeGroup = () => {
    if (!child) return '';
    if (child.age >= 3 && child.age <= 5) return 'Explorer';
    if (child.age >= 6 && child.age <= 8) return 'Adventurer';
    if (child.age >= 9 && child.age <= 12) return 'Champion';
    return 'Friend';
  };

  const childTutorialSteps = [
    {
      title: `Welcome, ${child?.fullName?.split(' ')[0] || 'Friend'}! 👋`,
      description: 'Get ready for an amazing Egyptian adventure full of fun games and learning!',
      emoji: '🏺',
    },
    {
      title: 'PLAY Games 🎮',
      description: 'Click the green PLAY button to enjoy fun Egyptian-themed games! Match cards, solve puzzles, and have fun!',
      emoji: '🎮',
    },
    {
      title: 'LEARN New Things 📚',
      description: 'Click the blue LEARN button to practice math, science, and Arabic while having fun!',
      emoji: '📚',
    },
    {
      title: 'CREATE Art 🎨',
      description: 'Click the pink CREATE button to draw, build stories, and make your own Egyptian art!',
      emoji: '🎨',
    },
    {
      title: 'Earn Points & Badges! ⭐',
      description: 'Complete games to earn points and unlock special badges. See your points at the top!',
      emoji: '🏆',
    },
  ];

  return (
    <>
      <Tutorial
        steps={childTutorialSteps}
        storageKey={`child-launcher-tutorial-seen-${params.childId}`}
      />
      {showChat && child && (
        <GroupChat
          currentChildId={params.childId as string}
          currentChildName={child.fullName}
          onClose={() => setShowChat(false)}
        />
      )}
      <div className="min-h-screen bg-gradient-to-b from-amber-200 via-orange-300 to-amber-400 p-4 md:p-8 overflow-hidden">
      {/* Decorative Egyptian Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Pyramids */}
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20">
          <div className="w-0 h-0 border-l-[128px] border-r-[128px] border-b-[200px] border-l-transparent border-r-transparent border-b-amber-800"></div>
        </div>
        <div className="absolute bottom-0 left-32 w-48 h-48 opacity-15">
          <div className="w-0 h-0 border-l-[96px] border-r-[96px] border-b-[160px] border-l-transparent border-r-transparent border-b-amber-700"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20">
          <div className="w-0 h-0 border-l-[112px] border-r-[112px] border-b-[180px] border-l-transparent border-r-transparent border-b-amber-800"></div>
        </div>
        {/* Sun */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-400 rounded-full opacity-30 blur-sm"></div>
        {/* Palm trees decorations */}
        <div className="absolute bottom-10 right-1/4 text-6xl opacity-20">🌴</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-15">🌴</div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header with Egyptian styling */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="bg-white/95 backdrop-blur rounded-2xl px-6 py-4 shadow-xl border-4 border-amber-600">
            <h1 className="text-2xl md:text-4xl font-bold text-amber-900">
              👋 Ahlan {child?.fullName?.split(' ')[0] || 'Friend'}!
            </h1>
            <p className="text-sm md:text-base text-amber-700 mt-1">
              🏺 {getAgeGroup()} • Age {child?.age}
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl px-6 py-4 shadow-xl border-4 border-yellow-600">
            <p className="text-2xl md:text-4xl font-bold text-white flex items-center gap-2">
              ⭐ {child?.totalPoints || 0}
            </p>
            <p className="text-xs text-yellow-100 text-center">Total Points</p>
          </div>
        </div>

        {/* Main Activity Grid - Only Play, Learn, Create */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-10">
          {/* PLAY Button - Green/Emerald */}
          <button
            onClick={() => handleActivityClick('Play Games', 'play')}
            className="group bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 rounded-[2rem] p-10 md:p-14 shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-emerald-600"
          >
            <div className="text-center">
              <div className="text-7xl md:text-9xl mb-4 group-hover:animate-bounce">🎮</div>
              <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">PLAY</p>
              <p className="text-sm md:text-base text-emerald-100 mt-2">Fun Egyptian Games!</p>
            </div>
          </button>

          {/* LEARN Button - Blue */}
          <button
            onClick={() => handleActivityClick('Learn', 'learn')}
            className="group bg-gradient-to-br from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 rounded-[2rem] p-10 md:p-14 shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-blue-600"
          >
            <div className="text-center">
              <div className="text-7xl md:text-9xl mb-4 group-hover:animate-bounce">📚</div>
              <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">LEARN</p>
              <p className="text-sm md:text-base text-blue-100 mt-2">Math, Science & Arabic!</p>
            </div>
          </button>

          {/* CREATE Button - Pink/Creative Sandbox */}
          <button
            onClick={() => handleActivityClick('Creative Sandbox', 'create')}
            className="group bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 rounded-[2rem] p-10 md:p-14 shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-pink-600"
          >
            <div className="text-center">
              <div className="text-7xl md:text-9xl mb-4 group-hover:animate-bounce">🎨</div>
              <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">CREATE</p>
              <p className="text-sm md:text-base text-pink-100 mt-2">Draw & Build!</p>
            </div>
          </button>
        </div>

        {/* Chat and Exit Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
          <button
            onClick={() => setShowChat(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow-xl text-xl md:text-2xl border-4 border-cyan-600 transform hover:scale-105 transition-all"
          >
            💬 Chat with Friends
          </button>
          <button
            onClick={handleExit}
            className="bg-white hover:bg-amber-50 text-amber-800 font-bold py-4 px-10 rounded-2xl shadow-xl text-xl md:text-2xl border-4 border-amber-600 transform hover:scale-105 transition-all"
          >
            ← Back to Parent
          </button>
        </div>

        {/* Footer Note with Egyptian theme */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white/90 backdrop-blur rounded-2xl px-6 py-4 shadow-lg border-2 border-amber-400">
            <p className="text-base md:text-lg text-amber-800 font-semibold">
              🏺 Explore ancient Egypt while you play and learn! 🌟
            </p>
            <p className="text-sm text-amber-600 mt-1">
              Earn points, collect badges, and become a champion!
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
