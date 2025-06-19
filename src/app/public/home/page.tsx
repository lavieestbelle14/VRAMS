'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, FileSearch, Calendar, Info, MapPin, ClipboardList, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function PublicHomePage() {
  const { user } = useAuth();
  const router = useRouter();

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
          </p>
        </CardContent>
      </Card>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FilePlus2 className="mr-2 h-6 w-6 text-primary" />
              Submit New Application
            </CardTitle>
            <CardDescription>
              Fill out and submit your voter registration form online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/public/apply">Go to Application Form</Link>
            </Button>
          </CardContent>
        </Card>

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