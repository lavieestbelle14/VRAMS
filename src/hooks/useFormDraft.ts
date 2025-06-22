import { useEffect, useState } from 'react';

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
  const [isDraftLoaded, setDraftLoaded] = useState(true); // Set to true to skip draft loading

  // Remove auto-save functionality - no longer saving to localStorage
  useEffect(() => {
    setDraftLoaded(true);
  }, []);

  // Clear draft utility - now just resets the form without localStorage
  const clearDraft = (resetValues: Partial<T>) => {
    form.reset(resetValues);
    toast?.({ title: "Form Cleared", description: "The application form has been reset." });
  };

  return { clearDraft };
}
