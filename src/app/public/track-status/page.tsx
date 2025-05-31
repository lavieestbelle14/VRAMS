
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { ArrowLeft, FileSearch, Info, CheckCircle, XCircle, Clock, CalendarPlus, Search, UserCircle, MapPin, CalendarDays, Briefcase, ShieldCheck, Building, Users, Accessibility, MessageSquare, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ApplicationFormValues } from '@/schemas/applicationSchema';


export default function TrackStatusPage() {
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
      const appData = getApplicationById(applicationId.trim());
      if (appData) {
        setApplication(appData);
      } else {
        setError(`Application ID "${applicationId.trim()}" not found.`);
        setApplication(null);
      }
      setIsLoading(false);
    }, 500);
  };
  
  const DetailItem = ({ label, value, icon, isBoolean = false }: { label: string; value?: string | number | null | boolean | string[]; icon?: React.ElementType; isBoolean?: boolean }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) ) return null;
    
    let displayValue = String(value);
    if (isBoolean) {
        displayValue = value ? 'Yes' : 'No';
    } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
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

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return <CheckCircle className="h-5 w-5 text-green-500 mr-2" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive mr-2" />;
      case 'pending':
      case 'reviewing':
        return <Clock className="h-5 w-5 text-blue-500 mr-2" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground mr-2" />;
    }
  };
  
  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      '': 'Unknown Type'
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Search className="h-8 w-8 text-green-600" />
            <h2 className="text-3xl font-bold tracking-tight text-green-600">Track Your Application</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to see the current status and details of your voter registration application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-2 mb-6">
            <div className="flex-grow">
              <Label htmlFor="applicationId" className="mb-1 block text-sm font-medium">Application ID</Label>
              <Input
                id="applicationId"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="e.g., APP-123456"
                className="w-full"
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FileSearch className="mr-2 h-4 w-4" />
              )}
              Search Status
            </Button>
          </div>

          {error && <Alert variant="destructive" id="error-message" className="mb-4"><XCircle className="h-4 w-4"/><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

          {application && (
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-2xl">Application Found: {application.id}</CardTitle>
                        <CardDescription>Submitted on: {format(new Date(application.submissionDate), 'PPP p')}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(application.status)} className="text-base capitalize px-3 py-1 self-start sm:self-center">
                        {getStatusIcon(application.status)}
                        {application.status.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary" />Applicant Details</h3>
                        <DetailItem label="Full Name" value={`${application.personalInfo.firstName} ${application.personalInfo.middleName || ''} ${application.personalInfo.lastName}`} />
                        <DetailItem label="Date of Birth" value={format(new Date(application.personalInfo.dob), 'PPP')} />
                        <DetailItem label="Application Type" value={applicationTypeLabels[application.applicationType || '']} />
                    </div>
                    <div>
                         <h3 className="font-semibold text-lg mb-2 flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/>Officer Remarks</h3>
                         <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[60px]">
                            {application.remarks || (application.status.startsWith('approved') ? 'Application Approved.' : (application.status === 'rejected' ? 'See specific rejection reasons if provided, or contact COMELEC.' : 'No remarks provided yet.'))}
                         </p>
                    </div>
                </div>

                {application.classification && (
                  <Card className="bg-secondary/30">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center"><Info className="mr-2 h-4 w-4 text-blue-600"/>AI Classification (For Officer Use)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p><strong>Type:</strong> {application.classification.applicantType}</p>
                      <p><strong>Confidence:</strong> {(application.classification.confidence * 100).toFixed(0)}%</p>
                      <p><strong>Reason:</strong> {application.classification.reason}</p>
                    </CardContent>
                  </Card>
                )}

                {(application.status === 'approvedAwaitingBiometrics') && (
                    <Card className="border-green-500 border-2 bg-green-50 dark:bg-green-900/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-green-700 dark:text-green-400 flex items-center"><CalendarCheck className="mr-2 h-6 w-6"/>Action Required: Schedule Biometrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-green-600 dark:text-green-300 mb-4">
                                Congratulations! Your initial application has been approved. Please schedule your onsite biometrics capture (photo, fingerprints, signature) to complete your registration.
                            </p>
                            <Button
                                onClick={() => router.push(`/public/schedule-biometrics/${application.id}`)}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                            >
                                <CalendarPlus className="mr-2 h-5 w-5" /> Schedule Biometrics Appointment
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {application.status === 'approvedBiometricsScheduled' && application.biometricsSchedule && (
                    <Card className="border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center"><CalendarDays className="mr-2 h-6 w-6"/>Biometrics Scheduled!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p><strong>Date:</strong> {format(new Date(application.biometricsSchedule.date), 'PPP')}</p>
                            <p><strong>Time:</strong> {application.biometricsSchedule.time}</p>
                            <p><strong>Location:</strong> {application.biometricsSchedule.location}</p>
                            <p className="text-sm text-muted-foreground mt-2">Please arrive on time with a valid ID.</p>
                        </CardContent>
                    </Card>
                )}
                
                {application.status === 'approved' && (
                    <Card className="border-primary border-2 bg-primary/5 dark:bg-primary/10">
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center"><CheckCircle className="mr-2 h-6 w-6"/>Registration Complete & Approved!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <DetailItem label="Voter ID" value={application.voterId} />
                            <DetailItem label="Precinct No." value={application.precinct} />
                            <DetailItem label="Approval Date" value={application.approvalDate ? format(new Date(application.approvalDate), 'PPP p') : 'N/A'} />
                            <p className="text-sm text-muted-foreground mt-2">You are now a registered voter. Thank you!</p>
                        </CardContent>
                    </Card>
                )}


                {application.status === 'rejected' && (
                    <Alert variant="destructive" className="mt-4">
                        <XCircle className="h-5 w-5" />
                        <AlertTitle>Application Rejected</AlertTitle>
                        <AlertDescription>
                            We regret to inform you that your application was rejected.
                            {application.remarks && <p className="mt-2"><strong>Reason:</strong> {application.remarks}</p>}
                            <p className="mt-2">Please contact your local COMELEC office for further assistance or clarification if needed. You may need to re-apply with corrected information or additional documents.</p>
                        </AlertDescription>
                    </Alert>
                )}


              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

