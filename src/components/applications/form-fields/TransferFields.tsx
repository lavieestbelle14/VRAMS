'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface TransferFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function TransferFields({ control }: TransferFieldsProps) {
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
                      <SelectItem value="From another City/Municipality/District (Accomplish Personal Information at the back).">
                        From another City/Municipality/District (Accomplish Personal Information at the back)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="previousPrecinctNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Precinct Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 001A" {...field} value={field.value ?? ''} />
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
                    <FormLabel>Previous Barangay (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Poblacion" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="previousCityMunicipality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous City/Municipality (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Manila City" {...field} value={field.value ?? ''} />
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
                    <FormLabel>Previous Province (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Metro Manila" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Foreign transfer fields */}
            <div className="border-t pt-4 mt-6">
              <p className="text-sm font-medium mb-4 text-muted-foreground">
                For transfers from foreign posts only:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="previousForeignPost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Foreign Post (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Philippine Embassy Tokyo" {...field} value={field.value ?? ''} />
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
                      <FormLabel>Previous Country (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Japan" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}