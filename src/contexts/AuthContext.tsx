'use client';

import type { ReactNode, FC } from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// ---- TYPE DEFINITIONS ---- //

type UserRole = 'officer' | 'public';

interface AuthenticatedUser {
  id: string; // Supabase auth user ID
  email: string;
  voterId?: string;
  precinct?: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, passwordAttempt: string) => Promise<void>;
  signUp: (username: string, email: string, passwordAttempt: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  user: AuthenticatedUser | null;
  updateUserProfile: (updates: { username?: string }) => Promise<boolean>;
  updateUserPassword: (newPass: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
}

// ---- CONTEXT CREATION ---- //

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicUserAuthenticatedPaths = [
  '/public/home',
  '/public/apply',
  '/public/track-status',
  '/public/application-submitted',
  '/public/profile',
  '/public/faq',
  '/public/schedule-biometrics'
];

// ---- AUTH PROVIDER COMPONENT ---- //

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // New function to handle URL hash after email confirmation
  const handleEmailConfirmation = useCallback(async () => {
    // Only run this in the browser
    if (typeof window === 'undefined') return;
    
    // Check if we have a hash in the URL (typically after email confirmation)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      try {
        // Supabase automatically parses the hash, but we need to trigger a session check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Show success toast
          toast({ 
            title: 'Email Verified!', 
            description: 'Your email has been verified successfully.',
          });
          
          // Clean up the URL by removing the hash
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // If user confirmed their email but hasn't completed profile setup
          // handle that here (if needed)
        }
      } catch (error) {
        console.error('Error handling email confirmation:', error);
        toast({ 
          title: 'Verification Error', 
          description: 'There was an error verifying your email.',
          variant: 'destructive' 
        });
      }
    }
  }, [toast]);

  const handleSession = useCallback(async (session: Session | null) => {
    const supabaseUser = session?.user;
    if (supabaseUser) {
      const { data: appUser, error } = await supabase
        .from('app_user')
        .select('role, username')
        .eq('auth_id', supabaseUser.id)
        .single();

      if (error || !appUser) {
        console.error('Error fetching user or user not found:', error);
        // Don't sign out here, just clear local state
        setUser(null);
      } else {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          role: appUser.role as UserRole,
          username: appUser.username,
        });
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // When user signs in (including after email verification), clean up the URL
      if (event === 'SIGNED_IN') {
        // Remove tokens from URL by replacing the current state with just the pathname
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      handleSession(session);
    });

    // Proactively sync on tab focus
    const handleFocus = () => getInitialSession();
    window.addEventListener('focus', handleFocus);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleSession]);

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user;
    
    if (pathname === '/' || pathname.startsWith('/public/terms-of-service') || pathname.startsWith('/public/privacy-policy')) {
      return;
    }

    const isOfficerPath = pathname.startsWith('/dashboard');
    const isPathRequiringPublicUserAuth = publicUserAuthenticatedPaths.some(p => pathname.startsWith(p));
    const isAuthPage = pathname === '/auth';
    const isPasswordResetPage = pathname.startsWith('/public/forgot-password') || pathname.startsWith('/public/reset-password');

    if (isAuthenticated) {
      if (user.role === 'officer') {
        if (!isOfficerPath) router.push('/dashboard');
      } else if (user.role === 'public') {
        if (isOfficerPath || isAuthPage) router.push('/public/home');
      }
    } else {
      if (!isAuthPage && !isPasswordResetPage && (isOfficerPath || isPathRequiringPublicUserAuth)) {
        router.push('/auth');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = useCallback(async (email: string, passwordAttempt: string) => {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: passwordAttempt,
    });

    if (loginError || !loginData.user) {
      toast({ title: 'Login Failed', description: loginError?.message || 'Invalid credentials.', variant: 'destructive' });
      return;
    }
    
    const { data: appUser, error: userError } = await supabase
      .from('app_user')
      .select('role, username')
      .eq('auth_id', loginData.user.id)
      .single();

    if (userError || !appUser) {
      toast({ title: 'Login Failed', description: 'Could not retrieve user profile.', variant: 'destructive' });
      await supabase.auth.signOut();
      return;
    }

    toast({ title: 'Login Successful', description: `Welcome, ${appUser.username}!` });
  }, [toast]);

  const signUp = useCallback(async (username: string, email: string, passwordAttempt: string) => {
    const { data: existingUsers, error: checkError } = await supabase
      .from('app_user')
      .select('email')
      .eq('email', email);

    if (checkError) {
      toast({ title: 'Error', description: 'An error occurred while checking existing accounts.', variant: 'destructive' });
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      toast({ 
        title: 'Account Exists', 
        description: 'An account with this email already exists. Please log in instead.', 
        variant: 'destructive' 
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwordAttempt,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) {
      toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
      return;
    }

    if (data.user) {
      toast({ title: 'Sign Up Successful', description: 'Your account has been created. Please check your email to confirm your account.' });
    }
  }, [toast]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  }, [router]);

  const sendPasswordResetEmail = useCallback(async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/public/reset-password`,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Password reset link sent. Please check your email.' });
    return true;
  }, [toast]);

  const updateUserPassword = useCallback(async (newPass: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Password Updated', description: 'Your password has been successfully updated.' });
    return true;
  }, [toast]);

  const updateUserProfile = useCallback(async (updates: { username?: string }): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('app_user')
      .update({ username: updates.username })
      .eq('auth_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      return false;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    handleSession(session);
    
    toast({ title: 'Success', description: 'Your profile has been updated.' });
    return true;
  }, [user, handleSession, toast]);

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    signUp,
    logout,
    updateUserProfile,
    updateUserPassword,
    sendPasswordResetEmail,
  }), [user, isLoading, login, signUp, logout, updateUserProfile, updateUserPassword, sendPasswordResetEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---- HOOK EXPORT ---- //

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

