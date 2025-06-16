import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ResidencyFieldsProps {
  control: Control<ApplicationFormValues>;
}

export const ResidencyFields: React.FC<ResidencyFieldsProps> = ({ control }) => (
  <>
    <Label className="text-sm font-medium">In the City/Municipality</Label>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField 
        control={control} 
        name="residencyYearsCityMun" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>No. of Years</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="10" 
                {...field} 
                value={field.value ?? ''} 
                onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="residencyMonthsCityMun" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>No. of Months</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="6" 
                min="0" 
                max="11" 
                {...field} 
                value={field.value ?? ''} 
                onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    
    <FormField 
      control={control} 
      name="residencyYearsPhilippines" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>In the Philippines (No. of Years)</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              placeholder="25" 
              {...field} 
              value={field.value ?? ''} 
              onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} 
    />
  </>
);
