
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Search, User, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applicationId.trim()) return;
    setIsLoading(true);
    setNotFound(false);
    setApplication(null);

    // Simulate API call delay
    setTimeout(() => {
      const foundApp = getApplicationById(applicationId.trim());
      if (foundApp) {
        setApplication(foundApp);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, 500);
  };
  
  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      'reactivation': 'Reactivation of Registration',
      'changeCorrection': 'Change of Name/Correction of Entries',
      'inclusionReinstatement': 'Inclusion of Records/Reinstatement of Name',
      '': 'Unknown Type'
  };

  const StatusDisplay = ({ status }: { status: Application['status'] }) => {
    let icon = <Clock className="h-4 w-4 mr-2" />;
    let text = 'Pending Review';
    let variant: "default" | "secondary" | "destructive" | "outline" = 'secondary';

    if (status === 'approved') {
      icon = <CheckCircle className="h-4 w-4 mr-2" />;
      text = 'Approved';
      variant = 'default';
    } else if (status === 'rejected') {
      icon = <XCircle className="h-4 w-4 mr-2" />;
      text = 'Rejected';
      variant = 'destructive';
    } else if (status === 'reviewing') {
      icon = <Search className="h-4 w-4 mr-2" />;
      text = 'Currently Reviewing';
      variant = 'outline';
    }
    return <Badge variant={variant} className="text-sm px-3 py-1">{icon}{text}</Badge>;
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Track Your Application</CardTitle>
          <CardDescription>Enter your Application ID to check its current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="applicationId" className="text-lg">Application ID</Label>
              <Input
                id="applicationId"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter your Application ID (e.g., APP-XXXXXX)"
                className="text-base py-3"
                required
              />
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              Track Status
            </Button>
          </form>
        </CardContent>
      </Card>

      {notFound && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            No application found with the ID: <span className="font-semibold">{applicationId}</span>. Please check the ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {application && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <FileText className="mr-3 h-7 w-7 text-primary" /> Application Status
            </CardTitle>
            <CardDescription>
              Details for Application ID: <span className="font-semibold text-primary">{application.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-lg">
                <span className="font-medium text-muted-foreground">Applicant:</span>
                <span className="ml-2 font-semibold">{application.personalInfo.firstName} {application.personalInfo.lastName}</span>
              </p>
              <StatusDisplay status={application.status} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
                <p><span className="font-medium text-muted-foreground">Submission Date:</span> {format(new Date(application.submissionDate), 'PPP p')}</p>
                <p><span className="font-medium text-muted-foreground">Application Type:</span> {applicationTypeLabels[application.applicationType || '']}</p>
            </div>

            {application.status === 'approved' && (
              <Alert variant="default" className="mt-4 bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-700">Application Approved!</AlertTitle>
                <AlertDescription className="text-green-600 space-y-1">
                  <p>Your voter registration has been approved.</p>
                  {application.voterId && <p><strong>Voter ID:</strong> {application.voterId}</p>}
                  {application.precinct && <p><strong>Precinct No.:</strong> {application.precinct}</p>}
                </AlertDescription>
              </Alert>
            )}

            {application.status === 'rejected' && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Application Rejected</AlertTitle>
                <AlertDescription>
                  We regret to inform you that your application was not approved at this time.
                  {application.remarks && <p className="mt-2"><strong>Reason:</strong> {application.remarks}</p>}
                  {!application.remarks && <p className="mt-2">Please contact your local election office for more details.</p>}
                </AlertDescription>
              </Alert>
            )}
             {(application.status === 'pending' || application.status === 'reviewing') && (
              <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200">
                <Clock className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-700">Status Update</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Your application is currently <span className="font-semibold">{application.status === 'pending' ? 'pending initial review' : 'undergoing detailed review'}</span>. Please check back later for updates.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
