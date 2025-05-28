
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FileSearch, FilePlus2, PinOff, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const getPinnedApplicationsKey = (username: string | undefined) => {
  if (!username) return null;
  return `pinned_applications_${username}`;
};

export default function PublicHomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pinnedApplications, setPinnedApplications] = useState<string[]>([]);

  const loadPinnedApplications = () => {
    if (user && user.username) {
      const key = getPinnedApplicationsKey(user.username);
      if (key) {
        const storedPinnedApps = JSON.parse(localStorage.getItem(key) || '[]');
        setPinnedApplications(storedPinnedApps);
      }
    }
  };

  useEffect(() => {
    loadPinnedApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUnpin = (appId: string) => {
    if (user && user.username) {
      const key = getPinnedApplicationsKey(user.username);
      if (!key) return;

      let pinnedApps: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      pinnedApps = pinnedApps.filter(id => id !== appId);
      localStorage.setItem(key, JSON.stringify(pinnedApps));
      setPinnedApplications(pinnedApps);
      toast({ title: 'Application Unpinned', description: `${appId} has been unpinned from your dashboard.` });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome, {user?.firstName || user?.username || 'Valued Applicant'}!
          </CardTitle>
          <CardDescription className="text-lg">
            Manage your voter registration application with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/public/apply" passHref>
            <Button variant="default" size="lg" className="w-full py-8 text-lg shadow-md hover:shadow-lg transition-shadow">
              <FilePlus2 className="mr-3 h-8 w-8" /> Submit New Application
            </Button>
          </Link>
          <Link href="/public/track-status" passHref>
            <Button variant="outline" size="lg" className="w-full py-8 text-lg shadow-md hover:shadow-lg transition-shadow">
              <FileSearch className="mr-3 h-8 w-8" /> Track Application Status
            </Button>
          </Link>
        </CardContent>
      </Card>

      {pinnedApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pinned Applications</CardTitle>
            <CardDescription>Quickly access your saved application references.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {pinnedApplications.map((appId) => (
                <li key={appId} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                  <span className="font-medium">{appId}</span>
                  <div className="flex items-center space-x-2">
                    <Link href={`/public/track-status?id=${appId}`} passHref>
                      <Button variant="ghost" size="sm" aria-label={`View ${appId}`}>
                        <Eye className="h-4 w-4" />
                         <span className="ml-2 hidden sm:inline">View</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleUnpin(appId)} aria-label={`Unpin ${appId}`}>
                      <PinOff className="h-4 w-4 text-destructive" />
                       <span className="ml-2 hidden sm:inline">Unpin</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Important Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Ensure all information provided in your application is accurate and truthful.</p>
          <p>✓ Keep your Application ID safe. You will need it to track your application status.</p>
          <p>✓ Check your application status regularly for updates from the Election Registration Board (ERB).</p>
        </CardContent>
      </Card>
    </div>
  );
}
