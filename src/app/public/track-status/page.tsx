
'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, User, MapPin, CalendarDays, Briefcase, FileText, Users, Clock, Info, FileSearch, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils'; // Added this import

export default function TrackStatusPage() {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setNotFound(false);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    // Simulate API call
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

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'reviewing':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusExplanation = (status: Application['status']): string => {
    switch (status) {
      case 'pending':
        return "Your application has been submitted and is awaiting initial review by an election officer.";
      case 'reviewing':
        return "An election officer is currently reviewing your application details and documents.";
      case 'approvedAwaitingBiometrics':
        return "Your application has been preliminarily approved. You will be contacted for biometrics capture scheduling.";
      case 'approvedBiometricsScheduled':
        return "Your biometrics capture has been scheduled. Please attend on the specified date and location.";
      case 'approved':
        return "Congratulations! Your voter registration application has been fully approved. Your Voter ID and precinct details are now available.";
      case 'rejected':
        return "Your application could not be approved at this time. Please see remarks for details.";
      default:
        return "The status of your application is being processed.";
    }
  };

  const DetailItem = ({ label, value, icon, className, isBoolean = false }: { label: string; value?: string | number | null | boolean | string[]; icon?: React.ElementType; className?: string; isBoolean?: boolean }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) ) return null;
    
    let displayValue = String(value);
    if (isBoolean) {
        displayValue = value ? 'Yes' : 'No';
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
  
  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      '': 'Unknown Type'
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center">
          <FileSearch className="mr-3 h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Track Your Application</h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to view its current status and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="applicationId" className="sr-only">Application ID</Label>
              <div className="relative">
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="applicationId"
                  type="text"
                  placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading || !applicationId.trim()}>
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-2 text-muted-foreground">Searching for application...</p>
        </div>
      )}

      {notFound && (
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><Info className="mr-2"/>Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No application found with ID: <strong>{applicationId}</strong>. Please check the ID and try again.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              If you recently submitted an application, it might take a few moments to appear in the system.
              If you believe this is an error, please contact COMELEC support or visit your local office.
            </p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && !isLoading && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-6 w-6 text-primary" />
                Application Status: {searchedApplication.id}
              </CardTitle>
              <CardDescription>
                Current status and details for your voter registration application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label className="text-lg font-semibold">Status:</Label>
                <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-lg capitalize">
                  {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground pl-2 border-l-2 border-primary ml-1 italic">
                {getStatusExplanation(searchedApplication.status)}
              </p>

              <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.lastName}`} icon={User} />
              <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'MMMM d, yyyy')} icon={CalendarDays} />
              <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={Users} />
              <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText} />
              <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'MMMM d, yyyy, p')} icon={CalendarDays} />

              {(searchedApplication.status === 'approved' || searchedApplication.status.startsWith('approved')) && searchedApplication.voterId && (
                <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} className="text-green-600 font-semibold" />
              )}
              {(searchedApplication.status === 'approved' || searchedApplication.status.startsWith('approved')) && searchedApplication.precinct && (
                <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
              )}
              {searchedApplication.approvalDate && (searchedApplication.status === 'approved' || searchedApplication.status.startsWith('approved')) && (
                <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'MMMM d, yyyy, p')} icon={CalendarDays} />
              )}
              {searchedApplication.remarks && (
                <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={Info} />
              )}
              
              {searchedApplication.biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                <Card className="mt-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center text-blue-700 dark:text-blue-300"><Clock className="mr-2 h-5 w-5"/>Biometrics Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <DetailItem label="Date" value={format(parseISO(searchedApplication.biometricsSchedule.date), 'MMMM d, yyyy')} icon={CalendarDays}/>
                        <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                        <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin} />
                        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">Please bring a valid ID. If you need to reschedule, contact your local COMELEC office immediately.</p>
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

