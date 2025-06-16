import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface CivilStatusFieldsProps {
  control: Control<ApplicationFormValues>;
  civilStatus?: string;
}

export const CivilStatusFields: React.FC<CivilStatusFieldsProps> = ({ control, civilStatus }) => (
  <>
    <FormField 
      control={control} 
      name="civilStatus" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Civil Status</FormLabel>
          <Select onValueChange={field.onChange} value={field.value ?? ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select civil status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} 
    />
    
    {civilStatus === 'married' && (
      <FormField 
        control={control} 
        name={"spouseName" as any} 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Spouse's Full Name</FormLabel>
            <FormControl>
              <Input placeholder="Maria Clara Dela Cruz" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField 
        control={control} 
        name="fatherFirstName" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Father's First Name</FormLabel>
            <FormControl>
              <Input placeholder="Pedro" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="fatherLastName" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Father's Last Name</FormLabel>
            <FormControl>
              <Input placeholder="Dela Cruz" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField 
        control={control} 
        name="motherFirstName" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mother's First Name</FormLabel>
            <FormControl>
              <Input placeholder="Maria" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="motherLastName" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mother's Maiden Last Name</FormLabel>
            <FormControl>
              <Input placeholder="Santos" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
  </>
);
