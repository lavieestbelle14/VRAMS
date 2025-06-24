'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { applicationFormSchema, ApplicationFormValues } from '@/schemas/applicationSchema';
import { submitApplication } from '@/services/applicationService';
import { useFormDraft } from './useFormDraft';
import { useMemo } from 'react';

const DRAFT_STORAGE_KEY = 'vrams_application_draft_v2';
const LAST_SUBMITTED_FINGERPRINT_KEY = 'vrams_last_submitted_fingerprint_v1';

const generateFingerprint = (data: Partial<ApplicationFormValues>): string => {
  const relevantData = [
    data.firstName,
    data.lastName,
    data.dateOfBirth,
    data.applicationType,
  ].map(val => String(val ?? '').toLowerCase().trim()).join('-');
  return relevantData;
};

const initialDefaultValues: ApplicationFormValues = {
  applicationType: undefined,
  registrationType: undefined,
  firstName: '',
  lastName: '',
  middleName: '',
  suffix: '',
  citizenshipType: 'By Birth',
  dateOfNaturalization: '',
  certificateNumber: '',
  professionOccupation: '',
  contactNumber: '',
  emailAddress: '',
  civilStatus: 'Single',
  spouseName: '',
  sex: 'M',
  dateOfBirth: '',
  placeOfBirthMunicipality: '',
  placeOfBirthProvince: '',
  fatherFirstName: '',
  fatherLastName: '',
  motherFirstName: '',
  motherMaidenLastName: '',
  isIlliterate: false,
  isSeniorCitizen: false,
  tribe: '',
  typeOfDisability: '',
  assistanceNeeded: '',
  assistorName: '',
  voteOnGroundFloor: false,
  adultRegistrationConsent: false,
  governmentIdFrontUrl: undefined,
  governmentIdBackUrl: undefined,
  idSelfieUrl: undefined,
  previousPrecinctNumber: '',
  previousBarangay: '',
  previousCityMunicipality: '',
  previousProvince: '',
  previousForeignPost: '',
  previousCountry: '',
  transferType: undefined,
  reasonForDeactivation: undefined,
  targetField: undefined,
  currentValue: '',
  requestedValue: '',
  reinstatementType: undefined,
  houseNumber: '',
  street: '',
  barangay: '',
  cityMunicipality: '',
  province: '',
  yearsOfResidenceMunicipality: 0,
  monthsOfResidenceMunicipality: 0,
  yearsOfResidenceAddress: 0,
  monthsOfResidenceAddress: 0,
  yearsInCountry: 0,
  isPwd: false,
  isIndigenousPerson: false,
  declarationAccepted: false,
  oathAccepted: false,
};

const normalizeFormData = (data: ApplicationFormValues): ApplicationFormValues => {
  const normalizeString = (val: any) => (typeof val === 'string' && val.trim() === '' ? undefined : val);
  const normalizeRequiredNumber = (val: any) => (val === '' || val === undefined || val === null ? 0 : Number(val));
  const normalizeDate = (val: any) => (val && typeof val === 'string' && val.length >= 10 ? val.slice(0, 10) : undefined);

  // Normalize transfer fields based on transfer type
  let normalizedTransferFields = {
    previousPrecinctNumber: normalizeString(data.previousPrecinctNumber),
    previousBarangay: normalizeString(data.previousBarangay),
    previousCityMunicipality: normalizeString(data.previousCityMunicipality),
    previousProvince: normalizeString(data.previousProvince),
    previousForeignPost: normalizeString(data.previousForeignPost),
    previousCountry: normalizeString(data.previousCountry),
  };

  // Clear irrelevant transfer fields based on transfer type
  if (data.transferType) {
    const isWithinCity = data.transferType === 'Within the same City/Municipality/District.';
    const isFromAnotherCity = data.transferType === 'From another City/Municipality/District.';
    const isFromForeign = data.transferType === 'From foreign post to local CEO other than original place of registration.';

    if (isFromForeign) {
      // For foreign transfers, only keep foreign fields
      normalizedTransferFields = {
        ...normalizedTransferFields,
        previousPrecinctNumber: undefined,
        previousBarangay: undefined,
        previousCityMunicipality: undefined,
        previousProvince: undefined,
      };
    } else {
      // For domestic transfers, clear foreign fields
      normalizedTransferFields = {
        ...normalizedTransferFields,
        previousForeignPost: undefined,
        previousCountry: undefined,
      };

      if (isWithinCity) {
        // For within city transfers, clear inter-city fields
        normalizedTransferFields = {
          ...normalizedTransferFields,
          previousCityMunicipality: undefined,
          previousProvince: undefined,
        };
      }
    }
  }

  return {
    ...data,
    firstName: data.firstName?.trim() || '',
    lastName: data.lastName?.trim() || '',
    middleName: normalizeString(data.middleName),
    suffix: normalizeString(data.suffix),
    dateOfNaturalization: normalizeDate(data.dateOfNaturalization),
    certificateNumber: normalizeString(data.certificateNumber),
    professionOccupation: normalizeString(data.professionOccupation),
    contactNumber: normalizeString(data.contactNumber),
    emailAddress: normalizeString(data.emailAddress),
    spouseName: normalizeString(data.spouseName),
    dateOfBirth: data.dateOfBirth, // Already a string 'yyyy-mm-dd'
    placeOfBirthMunicipality: data.placeOfBirthMunicipality?.trim() || '',
    placeOfBirthProvince: data.placeOfBirthProvince?.trim() || '',
    fatherFirstName: data.fatherFirstName?.trim() || '',
    fatherLastName: data.fatherLastName?.trim() || '',
    motherFirstName: data.motherFirstName?.trim() || '',
    motherMaidenLastName: data.motherMaidenLastName?.trim() || '',
    tribe: normalizeString(data.tribe),
    typeOfDisability: normalizeString(data.typeOfDisability),
    assistanceNeeded: normalizeString(data.assistanceNeeded),
    assistorName: normalizeString(data.assistorName),
    ...normalizedTransferFields,
    currentValue: normalizeString(data.currentValue),
    requestedValue: normalizeString(data.requestedValue),
    houseNumber: data.houseNumber?.trim() || '',
    street: data.street?.trim() || '',
    barangay: data.barangay?.trim() || '',
    cityMunicipality: data.cityMunicipality?.trim() || '',
    province: data.province?.trim() || '',
    yearsOfResidenceMunicipality: normalizeRequiredNumber(data.yearsOfResidenceMunicipality),
    monthsOfResidenceMunicipality: normalizeRequiredNumber(data.monthsOfResidenceMunicipality),
    yearsOfResidenceAddress: normalizeRequiredNumber(data.yearsOfResidenceAddress),
    monthsOfResidenceAddress: normalizeRequiredNumber(data.monthsOfResidenceAddress),
    yearsInCountry: normalizeRequiredNumber(data.yearsInCountry),
  };
};

