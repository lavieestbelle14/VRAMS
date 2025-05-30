
'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { format, parseISO } from 'date-fns';
import { Search, CheckCircle, XCircle, Clock, CalendarCheck2, Info, FileSearch, FileText, UserCircle, MapPin, CalendarDays, HelpCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { VoterIdDisplay } from '@/components/public/VoterIdDisplay'; // Added import

export default function TrackStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get('id') || '';

  const [applicationId, setApplicationId] = useState(initialAppId);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialAppId) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppId]);


  const handleSearch = async () => {
    if (!applicationId.trim()) {
      setError('Please enter an Application ID.');
      setApplication(null);
      setSearched(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setApplication(null);
    setSearched(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const appData = getApplicationById(applicationId.trim());

    if (appData) {
      setApplication(appData);
    } else {
      setError('Application ID not found. Please check the ID and try again.');
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'reviewing':
        return <FileSearch className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusDescription = (app: Application) => {
    switch (app.status) {
      case 'pending':
        return 'Your application is pending review by an election officer.';
      case 'reviewing':
        return 'Your application is currently being reviewed by an election officer.';
      case 'approvedAwaitingBiometrics':
        return 'Your application has been approved and is awaiting biometrics scheduling. Your Voter ID and Precinct No. are now available.';
      case 'approvedBiometricsScheduled':
        return `Your biometrics appointment has been scheduled. Voter ID and Precinct No. are available. Appointment: ${app.biometricsSchedule ? format(parseISO(app.biometricsSchedule.date), 'PPP') + ' at ' + app.biometricsSchedule.time : 'Details not found.'}`;
      case 'approved':
        return 'Your application has been fully approved and your registration is complete. Your Voter ID and Precinct No. are available.';
      case 'rejected':
        return `Your application has been rejected. ${app.remarks ? `Reason: ${app.remarks}` : 'Please contact your local COMELEC office for more details.'}`;
      default:
        return 'The status of your application is unknown.';
    }
  };


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-primary">
            <FileSearch className="mr-3 h-7 w-7" /> Track Application Status
          </CardTitle>
          <CardDescription>
            Enter your Application ID to check the current status of your voter registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="applicationId" className="text-base font-semibold text-gray-700">
              Application ID
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Input
                id="applicationId"
                type="text"
                value={applicationId}
                onChange={(e) => {
                  setApplicationId(e.target.value);
                  if (searched) setSearched(false); // Reset searched state if user types again
                  if (error) setError(null); // Clear error if user types again
                }}
                placeholder="e.g., APP-123456"
                className="flex-grow text-base"
              />
              <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-6">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="ml-3 text-muted-foreground">Searching for application...</p>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && application && (
            <Card className="mt-6 shadow-md">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center text-xl">
                  {getStatusIcon(application.status)}
                  <span className="ml-3 capitalize">{application.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                </CardTitle>
                <CardDescription>
                  Application ID: <span className="font-semibold text-foreground">{application.id}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <p className="text-sm text-muted-foreground">{getStatusDescription(application)}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground flex items-center"><UserCircle className="mr-2 h-4 w-4 text-primary" />Applicant Name</p>
                    <p>{`${application.personalInfo.firstName} ${application.personalInfo.middleName || ''} ${application.personalInfo.lastName}`}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center"><FileText className="mr-2 h-4 w-4 text-primary" />Application Type</p>
                    <p className="capitalize">{application.applicationType.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary" />Submission Date</p>
                    <p>{format(parseISO(application.submissionDate), 'MMMM dd, yyyy - h:mm a')}</p>
                  </div>
                </div>

                {(application.status === 'approvedAwaitingBiometrics' || application.status === 'approvedBiometricsScheduled' || application.status === 'approved') && (
                  <div className="mt-4 pt-4 border-t">
                     <VoterIdDisplay application={application} />
                  </div>
                )}

                {application.status === 'approvedAwaitingBiometrics' && (
                  <div className="mt-4 text-center">
                    <Button onClick={() => router.push(`/public/schedule-biometrics/${application.id}`)}>
                      <CalendarCheck2 className="mr-2 h-4 w-4" /> Schedule Biometrics Appointment
                    </Button>
                  </div>
                )}
                 <hr className="my-6" />
                <AcknowledgementReceipt application={application} />
              </CardContent>
            </Card>
          )}

          {searched && !isLoading && !application && !error && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Application Searched</AlertTitle>
              <AlertDescription>Please enter an application ID and click search to view its status.</AlertDescription>
            </Alert>
          )}

           <div className="mt-8 text-center">
                <Link href="/public/home" className="text-sm text-primary hover:underline">
                  &larr; Back to Home
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

