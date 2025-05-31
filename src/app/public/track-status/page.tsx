
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Search, CalendarDays, CheckCircle, AlertTriangle, Info, FileText, Clock, CalendarPlus, CalendarCheck, Printer, Eye } from 'lucide-react';
import { VoterIdDisplay } from '@/components/public/VoterIdDisplay';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt'; // Added for printing receipt

export default function TrackStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = () => {
    if (!applicationId.trim()) {
      toast({ title: 'Error', description: 'Please enter an Application ID.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    setApplication(null); // Reset previous search result
    
    // Simulate API call
    setTimeout(() => {
      const appData = getApplicationById(applicationId.trim());
      if (appData) {
        setApplication(appData);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, 700);
  };

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'approvedAwaitingBiometrics': return 'default';
      case 'approvedBiometricsScheduled': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusMessage = (app: Application) => {
    switch (app.status) {
      case 'pending': return { title: 'Pending Review', description: 'Your application is awaiting review by an election officer.', icon: Clock, color: 'text-yellow-600' };
      case 'reviewing': return { title: 'Under Review', description: 'An election officer is currently reviewing your application.', icon: FileText, color: 'text-blue-600' };
      case 'approvedAwaitingBiometrics': return { title: 'Approved - Awaiting Biometrics', description: 'Congratulations! Your application has been initially approved. Please schedule your biometrics capture.', icon: CheckCircle, color: 'text-green-600' };
      case 'approvedBiometricsScheduled': return { title: 'Biometrics Scheduled', description: `Your biometrics appointment is scheduled for ${app.biometricsSchedule ? format(parseISO(app.biometricsSchedule.date), 'PPP') + ' at ' + app.biometricsSchedule.time : 'N/A'}. Location: ${app.biometricsSchedule?.location || 'Main COMELEC Office'}`, icon: CalendarCheck, color: 'text-green-700' };
      case 'approved': return { title: 'Application Approved & Complete', description: 'Your voter registration is complete! Your Voter ID is now available.', icon: CheckCircle, color: 'text-green-600' };
      case 'rejected': return { title: 'Application Rejected', description: `Reason: ${app.remarks || 'Please contact COMELEC for details.'}`, icon: AlertTriangle, color: 'text-destructive' };
      default: return { title: 'Unknown Status', description: 'Please contact COMELEC for more information.', icon: Info, color: 'text-muted-foreground' };
    }
  };

  const handlePrintReceipt = () => {
    if (!application) return;
    const printableArea = document.getElementById('printable-receipt-area');
    if (printableArea) {
      window.print();
    } else {
      toast({ title: 'Error', description: 'Could not find printable receipt content.', variant: 'destructive' });
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Track Application Status</h1>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Your Application</CardTitle>
          <CardDescription>Enter your Application ID to see the current status of your voter registration application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Enter Application ID (e.g., APP-XXXXXX)"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
              className="flex-grow"
              aria-label="Application ID"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
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
          </div>
        </CardContent>
      </Card>

      {application && (
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <CardTitle className="text-2xl">Application Status: {application.id}</CardTitle>
                    <CardDescription>Submitted on: {format(parseISO(application.submissionDate), 'PPP p')}</CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(application.status)} className="text-base mt-2 sm:mt-0 capitalize">
                    {application.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
                const statusInfo = getStatusMessage(application);
                const IconComponent = statusInfo.icon;
                return (
                  <div className={`flex items-start p-4 rounded-md border ${statusInfo.color.includes('destructive') ? 'border-destructive bg-destructive/10' : statusInfo.color.includes('green') ? 'border-green-500 bg-green-50/50' : 'border-blue-500 bg-blue-50/50'}`}>
                    <IconComponent className={`mr-3 h-6 w-6 ${statusInfo.color}`} />
                    <div>
                      <p className={`font-semibold text-lg ${statusInfo.color}`}>{statusInfo.title}</p>
                      <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
                    </div>
                  </div>
                );
            })()}

            {application.classification && (
              <Card className="bg-muted/30">
                <CardHeader><CardTitle className="text-base">AI Classification Details</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Classified Type:</strong> {application.classification.applicantType}</p>
                  <p><strong>Confidence:</strong> {(application.classification.confidence * 100).toFixed(0)}%</p>
                  <p><strong>Reason:</strong> {application.classification.reason}</p>
                </CardContent>
              </Card>
            )}

            {application.status === 'approvedAwaitingBiometrics' && (
                <Card className="border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-green-700 dark:text-green-400"><CalendarCheck className="mr-2"/> Schedule Your Biometrics</CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-500">Your application is approved! The next step is to schedule your biometrics (photo, fingerprints, signature) capture at a COMELEC office.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm">Please choose a convenient date and time for your appointment. This is a mandatory step to complete your voter registration.</p>
                        <Button 
                            size="lg" 
                            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                            onClick={() => router.push(`/public/schedule-biometrics/${application.id}`)}
                        >
                           <CalendarPlus className="mr-2 h-5 w-5"/> Schedule Biometrics Appointment
                        </Button>
                    </CardContent>
                </Card>
            )}

            {(application.status === 'approved' || application.status === 'approvedAwaitingBiometrics' || application.status === 'approvedBiometricsScheduled') && application.voterId && (
              <div className="my-6">
                <h3 className="text-xl font-semibold mb-3 text-center">Your Voter Information</h3>
                <VoterIdDisplay application={application} />
              </div>
            )}
             {/* Printable Acknowledgement Receipt Section */}
             <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={handlePrintReceipt}>
                  <Printer className="mr-2 h-4 w-4" /> Print Acknowledgement Receipt
                </Button>
              </div>
              <div id="printable-receipt-area" className="print-only-area hidden">
                <AcknowledgementReceipt application={application} />
              </div>
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground">
            If you have any questions or concerns about your application status, please contact your local COMELEC office.
          </CardFooter>
        </Card>
      )}

      {notFound && (
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/>Application Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No application found with ID: <strong>{applicationId}</strong>. Please check the ID and try again. Application IDs are case-sensitive.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

