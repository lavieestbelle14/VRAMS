
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Home, Info, FileText, User, BarChart3 } from 'lucide-react';
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

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    'reactivation': 'Reactivation of Registration',
    'changeCorrection': 'Change of Name/Correction of Entries',
    'inclusionReinstatement': 'Inclusion of Records/Reinstatement of Name',
    '': 'Unknown Type'
  };

  const DetailItem = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || value === '') return null;
    return (
      <div className="mb-2">
        <Label className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </Label>
        <p className="text-sm">{String(value)}</p>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  if (!application) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Application Not Found</AlertTitle>
        <AlertDescription>
          The application details could not be retrieved. Please ensure you have the correct ID or try submitting again.
          <Button onClick={() => router.push('/public/home')} className="mt-4">Go to Home</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-700 dark:text-green-300 font-semibold">Application Submitted Successfully!</AlertTitle>
        <AlertDescription className="text-green-600 dark:text-green-400">
          Your voter registration application has been received. Please save your Application ID for future reference.
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Submission Confirmation</CardTitle>
          <CardDescription>Summary of your submitted application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailItem label="Application ID" value={application.id} icon={Info} />
          <DetailItem 
            label="Applicant Name" 
            value={`${application.personalInfo.firstName} ${application.personalInfo.middleName || ''} ${application.personalInfo.lastName}`.trim()} 
            icon={User} 
          />
          <DetailItem 
            label="Submission Date" 
            value={format(new Date(application.submissionDate), 'PPP p')} 
            icon={FileText} 
          />
          <DetailItem 
            label="Application Type" 
            value={applicationTypeLabels[application.applicationType || '']} 
            icon={FileText} 
          />
          {application.classification && (
            <DetailItem
              label="AI Classified Type"
              value={`${application.classification.applicantType} (Confidence: ${(application.classification.confidence * 100).toFixed(0)}%)`}
              icon={BarChart3}
            />
          )}

          <p className="text-sm text-muted-foreground pt-4 border-t mt-4">
            You can use your Application ID to track the status of your application on the "Track Application Status" page.
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => router.push('/public/home')} className="w-full sm:w-auto">
          <Home className="mr-2 h-4 w-4" /> Go to Public Home
        </Button>
      </div>
    </div>
  );
}


    