// Remove filterDataByType and instead filter only UI-only fields from the normalized data
const UI_ONLY_FIELDS = ['isPwd', 'isIndigenousPerson', 'declarationAccepted', 'oathAccepted'];

export function useApplicationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  // Set default values, using user.precinct if available
  const defaultValues = useMemo(() => ({
    ...initialDefaultValues,
  }), []);

  // Use the main application schema for all validation
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues,
  });

  const { clearDraft: clearDraftFromHook } = useFormDraft<ApplicationFormValues>({
    form,
    draftKey: DRAFT_STORAGE_KEY,
    fingerprintKey: LAST_SUBMITTED_FINGERPRINT_KEY,
    generateFingerprint,
    toast,
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Application Type:', data.applicationType);
    console.log('Form Data keys:', Object.keys(data));
    
    // Validate required fields before submission
    if (!data.applicationType) {
      toast({
        title: "Validation Error",
        description: "Please select an application type.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return;
    }

    console.log('User attempting submission:', { 
      id: user.id, 
      role: user.role, 
      registrationStatus: user.registrationStatus,
      email: user.email 
    });
    
    // Additional validation for registration applications
    if (data.applicationType === 'register') {
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'registrationType'];
      const missingFields = requiredFields.filter(field => !data[field as keyof ApplicationFormValues]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
    }

    const normalizedData = normalizeFormData(data);
    console.log('Normalized data keys:', Object.keys(normalizedData));

    // Remove only UI-only fields, submit all others (including filled optional fields)
    const submissionData = Object.fromEntries(
      Object.entries(normalizedData).filter(([key]) => !UI_ONLY_FIELDS.includes(key))
    ) as ApplicationFormValues;
    
    try {
      const applicationNumber = await submitApplication(submissionData, user);
      
      if (typeof window !== 'undefined') {
        const fingerprint = generateFingerprint(normalizedData);
        localStorage.setItem(LAST_SUBMITTED_FINGERPRINT_KEY, fingerprint);
      }
      clearDraftFromHook(initialDefaultValues);
      
      // Show success toast with longer duration
      toast({
        title: "Application Submitted!",
        description: `Your application has been submitted successfully. Your application number is ${applicationNumber}.`,
        duration: 3000, // Show for 3 seconds
      });
      
      // Redirect to confirmation page immediately without delay - use replace to prevent back navigation issues
      console.log('Redirecting to:', `/public/application-submitted/${applicationNumber}`);
      router.replace(`/public/application-submitted/${applicationNumber}`);
      
    } catch (error) {
      console.error("Error submitting application:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Submission Failed",
        description: `An error occurred while submitting the application: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const clearDraft = () => {
    clearDraftFromHook(initialDefaultValues);
  };

  return {
    form,
    onSubmit,
    clearDraft,
  };
}
