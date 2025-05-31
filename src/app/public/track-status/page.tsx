
'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { ArrowLeft, Search as SearchIcon, FileText, CheckCircle, XCircle, Info, User, MapPin, CalendarDays, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { format } from 'date-fns';

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setSearchAttempted(false);
      return;
    }
    setIsLoading(true);
    setSearchAttempted(true);
    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim());
      setSearchedApplication(app || null);
      setIsLoading(false);
    }, 500);
  };

  const getStatusBadgeVariant = (status?: Application['status']) => {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <SearchIcon className="mr-3 h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-primary">Track Your Application</h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to see the current status of your voter registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="e.g., APP-123456"
              value={applicationId}
              onChange={(e) => {
                setApplicationId(e.target.value);
                setSearchAttempted(false); 
                setSearchedApplication(null);
              }}
              className="flex-grow"
            />
            <Button type="button" onClick={handleSearch} disabled={isLoading || !applicationId.trim()}>
              {isLoading ? (
                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <SearchIcon className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {searchAttempted && !isLoading && !searchedApplication && (
        <Alert variant="destructive" className="shadow-md">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            No application found with ID: <strong>{applicationId}</strong>. Please check the ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {searchedApplication && !isLoading && (
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Application Status: {searchedApplication.id}
                    </CardTitle>
                    <CardDescription>
                        Submitted on: {format(new Date(searchedApplication.submissionDate), 'PPP p')} by {searchedApplication.personalInfo.firstName} {searchedApplication.personalInfo.lastName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center">
                        <span className="font-semibold mr-2">Current Status:</span>
                        <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-base capitalize">
                            {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                    </div>

                    {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approvedAwaitingBiometrics') && searchedApplication.voterId && (
                         <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />
                    )}
                    {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approvedAwaitingBiometrics') && searchedApplication.precinct && (
                         <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
                    )}
                     {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.approvalDate && (
                         <DetailItem label="Approval Date" value={format(new Date(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
                    )}

                    {searchedApplication.remarks && (
                        <div>
                            <p className="font-semibold text-sm">Officer Remarks:</p>
                            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{searchedApplication.remarks}</p>
                        </div>
                    )}
                    
                    {searchedApplication.biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                        <Card className="mt-4 border-blue-300">
                            <CardHeader><CardTitle className="flex items-center text-blue-600"><Clock className="mr-2"/>Biometrics Schedule</CardTitle></CardHeader>
                            <CardContent>
                                <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                                <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock}/>
                                <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin}/>
                            </CardContent>
                        </Card>
                    )}

                    {searchedApplication.status === 'pending' && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Application Pending</AlertTitle>
                            <AlertDescription>
                            Your application is currently pending review. Please check back later for updates.
                            </AlertDescription>
                        </Alert>
                    )}
                     {searchedApplication.status === 'reviewing' && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Application Under Review</AlertTitle>
                            <AlertDescription>
                            Your application is currently being reviewed by an election officer.
                            </AlertDescription>
                        </Alert>
                    )}
                    {searchedApplication.status === 'rejected' && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Application Rejected</AlertTitle>
                            <AlertDescription>
                            Unfortunately, your application was rejected. Please see officer remarks for details. You may need to re-apply or contact COMELEC for further assistance.
                            </AlertDescription>
                        </Alert>
                    )}
                    {searchedApplication.status === 'approvedAwaitingBiometrics' && (
                         <Alert variant="default" className="bg-blue-50 border-blue-300 text-blue-700">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-700">Approved - Awaiting Biometrics</AlertTitle>
                            <AlertDescription className="text-blue-600">
                            Your application has been initially approved! Please wait for your biometrics capture schedule. You will be notified via email or SMS if contact details were provided.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}
    </div>
  );
}

// Helper Label component if not globally available or for specific styling
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);
