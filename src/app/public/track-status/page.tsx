
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, Home, CheckCircle, XCircle, MessageSquare, User, MapPin, CalendarDays, Briefcase, ShieldCheck, Users, Building, Accessibility, Clock as ClockIcon } from 'lucide-react'; // Added ClockIcon
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { format } from 'date-fns';

export default function TrackApplicationStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = async () => {
    if (!applicationId.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an Application ID.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSearchedApplication(null);
    setNotFound(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const appData = getApplicationById(applicationId.trim());
    if (appData) {
      setSearchedApplication(appData);
    } else {
      setNotFound(true);
      toast({
        title: 'Not Found',
        description: `Application ID "${applicationId}" not found. Please check the ID and try again.`,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
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


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Track Your Application
          </h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID below to see its current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter Application ID (e.g., APP-123456)"
              className="pl-10 pr-2 py-2 text-base"
              aria-label="Application ID"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleSearch} disabled={isLoading || !applicationId.trim()}>
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : <Search className="mr-2 h-4 w-4" />}
                Search
            </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-2 text-muted-foreground">Searching...</p>
        </div>
      )}

      {notFound && !isLoading && (
        <Card className="w-full max-w-2xl mx-auto border-destructive shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <XCircle className="mr-2 h-5 w-5" /> Application Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>No application was found with the ID: <strong>{applicationId}</strong>.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please double-check the Application ID and try again. Ensure you have entered it exactly as it appears on your acknowledgement receipt.
            </p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && !isLoading && (
        <div className="space-y-6 mt-6">
            <Card className="w-full max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">Application Status: {searchedApplication.id}</CardTitle>
                            <CardDescription>
                            Submitted on: {format(new Date(searchedApplication.submissionDate), 'PPP p')}
                            </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-lg capitalize">
                            {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {searchedApplication.status === 'approved' && (
                        <div className="space-y-2 mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <h3 className="text-lg font-semibold text-green-700 flex items-center"><CheckCircle className="mr-2 h-5 w-5"/>Application Approved!</h3>
                            <DetailItem label="Voter ID" value={searchedApplication.voterId} />
                            <DetailItem label="Precinct No." value={searchedApplication.precinct} />
                            <DetailItem label="Approval Date" value={searchedApplication.approvalDate ? format(new Date(searchedApplication.approvalDate), 'PPP p') : 'N/A'} />
                        </div>
                    )}
                    {searchedApplication.status === 'approvedAwaitingBiometrics' && (
                        <div className="space-y-2 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <h3 className="text-lg font-semibold text-blue-700 flex items-center"><CheckCircle className="mr-2 h-5 w-5"/>Approved - Awaiting Biometrics</h3>
                            <p className="text-sm">Your application has been initially approved. Please wait for your biometrics capture schedule or proceed to the COMELEC office.</p>
                            <Button size="sm" className="mt-2" onClick={() => router.push(`/public/schedule-biometrics/${searchedApplication.id}`)}>
                                Schedule Biometrics Online (if available)
                            </Button>
                        </div>
                    )}
                    {searchedApplication.status === 'approvedBiometricsScheduled' && searchedApplication.biometricsSchedule && (
                        <Card className="mb-4 border-blue-500">
                            <CardHeader><CardTitle className="flex items-center text-blue-600"><ClockIcon className="mr-2"/>Biometrics Schedule</CardTitle></CardHeader>
                            <CardContent>
                                <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                                <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={ClockIcon}/>
                                <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin}/>
                                <p className="text-xs text-muted-foreground mt-2">Please bring a valid ID to your biometrics appointment.</p>
                            </CardContent>
                        </Card>
                    )}
                     {searchedApplication.status === 'rejected' && (
                        <div className="space-y-2 mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <h3 className="text-lg font-semibold text-red-700 flex items-center"><XCircle className="mr-2 h-5 w-5"/>Application Rejected</h3>
                        </div>
                    )}
                    {searchedApplication.remarks && (
                        <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={MessageSquare} />
                    )}
                    {searchedApplication.classification && (
                         <Card className="mt-4 bg-muted/50">
                            <CardHeader><CardTitle className="text-md flex items-center"><Search className="mr-2 h-4 w-4 text-muted-foreground" /> AI Classification</CardTitle></CardHeader>
                            <CardContent>
                                <DetailItem label="Classified Type" value={searchedApplication.classification.applicantType} />
                                <DetailItem label="Confidence" value={`${(searchedApplication.classification.confidence * 100).toFixed(0)}%`} />
                                <DetailItem label="Reason" value={searchedApplication.classification.reason} />
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}
    </div>
  );
}
