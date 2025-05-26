
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, FileText, Home, Printer, User } from 'lucide-react';
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
      setApplication(appData || null);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const handlePrintReceipt = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!application) {
    return (
      <Alert variant="destructive">
        <FileText className="h-4 w-4" />
        <AlertTitle>Application Not Found</AlertTitle>
        <AlertDescription>
          The application ID ({id}) could not be found. Please check the ID or contact support.
          <Button onClick={() => router.push('/public/home')} className="mt-4 ml-auto block">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const { personalInfo: pi } = application;

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      'reactivation': 'Reactivation of Registration',
      'changeCorrection': 'Change of Name/Correction of Entries',
      'inclusionReinstatement': 'Inclusion of Records/Reinstatement of Name',
      '': 'Unknown Type'
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-green-50 border-green-300 print-hide">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-700 font-semibold">Application Submitted Successfully!</AlertTitle>
        <AlertDescription className="text-green-600">
          Your voter registration application has been received. Please save your Application ID for future reference.
          You can track the status of your application using this ID.
        </AlertDescription>
      </Alert>

      <Card className="print-hide">
        <CardHeader>
          <CardTitle>Submission Summary</CardTitle>
          <CardDescription>Key details of your submitted application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Application ID:</span>
            <span className="font-semibold text-primary">{application.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Applicant Name:</span>
            <span>{pi.firstName} {pi.middleName || ''} {pi.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Application Type:</span>
            <span>{applicationTypeLabels[application.applicationType || '']}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Submission Date:</span>
            <span>{format(new Date(application.submissionDate), 'PPP p')}</span>
          </div>
        </CardContent>
      </Card>

      <div id="printable-receipt-area" className="pt-4">
        <Card className="border-2 border-dashed border-gray-400">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">ACKNOWLEDGEMENT RECEIPT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 py-4">
            <div className="grid grid-cols-3 gap-x-4 items-end">
              <div className="col-span-2 space-y-1">
                <p className="text-xs text-muted-foreground">Application for Registration</p>
                <div className="border-b border-dotted border-gray-500 py-1">
                  <span className="font-medium">{pi.lastName}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Last</p>
              </div>
              <div className="col-span-1 space-y-1">
                 <p className="text-xs text-muted-foreground">Application No.</p>
                 <div className="border-b border-dotted border-gray-500 py-1">
                    <span className="font-medium">{application.id}</span>
                 </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 items-end">
                <div className="space-y-1">
                    <div className="border-b border-dotted border-gray-500 py-1">
                        <span className="font-medium">{pi.firstName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">First</p>
                </div>
                 <div className="space-y-1">
                    <div className="border-b border-dotted border-gray-500 py-1">
                        <span className="font-medium">{pi.middleName || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Middle</p>
                </div>
            </div>
            
            <p className="text-sm leading-relaxed pt-2">
              This is to acknowledge receipt of your Application for registration. You are not yet registered unless approved by the Election Registration Board/(ERB). You need not appear in the ERB hearing unless required through a written notice.
            </p>
             <div className="pt-6 text-center">
                <div className="inline-block border-t border-dotted border-gray-500 w-1/2 mt-2 py-1">
                     <p className="text-xs text-muted-foreground">EO/Interviewer Signature Above Printed Name</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6 print-hide">
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        <Button onClick={handlePrintReceipt}>
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      </div>
    </div>
  );
}
