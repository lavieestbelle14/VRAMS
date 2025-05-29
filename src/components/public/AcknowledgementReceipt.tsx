
'use client';

import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, BookmarkPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AcknowledgementReceiptProps {
  application: Application | null;
  onPin?: (applicationId: string) => void;
  isPinned?: boolean;
  onUnpin?: (applicationId: string) => void;
}

export function AcknowledgementReceipt({ application, onPin, isPinned, onUnpin }: AcknowledgementReceiptProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!application) {
    return <p className="text-destructive text-center">Application data not available for receipt.</p>;
  }

  const handlePrint = () => {
    console.log("AcknowledgementReceipt: Print button clicked. Attempting to call window.print().");
    // alert("About to call window.print(). Click OK to proceed."); // Removed alert
    try {
      window.print();
      console.log("AcknowledgementReceipt: window.print() called successfully.");
      // alert("window.print() has been called. Check for print dialog."); // Removed alert
    } catch (error) {
      console.error("AcknowledgementReceipt: Error calling window.print():", error);
      toast({
        title: "Print Error",
        description: "Could not open print dialog. Please try again or check browser settings.",
        variant: "destructive",
      });
    }
  };

  const handlePinClick = () => {
    if (onPin && !isPinned) {
      onPin(application.id);
    } else if (onUnpin && isPinned) {
      onUnpin(application.id);
    }
  };

  const { personalInfo: pi } = application;

  return (
    <div id="printable-receipt-area" className="mt-6 p-6 border-2 border-dashed border-foreground rounded-lg bg-background shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">Acknowledgement Receipt</h2>
        <p className="text-sm text-muted-foreground">Voter Registration and Application Management System (VRAMS)</p>
      </div>

      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">APPLICATION FOR REGISTRATION OF:</p>
        <div className="grid grid-cols-[auto,1fr] gap-x-2 items-end">
          <span className="text-muted-foreground uppercase">Last Name:</span>
          <span className="font-semibold uppercase border-b border-foreground pb-0.5 tracking-wide">{pi.lastName}</span>

          <span className="text-muted-foreground uppercase">First Name:</span>
          <span className="font-semibold uppercase border-b border-foreground pb-0.5 tracking-wide">{pi.firstName}</span>

          <span className="text-muted-foreground uppercase">Middle Name:</span>
          <span className="font-semibold uppercase border-b border-foreground pb-0.5 tracking-wide">{pi.middleName || 'N/A'}</span>
        </div>

        <div className="grid grid-cols-[auto,1fr] gap-x-2 items-end mt-3">
            <span className="text-muted-foreground uppercase">Application No.:</span>
            <span className="font-semibold uppercase pb-0.5 tracking-wide">{application.id}</span>
        </div>

        <p className="pt-4 text-xs italic text-muted-foreground">
          This is to acknowledge receipt of your Application for registration. You are not yet registered unless approved by the Election Registration Board (ERB).
          You need not appear in the ERB hearing unless required through a written notice.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 print-hide">
        {onPin && user && ( // Only show pin button if onPin is provided (i.e., called from home page) and user is logged in
          <Button onClick={handlePinClick} variant="outline" size="sm">
            <BookmarkPlus className="mr-2 h-4 w-4" />
            {isPinned ? 'Unpin from Dashboard' : 'Pin to Dashboard'}
          </Button>
        )}
        <Button onClick={handlePrint} size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Download/Print Receipt
        </Button>
      </div>
       <div className="mt-2 text-center print-hide">
         <p className="text-xs text-muted-foreground">Keep this receipt for your records.</p>
       </div>
    </div>
  );
}
