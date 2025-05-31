
'use client';

import React from 'react'; // Added React import
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { ArrowLeft, Search, FileText, User, CalendarDays, Clock, MapPin, CheckCircle, XCircle, MessageSquare, HelpCircle, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils'; // Ensure cn is imported

const searchSchema = z.object({
  applicationId: z.string().min(1, { message: 'Application ID is required' }),
});
type SearchFormValues = z.infer<typeof searchSchema>;

interface StatusDisplayInfo {
  title: string;
  message: string;
  icon: React.ElementType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

const getStatusDisplayInfo = (status: Application['status']): StatusDisplayInfo => {
  switch (status) {
    case 'pending':
      return { title: 'Application Pending', message: 'Your application is awaiting review by an election officer.', icon: Clock, variant: 'secondary' };
    case 'reviewing':
      return { title: 'Application Under Review', message: 'An election officer is currently reviewing your application details.', icon: FileText, variant: 'outline' };
    case 'approvedAwaitingBiometrics':
      return { title: 'Approved - Awaiting Biometrics', message: 'Your application has been initially approved. Please wait for biometrics scheduling.', icon: CheckCircle, variant: 'default' };
    case 'approvedBiometricsScheduled':
        return { title: 'Biometrics Scheduled', message: 'Your biometrics capture has been scheduled. Please see details below.', icon: CalendarDays, variant: 'default' };
    case 'approved':
      return { title: 'Application Approved', message: 'Congratulations! Your voter registration application has been approved.', icon: CheckCircle, variant: 'default' };
    case 'rejected':
      return { title: 'Application Rejected', message: 'Unfortunately, your application could not be approved at this time. Please see remarks for details.', icon: XCircle, variant: 'destructive' };
    default:
      return { title: 'Status Unknown', message: 'The status of your application is currently unknown.', icon: HelpCircle, variant: 'secondary' };
  }
};


const DetailItem = ({ label, value, icon, className, valueClassName }: { label: string; value?: string | number | null; icon?: React.ElementType; className?: string; valueClassName?: string }) => {
    const IconComponent = icon;
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
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  const handleSearch: SubmitHandler<SearchFormValues> = (data) => {
    setIsLoading(true);
    setNotFound(false);
    setSearchedApplication(null);
    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(data.applicationId.toUpperCase());
      if (app) {
        setSearchedApplication(app);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, 1000);
  };

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  };
  
  const { personalInfo: pi, addressDetails: ad, civilDetails: cd, specialNeeds: sn, oldAddressDetails: oad, biometricsSchedule, classification } = searchedApplication || {};


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
            <Search className="mr-2 h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Track Your Application</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card className="w-full"> {/* Removed max-w-2xl and mx-auto for full width */}
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to view its current status and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSearch)} className="flex items-start gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('applicationId')}
                placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                className="pl-8"
                aria-invalid={errors.applicationId ? "true" : "false"}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>
          {errors.applicationId && <p className="text-sm text-destructive mt-1">{errors.applicationId.message}</p>}
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex items-center justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-2 text-muted-foreground">Searching for application...</p>
        </div>
      )}

      {notFound && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The Application ID you entered was not found in our records. Please double-check the ID and try again.</p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && pi && (
        <div className="space-y-6">
            <Card className="shadow-lg">
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
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                    <DetailItem label="Applicant Name" value={`${pi.firstName} ${pi.middleName || ''} ${pi.lastName}`} icon={User} />
                    <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'PPP p')} icon={CalendarDays} />
                    <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText} />
                    <DetailItem label="Date of Birth" value={format(parseISO(pi.dob), 'PPP')} icon={CalendarDays} />
                    <DetailItem label="Sex" value={pi.sex} icon={UserCircle} />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-2 h-5 w-5" })}
                        {getStatusDisplayInfo(searchedApplication.status).title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{getStatusDisplayInfo(searchedApplication.status).message}</p>

                    {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.voterId && (
                        <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} valueClassName="font-bold text-green-600"/>
                    )}
                    {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.precinct && (
                        <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
                    )}
                    {searchedApplication.status === 'approved' && searchedApplication.approvalDate && (
                        <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
                    )}

                    {biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                        <div className="mt-3 p-3 border rounded-md bg-muted/50">
                            <h4 className="font-medium mb-1 text-sm">Biometrics Schedule:</h4>
                            <DetailItem label="Date" value={format(parseISO(biometricsSchedule.date), 'PPP')} icon={CalendarDays} />
                            <DetailItem label="Time" value={biometricsSchedule.time} icon={Clock} />
                            <DetailItem label="Location" value={biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin} />
                        </div>
                    )}

                    {searchedApplication.remarks && (
                        <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={MessageSquare} valueClassName="italic" />
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
