
'use client';

import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer } from 'lucide-react';

interface AcknowledgementReceiptProps {
  application: Application | null;
}

export function AcknowledgementReceipt({ application }: AcknowledgementReceiptProps) {
  if (!application) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="printable-receipt-area" className="mt-6">
      <Card className="shadcn-card"> {/* Added shadcn-card class for print style targeting */}
        <CardHeader>
          <CardTitle className="text-xl text-center font-bold">ACKNOWLEDGEMENT RECEIPT</CardTitle>
          <CardDescription className="text-center">Republic of the Philippines<br />COMMISSION ON ELECTIONS<br />Office of the Election Officer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-t border-b py-2 border-dashed">
            <p className="text-sm">
              Application for: <span className="font-semibold">REGISTRATION</span>
            </p>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <p className="text-xs text-muted-foreground">Last Name</p>
                <p className="font-semibold">{application.personalInfo.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">First Name</p>
                <p className="font-semibold">{application.personalInfo.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Middle Name</p>
                <p className="font-semibold">{application.personalInfo.middleName || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <p className="text-sm">Application No.: <span className="font-semibold">{application.id}</span></p>
          </div>

          <div className="text-xs text-center italic px-4 py-2 border border-dashed">
            <p>
              This is to acknowledge receipt of your Application for registration.
              You are not yet registered unless approved by the Election Registration Board (ERB).
              You need not appear in the ERB hearing unless required through a written notice.
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end print-hide">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      </div>
    </div>
  );
}
