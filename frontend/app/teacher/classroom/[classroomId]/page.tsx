'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import apiClient from '@/lib/api-client';

interface Classroom {
  id: string;
  name: string;
  description: string;
  gradeLevel: string;
  studentCount: number;
}

interface Analytics {
  totalPoints: number;
  averagePoints: number;
  gameStats: Array<{
    gameTitle: string;
    gameIcon: string;
    totalCompletions: number;
    averageScore: number;
  }>;
  topStudents: Array<{
    id: string;
    fullName: string;
    totalPoints: number;
  }>;
}

interface LeaderboardEntry {
  rank: number;
  childId: string;
  fullName: string;
  totalPoints: number;
  age: number;
}

export default function ClassroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.classroomId as string;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard'>('overview');

  useEffect(() => {
    if (classroomId) {
      fetchClassroomData();
    }
  }, [classroomId]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);

      const [analyticsRes, leaderboardRes] = await Promise.all([
        apiClient.get(`/api/teacher/classrooms/${classroomId}/analytics`),
        apiClient.get(`/api/teacher/classrooms/${classroomId}/leaderboard`),
      ]);

      if (analyticsRes.data && analyticsRes.data.classroom && analyticsRes.data.analytics) {
        setClassroom(analyticsRes.data.classroom);
        setAnalytics(analyticsRes.data.analytics);
      } else {
        console.error('Invalid analytics response structure:', analyticsRes.data);
      }

      if (leaderboardRes.data) {
        setLeaderboard(leaderboardRes.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch classroom data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading classroom...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!classroom || !analytics) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Classroom not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.back()}
                  className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-1"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{classroom.name}</h1>
                <p className="text-gray-600 mt-1">{classroom.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-600">Grade: {classroom.gradeLevel}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{classroom.studentCount} Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Overview & Analytics
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'leaderboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Class Points</h3>
                  <p className="text-4xl font-bold text-indigo-600">{analytics.totalPoints.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Average Points per Student</h3>
                  <p className="text-4xl font-bold text-purple-600">{analytics.averagePoints.toLocaleString()}</p>
                </div>
              </div>

              {/* Top Students */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">🏆 Top Performers</h2>
                </div>
                <div className="p-6">
                  {analytics.topStudents.length === 0 ? (
                    <p className="text-gray-500 italic">No activity yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topStudents.map((student, index) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{student.fullName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">{student.totalPoints}</p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Game Statistics */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">📊 Game Statistics</h2>
                </div>
                <div className="p-6">
                  {analytics.gameStats.length === 0 ? (
                    <p className="text-gray-500 italic">No games played yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analytics.gameStats.map((game, index) => (
                        <div
                          key={`${game.gameTitle}-${index}`}
                          className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{game.gameIcon || '🎮'}</span>
                            <h3 className="font-semibold text-gray-900">{game.gameTitle || 'Unknown Game'}</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Completions</p>
                              <p className="text-lg font-bold text-blue-600">{game.totalCompletions || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Avg Score</p>
                              <p className="text-lg font-bold text-purple-600">
                                {game.averageScore ? Math.round(game.averageScore) : 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">🏆 Class Leaderboard</h2>
                <p className="text-sm text-gray-600 mt-1">Ranked by total points</p>
              </div>
              <div className="p-6">
                {leaderboard.length === 0 ? (
                  <p className="text-gray-500 italic">No students with points yet.</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.childId}
                        className={`flex items-center justify-between p-4 rounded-lg ${entry.rank === 1
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                          : entry.rank === 2
                            ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                            : entry.rank === 3
                              ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400'
                              : 'bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-2xl font-bold ${entry.rank <= 3 ? 'text-gray-700' : 'text-gray-400'
                              }`}
                          >
                            #{entry.rank}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{entry.fullName}</p>
                            <p className="text-sm text-gray-600">Age {entry.age}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">{entry.totalPoints}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
