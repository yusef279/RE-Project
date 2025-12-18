'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import apiClient from '@/lib/api-client';

interface Child {
  id: string;
  fullName: string;
  age: number;
  totalPoints: number;
}

interface ActivityEvent {
  _id: string;
  childId: string;
  eventType: string;
  metadata: Record<string, any>;
  timestamp: string;
}

interface Threat {
  _id: string;
  threatType: string;
  severity: string;
  confidence: number;
  status: string;
  detectedKeywords?: string[];
  createdAt: string;
}

interface SafetyRule {
  timeRestrictions?: {
    enabled: boolean;
    weekdayStart?: string;
    weekdayEnd?: string;
    maxDailyMinutes?: number;
  };
  blockedKeywords?: string[];
  blockedUrls?: string[];
}

export default function ActivityMonitoringPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [child, setChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [safetyRules, setSafetyRules] = useState<SafetyRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'threats' | 'safety'>('timeline');

  useEffect(() => {
    if (childId) {
      fetchData();
    }
  }, [childId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [childRes, activitiesRes, threatsRes, safetyRes] = await Promise.all([
        apiClient.get(`/api/parent/children/${childId}`),
        apiClient.get(`/api/activity/${childId}?limit=50`),
        apiClient.get(`/api/protection/threats/child/${childId}`),
        apiClient.get(`/api/protection/safety-rules/${childId}`).catch(() => ({ data: null })),
      ]);

      setChild(childRes.data);
      setActivities(activitiesRes.data);
      setThreats(threatsRes.data);
      setSafetyRules(safetyRes.data);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'game_started':
        return '🎮';
      case 'game_completed':
        return '✅';
      case 'badge_earned':
        return '🏆';
      case 'login':
        return '🔑';
      case 'logout':
        return '👋';
      default:
        return '📝';
    }
  };

  const getEventDescription = (event: ActivityEvent) => {
    switch (event.eventType) {
      case 'game_started':
        return `Started playing ${event.metadata.gameTitle || 'a game'}`;
      case 'game_completed':
        return `Completed ${event.metadata.gameTitle || 'a game'} - Score: ${event.metadata.score || 0}`;
      case 'badge_earned':
        return `Earned badge: ${event.metadata.badgeName || 'Achievement'}`;
      case 'login':
        return 'Logged in to the platform';
      case 'logout':
        return 'Logged out';
      default:
        return event.eventType.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['parent']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!child) {
    return (
      <ProtectedRoute allowedRoles={['parent']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Child not found</p>
            <button
              onClick={() => router.push('/parent')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push('/parent')}
                  className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-1"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Activity Monitor</h1>
                <p className="text-gray-600 mt-1">
                  {child.fullName} • Age {child.age} • {child.totalPoints} points
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Activity Timeline
              </button>
              <button
                onClick={() => setActiveTab('threats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'threats'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🛡️ Security Threats
                {threats.filter((t) => t.status === 'open').length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {threats.filter((t) => t.status === 'open').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'safety'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ Safety Settings
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-600 mt-1">Last 50 events</p>
              </div>
              <div className="p-6">
                {activities.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-8">No activity recorded yet</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((event) => (
                      <div
                        key={event._id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-3xl">{getEventIcon(event.eventType)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{getEventDescription(event)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Security Threats</h2>
                <p className="text-sm text-gray-600 mt-1">Detected security incidents</p>
              </div>
              <div className="p-6">
                {threats.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-6xl">✅</span>
                    <p className="text-gray-500 mt-4">No threats detected - All clear!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {threats.map((threat) => (
                      <div
                        key={threat._id}
                        className={`p-4 rounded-lg border-l-4 ${
                          threat.severity === 'critical'
                            ? 'bg-red-50 border-red-500'
                            : threat.severity === 'high'
                            ? 'bg-orange-50 border-orange-500'
                            : 'bg-yellow-50 border-yellow-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  threat.severity === 'critical'
                                    ? 'bg-red-200 text-red-800'
                                    : threat.severity === 'high'
                                    ? 'bg-orange-200 text-orange-800'
                                    : 'bg-yellow-200 text-yellow-800'
                                }`}
                              >
                                {threat.severity.toUpperCase()}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  threat.status === 'open'
                                    ? 'bg-gray-200 text-gray-800'
                                    : 'bg-green-200 text-green-800'
                                }`}
                              >
                                {threat.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {threat.threatType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Confidence: {threat.confidence}%
                            </p>
                            {threat.detectedKeywords && threat.detectedKeywords.length > 0 && (
                              <p className="text-xs text-gray-500 mt-2">
                                Keywords: {threat.detectedKeywords.join(', ')}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(threat.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Safety Settings</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Current protection rules for {child.fullName}
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Time Restrictions */}
                <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">⏰ Time Restrictions</h3>
                  {safetyRules?.timeRestrictions?.enabled ? (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        • Allowed time:{' '}
                        {safetyRules.timeRestrictions.weekdayStart || 'Not set'} -{' '}
                        {safetyRules.timeRestrictions.weekdayEnd || 'Not set'}
                      </p>
                      <p>
                        • Daily limit:{' '}
                        {safetyRules.timeRestrictions.maxDailyMinutes || 'Unlimited'} minutes
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No time restrictions set</p>
                  )}
                </div>

                {/* Blocked Keywords */}
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">🚫 Blocked Keywords</h3>
                  {safetyRules?.blockedKeywords && safetyRules.blockedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {safetyRules.blockedKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No blocked keywords</p>
                  )}
                </div>

                {/* Blocked URLs */}
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">🌐 Blocked URLs</h3>
                  {safetyRules?.blockedUrls && safetyRules.blockedUrls.length > 0 ? (
                    <div className="space-y-1">
                      {safetyRules.blockedUrls.map((url, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          • {url}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No blocked URLs</p>
                  )}
                </div>

                {/* Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Note:</strong> To update safety settings, please contact support or
                    use the safety configuration panel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
