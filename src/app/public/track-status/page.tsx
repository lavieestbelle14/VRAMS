
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search as SearchIconLucide, Printer, CheckCircle, XCircle, Clock, CalendarDays, MapPin as MapPinIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt'; // Assume this component exists and is styled
import { Label } from '@/components/ui/label'; // For DetailItem
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// DetailItem for displaying structured information in the status card
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
    <div className="mb-2 last:mb-0">
      <Label className="text-sm font-semibold text-muted-foreground flex items-center">
        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
      </Label>
      <p className="text-sm">{displayValue}</p>
    </div>
  );
};


export default function TrackApplicationStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = () => {
    if (!applicationId.trim()) {
      toast({ title: 'Error', description: 'Please enter an Application ID.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setSearchedApplication(null);
    setNotFound(false);

    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim());
      if (app) {
        setSearchedApplication(app);
      } else {
        setNotFound(true);
        toast({ title: 'Not Found', description: `Application ID "${applicationId}" not found.`, variant: 'destructive'});
      }
      setIsLoading(false);
    }, 1000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };
  
  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': case 'approvedAwaitingBiometrics': case 'approvedBiometricsScheduled': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <SearchIconLucide className="mr-3 h-8 w-8" /> Track Your Application
        </h2>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <Card className="w-full max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID below to see its current status and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                placeholder="Enter Application ID (e.g., APP-123456)"
                className="pl-10 pr-4 py-2 w-full text-base"
                aria-label="Application ID"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleSearch} disabled={!applicationId.trim() || isLoading} className="w-full sm:w-auto self-end">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SearchIconLucide className="mr-2 h-4 w-4" />
              )}
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
          <p className="ml-3 text-muted-foreground">Searching for application...</p>
        </div>
      )}

      {notFound && !isLoading && (
         <Alert variant="destructive" className="max-w-xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            No application was found with the ID "{applicationId}". Please check the ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {searchedApplication && !isLoading && (
        <>
          <Card className="mt-6 max-w-xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Application Status Overview</span>
                <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-sm capitalize">
                  {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Current status for Application ID: <strong>{searchedApplication.id}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && (
                <>
                  {searchedApplication.voterId && <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />}
                  {searchedApplication.precinct && <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPinIcon} />}
                  {searchedApplication.approvalDate && <DetailItem label="Approval Date" value={format(new Date(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />}
                </>
              )}
               {searchedApplication.biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                <Card className="bg-muted/50 p-4 rounded-md">
                    <CardTitle className="text-base flex items-center mb-2"><Clock className="mr-2 text-blue-500 h-5 w-5"/>Biometrics Schedule</CardTitle>
                    <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                    <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock}/>
                    <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPinIcon}/>
                </Card>
              )}
              <DetailItem label="Officer Remarks" value={searchedApplication.remarks || (searchedApplication.status.startsWith('approved') ? 'Application Approved.' : (searchedApplication.status === 'rejected' ? 'Application Rejected.' : 'No remarks provided.'))} icon={Info} />
             
              {searchedApplication.status === 'pending' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Pending Review</AlertTitle>
                  <AlertDescription>
                    Your application is currently pending review by an election officer. Please check back later for updates.
                  </AlertDescription>
                </Alert>
              )}
              {searchedApplication.status === 'reviewing' && (
                 <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Under Review</AlertTitle>
                  <AlertDescription>
                    Your application is currently being reviewed by an election officer. You will be notified of the outcome.
                  </AlertDescription>
                </Alert>
              )}
               {searchedApplication.status === 'approvedAwaitingBiometrics' && (
                 <Alert variant="default" className="border-green-500 bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Approved - Awaiting Biometrics</AlertTitle>
                    <AlertDescription>
                        Your application has been initially approved. Please wait for your biometrics capture schedule. You will be notified via email or SMS if contact details were provided, or check this page again later.
                    </AlertDescription>
                 </Alert>
               )}
               {searchedApplication.status === 'rejected' && (
                 <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Application Rejected</AlertTitle>
                    <AlertDescription>
                        Unfortunately, your application was rejected. Reason: {searchedApplication.remarks || "Please contact your local COMELEC office for details."}
                    </AlertDescription>
                 </Alert>
               )}


            </CardContent>
             {/* Removed the print button from status summary to avoid redundancy with AcknowledgementReceipt's print. */}
          </Card>

          <div id="printable-receipt-area" className="mt-8">
            {searchedApplication && <AcknowledgementReceipt application={searchedApplication} />}
          </div>
        </>
      )}
    </div>
  );
}
