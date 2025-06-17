'use client';
import { Control, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface TransferFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function TransferFields({ control }: TransferFieldsProps) {
  const transferType = useWatch({
    control,
    name: "transferType",
  });

  return (
    <div className="space-y-6">
      <div>
        <FormField
          control={control}
          name="transferType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Select Transfer Type:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  className="space-y-2 pt-2"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="transfer-within" id="transfer-within" />
                    </FormControl>
                    <FormLabel htmlFor="transfer-within" className="font-normal">
                      Within the same City/Municipality/District.
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="transfer-from" id="transfer-from" />
                    </FormControl>
                    <FormLabel htmlFor="transfer-from" className="font-normal">
                      From another City/Municipality/District.
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="transfer-foreign-post" id="transfer-foreign-post" />
                    </FormControl>
                    <FormLabel htmlFor="transfer-foreign-post" className="font-normal">
                      From foreign post to local OEO other than original place of registration.
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {transferType && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm">
              <p className="text-sm text-muted-foreground mb-4">Note: (For Applicants with existing Registration Records)</p>
              
              <div className="flex items-baseline gap-2 flex-wrap">
                <span>I,</span>
                <FormField
                  control={control}
                  name="transferDeclarantName"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[150px]">
                      <FormControl>
                        <Input {...field} placeholder="Full Name" className="h-8" value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span>, Filipino, born on</span>
                <FormField
                  control={control}
                  name="transferDeclarantBirthDate"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[120px]">
                      <FormControl>
                        {/* Consider using a date picker component here for better UX */}
                        <Input type="date" {...field} className="h-8" value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span>, a duly registered voter</span>
                {(transferType === "transfer-within" || transferType === "transfer-from") && <span>in:</span>}
              </div>

              {(transferType === "transfer-within" || transferType === "transfer-from") && (
                <>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span>Precinct No.</span>
                    <FormField
                      control={control}
                      name="previousPrecinctNumber"
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormControl>
                            <Input {...field} placeholder="Precinct No." className="h-8" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span>, Barangay</span>
                    <FormField
                      control={control}
                      name="previousBarangay"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[150px]">
                          <FormControl>
                            <Input {...field} placeholder="Barangay" className="h-8" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span>City/Municipality of</span>
                    <FormField
                      control={control}
                      name="previousCityMunicipality"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[150px]">
                          <FormControl>
                            <Input {...field} placeholder="City/Municipality" className="h-8" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span>, Province of</span>
                    <FormField
                      control={control}
                      name="previousProvince"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[150px]">
                          <FormControl>
                            <Input {...field} placeholder="Province" className="h-8" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />.
                  </div>
                </>
              )}

              {transferType === "transfer-foreign-post" && (
                <>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span>in: foreign post located in</span>
                    <FormField
                      control={control}
                      name="previousForeignPost"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[150px]">
                          <FormControl>
                            <Input {...field} placeholder="Foreign Post Location" className="h-8" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span>, Country of</span>
                    <FormField
                      control={control}
                      name="previousCountry"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[150px]">
                          <FormControl>
                            <Input {...field} placeholder="Country" className="h-8" value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />.
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* The section for New Residence Information for Transfer has been removed from this component. */}
      {/* It will be handled by AddressResidencyFields.tsx in ApplicationFormFields.tsx when applicationType is 'transfer'. */}
    </div>
  );
}