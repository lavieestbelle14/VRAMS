
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, FileText, Home, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ApplicationSubmittedPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (id) {
      const appData = getApplicationById(id);
      if (appData) {
        setApplication(appData);
      }
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Application Not Found</h2>
        <p className="text-muted-foreground">The requested application ID ({id}) could not be found or has not been processed yet.</p>
        <Button onClick={() => router.push('/public/home')} className="mt-4">
          <Home className="mr-2 h-4 w-4" /> Go to Home
        </Button>
      </div>
    );
  }
  
  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      'reactivation': 'Reactivation of Registration',
      'changeCorrection': 'Change of Name/Correction of Entries',
      'inclusionReinstatement': 'Inclusion of Records/Reinstatement of Name',
      '': 'Unknown Type'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-700 dark:text-green-300">Application Submitted Successfully!</AlertTitle>
        <AlertDescription className="text-green-600 dark:text-green-400">
          Your application has been received. Please save your Application ID for future reference.
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Submission Confirmation</CardTitle>
          <CardDescription>Thank you for submitting your voter registration application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Application Details
            </h3>
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Application ID:</span>
              <span className="ml-2 font-mono text-accent-foreground bg-accent/20 px-2 py-1 rounded-md">{application.id}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Applicant Name:</span>
              <span className="ml-2">{application.personalInfo.firstName} {application.personalInfo.middleName} {application.personalInfo.lastName}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Submission Date:</span>
              <span className="ml-2">{format(new Date(application.submissionDate), 'PPP p')}</span>
            </p>
             <p className="text-sm">
              <span className="font-medium text-muted-foreground">Application Type:</span>
              <span className="ml-2">{applicationTypeLabels[application.applicationType || '']}</span>
            </p>
          </div>
          
          <Alert variant="default" className="mt-6">
            <User className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>
              Please keep your Application ID <strong className="font-mono">{application.id}</strong> safe. You will need it to track the status of your application.
            </AlertDescription>
          </Alert>

          <Button onClick={() => router.push('/public/home')} className="w-full mt-6">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
