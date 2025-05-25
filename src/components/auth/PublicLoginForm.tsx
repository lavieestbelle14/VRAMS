
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

const publicLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }), // Kept for structural similarity, can be adapted later
});

type PublicLoginFormValues = z.infer<typeof publicLoginSchema>;

export function PublicLoginForm() {
  const { login } = useAuth();
  const form = useForm<PublicLoginFormValues>({
    resolver: zodResolver(publicLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: PublicLoginFormValues) {
    login({ username: data.email, role: 'public' });
  }

  return (
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Button>
         <p className="text-xs text-center text-muted-foreground pt-2">
            Login to check application status (feature coming soon).
          </p>
      </form>
    </Form>
  );
}
