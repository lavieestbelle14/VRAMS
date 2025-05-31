
'use client';
import { useState, useEffect, FormEvent } from 'react';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search as SearchIcon, User, CalendarDays, FileText, Clock, CheckCircle, XCircle, FileClock, MapPin, Info, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DetailItemProps {
  label: string;
  value?: string | number | null | boolean | string[];
  icon?: React.ElementType;
  isBoolean?: boolean;
  className?: string;
  valueClassName?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon, isBoolean = false, className, valueClassName }) => {
  const IconComponent = icon;
  if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) ) return null;
  
  let displayValue = String(value);
  if (isBoolean) {
      displayValue = value ? 'Yes' : 'No';
  } else if (Array.isArray(value)) {
      displayValue = value.join(', ');
  }

  return (
    <div className={cn("mb-2", className)}>
      <div className="flex items-start text-sm font-semibold text-muted-foreground">
        {IconComponent && <IconComponent className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />} 
        <span className="mr-1">{label}:</span>
      </div>
      <p className={cn("text-sm ml-6", valueClassName)}>{displayValue}</p>
    </div>
  );
};


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!applicationId.trim()) return;

    setIsLoading(true);
    setNotFound(false);
    setSearchedApplication(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const app = getApplicationById(applicationId.trim());
    if (app) {
      setSearchedApplication(app);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  };
  
  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      '': 'Unknown Type'
  };

  const getStatusDisplayInfo = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return { variant: 'secondary', icon: Clock, title: 'Application Pending', message: 'Your application is currently awaiting review by an election officer. Please check back later for updates.' };
      case 'reviewing':
        return { variant: 'outline', icon: SearchIcon, title: 'Application Under Review', message: 'An election officer is currently reviewing your application details. This process may take a few days.' };
      case 'approvedAwaitingBiometrics':
        return { variant: 'default', icon: FileClock, title: 'Approved - Awaiting Biometrics', message: 'Your application has been initially approved! Please proceed to schedule your biometrics capture.' };
      case 'approvedBiometricsScheduled':
        return { variant: 'default', icon: CalendarDays, title: 'Biometrics Scheduled', message: 'Your biometrics capture appointment is scheduled. Please see details below.' };
      case 'approved':
        return { variant: 'default', icon: CheckCircle, title: 'Application Approved!', message: 'Congratulations! Your voter registration application has been approved. You are now a registered voter.' };
      case 'rejected':
        return { variant: 'destructive', icon: XCircle, title: 'Application Rejected', message: 'Unfortunately, your application could not be approved at this time. Please see remarks for details.' };
      default:
        return { variant: 'secondary', icon: Info, title: 'Status Unknown', message: 'The status of your application is currently unknown.' };
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
            <SearchIcon className="h-8 w-8 mr-3 text-primary" />
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Track Your Application</h2>
                <p className="text-muted-foreground">Enter your Application ID to check its status.</p>
            </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>
            Enter the Application ID you received upon submission to check the current status of your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-2">
            <div className="w-full sm:flex-grow">
              <Label htmlFor="applicationIdSearch" className="sr-only">Application ID</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="applicationIdSearch"
                  type="text"
                  placeholder="Enter Application ID (e.g., APP-001)"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="pl-8"
                  aria-label="Application ID"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading || !applicationId.trim()} className="w-full sm:w-auto">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <SearchIcon className="mr-2 h-4 w-4 sm:hidden" />}
              Search
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
          <p className="ml-2">Searching for application...</p>
        </div>
      )}

      {notFound && (
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><XCircle className="mr-2"/>Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No application found with ID: <span className="font-semibold">{applicationId}</span>. Please check the ID and try again.</p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Application Found</CardTitle>
                <CardDescription>ID: {searchedApplication.id}</CardDescription>
              </div>
              <Badge variant={getStatusDisplayInfo(searchedApplication.status).variant} className="capitalize text-sm">
                 {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-1.5 h-4 w-4" })}
                {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.middleName || ''} ${searchedApplication.personalInfo.lastName}`} icon={User} />
                <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'PPP p')} icon={CalendarDays} />
                <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText} />
                <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'PPP')} icon={CalendarDays} />
                <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={UsersIcon} />
              </div>
              
              <Separator />

              <div className="mt-6">
                <div className="flex items-center mb-3">
                  {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "h-6 w-6 mr-2 text-primary" })}
                  <h3 className="text-xl font-semibold">{getStatusDisplayInfo(searchedApplication.status).title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{getStatusDisplayInfo(searchedApplication.status).message}</p>

                {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.voterId && (
                  <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} valueClassName="font-bold text-green-600"/>
                )}
                {searchedApplication.status === 'approved' && searchedApplication.precinct && (
                  <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
                )}
                {searchedApplication.status === 'approved' && searchedApplication.approvalDate && (
                  <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
                )}

                {(searchedApplication.status === 'approvedBiometricsScheduled' || (searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule)) && searchedApplication.biometricsSchedule && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/50">
                    <h4 className="font-semibold mb-2 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-blue-600"/>Biometrics Schedule:</h4>
                    <DetailItem label="Date" value={format(parseISO(searchedApplication.biometricsSchedule.date), 'PPP')} />
                    <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} />
                    <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} />
                  </div>
                )}

                {searchedApplication.remarks && (
                  <div className="mt-4">
                     <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={Info} valueClassName="italic" />
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}
    </div>
  );
}

