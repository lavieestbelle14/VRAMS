
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApplicationDataTable } from '@/components/dashboard/ApplicationDataTable';
import { ArrowLeft } from 'lucide-react'; // Removed FilePlus2
import { useEffect, useState } from 'react';
import type { Application } from '@/types';
import { getApplications, seedInitialData } from '@/lib/applicationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AllApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    seedInitialData(); // Ensure sample data if needed
    setApplications(getApplications());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Applications</h2>
          <p className="text-muted-foreground">
            View and manage all submitted voter applications.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          {/* "New Application" button removed from here */}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Application List</CardTitle>
          <CardDescription>A comprehensive list of all voter applications in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationDataTable applications={applications} />
        </CardContent>
      </Card>
    </div>
  );
}
