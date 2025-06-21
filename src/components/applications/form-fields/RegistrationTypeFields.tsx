import React from 'react';
import { Control } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface RegistrationTypeFieldsProps {
  control: Control<ApplicationFormValues>;
}

export const RegistrationTypeFields: React.FC<RegistrationTypeFieldsProps> = ({ control }) => (
  <div className="space-y-4">
    <FormField
      control={control}
      name="registrationType"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value ?? ''}
              className="space-y-4"
            >
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="Regular" />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-normal leading-tight">
                    I signify and confirm my intention to undergo the process of voter registration
                    <span className="block text-sm font-medium">(18 years old and above)</span>
                  </FormLabel>
                </div>
              </FormItem>

              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="Katipunan ng Kabataan" />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-normal leading-tight">
                    I signify and confirm my intention to undergo the process of voter registration in the Katipunan ng Kabataan
                    <span className="block text-sm font-medium">(15 to 17 years old)</span>
                  </FormLabel>
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
