
'use client';
import { LoginForm } from '@/components/auth/LoginForm';
import { PublicLoginForm } from '@/components/auth/PublicLoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm'; // Import SignUpForm
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() { // Renamed to AuthPage for clarity
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16 text-primary">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM19.535 7.523L12 11.618L4.465 7.523L12 3.382L19.535 7.523ZM4 16.11V9.036L11 12.833V19.618L4 16.11ZM13 19.618V12.833L20 9.036V16.11L13 19.618Z" />
            </svg>
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
          <Tabs defaultValue="public-login" className="w-full">
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
