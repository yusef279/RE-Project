'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminConsentManager } from '@/components/admin-consent';
import apiClient from '@/lib/api-client';

interface SystemStats {
  users: {
    total: number;
    byRole: Array<{ role: string; count: string }>;
  };
  children: number;
  games: number;
  classrooms: number;
  activity: {
    totalEvents: number;
  };
  gameplay: {
    totalCompletions: number;
    totalPoints: number;
  };
  security: {
    totalThreats: number;
  };
}

interface ThreatOverview {
  summary: {
    open: number;
    resolved: number;
    critical: number;
  };
  byType: Array<{ _id: string; count: number; avgConfidence: number }>;
  recent: any[];
}

interface PopularGame {
  gameId: string;
  title: string;
  icon: string;
  totalPlays: number;
  avgScore: number;
  uniquePlayers: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [threats, setThreats] = useState<ThreatOverview | null>(null);
  const [popularGames, setPopularGames] = useState<PopularGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'games' | 'consent'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, threatsRes, gamesRes] = await Promise.all([
        apiClient.get('/api/protection/admin/stats'),
        apiClient.get('/api/protection/admin/threats'),
        apiClient.get('/api/protection/admin/popular-games'),
      ]);

      setStats(statsRes.data);
      setThreats(threatsRes.data);
      setPopularGames(gamesRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">
                  Play, Learn & Protect
                </h1>
                <span className="ml-4 text-sm text-gray-600">Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveTab('threats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'threats'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Threat Monitoring
                {threats && threats.summary.open > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {threats.summary.open}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'games'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Popular Games
              </button>
              <button
                onClick={() => setActiveTab('consent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'consent'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Request Consent
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <span className="text-2xl text-white">👥</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{stats.users.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <span className="text-2xl text-white">👶</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Children</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{stats.children}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <span className="text-2xl text-white">🎮</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Game Completions</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{stats.gameplay.totalCompletions.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <span className="text-2xl text-white">⚠️</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Threats</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{stats.security.totalThreats}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.users.byRole.map((role) => (
                    <div key={role.role} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">{role.role}s</p>
                      <p className="text-3xl font-bold text-indigo-600">{role.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Classrooms</h3>
                  <p className="text-4xl font-bold text-purple-600">{stats.classrooms}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Points</h3>
                  <p className="text-4xl font-bold text-green-600">{stats.gameplay.totalPoints.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Events</h3>
                  <p className="text-4xl font-bold text-blue-600">{stats.activity.totalEvents.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'threats' && threats && (
            <div className="space-y-6">
              {/* Threat Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Open Threats</h3>
                  <p className="text-4xl font-bold text-red-600">{threats.summary.open}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Critical Threats</h3>
                  <p className="text-4xl font-bold text-orange-600">{threats.summary.critical}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Resolved</h3>
                  <p className="text-4xl font-bold text-green-600">{threats.summary.resolved}</p>
                </div>
              </div>

              {/* Threats by Type */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Threats by Type</h3>
                <div className="space-y-3">
                  {threats.byType.map((type) => (
                    <div key={type._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {type._id.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Avg Confidence: {Math.round(type.avgConfidence)}%
                        </p>
                      </div>
                      <span className="px-4 py-2 bg-red-100 text-red-800 font-bold rounded-full">
                        {type.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Threats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Threats</h3>
                {threats.recent.length === 0 ? (
                  <p className="text-gray-500 italic">No recent threats</p>
                ) : (
                  <div className="space-y-3">
                    {threats.recent.slice(0, 5).map((threat) => (
                      <div key={threat._id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            threat.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : threat.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {threat.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(threat.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium capitalize">
                          {threat.threatType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Confidence: {threat.confidence}% • Child ID: {threat.childId.substring(0, 8)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Games</h3>
              <div className="space-y-4">
                {popularGames.map((game, index) => (
                  <div key={game.gameId} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-4xl">{game.icon}</span>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{game.title}</h4>
                          <p className="text-sm text-gray-600">
                            {game.uniquePlayers} players • Avg Score: {game.avgScore}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600">{game.totalPlays.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">total plays</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'consent' && <AdminConsentManager />}
        </main>
      </div>
    </ProtectedRoute>
  );
}
