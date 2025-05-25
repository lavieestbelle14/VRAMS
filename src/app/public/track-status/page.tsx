
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Search, User, CalendarDays, FileText, CheckCircle, XCircle, Info, ShieldHalf } from 'lucide-react';

const trackStatusSchema = z.object({
  applicationId: z.string().min(1, { message: 'Application ID is required' }),
});

type TrackStatusFormValues = z.infer<typeof trackStatusSchema>;

const DetailItem = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || value === '') return null;
    return (
      <div className="mb-3">
        <p className="text-sm font-semibold text-muted-foreground flex items-center">
         {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </p>
        <p className="text-md">{String(value)}</p>
      </div>
    );
};


export default function TrackStatusPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TrackStatusFormValues>({
    resolver: zodResolver(trackStatusSchema),
    defaultValues: {
      applicationId: '',
    },
  });

  function onSubmit(data: TrackStatusFormValues) {
    setIsLoading(true);
    setApplication(null);
    setNotFound(false);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      const appData = getApplicationById(data.applicationId.trim());
      if (appData) {
        setApplication(appData);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, 500);
  }

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'reviewing': return 'outline';
      default: return 'outline';
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Track Application Status</CardTitle>
          <CardDescription>Enter your application ID to check its current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="applicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application ID</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input placeholder="e.g., APP-123456" {...field} className="rounded-r-none" />
                        <Button type="submit" className="rounded-l-none" disabled={isLoading}>
                          {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                           <span className="ml-2 hidden sm:inline">Track</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {application && (
        <Card className="max-w-2xl mx-auto mt-6 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl">Application Found</CardTitle>
                    <CardDescription>Status for Application ID: <span className="font-semibold text-primary">{application.id}</span></CardDescription>
                </div>
                <Badge variant={getStatusVariant(application.status)} className="text-sm capitalize">
                    {application.status}
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailItem label="Applicant Name" value={`${application.personalInfo.firstName} ${application.personalInfo.lastName}`} icon={User} />
            <DetailItem label="Submission Date" value={format(new Date(application.submissionDate), 'PPP')} icon={CalendarDays} />
            <DetailItem label="Application Type" value={applicationTypeLabels[application.applicationType || '']} icon={FileText} />
            
            {application.status === 'approved' && application.voterId && (
              <DetailItem label="Voter ID" value={application.voterId} icon={CheckCircle} />
            )}
            {application.status === 'approved' && application.precinct && (
              <DetailItem label="Precinct No." value={application.precinct} icon={Info} />
            )}
            {application.status === 'approved' && application.approvalDate && (
              <DetailItem label="Approval Date" value={format(new Date(application.approvalDate), 'PPP')} icon={CalendarDays} />
            )}
            {application.classification && (
              <>
                <DetailItem label="AI Classified Type" value={application.classification.applicantType} icon={ShieldHalf} />
                <DetailItem label="AI Classification Confidence" value={`${(application.classification.confidence * 100).toFixed(0)}%`} icon={Info} />
              </>
            )}
          </CardContent>
            {(application.status === 'pending' || application.status === 'reviewing') && (
                <CardContent className="pt-0">
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}</AlertTitle>
                        <AlertDescription>
                            Your application is currently being processed. Please check back later for updates.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            )}
             {application.status === 'rejected' && (
                <CardContent className="pt-0">
                     <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Status: Rejected</AlertTitle>
                        <AlertDescription>
                            Unfortunately, your application was not approved. Please contact your local election office for more details if needed.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            )}
        </Card>
      )}

      {notFound && (
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            The Application ID you entered could not be found. Please check the ID and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
