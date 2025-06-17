import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ApplicationTypeFieldsProps {
  control: Control<ApplicationFormValues>;
  form: UseFormReturn<ApplicationFormValues>;
  registrationIntention?: string;
  isRegistered: boolean;
}

export const ApplicationTypeFields: React.FC<ApplicationTypeFieldsProps> = ({ 
  control, 
  form, 
  registrationIntention, 
  isRegistered 
}) => {
  const applicationType = form.watch('applicationType');
  const transferType = form.watch('transferType');

  // Determine the display value for the radio group
  const getDisplayValue = () => {
    if (applicationType === 'transfer' && transferType === 'transfer-reactivation') {
      return 'transfer-reactivation';
    }
    return applicationType ?? '';
  };

  const handleApplicationTypeChange = (value: string) => {
    if (value === 'transfer-reactivation') {
      // Set applicationType to 'transfer' and transferType to 'transfer-reactivation'
      form.setValue('applicationType', 'transfer');
      form.setValue('transferType', 'transfer-reactivation');
    } else if (value === 'transfer') {
      // Set applicationType to 'transfer' and transferType to 'transfer-record'
      form.setValue('applicationType', 'transfer');
      form.setValue('transferType', 'transfer-record');
    } else {
      // For other types, just set the applicationType
      form.setValue('applicationType', value as any);
      // Clear transferType if not transfer-related
      form.setValue('transferType', undefined);
    }
  };
    return (
    <div className="space-y-4">
      {!registrationIntention && (
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Please select a Registration Intention above before choosing an Application Type
          </p>
        </div>
      )}
      
      <FormField
        control={control}
        name="applicationType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Type of Application</FormLabel>
            
            {!isRegistered && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Note: You must complete voter registration first before you can apply for other types of applications.
                </p>
              </div>
            )}

            <FormControl>
              <RadioGroup 
                onValueChange={handleApplicationTypeChange} 
                value={getDisplayValue()} 
                className="flex flex-col space-y-2"
                disabled={!registrationIntention}
              >
                {/* Registration */}
                <FormItem className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="register" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Registration
                    </FormLabel>
                  </div>
                </FormItem>

                {/* Transfer */}
                <FormItem className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="transfer" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Transfer of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Other application types can be added here in similar fashion */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="reactivation" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Reactivation of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="transfer-reactivation" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Transfer with Reactivation
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="change-correction" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Change of Name/Correction of Entries
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="inclusion-reinstatement" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Inclusion/Reinstatement
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
