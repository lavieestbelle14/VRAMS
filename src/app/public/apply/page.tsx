'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApplicationFormFields } from '@/components/applications/ApplicationFormFields';
import { ArrowLeft, FilePlus2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function PublicNewApplicationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hasApprovedRegistration, setHasApprovedRegistration] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Get the applicant record
        const { data: applicantData, error: applicantError } = await supabase
          .from('applicant')
          .select('applicant_id')
          .eq('auth_id', user.id);

        if (applicantError || !applicantData || applicantData.length === 0) {
          setHasApprovedRegistration(false);
          setIsLoading(false);
          return;
        }

        // Check for approved registration applications
        const { data: applications, error: appError } = await supabase
          .from('application')
          .select('status, application_type')
          .eq('applicant_id', applicantData[0].applicant_id)
          .eq('application_type', 'register')
          .eq('status', 'approved');

        if (appError) {
          console.error('Error checking registration status:', appError);
          setHasApprovedRegistration(false);
        } else {
          setHasApprovedRegistration(applications && applications.length > 0);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        setHasApprovedRegistration(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistrationStatus();
  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking your registration status...</p>
          </div>
        </div>
      </div>
    );
  }
  // Allow all users to access the application form
  // New users can register, existing users can submit other application types
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FilePlus2 className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">Voter Application</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg rounded-lg border">
        <CardContent className="p-6">
          <ApplicationFormFields />
        </CardContent>
      </Card>
    </div>
  );
}

