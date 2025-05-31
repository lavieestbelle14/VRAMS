
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Application } from '@/types';
import { getApplicationById, seedInitialData } from '@/lib/applicationStore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search as SearchIcon, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AcknowledgementReceipt } from '@/components/public/AcknowledgementReceipt'; // Import the receipt component

export default function TrackApplicationStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [searchedApplication, setSearchedApplication] = useState<Application | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    seedInitialData(); // Ensure sample data is available for testing
  }, []);

  const handleTrackApplication = () => {
    if (!applicationId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an Application ID.',
        variant: 'destructive',
      });
      return;
    }
    const app = getApplicationById(applicationId.trim());
    if (app) {
      setSearchedApplication(app);
      setNotFound(false);
    } else {
      setSearchedApplication(null);
      setNotFound(true);
      toast({
        title: 'Application Not Found',
        description: `No application found with ID: ${applicationId}`,
        variant: 'destructive',
      });
    }
  };
  
  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
      case 'reviewing':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'approvedAwaitingBiometrics':
      case 'approvedBiometricsScheduled':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
      case 'reviewing':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SearchIcon className="mr-2 h-7 w-7 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">Track Your Application</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Check Application Status</CardTitle>
          <CardDescription>
            Enter your Application ID below to check its current status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <Label htmlFor="applicationId" className="sr-only">Application ID</Label>
              <Input
                id="applicationId"
                type="text"
                placeholder="Enter Application ID (e.g., APP-001)"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                className="text-base"
              />
            </div>
            <Button onClick={handleTrackApplication} className="w-full sm:w-auto">
              <SearchIcon className="mr-2 h-4 w-4" /> Track Application
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchedApplication && (
        <div className="mt-6">
          <AcknowledgementReceipt application={searchedApplication} />
        </div>
      )}

      {notFound && !searchedApplication && (
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Application Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We could not find an application with the ID <span className="font-semibold">{applicationId}</span>. 
              Please double-check the ID and try again.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              If you are sure the ID is correct and you recently submitted, it might take some time for the system to update. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

