'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegistrationTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationTypeDialog({ isOpen, onClose }: RegistrationTypeDialogProps) {
  const [selectedType, setSelectedType] = useState<string>();
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedType) return;
    localStorage.setItem('registration_type', selectedType);
    router.push('/public/application-form');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Registration Type</DialogTitle>
          <DialogDescription>
            Please select the appropriate registration type based on your age.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <RadioGroup
            value={selectedType}
            onValueChange={setSelectedType}
            className="gap-6"
          >
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="regular" id="regular" />
              <Label htmlFor="regular" className="font-normal leading-tight">
                I signify and confirm my intention to undergo the process of voter registration
                <span className="block text-sm text-muted-foreground">(18 years old and above)</span>
              </Label>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="katipunan" id="katipunan" />
              <Label htmlFor="katipunan" className="font-normal leading-tight">
                I signify and confirm my intention to undergo the process of voter registration in the Katipunan ng Kabataan
                <span className="block text-sm text-muted-foreground">(15 to 17 years old)</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleContinue} disabled={!selectedType}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}