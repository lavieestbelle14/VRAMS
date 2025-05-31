
'use client';
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search as SearchIcon, CalendarDays, Clock, MapPin, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function TrackApplicationStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setNotFound(false);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    setSearchedApplication(null); 
    
    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim());
      if (app) {
        setSearchedApplication(app);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, 1000);
  };
  
  useEffect(() => {
    // Clear results if input is cleared
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setNotFound(false);
    }
  }, [applicationId]);

  const getStatusBadgeVariant = (status?: Application['status']) => {
    if (!status) return 'secondary';
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
        <p className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </p>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SearchIcon className="h-7 w-7 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">Track Your Application</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card className="w-full"> {/* Removed max-w-2xl mx-auto */}
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID below to see the current status of your voter registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-2">
            <div className="relative flex-grow w-full sm:w-auto">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter Application ID (e.g., APP-12345)"
                className="pl-10 w-full"
                aria-label="Application ID"
              />
            </div>
            <Button type="submit" disabled={isLoading || !applicationId.trim()} className="w-full sm:w-auto">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SearchIcon className="mr-2 h-4 w-4 sm:hidden" /> 
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex flex-col items-center justify-center text-center py-10 bg-card rounded-lg shadow">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold">Searching for application...</p>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      )}

      {notFound && !isLoading && (
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-6 w-6"/>Application Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>No application was found with the ID: <strong>{applicationId}</strong>.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please double-check the Application ID and try again. Ensure you have entered it exactly as it was provided.
            </p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && !isLoading && (
        <div className="space-y-6 mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">Application Status</CardTitle>
                            <CardDescription>ID: {searchedApplication.id}</CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-lg capitalize">
                            {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {searchedApplication.voterId && <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />}
                    {searchedApplication.precinct && <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />}
                    {searchedApplication.approvalDate && <DetailItem label="Approval Date" value={format(new Date(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />}
                    
                    {searchedApplication.biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className="font-semibold mb-2 flex items-center"><Info className="mr-2 h-5 w-5 text-primary" /> Biometrics Schedule</h4>
                            <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                            <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock}/>
                            <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin}/>
                        </div>
                    )}

                    <DetailItem label="Officer Remarks" value={searchedApplication.remarks || (searchedApplication.status.startsWith('approved') ? 'Application Approved.' : 'No remarks provided.')} icon={Info} />
                
                    {searchedApplication.status === 'pending' && (
                        <p className="text-sm text-muted-foreground">Your application is currently pending review. Please check back later for updates.</p>
                    )}
                    {searchedApplication.status === 'reviewing' && (
                        <p className="text-sm text-muted-foreground">Your application is currently under review by an election officer.</p>
                    )}
                     {searchedApplication.status === 'approvedAwaitingBiometrics' && (
                        <p className="text-sm text-green-600 font-medium">Your application has been preliminarily approved and is awaiting biometrics scheduling. You will be notified of your schedule soon or you can check back here for updates.</p>
                    )}
                     {searchedApplication.status === 'approvedBiometricsScheduled' && !searchedApplication.biometricsSchedule && (
                        <p className="text-sm text-blue-600 font-medium">Your biometrics appointment has been scheduled. Details will appear here shortly. Please refresh or check back.</p>
                    )}
                    {searchedApplication.status === 'rejected' && (
                        <p className="text-sm text-destructive font-medium">Your application was rejected. Please see remarks for details. You may need to re-apply or contact COMELEC for clarification.</p>
                    )}

                </CardContent>
            </Card>
            
            <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}
    </div>
  );
}

