
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicLoginForm } from '@/components/auth/PublicLoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const logoSrc = "/vrams_logo.png"; 

  const validTabs = ['officer-login', 'public-login', 'sign-up'];
  const initialTab = validTabs.includes(tab || '') ? tab : 'public-login';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
            <Image
              src={logoSrc}
              alt="VRAMS official seal"
              width={64}
              height={64}
              data-ai-hint="VRAMS official seal"
            />
        </div>
        <h1 className="text-4xl font-bold text-primary">VRAMS Portal</h1>
        <p className="text-muted-foreground mt-2">Voter Registration and Application Management System</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Access Your Account</CardTitle>
          <CardDescription className="text-center">Login or sign up to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={initialTab || 'public-login'} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="officer-login">Officer Login</TabsTrigger>
              <TabsTrigger value="public-login">Public Login</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="officer-login" className="pt-4">
              <LoginForm />
            </TabsContent>
            <TabsContent value="public-login" className="pt-4">
              <PublicLoginForm />
            </TabsContent>
            <TabsContent value="sign-up" className="pt-4">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
