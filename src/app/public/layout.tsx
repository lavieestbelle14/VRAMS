
'use client';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'public') {
        router.push('/'); // Redirect to main login if not authenticated as public user
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
     return <div className="flex h-screen items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
   </svg></div>;
  }

  if (!isAuthenticated || user?.role !== 'public') {
    return null; 
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <Link href="/public/home" className="flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM19.535 7.523L12 11.618L4.465 7.523L12 3.382L19.535 7.523ZM4 16.11V9.036L11 12.833V19.618L4 16.11ZM13 19.618V12.833L20 9.036V16.11L13 19.618Z" />
          </svg>
          <span className="text-xl font-semibold">Public Portal</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.username || <UserCircle size={20} />}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        {children}
      </main>
      <footer className="py-4 px-4 sm:px-6 border-t text-center text-sm text-muted-foreground">
        VRAMS Public Access &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
