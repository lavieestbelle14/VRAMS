
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
import type { Application, PersonalInfo, AddressDetails, CivilDetails, SpecialNeeds } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, Trash2, CalendarIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { saveApplication } from '@/lib/applicationStore';
import { format } from "date-fns";
import { z } from 'zod';

// Import all form field components
import {
  DisableableSection,
  RegistrationIntentionFields,
  PersonalInfoFields,
  ApplicationTypeFields,
  CitizenshipFields,
  AddressFields,
  SpecialNeedsFields,
  CivilStatusFields,
  ResidencyFields,
  ProfessionFields,
  FormSection,
  IdVerificationFields,
  ThumbprintsSignaturesFields,
  ReactivationFields,
  TransferReactivationFields,
  InclusionReinstatementFields
} from './form-fields';

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;


const DRAFT_STORAGE_KEY = 'vrams_application_draft_v2';
const LAST_SUBMITTED_FINGERPRINT_KEY = 'vrams_last_submitted_fingerprint_v1';

// Helper function to generate a fingerprint for form data
const generateFingerprint = (data: Partial<ApplicationFormValues>): string => {
  const relevantData = [
    data.firstName,
    data.lastName,
    data.dob,
    data.applicationType,
  ].map(val => String(val ?? '').toLowerCase().trim()).join('-');
  return relevantData;
};

