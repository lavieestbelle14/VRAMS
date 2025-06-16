'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DeclarationFields } from './DeclarationFields';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface TransferFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function TransferFields({ control }: TransferFieldsProps) {
  return (
    <div className="space-y-4">
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
  );
}
