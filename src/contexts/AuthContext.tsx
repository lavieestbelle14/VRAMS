
'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'officer' | 'public';

interface AuthenticatedUser {
  username: string; // This will store the email
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

interface StoredUser extends AuthenticatedUser {
  passwordHash: string; // For a mock system, this will be plain text. In real app, a hash.
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, passwordAttempt: string, intendedRole: UserRole) => void;
  signUp: (firstName: string, lastName: string, email: string, passwordAttempt: string, confirmPasswordAttempt: string) => void;
  logout: () => void;
  isLoading: boolean;
  user: AuthenticatedUser | null;
  resetPassword: (email: string, token: string, newPass: string, confirmPass: string) => Promise<boolean>;
  updateUserProfile: (updates: { firstName?: string; lastName?: string }) => Promise<boolean>;
  updateUserPassword: (currentPass: string, newPass: string, confirmPass: string) => Promise<boolean>;
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
    if (!users.some(u => u.username.toLowerCase() === 'officer@comelec.gov.ph')) {
      users.push({
        username: 'officer@comelec.gov.ph',
        passwordHash: 'password123',
        role: 'officer',
        firstName: 'Officer',
        lastName: 'User'
      });
      saveMockUsersDB(users);
    }
  }, []);


  const checkAuthStatus = useCallback(() => {
    setIsLoading(true);
    seedInitialUsers();
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
    const currentPath = pathname; // Capture pathname for consistent use within this effect run

    const isTermsPage = currentPath.startsWith('/public/terms-of-service');
    const isPrivacyPage = currentPath.startsWith('/public/privacy-policy');

    if (isTermsPage || isPrivacyPage) {
      // These pages are always accessible. Skip all other auth checks and redirection logic from this effect.
      return;
    }

    // For all other pages, proceed with auth checks:
    if (isLoading) return; // Wait for auth status to be clear.


    // Define path categories using currentPath
    const isOfficerPath = currentPath.startsWith('/dashboard');
    const publicUserAuthenticatedPaths = [
      '/public/home',
      '/public/apply',
      '/public/track-status',
      '/public/application-submitted',
      '/public/profile',
      '/public/faq',
      '/public/schedule-biometrics'
    ];
    const isPathRequiringPublicUserAuth = publicUserAuthenticatedPaths.some(p => currentPath.startsWith(p));
    const isAuthPage = currentPath === '/'; // The login/signup page
    const isPasswordResetPage = currentPath.startsWith('/public/forgot-password') || currentPath.startsWith('/public/reset-password');


    if (isAuthenticated && user) { // User IS authenticated
      if (user.role === 'officer') {
        // If officer is authenticated but not on a dashboard page (and not terms/privacy due to early return)
        if (!isOfficerPath) {
          router.push('/dashboard');
        }
      } else if (user.role === 'public') {
        // If public user tries to access officer dashboard (and not terms/privacy)
        if (isOfficerPath) {
          router.push('/public/home');
        } else if (isAuthPage) { // Authenticated public user on login page (and not terms/privacy)
          router.push('/public/home');
        }
      }
    } else { // User is NOT authenticated
      // We know it's not terms/privacy due to the early return.
      // If it's an officer path or a path requiring public user auth, redirect to login.
      // Also ensure not to redirect if it's the password reset page.
      if ((isOfficerPath || isPathRequiringPublicUserAuth) && !isPasswordResetPage && !isAuthPage) {
        router.push('/');
      }
      // If it's the auth page ('/') or password reset itself, no redirect (unauthenticated user on these pages is fine).
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);


  const login = (email: string, passwordAttempt: string, intendedRole: UserRole) => {
    const users = getMockUsersDB();
    const foundUser = users.find(u => u.username.toLowerCase() === email.toLowerCase());

    if (foundUser && foundUser.passwordHash === passwordAttempt) {
      if (foundUser.role !== intendedRole) {
        toast({ title: 'Login Failed', description: `Please use the ${intendedRole === 'officer' ? 'Officer' : 'Public User'} login tab.`, variant: 'destructive' });
        return;
      }
      const authenticatedUser: AuthenticatedUser = {
        username: foundUser.username,
        role: foundUser.role,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName
      };
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
      toast({ title: 'Login Successful', description: `Welcome, ${authenticatedUser.firstName || authenticatedUser.username}!` });
    } else {
      toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
    }
  };

  const signUp = (firstName: string, lastName: string, email: string, passwordAttempt: string, confirmPasswordAttempt: string) => {
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

    const newUser: StoredUser = {
      firstName,
      lastName,
      username: email,
      passwordHash: passwordAttempt,
      role: 'public'
    };
    users.push(newUser);
    saveMockUsersDB(users);

    toast({ title: 'Sign Up Successful!', description: 'You can now log in.' });
    const authenticatedUser: AuthenticatedUser = {
      username: newUser.username,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    };
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
    router.push('/');
  };

  const resetPassword = async (email: string, token: string, newPass: string, confirmPass: string): Promise<boolean> => {
    if (newPass !== confirmPass) {
      toast({ title: "Password Reset Failed", description: "New passwords do not match.", variant: "destructive" });
      return false;
    }
    if (newPass.length < 6) {
      toast({ title: "Password Reset Failed", description: "New password must be at least 6 characters.", variant: "destructive" });
      return false;
    }
    if (!token.startsWith("RESET-")) {
        toast({ title: "Password Reset Failed", description: "Invalid reset token format.", variant: "destructive" });
        return false;
    }

    let users = getMockUsersDB();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === email.toLowerCase() && u.role === 'public');

    if (userIndex === -1) {
      toast({ title: "Password Reset Failed", description: "Public user email not found.", variant: "destructive" });
      return false;
    }

    users[userIndex].passwordHash = newPass;
    saveMockUsersDB(users);
    toast({ title: "Password Reset Successful", description: "You can now log in with your new password." });
    return true;
  };

  const updateUserProfile = async (updates: { firstName?: string; lastName?: string }): Promise<boolean> => {
    if (!user || !isAuthenticated || user.role !== 'public') {
      toast({ title: "Update Failed", description: "You must be logged in as a public user.", variant: "destructive" });
      return false;
    }
    let users = getMockUsersDB();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());

    if (userIndex === -1) {
      toast({ title: "Update Failed", description: "User not found.", variant: "destructive" });
      return false;
    }

    const updatedUserDetails = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUserDetails;
    saveMockUsersDB(users);

    const updatedAuthUser = { ...user, ...updates };
    setUser(updatedAuthUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedAuthUser));

    toast({ title: "Profile Updated", description: "Your profile information has been updated." });
    return true;
  };

  const updateUserPassword = async (currentPass: string, newPass: string, confirmPass: string): Promise<boolean> => {
     if (!user || !isAuthenticated || user.role !== 'public') {
      toast({ title: "Password Change Failed", description: "You must be logged in as a public user.", variant: "destructive" });
      return false;
    }
    if (newPass !== confirmPass) {
      toast({ title: "Password Change Failed", description: "New passwords do not match.", variant: "destructive" });
      return false;
    }
    if (newPass.length < 6) {
      toast({ title: "Password Change Failed", description: "New password must be at least 6 characters.", variant: "destructive" });
      return false;
    }

    let users = getMockUsersDB();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());

    if (userIndex === -1) {
      toast({ title: "Password Change Failed", description: "User not found.", variant: "destructive" });
      return false;
    }
    if (users[userIndex].passwordHash !== currentPass) {
      toast({ title: "Password Change Failed", description: "Incorrect current password.", variant: "destructive" });
      return false;
    }

    users[userIndex].passwordHash = newPass;
    saveMockUsersDB(users);
    toast({ title: "Password Changed Successfully", description: "Your password has been updated." });
    return true;
  };


  if (isLoading && !pathname.startsWith('/public/terms-of-service') && !pathname.startsWith('/public/privacy-policy')) {
    // Show loading indicator for all pages except terms and privacy during initial auth check
    return <div className="flex h-screen items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signUp, logout, isLoading, resetPassword, updateUserProfile, updateUserPassword }}>
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
