import React from 'react';
import { Control } from 'react-hook-form';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface PersonalInfoFieldsProps {
  control: Control<ApplicationFormValues>;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ control }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField 
        control={control} 
        name="lastName" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input placeholder="Dela Cruz" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="firstName" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input placeholder="Juan" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name={"middleName" as any} 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Middle Name (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Santos" {...field} value={typeof field.value === 'string' ? field.value : ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="sex"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sex</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="dob"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date of Birth</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(new Date(field.value), "MMMM d, yyyy")
                      : <span>Pick a date</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) =>
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField 
        control={control} 
        name="placeOfBirthCityMun" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Place of Birth (City/Municipality)</FormLabel>
            <FormControl>
              <Input placeholder="Manila" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      <FormField 
        control={control} 
        name="placeOfBirthProvince" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Place of Birth (Province)</FormLabel>
            <FormControl>
              <Input placeholder="Metro Manila" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
    
    <FormField 
      control={control} 
      name={"contactNumber" as any} 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact No. (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="09123456789" {...field} value={typeof field.value === 'string' ? field.value : ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} 
    />
    
    <FormField 
      control={control} 
      name={"email" as any} 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email (Optional)</FormLabel>
          <FormControl>
            <Input type="email" placeholder="juan.delacruz@example.com" {...field} value={typeof field.value === 'string' ? field.value : ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} 
    />
  </>
);
