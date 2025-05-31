
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, ArrowLeft, Info, CheckCircle, XCircle, Hourglass, FileText, CalendarDays, User, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TrackApplicationStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = () => {
    if (!applicationId.trim()) {
      setError('Please enter an Application ID.');
      setApplication(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      const foundApp = getApplicationById(applicationId.trim());
      if (foundApp) {
        setApplication(foundApp);
      } else {
        setApplication(null);
        setError(`Application ID "${applicationId.trim()}" not found. Please check the ID and try again.`);
      }
      setIsLoading(false);
    }, 1000);
  };

  const getStatusBadgeVariant = (status: Application['status'] | undefined) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return 'default'; // Greenish, from theme's primary or a specific green
      case 'rejected':
        return 'destructive'; // Red
      case 'pending':
        return 'secondary'; // Yellowish/Grayish
      case 'reviewing':
        return 'outline'; // Bluish/Grayish (can be adjusted)
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: Application['status'] | undefined) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return <CheckCircle className="mr-2 h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="mr-2 h-5 w-5 text-red-500" />;
      case 'pending':
        return <Hourglass className="mr-2 h-5 w-5 text-yellow-500" />;
      case 'reviewing':
        return <FileText className="mr-2 h-5 w-5 text-blue-500" />;
      default:
        return <Info className="mr-2 h-5 w-5 text-gray-500" />;
    }
  };

  const DetailItem = ({ label, value, icon, isBoolean = false }: { label: string; value?: string | number | null | boolean; icon?: React.ElementType; isBoolean?: boolean }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) return null;
    
    let displayValue = String(value);
    if (isBoolean) {
        displayValue = value ? 'Yes' : 'No';
    }

    return (
      <div className="mb-2">
        <Label className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </Label>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };
  
  // Extracted label from ShadCN for direct use if FormLabel not available
  const Label = ({ children, className, ...props }: React.HTMLProps<HTMLLabelElement>) => (
    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props}>
        {children}
    </label>
  );


  return (
    <div className="space-y-6">
      <div className="flex justify-start mb-6">
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Search className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Track Your Application
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to see the current status of your voter registration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter Application ID (e.g., APP-XXXXX)"
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value);
                if (error) setError(null); // Clear error when user types
              }}
              className="flex-grow"
              aria-label="Application ID Input"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-3 text-muted-foreground">Searching for your application...</p>
        </div>
      )}

      {application && !isLoading && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(application.status)}
              Application Status: 
              <Badge variant={getStatusBadgeVariant(application.status)} className="ml-2 text-base capitalize">
                {application.status.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Details for Application ID: <strong>{application.id}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <DetailItem label="Applicant Name" value={`${application.personalInfo.firstName} ${application.personalInfo.lastName}`} icon={User}/>
                    <DetailItem label="Application Type" value={application.applicationType === 'register' ? 'New Registration' : 'Transfer of Registration'} icon={FileText}/>
                    <DetailItem label="Submission Date" value={format(new Date(application.submissionDate), 'PPP p')} icon={CalendarDays}/>
                </div>
                <div>
                    {application.remarks && <DetailItem label="Officer Remarks" value={application.remarks} icon={Info}/>}
                    {(application.status === 'approved' || application.status === 'approvedBiometricsScheduled' || application.status === 'approvedAwaitingBiometrics') && application.approvalDate && (
                        <DetailItem label="Approval Date" value={format(new Date(application.approvalDate), 'PPP p')} icon={CalendarDays}/>
                    )}
                    {application.status === 'approved' && application.voterId && (
                         <DetailItem label="Voter ID" value={application.voterId} icon={CheckCircle}/>
                    )}
                    {application.status === 'approved' && application.precinct && (
                        <DetailItem label="Precinct Number" value={application.precinct} icon={MapPin}/>
                    )}
                </div>
            </div>

            {application.classification && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">AI Classification</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>Type:</strong> {application.classification.applicantType}</p>
                  <p><strong>Confidence:</strong> {(application.classification.confidence * 100).toFixed(0)}%</p>
                  <p><strong>Reason:</strong> {application.classification.reason}</p>
                </CardContent>
              </Card>
            )}

            {application.status === 'approvedAwaitingBiometrics' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Next Steps: Biometrics Capture</AlertTitle>
                <AlertDescription>
                  Your application has been pre-approved. Please proceed to your local COMELEC office for biometrics capture (photo, fingerprints, signature).
                  You will receive an email or SMS for scheduling options if available, or you can visit during office hours.
                </AlertDescription>
              </Alert>
            )}
            {application.status === 'approvedBiometricsScheduled' && application.biometricsSchedule && (
                <Alert variant="default" className="bg-primary/10 border-primary/50">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Biometrics Scheduled!</AlertTitle>
                    <AlertDescription>
                        Your biometrics capture is scheduled on <strong>{format(new Date(application.biometricsSchedule.date), 'PPP')}</strong> at <strong>{application.biometricsSchedule.time}</strong>.
                        <br/>Location: <strong>{application.biometricsSchedule.location || 'Main COMELEC Office'}</strong>.
                        <br/>Please bring a valid ID.
                    </AlertDescription>
                </Alert>
            )}
             {application.status === 'approvedBiometricsScheduled' && (
                <div className="flex justify-end mt-4">
                    <Link href={`/public/schedule-biometrics/${application.id}?change=true`} passHref>
                        <Button variant="outline">Reschedule Biometrics</Button>
                    </Link>
                </div>
            )}

            {application.status === 'rejected' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Application Rejected</AlertTitle>
                <AlertDescription>
                  We regret to inform you that your application was not approved. 
                  {application.remarks ? ` Reason: ${application.remarks}` : " Please contact your local COMELEC office for more details."}
                  You may re-apply if you believe you now meet the requirements.
                </AlertDescription>
              </Alert>
            )}

            {application.status === 'approved' && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">Application Approved & Complete!</AlertTitle>
                <AlertDescription className="text-green-600">
                  Congratulations! Your voter registration is complete. Your Voter ID is {application.voterId} and your precinct is {application.precinct}.
                  You are now eligible to vote in the upcoming elections.
                </AlertDescription>
              </Alert>
            )}

            {(application.status === 'pending' || application.status === 'reviewing') && (
              <Alert>
                <Hourglass className="h-4 w-4" />
                <AlertTitle>Application In Progress</AlertTitle>
                <AlertDescription>
                  Your application is currently being processed. Please check back later for updates.
                  Current stage: {application.status === 'pending' ? 'Awaiting Review' : 'Under Review'}.
                </AlertDescription>
              </Alert>
            )}
            
            { (application.status === 'approvedAwaitingBiometrics' || (application.status === 'pending' && !application.biometricsSchedule)) && (
              <div className="mt-6 text-center">
                <Link href={`/public/schedule-biometrics/${application.id}`} passHref>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <CalendarDays className="mr-2 h-5 w-5"/> Schedule Biometrics Appointment
                  </Button>
                </Link>
              </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