export function ApplicationFormFields() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ApplicationFormValues, any, ApplicationFormValues>({
    resolver: zodResolver<ApplicationFormValues>(applicationFormSchema),
    defaultValues: {
        registrationIntention: undefined,

      // Personal Info
      firstName: '', lastName: '', middleName: '',
      sex: '', dob: '', placeOfBirthCityMun: '', placeOfBirthProvince: '',
      citizenshipType: '', naturalizationDate: undefined, naturalizationCertNo: '', 
      contactNumber: '', email: '',
      residencyYearsCityMun: undefined, residencyMonthsCityMun: undefined, residencyYearsPhilippines: undefined,
      professionOccupation: '', tin: '',

      // Address Details (Current)
      houseNoStreet: '', barangay: '', cityMunicipality: '', province: '', zipCode: '',
      yearsOfResidency: undefined, monthsOfResidency: undefined,

      // Civil Details
      civilStatus: '', spouseName: '',
      fatherFirstName: '', fatherLastName: '', motherFirstName: '', motherLastName: '',
        // Special Needs
      isIlliterate: false, isPwd: false, isIndigenousPerson: false, indigenousTribe: '', disabilityType: '',
      assistorName: '', assistorRelationship: '', assistorAddress: '',
      prefersGroundFloor: false, isSenior: false,

      // Application
      applicationType: undefined,
      biometricsFile: 'For on-site capture', 

      declarationAccepted: false,      // Conditional fields
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '',
      transferType: undefined,
      transferLocationType: undefined,
      correctionField: undefined,
      presentData: '',
      newData: '',      // Part 2: Oath
      oathAccepted: false,
    },
  });

  const declarationAccepted = form.watch('declarationAccepted');
  const isIndigenousPerson = form.watch('isIndigenousPerson');

  const [isDeclarationDialogOpen, setDeclarationDialogOpen] = useState(false);
  const [isConfirmButtonDisabled, setConfirmButtonDisabled] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDeclarationDialogOpen) {
      setConfirmButtonDisabled(true);
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setConfirmButtonDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isDeclarationDialogOpen]);
  // Add inside the ApplicationFormFields component, after form is declared
  // (Removed duplicate shouldDisableSection declaration)

  // Auto-save draft to localStorage
  useEffect(() => {
    interface DraftValues {
      [key: string]: unknown;
    }

    interface WatchCallback {
      (values: DraftValues, info?: unknown): void;
    }

    const subscription: { unsubscribe: () => void } = form.watch((values: DraftValues) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraftString = localStorage.getItem(DRAFT_STORAGE_KEY);
      const lastSubmittedFingerprint = localStorage.getItem(LAST_SUBMITTED_FINGERPRINT_KEY);

      if (savedDraftString) {
        try {
          const draftValues = JSON.parse(savedDraftString);
          const draftFingerprint = generateFingerprint(draftValues);

          if (lastSubmittedFingerprint && draftFingerprint === lastSubmittedFingerprint) {
            // This draft matches the last successfully submitted form, so clear it.
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            localStorage.removeItem(LAST_SUBMITTED_FINGERPRINT_KEY);
            form.reset(); // Reset to initial default empty values
            toast({ title: "Form Cleared", description: "Previously submitted application draft has been cleared." });
          } else {
            // Load the draft as it's different or no submission fingerprint exists
            if (draftValues.dob && typeof draftValues.dob === 'string') {
               draftValues.dob = format(new Date(draftValues.dob), "yyyy-MM-dd");
            }
            if (draftValues.naturalizationDate && typeof draftValues.naturalizationDate === 'string') {
               draftValues.naturalizationDate = format(new Date(draftValues.naturalizationDate), "yyyy-MM-dd");
            }
            form.reset(draftValues);
            toast({ title: "Draft Loaded", description: "Your previous application draft has been loaded." });
          }
        } catch (error) {
          console.error("Failed to parse draft:", error);
          localStorage.removeItem(DRAFT_STORAGE_KEY); // Clear corrupted draft
          localStorage.removeItem(LAST_SUBMITTED_FINGERPRINT_KEY); // Also clear fingerprint if draft was corrupt
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.reset]); // form.reset is stable

  const handleClearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(LAST_SUBMITTED_FINGERPRINT_KEY); // Also clear the fingerprint
    }    form.reset({ // Reset to initial default values
      firstName: '', lastName: '', middleName: '',
      sex: '', dob: '', placeOfBirthCityMun: '', placeOfBirthProvince: '',
      citizenshipType: '', naturalizationDate: undefined, naturalizationCertNo: '', 
      contactNumber: '', email: '',
      residencyYearsCityMun: undefined, residencyMonthsCityMun: undefined, residencyYearsPhilippines: undefined,
      professionOccupation: '', tin: '',
      houseNoStreet: '', barangay: '', cityMunicipality: '', province: '', zipCode: '',
      yearsOfResidency: undefined, monthsOfResidency: undefined,
      civilStatus: '', spouseName: '',
      fatherFirstName: '', fatherLastName: '', motherFirstName: '', motherLastName: '',
      isIlliterate: false, isPwd: false, isIndigenousPerson: false, indigenousTribe: '', disabilityType: '',
      assistorName: '', assistorRelationship: '', assistorAddress: '',
      prefersGroundFloor: false, isSenior: false,
      applicationType: undefined,
      biometricsFile: 'For on-site capture', 
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '',
      correctionField: undefined,
      presentData: '',
      newData: '',
    });
    toast({ title: "Draft Cleared", description: "The application form has been reset." });
  };


const applicationType = form.watch('applicationType');
const transferType = form.watch('transferType');
const registrationIntention = form.watch('registrationIntention');
const civilStatus = form.watch('civilStatus');
const isPwd = form.watch('isPwd');
const citizenshipType = form.watch('citizenshipType');
const assistorName = form.watch('assistorName');
const showDeclarationFields = applicationType === 'transfer';
const isRegistered = true; // TODO: Replace with actual registration status check

// This will disable all personal information sections unless applicationType is 'register'
const shouldDisableSection = applicationType !== 'register';

// Keep the oath section disabled logic separate
// Update this line in your component
const shouldDisableOath = !(applicationType === 'register' || applicationType === 'transfer');

const onSubmit: import("react-hook-form").SubmitHandler<ApplicationFormValues> = async (data) => {
    try {
      const personalInfo: PersonalInfo = {
        firstName: data.firstName, lastName: data.lastName, middleName: data.middleName,
        sex: data.sex, dob: data.dob,
        placeOfBirthCityMun: data.placeOfBirthCityMun, placeOfBirthProvince: data.placeOfBirthProvince,
        citizenshipType: data.citizenshipType, 
        naturalizationDate: data.naturalizationDate, naturalizationCertNo: data.naturalizationCertNo,
        contactNumber: data.contactNumber, email: data.email,
        residencyYearsCityMun: data.residencyYearsCityMun, residencyMonthsCityMun: data.residencyMonthsCityMun,
        residencyYearsPhilippines: data.residencyYearsPhilippines,
        professionOccupation: data.professionOccupation, tin: data.tin,
      };
      const addressDetails: AddressDetails = {
        houseNoStreet: data.houseNoStreet, barangay: data.barangay, cityMunicipality: data.cityMunicipality,
        province: data.province, zipCode: data.zipCode,
        yearsOfResidency: data.yearsOfResidency, monthsOfResidency: data.monthsOfResidency,
      };
      const civilDetails: CivilDetails = {
        civilStatus: data.civilStatus, spouseName: data.spouseName,
        fatherFirstName: data.fatherFirstName, fatherLastName: data.fatherLastName,
        motherFirstName: data.motherFirstName, motherLastName: data.motherLastName,
      };
      const specialNeeds: SpecialNeeds = {
        isIlliterate: data.isIlliterate, isPwd: data.isPwd, isIndigenousPerson: data.isIndigenousPerson,
        disabilityType: data.disabilityType,
        assistorName: data.assistorName, assistorRelationship: data.assistorRelationship,
        prefersGroundFloor: data.prefersGroundFloor, isSenior: data.isSenior,
      };

      const newApplication: Application = {
        id: `APP-${Date.now().toString().slice(-6)}`,
        personalInfo,
        addressDetails,
        civilDetails,
        specialNeeds,
        applicationType: data.applicationType,
        biometricsFile: data.biometricsFile,
        status: 'pending',
        submissionDate: new Date().toISOString(),
      };

      if (data.applicationType === 'transfer') {
        newApplication.oldAddressDetails = { 
          houseNoStreet: data.transferHouseNoStreet!, barangay: data.transferBarangay!, cityMunicipality: data.transferCityMunicipality!,
          province: data.transferProvince!, zipCode: data.transferZipCode!,
        };
      }
      
      // Store fingerprint of successfully submitted data
      if (typeof window !== 'undefined') {
        const submittedFingerprint = generateFingerprint(data);
        localStorage.setItem(LAST_SUBMITTED_FINGERPRINT_KEY, submittedFingerprint);
      }
      
      saveApplication(newApplication);

      // This draft is now considered "submitted", so remove it from draft storage.
      // The fingerprint logic on next load will prevent this exact data from reloading.
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_STORAGE_KEY); 
      }

      toast({
        title: "Application Submitted!",
        description: `Application ID: ${newApplication.id}. You will be redirected to a confirmation page.`,
      });
      form.reset(); // Reset form to blank state
      router.push(`/public/application-submitted/${newApplication.id}`);

    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting the application. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold text-center mb-2">
              Voter Registration Application Form
            </h2>
            <p className="text-center text-muted-foreground">
              Please fill out all required fields accurately. This information will be used for your official voter registration.
              Ensure all details match your official documents.
            </p>
          </CardContent>
        </Card>        {/* Registration Intention Section */}
        <FormSection title="Registration Intention" description="">
          <RegistrationIntentionFields control={form.control} />
        </FormSection>
        {/* Application Type Section */}
        <FormSection title="Application Type" description="">
          <ApplicationTypeFields 
            control={form.control}
            form={form}
            registrationIntention={registrationIntention}
            isRegistered={isRegistered}
          />
        </FormSection>

        {/* Conditional sections based on application type */}
        {applicationType === 'reactivation' && (
          <FormSection title="Reason for Deactivation" description="">
            <ReactivationFields control={form.control} />
          </FormSection>
        )}        {applicationType === 'transfer' && transferType === 'transfer-reactivation' && (
          <FormSection title="Transfer with Reactivation Details" description="">
            <TransferReactivationFields control={form.control} />
          </FormSection>
        )}

        {applicationType === 'inclusion-reinstatement' && (
          <FormSection title="Inclusion/Reinstatement Request" description="">
            <InclusionReinstatementFields control={form.control} />
          </FormSection>
        )}

        {/* Personal Information Section */}        <FormSection 
          title="Part 1: PERSONAL INFORMATION" 
          description="To be filled out by Applicant."
        >
          <DisableableSection isDisabled={shouldDisableSection}>
            <PersonalInfoFields control={form.control} />
          </DisableableSection>
        </FormSection>

        {/* Citizenship Section */}        <FormSection title="Citizenship" description="">
          <DisableableSection isDisabled={shouldDisableSection}>
            <CitizenshipFields control={form.control} citizenshipType={citizenshipType} />
          </DisableableSection>
        </FormSection>

        {/* Address Section */}
        <FormSection title="Residence/Address (Current)" description="">
          <DisableableSection isDisabled={shouldDisableSection}>
            <AddressFields control={form.control} />          </DisableableSection>
        </FormSection>

        {/* Period of Residence Section */}
        <FormSection 
          title="Period of Residence (General)" 
          description="How long you've lived in your current area and in the Philippines."
        >
          <DisableableSection isDisabled={shouldDisableSection}>
            <ResidencyFields control={form.control} />
          </DisableableSection>
        </FormSection>

        {/* Profession Section */}
        <FormSection title="Profession / Occupation & TIN" description="">
          <DisableableSection isDisabled={shouldDisableSection}>
            <ProfessionFields control={form.control} />
          </DisableableSection>
        </FormSection>

        {/* Civil Status Section */}
        <FormSection title="Civil Status & Parents" description="">
          <DisableableSection isDisabled={shouldDisableSection}>
            <CivilStatusFields control={form.control} civilStatus={civilStatus} />
          </DisableableSection>
        </FormSection>

        {/* Special Needs Section */}
        <FormSection 
          title="Special Needs / Assistance (Optional)" 
          description="Information for voters with special needs."
        >
          <DisableableSection isDisabled={shouldDisableSection}>
            <SpecialNeedsFields 
              control={form.control} 
              isIndigenousPerson={isIndigenousPerson}
              isPwd={isPwd}
              assistorName={assistorName}
            />
          </DisableableSection>
        </FormSection>
        {/* ID Verification Section */}
        <FormSection 
          title="ID Verification" 
          description="Required for new registrations. Upload clear photos of your valid ID and a selfie."
        >
          <DisableableSection isDisabled={applicationType !== 'register'}>            <IdVerificationFields control={form.control} />
          </DisableableSection>
        </FormSection>

        {/* Thumbprints/Signatures Section */}
        <FormSection          title="ROLLED THUMBPRINTS / SPECIMEN SIGNATURES" 
          description="To be captured on-site at COMELEC office"
        >
          <ThumbprintsSignaturesFields control={form.control} />
        </FormSection>        {/* PART 2 - Dynamic Oath Sections */}
        {/* Temporarily disabled due to schema field issues */}
        {/*
        {(applicationType === 'register' || applicationType === 'transfer') && registrationIntention === 'regular' && (
          <FormSection title="PART 2    OATH, NOTICE and CONSENT (REGULAR )" description="">
            <RegularOathFields control={form.control} shouldDisableOath={shouldDisableOath} />
          </FormSection>
        )}

        {(applicationType === 'register' || applicationType === 'transfer') && registrationIntention === 'katipunan' && (
          <FormSection title="Part 2: OATH, NOTICE and CONSENT (KATIPUNAN NG KABATAAN)" description="">
            <KatipunanOathFields control={form.control} shouldDisableOath={shouldDisableOath} />
          </FormSection>
        )}
        */}

        {/* Basic Oath Section (using schema field) */}
        {(applicationType === 'register' || applicationType === 'transfer') && (
          <FormSection title="PART 2: OATH AND CONSENT" description="">
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  I do solemnly swear that the above statements regarding my person are true and correct; that I possess all the qualifications and none of the disqualifications of a voter; and that I have reviewed the entries encoded in the VRS and I confirm that the same are correct, accurate and consistent with the information I supplied in this application form.
                </p>
              </div>

              <FormField
                control={form.control}
                name="oathAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        required={!shouldDisableOath}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-semibold">
                        I understand and agree to the oath stated above {!shouldDisableOath && '*'}
                      </FormLabel>
                      <FormDescription>
                        By checking this box, I confirm that I have read, understood, and agree to the oath.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        )}

        {/* Declaration Section */}
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

<Dialog open={isDeclarationDialogOpen} onOpenChange={setDeclarationDialogOpen}>
  <DialogContent hideCloseButton className="sm:max-w-[525px]">
    <DialogHeader>
      <DialogTitle>Declaration</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 text-sm text-muted-foreground">
      <p>
        I hereby declare, under penalty of law, that all information provided in this online application form is true, complete, and accurate to the best of my knowledge and belief. I understand that any false or misleading statement may lead to the rejection of my application and/or legal consequences, including but not limited to those under the Revised Penal Code and other relevant laws.
      </p>
      <p>
        I understand and agree to the processing of my personal data for the purpose of this application, in accordance with the Data Privacy Act of 2012 and the Commission on Elections (COMELEC) Data Privacy Policy. I have read and understood the terms and conditions outlined in this application.
      </p>
      <p>
        Upon successful submission, your application will be reviewed by COMELEC personnel. You will be notified regarding the status of your application through the contact information you provided.
      </p>
    </div>
    <DialogFooter>
      <Button
        onClick={() => {
          form.setValue("declarationAccepted", true, { shouldValidate: true });
          setDeclarationDialogOpen(false);
        }}
        disabled={isConfirmButtonDisabled}
      >
        {isConfirmButtonDisabled ? `Please read the declaration (${countdown})` : "I understand and agree"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

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
      </form>
    </Form>
  );
}
