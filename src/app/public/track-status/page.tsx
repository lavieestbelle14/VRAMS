
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { Search, ArrowLeft, User, CalendarDays, FileText, Clock, CheckCircle2, XCircle, Hourglass, ShieldCheck, Info, Users as UsersIcon } from 'lucide-react';
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
  badgeVariant: 'default' | 'destructive' | 'secondary' | 'outline' | 'success';
  cardBgClass: string;
  cardBorderClass: string;
  iconColorClass: string;
}

const getStatusDisplayInfo = (status: Application['status']): StatusDisplayInfo => {
  switch (status) {
    case 'pending':
      return {
        icon: Hourglass,
        title: "Application Pending",
        message: "Your application has been submitted and is awaiting initial review by an election officer.",
        badgeVariant: 'secondary',
        cardBgClass: 'bg-blue-50 dark:bg-blue-900/30',
        cardBorderClass: 'border-blue-400 dark:border-blue-600',
        iconColorClass: 'text-blue-600',
      };
    case 'reviewing':
      return {
        icon: Info,
        title: "Application Under Review",
        message: "An election officer is currently reviewing your application details and documents.",
        badgeVariant: 'outline',
        cardBgClass: 'bg-yellow-50 dark:bg-yellow-900/30',
        cardBorderClass: 'border-yellow-400 dark:border-yellow-600',
        iconColorClass: 'text-yellow-600',
      };
    case 'approvedAwaitingBiometrics':
        return {
            icon: CheckCircle2,
            title: "Approved - Awaiting Biometrics",
            message: "Your application has been initially approved! Please proceed to schedule your biometrics capture.",
            badgeVariant: 'default', // Visually similar to success
            cardBgClass: 'bg-green-50 dark:bg-green-900/30',
            cardBorderClass: 'border-green-400 dark:border-green-600',
            iconColorClass: 'text-green-600',
        };
    case 'approvedBiometricsScheduled':
        return {
            icon: CheckCircle2,
            title: "Approved - Biometrics Scheduled",
            message: "Your biometrics appointment is scheduled. Please check the details below.",
            badgeVariant: 'default',
            cardBgClass: 'bg-green-50 dark:bg-green-900/30',
            cardBorderClass: 'border-green-400 dark:border-green-600',
            iconColorClass: 'text-green-600',
        };
    case 'approved':
      return {
        icon: CheckCircle2,
        title: "Application Approved",
        message: "Congratulations! Your voter registration application has been approved.",
        badgeVariant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/30',
        cardBorderClass: 'border-green-400 dark:border-green-600',
        iconColorClass: 'text-green-600',
      };
    case 'rejected':
      return {
        icon: XCircle,
        title: "Application Rejected",
        message: "Unfortunately, your application could not be approved at this time. Please see remarks for details.",
        badgeVariant: 'destructive',
        cardBgClass: 'bg-red-50 dark:bg-red-900/30',
        cardBorderClass: 'border-red-400 dark:border-red-600',
        iconColorClass: 'text-red-600',
      };
    default:
      return { // Should not happen
        icon: ShieldCheck,
        title: "Status Unknown",
        message: "The status of your application is currently unknown. Please contact support.",
        badgeVariant: 'secondary',
        cardBgClass: 'bg-gray-50 dark:bg-gray-900/30',
        cardBorderClass: 'border-gray-400 dark:border-gray-600',
        iconColorClass: 'text-gray-600',
      };
  }
};


