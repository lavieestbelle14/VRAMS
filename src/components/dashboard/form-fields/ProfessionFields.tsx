import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ProfessionFieldsProps {
  control: Control<ApplicationFormValues>;
}

export const ProfessionFields: React.FC<ProfessionFieldsProps> = ({ control }) => (
  <>
    <FormField 
      control={control} 
      name={"professionOccupation" as any} 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Profession / Occupation (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="Engineer" {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} 
    />
    <FormField 
      control={control} 
      name={"tin" as any} 
      render={({ field }) => (
        <FormItem>
          <FormLabel>TIN (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="123-456-789-000" {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} 
    />
  </>
);
