'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { clearCorruptedSession } from '@/lib/auth-recovery';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function AuthRecoveryButton() {
  const [isClearing, setIsClearing] = useState(false);
  const { refreshUser } = useAuth();

  const handleClearSession = async () => {
    setIsClearing(true);
    try {
      const success = await clearCorruptedSession();
      if (success) {
        toast({
          title: 'Session Cleared',
          description: 'Please try logging in again.',
        });
        // Refresh the page to start fresh
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: 'Could not clear session. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">Authentication Issue Detected</span>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        If you're experiencing login issues, try clearing your session data.
      </p>
      <Button
        variant="outline"
        onClick={handleClearSession}
        disabled={isClearing}
        className="flex items-center gap-2"
      >
        <RefreshCcw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
        {isClearing ? 'Clearing...' : 'Clear Session & Retry'}
      </Button>
    </div>
  );
}
