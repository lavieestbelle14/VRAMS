import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface AddressFieldsProps {
  control: Control<ApplicationFormValues>;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ control }) => (
  <>
    <FormField 
      control={control} 
      name="houseNoStreet" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>House No. / Street / Subdivision</FormLabel>
          <FormControl>
            <Input placeholder="123 Rizal St, Pleasant Village" {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} 
    />
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField 
        control={control} 
        name="barangay" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Barangay</FormLabel>
            <FormControl>
              <Input placeholder="Pembo" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="cityMunicipality" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>City / Municipality</FormLabel>
            <FormControl>
              <Input placeholder="Makati City" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="province" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Province</FormLabel>
            <FormControl>
              <Input placeholder="Metro Manila" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField 
        control={control} 
        name="zipCode" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zip Code</FormLabel>
            <FormControl>
              <Input placeholder="1218" {...field} value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="yearsOfResidency" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years at Current Address</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="5" 
                {...field} 
                value={typeof field.value === 'number' ? field.value : ''} 
                onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="monthsOfResidency" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Months at Current Address</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="3" 
                min="0" 
                max="11" 
                {...field} 
                value={typeof field.value === 'number' ? field.value : ''} 
                onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
  </>
);
