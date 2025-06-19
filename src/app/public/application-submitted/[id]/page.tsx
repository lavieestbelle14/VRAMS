'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home } from 'lucide-react';
import { format } from 'date-fns';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';

export default function ApplicationSubmittedPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (id) {
      const appData = getApplicationById(id);
      setApplication(appData || null); // Ensure it's null if not found
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  if (!application) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Application Not Found</h2>
        <p className="text-muted-foreground">The requested application ID ({id}) could not be found or has not been processed yet.</p>
        <Button onClick={() => router.push('/public/home')} className="mt-4">
          <Home className="mr-2 h-4 w-4"/> Back to Home
        </Button>
      </div>
    );
  }

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      'reactivation': 'Reactivation of Registration',
      'transfer_with_reactivation': 'Transfer with Reactivation',
      'correction_of_entry': 'Correction of Entries',
      'reinstatement': 'Inclusion/Reinstatement',
      '': 'Unknown Type'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground p-6 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-10 w-10 text-green-400" />
            <div>
              <CardTitle className="text-3xl">Application Submitted Successfully!</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Your voter registration application has been received.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-center text-lg font-semibold text-primary">
            Your Application ID is: <strong className="text-2xl">{application.id}</strong>
          </p>
          <p className="text-center text-muted-foreground">
            Please save this ID. You will need it to track the status of your application.
          </p>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Submission Summary:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><strong>Applicant Name:</strong> {application.personalInfo.firstName} {application.personalInfo.lastName}</p>
              <p><strong>Submission Date:</strong> {format(new Date(application.submissionDate), 'PPP p')}</p>
              <p><strong>Application Type:</strong> {applicationTypeLabels[application.applicationType || '']}</p>
            </div>
          </div>
          
          <AcknowledgementReceipt application={application} />

          <div className="mt-8 flex justify-center print-hide">
            <Button onClick={() => router.push('/public/home')} size="lg">
              <Home className="mr-2 h-5 w-5" /> Go to Home Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
