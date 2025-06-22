'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home } from 'lucide-react';
import { format } from 'date-fns';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ApplicationSubmittedPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    const fetchApplication = async () => {      if (!id || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching application with ID:', id, 'for user:', user.id);
        
        // First get the application data
        const { data: applicationData, error: appError } = await supabase
          .from('application')
          .select('*')
          .eq('public_facing_id', id)
          .single();        console.log('Application query result:', { applicationData, appError });

        if (appError) {
          console.error('Error fetching application:', appError.message || appError);
          setApplication(null);
          setIsLoading(false);
          return;
        }

        // Then get the applicant data and verify it belongs to the current user
        const { data: applicantData, error: applicantError } = await supabase
          .from('applicant')
          .select(`
            first_name,
            last_name,
            middle_name,
            suffix,
            sex,
            date_of_birth,
            civil_status,
            contact_number,
            email_address,
            auth_id
          `)
          .eq('applicant_id', applicationData.applicant_id)
          .single();

        console.log('Applicant query result:', { applicantData, applicantError });

        if (applicantError || !applicantData || applicantData.auth_id !== user.id) {
          console.error('Error fetching applicant or access denied:', applicantError);
          setApplication(null);
          setIsLoading(false);
          return;
        }

        // Combine the data
        const combinedData = {
          ...applicationData,
          applicant: applicantData
        };

        console.log('Final combined application data:', combinedData);
        setApplication(combinedData as Application);
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setApplication(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id, user]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }
  if (!application) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-10">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Application Submitted Successfully!</h2>
          <p className="text-muted-foreground mb-4">
            Your application with ID <strong>{id}</strong> has been submitted and is being processed.
          </p>
          <div className="space-y-3 mb-6">
            <p className="text-sm text-muted-foreground">
              • You will receive updates on your application status
            </p>
            <p className="text-sm text-muted-foreground">
              • You can track your application using the ID: <strong>{id}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              • Processing typically takes 3-5 business days
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push('/public/track-status')} className="w-full">
              Track Application Status
            </Button>
            <Button variant="outline" onClick={() => router.push('/public/home')} className="w-full">
              <Home className="mr-2 h-4 w-4"/> Back to Home
            </Button>
          </div>
        </div>
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
