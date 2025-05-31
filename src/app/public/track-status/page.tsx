
'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, FileSearch, Search as SearchIcon, User, CalendarDays, Users as SexIcon, Info, CheckCircle, Clock, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setNotFound(false);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    // Simulate API delay for fetching application
    await new Promise(resolve => setTimeout(resolve, 700));
    const app = getApplicationById(applicationId.trim());
    if (app) {
      setSearchedApplication(app);
    } else {
      setSearchedApplication(null);
      setNotFound(true);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  
  const DetailItem = ({ label, value, icon, isBoolean = false, className }: { label: string; value?: string | number | null | boolean | string[]; icon?: React.ElementType; isBoolean?: boolean; className?: string }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) return null;
    
    let displayValue = String(value);
    if (isBoolean) {
        displayValue = value ? 'Yes' : 'No';
    } else if (label === "Date of Birth" && typeof value === 'string') {
        try {
            displayValue = format(parseISO(value), 'PPP');
        } catch (e) {
            // if value is not a valid ISO string, display as is or handle error
            displayValue = value;
        }
    } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
    }

    return (
      <div className={cn("mb-2 grid grid-cols-[auto,1fr] gap-x-2 items-center", className)}>
        <div className="flex items-center text-sm font-semibold text-muted-foreground">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />} {label}:
        </div>
        <p className="text-sm break-words">{displayValue}</p>
      </div>
    );
  };

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusDescription = (status: Application['status']): string => {
    switch (status) {
      case 'pending': return 'Your application has been received and is awaiting initial review by an election officer.';
      case 'reviewing': return 'Your application is currently being reviewed by an election officer. This may take a few business days.';
      case 'approvedAwaitingBiometrics': return 'Congratulations! Your application has been preliminarily approved. Please wait for instructions on your biometrics capture schedule.';
      case 'approvedBiometricsScheduled': return 'Your biometrics capture has been scheduled. Please see the schedule details below.';
      case 'approved': return 'Your application has been fully approved and your voter registration is complete!';
      case 'rejected': return 'Your application has been rejected. Please see the officer remarks for details. You may need to re-apply or provide further information.';
      default: return 'The status of your application is being determined.';
    }
  };

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      '': 'Unknown Type'
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <FileSearch className="h-8 w-8 mr-3 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Track Your Application</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>
            Enter your Application ID below to check the current status of your voter registration application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Application ID (e.g., APP-12345)"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !applicationId.trim()}>
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SearchIcon className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center p-10">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-2 text-muted-foreground">Searching for application...</p>
        </div>
      )}

      {notFound && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            No application found with ID: <strong>{applicationId}</strong>. Please check the ID and try again.
            If you believe this is an error, please contact COMELEC support.
          </AlertDescription>
        </Alert>
      )}

      {searchedApplication && !isLoading && (
        <>
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">Application Status: {searchedApplication.id}</CardTitle>
                <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-lg capitalize">
                  {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
              <CardDescription>{getStatusDescription(searchedApplication.status)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.lastName}`} icon={User} />
                <DetailItem label="Date of Birth" value={searchedApplication.personalInfo.dob} icon={CalendarDays} />
                <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={SexIcon} />
                <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText}/>
                <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'PPP p')} icon={CalendarDays} />
                
                {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && (
                  <>
                    {searchedApplication.voterId && <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />}
                    {searchedApplication.precinct && <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />}
                  </>
                )}
                 {searchedApplication.approvalDate && (searchedApplication.status.startsWith('approved')) && (
                    <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
                 )}

              </div>

              {searchedApplication.biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                <Card className="mt-4 border-blue-300">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-blue-700"><Clock className="mr-2" /> Biometrics Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DetailItem label="Scheduled Date" value={format(parseISO(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays} />
                    <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                    <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin} />
                  </CardContent>
                </Card>
              )}

              {searchedApplication.remarks && (
                <div className="mt-4">
                  <Label className="text-md font-semibold text-muted-foreground">Officer Remarks:</Label>
                  <p className="text-sm p-3 bg-muted/50 rounded-md">{searchedApplication.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <AcknowledgementReceipt application={searchedApplication} />
        </>
      )}
    </div>
  );
}

