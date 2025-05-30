
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { FileSearch, Search, CalendarDays, User, FileTextIcon, CheckCircle, MapPin, Clock, Info } from 'lucide-react';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt'; // Ensure this is correctly imported

export default function TrackStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

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
      setApplication(null);
      setSearched(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setApplication(null);
    setSearched(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const appData = getApplicationById(currentId);
    if (appData) {
      setApplication(appData);
    } else {
      setError(`Application ID "${currentId}" not found.`);
    }
    setIsLoading(false);
    // Update URL if searching manually
    if (!idToSearch) {
        router.push(`/public/track-status?id=${currentId}`, { scroll: false });
    }
  };
  
  const getStatusVariant = (status: Application['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default'; // Greenish in default theme
      case 'approvedAwaitingBiometrics': return 'default';
      case 'approvedBiometricsScheduled': return 'default';
      case 'pending': return 'secondary'; // Greyish
      case 'reviewing': return 'outline'; // Bluish/Yellowish
      case 'rejected': return 'destructive'; // Reddish
      default: return 'secondary';
    }
  };

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center text-primary">
            <FileSearch className="mr-3 h-8 w-8" />
            Track Application Status
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            Enter your Application ID to check the current status of your voter registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="flex-grow w-full">
              <label htmlFor="applicationId" className="block text-base font-semibold text-gray-700 mb-1">
                Application ID
              </label>
              <Input
                id="applicationId"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                placeholder="e.g., APP-XXXXXX"
                className="text-base w-full"
                aria-label="Application ID"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={isLoading || !applicationId.trim()} className="w-full sm:w-auto mt-2 sm:mt-0 sm:self-end py-3 px-6 text-base">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              Search
            </Button>
          </div>

          {isLoading && (
             <div className="flex justify-center items-center py-10">
                <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-3 text-lg text-muted-foreground">Searching...</p>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <Info className="h-5 w-5" />
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!application && !isLoading && !error && searched && (
            <Alert className="mt-6">
                <Info className="h-5 w-5" />
                <AlertTitle>No Results</AlertTitle>
                <AlertDescription>No application found for the provided ID, or your search was empty.</AlertDescription>
            </Alert>
          )}

          {application && !isLoading && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                    <User className="mr-2 h-7 w-7 text-primary" /> Applicant: {application.personalInfo.firstName} {application.personalInfo.lastName}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <FileTextIcon className="mr-2 h-4 w-4" /> Application ID: {application.id}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Submitted on:</span>&nbsp;{format(new Date(application.submissionDate), 'MMMM dd, yyyy, p')}
                </div>
                <div className="flex items-center">
                    <FileTextIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Application Type:</span>&nbsp;{applicationTypeLabels[application.applicationType || '']}
                </div>
                <div className="flex items-center">
                    <Badge variant={getStatusVariant(application.status)} className="text-lg capitalize px-3 py-1">
                        {application.status.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                </div>

                {(application.status === 'approved' || application.status === 'approvedAwaitingBiometrics' || application.status === 'approvedBiometricsScheduled') && application.voterId && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-md font-semibold text-green-700 flex items-center"><CheckCircle className="mr-2 h-5 w-5"/>Voter ID:</p>
                    <p className="text-xl font-bold text-green-600">{application.voterId}</p>
                  </div>
                )}
                {(application.status === 'approved' || application.status === 'approvedAwaitingBiometrics' || application.status === 'approvedBiometricsScheduled') && application.precinct && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-md font-semibold text-blue-700 flex items-center"><MapPin className="mr-2 h-5 w-5"/>Precinct No.:</p>
                    <p className="text-xl font-bold text-blue-600">{application.precinct}</p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <Alert variant="destructive" className="mt-3">
                    <Info className="h-5 w-5" />
                    <AlertTitle>Application Rejected</AlertTitle>
                    <AlertDescription>
                      We regret to inform you that your application has been rejected.
                      {application.remarks && ` Remarks: ${application.remarks}`}
                    </AlertDescription>
                  </Alert>
                )}

                {application.status === 'approvedAwaitingBiometrics' && (
                    <div className="mt-4 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                        <h3 className="text-lg font-semibold text-yellow-700 flex items-center">
                            <Clock className="mr-2 h-5 w-5" /> Next Step: Schedule Biometrics
                        </h3>
                        <p className="text-yellow-600 mt-1">
                            Your application has been initially approved! Please schedule your biometrics appointment to complete the process.
                        </p>
                        <Button 
                            onClick={() => router.push(`/public/schedule-biometrics/${application.id}`)} 
                            className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                            Schedule Biometrics Appointment
                        </Button>
                    </div>
                )}

                {application.status === 'approvedBiometricsScheduled' && application.biometricsSchedule && (
                     <div className="mt-4 p-4 border border-green-300 bg-green-50 rounded-md">
                        <h3 className="text-lg font-semibold text-green-700 flex items-center">
                            <CheckCircle className="mr-2 h-5 w-5" /> Biometrics Scheduled
                        </h3>
                        <p className="text-green-600 mt-1">
                            Your biometrics appointment is scheduled for:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-1 text-green-600">
                            <li>Date: {format(new Date(application.biometricsSchedule.date), 'MMMM dd, yyyy')}</li>
                            <li>Time: {application.biometricsSchedule.time}</li>
                            <li>Location: {application.biometricsSchedule.location || 'Main COMELEC Office'}</li>
                        </ul>
                         <p className="text-sm text-gray-500 mt-2">Please bring a valid ID.</p>
                    </div>
                )}
                
                {application.status === 'approved' && (
                    <Alert variant="default" className="mt-3 bg-green-50 border-green-600 text-green-700">
                         <CheckCircle className="h-5 w-5 text-green-600" />
                        <AlertTitle className="text-green-700">Application Approved!</AlertTitle>
                        <AlertDescription className="text-green-600">
                            Congratulations! Your voter registration is complete. Your Voter ID and Precinct details are shown above.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="mt-6">
                  <AcknowledgementReceipt application={application} />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

