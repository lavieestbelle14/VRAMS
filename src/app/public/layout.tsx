
'use client';
import type { ReactNode } from 'react';
import { PublicAppShell } from '@/components/layout/PublicAppShell'; // Changed to PublicAppShell
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) { // Renamed to PublicLayout
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We don't want to check anything until Supabase has checked the session.
    if (isLoading) {
      return;
    }

    // If auth is loaded and the user is not authenticated or not the right role, redirect.
    if (!isAuthenticated || user?.role !== 'public') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // While loading, or if the user is not authenticated (and about to be redirected),
  // show a loading screen. This prevents rendering children with incorrect state.
  if (isLoading || !isAuthenticated || user?.role !== 'public') {
    return (
      <div className="flex h-screen items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return <PublicAppShell>{children}</PublicAppShell>; // Using PublicAppShell
}
