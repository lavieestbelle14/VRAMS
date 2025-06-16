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
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          I do solemnly swear that the above statements regarding my person are true and correct; that I possess all the qualifications and none of the disqualifications of a voter of Katipunan ng Kabataan; and that I have reviewed the entries encoded in the VRS and I confirm that the same are correct, accurate and consistent with the information I supplied in this application form. Moreover, by affixing my signature below, I authorize and give my consent to the Commission on Elections and the concerned Election Registration Board to collect and process the personal data I supplied herein for purposes of voter's registration and elections, and for other purposes and allowable disclosures under B.P. Blg. 881, R.A. No. 8189, 10173 and 10367, and 10742 and the relevant resolutions of the Commission on Elections. Furthermore, I understand that when I reach eighteen (18) years of age, the personal data I supplied herein will be further processed by the Commission on Elections, and upon approval by the Election Registration Board, will be included in and consolidated with the database of voters who are at least eighteen (18) years of age for purposes of subsequent elections and for other lawful purposes and allowable disclosures mentioned above, and that when I reach thirty one (31) years of age, my personal data in the Katipunan ng Kabataan database will be deleted accordingly.
        </p>
      </div>

      <div className="flex items-start space-x-3 mt-4">        <FormField
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
