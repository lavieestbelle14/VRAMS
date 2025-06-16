import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { DeclarationFields } from './DeclarationFields';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ApplicationTypeFieldsProps {
  control: Control<ApplicationFormValues>;
  form: UseFormReturn<ApplicationFormValues>;
  registrationIntention?: string;
  isRegistered: boolean;
}

export const ApplicationTypeFields: React.FC<ApplicationTypeFieldsProps> = ({ 
  control, 
  form, 
  registrationIntention, 
  isRegistered 
}) => {
  const applicationType = form.watch('applicationType');
  
  return (
    <>
      {!registrationIntention && (
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Please select a Registration Intention above before choosing an Application Type
          </p>
        </div>
      )}
      
      <FormField
        control={control}
        name="applicationType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Type of Application</FormLabel>
            
            {!isRegistered && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Note: You must complete voter registration first before you can apply for other types of applications.
                </p>
              </div>
            )}

            <FormControl>
              <RadioGroup 
                onValueChange={field.onChange} 
                value={field.value ?? ''} 
                className="flex flex-col space-y-2"
                disabled={!registrationIntention}
              >
                {/* Registration */}
                <FormItem className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="register" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Registration
                    </FormLabel>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Accomplish Personal Information at the Voter Registration Application Form part)
                    </span>
                  </div>
                </FormItem>

                {/* Transfer */}
                <FormItem className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="transfer" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Transfer of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>

                  {field.value === 'transfer' && (
                    <div className="ml-8 space-y-4">
                      <Card className="mb-4">
                        <CardContent className="pt-6">
                          <div className="space-y-4 text-sm">
                            <DeclarationFields prefix="transfer_" control={control} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <p className="font-medium mb-4">APPLICATION FOR TRANSFER OF REGISTRATION RECORD</p>        
                          <FormField
                            control={control}
                            name={"transferType" as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup 
                                    onValueChange={field.onChange} 
                                    value={field.value ?? ''} 
                                    className="space-y-2"
                                  >
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <RadioGroupItem value="transfer-within" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Within the same City/Municipality/District
                                      </FormLabel>
                                    </FormItem>

                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <RadioGroupItem value="transfer-from" />
                                      </FormControl>
                                      <div className="flex items-center">
                                        <FormLabel className="font-normal">
                                          From another City/Municipality/District
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <RadioGroupItem value="transfer-foreign-post" />
                                      </FormControl>
                                      <div className="flex items-center">
                                        <FormLabel className="font-normal">
                                          From Foreign Post to Local OEO other than original place of registration
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                      
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="font-medium mb-4">My New Residence is:</p>
                            <FormField name={"transferNewHouseNo" as any} control={control}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm">House No./Street</div>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <FormField name={"transferNewBarangay" as any} control={control}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="text-sm">Barangay</div>
                                    <FormControl>
                                      <Input {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField name={"transferNewCity" as any} control={control}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="text-sm">City/Municipality</div>
                                    <FormControl>
                                      <Input {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField name={"transferNewProvince" as any} control={control}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="text-sm">Province</div>
                                    <FormControl>
                                      <Input {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="space-y-4 text-sm mt-4">
                              <div className="flex items-baseline gap-2">
                                <span>I have resided in my new residence for</span>
                                <FormField
                                  control={control}
                                  name={"transferReactivationYears" as any}
                                  render={({ field }) => (
                                    <FormItem className="w-20">
                                      <FormControl>
                                        <Input 
                                          type="number"
                                          min="0"
                                          className="text-center h-7"
                                          {...field}
                                          value={field.value ?? ''}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <span>years and</span>
                                <FormField
                                  control={control}
                                  name={"transferReactivationMonths" as any}
                                  render={({ field }) => (
                                    <FormItem className="w-20">
                                      <FormControl>
                                        <Input 
                                          type="number"
                                          min="0"
                                          max="11"
                                          className="text-center h-7"
                                          {...field}
                                          value={field.value ?? ''}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <span>months.</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </FormItem>

                {/* Other application types can be added here in similar fashion */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="reactivation" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Reactivation of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="transfer-reactivation" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Transfer with Reactivation
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="change-correction" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Change of Name/Correction of Entries
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                  
                  {field.value === 'change-correction' && (
                    <div className="ml-8 space-y-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-4">
                            (Attach required supporting documents such as Certified Copy or Certificate of Court Order or Certificate of Live Birth, and others)
                          </p>
                          
                          <div className="space-y-4">
                            <FormField
                              control={control}
                              name="correctionField"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Field to Correct</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a field to correct" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Name">Name</SelectItem>
                                      <SelectItem value="Contact Number">Contact Number</SelectItem>
                                      <SelectItem value="Email Address">Email Address</SelectItem>
                                      <SelectItem value="Spouse name">Spouse name</SelectItem>
                                      <SelectItem value="Date of Birth">Date of Birth</SelectItem>
                                      <SelectItem value="Place of Birth">Place of Birth</SelectItem>
                                      <SelectItem value="Father's Name">Father's Name</SelectItem>
                                      <SelectItem value="Mother's Maiden Name">Mother's Maiden Name</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField name="presentData" control={control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Present Data/Information:</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={typeof field.value === 'boolean' ? '' : field.value ?? ''} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField name="newData" control={control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New/Corrected Data/Information:</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={typeof field.value === 'boolean' || typeof field.value === 'undefined' ? '' : field.value} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </FormItem>

                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="inclusion-reinstatement" 
                        disabled={!registrationIntention || !isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      (!registrationIntention || !isRegistered) && "text-muted-foreground"
                    )}>
                      Application for Inclusion/Reinstatement
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
