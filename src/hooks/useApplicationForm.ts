'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { applicationFormSchema, ApplicationFormValues } from '@/schemas/applicationSchema';
import { submitApplication } from '@/services/applicationService';
import { useFormDraft } from './useFormDraft';
import { useEffect, useMemo } from 'react';
import { z, ZodType, ZodObject } from 'zod';

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

// Utility: Map applicationType to required fields
const applicationTypeFieldMap: Record<string, string[]> = {
  register: [
    'firstName', 'lastName', 'citizenshipType', 'dateOfBirth', 'sex', 'placeOfBirthMunicipality', 'placeOfBirthProvince',
    'fatherFirstName', 'fatherLastName', 'motherFirstName', 'motherMaidenLastName', 'civilStatus', 'houseNumber', 'street', 'barangay', 'cityMunicipality', 'province',
    'yearsOfResidenceMunicipality', 'monthsOfResidenceMunicipality', 'yearsOfResidenceAddress', 'monthsOfResidenceAddress', 'yearsInCountry',
    'governmentIdFrontUrl', 'governmentIdBackUrl', 'idSelfieUrl', 'registrationType', 'declarationAccepted',
    // Add all other required fields for registration
  ],
  transfer: [
    'applicationType', 'previousPrecinctNumber', 'previousBarangay', 'previousCityMunicipality', 'previousProvince',
    'houseNumber', 'street', 'barangay', 'cityMunicipality', 'province', 
    'yearsOfResidenceMunicipality', 'monthsOfResidenceMunicipality', 'yearsOfResidenceAddress', 'monthsOfResidenceAddress', 'yearsInCountry',
    'transferType', 'declarationAccepted',
  ],
  reactivation: [
    'applicationType', 'reasonForDeactivation', 'declarationAccepted',
  ],
  transfer_with_reactivation: [
    'applicationType', 'previousPrecinctNumber', 'previousBarangay', 'previousCityMunicipality', 'previousProvince',
    'houseNumber', 'street', 'barangay', 'cityMunicipality', 'province',
    'yearsOfResidenceMunicipality', 'monthsOfResidenceMunicipality', 'yearsOfResidenceAddress', 'monthsOfResidenceAddress', 'yearsInCountry',
    'transferType', 'reasonForDeactivation', 'declarationAccepted',
  ],
  correction_of_entry: [
    'applicationType', 'targetField', 'currentValue', 'requestedValue', 'declarationAccepted',
  ],
  reinstatement: [
    'applicationType', 'reinstatementType', 'declarationAccepted',
  ],
};

// Utility: Get dynamic schema for current applicationType
function getDynamicSchema(applicationType: string | undefined, registrationType: string | undefined): ZodType<any> {
  if (!applicationType) return applicationFormSchema;
  let fields = applicationTypeFieldMap[applicationType] || [];
  // RegistrationType-specific logic (example: add fields for Katipunan)
  if (applicationType === 'register' && registrationType === 'Katipunan ng Kabataan') {
    fields = [...fields, 'oathAccepted'];
  }
  // Always include applicationType and declarationAccepted
  if (!fields.includes('applicationType')) fields.push('applicationType');
  if (!fields.includes('declarationAccepted')) fields.push('declarationAccepted');
  // Fix: Use .innerType() to get the ZodObject
  const baseObject = (applicationFormSchema as any).innerType ? (applicationFormSchema as any).innerType() : applicationFormSchema;
  const shape = baseObject.shape;
  const picked: any = {};
  for (const key of fields) {
    if (shape[key]) picked[key] = shape[key];
  }
  return z.object(picked);
}

