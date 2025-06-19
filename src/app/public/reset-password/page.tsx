'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { updateUserPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
    // If there is an access_token or type param, try to exchange for a session
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');
    if (accessToken && type === 'recovery') {
      setSessionLoading(true);
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(({ error }) => {
          if (error) {
            setSessionError(error.message);
          }
          setSessionLoading(false);
        });
    }
  }, [searchParams]);

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsLoading(true);
    const success = await updateUserPassword('', data.newPassword);
    setIsLoading(false);
    if (success) {
      await supabase.auth.signOut();
      router.push('/auth'); // Redirect to login page on successful password reset
    }
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Reset Password Error</CardTitle>
            <CardDescription className="text-center text-red-500">{sessionError}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verifying Link…</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your reset link.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/vrams_logo.png"
            alt="VRAMS official seal"
            width={64}
            height={64}
            style={{ display: 'inline-block' }}
          />
        </div>
        <h1 className="text-4xl font-bold text-primary">eRehistroPh Portal</h1>
        <p className="text-muted-foreground mt-2">Voter Registration and Application Management System</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showNew ? "text" : "password"} placeholder="••••••••" {...field} />
                        <button type="button" className="absolute right-2 top-2 text-xs" onClick={() => setShowNew(v => !v)}>{showNew ? 'Hide' : 'Show'}</button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} placeholder="••••••••" {...field} />
                        <button type="button" className="absolute right-2 top-2 text-xs" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? 'Hide' : 'Show'}</button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Reset Password
              </Button>
            </form>
          </Form>
          <div className="text-sm text-center mt-4">
            <Link href="/auth" className="font-medium text-primary hover:underline flex items-center justify-center">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

