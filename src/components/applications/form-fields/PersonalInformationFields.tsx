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
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface PersonalInformationFieldsProps {
  control: Control<ApplicationFormValues>;
  citizenshipType?: string;
  civilStatus?: string;
  isIndigenousPerson?: boolean;
  isPwd?: boolean;
  assistorName?: string;
}

export const PersonalInformationFields: React.FC<PersonalInformationFieldsProps> = ({
  control,
  citizenshipType,
  civilStatus,
  isIndigenousPerson,
  isPwd,
  assistorName,
}) => {
  return (
    <div className="space-y-8">
      {/* From PersonalInfoFields.tsx */}
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
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
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

      {/* From CitizenshipFields.tsx */}
      <div>
        <h3 className="text-lg font-semibold mt-2 mb-3 border-t pt-6">Citizenship</h3>
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
                  <SelectItem value="By Birth">By Birth</SelectItem>
                  <SelectItem value="Naturalized">Naturalized</SelectItem>
                  <SelectItem value="Reacquired">Reacquired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {(citizenshipType === 'Naturalized' || citizenshipType === 'Reacquired') && (
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
                        selected={field.value ? new Date(field.value) : undefined}
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
      </div>

      {/* From ProfessionFields.tsx (TIN field removed) */}
      <div>
        <h3 className="text-lg font-semibold mt-2 mb-3 border-t pt-6">Profession / Occupation</h3>
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
      </div>

      {/* From CivilStatusFields.tsx */}
      <div>
        <h3 className="text-lg font-semibold mt-2 mb-3 border-t pt-6">Civil Status & Parents</h3>
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
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                  <SelectItem value="Legally Separated">Legally Separated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {civilStatus === 'Married' && (
          <FormField
            control={control}
            name={"spouseName" as any}
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Spouse's Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Maria Clara Dela Cruz" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
      </div>

      {/* From SpecialNeedsFields.tsx */}
      <div>
        <h3 className="text-lg font-semibold mt-2 mb-3 border-t pt-6">Special Needs / Assistance</h3>
        <p className="text-sm text-muted-foreground mb-4">Information for voters with special needs.</p>
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
              <FormItem className="mt-4">
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
              <FormItem className="mt-4">
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
            <FormItem className="mt-4">
              <FormLabel>Assistor's Full Name (If any)</FormLabel>
              <FormControl>
                <Input placeholder="Full name of assistor" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add the assistanceNeeded field below assistorName */}
        <FormField
          control={control}
          name={"assistanceNeeded" as any}
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Type of Assistance Needed</FormLabel>
              <FormControl>
                <Input placeholder="e.g., visual, communication" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
