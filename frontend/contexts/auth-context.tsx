'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/api-client';

type UserRole = 'admin' | 'parent' | 'teacher';

interface User {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  school?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'parent') {
        router.push('/parent');
      } else if (userData.role === 'teacher') {
        router.push('/teacher');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.post('/api/auth/register', data);

      const { access_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Redirect based on role
      if (userData.role === 'parent') {
        router.push('/parent');
      } else if (userData.role === 'teacher') {
        router.push('/teacher');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
