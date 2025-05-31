
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getApplicationById, type Application } from '@/lib/applicationStore';
import { Search, ArrowLeft, User, CalendarDays, FileText, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare, Users as UsersIcon, Eye } from 'lucide-react';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator'; // Added Separator import

// Helper function to get display info based on status
const getStatusDisplayInfo = (status: Application['status']) => {
  let icon: React.ElementType = AlertTriangle;
  let title = "Status Unknown";
  let message = "The status of this application is not recognized.";
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let cardBgClass = 'bg-card'; // Default for the inner block if not specified
  let cardBorderClass = 'border-border'; // Default border for the inner block

  switch (status) {
    case 'pending':
      icon = Clock;
      title = 'Application Pending';
      message = 'Your application has been submitted and is awaiting review by an election officer.';
      variant = 'secondary';
      cardBgClass = 'bg-blue-50 dark:bg-blue-900/30';
      cardBorderClass = 'border-blue-400 dark:border-blue-600';
      break;
    case 'reviewing':
      icon = Eye;
      title = 'Application Under Review';
      message = 'An election officer is currently reviewing your application details and documents.';
      variant = 'outline'; // Using outline for 'reviewing'
      cardBgClass = 'bg-yellow-50 dark:bg-yellow-900/30';
      cardBorderClass = 'border-yellow-400 dark:border-yellow-600';
      break;
    case 'approvedAwaitingBiometrics':
      icon = CheckCircle;
      title = 'Approved - Awaiting Biometrics';
      message = 'Your application has been preliminarily approved. Please proceed to schedule or complete your biometrics capture.';
      variant = 'default';
      cardBgClass = 'bg-green-50 dark:bg-green-900/30';
      cardBorderClass = 'border-green-400 dark:border-green-600';
      break;
    case 'approvedBiometricsScheduled':
      icon = CheckCircle;
      title = 'Approved - Biometrics Scheduled';
      message = 'Your biometrics appointment has been scheduled. Please attend your appointment as scheduled.';
      variant = 'default';
      cardBgClass = 'bg-green-50 dark:bg-green-900/30';
      cardBorderClass = 'border-green-400 dark:border-green-600';
      break;
    case 'approved':
      icon = CheckCircle;
      title = 'Application Approved';
      message = 'Congratulations! Your voter registration application has been approved.';
      variant = 'default';
      cardBgClass = 'bg-green-50 dark:bg-green-900/30';
      cardBorderClass = 'border-green-400 dark:border-green-600';
      break;
    case 'rejected':
      icon = XCircle;
      title = 'Application Rejected';
      message = 'Unfortunately, your application did not meet the requirements. Please check the remarks for details.';
      variant = 'destructive';
      cardBgClass = 'bg-red-50 dark:bg-red-900/30';
      cardBorderClass = 'border-red-400 dark:border-red-600';
      break;
    default:
      icon = AlertTriangle;
      title = 'Status Unknown';
      message = `Application status is '${status}'. Please contact support if you see this.`;
      variant = 'secondary';
      break;
  }
  return { icon, title, message, variant, cardBgClass, cardBorderClass };
};


const DetailItem = ({ label, value, icon, className }: { label: string; value?: string | number | null; icon?: React.ElementType; className?: string }) => {
  const IconComponent = icon;
  if (value === null || typeof value === 'undefined' || String(value).trim() === '') return null;

  return (
    <div className={cn("mb-2 grid grid-cols-[auto,1fr] gap-x-2 items-center", className)}>
      <div className="flex items-center text-sm font-semibold text-muted-foreground">
        {IconComponent && <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />} {label}:
      </div>
      <p className="text-sm break-words">{String(value)}</p>
    </div>
  );
};


