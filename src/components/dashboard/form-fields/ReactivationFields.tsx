'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ReactivationFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function ReactivationFields({ control }: ReactivationFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Reason for Deactivation</h3>
      
      <FormField
        control={control}
        name={"reactivationReason" as any}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className="space-y-3">
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sentenced" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm leading-relaxed">
                    1. Sentenced by final judgment to suffer imprisonment for not less than one (1) year;
                  </FormLabel>
                </FormItem>

                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="convicted" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm leading-relaxed">
                    2. Convicted by final judgment of a crime involving disloyalty to the duly constituted government, etc.;
                  </FormLabel>
                </FormItem>

                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="declared-insane" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm leading-relaxed">
                    3. Declared by competent authority to be insane or incompetent;
                  </FormLabel>
                </FormItem>

                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="failed-to-vote" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm leading-relaxed">
                    4. Failed to vote in two (2) successive preceding regular elections;
                  </FormLabel>
                </FormItem>

                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="loss-citizenship" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm leading-relaxed">
                    5. Loss of Filipino citizenship; or
                  </FormLabel>
                </FormItem>

                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="exclusion" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm leading-relaxed">
                    6. Exclusion by a court order;
                  </FormLabel>
                </FormItem>

                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="failure-validate" />
                  </FormControl>
                  <FormLabel className="font-normal text-sm leading-relaxed">
                    7. Failure to Validate.
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <p className="text-sm text-muted-foreground mt-4">
        That said ground no longer exists, as evidenced by the attached certification/order of the court (in cases of 1,2,3,5, and 6).
      </p>
    </div>
  );
}
