
'use client';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Search as SearchIcon, CheckCircle, XCircle, Clock, CalendarDays, MapPin as MapPinIcon, Info } from 'lucide-react';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt'; // Ensure this is correctly imported
import { Label } from '@/components/ui/label';

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setSearchAttempted(false);
      return;
    }
    setIsLoading(true);
    setSearchAttempted(true);
    // Simulate API call
    setTimeout(() => {
      const appData = getApplicationById(applicationId.trim());
      setSearchedApplication(appData || null);
      setIsLoading(false);
    }, 500);
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
  
  const DetailItem = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) return null;
    
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
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <SearchIcon className="mr-2 h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight text-primary">Track Your Application</h2>
            </div>
            <Button variant="outline" asChild className="rounded-lg">
              <Link href="/public/home">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
          </div>
          <CardDescription className="text-md">
            Enter your Application ID (e.g., APP-123456) to see the current status of your voter registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex w-full gap-2 items-center"> {/* Added w-full here */}
              <Input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="e.g., APP-123456"
                className="flex-grow rounded-lg text-base md:text-sm"
                aria-label="Application ID"
              />
              <Button type="submit" className="rounded-lg">
                <SearchIcon className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </form>

          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="ml-2 text-muted-foreground">Searching for application...</p>
            </div>
          )}

          {searchAttempted && !isLoading && searchedApplication && (
             <Card className="mt-6 border-t pt-4 rounded-xl shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">Application Status: {searchedApplication.id}</CardTitle>
                            <CardDescription>
                                Submitted on: {format(new Date(searchedApplication.submissionDate), 'PPP p')}
                            </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-md capitalize">
                            {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && (
                        <>
                            <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />
                            <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPinIcon} />
                            {searchedApplication.approvalDate && <DetailItem label="Approval Date" value={format(new Date(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />}
                        </>
                    )}
                     <DetailItem label="Officer Remarks" value={searchedApplication.remarks || (searchedApplication.status.startsWith('approved') ? 'Application Approved.' : (searchedApplication.status === 'rejected' ? 'Application Rejected. Please check remarks for details or contact COMELEC.' : 'No specific remarks provided yet.'))} icon={Info} />

                    {searchedApplication.status === 'approvedBiometricsScheduled' && searchedApplication.biometricsSchedule && (
                         <Card className="mt-4 bg-blue-50 border-blue-200">
                            <CardHeader><CardTitle className="text-lg text-blue-700 flex items-center"><Clock className="mr-2"/>Biometrics Schedule</CardTitle></CardHeader>
                            <CardContent>
                                <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                                <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock}/>
                                <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPinIcon}/>
                                <p className="text-sm text-blue-600 mt-2">Please bring a valid ID to your biometrics appointment.</p>
                            </CardContent>
                        </Card>
                    )}
                    {searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule && (
                         <Card className="mt-4 bg-green-50 border-green-200">
                            <CardHeader><CardTitle className="text-lg text-green-700 flex items-center"><CheckCircle className="mr-2"/>Biometrics Completed</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm text-green-600">Biometrics capture completed on {format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} at {searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'}. Your registration is fully approved.</p>
                            </CardContent>
                        </Card>
                    )}


                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Render AcknowledgementReceipt only if application is found */}
      {searchedApplication && !isLoading && searchAttempted && (
        <div id="printable-receipt-area" className="mt-6 bg-card p-4 sm:p-6 rounded-xl shadow-lg">
          <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}

      {searchAttempted && !isLoading && !searchedApplication && (
        <Card className="mt-6 text-center rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center justify-center"><XCircle className="mr-2 h-6 w-6" />Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No application found with ID: <span className="font-semibold">{applicationId}</span>.
              Please check the ID and try again. If the issue persists, contact COMELEC for assistance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

