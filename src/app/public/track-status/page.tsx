
'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Search as SearchIcon, FileText, CheckCircle, XCircle, CalendarClock, Info, Clock, CalendarDays, MapPin, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function TrackApplicationStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!applicationId.trim()) {
      toast({
        title: 'Missing ID',
        description: 'Please enter an Application ID to search.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSearchedApplication(null);
    setNotFound(false);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const app = getApplicationById(applicationId.trim());
    if (app) {
      setSearchedApplication(app);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  };

  const getStatusBadgeVariant = (status?: Application['status']) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return 'default'; // Greenish/successful
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary'; // Yellowish/pending
      case 'reviewing':
        return 'outline'; // Bluish/info
      default:
        return 'secondary';
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
        <p className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </p>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <SearchIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Track Your Application</h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>
            Enter your Application ID below to check the current status of your voter registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-end gap-2">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                className="pl-10 text-base"
                aria-label="Application ID"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" /> Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-semibold">Searching for your application...</p>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      )}

      {notFound && !isLoading && (
        <Card className="w-full max-w-2xl mx-auto border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <XCircle className="mr-2 h-6 w-6" /> Application Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              No application was found with the ID: <strong>{applicationId}</strong>.
            </p>
            <p className="text-sm mt-2">
              Please double-check the Application ID and try again. If you recently submitted, it might take some time to appear in the system.
            </p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && !isLoading && (
        <div className="space-y-6 mt-6">
          <Card className="w-full max-w-3xl mx-auto shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Application Status</CardTitle>
                  <CardDescription>ID: {searchedApplication.id}</CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-lg capitalize">
                  {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.voterId && (
                <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />
              )}
              {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.precinct && (
                <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
              )}
              {searchedApplication.approvalDate && (searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && (
                <DetailItem label="Approval Date" value={format(new Date(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
              )}
              {searchedApplication.remarks && (
                <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={Info} />
              )}
               {!searchedApplication.remarks && (searchedApplication.status === 'pending' || searchedApplication.status === 'reviewing') && (
                <DetailItem label="Status Note" value="Your application is currently being processed. Please check back later for updates." icon={Info} />
              )}
              {!searchedApplication.remarks && searchedApplication.status.startsWith('approved') && (
                <DetailItem label="Status Note" value="Your application has been approved." icon={CheckCircle} />
              )}

              {searchedApplication.biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                 <Card className="mt-4 border-blue-500 border-2">
                    <CardHeader><CardTitle className="flex items-center text-blue-600"><Clock className="mr-2"/>Biometrics Schedule</CardTitle></CardHeader>
                    <CardContent>
                        <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                        <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock}/>
                        <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin}/>
                        <p className="text-sm text-muted-foreground mt-2">Please arrive on time with a valid ID.</p>
                    </CardContent>
                </Card>
              )}
            </CardContent>
            {searchedApplication.status === 'approvedAwaitingBiometrics' && (
                <CardFooter className="border-t pt-4">
                   <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                    <p className="text-sm text-primary font-semibold">Your application is provisionally approved! Please schedule your biometrics capture.</p>
                    <Button onClick={() => router.push(`/public/schedule-biometrics/${searchedApplication.id}`)} className="sm:ml-auto">
                        <CalendarClock className="mr-2 h-4 w-4" /> Schedule Biometrics
                    </Button>
                   </div>
                </CardFooter>
            )}
          </Card>

          <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}
    </div>
  );
}
