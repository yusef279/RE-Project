'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

interface Child {
  _id: string;
  fullName: string;
  age: number;
  totalPoints: number;
}

interface Parent {
  _id: string;
  fullName: string;
  email: string;
  children: Child[];
}

interface Classroom {
  id: string;
  name: string;
  gradeLevel: string;
}

export function TeacherConsentManager() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parentsRes, classroomsRes] = await Promise.all([
        apiClient.get('/api/teacher/parents'),
        apiClient.get('/api/teacher/classrooms'),
      ]);
      setParents(parentsRes.data);
      setClassrooms(classroomsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setErrorMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleParentChange = (parentId: string) => {
    const parent = parents.find((p) => p._id === parentId);
    setSelectedParent(parent || null);
    setSelectedChildren([]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChildToggle = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedParent || selectedChildren.length === 0) {
      setErrorMessage('Please select a parent and at least one child');
      return;
    }

    if (!selectedClassroom) {
      setErrorMessage('Please select a classroom');
      return;
    }

    try {
      // Send consent request to add children to the selected classroom
      await apiClient.post('/api/teacher/consents/bulk', {
        childIds: selectedChildren,
        classroomId: selectedClassroom,
        type: 'classroom',
        message: message || `Request for consent to add child(ren) to classroom`,
      });

      setSuccessMessage(`Consent requests sent to ${selectedParent.fullName} for ${selectedChildren.length} child(ren)`);
      setSelectedParent(null);
      setSelectedChildren([]);
      setSelectedClassroom('');
      setMessage('');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to send consent request');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading parents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Parent Consent</h3>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Classroom Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Classroom
            </label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">-- Choose a classroom --</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} - Grade {classroom.gradeLevel}
                </option>
              ))}
            </select>
            {classrooms.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                You need to create a classroom first before requesting consent.
              </p>
            )}
          </div>

          {/* Parent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Parent
            </label>
            <select
              value={selectedParent?._id || ''}
              onChange={(e) => handleParentChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">-- Choose a parent --</option>
              {parents.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.fullName} ({parent.email}) - {parent.children.length} child(ren)
                </option>
              ))}
            </select>
          </div>

          {/* Children Selection */}
          {selectedParent && selectedParent.children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Children
              </label>
              <div className="border border-gray-300 rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                {selectedParent.children.map((child) => (
                  <label
                    key={child._id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChildren.includes(child._id)}
                      onChange={() => handleChildToggle(child._id)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{child.fullName}</p>
                      <p className="text-xs text-gray-500">
                        Age: {child.age} • Points: {child.totalPoints}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedChildren.length} of {selectedParent.children.length} children selected
              </p>
            </div>
          )}

          {selectedParent && selectedParent.children.length === 0 && (
            <p className="text-sm text-gray-500 italic">This parent has no children registered.</p>
          )}

          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add a custom message for the parent..."
            />
          </div>

          <button
            type="submit"
            disabled={!selectedParent || selectedChildren.length === 0 || !selectedClassroom}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send Consent Request{selectedChildren.length > 0 && ` (${selectedChildren.length})`}
          </button>
        </form>
      </div>

      {/* Parents Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Parents</h3>
        <div className="space-y-2">
          {parents.length === 0 ? (
            <p className="text-gray-500 italic">No parents found</p>
          ) : (
            parents.map((parent) => (
              <div
                key={parent._id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{parent.fullName}</p>
                    <p className="text-sm text-gray-600">{parent.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                    {parent.children.length} child{parent.children.length !== 1 ? 'ren' : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
