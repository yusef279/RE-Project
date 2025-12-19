'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import apiClient from '@/lib/api-client';

interface Child {
  id: string;
  fullName: string;
  age: number;
  locale: string;
  totalPoints: number;
  createdAt: string;
}

export default function ChildProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChild();
  }, [params.childId]);

  const fetchChild = async () => {
    try {
      const response = await apiClient.get(`/api/parent/children/${params.childId}`);
      setChild(response.data);
    } catch (error: any) {
      console.error('Failed to fetch child:', error);
      setError('Failed to load child profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="text-indigo-600 hover:text-indigo-700 mr-4"
                >
                  ← Back
                </button>
                <h1 className="text-xl font-bold text-indigo-600">
                  Child Profile
                </h1>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : child ? (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{child.fullName}</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-indigo-600">{child.totalPoints}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-lg text-gray-900">{child.age} years old</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Locale</label>
                  <p className="text-lg text-gray-900">{child.locale}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Coming Soon
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Play Activity</h4>
                    <p className="text-sm text-blue-700">Games played and scores</p>
                    <p className="text-xs text-blue-600 mt-2">Coming in STEP 3</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Learning Progress</h4>
                    <p className="text-sm text-green-700">Educational achievements</p>
                    <p className="text-xs text-green-600 mt-2">Coming in STEP 3</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900">Screen Time</h4>
                    <p className="text-sm text-yellow-700">Daily usage limits</p>
                    <p className="text-xs text-yellow-600 mt-2">Coming in STEP 5</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900">Safety Alerts</h4>
                    <p className="text-sm text-red-700">Incident notifications</p>
                    <p className="text-xs text-red-600 mt-2">Coming in STEP 5</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-700">
                  <strong>Child Launcher:</strong> The big button interface for children to access
                  games and activities will be implemented in STEP 2.
                </p>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </ProtectedRoute>
  );
}
