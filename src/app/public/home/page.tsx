'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FilePlus2, FileSearch, Calendar, Info, MapPin, ClipboardList, ShieldCheck, BookOpen, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function PublicHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hasApprovedRegistration, setHasApprovedRegistration] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Use the registration status from AuthContext instead of making separate queries
    const hasApprovedReg = user.registrationStatus === 'approved';
    setHasApprovedRegistration(hasApprovedReg);
    setIsLoading(false);
  }, [user]);

  // New users (no approved registration) can apply for registration
  // Users with approved registration can apply for other types (transfer, reactivation, etc.)
  const canApplyForRegistration = hasApprovedRegistration !== true;
  const canApplyForOtherTypes = hasApprovedRegistration === true;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome, {user?.username || 'Voter'}!
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 text-lg">
            Your gateway to voter application services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-primary-foreground/80">
            Here you can submit a new voter registration application, track existing applications, 
            and access important voting information.
          </p>        </CardContent>
      </Card>      {/* Pending Registration Notice */}
      {user?.registrationStatus && ['pending', 'verified'].includes(user.registrationStatus) && (
        <Card className="shadow-md border-t-4 border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-yellow-800">
              <Clock className="mr-2 h-6 w-6 text-yellow-600" />
              Registration Application Pending
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Your registration application is currently being reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent>            <p className="text-yellow-700 mb-4">
              You have successfully submitted your voter registration application. Please wait for approval before submitting other applications.
            </p>
            <Button asChild variant="outline" className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100">
              <Link href="/public/track-status">Check Application Status</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {canApplyForRegistration ? (
          <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FilePlus2 className="mr-2 h-6 w-6 text-primary" />
                Submit Registration Application
              </CardTitle>
              <CardDescription>
                Register as a new voter. This is your first step to participate in elections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/public/apply">Start Registration</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FilePlus2 className="mr-2 h-6 w-6 text-primary" />
                Submit New Application
              </CardTitle>
              <CardDescription>
                Submit transfer, reactivation, or other voter applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/public/apply">Go to Application Form</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileSearch className="mr-2 h-6 w-6 text-primary" />
              Track Application Status
            </CardTitle>
            <CardDescription>
              Check the current status of your submitted application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/public/track-status">Track My Application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Cards - Replaced Pinned Applications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Election Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View important election dates and registration deadlines.
            </p>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/public/election-calendar">View Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
              Voter's Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Learn about your rights and responsibilities as a voter.
            </p>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/public/voter-guide">Read Guide</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Election Laws
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Access important election laws and regulations.
            </p>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/public/election-laws">View Laws</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Help Section */}
      <Card className="shadow-md border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Info className="mr-2 h-6 w-6 text-primary" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Contact Information</h3>
              <p className="text-muted-foreground text-sm">
                Phone: 1-800-VOTE-NOW<br />
                Email: help@voteregistration.gov<br />
                Hours: Mon-Fri, 8am-6pm
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
              <p className="text-muted-foreground text-sm">
                Get answers to common questions about voter registration.
              </p>
              <Button variant="link" className="pl-0 mt-2" asChild>
                <Link href="/public/faq">View FAQ</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}