const DetailItem = ({ label, value, icon, className, valueClassName }: { label: string; value?: string | number | null; icon?: React.ElementType; className?: string; valueClassName?: string }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) return null;
  
    return (
      <div className={cn("mb-1 flex flex-col", className)}>
        <div className="flex items-center text-sm font-semibold text-foreground">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />} {label}
        </div>
        <p className={cn("text-sm text-foreground ml-6", valueClassName)}>{String(value)}</p> {}
      </div>
    );
  };


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null | undefined>(undefined); // undefined for initial, null for not found
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(() => {
    if (!applicationId.trim()) {
      setSearchedApplication(undefined); // Reset if search is cleared
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim());
      setSearchedApplication(app);
      setIsLoading(false);
    }, 500);
  }, [applicationId]);

  // Effect to auto-search if ID changes (e.g. pasted)
  useEffect(() => {
    if (applicationId.trim()) {
      handleSearch();
    } else {
      setSearchedApplication(undefined); // Clear results if input is empty
    }
  }, [applicationId, handleSearch]);

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  };
  
  const statusInfo = searchedApplication ? getStatusDisplayInfo(searchedApplication.status) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <Search className="mr-3 h-7 w-7" /> Track Your Application
        </h2>
        <Link href="/public/home" className={cn(buttonVariants({ variant: "outline" }), "self-start sm:self-center")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to check the current status of your submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter Application ID (e.g., APP-XXXXXX)"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={isLoading || !applicationId.trim()}>
              {isLoading ? (
                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && <div className="text-center py-4">Loading status...</div>}

      {!isLoading && searchedApplication === null && (
        <Alert variant="destructive" className="mt-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            No application found with ID: {applicationId}. Please check the ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && searchedApplication && statusInfo && (
        <Card className="mt-6 shadow-lg">
            <CardHeader className="flex flex-row justify-between items-start pb-3">
                <div>
                    <CardTitle className="text-xl font-semibold">Application Found</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">ID: {searchedApplication.id}</CardDescription>
                </div>
              <Badge variant={statusInfo.badgeVariant} className={cn("capitalize text-sm", statusInfo.iconColorClass === 'text-primary-foreground' ? 'text-primary-foreground' : '')}>
                 {React.createElement(statusInfo.icon, { className: cn("mr-1.5 h-4 w-4", statusInfo.iconColorClass) })}
                {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-3">
                <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.lastName}`} icon={User} />
                <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'PPp')} icon={CalendarDays} />
                <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText} />
                <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'PPP')} icon={CalendarDays} />
                <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={UsersIcon} />
            </div>
            
            <Separator className="my-4" />

            <div className={cn("p-4 rounded-md border", statusInfo.cardBgClass, statusInfo.cardBorderClass)}>
                <h3 className={cn("text-lg font-semibold flex items-center mb-2", statusInfo.iconColorClass)}>
                    {React.createElement(statusInfo.icon, { className: cn("mr-2 h-5 w-5", statusInfo.iconColorClass) })}
                    {statusInfo.title}
                </h3>
                <p className="text-sm text-foreground/90">{statusInfo.message}</p>

                {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.voterId && (
                    <DetailItem label="Voter ID" value={searchedApplication.voterId} className="mt-3" valueClassName="font-mono"/>
                )}
                {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.precinct && (
                    <DetailItem label="Precinct No." value={searchedApplication.precinct} className="mt-1" />
                )}
                 {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.approvalDate && (
                    <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'PPp')} className="mt-1" />
                )}

                {searchedApplication.status === 'approvedBiometricsScheduled' && searchedApplication.biometricsSchedule && (
                    <div className="mt-3 space-y-1 pl-1">
                        <p className="text-sm font-medium text-foreground">Biometrics Schedule:</p>
                        <DetailItem label="Date" value={format(parseISO(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays} />
                        <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                        <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location} icon={MapPin} />
                    </div>
                )}
            </div>

            {searchedApplication.remarks && (
              <div className="mt-4 pt-4 border-t">
                <Label className="text-md font-semibold text-muted-foreground flex items-center"><MessageSquare className="mr-2 h-4 w-4"/>Officer Remarks</Label>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap p-2 bg-muted/50 rounded-md mt-1">{searchedApplication.remarks}</p>
              </div>
            )}

          </CardContent>
          {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && (
            <AcknowledgementReceipt application={searchedApplication} />
          )}
        </Card>
      )}
    </div>
  );
}

    