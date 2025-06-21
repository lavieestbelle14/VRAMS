'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface IdVerificationFieldsProps {
  control: Control<ApplicationFormValues>;
}

export function IdVerificationFields({ control }: IdVerificationFieldsProps) {
  const { toast } = useToast();

  const handleFileChange = (onChange: (file: File) => void, fieldName: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      onChange(file);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Please provide clear photos of your valid government-issued ID and a selfie of yourself holding the ID.
        Each file should not exceed 5MB.
      </p>

      <FormField
        control={control}
        name="governmentIdFrontUrl"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>ID Front Photo</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange(onChange, 'governmentIdFrontUrl')}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Upload a clear photo of the front of your valid ID
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="governmentIdBackUrl"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>ID Back Photo</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange(onChange, 'governmentIdBackUrl')}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Upload a clear photo of the back of your valid ID
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="idSelfieUrl"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>Selfie with ID</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange(onChange, 'idSelfieUrl')}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Upload a selfie of yourself holding your ID (make sure both your face and ID are clearly visible)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
