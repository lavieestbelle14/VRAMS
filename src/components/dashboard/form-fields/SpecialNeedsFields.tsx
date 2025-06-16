import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface SpecialNeedsFieldsProps {
  control: Control<ApplicationFormValues>;
  isIndigenousPerson?: boolean;
  isPwd?: boolean;
  assistorName?: string;
}

export const SpecialNeedsFields: React.FC<SpecialNeedsFieldsProps> = ({ 
  control, 
  isIndigenousPerson, 
  isPwd, 
  assistorName 
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
      <FormField 
        control={control} 
        name="isIlliterate" 
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="font-normal">Illiterate</FormLabel>
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="isPwd" 
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="font-normal">Person with Disability (PWD)</FormLabel>
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="isIndigenousPerson" 
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="font-normal">Indigenous Person</FormLabel>
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="isSenior" 
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="font-normal">Senior Citizen</FormLabel>
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="prefersGroundFloor" 
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="font-normal">Prefers Ground Floor Voting</FormLabel>
          </FormItem>
        )} 
      />
    </div>

    {isIndigenousPerson && (
      <FormField
        control={control}
        name={"indigenousTribe" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tribe Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Aeta, Ati, Badjao" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}

    {isPwd && (
      <FormField
        control={control}
        name={"disabilityType" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Disability</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Visual Impairment, Mobility" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}
    
    <FormField
      control={control}
      name={"assistorName" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assistor's Full Name (If any)</FormLabel>
          <FormControl>
            <Input placeholder="Full name of assistor" {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    {assistorName && (
      <FormField
        control={control}
        name={"assistorRelationship" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assistor's Relationship</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Spouse, Child, Guardian" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}
  </>
);
