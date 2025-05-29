
'use client';
import type { Application } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Bookmark } from 'lucide-react'; // Added Bookmark
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Added

interface AcknowledgementReceiptProps {
  application: Application;
}

export const AcknowledgementReceipt = ({ application }: AcknowledgementReceiptProps) => {
  const { user } = useAuth(); // Added
  const { toast } = useToast();

  const handlePrint = () => {
    console.log("Print button clicked. Attempting to call window.print().");
    alert("About to call window.print(). Click OK to proceed.");
    try {
      window.print();
      console.log("window.print() called successfully.");
      alert("window.print() has been called. Check for print dialog.");
    } catch (error) {
      console.error("Error calling window.print():", error);
      alert("An error occurred while trying to print. Check console.");
      toast({
        title: "Print Error",
        description: "Could not open print dialog. Please check browser console for errors.",
        variant: "destructive",
      });
    }
  };

  const handlePinApplication = () => {
    if (!application || !user) return;
    const key = `pinned_applications_${user.username}`;
    let pinnedApps: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!pinnedApps.includes(application.id)) {
      pinnedApps.push(application.id);
      localStorage.setItem(key, JSON.stringify(pinnedApps));
      toast({ title: 'Application Pinned', description: `${application.id} has been pinned to your dashboard.` });
    } else {
      toast({ title: 'Already Pinned', description: `${application.id} is already pinned.`, variant: 'default' });
    }
  };


  if (!application) {
    return <p>Application data not found.</p>;
  }

  return (
    <Card id="printable-receipt-area" className="mt-6 border-dashed border-2 border-muted-foreground p-4">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">ACKNOWLEDGEMENT RECEIPT</CardTitle>
        <CardDescription>Republic of the Philippines</CardDescription>
        <CardDescription>Commission on Elections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="text-center mb-4">
          <p className="font-semibold">APPLICATION FOR REGISTRATION</p>
        </div>
        <div className="grid grid-cols-3 gap-x-2 items-baseline">
          <p className="text-muted-foreground col-span-1">Last Name:</p>
          <p className="font-medium border-b border-foreground text-center col-span-2">{application.personalInfo.lastName}</p>
        </div>
        <div className="grid grid-cols-3 gap-x-2 items-baseline">
          <p className="text-muted-foreground col-span-1">First Name:</p>
          <p className="font-medium border-b border-foreground text-center col-span-2">{application.personalInfo.firstName}</p>
        </div>
        <div className="grid grid-cols-3 gap-x-2 items-baseline">
          <p className="text-muted-foreground col-span-1">Middle Name:</p>
          <p className="font-medium border-b border-foreground text-center col-span-2">{application.personalInfo.middleName || ''}</p>
        </div>
         <div className="grid grid-cols-3 gap-x-2 items-baseline mt-2">
          <p className="text-muted-foreground col-span-1">Application No.:</p>
          <p className="font-medium col-span-2">{application.id}</p>
        </div>

        <p className="text-xs italic mt-4 text-center">
          This is to acknowledge receipt of your Application for registration.
          You are not yet registered unless approved by the Election Registration Board (ERB).
          You need not appear in the ERB hearing unless required through a written notice.
        </p>
      </CardContent>
      <div className="mt-6 pt-6 border-t print-hide flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="mt-4" 
        >
          <Printer className="mr-2 h-4 w-4" /> Download/Print Receipt
        </Button>
        <Button
            variant="outline"
            onClick={handlePinApplication}
            className="mt-4"
        >
            <Bookmark className="mr-2 h-4 w-4" /> Pin Application to Dashboard
        </Button>
      </div>
    </Card>
  );
};
