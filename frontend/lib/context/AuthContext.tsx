'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';
import type { UserProfile, LoginCredentials, RegisterData, AuthResponse } from '@/lib/api/auth';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Fast-load cached user from localStorage for instant UI responsiveness
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        // ignore JSON parse errors
      }
    }

    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt');

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const profileRes = await authApi.getProfile();
      if (profileRes.success && profileRes.user) {
        setUser(profileRes.user);
        localStorage.setItem('user', JSON.stringify(profileRes.user));
      }
    } catch (err) {
      // If profile fetch fails completely, clear invalid tokens
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await authApi.login(credentials);
    if (res.success && res.user) {
      setUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    } else if (res.success && !res.user) {
      try {
        const profileRes = await authApi.getProfile();
        if (profileRes.success && profileRes.user) {
          setUser(profileRes.user);
        }
      } catch {
        // ignore profile fetch error post-login if any
      }
    }
    return res;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const res = await authApi.register(data);
    if (res.success && res.user) {
      setUser(res.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    } else if (res.success && !res.user) {
      try {
        const profileRes = await authApi.getProfile();
        if (profileRes.success && profileRes.user) {
          setUser(profileRes.user);
        }
      } catch {
        // ignore profile fetch error post-register if any
      }
    }
    return res;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
