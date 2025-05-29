
'use client';

import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Download, CheckCircle, MapPin, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AcknowledgementReceiptProps {
  application: Application | null;
}

// Function to store pinned applications
const PINNED_APPS_KEY_PREFIX = 'vrams_pinned_apps_';

const getPinnedApplications = (username: string): string[] => {
  if (typeof window === 'undefined') return [];
  const key = `${PINNED_APPS_KEY_PREFIX}${username}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const savePinnedApplications = (username: string, appIds: string[]): void => {
  if (typeof window === 'undefined') return;
  const key = `${PINNED_APPS_KEY_PREFIX}${username}`;
  localStorage.setItem(key, JSON.stringify(appIds));
};


export function AcknowledgementReceipt({ application }: AcknowledgementReceiptProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!application) {
    return <p>Application data not available for receipt.</p>;
  }

  const handlePrint = () => {
    console.log("Print button clicked. Attempting to call window.print().");
    alert("About to call window.print(). Click OK to proceed.");
    try {
      window.print();
      alert("window.print() has been called. Check for print dialog.");
    } catch (e) {
      console.error("Error calling window.print(): ", e);
      alert("An error occurred while trying to print.");
    }
  };

  const handlePinApplication = () => {
    if (!user || !user.username) {
      toast({ title: "Error", description: "You must be logged in to pin applications.", variant: "destructive" });
      return;
    }
    const currentPinned = getPinnedApplications(user.username);
    if (!currentPinned.includes(application.id)) {
      const newPinned = [...currentPinned, application.id];
      savePinnedApplications(user.username, newPinned);
      toast({ title: "Application Pinned", description: `Application ID ${application.id} pinned to your dashboard.` });
    } else {
      toast({ title: "Already Pinned", description: `Application ID ${application.id} is already pinned.` });
    }
  };

  return (
    <Card id="printable-receipt-area" className="w-full max-w-2xl mx-auto my-6 print:shadow-none print:border print:border-black">
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-semibold">ACKNOWLEDGEMENT RECEIPT</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-4 px-6 py-4 print:px-2 print:py-1">
        <div className="text-center text-xs mb-4 print:text-[10pt]">
          (REPUBLIC OF THE PHILIPPINES) <br />
          COMMISSION ON ELECTIONS <br />
          {application.addressDetails.cityMunicipality.toUpperCase()}, {application.addressDetails.province.toUpperCase()}
        </div>

        <div className="space-y-2">
            <span className="block text-xs text-muted-foreground print:text-[9pt]">APPLICATION FOR REGISTRATION OF:</span>
            <div className="grid grid-cols-3 gap-x-2 items-end">
                <div className="col-span-1">
                    <span className="font-semibold uppercase border-b border-foreground pb-0.5 tracking-wide block truncate">
                        {application.personalInfo.lastName.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground print:text-[9pt]">LAST NAME</span>
                </div>
                <div className="col-span-1">
                    <span className="font-semibold uppercase border-b border-foreground pb-0.5 tracking-wide block truncate">
                        {application.personalInfo.firstName.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground print:text-[9pt]">FIRST NAME</span>
                </div>
                <div className="col-span-1">
                    <span className="font-semibold uppercase border-b border-foreground pb-0.5 tracking-wide block truncate">
                        {application.personalInfo.middleName ? application.personalInfo.middleName.toUpperCase() : ''}
                    </span>
                    <span className="text-xs text-muted-foreground print:text-[9pt]">MIDDLE NAME</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-x-2 items-end mt-3">
             <div className="col-span-1">
                <span className="text-xs text-muted-foreground print:text-[9pt]">APPLICATION NO.:</span>
            </div>
            <div className="col-span-2">
                <span className="font-semibold uppercase tracking-wide">
                    {application.id}
                </span>
            </div>
        </div>
        
        <p className="text-xs leading-relaxed mt-4 pt-2 border-t border-dashed print:text-[9pt]">
          This is to acknowledge receipt of your Application for registration.
          You are not yet registered unless approved by the Election Registration Board (ERB).
          You need not appear in the ERB hearing unless required through a written notice.
        </p>

        <div className="text-center mt-6 print:hidden print-hide">
          <Button onClick={handlePrint} variant="outline" className="mr-2">
            <Printer className="mr-2 h-4 w-4" /> Download/Print Receipt
          </Button>
          <Button onClick={handlePinApplication}>
            <MapPin className="mr-2 h-4 w-4" /> Pin Application to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
    