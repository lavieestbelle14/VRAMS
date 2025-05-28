
'use client';

import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Pin, Printer } from 'lucide-react'; // Added Pin icon
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AcknowledgementReceiptProps {
  application: Application;
}

const getPinnedApplicationsKey = (username: string | undefined) => {
  if (!username) return null;
  return `pinned_applications_${username}`;
};

export function AcknowledgementReceipt({ application }: AcknowledgementReceiptProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handlePinApplication = () => {
    if (!user || !user.username) {
      toast({ title: 'Error', description: 'You must be logged in to pin applications.', variant: 'destructive' });
      return;
    }
    const key = getPinnedApplicationsKey(user.username);
    if (!key) return;

    let pinnedApps: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (!pinnedApps.includes(application.id)) {
      pinnedApps.push(application.id);
      localStorage.setItem(key, JSON.stringify(pinnedApps));
      toast({ title: 'Application Pinned', description: `${application.id} has been pinned to your dashboard.` });
    } else {
      toast({ title: 'Already Pinned', description: `${application.id} is already pinned.` });
    }
  };

  if (!application) {
    return <p>Application data not found for receipt.</p>;
  }

  return (
    <Card id="printable-receipt-area" className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-center text-primary">ACKNOWLEDGEMENT RECEIPT</CardTitle>
        <CardDescription className="text-center">
          (Resibo ng Pagtanggap)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="font-semibold">Application for: <span className="font-normal capitalize">{application.applicationType}</span></p>
          <p className="font-semibold">Applicant Name:</p>
          <p className="ml-4">Last Name: <span className="font-normal">{application.personalInfo.lastName}</span></p>
          <p className="ml-4">First Name: <span className="font-normal">{application.personalInfo.firstName}</span></p>
          <p className="ml-4">Middle Name: <span className="font-normal">{application.personalInfo.middleName || 'N/A'}</span></p>
          <p className="font-semibold mt-1">Application No.: <span className="font-normal">{application.id}</span></p>
        </div>
        <Separator />
        <p className="text-xs italic text-center mt-2">
          This is to acknowledge receipt of your Application for registration.
          You are not yet registered unless approved by the Election Registration Board (ERB).
          You need not appear in the ERB hearing unless required through a written notice.
        </p>
        <Separator />
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4 print-hide">
          <Button variant="outline" onClick={handlePinApplication}>
            <Pin className="mr-2 h-4 w-4" /> Pin to Dashboard
          </Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" /> Download/Print Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
