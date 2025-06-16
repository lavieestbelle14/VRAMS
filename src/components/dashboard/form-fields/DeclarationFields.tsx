import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface DeclarationFieldsProps {
  prefix?: string;
  control: Control<ApplicationFormValues>;
}

export const DeclarationFields: React.FC<DeclarationFieldsProps> = ({ prefix = "", control }) => (
  <div className="space-y-4 text-sm">
    <p className="text-sm text-muted-foreground mb-4">Note: (For Applicants with existing Registration Records)</p>

    <div className="flex items-baseline gap-2">
      <span>I,</span>
      <FormField
        control={control}
        name={`${prefix}declarantName` as any}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, Filipino, born on</span>
      <FormField
        control={control}
        name={`${prefix}declarantBirthDate` as any}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" type="date" value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, a duly registered</span>
    </div>
    
    <div className="flex items-baseline gap-2">
      <span>voter in Precinct No.</span>
      <FormField
        control={control}
        name={`${prefix}declarantPrecinct` as any}
        render={({ field }) => (
          <FormItem className="w-24">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>of Barangay</span>
      <FormField
        control={control}
        name={`${prefix}declarantBarangay` as any}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, City/Municipality of</span>
      <FormField
        control={control}
        name={`${prefix}declarantCity` as any}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>,</span>
    </div>
    
    <div className="flex items-baseline gap-2">
      <span>Province of</span>
      <FormField
        control={control}
        name={`${prefix}declarantProvince` as any}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, do HEREBY APPLY FOR:</span>
    </div>
  </div>
);
