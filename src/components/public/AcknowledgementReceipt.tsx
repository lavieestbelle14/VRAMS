
'use client';

import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // useRouter might not be needed here unless for other actions

export function AcknowledgementReceipt({ application }: { application: Application }) {
  const { toast } = useToast();
  // const router = useRouter(); // Not directly used in this version of receipt

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handlePinToDashboard = () => {
    if (typeof window !== 'undefined' && application) {
      const pinnedKey = `vrams_pinned_apps_${application.personalInfo.email || 'guest'}`; // Simple user-scoping
      let pinnedApps: string[] = JSON.parse(localStorage.getItem(pinnedKey) || '[]');
      if (!pinnedApps.includes(application.id)) {
        pinnedApps.push(application.id);
        localStorage.setItem(pinnedKey, JSON.stringify(pinnedApps));
        toast({
          title: "Application Pinned",
          description: `Application ID ${application.id} has been pinned to your dashboard.`,
        });
      } else {
        toast({
          title: "Already Pinned",
          description: `Application ID ${application.id} is already on your dashboard.`,
          variant: "default",
        });
      }
    }
  };

  const renderNameField = (label: string, value?: string) => {
    const displayValue = (value || '').toUpperCase();
    return (
      <div className="flex items-baseline mb-0.5">
        <span className="text-[9px] font-medium w-10 flex-shrink-0">{label}</span>
        <span className="ml-1 flex-1 border-b border-black min-h-[1rem] leading-[1rem] px-1 font-semibold text-[10px] tracking-wider truncate">
          {displayValue || '\u00A0' /* Non-breaking space for empty fields */}
        </span>
      </div>
    );
  };
  
  const renderRadio = (text: string, isChecked: boolean) => (
    <div className="flex items-center mb-0.5">
      <span className={`inline-block w-2.5 h-2.5 border border-black rounded-full mr-1 flex items-center justify-center flex-shrink-0`}>
        {isChecked && <span className="w-1.5 h-1.5 bg-black rounded-full"></span>}
      </span>
      <span className="text-[9px] leading-tight">{text}</span>
    </div>
  );

  if (!application) {
    return <p>Application data not available.</p>;
  }

  return (
    <Card className="mt-6 shadow-lg" id="printable-receipt-area">
      <CardHeader className="p-2.5 border-b border-black">
        <CardTitle className="text-center text-sm font-bold tracking-wider">ACKNOWLEDGEMENT RECEIPT</CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2 text-xs font-serif"> {/* Adjusted padding and font */}
        
        <div className="flex gap-x-2">
          {/* Left Column: Type of Application & Application for Registration */}
          <div className="w-[60%] space-y-1.5 pr-1.5 border-r border-gray-400">
            <div>
              <p className="text-[9px] font-semibold mb-0.5">Type of Application</p>
              <div className="grid grid-cols-2 gap-x-1">
                <div>
                  {renderRadio("Registration", application.applicationType === 'register')}
                  {renderRadio("Transfer", application.applicationType === 'transfer')}
                  {renderRadio("Reactivation", false)} {/* Placeholder */}
                </div>
                <div>
                  {renderRadio("Transfer with Reactivation", false)} {/* Placeholder */}
                  {renderRadio("Change of Name/Correction of Entry", false)} {/* Placeholder */}
                  {renderRadio("Reinstatement/Inclusion", false)} {/* Placeholder */}
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <p className="text-[9px] font-semibold mb-0.5">Application for Registration</p>
              {renderNameField("Last", application.personalInfo.lastName)}
              {renderNameField("First", application.personalInfo.firstName)}
              {renderNameField("Middle", application.personalInfo.middleName)}
            </div>
          </div>

          {/* Right Column: Application No. & Text Block */}
          <div className="w-[40%] space-y-1 pl-1.5 flex flex-col justify-between">
            <div>
              <div className="mb-1">
                <span className="text-[9px] font-semibold block leading-tight">Application No.</span>
                <p className="font-semibold uppercase tracking-wider text-[10px] border-b border-black pb-0.5 min-h-[1rem] leading-[1rem] truncate">
                  {application.id || '\u00A0'}
                </p>
              </div>
              <p className="text-[8px] leading-[1.3] hyphens-auto"> {/* Smallest text for block, allow hyphenation */}
                This is to acknowledge receipt of your application. Your application is subject for Approval/Disapproval by the Election Registration Board (ERB). You need not appear in the ERB hearing unless required through a written notice.
              </p>
            </div>
            <p className="text-[9px] mt-auto"> {/* Pushes to bottom of its flex container */}
              Date of ERB Hearing: <span className="inline-block w-16 border-b border-black">&nbsp;</span>
            </p>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t-2 border-black"> {/* Thicker top border */}
          <p className="text-[9px] text-center">EO/Interviewer Signature above Printed Name</p>
        </div>
      </CardContent>

      <CardFooter className="justify-end space-x-2 print-hide p-2.5"> {/* Adjusted padding */}
        <Button variant="outline" size="sm" onClick={handlePinToDashboard}>
          <Paperclip className="mr-1.5 h-3.5 w-3.5" /> Pin to Dashboard
        </Button>
        <Button size="sm" onClick={handlePrint}>
          <Printer className="mr-1.5 h-3.5 w-3.5" /> Download/Print Receipt
        </Button>
      </CardFooter>
    </Card>
  );
}
