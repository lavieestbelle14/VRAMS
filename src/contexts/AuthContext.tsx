'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback }
from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (redirectTo?: string) => void;
  logout: () => void;
  isLoading: boolean;
  user: { username: string } | null; // Basic user info
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/']; // Login page is public

  const checkAuth = useCallback(() => {
    const storedAuth = localStorage.getItem('vrams_auth');
    const storedUser = localStorage.getItem('vrams_user');
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && pathname === '/') {
        router.push('/dashboard');
      } else if (!isAuthenticated && !publicPaths.includes(pathname)) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, publicPaths]);


  const login = (redirectTo: string = '/dashboard') => {
    // Mock login, in real app, verify credentials
    const mockUser = { username: 'election.officer@comelec.gov.ph' };
    setIsAuthenticated(true);
    setUser(mockUser);
    localStorage.setItem('vrams_auth', 'true');
    localStorage.setItem('vrams_user', JSON.stringify(mockUser));
    router.push(redirectTo);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('vrams_auth');
    localStorage.removeItem('vrams_user');
    router.push('/');
  };
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
