
'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'officer' | 'public';

interface AuthenticatedUser {
  email: string;
  username: string;
  role: UserRole;
}

interface StoredUser extends AuthenticatedUser {
  passwordHash: string; // For a mock system, this will be plain text. In real app, a hash.
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, passwordAttempt: string, intendedRole: UserRole) => void;
  signUp: (username: string, email: string, passwordAttempt: string, confirmPasswordAttempt: string) => void;
  logout: () => void;
  isLoading: boolean;
  user: AuthenticatedUser | null;
  resetPassword: (email: string, token: string, newPass: string, confirmPass: string) => Promise<boolean>;
  updateUserProfile: (updates: { username?: string }) => Promise<boolean>;
  updateUserPassword: (currentPass: string, newPass: string, confirmPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'vrams_users_db';
const CURRENT_USER_KEY = 'vrams_current_user';

// Define these paths once, outside the effect, if they don't change
const publicUserAuthenticatedPaths = [
  '/public/home',
  '/public/apply',
  '/public/track-status',
  '/public/application-submitted', // Note: often includes [id]
  '/public/profile',
  '/public/faq',
  '/public/schedule-biometrics' // Note: often includes [id]
];

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
  try {
    let users = getMockUsersDB();
    
    // Add null check for the user object and email
    if (!users.some(u => u?.email && u.email.toLowerCase() === 'officer@comelec.gov.ph')) {
      users.push({
        email: 'officer@comelec.gov.ph',
        username: 'Officer',
        passwordHash: 'password123',
        role: 'officer' as UserRole
      });
      saveMockUsersDB(users);
    }
  } catch (error) {
    console.error('Error seeding initial users:', error);
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
    if (isLoading) {
      return;
    }

    const currentPath = pathname;

    // If it's the landing page, do nothing further and allow it to render.
    if (currentPath === '/') {
      return;
    }

    const isTermsPage = currentPath.startsWith('/public/terms-of-service');
    const isPrivacyPage = currentPath.startsWith('/public/privacy-policy');

    if (isTermsPage || isPrivacyPage) {
      return;
    }

    const isOfficerPath = currentPath.startsWith('/dashboard');
    const isPathRequiringPublicUserAuth = publicUserAuthenticatedPaths.some(p => currentPath.startsWith(p));
    const isAuthPage = currentPath === '/auth';
    // isLandingPage is effectively handled by the early return now for currentPath === '/'
    const isPasswordResetPage = currentPath.startsWith('/public/forgot-password') || currentPath.startsWith('/public/reset-password');


    if (isAuthenticated && user) { 
      if (user.role === 'officer') {
        if (!isOfficerPath) { // Officer is authenticated but not on a dashboard page
          router.push('/dashboard');
        }
      } else if (user.role === 'public') {
        if (isOfficerPath) { // Public user tries to access officer dashboard
          router.push('/public/home');
        } else if (isAuthPage) { // Authenticated public user on login page
          router.push('/public/home');
        }
      }
    } else { // User is NOT authenticated
      // Redirect to login IF:
      // 1. It's an officer path OR
      // 2. It's a path requiring public user auth
      // AND it's NOT the auth page itself AND it's NOT a password reset page.
      if (!isAuthPage && !isPasswordResetPage && (isOfficerPath || isPathRequiringPublicUserAuth)) {
        router.push('/auth');
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);


  const login = (email: string, passwordAttempt: string, intendedRole: UserRole) => {
  try {
    const users = getMockUsersDB();
    if (!email) {
      toast({ title: 'Login Failed', description: 'Email is required.', variant: 'destructive' });
      return;
    }

    const foundUser = users.find(u => 
      u?.email && // Add null check
      u.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser && foundUser.passwordHash === passwordAttempt) {
      if (foundUser.role !== intendedRole) {
        toast({ 
          title: 'Login Failed', 
          description: `Please use the ${intendedRole === 'officer' ? 'Officer' : 'Public User'} login tab.`, 
          variant: 'destructive' 
        });
        return;
      }

      const authenticatedUser: AuthenticatedUser = {
        email: foundUser.email,
        username: foundUser.username,
        role: foundUser.role
      };

      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
      toast({ title: 'Login Successful', description: `Welcome, ${authenticatedUser.username}!` });
    } else {
      toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
    }
  } catch (error) {
    console.error('Login error:', error);
    toast({ 
      title: 'Login Failed', 
      description: 'An unexpected error occurred. Please try again.', 
      variant: 'destructive' 
    });
  }
};

  const signUp = (username: string, email: string, passwordAttempt: string, confirmPasswordAttempt: string) => {
  try {
    // Validate inputs
    if (!email || !username || !passwordAttempt || !confirmPasswordAttempt) {
      toast({ 
        title: 'Sign Up Failed', 
        description: 'All fields are required.', 
        variant: 'destructive' 
      });
      return;
    }

    if (passwordAttempt !== confirmPasswordAttempt) {
      toast({ 
        title: 'Sign Up Failed', 
        description: 'Passwords do not match.', 
        variant: 'destructive' 
      });
      return;
    }

    const users = getMockUsersDB();
    
    // Add null check when checking for existing email
    if (users.some(u => u?.email && u.email.toLowerCase() === email.toLowerCase())) {
      toast({ 
        title: 'Sign Up Failed', 
        description: 'Email already registered.', 
        variant: 'destructive' 
      });
      return;
    }

    const newUser: StoredUser = {
      username,
      email,
      passwordHash: passwordAttempt,
      role: 'public'
    };
    users.push(newUser);
    saveMockUsersDB(users);

    const authenticatedUser: AuthenticatedUser = {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };
    
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authenticatedUser));
    
    toast({ 
      title: 'Sign Up Successful', 
      description: 'Your account has been created.' 
    });
    router.push('/public/home');
  } catch (error) {
    console.error('Sign up error:', error);
    toast({ 
      title: 'Sign Up Failed', 
      description: 'An unexpected error occurred. Please try again.', 
      variant: 'destructive' 
    });
  }
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
    if (newPass.length < 8) { 
      toast({ title: "Password Reset Failed", description: "New password must be at least 8 characters.", variant: "destructive" });
      return false;
    }
    if (!token.startsWith("RESET-")) { 
        toast({ title: "Password Reset Failed", description: "Invalid reset token format.", variant: "destructive" });
        return false;
    }

    let users = getMockUsersDB();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'public');

    if (userIndex === -1) {
      toast({ title: "Password Reset Failed", description: "Public user email not found.", variant: "destructive" });
      return false;
    }

    users[userIndex].passwordHash = newPass; 
    saveMockUsersDB(users);
    toast({ title: "Password Reset Successful", description: "You can now log in with your new password." });
    return true;
  };

  const updateUserProfile = async (updates: { username?: string }): Promise<boolean> => {
  try {
    if (!user) {
      toast({ title: 'Update Failed', description: 'You must be logged in to update your profile.', variant: 'destructive' });
      return false;
    }

    if (!updates.username || updates.username.trim() === '') {
      toast({ title: 'Update Failed', description: 'Username cannot be empty.', variant: 'destructive' });
      return false;
    }

    const users = getMockUsersDB();
    const userIndex = users.findIndex(u => u?.email && u.email.toLowerCase() === user.email.toLowerCase());

    if (userIndex === -1) {
      toast({ title: 'Update Failed', description: 'User not found.', variant: 'destructive' });
      return false;
    }

    // Check if username is already taken by another user
    const isUsernameTaken = users.some((u, index) => 
      index !== userIndex && 
      u?.username?.toLowerCase() === updates.username?.toLowerCase()
    );

    if (isUsernameTaken) {
      toast({ title: 'Update Failed', description: 'Username is already taken.', variant: 'destructive' });
      return false;
    }

    // Update the user in the mock DB
    users[userIndex] = {
      ...users[userIndex],
      username: updates.username
    };
    saveMockUsersDB(users);

    // Update the authenticated user in context
    const updatedUser: AuthenticatedUser = {
      ...user,
      username: updates.username
    };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    toast({ 
      title: 'Profile Updated', 
      description: 'Your username has been successfully updated.' 
    });
    return true;
  } catch (error) {
    console.error('Profile update error:', error);
    toast({ 
      title: 'Update Failed', 
      description: 'An unexpected error occurred. Please try again.', 
      variant: 'destructive' 
    });
    return false;
  }
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
    if (newPass.length < 8) { 
      toast({ title: "Password Change Failed", description: "New password must be at least 8 characters.", variant: "destructive" });
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


  if (isLoading && !pathname.startsWith('/public/terms-of-service') && !pathname.startsWith('/public/privacy-policy') && pathname !== '/') {
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
