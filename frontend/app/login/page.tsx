'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-200 via-orange-300 to-amber-400 p-4 overflow-hidden relative">
      {/* Decorative Egyptian Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Pyramids */}
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20">
          <div className="w-0 h-0 border-l-[128px] border-r-[128px] border-b-[200px] border-l-transparent border-r-transparent border-b-amber-800"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-48 h-48 opacity-15">
          <div className="w-0 h-0 border-l-[96px] border-r-[96px] border-b-[160px] border-l-transparent border-r-transparent border-b-amber-700"></div>
        </div>
        {/* Sun */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-30 blur-sm"></div>
        {/* Palm trees */}
        <div className="absolute bottom-20 left-1/4 text-6xl opacity-20">🌴</div>
        <div className="absolute bottom-10 right-1/4 text-5xl opacity-15">🌴</div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 relative z-10 border-4 border-amber-500">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏺</div>
          <h1 className="text-3xl font-bold text-amber-800 mb-2">
            Play, Learn & Protect
          </h1>
          <p className="text-amber-600">Welcome back! Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-amber-900 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-amber-900 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 px-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-amber-800">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-amber-600 hover:text-amber-700 font-bold underline"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-amber-200">
          <p className="text-xs text-amber-700 text-center mb-3 font-semibold">Demo Accounts:</p>
          <div className="space-y-2 text-xs">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-800">👨‍👩‍👧 Parent:</span>
              <span className="text-amber-700"> parent@example.eg / password123</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <span className="font-bold text-blue-800">👩‍🏫 Teacher:</span>
              <span className="text-blue-700"> teacher@school.eg / password123</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
              <span className="font-bold text-purple-800">👨‍💼 Admin:</span>
              <span className="text-purple-700"> admin@playlearn.eg / password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
