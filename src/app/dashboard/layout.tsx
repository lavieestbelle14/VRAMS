
'use client'; // Required for AppShell and auth checks
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth(); // Added user here
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not loading, and either not authenticated or user is not an officer
      if (!isAuthenticated || user?.role !== 'officer') {
        router.push('/'); // Redirect to login
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
     return <div className="flex h-screen items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
   </svg></div>;
  }

  // Also check user role here before rendering
  if (!isAuthenticated || user?.role !== 'officer') {
    // This helps prevent flash of content before redirect effect runs
    return null; 
  }

  return <AppShell>{children}</AppShell>;
}
