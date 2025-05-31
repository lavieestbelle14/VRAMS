
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { format } from 'date-fns';
import { Search as SearchIcon, ArrowLeft, Clock, CalendarDays, MapPin, FileText, User, ShieldCheck, MessageSquare, CheckCircle, Users, Building } from 'lucide-react';
import Link from 'next/link';

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setError('Application ID not found. Please check the ID and try again.');
      }
      setIsLoading(false);
    }, 500);
  };

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'reviewing': return 'outline';
      case 'approvedAwaitingBiometrics': return 'default';
      case 'approvedBiometricsScheduled': return 'default';
      default: return 'secondary';
    }
  };
  
  const DetailItem = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || String(value).trim() === '') return null;
    return (
      <div className="mb-2">
        <Label className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </Label>
        <p className="text-sm">{String(value)}</p>
      </div>
    );
  };

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  };


  // Component to render label forshadcn
  const Label = ({ className, children, ...props }: React.HTMLAttributes<HTMLLabelElement>) => (
    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className || ''}`} {...props}>
      {children}
    </label>
  );


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <SearchIcon className="mr-2 h-7 w-7 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">Track Your Application</h2>
        </div>
        <Link href="/public/home" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to see the current status and details of your voter registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
              placeholder="Enter Application ID (e.g., APP-XXXXXX)"
              className="flex-grow"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SearchIcon className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {application && (
        <Card className="shadow-lg animate-fadeIn">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Application Found: {application.id}</CardTitle>
              <CardDescription>
                Submitted on: {format(new Date(application.submissionDate), 'PPP p')}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(application.status)} className="text-lg capitalize">
              {application.status.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center"><User className="mr-2"/>Applicant</CardTitle></CardHeader>
                <CardContent>
                  <DetailItem label="Full Name" value={`${application.personalInfo.firstName} ${application.personalInfo.middleName || ''} ${application.personalInfo.lastName}`} />
                  <DetailItem label="Date of Birth" value={format(new Date(application.personalInfo.dob), 'PPP')} />
                   <DetailItem label="Sex" value={application.personalInfo.sex} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2"/>Application Type</CardTitle></CardHeader>
                <CardContent>
                  <DetailItem label="Type" value={applicationTypeLabels[application.applicationType || '']} />
                </CardContent>
              </Card>
            </div>
            
            {(application.status === 'approved' || application.status === 'approvedAwaitingBiometrics' || application.status === 'approvedBiometricsScheduled') && application.voterId && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center"><ShieldCheck className="mr-2 text-green-600"/>Approval Details</CardTitle></CardHeader>
                    <CardContent>
                        <DetailItem label="Voter ID" value={application.voterId} icon={CheckCircle} />
                        <DetailItem label="Precinct No." value={application.precinct} icon={MapPin} />
                        {application.approvalDate && <DetailItem label="Approval Date" value={format(new Date(application.approvalDate), 'PPP p')} icon={CalendarDays} />}
                    </CardContent>
                </Card>
            )}

            {application.status === 'approvedBiometricsScheduled' && application.biometricsSchedule && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center"><Clock className="mr-2 text-blue-500"/>Biometrics Schedule</CardTitle></CardHeader>
                    <CardContent>
                        <DetailItem label="Scheduled Date" value={format(new Date(application.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                        <DetailItem label="Scheduled Time" value={application.biometricsSchedule.time} icon={Clock}/>
                        <DetailItem label="Location" value={application.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin}/>
                         <Alert className="mt-4">
                            <AlertTitle>Important!</AlertTitle>
                            <AlertDescription>Please bring a valid ID to your biometrics appointment. Failure to appear may result in delays or cancellation of your application.</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {application.remarks && (
              <Card>
                <CardHeader><CardTitle className="flex items-center"><MessageSquare className="mr-2"/>Officer Remarks</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm">{application.remarks}</p>
                </CardContent>
              </Card>
            )}
             {application.status === 'approvedAwaitingBiometrics' && (
                <Alert className="mt-4 bg-blue-50 border-blue-300 text-blue-700">
                    <AlertTitle className="font-semibold">Next Step: Biometrics</AlertTitle>
                    <AlertDescription>
                        Your application has been initially approved. Please wait for an email or SMS regarding your biometrics capture schedule. 
                        You can also <Link href={`/public/schedule-biometrics/${application.id}`} className="font-medium underline hover:text-blue-800">click here to schedule your biometrics appointment</Link> if online scheduling is available for your area.
                    </AlertDescription>
                </Alert>
            )}

             {application.status === 'pending' && (
                <Alert className="mt-4">
                    <AlertTitle>Application Pending</AlertTitle>
                    <AlertDescription>Your application is currently pending review. Please check back later for updates.</AlertDescription>
                </Alert>
            )}
            {application.status === 'reviewing' && (
                <Alert className="mt-4">
                    <AlertTitle>Application Under Review</AlertTitle>
                    <AlertDescription>Your application is currently being reviewed by an election officer. Updates will be posted here.</AlertDescription>
                </Alert>
            )}
            {application.status === 'rejected' && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Application Rejected</AlertTitle>
                    <AlertDescription>Unfortunately, your application was rejected. Please see officer remarks for details. You may need to re-apply or submit additional documents.</AlertDescription>
                </Alert>
            )}
             {application.status === 'approved' && (
                <Alert className="mt-4 bg-green-50 border-green-300 text-green-700">
                    <AlertTitle className="font-semibold">Application Approved!</AlertTitle>
                    <AlertDescription>
                        Congratulations! Your voter registration is complete. Your Voter ID and precinct details are shown above.
                    </AlertDescription>
                </Alert>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
