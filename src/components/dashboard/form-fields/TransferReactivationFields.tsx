'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface TransferReactivationFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function TransferReactivationFields({ control }: TransferReactivationFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Existing Voter Declaration */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Note: (For Applicants with existing Registration Records)</p>
        
        <div className="flex items-baseline gap-2 text-sm">
          <span>I,</span>
          <FormField
            control={control}
            name={"declarantName" as any}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} className="h-8" placeholder="Full Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span>, Filipino, born on</span>
          <FormField
            control={control}
            name={"declarantBirthDate" as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="date" className="h-8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span>, a duly registered</span>
        </div>

        <div className="flex items-baseline gap-2 text-sm">
          <span>voter in Precinct No.</span>
          <FormField
            control={control}
            name={"declarantPrecinctNo" as any}
            render={({ field }) => (
              <FormItem className="w-24">
                <FormControl>
                  <Input {...field} className="h-8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span>of Barangay</span>
          <FormField
            control={control}
            name={"declarantBarangay" as any}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} className="h-8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span>, City/Municipality of</span>
        </div>

        <div className="flex items-baseline gap-2 text-sm">
          <FormField
            control={control}
            name={"declarantCity" as any}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} className="h-8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span>, Province of</span>
          <FormField
            control={control}
            name={"declarantProvince" as any}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} className="h-8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span>, do HEREBY APPLY FOR:</span>
        </div>
      </div>

      {/* Application for Transfer of Record */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">APPLICATION FOR TRANSFER OF RECORD</h3>
        
        <FormField
          control={control}
          name={"transferType" as any}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className="space-y-3">
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="same-city" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Within the same City/Municipality/District
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="different-city" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      From another City/Municipality/District
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="foreign-post" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      From Foreign Post to Local CEO other than original place of registration
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* New Residence */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">My New Residence is:</h3>
        
        <FormField
          control={control}
          name={"transferNewHouseNo" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>House No./Street</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name={"transferNewBarangay" as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barangay</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={"transferNewCity" as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City/Municipality</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={"transferNewProvince" as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">I have resided in my new residence for</span>
          <FormField
            control={control}
            name={"transferYears" as any}
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <Input {...field} type="number" className="h-8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className="text-sm">years and</span>
          <FormField
            control={control}
            name={"transferMonths" as any}
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <Input {...field} type="number" className="h-8" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className="text-sm">months.</span>
        </div>
      </div>

      {/* Reactivation Request */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Further, I do hereby apply for the reactivation of my registration record which was deactivated due to:
        </h3>
        <p className="text-sm text-muted-foreground">(please check appropriate box):</p>
        
        <FormField
          control={control}
          name={"transferReactivationReason" as any}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className="space-y-3">
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sentenced" />
                    </FormControl>
                    <FormLabel className="font-normal text-sm leading-relaxed">
                      1. Sentence by final judgment to suffer imprisonment for not less than one (1) year;
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="convicted" />
                    </FormControl>
                    <FormLabel className="font-normal text-sm leading-relaxed">
                      2. Conviction by final judgment of any crime involving disloyalty to the duly constituted government, etc.;
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="declared-insane" />
                    </FormControl>
                    <FormLabel className="font-normal text-sm leading-relaxed">
                      3. Declaration of insanity or incompetence by a competent authority;
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="failed-to-vote" />
                    </FormControl>
                    <FormLabel className="font-normal text-sm leading-relaxed">
                      4. Failure to vote in two (2) successive preceding regular elections;
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="loss-citizenship" />
                    </FormControl>
                    <FormLabel className="font-normal text-sm leading-relaxed">
                      5. Loss of Filipino Citizenship;
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="exclusion" />
                    </FormControl>
                    <FormLabel className="font-normal text-sm leading-relaxed">
                      6. Exclusion by a court order;
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="failure-validate" />
                    </FormControl>
                    <FormLabel className="font-normal text-sm leading-relaxed">
                      7. Failure to Validate.
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <p className="text-sm text-muted-foreground">
          That said ground no longer exists, as evidenced by the attached certification/order of the court (in cases of 1,2,3,5, and 6).
        </p>
      </div>
    </div>
  );
}
