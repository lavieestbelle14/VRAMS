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
  isRegistered: boolean;
}

export const ApplicationTypeFields: React.FC<ApplicationTypeFieldsProps> = ({ 
  control, 
  form, 
  isRegistered 
}) => {
  return (
    <div className="space-y-4">
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
                onValueChange={field.onChange} 
                value={field.value ?? ''} 
                className="flex flex-col space-y-2"
              >
                {/* Registration */}
                <FormItem className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem value="register" />
                    </FormControl>
                    <FormLabel className="font-normal">
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
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Transfer of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Reactivation */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="reactivation" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Reactivation of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Transfer with Reactivation */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="transfer_with_reactivation" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Transfer with Reactivation
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Change of Name/Correction of Entries */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="correction_of_entry" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Change of Name/Correction of Entries
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Inclusion/Reinstatement */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="reinstatement" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
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
        