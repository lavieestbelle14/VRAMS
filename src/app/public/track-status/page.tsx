
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { ArrowLeft, Search, CheckCircle2, Clock, XCircle, Edit3, HelpCircle, FileText, User, CalendarDays, Users as UsersIcon, Building, MessageSquare, MapPin, ShieldCheck, Eye, Printer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";

interface DetailItemProps {
  label: string;
  value?: string | number | null | boolean | string[];
  icon?: React.ElementType;
  isBoolean?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon, isBoolean = false, className, labelClassName, valueClassName }) => {
  const IconComponent = icon;
  if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) ) return null;
  
  let displayValue = String(value);
  if (isBoolean) {
      displayValue = value ? 'Yes' : 'No';
  } else if (Array.isArray(value)) {
      displayValue = value.join(', ');
  }

  return (
    <div className={cn("grid grid-cols-[auto,1fr] gap-x-2 items-start", className)}>
      <div className={cn("flex items-center text-sm font-semibold text-muted-foreground", labelClassName)}>
        {IconComponent && <IconComponent className="mr-1.5 h-4 w-4 flex-shrink-0" />} {label}:
      </div>
      <span className={cn("text-sm", valueClassName)}>{displayValue}</span>
    </div>
  );
};


interface StatusDisplayInfo {
  icon: LucideIcon;
  title: string;
  message: string;
  variant: 'default' | 'destructive' | 'secondary' | 'outline';
  cardBgClass: string;
  cardBorderClass: string;
}

function getStatusDisplayInfo(status: Application['status'], appType?: Application['applicationType']): StatusDisplayInfo {
  const typeText = appType === 'register' ? 'Registration' : appType === 'transfer' ? 'Transfer' : 'Application';
  switch (status) {
    case 'approved':
      return {
        icon: CheckCircle2,
        title: `${typeText} Approved`,
        message: 'Your application has been successfully processed and approved.',
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/20',
        cardBorderClass: 'border-green-400 dark:border-green-700'
      };
    case 'approvedAwaitingBiometrics':
      return {
        icon: CheckCircle2,
        title: `${typeText} Approved - Awaiting Biometrics`,
        message: 'Your application is approved pending biometrics capture. Please schedule your appointment.',
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/20',
        cardBorderClass: 'border-green-400 dark:border-green-700'
      };
    case 'approvedBiometricsScheduled':
      return {
        icon: CheckCircle2,
        title: `${typeText} Approved - Biometrics Scheduled`,
        message: 'Your biometrics appointment is scheduled. Please see details below.',
        variant: 'default',
        cardBgClass: 'bg-green-50 dark:bg-green-900/20',
        cardBorderClass: 'border-green-400 dark:border-green-700'
      };
    case 'rejected':
      return {
        icon: XCircle,
        title: `${typeText} Rejected`,
        message: 'Your application was not approved. Please see officer remarks for details.',
        variant: 'destructive',
        cardBgClass: 'bg-red-50 dark:bg-red-900/20',
        cardBorderClass: 'border-red-400 dark:border-red-700'
      };
    case 'pending':
      return {
        icon: Clock,
        title: `${typeText} Pending`,
        message: 'Your application has been submitted and is awaiting review by an election officer.',
        variant: 'secondary',
        cardBgClass: 'bg-blue-50 dark:bg-blue-900/20',
        cardBorderClass: 'border-blue-400 dark:border-blue-700'
      };
    case 'reviewing':
      return {
        icon: Edit3,
        title: `${typeText} Under Review`,
        message: 'An election officer is currently reviewing your application details.',
        variant: 'outline',
        cardBgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        cardBorderClass: 'border-yellow-400 dark:border-yellow-700'
      };
    default:
      return {
        icon: HelpCircle,
        title: 'Status Unknown',
        message: 'The status of your application is currently unknown.',
        variant: 'secondary',
        cardBgClass: 'bg-gray-100 dark:bg-gray-800/30',
        cardBorderClass: 'border-gray-300 dark:border-gray-600'
      };
  }
}


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = useCallback(() => {
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setNotFound(false);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim());
      if (app) {
        setSearchedApplication(app);
      } else {
        setSearchedApplication(null);
        setNotFound(true);
      }
      setIsLoading(false);
    }, 500);
  }, [applicationId]);

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  };
  
  const statusInfo = searchedApplication ? getStatusDisplayInfo(searchedApplication.status, searchedApplication.applicationType) : null;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <Search className="mr-3 h-7 w-7" /> Track Your Application
        </h2>
        <Link href="/public/home" className={cn(Button({ variant: "outline" }), "self-start sm:self-center")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID below to check its current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !applicationId.trim()} className="sm:ml-2">
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Search className="mr-2 h-4 w-4" />
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
            <p className="ml-2 text-muted-foreground">Searching for application...</p>
        </div>
      )}

      {notFound && !isLoading && (
        <Card className="border-destructive bg-red-50 dark:bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><XCircle className="mr-2"/>Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No application found with ID: <strong>{applicationId}</strong>. Please check the ID and try again.</p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && statusInfo && !isLoading && (
        <div className="space-y-6">
          <Card className={cn("shadow-lg", statusInfo.cardBgClass, statusInfo.cardBorderClass)}>
             <CardHeader className="flex flex-row justify-between items-start pb-4">
                <div>
                    <CardTitle className="text-2xl">Application Found</CardTitle>
                    <CardDescription className="text-base text-foreground/80">ID: {searchedApplication.id}</CardDescription>
                </div>
                <Badge variant={statusInfo.variant} className="capitalize text-sm">
                   {React.createElement(statusInfo.icon, { className: "mr-1.5 h-4 w-4" })}
                  {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 mb-4">
                    <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.lastName}`} icon={User} />
                    <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'PPP p')} icon={CalendarDays} />
                    <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText} />
                    <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'PPP')} icon={CalendarDays} />
                    <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={UsersIcon} />
                </div>
                
                <Separator className="my-4 border-foreground/20" />

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      {React.createElement(statusInfo.icon, { className: "mr-2 h-5 w-5" })}
                      {statusInfo.title}
                    </h3>
                    <p className="text-sm text-foreground/90">{statusInfo.message}</p>

                    {searchedApplication.status === 'approved' && searchedApplication.voterId && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                            <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={ShieldCheck} valueClassName="font-bold text-primary"/>
                            <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
                            {searchedApplication.approvalDate && <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />}
                        </div>
                    )}

                    {(searchedApplication.status === 'approvedBiometricsScheduled' || (searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule)) && searchedApplication.biometricsSchedule && (
                      <div className="mt-3 pt-3 border-t border-foreground/10">
                        <h4 className="text-md font-semibold mb-1">Biometrics Schedule:</h4>
                        <DetailItem label="Date" value={format(parseISO(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays} />
                        <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                        <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin} />
                      </div>
                    )}
                    
                    {searchedApplication.remarks && (
                         <div className="mt-3 pt-3 border-t border-foreground/10">
                            <h4 className="text-md font-semibold mb-1 flex items-center"><MessageSquare className="mr-2 h-4 w-4"/>Officer Remarks:</h4>
                            <p className="text-sm italic text-foreground/80">{searchedApplication.remarks}</p>
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

