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

interface CitizenshipFieldsProps {
  control: Control<ApplicationFormValues>;
  citizenshipType?: string;
}

export const CitizenshipFields: React.FC<CitizenshipFieldsProps> = ({ control, citizenshipType }) => (
  <>
    <FormField 
      control={control} 
      name="citizenshipType" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Citizenship Basis</FormLabel>
          <Select onValueChange={field.onChange} value={field.value ?? ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select citizenship basis" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="byBirth">By Birth</SelectItem>
              <SelectItem value="naturalized">Naturalized</SelectItem>
              <SelectItem value="reacquired">Reacquired</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} 
    />
    
    {(citizenshipType === 'naturalized' || citizenshipType === 'reacquired') && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField 
          control={control} 
          name="naturalizationDate" 
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Naturalization/Reacquisition</FormLabel>
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
                      {field.value ? format(new Date(field.value), "MMMM d, yyyy") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={field.value ? new Date(field.value): undefined} 
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')} 
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
        <FormField 
          control={control} 
          name="naturalizationCertNo" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate No./Order of Approval</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
      </div>
    )}
  </>
);
