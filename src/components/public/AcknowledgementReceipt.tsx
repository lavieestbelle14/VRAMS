
'use client';
import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, Pin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns'; // Added for displaying submissionDate

interface AcknowledgementReceiptProps {
  application: Application;
  showPinButton?: boolean;
}

const PINNED_APPS_STORAGE_KEY_PREFIX = 'vrams_pinned_applications_';

export function AcknowledgementReceipt({ application, showPinButton = true }: AcknowledgementReceiptProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePrint = () => {
    console.log('Print button clicked. Attempting to call window.print().');
    try {
      const printableArea = document.getElementById('printable-receipt-area');
      if (!printableArea) {
        console.error('Printable area not found!');
        toast({
          title: "Print Error",
          description: "Could not find the receipt content to print.",
          variant: "destructive",
        });
        return;
      }
      // You might need more sophisticated print handling if just window.print() is not working
      // For now, let's stick to the basic and ensure it's called.
      window.print();
    } catch (error) {
      console.error('Error calling window.print():', error);
      toast({
        title: "Print Error",
        description: "Could not open the print dialog. Please check the browser console for errors.",
        variant: "destructive",
      });
    }
  };

  const handlePinApplication = () => {
    if (!user || !application) return;
    const storageKey = `${PINNED_APPS_STORAGE_KEY_PREFIX}${user.username}`;
    try {
      let pinnedApps: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!pinnedApps.includes(application.id)) {
        pinnedApps.push(application.id);
        localStorage.setItem(storageKey, JSON.stringify(pinnedApps));
        toast({
          title: 'Application Pinned!',
          description: `Application ID ${application.id} has been pinned to your dashboard.`,
        });
      } else {
        toast({
          title: 'Already Pinned',
          description: `Application ID ${application.id} is already on your dashboard.`,
          variant: 'default',
        });
      }
    } catch (e) {
      console.error("Failed to pin application:", e);
      toast({
        title: 'Error Pining Application',
        description: 'Could not pin the application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!application) return null;

  const applicantName = `${application.personalInfo.lastName}, ${application.personalInfo.firstName} ${application.personalInfo.middleName || ''}`.trim();

  return (
    <Card id="printable-receipt-area" className="mt-6 mb-6 border-2 border-dashed border-muted-foreground bg-card text-card-foreground shadow-lg print:shadow-none print:border-none print:m-0 print:p-0">
      <CardHeader className="print:p-2">
        <CardTitle className="text-xl text-center font-serif print:text-lg">ACKNOWLEDGEMENT RECEIPT</CardTitle>
        <CardDescription className="text-center print:text-xs">
          This serves as your proof of application submission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 print:p-2 print:text-sm">
        <dl className="space-y-2 font-mono print:font-sans">
          <div>
            <dt className="font-semibold text-muted-foreground print:text-black">Application For:</dt>
            <dd className="ml-4 print:ml-2">{application.applicationType === 'register' ? 'Registration' : 'Transfer of Registration'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted-foreground print:text-black">Applicant&apos;s Name:</dt>
            <dd className="ml-4 print:ml-2">{applicantName.toUpperCase()}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted-foreground print:text-black">Application No.:</dt>
            <dd className="ml-4 print:ml-2">{application.id}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted-foreground print:text-black">Date Submitted:</dt>
            <dd className="ml-4 print:ml-2">{format(new Date(application.submissionDate), 'MMMM dd, yyyy hh:mm a')}</dd>
          </div>
        </dl>
        <Separator className="my-4 print:hidden" />
        <p className="text-xs text-muted-foreground italic print:text-xs print:text-black">
          This is to acknowledge receipt of your Application for registration.
          You are not yet registered unless approved by the Election Registration Board (ERB).
          You need not appear in the ERB hearing unless required through a written notice.
        </p>
        <div className="text-center mt-6 print-hide">
          <Button onClick={handlePrint} variant="outline" className="mr-2">
            <Printer className="mr-2 h-4 w-4" /> Download/Print Receipt
          </Button>
          {showPinButton && user && (
            <Button onClick={handlePinApplication}>
              <Pin className="mr-2 h-4 w-4" /> Pin Application to Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
