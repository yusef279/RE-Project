'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Game {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type: 'play' | 'learn';
  category: string;
  iconEmoji: string;
  minAge: number;
  maxAge: number;
  basePoints: number;
  isEgyptianThemed?: boolean;
  config: Record<string, any>;
}

export default function GameLibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'play' | 'learn'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/games');
      setGames(response.data.map((game: any) => ({
        ...game,
        id: game._id || game.id,
      })));
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(games.map(g => g.category))).filter(Boolean);
  const ageGroups = Array.from(new Set(games.flatMap(g => [g.minAge, g.maxAge]))).sort((a, b) => a - b);

  const filteredGames = games.filter(game => {
    // Type filter
    if (filterType !== 'all' && game.type !== filterType) return false;
    
    // Category filter
    if (filterCategory !== 'all' && game.category !== filterCategory) return false;
    
    // Age filter
    if (filterAge !== 'all') {
      const age = parseInt(filterAge);
      if (game.minAge > age || game.maxAge < age) return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!game.title.toLowerCase().includes(query) && 
          !game.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const handleGameClick = (gameId: string) => {
    if (childId) {
      router.push(`/games/${gameId}?childId=${childId}`);
    } else {
      // If no childId, show message or redirect
      alert('Please select a child profile first');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-4xl mb-4">🎮</p>
          <p className="text-2xl font-bold">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎮 Game Library</h1>
          <p className="text-gray-600">Browse and discover educational games</p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="play">Play</option>
                <option value="learn">Learn</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Age Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Ages</option>
                <option value="3">Ages 3-5</option>
                <option value="6">Ages 6-8</option>
                <option value="9">Ages 9-12</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filterType !== 'all' || filterCategory !== 'all' || filterAge !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
                setFilterAge('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Games Grid */}
        <div className="mb-4">
          <p className="text-lg text-white font-semibold mb-4">
            Showing {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredGames.length === 0 ? (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-12 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-2xl font-bold text-gray-800 mb-2">No games found</p>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameClick(game.id)}
                className="bg-white/95 backdrop-blur hover:bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200 border-4 border-purple-300 hover:border-purple-500 text-left"
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{game.iconEmoji}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{game.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {game.type === 'play' ? '🎮 Play' : '📚 Learn'}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Ages {game.minAge}-{game.maxAge}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                    ⭐ {game.basePoints} pts
                  </span>
                  {game.isEgyptianThemed && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                      🏺 Egyptian
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-500 capitalize">{game.category}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back Button */}
        {childId && (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push(`/child-launcher/${childId}`)}
              className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-xl shadow-lg transition-all"
            >
              ← Back to Launcher
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
