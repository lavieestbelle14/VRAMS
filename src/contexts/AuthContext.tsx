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
  updateUserPassword: (oldPass: string, newPass: string) => Promise<boolean>;
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
    try {
      // Add explicit logging to see what's happening
      console.log('Processing session for user:', supabaseUser.id);
      
      // Try to fetch the user profile - DON'T use single() initially to avoid errors
      const { data: appUsers, error: fetchError } = await supabase
        .from('app_user')
        .select('role, username')
        .eq('auth_id', supabaseUser.id);

      // Log what we got back
      console.log('Fetch result:', { appUsers, fetchError });

      // If there's an error in the fetch itself
      if (fetchError) {
        console.error('Database error fetching user:', fetchError.message, fetchError);
        toast({ 
          title: 'Database Error', 
          description: 'Could not connect to the user database. Please try again later.',
          variant: 'destructive' 
        });
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check if we found a user profile
      if (!appUsers || appUsers.length === 0) {
        console.error(`No user profile found for auth_id: ${supabaseUser.id}`);
        
        // Check if we can auto-create the profile
        if (supabaseUser.email) {
          console.log('Attempting to create user profile automatically');
          
          // Extract username from email or metadata
          const username = supabaseUser.user_metadata?.username || 
                          supabaseUser.email.split('@')[0];
          
          // Create a profile for this authenticated user
          const { data: newProfile, error: insertError } = await supabase
            .from('app_user')
            .insert([
              { 
                auth_id: supabaseUser.id, 
                email: supabaseUser.email,
                username: username,
                role: 'public', // Default role for auto-created users
                created_at: new Date().toISOString()
              }
            ])
            .select('role, username')
            .single();
          
          console.log('Profile creation result:', { newProfile, insertError });
          
          if (insertError) {
            console.error('Failed to create user profile:', insertError.message, insertError);
            toast({ 
              title: 'Profile Error', 
              description: 'Could not create your user profile. Please contact support.',
              variant: 'destructive' 
            });
            setUser(null);
          } else if (newProfile) {
            console.log('User profile created successfully:', newProfile);
            // Set the user with the newly created profile
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email,
              role: newProfile.role as UserRole,
              username: newProfile.username,
            });
            
            toast({ 
              title: 'Profile Created', 
              description: 'Your profile has been set up.'
            });
          }
        } else {
          // Not enough information to create a profile
          console.error('Cannot auto-create profile: missing email address');
          toast({ 
            title: 'Profile Error', 
            description: 'Your account information is incomplete. Please contact support.',
            variant: 'destructive' 
          });
          setUser(null);
        }
      } else if (appUsers.length > 1) {
        // Handle multiple profiles (should not happen with proper DB constraints)
        console.error(`Multiple profiles found for auth_id ${supabaseUser.id}`);
        toast({ 
          title: 'Profile Error', 
          description: 'Multiple profiles were found for your account. Please contact support.',
          variant: 'destructive' 
        });
        setUser(null);
      } else {
        // Success case - exactly one user found
        const appUser = appUsers[0];
        console.log('User profile found:', appUser);
        
            const userData = {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: appUser.role as UserRole,
      username: appUser.username,
    };
    
    setUser(userData);
    return userData; // Return the user data
  }
    } catch (unexpectedError) {
      // Handle any other unexpected errors
      console.error('Unexpected error in session handling:', unexpectedError);
      toast({ 
        title: 'System Error', 
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive' 
      });
      setUser(null);
    }
  } else {
    console.log('No active session or user');
    setUser(null);
  }
  return null; // Return null in all other cases where we didn't return earlier
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
      emailRedirectTo: `${window.location.origin}/auth`, // Ensure redirect is set correctly
    },
  });

  if (error) {
    toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
    return;
  }

  if (data.user) {
    // Immediately create the user profile in the app_user table
    try {
      const { error: profileError } = await supabase
        .from('app_user')
        .insert([
          { 
            auth_id: data.user.id, 
            email: email,
            username: username,
            role: 'public', // Default role
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // We still show success because auth signup succeeded
        // The profile will be auto-created when they verify email
      }
    } catch (err) {
      console.error('Unexpected error creating profile:', err);
    }
    
    toast({ 
      title: 'Sign Up Successful', 
      description: 'Your account has been created. Please check your email to confirm your account.' 
    });
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

  const updateUserPassword = useCallback(async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!user) return false;
    // If oldPass is provided, require re-authentication (profile change)
    if (oldPass) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPass,
      });
      if (signInError) {
        toast({ title: 'Incorrect Old Password', description: signInError.message, variant: 'destructive' });
        return false;
      }
    }
    // Update password (for both reset and profile change)
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Password Updated', description: 'Your password has been successfully updated.' });
    return true;
  }, [toast, user]);

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

  // Add the login function
const login = useCallback(async (email: string, passwordAttempt: string): Promise<void> => {
  setIsLoading(true);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: passwordAttempt,
  });

  if (error) {
    toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    setIsLoading(false);
    return;
  }

  if (data.session) {
    // Modify handleSession to return the user object
    const userData = await handleSession(data.session);
    toast({ title: 'Login Successful', description: 'You have been logged in.' });
    
    // Use the returned userData instead of the state variable
    const redirectTo = userData?.role === 'officer' ? '/dashboard' : '/public/home';
    
    if (pathname === '/auth' || 
        pathname === '/' || 
        pathname === '/landing' || 
        (userData?.role === 'public' && !publicUserAuthenticatedPaths.includes(pathname)) ||
        (userData?.role === 'officer' && pathname.startsWith('/public/'))) {
      router.push(redirectTo);
    }
  }
  setIsLoading(false);
}, [toast, handleSession, router, pathname]);

useEffect(() => {
  if (!isLoading) {
    // If authenticated
    if (user) {
      // If officer is trying to access public pages
      if (user.role === 'officer' && pathname.startsWith('/public/')) {
        router.push('/dashboard');
      }
      // If public user is trying to access officer pages
      else if (user.role === 'public' && pathname.startsWith('/dashboard')) {
        router.push('/public/home');
      }
    } 
    // If not authenticated and trying to access protected pages
    else if (!user && 
             pathname !== '/auth' && 
             pathname !== '/' && 
             pathname !== '/landing' &&
             !pathname.includes('/reset-password')) {
      router.push('/auth');
    }
  }
}, [user, isLoading, pathname, router]);

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

