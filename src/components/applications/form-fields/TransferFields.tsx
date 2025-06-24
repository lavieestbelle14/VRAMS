'use client';
import { Control, useWatch, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface TransferFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function TransferFields({ control }: TransferFieldsProps) {
  const { setValue, clearErrors, trigger } = useFormContext<ApplicationFormValues>();
  const transferType = useWatch({
    control,
    name: 'transferType'
  });

  const isWithinCity = transferType === 'Within the same City/Municipality/District.';
  const isFromAnotherCity = transferType === 'From another City/Municipality/District.';
  const isFromForeign = transferType === 'From foreign post to local CEO other than original place of registration.';

  // Clear irrelevant fields and errors when transfer type changes
  useEffect(() => {
    if (!transferType) return;

    console.log('Transfer type changed to:', transferType);
    console.log('Clearing fields for type:', { isWithinCity, isFromAnotherCity, isFromForeign });

    // Clear field values first
    if (isFromForeign) {
      // Clear domestic fields for foreign transfers
      setValue('previousPrecinctNumber', undefined);
      setValue('previousBarangay', undefined);
      setValue('previousCityMunicipality', undefined);
      setValue('previousProvince', undefined);
      console.log('Cleared domestic fields for foreign transfer');
    } else {
      // Clear foreign fields for domestic transfers
      setValue('previousForeignPost', undefined);
      setValue('previousCountry', undefined);
      console.log('Cleared foreign fields for domestic transfer');

      if (isWithinCity) {
        // Clear inter-city fields for within city transfers
        setValue('previousCityMunicipality', undefined);
        setValue('previousProvince', undefined);
        console.log('Cleared inter-city fields for within city transfer');
      }
    }

    // Clear all transfer-related errors and trigger re-validation
    setTimeout(() => {
      clearErrors([
        'previousPrecinctNumber', 
        'previousBarangay', 
        'previousCityMunicipality', 
        'previousProvince',
        'previousForeignPost',
        'previousCountry'
      ]);
      
      // Trigger re-validation of transfer fields after clearing
      trigger([
        'previousPrecinctNumber', 
        'previousBarangay', 
        'previousCityMunicipality', 
        'previousProvince',
        'previousForeignPost',
        'previousCountry'
      ]);
    }, 0);
  }, [transferType, isWithinCity, isFromAnotherCity, isFromForeign, setValue, clearErrors, trigger]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Provide details of your previous voter registration for transfer purposes.
          </p>
          
          <div className="space-y-4">
            <FormField
              control={control}
              name="transferType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transfer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Within the same City/Municipality/District.">
                        Within the same City/Municipality/District
                      </SelectItem>
                      <SelectItem value="From another City/Municipality/District.">
                        From another City/Municipality/District
                      </SelectItem>
                      <SelectItem value="From foreign post to local CEO other than original place of registration.">
                        From foreign post to local CEO other than original place of registration
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show required fields based on transfer type */}
            {transferType && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Required fields for this transfer type:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {isWithinCity && (
                    <>
                      <li>• Previous Precinct Number</li>
                      <li>• Previous Barangay</li>
                    </>
                  )}
                  {isFromAnotherCity && (
                    <>
                      <li>• Previous Precinct Number</li>
                      <li>• Previous Barangay</li>
                      <li>• Previous City/Municipality</li>
                    </>
                  )}
                  {isFromForeign && (
                    <>
                      <li>• Previous Foreign Post</li>
                      <li>• Previous Country</li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* Domestic transfer fields - only show when not foreign transfer */}
            {transferType && !isFromForeign && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="previousPrecinctNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Previous Precinct Number
                        {(isWithinCity || isFromAnotherCity) && <span className="text-red-500 ml-1">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 001A" 
                          {...field} 
                          value={field.value ?? ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="previousBarangay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Previous Barangay
                        {(isWithinCity || isFromAnotherCity) && <span className="text-red-500 ml-1">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Poblacion" 
                          {...field} 
                          value={field.value ?? ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Additional domestic fields - only show for inter-city transfers */}
            {isFromAnotherCity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="previousCityMunicipality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Previous City/Municipality
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Manila City" 
                          {...field} 
                          value={field.value ?? ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="previousProvince"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Province</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Metro Manila" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Foreign transfer fields - only show for foreign transfers */}
            {isFromForeign && (
              <div className="border-t pt-4 mt-6">
                <p className="text-sm font-medium mb-4 text-muted-foreground">
                  For transfers from foreign posts:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="previousForeignPost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Previous Foreign Post
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Philippine Embassy Tokyo" 
                            {...field} 
                            value={field.value ?? ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name="previousCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Previous Country
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Japan" 
                            {...field} 
                            value={field.value ?? ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}