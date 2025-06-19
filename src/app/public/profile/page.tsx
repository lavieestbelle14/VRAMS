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
import { useRouter } from 'next/navigation';
import VoterIdCard from "@/components/profile/VoterIDCard";
import { AcknowledgementReceipt } from "@/components/public/AcknowledgementReceipt";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
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
  const router = useRouter();

  const profileForm = useForm<ProfileFormValues>({
  resolver: zodResolver(profileSchema),
  defaultValues: {
    username: '',
    email: '',
  },
});

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const [showOld, setShowOld] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
  if (user) {
    profileForm.reset({
      username: user.username || '',
      email: user.email || '', // Use the email from user object instead of username
    });
  }
}, [user, profileForm]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
  const success = await updateUserProfile({ username: data.username });
  if (success) {
    toast({ title: "Profile Updated", description: "Your username has been saved." });
  } else {
    toast({ title: "Update Failed", description: "Could not update profile. Please try again.", variant: "destructive" });
  }
};

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    const success = await updateUserPassword(data.oldPassword, data.newPassword);
    if (success) {
      passwordForm.reset();
    }
  };

  if (authLoading) {
    return <div className="flex h-full items-center justify-center"><p>Loading...</p></div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
        <Button onClick={() => router.push('/auth')}>Go to Login</Button>
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
                <Input
                  placeholder="user@example.com"
                  readOnly
                  className="bg-muted opacity-60 cursor-not-allowed"
                  {...field}
                />
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
    <CardTitle className="flex items-center">
      Precinct & Voter Info
    </CardTitle>
    <CardDescription>
      Your assigned precinct and voter ID (if any).
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-500">Precinct Number:</span>
        <p className="font-medium">
          {user?.precinct || "1234A (mock)"}
        </p>
      </div>
      <div>
        <span className="text-gray-500">Voter ID Number:</span>
        <p className="font-medium">
          {user?.voterId || "VIN-00000001 (mock)"}
        </p>
      </div>
    </div>
  </CardContent>
</Card>

<VoterIdCard />


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Lock className="mr-2 h-5 w-5 text-primary" /> Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showOld ? "text" : "password"} placeholder="Enter old password" {...field} />
                        <button type="button" className="absolute right-2 top-2 text-xs" onClick={() => setShowOld(v => !v)}>{showOld ? 'Hide' : 'Show'}</button>
                      </div>
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
                      <div className="relative">
                        <Input type={showNew ? "text" : "password"} placeholder="A strong new password" {...field} />
                        <button type="button" className="absolute right-2 top-2 text-xs" onClick={() => setShowNew(v => !v)}>{showNew ? 'Hide' : 'Show'}</button>
                      </div>
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
                      <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} placeholder="Confirm the new password" {...field} />
                        <button type="button" className="absolute right-2 top-2 text-xs" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? 'Hide' : 'Show'}</button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
