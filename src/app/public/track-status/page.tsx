
'use client';
import { useState } from 'react';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Info, CheckCircle, XCircle, Clock, User, FileText, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';

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
    // Simulate API delay
    setTimeout(() => {
      const appData = getApplicationById(applicationId.trim());
      if (appData) {
        setApplication(appData);
      } else {
        setError(`Application ID "${applicationId.trim()}" not found. Please check the ID and try again.`);
        setApplication(null);
      }
      setIsLoading(false);
    }, 500);
  };

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default'; // Primary color (blue)
      case 'pending': return 'secondary'; // Lighter muted color
      case 'rejected': return 'destructive';
      case 'reviewing': return 'outline'; // Should probably be a yellow/orange, using outline for now
      default: return 'outline';
    }
  };
  
  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'reviewing': return <Info className="h-5 w-5 text-blue-600" />; // Using Info for reviewing
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      'reactivation': 'Reactivation of Registration',
      'changeCorrection': 'Change of Name/Correction of Entries',
      'inclusionReinstatement': 'Inclusion of Records/Reinstatement of Name',
      '': 'Unknown Type'
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Track Application Status</CardTitle>
          <CardDescription>Enter your Application ID to check its current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Label htmlFor="applicationId" className="sr-only">Application ID</Label>
            <Input
              id="applicationId"
              type="text"
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value);
                if(error) setError(null); // Clear error on input change
                if(application) setApplication(null); // Clear previous results
              }}
              placeholder="Enter your Application ID (e.g., APP-XXXXXX)"
              className="flex-grow"
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

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {application && (
            <Card className="mt-6 border-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Application Found</CardTitle>
                    <CardDescription>ID: {application.id}</CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(application.status)} className="text-lg capitalize flex items-center gap-2">
                    {getStatusIcon(application.status)} {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Applicant:</strong> {application.personalInfo.firstName} {application.personalInfo.lastName}</p>
                  <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Submitted:</strong> {format(new Date(application.submissionDate), 'PPP p')}</p>
                  <p className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Type:</strong> {applicationTypeLabels[application.applicationType || '']}</p>
                </div>
                
                {application.status === 'approved' && (
                  <Alert variant="default" className="bg-green-50 border-green-300">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-700">Application Approved!</AlertTitle>
                    <AlertDescription className="text-green-600 space-y-1">
                      <p>Your voter registration has been approved.</p>
                      {application.voterId && <p><strong>Voter ID:</strong> {application.voterId}</p>}
                      {application.precinct && <p><strong>Precinct No.:</strong> {application.precinct}</p>}
                      {application.approvalDate && <p><strong>Approval Date:</strong> {format(new Date(application.approvalDate), 'PPP p')}</p>}
                    </AlertDescription>
                  </Alert>
                )}
                {application.status === 'rejected' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Application Rejected</AlertTitle>
                    <AlertDescription>
                      We regret to inform you that your application was not approved. 
                      Please contact your local COMELEC office for more details.
                      {application.remarks && <p className="mt-2 text-xs">Officer Remark (Summary): {application.remarks.substring(0,100)}{application.remarks.length > 100 ? '...' : ''}</p>}
                    </AlertDescription>
                  </Alert>
                )}
                 {application.status === 'pending' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Application Pending</AlertTitle>
                    <AlertDescription>Your application is currently pending review. Please check back later for updates.</AlertDescription>
                  </Alert>
                )}
                 {application.status === 'reviewing' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Application Under Review</AlertTitle>
                    <AlertDescription>Your application is currently under review by an election officer. Please check back later for updates.</AlertDescription>
                  </Alert>
                )}
                
                <AcknowledgementReceipt application={application} />

              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
