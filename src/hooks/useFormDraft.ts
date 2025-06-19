import { useEffect, useState } from 'react';
import { format } from 'date-fns';

type UseFormDraftOptions<T> = {
  form: any; // react-hook-form's useForm return value
  draftKey: string;
  fingerprintKey: string;
  generateFingerprint: (data: Partial<T>) => string;
  toast?: (opts: { title: string; description?: string }) => void;
};

export function useFormDraft<T>({
  form,
  draftKey,
  fingerprintKey,
  generateFingerprint,
  toast,
}: UseFormDraftOptions<T>) {
  const [isDraftLoaded, setDraftLoaded] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const subscription = form.watch((values: T) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(draftKey, JSON.stringify(values));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || isDraftLoaded) return;
    const savedDraftString = localStorage.getItem(draftKey);
    const lastSubmittedFingerprint = localStorage.getItem(fingerprintKey);

    if (savedDraftString) {
      try {
        const draftValues = JSON.parse(savedDraftString);
        const draftFingerprint = generateFingerprint(draftValues);

        if (lastSubmittedFingerprint && draftFingerprint === lastSubmittedFingerprint) {
          localStorage.removeItem(draftKey);
          localStorage.removeItem(fingerprintKey);
          form.reset();
          toast?.({ title: "Form Cleared", description: "Previously submitted application draft has been cleared." });
        } else {
          // Patch date fields to yyyy-MM-dd if present
          if (draftValues.dob && typeof draftValues.dob === 'string') {
            draftValues.dob = format(new Date(draftValues.dob), "yyyy-MM-dd");
          }
          if (draftValues.naturalizationDate && typeof draftValues.naturalizationDate === 'string') {
            draftValues.naturalizationDate = format(new Date(draftValues.naturalizationDate), "yyyy-MM-dd");
          }
          if (draftValues.transferDeclarantBirthDate && typeof draftValues.transferDeclarantBirthDate === 'string') {
            draftValues.transferDeclarantBirthDate = format(new Date(draftValues.transferDeclarantBirthDate), "yyyy-MM-dd");
          }
          form.reset(draftValues);
          toast?.({ title: "Draft Loaded", description: "Your previous application draft has been loaded." });
        }
      } catch {
        localStorage.removeItem(draftKey);
        localStorage.removeItem(fingerprintKey);
      }
    }
    setDraftLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.reset, draftKey, fingerprintKey, generateFingerprint, toast, isDraftLoaded]);

  // Clear draft utility
  const clearDraft = (resetValues: Partial<T>) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(draftKey);
      localStorage.removeItem(fingerprintKey);
    }
    form.reset(resetValues);
    toast?.({ title: "Draft Cleared", description: "The application form has been reset." });
  };

  return { clearDraft };
}