export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null | undefined>(undefined); // undefined for initial, null for not found
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!applicationId.trim()) {
      setSearchedApplication(null); // Treat empty search as "not found" for UI purposes
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const app = getApplicationById(applicationId.trim());
      setSearchedApplication(app);
      setIsLoading(false);
    }, 500);
  };
  
  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      '': 'Unknown Type'
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
          <CardDescription>Enter your Application ID to view the current status of your voter registration application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="applicationIdInput" className="sr-only">Application ID</Label>
              <Input
                id="applicationIdInput"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                className="text-base"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !applicationId.trim()} className="w-full sm:w-auto">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <Search className="mr-2 h-4 w-4" />}
              Search Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchedApplication === null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><XCircle className="mr-2"/>Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No application found with ID: <span className="font-semibold">{applicationId}</span>. Please check the ID and try again.</p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && (
        <>
        <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-start bg-muted/30 p-4 border-b">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Application Found</CardTitle>
                <CardDescription className="text-sm sm:text-base">ID: {searchedApplication.id}</CardDescription>
              </div>
              <Badge variant={getStatusDisplayInfo(searchedApplication.status).variant} className="capitalize text-sm">
                 {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-1.5 h-4 w-4" })}
                {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
                {/* Personal Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <DetailItem label="Applicant Name" value={`${searchedApplication.personalInfo.firstName} ${searchedApplication.personalInfo.middleName || ''} ${searchedApplication.personalInfo.lastName}`} icon={User} />
                    <DetailItem label="Submission Date" value={format(parseISO(searchedApplication.submissionDate), 'MMMM do, yyyy p')} icon={CalendarDays} />
                    <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} icon={FileText} />
                    <DetailItem label="Date of Birth" value={format(parseISO(searchedApplication.personalInfo.dob), 'MMMM do, yyyy')} icon={CalendarDays} />
                    <DetailItem label="Sex" value={searchedApplication.personalInfo.sex} icon={UsersIcon} />
                </div>

                {/* Status Message Section - THIS GETS THE DYNAMIC BACKGROUND */}
                <Separator className="my-4" />
                <div className={cn(
                  "p-4 rounded-md border", 
                  getStatusDisplayInfo(searchedApplication.status).cardBgClass,
                  getStatusDisplayInfo(searchedApplication.status).cardBorderClass
                )}>
                  <h3 className="text-lg font-semibold flex items-center mb-2">
                    {React.createElement(getStatusDisplayInfo(searchedApplication.status).icon, { className: "mr-2 h-5 w-5" })}
                    {getStatusDisplayInfo(searchedApplication.status).title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{getStatusDisplayInfo(searchedApplication.status).message}</p>

                  {['approved', 'approvedAwaitingBiometrics', 'approvedBiometricsScheduled'].includes(searchedApplication.status) && searchedApplication.voterId && (
                    <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />
                  )}
                  {['approved', 'approvedBiometricsScheduled'].includes(searchedApplication.status) && searchedApplication.precinct && (
                    <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={User} />
                  )}
                  {searchedApplication.status === 'approved' && searchedApplication.approvalDate && (
                    <DetailItem label="Approval Date" value={format(parseISO(searchedApplication.approvalDate), 'MMMM do, yyyy p')} icon={CalendarDays} />
                  )}

                  {(searchedApplication.status === 'approvedBiometricsScheduled' || (searchedApplication.status === 'approved' && searchedApplication.biometricsSchedule)) && searchedApplication.biometricsSchedule && (
                    <div className="mt-3 pt-3 border-t border-dashed">
                      <h4 className="text-md font-semibold mb-1">Biometrics Schedule:</h4>
                      <DetailItem label="Date" value={format(parseISO(searchedApplication.biometricsSchedule.date), 'MMMM do, yyyy')} icon={CalendarDays} />
                      <DetailItem label="Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                      <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location} icon={User} />
                    </div>
                  )}
                </div>

                {/* Officer Remarks */}
                {searchedApplication.remarks && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Officer Remarks
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {searchedApplication.remarks}
                      </p>
                    </div>
                  </>
                )}
            </CardContent>
        </Card>
        
        <AcknowledgementReceipt application={searchedApplication} />
        </>
      )}
    </div>
  );
}