const normalizeFormData = (data: ApplicationFormValues): ApplicationFormValues => {
  const normalizeString = (val: any) => (typeof val === 'string' && val.trim() === '' ? undefined : val);
  const normalizeRequiredNumber = (val: any) => (val === '' || val === undefined || val === null ? 0 : Number(val));
  const normalizeDate = (val: any) => (val && typeof val === 'string' && val.length >= 10 ? val.slice(0, 10) : undefined);

  return {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    middleName: normalizeString(data.middleName),
    suffix: normalizeString(data.suffix),
    dateOfNaturalization: normalizeDate(data.dateOfNaturalization),
    certificateNumber: normalizeString(data.certificateNumber),
    professionOccupation: normalizeString(data.professionOccupation),
    contactNumber: normalizeString(data.contactNumber),
    emailAddress: normalizeString(data.emailAddress),
    spouseName: normalizeString(data.spouseName),
    dateOfBirth: data.dateOfBirth, // Already a string 'yyyy-mm-dd'
    placeOfBirthMunicipality: data.placeOfBirthMunicipality.trim(),
    placeOfBirthProvince: data.placeOfBirthProvince.trim(),
    fatherFirstName: data.fatherFirstName.trim(),
    fatherLastName: data.fatherLastName.trim(),
    motherFirstName: data.motherFirstName.trim(),
    motherMaidenLastName: data.motherMaidenLastName.trim(),
    tribe: normalizeString(data.tribe),
    typeOfDisability: normalizeString(data.typeOfDisability),
    assistanceNeeded: normalizeString(data.assistanceNeeded),
    assistorName: normalizeString(data.assistorName),
    previousPrecinctNumber: normalizeString(data.previousPrecinctNumber),
    previousBarangay: normalizeString(data.previousBarangay),
    previousCityMunicipality: normalizeString(data.previousCityMunicipality),
    previousProvince: normalizeString(data.previousProvince),
    previousForeignPost: normalizeString(data.previousForeignPost),
    previousCountry: normalizeString(data.previousCountry),
    currentValue: normalizeString(data.currentValue),
    requestedValue: normalizeString(data.requestedValue),
    houseNumber: data.houseNumber.trim(),
    street: data.street.trim(),
    barangay: data.barangay.trim(),
    cityMunicipality: data.cityMunicipality.trim(),
    province: data.province.trim(),
    yearsOfResidenceMunicipality: normalizeRequiredNumber(data.yearsOfResidenceMunicipality),
    monthsOfResidenceMunicipality: normalizeRequiredNumber(data.monthsOfResidenceMunicipality),
    yearsOfResidenceAddress: normalizeRequiredNumber(data.yearsOfResidenceAddress),
    monthsOfResidenceAddress: normalizeRequiredNumber(data.monthsOfResidenceAddress),
    yearsInCountry: normalizeRequiredNumber(data.yearsInCountry),
  };
};

// Filter data to only include relevant fields
function filterDataByType(data: ApplicationFormValues): Partial<ApplicationFormValues> {
  const fields = applicationTypeFieldMap[data.applicationType || ''] || [];
  // RegistrationType-specific logic
  if (data.applicationType === 'register' && data.registrationType === 'Katipunan ng Kabataan') {
    fields.push('oathAccepted');
  }
  // Always include applicationType and declarationAccepted
  if (!fields.includes('applicationType')) fields.push('applicationType');
  if (!fields.includes('declarationAccepted')) fields.push('declarationAccepted');
  // Remove UI-only fields from payload
  const uiOnlyFields = ['isPwd', 'isIndigenousPerson', 'declarationAccepted', 'oathAccepted'];
  const filtered: any = {};
  const dataObj = data as Record<string, any>;
  for (const key of fields) {
    if (key in dataObj && !uiOnlyFields.includes(key)) filtered[key] = dataObj[key];
  }
  return filtered;
}

export function useApplicationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  // Use a dummy form first, then swap resolver dynamically
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: initialDefaultValues,
  });

  // Dynamically update resolver when applicationType/registrationType changes
  const applicationType = form.watch('applicationType');
  const registrationType = form.watch('registrationType');
  const dynamicSchema = useMemo(() => getDynamicSchema(applicationType, registrationType), [applicationType, registrationType]);

  useEffect(() => {
    form.reset(form.getValues(), { keepValues: true });
    // @ts-ignore
    form.resolver = zodResolver(dynamicSchema);
    // eslint-disable-next-line
  }, [dynamicSchema]);

  const { clearDraft: clearDraftFromHook } = useFormDraft<ApplicationFormValues>({
    form,
    draftKey: DRAFT_STORAGE_KEY,
    fingerprintKey: LAST_SUBMITTED_FINGERPRINT_KEY,
    generateFingerprint,
    toast,
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return;
    }
    const normalizedData = normalizeFormData(data);
    const filteredData = filterDataByType(normalizedData);
    try {
      const applicationNumber = await submitApplication(filteredData as ApplicationFormValues, user);
      toast({
        title: "Application Submitted!",
        description: `Your application has been submitted successfully. Your application number is ${applicationNumber}.`,
      });
      if (typeof window !== 'undefined') {
        const fingerprint = generateFingerprint(normalizedData);
        localStorage.setItem(LAST_SUBMITTED_FINGERPRINT_KEY, fingerprint);
      }
      clearDraftFromHook(initialDefaultValues);
      router.push(`/public/application-submitted/${applicationNumber}`);
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
