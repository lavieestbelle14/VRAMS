'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

interface PendingApplication {
  application_number: number;
  public_facing_id: string;
  application_type: string;
  application_date: string;
  status: string;
}

export function usePendingApplications() {
  const { user } = useAuth();
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPendingApplications = async () => {
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
          setPendingApplications([]);
          setIsLoading(false);
          return;
        }

        // Check for any pending applications (pending or verified status)
        const { data: applications, error: appError } = await supabase
          .from('application')
          .select('application_number, public_facing_id, application_type, application_date, status')
          .eq('applicant_id', applicantData[0].applicant_id)
          .in('status', ['pending', 'verified'])
          .order('application_date', { ascending: false });

        if (appError) {
          console.error('Error checking pending applications:', appError);
          setError('Failed to check pending applications');
          setPendingApplications([]);
        } else {
          setPendingApplications(applications || []);
        }
      } catch (error) {
        console.error('Error checking pending applications:', error);
        setError('Failed to check pending applications');
        setPendingApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkPendingApplications();
  }, [user]);

  const hasPendingApplications = pendingApplications.length > 0;
  const pendingRegistration = pendingApplications.find(app => app.application_type === 'register');
  const hasPendingRegistration = !!pendingRegistration;

  return {
    pendingApplications,
    hasPendingApplications,
    hasPendingRegistration,
    pendingRegistration,
    isLoading,
    error,
  };
}
