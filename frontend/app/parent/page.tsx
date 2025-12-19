'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Tutorial } from '@/components/tutorial';
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

interface ScreenTimeStatus {
  isExceeded: boolean;
  currentMinutes: number;
  limitMinutes: number;
  remainingMinutes: number;
  shouldWarn: boolean;
}

interface SafetyRules {
  childId: string;
  timeRestrictions?: {
    enabled: boolean;
    weekdayStart?: string;
    weekdayEnd?: string;
    weekendStart?: string;
    weekendEnd?: string;
    maxDailyMinutes?: number;
  };
  blockedKeywords?: string[];
  blockedUrls?: string[];
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
  const [screenTimeStatus, setScreenTimeStatus] = useState<Record<string, ScreenTimeStatus>>({});
  const [safetyRules, setSafetyRules] = useState<Record<string, SafetyRules>>({});
  const [showSafetySettings, setShowSafetySettings] = useState<string | null>(null);
  const [editingSafetyRules, setEditingSafetyRules] = useState<SafetyRules | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; childId: string; childName: string; totalPoints: number }>>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
      // Ensure age is a valid number
      const childData = {
        fullName: newChild.fullName.trim(),
        age: Number(newChild.age),
      };

      // Validate age is within bounds
      if (childData.age < 3 || childData.age > 12 || isNaN(childData.age)) {
        showError('Age must be between 3 and 12 years.');
        return;
      }

      await apiClient.post('/api/parent/children', childData);
      setNewChild({ fullName: '', age: 7 });
      setShowAddChild(false);
      showSuccess(`🎉 ${childData.fullName} has been added successfully!`);
      fetchData();
    } catch (error: any) {
      console.error('Failed to add child:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add child. Please try again.';
      showError(errorMsg);
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

      // Fetch progress, badges, and screen time if not already loaded
      if (!childProgress[childId]) {
        const [progressRes, badgesRes] = await Promise.all([
          apiClient.get(`/api/games/progress/${childId}`),
          apiClient.get(`/api/games/badges/${childId}`),
        ]);

        setChildProgress((prev) => ({ ...prev, [childId]: progressRes.data }));
        setChildBadges((prev) => ({ ...prev, [childId]: badgesRes.data }));
      }

      // Always fetch screen time status (it changes frequently)
      await fetchScreenTimeStatus(childId);
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

  const fetchScreenTimeStatus = async (childId: string) => {
    try {
      const response = await apiClient.get(`/api/protection/screen-time-status/${childId}`);
      setScreenTimeStatus((prev) => ({ ...prev, [childId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch screen time:', error);
    }
  };

  const fetchSafetyRules = async (childId: string) => {
    try {
      const response = await apiClient.get(`/api/protection/safety-rules/${childId}`);
      setSafetyRules((prev) => ({ ...prev, [childId]: response.data }));
      return response.data;
    } catch (error) {
      // Return default rules if none exist
      const defaultRules: SafetyRules = {
        childId,
        timeRestrictions: {
          enabled: false,
          weekdayStart: '08:00',
          weekdayEnd: '20:00',
          weekendStart: '09:00',
          weekendEnd: '21:00',
          maxDailyMinutes: 120,
        },
        blockedKeywords: [],
        blockedUrls: [],
      };
      setSafetyRules((prev) => ({ ...prev, [childId]: defaultRules }));
      return defaultRules;
    }
  };

  const openSafetySettings = async (childId: string) => {
    const rules = await fetchSafetyRules(childId);
    setEditingSafetyRules(rules || {
      childId,
      timeRestrictions: {
        enabled: false,
        weekdayStart: '08:00',
        weekdayEnd: '20:00',
        weekendStart: '09:00',
        weekendEnd: '21:00',
        maxDailyMinutes: 120,
      },
      blockedKeywords: [],
      blockedUrls: [],
    });
    setShowSafetySettings(childId);
  };

  const saveSafetyRules = async () => {
    if (!editingSafetyRules) return;

    try {
      await apiClient.post('/api/protection/safety-rules', editingSafetyRules);
      setSafetyRules((prev) => ({ ...prev, [editingSafetyRules.childId]: editingSafetyRules }));
      setShowSafetySettings(null);
      setEditingSafetyRules(null);
      showSuccess('🛡️ Safety settings saved successfully!');
    } catch (error) {
      console.error('Failed to save safety rules:', error);
      showError('Failed to save safety settings. Please try again.');
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await apiClient.get('/api/games/leaderboard/global?limit=10');
      const data = response.data;

      // Map backend field names to frontend expectations
      const mapped = data.map((entry: any, index: number) => ({
        rank: entry.rank || index + 1,
        childId: '', // Not provided by backend for privacy
        childName: entry.displayName,
        totalPoints: entry.points,
        isMyChild: entry.isCurrentChild || false,
      }));

      setLeaderboard(mapped);
      setShowLeaderboard(true);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      showError('Failed to load leaderboard.');
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

  const tutorialSteps = [
    {
      title: 'Welcome to Play, Learn & Protect! 🏺',
      description: 'Your child\'s safe and educational Egyptian-themed platform. Let\'s take a quick tour!',
      emoji: '🏺',
    },
    {
      title: 'Add Your Children',
      description: 'Click "Add Child" to register your children. Each child gets their own profile with points and progress tracking.',
      emoji: '👨‍👩‍👧‍👦',
    },
    {
      title: 'Launch Games',
      description: 'Click the 🚀 Launch button to let your child play Egyptian-themed educational games safely.',
      emoji: '🎮',
    },
    {
      title: 'Monitor Activity',
      description: 'View detailed activity logs, screen time, and security alerts using the 📊 Activity button.',
      emoji: '📊',
    },
    {
      title: 'Safety First',
      description: 'Set time limits, block keywords, and configure safety rules with the 🛡️ Safety button.',
      emoji: '🛡️',
    },
    {
      title: 'View Progress & Leaderboard',
      description: 'Check your child\'s game progress, badges earned, and see how they rank on the global leaderboard! 🏆',
      emoji: '⭐',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <Tutorial
        steps={tutorialSteps}
        storageKey="parent-dashboard-tutorial-seen"
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <nav className="bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏺</span>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Play, Learn & Protect
                  </h1>
                  <span className="text-xs text-amber-100">Parent Dashboard</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchLeaderboard}
                  className="p-2 text-white hover:text-amber-200 transition-colors"
                  title="View Leaderboard"
                >
                  <span className="text-2xl">🏆</span>
                </button>
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="relative p-2 text-white hover:text-amber-200 transition-colors"
                >
                  <span className="text-2xl">🔔</span>
                  {unreadAlertCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {unreadAlertCount}
                    </span>
                  )}
                </button>
                <span className="text-sm text-amber-100 hidden sm:inline">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
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
                  <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight flex items-center gap-3">
                    <span className="text-4xl">👨‍👩‍👧‍👦</span> My Children
                  </h1>
                  <button
                    onClick={() => setShowAddChild(!showAddChild)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2"
                  >
                    ➕ Add Child
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
                        value={newChild.age || ''}
                        onChange={(e) => setNewChild({ ...newChild, age: parseInt(e.target.value) || 7 })}
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
                  <div className="grid grid-cols-1 gap-6">
                    {children.map((child) => {
                      const isExpanded = expandedChildId === child.id;
                      const progress = childProgress[child.id] || [];
                      const badges = childBadges[child.id] || [];
                      const screenTime = screenTimeStatus[child.id];

                      return (
                        <div key={child.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-200">
                          {/* Child Header */}
                          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
                                  {child.age <= 5 ? '👶' : child.age <= 8 ? '🧒' : '👦'}
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-amber-900">{child.fullName}</h3>
                                  <p className="text-sm text-amber-700">
                                    Age {child.age} • {child.age <= 5 ? 'Explorer' : child.age <= 8 ? 'Adventurer' : 'Champion'}
                                  </p>
                                  <p className="text-lg font-bold text-amber-600 mt-1">⭐ {child.totalPoints} Points</p>
                                </div>
                              </div>

                              {/* Screen Time Status */}
                              {screenTime && (
                                <div className={`px-4 py-3 rounded-xl ${screenTime.isExceeded
                                    ? 'bg-red-100 border-2 border-red-400'
                                    : screenTime.shouldWarn
                                      ? 'bg-yellow-100 border-2 border-yellow-400'
                                      : 'bg-green-100 border-2 border-green-400'
                                  }`}>
                                  <div className="text-center">
                                    <p className="text-xs font-semibold text-gray-600 uppercase">Screen Time Today</p>
                                    <p className={`text-2xl font-bold ${screenTime.isExceeded ? 'text-red-600' : screenTime.shouldWarn ? 'text-yellow-700' : 'text-green-600'
                                      }`}>
                                      {formatMinutes(screenTime.currentMinutes)}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      of {formatMinutes(screenTime.limitMinutes)} limit
                                    </p>
                                    {screenTime.isExceeded && (
                                      <p className="text-xs text-red-600 font-bold mt-1">⚠️ Limit exceeded!</p>
                                    )}
                                    {screenTime.shouldWarn && !screenTime.isExceeded && (
                                      <p className="text-xs text-yellow-700 font-bold mt-1">⏰ {formatMinutes(screenTime.remainingMinutes)} remaining</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 flex-wrap">
                                <Link
                                  href={`/child-launcher/${child.id}`}
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                                >
                                  🚀 Launch
                                </Link>
                                <Link
                                  href={`/parent/activity/${child.id}`}
                                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                                >
                                  📊 Activity
                                </Link>
                                <button
                                  onClick={() => openSafetySettings(child.id)}
                                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                                >
                                  🛡️ Safety
                                </button>
                                <button
                                  onClick={() => fetchChildDetails(child.id)}
                                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                                >
                                  {isExpanded ? '▼ Hide' : '▶ Stats'}
                                </button>
                                <button
                                  onClick={() => handleDownloadReport(child.id, child.fullName)}
                                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                                >
                                  📄 PDF
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
                              Teacher: {consent.teacher?.fullName || 'Unknown Teacher'}
                            </h3>
                            {consent.teacher?.school && (
                              <p className="text-sm text-gray-600">{consent.teacher.school}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              Child: {consent.child?.fullName || 'Unknown Child'}
                            </p>
                            {consent.classroom && (
                              <p className="text-sm text-gray-600">Classroom: {consent.classroom.name}</p>
                            )}
                            {consent.message && (
                              <p className="mt-2 text-sm text-gray-700 italic">"{consent.message}"</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveConsent(consent.id, consent.teacher?.fullName || 'Unknown')}
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

          {/* Safety Settings Modal */}
          {showSafetySettings && editingSafetyRules && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">🛡️ Safety Settings</h2>
                    <button
                      onClick={() => {
                        setShowSafetySettings(null);
                        setEditingSafetyRules(null);
                      }}
                      className="text-white/80 hover:text-white text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-indigo-100 mt-1">
                    Configure screen time limits and content filters for {children.find(c => c.id === showSafetySettings)?.fullName}
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Screen Time Controls */}
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-blue-900">⏰ Screen Time Limits</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingSafetyRules.timeRestrictions?.enabled || false}
                          onChange={(e) => setEditingSafetyRules({
                            ...editingSafetyRules,
                            timeRestrictions: {
                              ...editingSafetyRules.timeRestrictions!,
                              enabled: e.target.checked,
                            },
                          })}
                          className="w-5 h-5 rounded text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Enabled</span>
                      </label>
                    </div>

                    {editingSafetyRules.timeRestrictions?.enabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Daily Time Limit (minutes)
                          </label>
                          <input
                            type="number"
                            min={15}
                            max={480}
                            step={15}
                            value={editingSafetyRules.timeRestrictions?.maxDailyMinutes || 120}
                            onChange={(e) => setEditingSafetyRules({
                              ...editingSafetyRules,
                              timeRestrictions: {
                                ...editingSafetyRules.timeRestrictions!,
                                maxDailyMinutes: parseInt(e.target.value) || 120,
                              },
                            })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Current: {formatMinutes(editingSafetyRules.timeRestrictions?.maxDailyMinutes || 120)} per day
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Weekday Start Time
                            </label>
                            <input
                              type="time"
                              value={editingSafetyRules.timeRestrictions?.weekdayStart || '08:00'}
                              onChange={(e) => setEditingSafetyRules({
                                ...editingSafetyRules,
                                timeRestrictions: {
                                  ...editingSafetyRules.timeRestrictions!,
                                  weekdayStart: e.target.value,
                                },
                              })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Weekday End Time
                            </label>
                            <input
                              type="time"
                              value={editingSafetyRules.timeRestrictions?.weekdayEnd || '20:00'}
                              onChange={(e) => setEditingSafetyRules({
                                ...editingSafetyRules,
                                timeRestrictions: {
                                  ...editingSafetyRules.timeRestrictions!,
                                  weekdayEnd: e.target.value,
                                },
                              })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Weekend Start Time
                            </label>
                            <input
                              type="time"
                              value={editingSafetyRules.timeRestrictions?.weekendStart || '09:00'}
                              onChange={(e) => setEditingSafetyRules({
                                ...editingSafetyRules,
                                timeRestrictions: {
                                  ...editingSafetyRules.timeRestrictions!,
                                  weekendStart: e.target.value,
                                },
                              })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Weekend End Time
                            </label>
                            <input
                              type="time"
                              value={editingSafetyRules.timeRestrictions?.weekendEnd || '21:00'}
                              onChange={(e) => setEditingSafetyRules({
                                ...editingSafetyRules,
                                timeRestrictions: {
                                  ...editingSafetyRules.timeRestrictions!,
                                  weekendEnd: e.target.value,
                                },
                              })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Filters */}
                  <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                    <h3 className="text-lg font-bold text-red-900 mb-4">🚫 Content Filters</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Blocked Keywords (comma-separated)
                        </label>
                        <textarea
                          value={editingSafetyRules.blockedKeywords?.join(', ') || ''}
                          onChange={(e) => setEditingSafetyRules({
                            ...editingSafetyRules,
                            blockedKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k),
                          })}
                          placeholder="e.g., violence, bad word, inappropriate"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg h-20 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Content containing these words will be flagged
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Blocked URLs (comma-separated)
                        </label>
                        <textarea
                          value={editingSafetyRules.blockedUrls?.join(', ') || ''}
                          onChange={(e) => setEditingSafetyRules({
                            ...editingSafetyRules,
                            blockedUrls: e.target.value.split(',').map(u => u.trim()).filter(u => u),
                          })}
                          placeholder="e.g., example.com, badsite.org"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg h-20 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          These URLs will be blocked from access
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={saveSafetyRules}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
                    >
                      💾 Save Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowSafetySettings(null);
                        setEditingSafetyRules(null);
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Modal */}
          {showLeaderboard && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      🏆 Global Leaderboard
                    </h2>
                    <button
                      onClick={() => setShowLeaderboard(false)}
                      className="text-white/80 hover:text-white text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-amber-100 mt-1">Top players across all children</p>
                </div>

                <div className="p-6">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🏺</div>
                      <p className="text-gray-600">No scores yet! Start playing to see the leaderboard.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => {
                        const isMyChild = children.some(c => c.id === entry.childId);
                        const rank = entry.rank || index + 1;
                        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                        // Use a unique key combining rank and childName since childId may be empty
                        const uniqueKey = `${rank}-${entry.childName}-${index}`;

                        return (
                          <div
                            key={uniqueKey}
                            className={`flex items-center gap-4 p-4 rounded-xl ${isMyChild
                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400'
                                : 'bg-gray-50 border border-gray-200'
                              }`}
                          >
                            <div className={`text-2xl font-bold ${rank <= 3 ? 'text-3xl' : 'text-gray-500 w-10 text-center'}`}>
                              {medal}
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold ${isMyChild ? 'text-amber-900' : 'text-gray-800'}`}>
                                {entry.childName}
                                {isMyChild && <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Your Child</span>}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-bold ${isMyChild ? 'text-amber-600' : 'text-gray-700'}`}>
                                ⭐ {entry.totalPoints}
                              </p>
                              <p className="text-xs text-gray-500">points</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800 text-center">
                      🌟 Keep playing games to climb the leaderboard!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
