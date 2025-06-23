'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import { Button } from '@/components/ui/button';
import { Trash2, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { DeclarationDialog } from './form-fields/DeclarationDialog';
import { ApplicationFormSections } from './ApplicationFormSections';
import { useApplicationForm } from '@/hooks/useApplicationForm';
import { useAuth } from '@/contexts/AuthContext';

export function ApplicationFormFields() {
  const { form, onSubmit, clearDraft } = useApplicationForm();
  const [isDeclarationDialogOpen, setDeclarationDialogOpen] = useState(false);

  const declarationAccepted = form.watch('declarationAccepted');
  const applicationType = form.watch('applicationType');
  const registrationType = form.watch('registrationType');
  const civilStatus = form.watch('civilStatus');
  const citizenshipType = form.watch('citizenshipType');
  const assistorName = form.watch('assistorName');
  const isIndigenousPerson = form.watch('isIndigenousPerson');
  const isPwd = form.watch('isPwd');
  // Derive isRegistered from actual user registration status
  const { user } = useAuth();
  const isRegistered = user?.registrationStatus === 'approved';
  const shouldDisableSection = applicationType !== 'register';
  const shouldDisableOath = applicationType !== 'register';

  const handleAcceptDeclaration = () => {
    form.setValue("declarationAccepted", true, { shouldValidate: true });
  };

  const handleClearDraft = () => {
    clearDraft();
  };

  const handleFormSubmit = async (data: any) => {
    try {
      console.log('Form submit triggered');
      await onSubmit(data);
    } catch (error) {
      // Handle any submission errors
      console.error('Form submission error:', error);
    }
  };

  const handleFormEvent = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form event prevented');
    form.handleSubmit(handleFormSubmit, handleFormError)(e);
  };

  const handleFormError = (errors: any) => {
    // Handle validation errors - scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      setTimeout(() => {
        // Try multiple selectors to find the form field
        let firstErrorElement = 
          document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement ||
          document.querySelector(`input[name="${firstErrorField}"]`) as HTMLElement ||
          document.querySelector(`select[name="${firstErrorField}"]`) as HTMLElement ||
          document.querySelector(`textarea[name="${firstErrorField}"]`) as HTMLElement ||
          document.querySelector(`button[name="${firstErrorField}"]`) as HTMLElement ||
          // For React Hook Form fields, try finding by data attribute or aria-label
          document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement ||
          // Try finding the FormItem container and then any focusable element within it
          document.querySelector(`[data-testid="${firstErrorField}"]`) as HTMLElement;
        
        // If we still can't find it, try looking for the FormMessage with the error
        if (!firstErrorElement) {
          const errorMessages = Array.from(document.querySelectorAll('[data-testid="form-message"]'));
          for (const errorMsg of errorMessages) {
            if (errorMsg.textContent && errorMsg.textContent.includes(errors[firstErrorField]?.message)) {
              firstErrorElement = errorMsg.closest('[data-testid="form-item"]')?.querySelector('button, input, select, textarea') as HTMLElement;
              break;
            }
          }
        }
        
        // Last resort: find any element that might be related to the field name
        if (!firstErrorElement) {
          const allElements = Array.from(document.querySelectorAll('button, input, select, textarea'));
          firstErrorElement = allElements.find(el => {
            const element = el as HTMLElement;
            return element.getAttribute('aria-describedby')?.includes(firstErrorField) ||
                   element.id?.includes(firstErrorField) ||
                   element.closest('[data-field]')?.getAttribute('data-field') === firstErrorField;
          }) as HTMLElement;
        }
        
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ 
            behavior: 'auto', 
            block: 'center' 
          });
          firstErrorElement.focus();
        } else {
          // If we can't find the specific field, jump to the top of the form
          const formElement = document.querySelector('form');
          if (formElement) {
            formElement.scrollIntoView({ 
              behavior: 'auto', 
              block: 'start' 
            });
          }
        }
      }, 100); // Small delay to ensure DOM is updated
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormEvent} action="#" className="space-y-8">
        <ApplicationFormSections
          form={form}
          isRegistered={isRegistered}
          shouldDisableSection={shouldDisableSection}
          shouldDisableOath={shouldDisableOath}
          registrationType={registrationType ?? ''}
          citizenshipType={citizenshipType}
          civilStatus={civilStatus}
          assistorName={assistorName}
          isIndigenousPerson={isIndigenousPerson}
          isPwd={isPwd}
        />
        {/* Declaration Section */}
        {applicationType && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="declarationAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setDeclarationDialogOpen(true);
                        } else {
                          field.onChange(false);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the above declaration and affirm the truthfulness of all information provided.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
        <DeclarationDialog 
          open={isDeclarationDialogOpen} 
          onOpenChange={setDeclarationDialogOpen} 
          onAccept={handleAcceptDeclaration} 
        />
        {applicationType && (
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" onClick={handleClearDraft} className="btn-outline">
              <Trash2 className="mr-2 h-4 w-4" /> Clear Draft & Reset
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting || !declarationAccepted}>
              {form.formState.isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <Save className="mr-2 h-4 w-4" /> }
              Submit Application
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}