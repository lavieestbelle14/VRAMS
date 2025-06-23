'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface InclusionReinstatementFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function InclusionReinstatementFields({ control }: InclusionReinstatementFieldsProps) {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select Application Type</h3>
      
      <FormField
        control={control}
        name="reinstatementType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className="space-y-3">
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Reinstatement of records due to transfer from foreign post to same local City/Municipality/District." />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Reinstatement of records due to transfer from foreign post to same local City/Municipality/District.
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Inclusion of VRR in the precinct book of voters." />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Inclusion of VRR in the precinct book of voters.
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Reinstatement of the name of the registered voter which has been omitted in the list of voters." />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Reinstatement of the name of the registered voter which has been omitted in the list of voters.
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          I do hereby request that my name which has been omitted in the list of voters/my registration record which has not been included in the precinct book of voters of Precinct No.
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">
            I do hereby request that my name which has been omitted in the list of voters/my registration record which has not been included in the precinct book of voters of Precinct No.{' '}
            <strong className="bg-blue-50 px-2 py-1 rounded border">
              {user?.precinct || 'Not Available'}
            </strong>
            , be reinstated/included therein.
          </span>
        </div>
        
        {!user?.precinct && (
          <p className="text-sm text-red-600">
            <strong>Note:</strong> You must be a registered voter to submit a reinstatement application. Your precinct information is not available.
          </p>
        )}
        
        <p className="text-sm">
          The said reinstatement of name/inclusion of registration record is necessary and valid.
        </p>
      </div>
    </div>
  );
}
