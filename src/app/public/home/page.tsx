
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, CheckSquare, UserCircle } from 'lucide-react'; // Added icons
import { useAuth } from '@/contexts/AuthContext';

export default function PublicHomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
             <UserCircle className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Welcome, {user?.username || 'Valued Citizen'}!</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your gateway to voter registration services.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            This portal allows you to manage your voter registration information and track your application status.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/public/track-status" passHref>
              <Button size="lg" className="w-full sm:w-auto">
                <FileSearch className="mr-2 h-5 w-5" /> Track Your Application
              </Button>
            </Link>
            {/* Placeholder for future "My Profile" or other features */}
            {/* <Button size="lg" variant="outline" className="w-full sm:w-auto" disabled>
              <UserCircle className="mr-2 h-5 w-5" /> View My Profile (Soon)
            </Button> */}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSearch className="h-6 w-6 text-primary" />
              <CardTitle>Application Status Tracker</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Easily check the current status of your voter registration application using your unique application ID.
            </p>
            <Link href="/public/track-status" passHref>
              <Button variant="secondary">
                Go to Tracker <CheckSquare className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM19.535 7.523L12 11.618L4.465 7.523L12 3.382L19.535 7.523ZM4 16.11V9.036L11 12.833V19.618L4 16.11ZM13 19.618V12.833L20 9.036V16.11L13 19.618Z" />
              </svg>
              <CardTitle>About VRAMS</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The Voter Registration and Application Management System (VRAMS) aims to streamline the voter application process, making it more accessible and efficient for everyone. We are committed to ensuring a transparent and secure registration experience.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
