import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface AddressResidencyFieldsProps {
  control: Control<ApplicationFormValues>;
}

export const AddressResidencyFields: React.FC<AddressResidencyFieldsProps> = ({ control }) => (
  <>
    {/* === Start of original AddressFields.tsx content === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField 
        control={control} 
        name="houseNumber" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>House Number</FormLabel>
            <FormControl>
              <Input placeholder="123" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="street" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street / Subdivision</FormLabel>
            <FormControl>
              <Input placeholder="Rizal St, Pleasant Village" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    
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
        name="yearsOfResidenceAddress" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years at Current Address</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="5" 
                min="0"
                {...field} 
                value={field.value?.toString() ?? ''} 
                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="monthsOfResidenceAddress" 
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
                value={field.value?.toString() ?? ''} 
                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    {/* === End of original AddressFields.tsx content === */}

    {/* === Start of structure from ApplicationFormFields.tsx and ResidencyFields.tsx content === */}
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Period of Residence (General)</h3>
      <p className="text-sm text-muted-foreground mb-4">How long you've lived in your current city/municipality and in the Philippines.</p>

      {/* Content from ResidencyFields.tsx */}
      <Label className="text-sm font-medium block mb-2">In the City/Municipality</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          control={control} 
          name="yearsOfResidenceMunicipality" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. of Years</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="10" 
                  min="0"
                  {...field} 
                  value={field.value?.toString() ?? ''} 
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={control} 
          name="monthsOfResidenceMunicipality" 
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
                  value={field.value?.toString() ?? ''} 
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
      </div>
      
      <FormField 
        control={control} 
        name="yearsInCountry" 
        render={({ field }) => (
          <FormItem className="mt-4">
            <FormLabel>In the Philippines (No. of Years)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="25" 
                min="0"
                {...field} 
                value={field.value?.toString() ?? ''} 
                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    {/* === End of ResidencyFields.tsx content === */}
  </>
);