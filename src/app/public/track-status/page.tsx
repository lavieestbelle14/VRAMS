
'use client';
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApplicationById } from '@/lib/applicationStore';
import type { Application } from '@/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
// Removed: import { BiometricsScheduleDisplay } from '@/components/public/BiometricsScheduleDisplay';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { Search, ArrowLeft, AlertCircle, CheckCircle2, FileText, Info, CalendarDays, Clock, MapPin as MapPinIcon } from 'lucide-react';

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!applicationId.trim()) {
      setSearchedApplication(null);
      setNotFound(false);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    // Simulate API call delay
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

  const getStatusBadgeVariant = (status?: Application['status']) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };
  
  const getStatusDescription = (status?: Application['status']) => {
    if (!status) return "Unknown status.";
    switch (status) {
      case 'pending': return "Your application has been submitted and is awaiting initial review by an election officer.";
      case 'reviewing': return "An election officer is currently reviewing your application details and documents.";
      case 'approvedAwaitingBiometrics': return "Your application has been initially approved! Please wait for your biometrics capture schedule. You will be notified or check back for updates.";
      case 'approvedBiometricsScheduled': return "Your biometrics capture has been scheduled. Please see the details below and ensure you attend your appointment.";
      case 'approved': return "Congratulations! Your voter registration application is complete and approved. Your Voter ID and precinct details are available.";
      case 'rejected': return "Unfortunately, your application could not be approved at this time. Please see the officer remarks for details.";
      default: return "The status of your application is being processed.";
    }
  };

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    '': 'Unknown Type'
  };

  const DetailItem = ({ label, value, icon, isBoolean = false }: { label: string; value?: string | number | null | boolean | string[]; icon?: React.ElementType; isBoolean?: boolean }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) ) return null;
    
    let displayValue = String(value);
    if (isBoolean) {
        displayValue = value ? 'Yes' : 'No';
    } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
    }

    return (
      <div className="mb-2 grid grid-cols-3 gap-2 items-start">
        <Label className="text-sm font-semibold text-muted-foreground flex items-center col-span-1">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </Label>
        <p className="text-sm col-span-2">{displayValue}</p>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center text-primary">
          <Search className="mr-2 h-7 w-7" /> Track Your Application
        </h1>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>Enter your Application ID to see the current status and details of your voter registration application.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="applicationId" className="sr-only">Application ID</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="applicationId"
                  type="text"
                  placeholder="Enter Application ID (e.g., APP-XXXXXX)"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="pl-8"
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
                <Search className="h-4 w-4 sm:mr-2" /> 
              )}
               <span className="hidden sm:inline">Search</span>
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
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-6 w-6" /> Application Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>No application was found with the ID: <strong>{applicationId}</strong>.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please double-check the Application ID and try again. Ensure you have entered it exactly as provided on your submission receipt.
            </p>
          </CardContent>
        </Card>
      )}

      {searchedApplication && !isLoading && (
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <FileText className="mr-2 h-6 w-6 text-primary" /> Status for Application: {searchedApplication.id}
                </CardTitle>
                 <CardDescription>
                  Submitted on: {format(new Date(searchedApplication.submissionDate), 'PPP p')}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-lg capitalize">
                {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailItem label="Current Status Meaning" value={getStatusDescription(searchedApplication.status)} icon={Info} />
              <DetailItem label="Application Type" value={applicationTypeLabels[searchedApplication.applicationType || '']} />
              {searchedApplication.classification?.applicantType && (
                <DetailItem label="AI Classified Type" value={`${searchedApplication.classification.applicantType} (Confidence: ${(searchedApplication.classification.confidence * 100).toFixed(0)}%)`} />
              )}
              
              {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.voterId && (
                <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle2} />
              )}
              {searchedApplication.status === 'approved' && searchedApplication.precinct && (
                <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPinIcon} />
              )}
              {(searchedApplication.status.startsWith('approved') || searchedApplication.status === 'rejected') && searchedApplication.approvalDate && (
                <DetailItem label={searchedApplication.status === 'rejected' ? "Decision Date" : "Approval Date"} value={format(new Date(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
              )}
              {searchedApplication.remarks && (
                <DetailItem label="Officer Remarks" value={searchedApplication.remarks} />
              )}

              {(searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && searchedApplication.biometricsSchedule && (
                <>
                  <h3 className="text-lg font-semibold pt-3 mt-3 border-t mb-2 flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" /> Biometrics Schedule</h3>
                  <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays} />
                  <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock} />
                  <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPinIcon} />
                </>
              )}
            </CardContent>
          </Card>

          <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}
    </div>
  );
}
