
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, FileSearch, User, Pin, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function PublicHomePage() {
  const { user } = useAuth();
  const router = useRouter(); // Initialize useRouter
  const [pinnedApplications, setPinnedApplications] = useState<string[]>([]);

  const getPinnedApplicationsKey = () => {
    return user ? `pinned_applications_${user.username}` : null;
  };

  useEffect(() => {
    const key = getPinnedApplicationsKey();
    if (key && typeof window !== 'undefined') {
      const storedPinned = localStorage.getItem(key);
      if (storedPinned) {
        setPinnedApplications(JSON.parse(storedPinned));
      }
    }
  }, [user]);

  const unpinApplication = (appId: string) => {
    const key = getPinnedApplicationsKey();
    if (key && typeof window !== 'undefined') {
      const updatedPinned = pinnedApplications.filter(id => id !== appId);
      localStorage.setItem(key, JSON.stringify(updatedPinned));
      setPinnedApplications(updatedPinned);
    }
  };

  const handleViewPinnedApp = (appId: string) => {
    router.push(`/public/track-status?id=${appId}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome, {user?.username || 'Voter'}!
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 text-lg">
            Your gateway to voter registration services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-primary-foreground/80">
            Here you can submit a new voter registration application or track the status of your existing applications.
          </p>
        </CardContent>
      </Card>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
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
            <Button asChild className="w-full">
              <Link href="/public/apply">Go to Application Form</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileSearch className="mr-2 h-6 w-6 text-primary" />
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

      {/* Pinned Applications Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Pin className="mr-2 h-6 w-6 text-primary" />
            Pinned Applications
          </CardTitle>
          <CardDescription>
            Quick access to your saved application references.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pinnedApplications.length > 0 ? (
            <ul className="space-y-3">
              {pinnedApplications.map((appId) => (
                <li key={appId} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center">
                    <LinkIcon className="mr-2 h-5 w-5 text-primary/80" />
                    <span className="font-medium">{appId}</span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPinnedApp(appId)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unpinApplication(appId)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Unpin
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              You haven't pinned any applications yet. You can pin an application from the submission confirmation page or the status tracking page.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
