
'use client';
import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Search as SearchIcon, FileText, Clock, CalendarDays, MapPin, CheckCircle, User, ShieldCheck, Building, Users, MessageSquare } from 'lucide-react';
import type { Application } from '@/types';
import { getApplicationById } from '@/lib/applicationStore';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt';
import { format } from 'date-fns';

export default function TrackApplicationStatusPage() {
  const [applicationIdInput, setApplicationIdInput] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!applicationIdInput.trim()) {
      setNotFound(false);
      setSearchedApplication(null);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    setSearchedApplication(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    const app = getApplicationById(applicationIdInput.trim());
    if (app) {
      setSearchedApplication(app);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
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
      <div className="mb-2">
        <p className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </p>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };

  const getStatusBadgeVariant = (status?: Application['status']) => {
    if (!status) return 'secondary';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight flex items-center text-primary">
          <SearchIcon className="mr-2 h-7 w-7 text-primary" />
          Track Your Application
        </h2>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>
            Enter your Application ID below to see its current status and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={applicationIdInput}
                onChange={(e) => setApplicationIdInput(e.target.value)}
                placeholder="Enter Application ID (e.g., APP-123456)"
                className="pl-10 w-full"
                aria-label="Application ID"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <SearchIcon className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </form>
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

      {notFound && !isLoading && (
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Application Not Found</AlertTitle>
          <AlertDescription>
            No application found with ID: {applicationIdInput}. Please check the ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && searchedApplication && (
        <div className="space-y-6">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Application Status: {searchedApplication.id}</CardTitle>
                  <CardDescription>
                    Submitted on: {format(new Date(searchedApplication.submissionDate), 'PPP p')}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(searchedApplication.status)} className="text-lg capitalize">
                  {searchedApplication.status.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedAwaitingBiometrics' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.voterId && (
                <DetailItem label="Voter ID" value={searchedApplication.voterId} icon={CheckCircle} />
              )}
              {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.precinct &&(
                <DetailItem label="Precinct No." value={searchedApplication.precinct} icon={MapPin} />
              )}
              {(searchedApplication.status === 'approved' || searchedApplication.status === 'approvedBiometricsScheduled') && searchedApplication.approvalDate && (
                <DetailItem label="Approval Date" value={format(new Date(searchedApplication.approvalDate), 'PPP p')} icon={CalendarDays} />
              )}
              
              {searchedApplication.biometricsSchedule && (searchedApplication.status === 'approvedBiometricsScheduled' || searchedApplication.status === 'approved') && (
                 <Card className="my-4 border-blue-300">
                    <CardHeader><CardTitle className="flex items-center text-base text-blue-700"><Clock className="mr-2 text-blue-500"/>Biometrics Schedule</CardTitle></CardHeader>
                    <CardContent>
                        <DetailItem label="Scheduled Date" value={format(new Date(searchedApplication.biometricsSchedule.date), 'PPP')} icon={CalendarDays}/>
                        <DetailItem label="Scheduled Time" value={searchedApplication.biometricsSchedule.time} icon={Clock}/>
                        <DetailItem label="Location" value={searchedApplication.biometricsSchedule.location || 'Main COMELEC Office'} icon={MapPin}/>
                    </CardContent>
                </Card>
              )}
              
              <DetailItem label="Officer Remarks" value={searchedApplication.remarks || (searchedApplication.status.startsWith('approved') ? 'Application Approved.' : 'No remarks provided.')} icon={MessageSquare} />
            
              {searchedApplication.classification && (
                <Card className="mt-4 bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      AI Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p><strong>Type:</strong> {searchedApplication.classification.applicantType}</p>
                    <p><strong>Confidence:</strong> {(searchedApplication.classification.confidence * 100).toFixed(0)}%</p>
                    <p><strong>Reason:</strong> {searchedApplication.classification.reason}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <div className="w-full max-w-3xl mx-auto">
            <AcknowledgementReceipt application={searchedApplication} />
          </div>
        </div>
      )}
    </div>
  );
}

