'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

type UserRole = 'officer' | 'public';

interface AuthenticatedUser {
  id: string; // Supabase auth user ID
  email: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, passwordAttempt: string, intendedRole: UserRole) => Promise<void>;
  signUp: (username: string, email: string, passwordAttempt: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  user: AuthenticatedUser | null;
  updateUserProfile: (updates: { username?: string }) => Promise<boolean>;
  updateUserPassword: (newPass: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
}

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      const currentUser = session?.user;
      if (currentUser) {
        const { data: profile, error } = await supabase
          .from('profile')
          .select('role, username')
          .eq('auth_id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          await supabase.auth.signOut();
          setUser(null);
        } else if (profile) {
          setUser({
            id: currentUser.id,
            email: currentUser.email!,
            role: profile.role as UserRole,
            username: profile.username,
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

<<<<<<< HEAD
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
=======
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
>>>>>>> master

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user;
    const currentPath = pathname;

    if (currentPath === '/' || currentPath.startsWith('/public/terms-of-service') || currentPath.startsWith('/public/privacy-policy')) {
      return;
    }

    const isOfficerPath = currentPath.startsWith('/dashboard');
    const isPathRequiringPublicUserAuth = publicUserAuthenticatedPaths.some(p => currentPath.startsWith(p));
    const isAuthPage = currentPath === '/auth';
    const isPasswordResetPage = currentPath.startsWith('/public/forgot-password') || currentPath.startsWith('/public/reset-password');

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

<<<<<<< HEAD
  const login = async (email: string, passwordAttempt: string, intendedRole: UserRole) => {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: passwordAttempt,
    });

    if (loginError || !loginData.user) {
      toast({ title: 'Login Failed', description: loginError?.message || 'Invalid credentials.', variant: 'destructive' });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('role, username')
      .eq('auth_id', loginData.user.id)
      .single();

    if (profileError || !profile) {
      toast({ title: 'Login Failed', description: 'Could not retrieve user profile.', variant: 'destructive' });
      await supabase.auth.signOut();
      return;
    }

    if (profile.role !== intendedRole) {
      toast({ title: 'Login Failed', description: `Please use the correct login tab for your role.`, variant: 'destructive' });
      await supabase.auth.signOut();
      return;
    }

    toast({ title: 'Login Successful', description: `Welcome, ${profile.username}!` });
  };
=======

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
>>>>>>> master

  const signUp = async (username: string, email: string, passwordAttempt: string) => {
    // First check if a user with this email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('profile')
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

    // If email is not in use, proceed with sign up
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
      toast({ 
        title: 'Sign Up Failed', 
        description: error.message, 
        variant: 'destructive' 
      });
      return;
    }

    if (data.user) {
      toast({ 
        title: 'Sign Up Successful', 
        description: 'Your account has been created. Please check your email to confirm your account.' 
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/public/reset-password`,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Password reset link sent. Please check your email.' });
    return true;
  };

  const updateUserPassword = async (newPass: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Password Updated', description: 'Your password has been successfully updated.' });
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

<<<<<<< HEAD
    const { error } = await supabase
      .from('profile')
      .update({ username: updates.username })
      .eq('auth_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      return false;
    }

    setUser({ ...user, ...updates });
    toast({ title: 'Success', description: 'Your profile has been updated.' });
=======
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
>>>>>>> master
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

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    login,
    signUp,
    logout,
    isLoading,
    updateUserProfile,
    updateUserPassword,
    sendPasswordResetEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
