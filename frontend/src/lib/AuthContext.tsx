/* eslint-disable */
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, User } from './api';
import { useToast } from '@/components/ui/Toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await api.getSession();
        setUser(session.user);
        if (pathname === '/login' || pathname === '/') {
          router.replace('/hosted-zones');
        }
      } catch (err) {
        setUser(null);
        if (pathname !== '/login') {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [pathname, router]);

  const login = async (credentials: Record<string, string>) => {
    try {
      await api.login(credentials);
      // Wait for session check to confirm
      const session = await api.getSession();
      setUser(session.user);
      router.push('/hosted-zones');
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {/* Do not render children until initial load is done unless we are on login page */}
      {!loading ? children : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
