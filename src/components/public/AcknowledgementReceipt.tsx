
'use client';
import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Pin } from 'lucide-react';

interface AcknowledgementReceiptProps {
  application: Application;
}

export function AcknowledgementReceipt({ application }: AcknowledgementReceiptProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePrint = () => {
    console.log("Print button clicked. Attempting to call window.print().");
    try {
      window.print();
      console.log("window.print() has been called.");
    } catch (error) {
      console.error("Error calling window.print():", error);
      toast({
        title: "Print Error",
        description: "Could not open print dialog. Please check browser settings or try saving as PDF.",
        variant: "destructive",
      });
    }
  };

  const handlePinApplication = () => {
    if (!user || !application) return;
    const Pinned_APPS_KEY = `vrams_pinned_applications_${user.username}`;
    let pinnedApps: string[] = [];
    try {
      const storedPinned = localStorage.getItem(Pinned_APPS_KEY);
      if (storedPinned) {
        pinnedApps = JSON.parse(storedPinned);
      }
    } catch (e) {
      console.error("Error parsing pinned applications from localStorage:", e);
      pinnedApps = []; // Reset if corrupt
    }

    if (!pinnedApps.includes(application.id)) {
      pinnedApps.push(application.id);
      localStorage.setItem(Pinned_APPS_KEY, JSON.stringify(pinnedApps));
      toast({
        title: "Application Pinned",
        description: `Application ID ${application.id} has been pinned to your dashboard.`,
      });
    } else {
      toast({
        title: "Already Pinned",
        description: `Application ID ${application.id} is already pinned.`,
        variant: "default",
      });
    }
  };


  if (!application || !application.personalInfo) {
    return <p>Application data not available.</p>;
  }

  const { personalInfo: pi } = application;

  return (
    <Card id="printable-receipt-area" className="w-full max-w-2xl mx-auto mt-6 border-dashed border-2 p-4 print-this-section">
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-bold tracking-wider">ACKNOWLEDGEMENT RECEIPT</CardTitle>
        <CardDescription className="text-xs">Voter Registration and Application Management System (VRAMS)</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <p className="text-xs text-muted-foreground">APPLICATION FOR REGISTRATION OF:</p>
        
        <div className="grid grid-cols-[max-content_1fr] items-end gap-x-2">
          <span className="text-xs text-muted-foreground">LAST NAME:</span>
          <span className="border-b border-gray-400 pb-0.5 font-semibold uppercase tracking-wide">{pi.lastName || 'N/A'}</span>
          
          <span className="text-xs text-muted-foreground">FIRST NAME:</span>
          <span className="border-b border-gray-400 pb-0.5 font-semibold uppercase tracking-wide">{pi.firstName || 'N/A'}</span>
          
          <span className="text-xs text-muted-foreground">MIDDLE NAME:</span>
          <span className="border-b border-gray-400 pb-0.5 font-semibold uppercase tracking-wide">{pi.middleName || 'N/A'}</span>
        </div>

        <div className="grid grid-cols-[max-content_1fr] items-end gap-x-2 pt-1">
            <span className="text-xs text-muted-foreground">APPLICATION NO.:</span>
            <span className="font-semibold uppercase tracking-wide">{application.id || 'N/A'}</span>
        </div>

        <p className="text-xs text-muted-foreground pt-3 leading-relaxed">
          This is to acknowledge receipt of your Application for registration. You are not yet registered unless approved by the Election Registration Board (ERB). You need not appear in the ERB hearing unless required through a written notice.
        </p>
        <p className="text-center text-xs text-muted-foreground pt-4 print-hide">
          Keep this receipt for your records.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-4 print-hide">
          <Button onClick={handlePrint} variant="default">
            <FileDown className="mr-2 h-4 w-4" /> Download/Print Receipt
          </Button>
          <Button onClick={handlePinApplication} variant="outline">
            <Pin className="mr-2 h-4 w-4" /> Pin Application to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
