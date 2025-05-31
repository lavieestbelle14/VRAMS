
'use client';
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Application } from '@/types';
import { getApplicationById, updateApplicationStatus } from '@/lib/applicationStore'; // Removed saveApplication as it's not used here directly for status tracking
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, CalendarCheck, CalendarPlus, CheckCircle, FileText, HelpCircle, Info, Loader2, MapPin, User, Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { VoterIdDisplay } from '@/components/public/VoterIdDisplay';

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applicationId.trim()) {
      setError('Please enter an Application ID.');
      setApplication(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setApplication(null); 
    
    // Simulate API call
    setTimeout(() => {
      const appData = getApplicationById(applicationId.trim());
      if (appData) {
        setApplication(appData);
      } else {
        setError(`Application ID "${applicationId.trim()}" not found.`);
      }
      setIsLoading(false);
    }, 700);
  };

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'approvedAwaitingBiometrics': return 'default';
      case 'approvedBiometricsScheduled': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusDescription = (status: Application['status']): string => {
    switch (status) {
        case 'pending': return 'Your application has been submitted and is awaiting initial review by an election officer.';
        case 'reviewing': return 'Your application is currently being reviewed by an election officer. Please check back later for updates.';
        case 'approvedAwaitingBiometrics': return 'Congratulations! Your initial application has been approved. The next step is to schedule your biometrics (photo, fingerprints, signature) capture.';
        case 'approvedBiometricsScheduled': return 'Your biometrics appointment has been successfully scheduled. Please ensure you attend on the specified date and time.';
        case 'approved': return 'Your application is fully approved, and biometrics capture is complete! You are now a registered voter.';
        case 'rejected': return 'We regret to inform you that your application has been rejected. Please see remarks for details.';
        default: return 'The status of your application is unclear. Please contact support.';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <SearchIcon className="mr-3 h-8 w-8 text-primary" />
          Track Your Application
        </h2>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
      <p className="text-muted-foreground">
        Enter your Application ID to check the current status of your voter registration application.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>
            Your Application ID was provided to you upon submission of your form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                placeholder="e.g., APP-123456"
                className="uppercase"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="mr-2 h-4 w-4" />
              )}
              Track Status
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {application && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle>Application Found: {application.id}</CardTitle>
                <CardDescription>Submitted on: {format(new Date(application.submissionDate), 'PPP p')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(application.status)} className="text-lg capitalize">
                {application.status.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={getStatusVariant(application.status) === "destructive" ? "destructive" : "default"}>
              <Info className="h-4 w-4" />
              <AlertTitle className="font-semibold capitalize">{application.status.replace(/([A-Z])/g, ' $1').trim()}</AlertTitle>
              <AlertDescription>{getStatusDescription(application.status)}</AlertDescription>
            </Alert>
            
            {application.remarks && (
              <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-sm font-semibold">Officer Remarks:</p>
                <p className="text-sm text-muted-foreground">{application.remarks}</p>
              </div>
            )}

            {(application.status === 'approved' || application.status === 'approvedAwaitingBiometrics' || application.status === 'approvedBiometricsScheduled') && application.voterId && (
              <VoterIdDisplay application={application} />
            )}

            {application.status === 'approvedAwaitingBiometrics' && (
                <Card className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
                    <CardHeader>
                        <CardTitle className="text-green-700 dark:text-green-400 flex items-center">
                            <CalendarCheck className="mr-2 h-6 w-6"/>Action Required: Schedule Biometrics
                        </CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-500">
                            Your application has been approved! Please schedule your biometrics capture.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => router.push(`/public/schedule-biometrics/${application.id}`)} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                            size="lg"
                        >
                           <CalendarPlus className="mr-2 h-5 w-5"/> Schedule Biometrics Appointment
                        </Button>
                    </CardContent>
                </Card>
            )}

            {application.status === 'approvedBiometricsScheduled' && application.biometricsSchedule && (
                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                    <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center"><CalendarCheck className="mr-2 h-6 w-6"/>Biometrics Scheduled!</CardTitle>
                         <CardDescription className="text-blue-600 dark:text-blue-500">
                            Your appointment is confirmed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm"><strong>Date:</strong> {format(new Date(application.biometricsSchedule.date), 'PPP')}</p>
                        <p className="text-sm"><strong>Time:</strong> {application.biometricsSchedule.time}</p>
                        <p className="text-sm"><strong>Location:</strong> {application.biometricsSchedule.location || 'Main COMELEC Office'}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Please bring a valid ID. If you need to reschedule, please contact your local COMELEC office.
                        </p>
                    </CardContent>
                </Card>
            )}

            {application.classification && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground" />AI Classification Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p><strong>Classified Type:</strong> {application.classification.applicantType}</p>
                        <p><strong>Confidence:</strong> {(application.classification.confidence * 100).toFixed(0)}%</p>
                        <p><strong>Reason:</strong> {application.classification.reason}</p>
                    </CardContent>
                </Card>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Need help or have questions about your application?
                Visit our <Link href="/public/faq" className="underline hover:text-primary">FAQ page</Link> or contact COMELEC.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
