
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { useToast } from '@/hooks/use-toast';
import { FileSearch, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, Link as LinkIcon, CalendarCheck, CalendarPlus } from 'lucide-react';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { VoterIdDisplay } from '@/components/public/VoterIdDisplay'; // Assuming this is the correct path
import { format } from 'date-fns';

function TrackStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      toast({ title: 'Error', description: 'Please enter an Application ID.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setSearched(false);
    setApplication(null); // Clear previous results

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const appData = getApplicationById(currentId.trim());
    if (appData) {
      setApplication(appData);
    } else {
      toast({ title: 'Not Found', description: `Application ID "${currentId}" not found.`, variant: 'default' });
    }
    setIsLoading(false);
    setSearched(true);
  };
  
  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'reviewing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return <CheckCircle className="mr-2 h-5 w-5" />;
      case 'rejected':
        return <XCircle className="mr-2 h-5 w-5" />;
      case 'pending':
      case 'reviewing':
        return <Clock className="mr-2 h-5 w-5" />;
      default:
        return <AlertTriangle className="mr-2 h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center text-primary">
            <FileSearch className="mr-3 h-8 w-8" />
            Track Application Status
          </CardTitle>
          <CardDescription className="text-md mt-2">
            Enter your Application ID below to check its current status and view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="applicationId" className="text-base font-semibold">Application ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="applicationId"
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                  placeholder="e.g., APP-XXXXXX"
                  className="flex-grow text-base"
                  aria-label="Application ID"
                />
                <Button type="submit" disabled={isLoading} className="text-base">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
                  Search
                </Button>
              </div>
            </div>
          </form>

          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-semibold">Searching for your application...</p>
              <p className="text-muted-foreground">Please wait a moment.</p>
            </div>
          )}

          {!isLoading && searched && application && (
            <div className="mt-8 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Application Found!</CardTitle>
                  <CardDescription>Details for Application ID: <strong>{application.id}</strong></CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <strong className="w-40">Applicant Name:</strong>
                    <span>{application.personalInfo.firstName} {application.personalInfo.middleName} {application.personalInfo.lastName}</span>
                  </div>
                  <div className="flex items-center">
                    <strong className="w-40">Submission Date:</strong>
                    <span>{format(new Date(application.submissionDate), 'PPP p')}</span>
                  </div>
                  <div className="flex items-center">
                    <strong className="w-40">Application Type:</strong>
                    <span className="capitalize">{application.applicationType?.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                  <div className={`flex items-center font-semibold text-lg ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <strong className="mr-2">Status:</strong>
                    <span className="capitalize">{application.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>

                  {application.remarks && (
                    <div className="pt-2">
                      <strong className="block text-sm font-medium text-gray-700">Officer Remarks:</strong>
                      <p className="text-sm text-muted-foreground italic bg-gray-50 p-3 rounded-md mt-1">{application.remarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {application.status === 'approvedAwaitingBiometrics' && (
                <Card className="mt-6 bg-green-50 border-green-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center">
                      <CalendarCheck className="mr-2 h-6 w-6" />
                      Action Required: Schedule Your Biometrics
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      Your application has been approved! Please schedule your biometrics appointment to complete your registration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => router.push(`/public/schedule-biometrics/${application.id}`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                      size="lg"
                    >
                      <CalendarPlus className="mr-2 h-5 w-5" /> Schedule Biometrics Appointment
                    </Button>
                  </CardContent>
                </Card>
              )}

              {application.status === 'approvedBiometricsScheduled' && application.biometricsSchedule && (
                <Card className="mt-6 bg-blue-50 border-blue-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-blue-700 flex items-center">
                      <CalendarCheck className="mr-2 h-6 w-6 text-blue-500" />
                      Biometrics Appointment Scheduled!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-blue-700">
                    <p><strong>Date:</strong> {format(new Date(application.biometricsSchedule.date), 'PPP')}</p>
                    <p><strong>Time:</strong> {application.biometricsSchedule.time}</p>
                    <p><strong>Location:</strong> {application.biometricsSchedule.location || 'Main COMELEC Office'}</p>
                    <p className="mt-2 text-sm text-blue-600">Please arrive on time with a valid ID.</p>
                  </CardContent>
                </Card>
              )}
              
              {(application.status === 'approved' || application.status === 'approvedBiometricsScheduled' || application.status === 'approvedAwaitingBiometrics') && application.voterId && (
                <div className="mt-8">
                  <VoterIdDisplay application={application} />
                </div>
              )}
              
              <div className="mt-8 border-t pt-6">
                <AcknowledgementReceipt application={application} />
              </div>

            </div>
          )}

          {!isLoading && searched && !application && (
            <Card className="mt-8 text-center py-10 shadow-md bg-amber-50 border-amber-200">
              <CardContent>
                <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
                <h3 className="text-2xl font-semibold text-amber-700">Application Not Found</h3>
                <p className="text-muted-foreground mt-2 text-amber-600">
                  We couldn't find an application with the ID "<strong>{applicationId}</strong>".
                  <br />
                  Please double-check the ID and try again.
                </p>
                <Button variant="link" onClick={() => { setApplicationId(''); setSearched(false); }} className="mt-4 text-primary">
                  Search for another ID
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function TrackApplicationStatusPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <TrackStatusContent />
    </Suspense>
  );
}
