
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search, FileText, User, CalendarDays, Clock, CheckCircle, XCircle, Hourglass, Building, Users, ShieldCheck, MessageSquare, MapPin } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = () => {
    if (!applicationId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an Application ID.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    setSearchedApplication(null); // Reset previous search

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
  
  const DetailItem = ({ label, value, icon, className, children }: { label?: string; value?: string | number | null | React.ReactNode; icon?: React.ElementType; className?: string; children?: React.ReactNode }) => {
    const IconComponent = icon;
    if (!label && !children && (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === ''))) return null;
    if (children) {
      return <div className={cn("mb-2", className)}>{children}</div>;
    }

    return (
      <div className={cn("mb-2 grid grid-cols-[auto,1fr] gap-x-2 items-center", className)}>
        <div className="flex items-center text-sm font-semibold text-muted-foreground">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />} {label}:
        </div>
        <div className="text-sm">{String(value)}</div>
      </div>
    );
  };

  const getStatusDisplayInfo = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return { variant: 'secondary', icon: Hourglass, title: 'Application Pending', message: 'Your application has been submitted and is awaiting review by an election officer.' };
      case 'reviewing':
        return { variant: 'outline', icon: Search, title: 'Application Under Review', message: 'An election officer is currently reviewing your application details and documents.' };
      case 'approvedAwaitingBiometrics':
         return { variant: 'default', icon: Clock, title: 'Approved - Awaiting Biometrics', message: 'Your application has been preliminarily approved. Please schedule your biometrics capture.' };
      case 'approvedBiometricsScheduled':
         return { variant: 'default', icon: CalendarDays, title: 'Biometrics Scheduled', message: 'Your biometrics capture is scheduled. Please attend your appointment.' };
      case 'approved':
        return { variant: 'default', icon: CheckCircle, title: 'Application Approved', message: 'Congratulations! Your voter registration is approved. Your Voter ID is being processed.' };
      case 'rejected':
        return { variant: 'destructive', icon: XCircle, title: 'Application Rejected', message: 'Unfortunately, your application was not approved. Please see remarks for details.' };
      default:
        return { variant: 'secondary', icon: Hourglass, title: 'Status Unknown', message: 'The status of your application is currently unknown.' };
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Search className="mr-2 h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Track Your Application</h2>
        </div>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>
            Enter your Application ID below to check the current status of your voter registration application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 w-full"
              />
            </div>
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
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              No application found with ID: <strong>{applicationId}</strong>.
              Please check the ID and try again. If you recently submitted, it might take some time to appear in the system.
            </p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && (
        <>
          <Card className="mt-6">
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
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 mb-4">
                    <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.lastName}`} icon={User} />
                    <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'PPP p')} icon={CalendarDays} />
                    <DetailItem label="Application Type" value={searchedApplication.applicationType === 'register' ? 'New Registration' : 'Transfer of Registration'} icon={FileText} />
                    <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'PPP')} icon={CalendarDays} />
                    <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={Users} />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-2 h-5 w-5" })}
                        {getStatusDisplayInfo(searchedApplication.status).title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {getStatusDisplayInfo(searchedApplication.status).message}
                    </p>

                    {searchedApplication.status === 'approved' && searchedApplication.voterId && (
                        <>
                            <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={ShieldCheck} className="mt-3"/>
                            <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
                            <DetailItem label="Approval Date" value={searchedApplication.approvalDate ? format(parseISO(searchedApplication.approvalDate), 'PPP p') : 'N/A'} icon={CalendarDays} />
                        </>
                    )}
                    
                    {(searchedApplication.status === 'approvedBiometricsScheduled' || (searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule)) && searchedApplication.biometricsSchedule && (
                        <Card className="mt-4 bg-secondary/50 p-4 rounded-lg">
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="text-base flex items-center"><Clock className="mr-2 h-4 w-4 text-primary"/>Biometrics Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-1">
                                <DetailItem label="Date" value={format(parseISO(searchedApplication.biometricsSchedule.date), 'PPP')} />
                                <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} />
                                <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} />
                            </CardContent>
                        </Card>
                    )}

                    {searchedApplication.remarks && (
                         <DetailItem label="Officer Remarks" value={searchedApplication.remarks} icon={MessageSquare} className="mt-3 pt-3 border-t"/>
                    )}
                </div>
            </CardContent>
          </Card>

          <AcknowledgementReceipt application={searchedApplication} />
        </>
      )}
    </div>
  );
}
