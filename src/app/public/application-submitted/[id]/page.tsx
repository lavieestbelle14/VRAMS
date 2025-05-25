
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info, ArrowLeft, FileText, User, Brain } from 'lucide-react';
import { format } from 'date-fns';

export default function ApplicationSubmittedPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (id) {
      try {
        const appData = getApplicationById(id);
        if (appData) {
          setApplication(appData);
        } else {
          setError('Application details not found. Please ensure you have the correct Application ID.');
        }
      } catch (e) {
        console.error("Error fetching application:", e);
        setError('An error occurred while retrieving application details.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('No Application ID provided.');
      setIsLoading(false);
    }
  }, [id]);

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    'reactivation': 'Reactivation of Registration',
    'changeCorrection': 'Change of Name/Correction of Entries',
    'inclusionReinstatement': 'Inclusion of Records/Reinstatement of Name',
    '': 'Unknown Type'
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-muted-foreground">Loading application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Alert variant="destructive" className="max-w-md">
          <Info className="h-4 w-4" />
          <AlertTitle>Error Retrieving Application</AlertTitle>
          <AlertDescription>
            {error || 'Could not load application details. Please check the ID or try again later.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/public/home')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Alert className="mb-8 bg-green-50 border-green-400 text-green-700">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="font-semibold text-green-800">Application Submitted Successfully!</AlertTitle>
        <AlertDescription className="text-green-700">
          Your voter registration application has been received. Please save your Application ID for future reference.
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Application Confirmation</CardTitle>
          <CardDescription>
            Here are the details of your submitted application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-muted-foreground flex items-center">
              <Info className="mr-2 h-4 w-4 text-primary" /> Your Application ID
            </Label>
            <p className="text-2xl font-bold text-primary bg-primary/10 p-3 rounded-md">{application.id}</p>
            <p className="text-xs text-muted-foreground mt-1">Keep this ID safe. You will need it to track your application status.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-muted-foreground flex items-center">
                <User className="mr-2 h-4 w-4" /> Applicant Name
              </Label>
              <p className="text-md">{`${application.personalInfo.firstName} ${application.personalInfo.middleName || ''} ${application.personalInfo.lastName}`}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-muted-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" /> Application Type
              </Label>
              <p className="text-md">{applicationTypeLabels[application.applicationType || '']}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-muted-foreground">
              Submission Date
            </Label>
            <p className="text-md">{format(new Date(application.submissionDate), 'PPP p')}</p>
          </div>

          {application.classification && (
            <div>
              <Label className="text-sm font-semibold text-muted-foreground flex items-center">
                <Brain className="mr-2 h-4 w-4" /> AI Preliminary Classification
              </Label>
              <p className="text-md">Type: {application.classification.applicantType}</p>
              <p className="text-sm text-muted-foreground">Confidence: {(application.classification.confidence * 100).toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Note: {application.classification.reason}</p>
            </div>
          )}

          <Alert variant="default" className="mt-6">
            <Info className="h-4 w-4"/>
            <AlertTitle>What's Next?</AlertTitle>
            <AlertDescription>
              You can track the status of your application using your Application ID on the "Track Application" page.
              Your biometrics (photo, fingerprints, signature) will be captured on-site at your local COMELEC office or designated registration center. You will be notified of the schedule and venue.
            </AlertDescription>
          </Alert>

          <div className="text-center mt-8">
            <Button onClick={() => router.push('/public/home')} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Public Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Label component if not already universally available or for local styling
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
);
