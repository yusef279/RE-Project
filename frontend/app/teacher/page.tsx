'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { TeacherConsentManager } from '@/components/teacher-consent';
import apiClient from '@/lib/api-client';

interface Classroom {
  id: string;
  name: string;
  description: string;
  gradeLevel: string;
  classroomStudents: any[];
  createdAt: string;
}

interface Consent {
  id: string;
  type: string;
  status: string;
  message: string;
  parent: {
    fullName: string;
    user: {
      email: string;
    };
  };
  child: {
    id: string;
    fullName: string;
  };
  classroom?: {
    name: string;
  };
  createdAt: string;
}

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClassroom, setShowAddClassroom] = useState(false);
  const [showRequestConsent, setShowRequestConsent] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    description: '',
    gradeLevel: '',
  });
  const [consentRequest, setConsentRequest] = useState({
    parentId: '',
    childId: '',
    classroomId: '',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classroomsRes, consentsRes] = await Promise.all([
        apiClient.get('/api/teacher/classrooms'),
        apiClient.get('/api/teacher/consents'),
      ]);
      setClassrooms(classroomsRes.data);
      setConsents(consentsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/teacher/classrooms', newClassroom);
      setNewClassroom({ name: '', description: '', gradeLevel: '' });
      setShowAddClassroom(false);
      showSuccess(`✅ Classroom "${newClassroom.name}" created successfully!`);
      fetchData();
    } catch (error) {
      console.error('Failed to add classroom:', error);
      showError('Failed to create classroom. Please try again.');
    }
  };

  const handleRequestConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/consents/teacher-request', {
        type: 'classroom',
        ...consentRequest,
      });
      setConsentRequest({ parentId: '', childId: '', classroomId: '', message: '' });
      setShowRequestConsent(false);
      fetchData();
      alert('Consent request sent successfully!');
    } catch (error) {
      console.error('Failed to request consent:', error);
      alert('Failed to request consent');
    }
  };

  const pendingConsents = consents.filter((c) => c.status === 'pending');
  const approvedConsents = consents.filter((c) => c.status === 'approved');

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">
                  Play, Learn & Protect
                </h1>
                <span className="ml-4 text-sm text-gray-600">Teacher Dashboard</span>
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

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">My Classrooms</h2>
                  <button
                    onClick={() => setShowAddClassroom(!showAddClassroom)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Create Classroom
                  </button>
                </div>


                {showAddClassroom && (
                  <form onSubmit={handleAddClassroom} className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Classroom name"
                        value={newClassroom.name}
                        onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newClassroom.description}
                        onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Grade Level"
                        value={newClassroom.gradeLevel}
                        onChange={(e) => setNewClassroom({ ...newClassroom, gradeLevel: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddClassroom(false)}
                        className="bg-gray-300 px-4 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {classrooms.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No classrooms created yet. Click "Create Classroom" to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classrooms.map((classroom) => (
                      <Link
                        key={classroom.id}
                        href={`/teacher/classroom/${classroom.id}`}
                        className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                      >
                        <h3 className="text-xl font-semibold text-indigo-600 mb-2">{classroom.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{classroom.description}</p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Grade</p>
                            <p className="text-sm font-semibold text-gray-800">{classroom.gradeLevel}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Students</p>
                            <p className="text-lg font-bold text-purple-600">
                              {classroom.classroomStudents?.length || 0}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            View Details →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Request Parent Consent
                </h2>

                <TeacherConsentManager />

                {false && (
                  <form onSubmit={handleRequestConsent} className="bg-white p-4 rounded-lg shadow mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Note: In production, you would have a UI to search/select parents and children.
                      For now, you need to know the parent ID and child ID.
                    </p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Parent Profile ID"
                        value={consentRequest.parentId}
                        onChange={(e) => setConsentRequest({ ...consentRequest, parentId: e.target.value })}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Child ID"
                        value={consentRequest.childId}
                        onChange={(e) => setConsentRequest({ ...consentRequest, childId: e.target.value })}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <select
                        value={consentRequest.classroomId}
                        onChange={(e) => setConsentRequest({ ...consentRequest, classroomId: e.target.value })}
                        required
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="">Select Classroom</option>
                        {classrooms.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <textarea
                        placeholder="Message to parent"
                        value={consentRequest.message}
                        onChange={(e) => setConsentRequest({ ...consentRequest, message: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">
                        Send Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRequestConsent(false)}
                        className="bg-gray-300 px-4 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Consent Requests
                </h2>

                {pendingConsents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Pending ({pendingConsents.length})</h3>
                    <div className="space-y-2">
                      {pendingConsents.map((consent) => (
                        <div key={consent.id} className="bg-yellow-50 p-4 rounded-lg">
                          <p className="font-medium">Parent: {consent.parent.fullName}</p>
                          <p className="text-sm text-gray-600">Child: {consent.child.fullName}</p>
                          {consent.classroom && (
                            <p className="text-sm text-gray-600">Classroom: {consent.classroom.name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approvedConsents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-700">
                      Approved ({approvedConsents.length})
                    </h3>
                    <div className="space-y-2">
                      {approvedConsents.map((consent) => (
                        <div key={consent.id} className="bg-green-50 p-4 rounded-lg">
                          <p className="font-medium">Parent: {consent.parent.fullName}</p>
                          <p className="text-sm text-gray-600">Child: {consent.child.fullName}</p>
                          {consent.classroom && (
                            <p className="text-sm text-gray-600">Classroom: {consent.classroom.name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {consents.length === 0 && (
                  <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No consent requests yet.
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
