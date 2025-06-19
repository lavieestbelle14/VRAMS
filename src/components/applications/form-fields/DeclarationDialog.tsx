'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeclarationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function DeclarationDialog({ open, onOpenChange, onAccept }: DeclarationDialogProps) {
  const [isConfirmButtonDisabled, setConfirmButtonDisabled] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      setConfirmButtonDisabled(true);
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setConfirmButtonDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Declaration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            I hereby declare, under penalty of law, that all information provided in this online application form is true, complete, and accurate to the best of my knowledge and belief. I understand that any false or misleading statement may lead to the rejection of my application and/or legal consequences, including but not limited to those under the Revised Penal Code and other relevant laws.
          </p>
          <p>
            I understand and agree to the processing of my personal data for the purpose of this application, in accordance with the Data Privacy Act of 2012 and the Commission on Elections (COMELEC) Data Privacy Policy. I have read and understood the terms and conditions outlined in this application.
          </p>
          <p>
            Upon successful submission, your application will be reviewed by COMELEC personnel. You will be notified regarding the status of your application through the contact information you provided.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onAccept();
              onOpenChange(false);
            }}
            disabled={isConfirmButtonDisabled}
          >
            {isConfirmButtonDisabled ? `Please read the declaration (${countdown})` : "I understand and agree"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
