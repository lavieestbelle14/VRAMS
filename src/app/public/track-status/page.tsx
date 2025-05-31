
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Search, User, FileText, CalendarDays, Clock, XCircle, CheckCircle, Hourglass, ShieldAlert, ShieldCheck, Users, Cake, Building, MapPin } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const searchSchema = z.object({
  applicationId: z.string().min(1, { message: 'Application ID is required' }),
});
type SearchFormValues = z.infer<typeof searchSchema>;

interface StatusDisplayInfo {
  icon: React.ElementType;
  title: string;
  message: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  cardBgClass: string;
  cardBorderClass: string;
}

export default function TrackStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      applicationId: '',
    },
  });

  const fetchApplication = (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setSearchError(null);
    setSearchedApplication(null); // Clear previous result

    // Simulate API delay
    setTimeout(() => {
      const app = getApplicationById(id);
      if (app) {
        setSearchedApplication(app);
      } else {
        setSearchError('Application ID not found. Please check the ID and try again.');
      }
      setIsLoading(false);
    }, 700);
  };

  useEffect(() => {
    const appIdFromQuery = searchParams.get('applicationId');
    if (appIdFromQuery) {
      form.setValue('applicationId', appIdFromQuery);
      fetchApplication(appIdFromQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form.setValue]);

  function onSubmit(data: SearchFormValues) {
    router.push(`/public/track-status?applicationId=${data.applicationId}`);
    // fetchApplication is called by useEffect when searchParams change
  }

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  };

  const getStatusDisplayInfo = (status: Application['status']): StatusDisplayInfo => {
    switch (status) {
      case 'pending':
        return { icon: Hourglass, title: "Application Pending", message: "Your application has been submitted and is currently awaiting review by an election officer. You will be notified of any updates.", variant: 'secondary', cardBgClass: 'bg-blue-50 dark:bg-blue-900/30', cardBorderClass: 'border-blue-400 dark:border-blue-700'};
      case 'reviewing':
        return { icon: FileText, title: "Application Under Review", message: "An election officer is currently reviewing your application details and documents. This step may take a few days.", variant: 'outline', cardBgClass: 'bg-yellow-50 dark:bg-yellow-900/30', cardBorderClass: 'border-yellow-400 dark:border-yellow-700' };
      case 'approvedAwaitingBiometrics':
        return { icon: ShieldAlert, title: "Approved - Awaiting Biometrics", message: "Your application has been preliminarily approved! Please proceed to schedule your biometrics capture. Further instructions will be provided.", variant: 'default', cardBgClass: 'bg-green-50 dark:bg-green-900/30', cardBorderClass: 'border-green-400 dark:border-green-700' };
      case 'approvedBiometricsScheduled':
        return { icon: CalendarDays, title: "Approved - Biometrics Scheduled", message: "Your biometrics capture has been scheduled. Please check the details below and ensure you attend your appointment.", variant: 'default', cardBgClass: 'bg-green-50 dark:bg-green-900/30', cardBorderClass: 'border-green-400 dark:border-green-700' };
      case 'approved':
        return { icon: ShieldCheck, title: "Application Approved", message: "Congratulations! Your voter registration application has been fully approved. Your Voter ID and Precinct details are now available.", variant: 'default', cardBgClass: 'bg-green-50 dark:bg-green-900/30', cardBorderClass: 'border-green-400 dark:border-green-700' };
      case 'rejected':
        return { icon: XCircle, title: "Application Rejected", message: "Unfortunately, your application could not be approved at this time. Please see the officer remarks for details on the reason for rejection.", variant: 'destructive', cardBgClass: 'bg-red-50 dark:bg-red-900/30', cardBorderClass: 'border-red-400 dark:border-red-700' };
      default:
        return { icon: Clock, title: "Status Unknown", message: "The status of your application is currently unknown. Please try again later or contact support.", variant: 'secondary', cardBgClass: 'bg-gray-50 dark:bg-gray-900/30', cardBorderClass: 'border-gray-400 dark:border-gray-700' };
    }
  };

  const DetailItem = ({ label, value, icon, className, valueClassName }: { label: string; value?: string | number | null; icon?: React.ElementType; className?: string, valueClassName?: string }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) return null;

    return (
      <div className={cn("mb-1", className)}>
        <div className="flex items-center text-sm font-semibold text-foreground">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />} {label}
        </div>
        <p className={cn("text-sm text-foreground pt-0.5 pl-6", valueClassName)}>{String(value)}</p> {/* pl-6 to align value under label text */}
      </div>
    );
  };

  const renderBiometricsSchedule = (schedule: Application['biometricsSchedule']) => {
    if (!schedule) return null;
    return (
      <div className="mt-3 p-3 border border-dashed border-primary/50 rounded-md bg-primary/5">
        <h4 className="font-semibold text-md mb-1 text-primary flex items-center"><CalendarDays className="mr-2 h-5 w-5"/>Biometrics Schedule:</h4>
        <DetailItem label="Date" value={format(parseISO(schedule.date), 'MMMM do, yyyy')} />
        <DetailItem label="Time" value={schedule.time} />
        <DetailItem label="Location" value={schedule.location || 'Main COMELEC Office'} />
      </div>
    );
  };

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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to view its current status and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
              <FormField
                control={form.control}
                name="applicationId"
                render={({ field }) => (
                  <FormItem className="flex-grow w-full sm:w-auto">
                    <Label htmlFor="applicationId" className="sr-only">Application ID</Label>
                    <FormControl>
                      <Input id="applicationId" placeholder="e.g., APP-123456" {...field} className="text-base"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Track Status
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && <div className="text-center py-6"><svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-muted-foreground">Searching for application...</p>
        </div>}
      {searchError && !isLoading && <p className="text-red-600 text-center py-6">{searchError}</p>}

      {searchedApplication && !isLoading && (
        <>
          <Card className="w-full shadow-lg">
            <CardHeader className="flex flex-row justify-between items-start pb-3">
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
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 pt-2 pb-3">
                <DetailItem icon={User} label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.middleName || ''} ${searchedApplication.personalInfo.lastName}`} />
                <DetailItem icon={CalendarDays} label="Submission Date" value={format(new Date(searchedApplication.submissionDate), 'MMMM do, yyyy p')} />
                <DetailItem icon={FileText} label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} />
                <DetailItem icon={Cake} label="Date of Birth" value={searchedApplication.personalInfo.dob ? format(parseISO(searchedApplication.personalInfo.dob), 'MMMM do, yyyy') : 'N/A'} />
                <DetailItem icon={Users} label="Sex" value={searchedApplication.personalInfo.sex ? searchedApplication.personalInfo.sex.charAt(0).toUpperCase() + searchedApplication.personalInfo.sex.slice(1) : 'N/A'} />
              </div>

              <Separator className="my-4" />
              
              <div className={cn(
                "p-4 rounded-md border",
                getStatusDisplayInfo(searchedApplication.status).cardBgClass,
                getStatusDisplayInfo(searchedApplication.status).cardBorderClass
              )}>
                  <h3 className="text-lg font-semibold flex items-center mb-2 text-foreground">
                    {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-2 h-5 w-5" })}
                    {getStatusDisplayInfo(searchedApplication.status).title}
                  </h3>
                  <p className="text-sm text-foreground/90">
                    {getStatusDisplayInfo(searchedApplication.status).message}
                  </p>

                  {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.voterId && (
                    <div className="mt-3 space-y-1">
                      <DetailItem icon={ShieldCheck} label="Voter ID" value={searchedApplication.voterId} valueClassName="font-mono"/>
                      {searchedApplication.precinct && <DetailItem icon={MapPin} label="Precinct No." value={searchedApplication.precinct} />}
                      {searchedApplication.approvalDate && <DetailItem icon={CalendarDays} label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'MMMM do, yyyy p')} />}
                    </div>
                  )}
                  
                  {(searchedApplication.status === 'approvedBiometricsScheduled' || (searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule) ) && searchedApplication.biometricsSchedule && renderBiometricsSchedule(searchedApplication.biometricsSchedule)}
              </div>

              {searchedApplication.remarks && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-foreground mb-1">Officer Remarks:</h4>
                  <p className="text-sm text-foreground/90 p-3 bg-muted rounded-md border border-muted-foreground/20">{searchedApplication.remarks}</p>
                </div>
              )}

            </CardContent>
          </Card>

          {searchedApplication.status === 'approved' && (
            <AcknowledgementReceipt application={searchedApplication} />
          )}
        </>
      )}
    </div>
  );
}

    