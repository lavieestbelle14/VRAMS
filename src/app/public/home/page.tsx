
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, FilePlus2, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PublicHomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserCircle className="h-10 w-10" />
            <div>
              <CardTitle className="text-3xl">Welcome, {user?.firstName || 'User'}!</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg">
                Your gateway to voter registration services.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p>
            Here you can submit a new voter registration application or track the status of your existing applications.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FilePlus2 className="mr-3 h-6 w-6 text-primary" />
              Submit New Application
            </CardTitle>
            <CardDescription>
              Fill out and submit your voter registration form online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/public/apply">Go to Application Form</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileSearch className="mr-3 h-6 w-6 text-primary" />
              Track Application Status
            </CardTitle>
            <CardDescription>
              Check the current status of your submitted application using your reference ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/public/track-status">Track My Application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
