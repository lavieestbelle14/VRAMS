
'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'officer' | 'public';

interface AuthenticatedUser {
  username: string; // This will store the email
  role: UserRole;
}

interface StoredUser extends AuthenticatedUser {
  passwordHash: string; // For a mock system, this will be plain text. In real app, a hash.
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, passwordAttempt: string, intendedRole: UserRole) => void;
  signUp: (email: string, passwordAttempt: string, confirmPasswordAttempt: string) => void;
  logout: () => void;
  isLoading: boolean;
  user: AuthenticatedUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'vrams_users_db';
const CURRENT_USER_KEY = 'vrams_current_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const publicPaths = ['/']; // Login/Signup page is public

  const getMockUsersDB = (): StoredUser[] => {
    if (typeof window === 'undefined') return [];
    const db = localStorage.getItem(USERS_DB_KEY);
    return db ? JSON.parse(db) : [];
  };

  const saveMockUsersDB = (users: StoredUser[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  };

  const seedInitialUsers = useCallback(() => {
    let users = getMockUsersDB();
    if (users.length === 0) {
      users.push({ username: 'officer@comelec.gov.ph', passwordHash: 'password123', role: 'officer' });
      saveMockUsersDB(users);
    }
  }, []);


  const checkAuthStatus = useCallback(() => {
    setIsLoading(true);
    seedInitialUsers(); // Ensure default officer exists
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as AuthenticatedUser;
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [seedInitialUsers]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role === 'officer' && (pathname === '/' || pathname.startsWith('/public'))) {
          router.push('/dashboard');
        } else if (user.role === 'public' && (pathname === '/' || pathname.startsWith('/dashboard'))) {
          router.push('/public/home');
        }
      } else if (!isAuthenticated && !publicPaths.includes(pathname) && !pathname.startsWith('/public')) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router, publicPaths]);

  const login = (email: string, passwordAttempt: string, intendedRole: UserRole) => {
    const users = getMockUsersDB();
    const foundUser = users.find(u => u.username.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.passwordHash === passwordAttempt) { // Plain text comparison for mock
      if (foundUser.role !== intendedRole) {
        toast({ title: 'Login Failed', description: `Please use the ${intendedRole === 'officer' ? 'Officer' : 'Public User'} login tab.`, variant: 'destructive' });
        return;
      }
      const authenticatedUser: AuthenticatedUser = { username: foundUser.username, role: foundUser.role };
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
      toast({ title: 'Login Successful', description: `Welcome, ${authenticatedUser.username}!` });
      if (foundUser.role === 'officer') {
        router.push('/dashboard');
      } else {
        router.push('/public/home');
      }
    } else {
      toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
    }
  };

  const signUp = (email: string, passwordAttempt: string, confirmPasswordAttempt: string) => {
    if (passwordAttempt !== confirmPasswordAttempt) {
      toast({ title: 'Sign Up Failed', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (passwordAttempt.length < 6) {
       toast({ title: 'Sign Up Failed', description: 'Password must be at least 6 characters.', variant: 'destructive' });
       return;
    }

    const users = getMockUsersDB();
    if (users.some(u => u.username.toLowerCase() === email.toLowerCase())) {
      toast({ title: 'Sign Up Failed', description: 'Email already registered.', variant: 'destructive' });
      return;
    }

    const newUser: StoredUser = { username: email, passwordHash: passwordAttempt, role: 'public' };
    users.push(newUser);
    saveMockUsersDB(users);
    
    toast({ title: 'Sign Up Successful!', description: 'You can now log in.' });
    // Automatically log in the new user
    login(email, passwordAttempt, 'public');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
    router.push('/');
  };
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signUp, logout, isLoading }}>
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
