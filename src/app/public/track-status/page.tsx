
'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button'; // Updated import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, CalendarDays, User, FileText, Clock, CheckCircle, XCircle, Edit, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


interface StatusDisplayInfo {
  icon: React.ElementType;
  title: string;
  message: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  cardBgClass: string;
  cardBorderClass: string;
}

function getStatusDisplayInfo(status: Application['status']): StatusDisplayInfo {
  switch (status) {
    case 'pending':
      return {
        icon: Clock,
        title: "Application Pending",
        message: "Your application has been submitted and is awaiting review by an election officer.",
        variant: 'secondary',
        cardBgClass: 'bg-blue-50 dark:bg-blue-900/30',
        cardBorderClass: 'border-blue-400 dark:border-blue-700',
      };
    case 'reviewing':
      return {
        icon: Edit,
        title: "Application Under Review",
        message: "An election officer is currently reviewing your application details.",
        variant: 'outline',
        cardBgClass: 'bg-yellow-50 dark:bg-yellow-900/30',
        cardBorderClass: 'border-yellow-400 dark:border-yellow-700',
      };
    case 'approvedAwaitingBiometrics':
      return {
        icon: CheckCircle,
        title: "Approved - Awaiting Biometrics",
        message: "Your application has been preliminarily approved! Please proceed to schedule your biometrics capture.",
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/30',
        cardBorderClass: 'border-green-400 dark:border-green-700',
      };
    case 'approvedBiometricsScheduled':
        return {
            icon: CheckCircle,
            title: "Approved - Biometrics Scheduled",
            message: "Your biometrics appointment is scheduled. Please see details below.",
            variant: 'default',
            cardBgClass: 'bg-green-50 dark:bg-green-900/30',
            cardBorderClass: 'border-green-400 dark:border-green-700',
        };
    case 'approved':
      return {
        icon: CheckCircle,
        title: "Application Approved",
        message: "Congratulations! Your voter registration application has been approved.",
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/30',
        cardBorderClass: 'border-green-400 dark:border-green-700',
      };
    case 'rejected':
      return {
        icon: XCircle,
        title: "Application Rejected",
        message: "We regret to inform you that your application has been rejected. Please see remarks for details.",
        variant: 'destructive',
        cardBgClass: 'bg-red-50 dark:bg-red-900/30',
        cardBorderClass: 'border-red-400 dark:border-red-700',
      };
    default:
      return {
        icon: Info,
        title: "Status Unknown",
        message: "The status of your application is currently unknown.",
        variant: 'secondary',
        cardBgClass: 'bg-gray-50 dark:bg-gray-900/30',
        cardBorderClass: 'border-gray-400 dark:border-gray-700',
      };
  }
}


const DetailItem = ({ label, value, icon: IconComponent, className, valueClassName }: { label: string; value?: string | number | null; icon?: React.ElementType; className?: string; valueClassName?: string }) => {
  if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) return null;

    return (
      <div className={cn("mb-2 grid grid-cols-[auto,1fr] gap-x-2 items-center", className)}>
        <div className="flex items-center text-sm font-semibold text-muted-foreground">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />} {label}:
        </div>
        <p className={cn("text-sm", valueClassName)}>{String(value)}</p>
      </div>
    );
};


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    if (!applicationId.trim()) {
      setError('Please enter an Application ID.');
      setSearchedApplication(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchedApplication(null); // Clear previous results

    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim());
      if (app) {
        setSearchedApplication(app);
      } else {
        setError(`Application ID "${applicationId.trim()}" not found.`);
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      '': 'Unknown Type'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
          <Search className="mr-3 h-7 w-7" /> Track Your Application
        </h2>
        <Link href="/public/home" className={cn(buttonVariants({ variant: "outline" }), "self-start sm:self-center")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to see the current status and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  id="applicationId"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                  className="pl-10 text-base sm:text-sm h-11"
                  aria-label="Application ID"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto h-11" disabled={isLoading}>
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : <Search className="mr-2 h-4 w-4" /> }
                 Search
              </Button>
            </div>
            {error && !isLoading && (
              <div className="flex items-center text-sm text-destructive bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md p-3">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0"/> {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {isLoading && !error && (
        <div className="flex items-center justify-center text-muted-foreground p-10">
          <svg className="animate-spin h-8 w-8 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Searching for application...
        </div>
      )}

      {searchedApplication && !isLoading && (
        <Card className={cn("transition-all duration-300 ease-in-out", getStatusDisplayInfo(searchedApplication.status).cardBgClass, getStatusDisplayInfo(searchedApplication.status).cardBorderClass)}>
            <CardHeader className="flex flex-row justify-between items-start pb-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Application Found</CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-mono">ID: {searchedApplication.id}</CardDescription>
              </div>
              <Badge variant={getStatusDisplayInfo(searchedApplication.status).variant} className="capitalize text-sm">
                 {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-1.5 h-4 w-4" })}
                {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 mb-4">
                    <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.lastName}`} icon={User} />
                    <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'PPP p')} icon={CalendarDays} />
                    <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText} />
                    <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'PPP')} icon={CalendarDays} />
                    <DetailItem label="Sex" value={searchedApplication.personalInfo.sex.charAt(0).toUpperCase() + searchedApplication.personalInfo.sex.slice(1)} icon={User} />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-2 h-5 w-5" })}
                        {getStatusDisplayInfo(searchedApplication.status).title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{getStatusDisplayInfo(searchedApplication.status).message}</p>

                    {searchedApplication.status === 'approved' && searchedApplication.voterId && (
                        <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} valueClassName="font-bold text-green-700 dark:text-green-400" />
                    )}
                     {searchedApplication.status === 'approved' && searchedApplication.precinct && (
                        <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={Info} />
                    )}
                    {searchedApplication.status === 'approved' && searchedApplication.approvalDate && (
                         <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
                    )}

                    {(searchedApplication.status === 'approvedBiometricsScheduled' || (searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule)) && searchedApplication.biometricsSchedule && (
                        <div className="mt-3 pt-3 border-t border-dashed">
                            <h4 className="text-md font-semibold mb-1 flex items-center"><Clock className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400"/>Biometrics Schedule</h4>
                            <DetailItem label="Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays} />
                            <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                            <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={Info} />
                        </div>
                    )}

                    {searchedApplication.remarks && (
                         <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={Info} className="pt-2 border-t border-dashed mt-2" />
                    )}
                </div>
            </CardContent>
          </Card>
      )}
      
      {searchedApplication && !isLoading && (
          <AcknowledgementReceipt application={searchedApplication} />
      )}

    </div>
  );
}
