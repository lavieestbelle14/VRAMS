
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { format } from 'date-fns';
import { VoterIdDisplay } from '@/components/public/VoterIdDisplay';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { ArrowLeft, FileSearch, Info, AlertCircle, CheckCircle, Clock, CalendarCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';

function TrackStatusPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null | undefined>(undefined); // undefined for initial, null for not found
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if (idFromQuery) {
      setApplicationId(idFromQuery);
      handleSearch(idFromQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = async (idToSearch?: string) => {
    const currentId = idToSearch || applicationId;
    if (!currentId.trim()) {
      setError('Please enter an Application ID.');
      setSearchedApplication(undefined);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchedApplication(undefined); // Clear previous results

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const app = getApplicationById(currentId.trim());
    if (app) {
      setSearchedApplication(app);
    } else {
      setSearchedApplication(null); // Explicitly null for "not found"
      setError(`Application ID "${currentId.trim()}" not found. Please check the ID and try again.`);
    }
    setIsLoading(false);
  };

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'approvedAwaitingBiometrics': return 'default';
      case 'approvedBiometricsScheduled': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };

  const DetailItem = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ElementType }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || value.trim() === '') return null;
    return (
      <div className="mb-2">
        <p className="text-sm font-medium text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </p>
        <p className="text-md">{value}</p>
      </div>
    );
  };


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Button variant="outline" onClick={() => router.push('/public/home')} className="mb-6 print-hide">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>

      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FileSearch className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Track Application Status</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Enter your Application ID to check its current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-8">
            <div>
              <Label htmlFor="applicationIdInput" className="text-base font-semibold mb-1 block">Application ID</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="applicationIdInput"
                  type="text"
                  value={applicationId}
                  onChange={(e) => {
                    setApplicationId(e.target.value);
                    if(error) setError(null); // Clear error on new input
                  }}
                  placeholder="Enter your Application ID (e.g., APP-XXXXXX)"
                  className="flex-grow text-base p-3"
                  aria-label="Application ID"
                />
                <Button onClick={() => handleSearch()} disabled={isLoading || !applicationId.trim()} className="text-base p-3 sm:w-auto w-full">
                  {isLoading ? (
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : <FileSearch className="mr-2 h-5 w-5" /> }
                  Search
                </Button>
              </div>
            </div>
            {error && !isLoading && (
              <div className="flex items-center text-destructive p-3 bg-destructive/10 rounded-md">
                <AlertCircle className="mr-2 h-5 w-5" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {isLoading && (
             <div className="flex flex-col items-center justify-center text-center py-10">
                <svg className="animate-spin h-10 w-10 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-muted-foreground">Searching for application...</p>
            </div>
          )}

          {searchedApplication && !isLoading && (
            <Card className="mt-6 shadow-md">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl">Application Found: {searchedApplication.id}</CardTitle>
                <div className="flex items-center">
                  <span className="mr-2">Status:</span>
                  <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-sm capitalize">
                    {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.middleName || ''} ${searchedApplication.personalInfo.lastName}`} icon={Info} />
                <DetailItem label="Application Type" value={searchedApplication.applicationType === 'register' ? 'New Registration' : 'Transfer of Registration'} icon={FileSearch} />
                <DetailItem label="Submission Date" value={format(new Date(searchedApplication.submissionDate), 'PPP p')} icon={Clock} />
                
                {searchedApplication.remarks && (searchedApplication.status === 'rejected' || searchedApplication.status === 'approved') && (
                   <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={Info} />
                )}

                {searchedApplication.status === 'approvedAwaitingBiometrics' && (
                  <Card className="mt-6 bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700">
                    <CardHeader className="items-center text-center">
                       <CalendarCheck className="h-10 w-10 text-green-600 dark:text-green-400 mb-2" />
                       <CardTitle className="text-xl text-green-700 dark:text-green-300">Action Required!</CardTitle>
                       <CardDescription className="text-green-600 dark:text-green-400">
                          Your Application is Approved - Schedule Your Biometrics
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="mb-4 text-muted-foreground">
                        Congratulations! Your application for voter registration has been initially approved.
                        To complete the process, please schedule your onsite biometrics capture (photo, fingerprints, signature).
                      </p>
                      <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-primary-foreground">
                        <Link href={`/public/schedule-biometrics/${searchedApplication.id}`}>
                          <CalendarCheck className="mr-2 h-5 w-5" /> Schedule Biometrics Appointment
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {searchedApplication.status === 'approvedBiometricsScheduled' && searchedApplication.biometricsSchedule && (
                  <Card className="mt-6 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
                    <CardHeader>
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-xl text-blue-700 dark:text-blue-300">Biometrics Scheduled!</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-muted-foreground">Your biometrics appointment is confirmed for:</p>
                      <DetailItem label="Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarCheck} />
                      <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                      <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={Info} />
                      <p className="text-xs text-muted-foreground mt-2">Please arrive on time. If you need to reschedule, contact your local COMELEC office (rescheduling not available through this portal).</p>
                    </CardContent>
                  </Card>
                )}

                {searchedApplication.status === 'approved' && searchedApplication.voterId && (
                  <div className="mt-6">
                    <VoterIdDisplay application={searchedApplication} />
                  </div>
                )}
                
                <div className="mt-8 border-t pt-6">
                  <AcknowledgementReceipt application={searchedApplication} />
                </div>

              </CardContent>
            </Card>
          )}

          {searchedApplication === null && !isLoading && !error && (
             <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Application ID not found. Please verify the ID and try again.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TrackStatusPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg> Loading...</div>}>
      <TrackStatusPageContent />
    </Suspense>
  );
}
