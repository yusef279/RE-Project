'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

interface Child {
  id: string;
  fullName: string;
  age: number;
  locale: string;
  totalPoints: number;
  createdAt: string;
}

interface GameProgress {
  id: string;
  game: {
    title: string;
    iconEmoji: string;
  };
  highScore: number;
  timesCompleted: number;
  currentDifficulty: string;
  lastPlayedAt: string;
}

interface Badge {
  id: string;
  name: string;
  iconEmoji: string;
  description: string;
  earnedAt: string;
}

interface Consent {
  id: string;
  type: string;
  status: string;
  message: string;
  teacher: {
    fullName: string;
    school: string;
    user: {
      email: string;
    };
  };
  child: {
    fullName: string;
  };
  classroom?: {
    name: string;
  };
  createdAt: string;
}

interface Alert {
  _id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'unread' | 'read' | 'dismissed';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  childId: string;
  createdAt: string;
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [pendingConsents, setPendingConsents] = useState<Consent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ fullName: '', age: 7 });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [childProgress, setChildProgress] = useState<Record<string, GameProgress[]>>({});
  const [childBadges, setChildBadges] = useState<Record<string, Badge[]>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, consentsRes, alertsRes, unreadCountRes] = await Promise.all([
        apiClient.get('/api/parent/children'),
        apiClient.get('/api/parent/consents/pending'),
        apiClient.get('/api/protection/alerts?status=unread&limit=10'),
        apiClient.get('/api/protection/alerts/unread-count'),
      ]);
      setChildren(childrenRes.data);
      setPendingConsents(consentsRes.data);
      setAlerts(alertsRes.data);
      setUnreadAlertCount(unreadCountRes.data.count);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/parent/children', newChild);
      setNewChild({ fullName: '', age: 7 });
      setShowAddChild(false);
      showSuccess(`🎉 ${newChild.fullName} has been added successfully!`);
      fetchData();
    } catch (error) {
      console.error('Failed to add child:', error);
      showError('Failed to add child. Please try again.');
    }
  };

  const handleApproveConsent = async (consentId: string, teacherName: string) => {
    try {
      await apiClient.patch(`/api/consents/${consentId}/approve`);
      showSuccess(`✅ Consent approved! ${teacherName} can now access your child's profile.`);
      fetchData();
    } catch (error) {
      console.error('Failed to approve consent:', error);
      showError('Failed to approve consent. Please try again.');
    }
  };

  const handleRejectConsent = async (consentId: string) => {
    try {
      await apiClient.patch(`/api/consents/${consentId}/reject`);
      showSuccess('❌ Consent request rejected.');
      fetchData();
    } catch (error) {
      console.error('Failed to reject consent:', error);
      showError('Failed to reject consent. Please try again.');
    }
  };

  const fetchChildDetails = async (childId: string) => {
    if (expandedChildId === childId) {
      setExpandedChildId(null);
      return;
    }

    try {
      setExpandedChildId(childId);

      // Fetch progress and badges if not already loaded
      if (!childProgress[childId]) {
        const [progressRes, badgesRes] = await Promise.all([
          apiClient.get(`/api/games/progress/${childId}`),
          apiClient.get(`/api/games/badges/${childId}`),
        ]);

        setChildProgress((prev) => ({ ...prev, [childId]: progressRes.data }));
        setChildBadges((prev) => ({ ...prev, [childId]: badgesRes.data }));
      }
    } catch (error) {
      console.error('Failed to fetch child details:', error);
      showError('Failed to load child details.');
    }
  };

  const handleDownloadReport = async (childId: string, childName: string) => {
    try {
      showSuccess('Generating PDF report...');

      const response = await apiClient.get(`/api/games/report/${childId}`, {
        responseType: 'blob',
      });

      // Create a download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-report-${childName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess('📄 Report downloaded successfully!');
    } catch (error) {
      console.error('Failed to download report:', error);
      showError('Failed to generate report. Please try again.');
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await apiClient.patch(`/api/protection/alerts/${alertId}/read`);
      fetchData();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await apiClient.patch(`/api/protection/alerts/${alertId}/dismiss`);
      fetchData();
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const handleMarkAllAlertsAsRead = async () => {
    try {
      await apiClient.patch('/api/protection/alerts/mark-all-read');
      fetchData();
      showSuccess('All alerts marked as read');
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
      showError('Failed to mark alerts as read');
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === 'critical') return '🚨';
    if (severity === 'warning') return '⚠️';
    if (type === 'threat_detected') return '🛡️';
    if (type === 'time_limit_exceeded') return '⏰';
    if (type === 'blocked_content') return '🚫';
    return 'ℹ️';
  };

  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child?.fullName || 'Unknown Child';
  };

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">
                  Play, Learn & Protect
                </h1>
                <span className="ml-4 text-sm text-gray-600">Parent Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <span className="text-2xl">🔔</span>
                  {unreadAlertCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadAlertCount}
                    </span>
                  )}
                </button>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded animate-pulse">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          {/* Alerts Panel */}
          {showAlerts && alerts.length > 0 && (
            <div className="mb-6 bg-white rounded-lg shadow-lg border-2 border-indigo-500">
              <div className="p-4 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-indigo-900">🔔 Alerts & Notifications</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllAlertsAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`p-4 rounded-lg border-l-4 ${alert.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : alert.severity === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getAlertIcon(alert.type, alert.severity)}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <span className="font-medium">{getChildName(alert.childId)}</span>
                            <span>•</span>
                            <span>{new Date(alert.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismissAlert(alert._id)}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Children</h1>
                  <button
                    onClick={() => setShowAddChild(!showAddChild)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                  >
                    Add Child
                  </button>
                </div>


                {showAddChild && (
                  <form onSubmit={handleAddChild} className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Child's full name"
                        value={newChild.fullName}
                        onChange={(e) => setNewChild({ ...newChild, fullName: e.target.value })}
                        required
                        className="px-4 py-2 border rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Age"
                        value={newChild.age}
                        onChange={(e) => setNewChild({ ...newChild, age: parseInt(e.target.value) })}
                        min={3}
                        max={12}
                        required
                        className="px-4 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddChild(false)}
                        className="bg-gray-300 px-4 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {children.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No children added yet (Current State Length: {children.length}). Click "Add Child" to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {children.map((child) => {
                      const isExpanded = expandedChildId === child.id;
                      const progress = childProgress[child.id] || [];
                      const badges = childBadges[child.id] || [];

                      return (
                        <div key={child.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                          {/* Child Header */}
                          <div className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{child.fullName}</h3>
                                <p className="text-sm text-gray-600">Age: {child.age}</p>
                                <p className="text-lg font-bold text-indigo-600 mt-1">⭐ {child.totalPoints} Points</p>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Link
                                  href={`/child-launcher/${child.id}`}
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                                >
                                  🚀 Launch
                                </Link>
                                <Link
                                  href={`/parent/activity/${child.id}`}
                                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                                >
                                  📊 Activity
                                </Link>
                                <button
                                  onClick={() => fetchChildDetails(child.id)}
                                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
                                >
                                  {isExpanded ? '▼ Hide Stats' : '▶ View Stats'}
                                </button>
                                <button
                                  onClick={() => handleDownloadReport(child.id, child.fullName)}
                                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                                >
                                  📄 Report
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="px-6 pb-6 border-t border-gray-200">
                              {/* Game Progress */}
                              <div className="mt-6">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Game Progress</h4>
                                {progress.length === 0 ? (
                                  <p className="text-gray-500 italic">No games played yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {progress.map((p) => (
                                      <div key={p.id} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-3 mb-2">
                                          <span className="text-3xl">{p.game.iconEmoji}</span>
                                          <div>
                                            <h5 className="font-semibold text-gray-800">{p.game.title}</h5>
                                            <p className="text-xs text-gray-600">Difficulty: {p.currentDifficulty}</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>
                                            <p className="text-gray-600">High Score</p>
                                            <p className="font-bold text-purple-600">{p.highScore}</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">Times Played</p>
                                            <p className="font-bold text-blue-600">{p.timesCompleted}</p>
                                          </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                          Last played: {new Date(p.lastPlayedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Badges */}
                              <div className="mt-6">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">🏆 Badges Earned</h4>
                                {badges.length === 0 ? (
                                  <p className="text-gray-500 italic">No badges earned yet. Keep playing!</p>
                                ) : (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {badges.map((badge) => (
                                      <div
                                        key={badge.id}
                                        className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-300 text-center"
                                      >
                                        <p className="text-4xl mb-2">{badge.iconEmoji}</p>
                                        <p className="font-bold text-sm text-gray-800">{badge.name}</p>
                                        <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                          {new Date(badge.earnedAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {pendingConsents.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Pending Consent Requests ({pendingConsents.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingConsents.map((consent) => (
                      <div key={consent.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Teacher: {consent.teacher.fullName}
                            </h3>
                            <p className="text-sm text-gray-600">{consent.teacher.school}</p>
                            <p className="text-sm text-gray-600">Child: {consent.child.fullName}</p>
                            {consent.classroom && (
                              <p className="text-sm text-gray-600">Classroom: {consent.classroom.name}</p>
                            )}
                            {consent.message && (
                              <p className="mt-2 text-sm text-gray-700 italic">"{consent.message}"</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveConsent(consent.id, consent.teacher.fullName)}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleRejectConsent(consent.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
