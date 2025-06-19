
'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { UnifiedLoginForm } from '@/components/auth/UnifiedLoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AuthPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const logoSrc = "/vrams_logo.png";

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?tab=${value}`);
  };

  const validTabs = ['login', 'sign-up'];
  const initialTab = validTabs.includes(tab || '') ? tab : 'login';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-primary"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Go to Homepage
      </Button>
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
        <h1 className="text-4xl font-bold text-primary">eRehistroPh Portal</h1>
        <p className="text-muted-foreground mt-2">Voter Registration and Application Management System</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Access Your Account</CardTitle>
          <CardDescription className="text-center">Login or sign up to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={initialTab || 'login'} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-4">
              <UnifiedLoginForm />
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
