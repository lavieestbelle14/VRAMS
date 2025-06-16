'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface RegularOathFieldsProps {
  control: Control<ApplicationFormValues>;
  shouldDisableOath: boolean;
}

export function RegularOathFields({ control, shouldDisableOath }: RegularOathFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <FormField
          control={control}
          name="regularRegistrationType"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'registration'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'registration' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">REGISTRATION</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="regularRegistrationType"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'transfer'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'transfer' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">TRANSFER</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-4">
          I do solemnly swear that the above statements regarding my person are true and correct; that I possess all the qualifications and none of the disqualifications of a voter; and that I am:
        </p>

        <div className="space-y-2 ml-6 mb-4">
          <FormField
            control={control}
            name="regularVoterStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === 'not_registered'}
                    onCheckedChange={(checked) => 
                      field.onChange(checked ? 'not_registered' : undefined)
                    }
                  />
                </FormControl>
                <FormLabel className="font-normal">not registered in any precinct;</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="regularVoterStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === 'registered_elsewhere'}
                    onCheckedChange={(checked) => 
                      field.onChange(checked ? 'registered_elsewhere' : undefined)
                    }
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  registered in a precinct of another City/Municipality/District in the Philippines
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <p className="text-muted-foreground leading-relaxed">
          and that I have reviewed the entries encoded in the VRS and I confirm that the same are correct, accurate and consistent with the information I supplied in this application form. Further, by affixing my signature below, I authorize and give my consent to the Commission on Elections and the concerned Election Registration Board to collect and process the personal data I supplied herein for purposes of voter registration and elections, and for other purposes and allowable disclosures under B.P. Blg. 881, R.A. No. 8189, 10173 and 10367, and the relevant Resolutions of the Commission on Elections.
        </p>
      </div>

      <div className="flex items-start space-x-3 mt-4">
        <FormField
          control={control}
          name="regularOathAccepted"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  required={!shouldDisableOath}
                  aria-required={!shouldDisableOath}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-base font-semibold">
                  I understand and agree to the oath stated above {!shouldDisableOath && '*'}
                </FormLabel>
                <FormDescription>
                  By checking this box, I confirm that I have read, understood, and agree to the oath.
                  I understand that providing false information may result in legal consequences.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
