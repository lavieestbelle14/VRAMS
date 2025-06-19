'use client';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface KatipunanOathFieldsProps {
  control: Control<ApplicationFormValues>;
  shouldDisableOath: boolean;
}

export function KatipunanOathFields({ control, shouldDisableOath }: KatipunanOathFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-4">
          I do solemnly swear that the above statements regarding my person are true and correct; that I possess all the qualifications and none of the disqualifications of a voter of Katipunan ng Kabataan; that I am <b>not registered in any precinct</b> and that I have reviewed the entries encoded in the VRS and I confirm that the same are correct, accurate and consistent with the information I supplied in this application form. Moreover, I authorize and give my consent to the Commission on Elections and the concerned Election Registration Board to collect and process the personal data I supplied herein for purposes of voter's registration and elections, and for other purposes and allowable disclosures under B.P. Blg. 881, R.A. No. 8189, 10173 and 10367, and 10742 and the relevant resolutions of the Commission on Elections. Furthermore, I understand that when I reach eighteen (18) years of age, the personal data I supplied herein will be further processed by the Commission on Elections, and upon approval by the Election Registration Board, will be included in and consolidated with the database of voters who are at least eighteen (18) years of age for purposes of subsequent elections and for other lawful purposes and allowable disclosures mentioned above, to which further processing and its purposes I
        </p>

        <div className="flex flex-col gap-4 mt-2 mb-2">
          <FormField
            control={control}
            name="adultRegistrationConsent"
            render={({ field }) => (
              <div className="flex gap-8">
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={(checked) => {
                        if (checked) field.onChange(true);
                        else field.onChange(undefined);
                      }}
                      disabled={shouldDisableOath}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">give my consent</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value === false}
                      onCheckedChange={(checked) => {
                        if (checked) field.onChange(false);
                        else field.onChange(undefined);
                      }}
                      disabled={shouldDisableOath}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">do not give my consent</FormLabel>
                </FormItem>
              </div>
            )}
          />
        </div>

        <p className="text-muted-foreground leading-relaxed mt-4">
          and that when I reach thirty one (31) years of age, my personal data in the Katipunan ng Kabataan database will be deleted accordingly.
        </p>
      </div>

      <div className="flex items-start space-x-3 mt-6">
        <FormField
          control={control}
          name="oathAccepted"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  required={!shouldDisableOath}
                  aria-required={!shouldDisableOath}
                  disabled={shouldDisableOath}
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
