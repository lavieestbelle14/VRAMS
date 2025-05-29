
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// This is a mock user store check. In a real app, this would be a backend call.
const USERS_DB_KEY = 'vrams_users_db';
const getMockUsersDB = (): { username: string, role: string }[] => {
  if (typeof window === 'undefined') return [];
  const db = localStorage.getItem(USERS_DB_KEY);
  return db ? JSON.parse(db) : [];
};

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [mockToken, setMockToken] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setMockToken(null);
    setSubmittedEmail(null);
    const users = getMockUsersDB();
    const userExists = users.some(u => u.username.toLowerCase() === data.email.toLowerCase() && u.role === 'public');

    if (userExists) {
      // Simulate token generation
      const token = `RESET-${data.email.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-4)}`;
      setMockToken(token);
      setSubmittedEmail(data.email);
      toast({
        title: 'Reset Token Generated (Mock)',
        description: 'Please copy the token and use it on the reset password page.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Public user email not found in our records.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a mock reset token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!mockToken ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  <Mail className="mr-2 h-4 w-4" /> Request Reset Token
                </Button>
              </form>
            </Form>
          ) : (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>Mock Reset Token Generated!</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>A mock reset token has been generated for: <strong>{submittedEmail}</strong></p>
                <p>Your mock token is: <strong className="text-lg font-mono bg-muted px-2 py-1 rounded">{mockToken}</strong></p>
                <p>Please copy this token and use it on the reset password page.</p>
                <Button asChild className="w-full mt-2">
                  <Link href={`/public/reset-password?email=${encodeURIComponent(submittedEmail || '')}&token=${encodeURIComponent(mockToken)}`}>Proceed to Reset Password</Link>
                </Button>
                 <Button variant="outline" className="w-full mt-2" onClick={() => { setMockToken(null); setSubmittedEmail(null); form.reset(); }}>
                  Request for another email
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="text-sm text-center mt-4">
            <Link href="/" legacyBehavior>
              <a className="font-medium text-primary hover:underline flex items-center justify-center">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
