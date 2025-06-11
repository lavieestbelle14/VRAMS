
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Link from 'next/link'; // Import Link

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email(), // Email is display-only, not editable here
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PublicProfilePage() {
  const { user, updateUserProfile, updateUserPassword, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  const profileForm = useForm<ProfileFormValues>({
  resolver: zodResolver(profileSchema),
  defaultValues: {
    username: '',
    email: '',
  },
});

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
  if (user) {
    profileForm.reset({
      username: user.username || '',
      email: user.email || '', // Use the email from user object instead of username
    });
  }
}, [user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
  const success = await updateUserProfile({ username: data.username });
  if (success) {
    toast({ title: "Profile Updated", description: "Your username has been saved." });
  } else {
    toast({ title: "Update Failed", description: "Could not update profile. Please try again.", variant: "destructive" });
  }
};

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    const success = await updateUserPassword(data.currentPassword, data.newPassword, data.confirmNewPassword);
    if (success) {
      passwordForm.reset();
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
    } else {
      // Specific error toasts are handled in AuthContext, but a general one can be here if needed.
      // toast({ title: "Password Change Failed", description: "Please check your input and try again.", variant: "destructive" });
    }
  };
  
  if (authLoading) {
    return <div className="flex h-full items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
            <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <Card>
  <CardHeader>
    <CardTitle className="flex items-center">
      <User className="mr-2 h-5 w-5 text-primary" /> User Information
    </CardTitle>
    <CardDescription>Update your username. Email is not editable here.</CardDescription>
  </CardHeader>
  <CardContent>
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
        <FormField
          control={profileForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={profileForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} readOnly className="bg-muted/50 cursor-not-allowed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={profileForm.formState.isSubmitting}>
          {profileForm.formState.isSubmitting ? 
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> : 
          <Save className="mr-2 h-4 w-4" />}
          Save Profile Changes
        </Button>
      </form>
    </Form>
  </CardContent>
</Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5 text-primary" /> Change Password</CardTitle>
          <CardDescription>Update your account password. Make sure it's strong and memorable.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? 
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 
                 <Save className="mr-2 h-4 w-4" />}
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
