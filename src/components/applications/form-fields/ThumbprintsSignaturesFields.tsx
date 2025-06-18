'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ThumbprintsSignaturesFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function ThumbprintsSignaturesFields({ control }: ThumbprintsSignaturesFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg mb-4">
        <p className="text-sm text-muted-foreground">
          Note: Your thumbprints and specimen signatures will be captured in person at the COMELEC office. 
          The boxes below are for illustration purposes only.
        </p>
      </div>
      <div className="space-y-4">      
        <div className="flex gap-8 items-start">
          {/* Left side: Thumbprints */}
          <div className="flex-1 grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="border-2 border-dashed border-muted-foreground/25 w-32 h-32 rounded-md flex items-center justify-center mx-auto">
                <span className="text-sm text-muted-foreground">Left Thumb</span>
              </div>
              <p className="text-sm text-center">Left Thumb</p>
            </div>

            <div className="space-y-2">
              <div className="border-2 border-dashed border-muted-foreground/25 w-32 h-32 rounded-md flex items-center justify-center mx-auto">
                <span className="text-sm text-muted-foreground">Right Thumb</span>
              </div>
              <p className="text-sm text-center">Right Thumb</p>
            </div>
          </div>

          {/* Right side: Signatures */}
          <div className="flex-1">
            <p className="text-sm font-medium mb-4">Specimen Signatures:</p>
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-4 mb-6">
                <span className="text-sm w-6">{num}</span>
                <div className="flex-1 border-b-2 border-dashed border-muted-foreground/25 h-8" />
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={control}
          name="biometricsFile"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  type="hidden" 
                  {...field} 
                  value="For on-site capture" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
