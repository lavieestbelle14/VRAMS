
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { Search, ArrowLeft, CheckCircle2, Clock, XCircle, Info, CalendarDays, FileText, User as UserIcon, Users, MessageSquare } from 'lucide-react'; // Added MessageSquare
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


interface StatusDisplayInfo {
  title: string;
  message: string;
  icon: React.ElementType;
  iconColorClass: string;
  variant: 'default' | 'destructive' | 'secondary' | 'outline';
  cardBgClass: string;
  cardBorderClass: string;
}

const getStatusDisplayInfo = (status: Application['status']): StatusDisplayInfo => {
  switch (status) {
    case 'pending':
      return {
        title: 'Application Pending',
        message: 'Your application has been received and is awaiting review by an election officer. Please check back later for updates.',
        icon: Clock,
        iconColorClass: 'text-blue-600',
        variant: 'secondary',
        cardBgClass: 'bg-blue-50 dark:bg-blue-900/30',
        cardBorderClass: 'border-blue-400 dark:border-blue-700',
      };
    case 'reviewing':
      return {
        title: 'Application Under Review',
        message: 'An election officer is currently reviewing your application. This process may take some time.',
        icon: Info,
        iconColorClass: 'text-yellow-600',
        variant: 'outline',
        cardBgClass: 'bg-yellow-50 dark:bg-yellow-900/30',
        cardBorderClass: 'border-yellow-400 dark:border-yellow-700',
      };
    case 'approvedAwaitingBiometrics':
      return {
        title: 'Approved - Awaiting Biometrics',
        message: 'Your application has been initially approved! Please proceed to schedule your biometrics capture.',
        icon: CheckCircle2,
        iconColorClass: 'text-green-600',
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/30',
        cardBorderClass: 'border-green-400 dark:border-green-700',
      };
    case 'approvedBiometricsScheduled':
      return {
        title: 'Approved - Biometrics Scheduled',
        message: 'Your biometrics appointment is scheduled. Please attend on the specified date and time.',
        icon: CheckCircle2,
        iconColorClass: 'text-green-600',
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/30',
        cardBorderClass: 'border-green-400 dark:border-green-700',
      };
    case 'approved':
      return {
        title: 'Application Approved',
        message: 'Congratulations! Your voter registration application has been approved.',
        icon: CheckCircle2,
        iconColorClass: 'text-green-600',
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/30',
        cardBorderClass: 'border-green-400 dark:border-green-700',
      };
    case 'rejected':
      return {
        title: 'Application Rejected',
        message: 'We regret to inform you that your application has been rejected. Please see officer remarks for details.',
        icon: XCircle,
        iconColorClass: 'text-red-600',
        variant: 'destructive',
        cardBgClass: 'bg-red-50 dark:bg-red-900/30',
        cardBorderClass: 'border-red-400 dark:border-red-700',
      };
    default:
      return {
        title: 'Status Unknown',
        message: 'The status of your application is currently unknown. Please contact support if this persists.',
        icon: Info,
        iconColorClass: 'text-gray-500',
        variant: 'secondary',
        cardBgClass: 'bg-gray-50 dark:bg-gray-900/30',
        cardBorderClass: 'border-gray-400 dark:border-gray-700',
      };
  }
};

const DetailItem = ({ label, value, icon, className }: { label: string; value?: string | number | null; icon?: React.ElementType; className?: string }) => {
  const IconComponent = icon;
  if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) return null;
  
  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-center text-xs font-semibold text-foreground">
        {IconComponent && <IconComponent className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />} {label}
      </div>
      <p className="text-sm text-foreground/90">{String(value)}</p>
    </div>
  );
};


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = () => {
    if (!applicationId.trim()) {
      setError('Please enter an Application ID.');
      setSearchedApplication(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim().toUpperCase());
      if (app) {
        setSearchedApplication(app);
      } else {
        setError(`Application ID "${applicationId.trim().toUpperCase()}" not found.`);
        setSearchedApplication(null);
      }
      setIsLoading(false);
    }, 700);
  };

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = useMemo(() => ({
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  }), []);


  if (!isMounted) {
    return <div className="flex h-screen items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          <CardDescription>Enter your Application ID to view its current status and details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Enter Application ID (e.g., APP-XXXXXX)"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="flex-grow"
              aria-label="Application ID"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {searchedApplication && (
        <Card id="application-status-card">
          <CardHeader className="flex flex-row justify-between items-start pb-3">
            <div>
              <CardTitle className="text-2xl">Application Found</CardTitle>
              <CardDescription className="text-md">ID: {searchedApplication.id}</CardDescription>
            </div>
            <Badge variant={getStatusDisplayInfo(searchedApplication.status).variant} className="capitalize text-sm">
               {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: cn("mr-1.5 h-4 w-4", getStatusDisplayInfo(searchedApplication.status).iconColorClass) })}
              {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.middleName || ''} ${searchedApplication.personalInfo.lastName}`.trim()} icon={UserIcon} />
              <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'MMMM do, yyyy p')} icon={CalendarDays} />
              <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText}/>
              <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'MMMM do, yyyy')} icon={CalendarDays}/>
              <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={Users}/>
            </div>
            
            <Separator className="my-4" />

            <div className={cn("p-4 rounded-lg border", getStatusDisplayInfo(searchedApplication.status).cardBgClass, getStatusDisplayInfo(searchedApplication.status).cardBorderClass)}>
              <h3 className={cn("text-lg font-semibold flex items-center mb-2", getStatusDisplayInfo(searchedApplication.status).iconColorClass)}>
                {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-2 h-5 w-5" })}
                {getStatusDisplayInfo(searchedApplication.status).title}
              </h3>
              <p className="text-sm text-foreground/90">
                {getStatusDisplayInfo(searchedApplication.status).message}
              </p>

              {searchedApplication.status === 'approved' && (
                <div className="mt-3 space-y-1 text-sm">
                  <p><strong>Voter ID:</strong> {searchedApplication.voterId || 'N/A'}</p>
                  <p><strong>Precinct No.:</strong> {searchedApplication.precinct || 'N/A'}</p>
                  {searchedApplication.approvalDate && <p><strong>Approval Date:</strong> {format(parseISO(searchedApplication.approvalDate), 'MMMM do, yyyy p')}</p>}
                </div>
              )}

              {(searchedApplication.status === 'approvedBiometricsScheduled' || (searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule)) && searchedApplication.biometricsSchedule && (
                <div className="mt-3 pt-3 border-t border-current/20 space-y-1 text-sm">
                  <h4 className="font-semibold">Biometrics Schedule:</h4>
                  <p><strong>Date:</strong> {format(parseISO(searchedApplication.biometricsSchedule.date), 'MMMM do, yyyy')}</p>
                  <p><strong>Time:</strong> {searchedApplication.biometricsSchedule.time}</p>
                  <p><strong>Location:</strong> {searchedApplication.biometricsSchedule.location}</p>
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
        </Card>
      )}

      {searchedApplication && (
        <AcknowledgementReceipt application={searchedApplication} />
      )}
    </div>
  );
}

