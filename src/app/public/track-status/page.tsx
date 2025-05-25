
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { format } from 'date-fns';
import { Search, User, CalendarDays, FileTextIcon, CheckCircle, XCircle, ListChecks, Info } from 'lucide-react';

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrackApplication = (e: React.FormEvent) => {
    e.preventDefault();
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

    // Simulate API call delay
    setTimeout(() => {
      const appData = getApplicationById(applicationId.trim());
      if (appData) {
        setApplication(appData);
      } else {
        setError(`Application with ID "${applicationId.trim()}" not found. Please check the ID and try again.`);
      }
      setIsLoading(false);
    }, 500);
  };

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'reviewing': return 'outline';
      default: return 'outline';
    }
  };

  const DetailItem = ({ label, value, icon }: { label: string; value?: string | React.ReactNode; icon?: React.ElementType }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || value === '') return null;
    return (
      <div className="mb-3">
        <Label className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </Label>
        <div className="text-sm pt-1">{value}</div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Track Your Application Status</CardTitle>
          <CardDescription>Enter your application reference number to view its current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackApplication} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID</Label>
              <div className="flex gap-2">
                <Input
                  id="applicationId"
                  value={applicationId}
                  onChange={(e) => {
                    setApplicationId(e.target.value);
                    setSearched(false); // Reset searched state on input change
                    setError(null); // Clear error on input change
                  }}
                  placeholder="Enter your Application ID (e.g., APP-001)"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Track
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-2 text-muted-foreground">Fetching application status...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="w-full max-w-2xl mx-auto border-destructive">
            <CardHeader className="flex-row items-center gap-2">
                 <XCircle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">Tracking Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
        </Card>
      )}

      {application && !isLoading && !error && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              Application Status: {application.id}
            </CardTitle>
            <CardDescription>
              Current status of your voter registration application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Applicant Name" value={`${application.personalInfo.firstName} ${application.personalInfo.lastName}`} icon={User} />
            <DetailItem label="Submission Date" value={format(new Date(application.submissionDate), 'PPP, p')} icon={CalendarDays} />
            <DetailItem label="Application Type" value={<span className="capitalize">{application.applicationType}</span>} icon={FileTextIcon} />
            <DetailItem 
              label="Current Status" 
              value={<Badge variant={getStatusVariant(application.status)} className="text-sm capitalize">{application.status}</Badge>} 
              icon={Info} 
            />

            {application.status === 'approved' && (
              <>
                <hr className="my-4"/>
                <DetailItem label="Voter ID" value={application.voterId} icon={CheckCircle} />
                <DetailItem label="Precinct Number" value={application.precinct} icon={CheckCircle} />
                {application.approvalDate && 
                  <DetailItem label="Approval Date" value={format(new Date(application.approvalDate), 'PPP, p')} icon={CalendarDays} />
                }
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                  Congratulations! Your application has been approved. Your Voter ID and Precinct Number are listed above.
                </div>
              </>
            )}

            {application.status === 'rejected' && (
               <>
                <hr className="my-4"/>
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  <p>Your application could not be approved at this time.</p>
                  <p className="mt-1">Reason: {application.remarks || "Please contact your local election office for more details."}</p>
                </div>
               </>
            )}

            {(application.status === 'pending' || application.status === 'reviewing') && (
                 <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                    Your application is currently <span className="font-semibold">{application.status}</span>. Please check back later for updates.
                </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {searched && !application && !isLoading && !error && (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="h-6 w-6 text-muted-foreground"/>No Application Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No application details to display for ID: "{applicationId}". Please verify the ID or submit an application.</p>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
