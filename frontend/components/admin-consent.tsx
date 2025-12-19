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

export function AdminConsentManager() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await apiClient.get('/api/consents/admin/parents');
      setParents(response.data);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
      setErrorMessage('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const handleParentChange = (parentId: string) => {
    const parent = parents.find((p) => p._id === parentId);
    setSelectedParent(parent || null);
    setSelectedChildren([]);
  };

  const toggleChild = (childId: string) => {
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

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await Promise.all(
        selectedChildren.map((childId) =>
          apiClient.post('/api/consents/admin-request', {
            type: 'child',
            parentId: selectedParent._id,
            childId,
            message,
          })
        )
      );

      setSuccessMessage(`Consent requests sent to ${selectedParent.fullName} for ${selectedChildren.length} child(ren)`);
      setSelectedParent(null);
      setSelectedChildren([]);
      setMessage('');
    } catch (error: any) {
      console.error('Failed to send consent:', error);
      if (error.response?.status === 404) {
        setErrorMessage('API endpoint not found. Please ensure the backend server is running and the route is properly configured.');
      } else if (error.response?.status === 403) {
        setErrorMessage('Access denied. You must be logged in as an admin to send consent requests.');
      } else {
        setErrorMessage(error.response?.data?.message || error.message || 'Failed to send consent request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading parents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Parent Consent</h2>
        <p className="text-gray-600">Select parents and children to request access consent</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Parent Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Parent
          </label>
          <select
            value={selectedParent?._id || ''}
            onChange={(e) => handleParentChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
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
            <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-gray-300 rounded-lg p-4">
              {selectedParent.children.map((child) => (
                <label
                  key={child._id}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedChildren.includes(child._id)}
                    onChange={() => toggleChild(child._id)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-gray-900">{child.fullName}</p>
                    <p className="text-sm text-gray-600">
                      Age {child.age} • {child.totalPoints} points
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedChildren.length} child(ren)
            </p>
          </div>
        )}

        {selectedParent && selectedParent.children.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">This parent has no children registered yet.</p>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Add a message to the parent explaining why you need access..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !selectedParent || selectedChildren.length === 0}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'Sending Requests...' : `Send Consent Request${selectedChildren.length > 1 ? 's' : ''}`}
        </button>
      </form>

      {/* Parents Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Parents ({parents.length})</h3>
        <div className="space-y-3">
          {parents.map((parent) => (
            <div key={parent._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{parent.fullName}</p>
                  <p className="text-sm text-gray-600">{parent.email}</p>
                </div>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {parent.children.length} child{parent.children.length !== 1 ? 'ren' : ''}
                </span>
              </div>
              {parent.children.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Children: {parent.children.map((c) => c.fullName).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
