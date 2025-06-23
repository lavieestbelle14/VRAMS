'use client';

import type { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // useRouter might not be needed here unless for other actions

export function AcknowledgementReceipt({ application }: { application: Application }) {
  const { toast } = useToast();
  // const router = useRouter(); // Not directly used in this version of receipt

  const handleDownloadImage = async () => {
    if (typeof window === 'undefined') return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (8.5" x 11" at 150 DPI)
      canvas.width = 1275;
      canvas.height = 1650;

      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';

      // Header
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ACKNOWLEDGEMENT RECEIPT', canvas.width / 2, 80);

      // Reset text alignment
      ctx.textAlign = 'left';

      // Draw border
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 120, canvas.width - 100, 500);

      // Vertical divider line
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50 + (canvas.width - 100) * 0.6, 120);
      ctx.lineTo(50 + (canvas.width - 100) * 0.6, 620);
      ctx.stroke();

      // Left column content
      let y = 160;
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Type of Application', 70, y);
      
      y += 30;
      ctx.font = '12px Arial';
      
      // Radio buttons for application types
      const radioOptions = [
        { text: 'Registration', checked: application.applicationType === 'register', x: 70 },
        { text: 'Transfer with Reactivation', checked: application.applicationType === 'transfer_with_reactivation', x: 320 },
        { text: 'Transfer', checked: application.applicationType === 'transfer', x: 70 },
        { text: 'Change of Name/Correction of Entry', checked: application.applicationType === 'correction_of_entry', x: 320 },
        { text: 'Reactivation', checked: application.applicationType === 'reactivation', x: 70 },
        { text: 'Reinstatement/Inclusion', checked: application.applicationType === 'reinstatement', x: 320 }
      ];

      radioOptions.forEach((option, index) => {
        const radioY = y + Math.floor(index / 2) * 25;
        
        // Draw radio circle
        ctx.beginPath();
        ctx.arc(option.x, radioY - 3, 6, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Fill if checked
        if (option.checked) {
          ctx.beginPath();
          ctx.arc(option.x, radioY - 3, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Draw text
        ctx.fillText(option.text, option.x + 15, radioY);
      });

      // Application for Registration section
      y += 120;
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Application for Registration', 70, y);
      
      y += 30;
      ctx.font = '12px Arial';
      
      // Name fields
      const nameFields = [
        { label: 'Last', value: application.personalInfo?.lastName?.toUpperCase() || '' },
        { label: 'First', value: application.personalInfo?.firstName?.toUpperCase() || '' },
        { label: 'Middle', value: application.personalInfo?.middleName?.toUpperCase() || '' }
      ];

      nameFields.forEach((field) => {
        ctx.fillText(field.label, 70, y);
        
        // Draw underline for name
        ctx.beginPath();
        ctx.moveTo(120, y + 5);
        ctx.lineTo(450, y + 5);
        ctx.stroke();
        
        // Fill in the name
        ctx.font = 'bold 12px Arial';
        ctx.fillText(field.value, 125, y);
        ctx.font = '12px Arial';
        
        y += 35;
      });

      // Right column content
      const rightColumnX = 50 + (canvas.width - 100) * 0.6 + 20;
      let rightY = 160;
      
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Application No.', rightColumnX, rightY);
      
      rightY += 25;
      ctx.font = 'bold 12px Arial';
      ctx.fillText(application.id || '', rightColumnX, rightY);
      
      // Draw underline for application number
      ctx.beginPath();
      ctx.moveTo(rightColumnX, rightY + 5);
      ctx.lineTo(canvas.width - 70, rightY + 5);
      ctx.stroke();

      rightY += 50;
      ctx.font = '11px Arial';
      const disclaimerText = 'This is to acknowledge receipt of your application. Your application is subject for Approval/Disapproval by the Election Registration Board (ERB). You need not appear in the ERB hearing unless required through a written notice.';
      
      // Word wrap the disclaimer text
      const words = disclaimerText.split(' ');
      const maxWidth = canvas.width - rightColumnX - 70;
      let line = '';
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, rightColumnX, rightY);
          line = words[n] + ' ';
          rightY += 18;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, rightColumnX, rightY);

      // ERB Hearing section at bottom of right column
      rightY = 580;
      ctx.font = '12px Arial';
      ctx.fillText('Date of ERB Hearing:', rightColumnX, rightY);
      
      // Draw underline for date
      ctx.beginPath();
      ctx.moveTo(rightColumnX + 130, rightY + 5);
      ctx.lineTo(canvas.width - 70, rightY + 5);
      ctx.stroke();

      // Bottom signature line
      y = 660;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 50, y);
      ctx.lineWidth = 2;
      ctx.stroke();
      
      y += 25;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EO/Interviewer Signature above Printed Name', canvas.width / 2, y);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `acknowledgement-receipt-${application.id || 'unknown'}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Receipt Downloaded",
            description: "The acknowledgement receipt has been downloaded as an image.",
          });
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating receipt image:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the receipt image.",
        variant: "destructive",
      });
    }
  };

  const renderNameField = (label: string, value?: string) => {
    const displayValue = (value || '').toUpperCase();
    return (
      <div className="flex items-baseline mb-0.5">
        <span className="text-[9px] font-medium w-10 flex-shrink-0">{label}</span>
        <span className="ml-1 flex-1 border-b border-black min-h-[1rem] leading-[1rem] px-1 font-semibold text-[10px] tracking-wider">
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
    <Card className="mt-6 shadow-lg">
      <CardHeader className="p-2.5 border-b border-black">
        <CardTitle className="text-center text-sm font-bold tracking-wider">ACKNOWLEDGEMENT RECEIPT</CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2 text-xs font-serif">
        
        <div className="flex gap-x-2">
          {/* Left Column: Type of Application & Application for Registration */}
          <div className="w-[60%] space-y-1.5 pr-1.5 border-r border-gray-400">
            <div>
              <p className="text-[9px] font-semibold mb-0.5">Type of Application</p>
              <div className="grid grid-cols-2 gap-x-1">
                <div>
                  {renderRadio("Registration", application.applicationType === 'register')}
                  {renderRadio("Transfer", application.applicationType === 'transfer')}
                  {renderRadio("Reactivation", application.applicationType === 'reactivation')}
                </div>
                <div>
                  {renderRadio("Transfer with Reactivation", application.applicationType === 'transfer_with_reactivation')}
                  {renderRadio("Change of Name/Correction of Entry", application.applicationType === 'correction_of_entry')}
                  {renderRadio("Reinstatement/Inclusion", application.applicationType === 'reinstatement')}
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <p className="text-[9px] font-semibold mb-0.5">Application for Registration</p>
              {renderNameField("Last", application.personalInfo?.lastName)}
              {renderNameField("First", application.personalInfo?.firstName)}
              {renderNameField("Middle", application.personalInfo?.middleName)}
            </div>
          </div>

          {/* Right Column: Application No. & Text Block */}
          <div className="w-[40%] space-y-1 pl-1.5">
            <div>
              <div className="mb-1">
                <span className="text-[9px] font-semibold block leading-tight">Application No.</span>
                <p className="font-semibold uppercase tracking-wider text-[10px] border-b border-black pb-0.5 min-h-[1rem] leading-[1rem]">
                  {application.id || '\u00A0'}
                </p>
              </div>
              <p className="text-[8px] leading-[1.3] hyphens-auto">
                This is to acknowledge receipt of your application. Your application is subject for Approval/Disapproval by the Election Registration Board (ERB). You need not appear in the ERB hearing unless required through a written notice.
              </p>
            </div>
            <div className="mt-auto pt-2 border-t border-gray-300">
              <p className="text-[9px]">
                Date of ERB Hearing: <span className="inline-block w-16 border-b border-black">&nbsp;</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t-2 border-black">
          <p className="text-[9px] text-center">EO/Interviewer Signature above Printed Name</p>
        </div>
      </CardContent>

        <CardFooter className="justify-end p-2.5">
          <Button size="sm" onClick={handleDownloadImage}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download Receipt
          </Button>
        </CardFooter>
      </Card>
    );
  }

