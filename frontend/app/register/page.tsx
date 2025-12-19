'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

type UserRole = 'parent' | 'teacher';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        email,
        password,
        role,
        fullName,
        phone: phone || undefined,
        school: role === 'teacher' ? school || undefined : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-200 via-orange-300 to-amber-400 py-8 px-4 overflow-hidden relative">
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
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏺</div>
          <h1 className="text-2xl font-bold text-amber-800 mb-1">
            Play, Learn & Protect
          </h1>
          <p className="text-amber-600">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-2">
              I am a:
            </label>
            <div className="flex gap-4">
              <label
                className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                  role === 'parent'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <input
                  type="radio"
                  value="parent"
                  checked={role === 'parent'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="hidden"
                />
                <span className="text-2xl">👨‍👩‍👧</span>
                <span className="font-semibold">Parent</span>
              </label>
              <label
                className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                  role === 'teacher'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="hidden"
                />
                <span className="text-2xl">👩‍🏫</span>
                <span className="font-semibold">Teacher</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-amber-900 mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
              placeholder="Ahmed Mohamed"
            />
          </div>

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
              minLength={6}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
              placeholder="••••••••"
            />
            <p className="text-xs text-amber-600 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-amber-900 mb-2"
            >
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
              placeholder="+20 123 456 7890"
            />
          </div>

          {role === 'teacher' && (
            <div>
              <label
                htmlFor="school"
                className="block text-sm font-semibold text-blue-900 mb-2"
              >
                School Name (Optional)
              </label>
              <input
                id="school"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                placeholder="Future International School"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 px-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating account...' : '✨ Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-amber-800">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-amber-600 hover:text-amber-700 font-bold underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
