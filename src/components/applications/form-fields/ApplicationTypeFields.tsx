import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingApplications } from '@/hooks/usePendingApplications';
import { AlertCircle } from 'lucide-react';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ApplicationTypeFieldsProps {
  control: Control<ApplicationFormValues>;
  form: UseFormReturn<ApplicationFormValues>;
  isRegistered: boolean;
}

export const ApplicationTypeFields: React.FC<ApplicationTypeFieldsProps> = ({ 
  control, 
  form, 
  isRegistered 
}) => {
  const { user } = useAuth();
  const { pendingApplications, hasPendingApplications, isLoading } = usePendingApplications();

  // Show loading state while checking for pending applications
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <p className="text-gray-600">Checking application status...</p>
        </div>
      </div>
    );
  }

  // Users with any pending applications should not be able to submit new ones
  if (hasPendingApplications) {
    const pendingList = pendingApplications.map(app => ({
      id: app.public_facing_id,
      type: app.application_type,
      date: new Date(app.application_date).toLocaleDateString(),
      status: app.status
    }));

    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pending Application(s) Found</h3>
            <p className="text-yellow-700 mb-3">
              You have {pendingApplications.length} pending application{pendingApplications.length > 1 ? 's' : ''}. 
              Please wait for approval before submitting new applications.
            </p>
            
            <div className="space-y-2 mb-3">
              {pendingList.map((app, index) => (
                <div key={app.id} className="bg-yellow-100 p-3 rounded border border-yellow-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-yellow-800">
                        {app.id} - {app.type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-yellow-600">
                        Submitted: {app.date} | Status: {app.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-yellow-600">
              You can track your application status in the "Track Application Status" section.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="applicationType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Type of Application</FormLabel>
            
            {!isRegistered && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Note: You must complete voter registration first before you can apply for other types of applications.
                </p>
              </div>
            )}

            <FormControl>
              <RadioGroup 
                onValueChange={field.onChange} 
                value={field.value ?? ''} 
                className="flex flex-col space-y-2"
              >
                {/* Registration - Disable if user already has approved registration */}
                <FormItem className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="register" 
                        disabled={isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal",
                      isRegistered && "text-muted-foreground"
                    )}>
                      Application for Registration
                    </FormLabel>
                    {isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(You are already registered)</span>
                    )}
                  </div>
                </FormItem>

                {/* Transfer */}
                <FormItem className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="transfer" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Transfer of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Reactivation */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="reactivation" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Reactivation of Registration Record
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Transfer with Reactivation */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="transfer_with_reactivation" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Transfer with Reactivation
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Change of Name/Correction of Entries */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="correction_of_entry" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Change of Name/Correction of Entries
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>

                {/* Inclusion/Reinstatement */}
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem 
                        value="reinstatement" 
                        disabled={!isRegistered}
                      />
                    </FormControl>
                    <FormLabel className={cn(
                      "font-normal", 
                      !isRegistered && "text-muted-foreground"
                    )}>
                      Application for Inclusion/Reinstatement
                    </FormLabel>
                    {!isRegistered && (
                      <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                    )}
                  </div>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
