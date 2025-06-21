'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationFormSchema } from '@/schemas/applicationSchema';
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
import { Save, Trash2, CalendarIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { saveApplication } from '@/lib/applicationStore';
import { format } from "date-fns";
import { z } from 'zod';
import { useFormDraft } from '@/hooks/useFormDraft';
import { DeclarationDialog } from './form-fields/DeclarationDialog';
import { useAuth } from '@/contexts/AuthContext';

// Import all form field components
import {
  DisableableSection,
  RegistrationIntentionFields,
  ApplicationTypeFields,
  AddressResidencyFields, 
  FormSection,
  IdVerificationFields,
  ThumbprintsSignaturesFields,
  RegularOathFields,
  KatipunanOathFields,
  ReactivationFields,
  TransferFields,
  PersonalInformationFields, 
  InclusionReinstatementFields,
  CorrectionOfEntryFields,
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
  const { user } = useAuth();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      // Personal Info
      firstName: '', lastName: '', middleName: '',
      sex: '', dob: '', placeOfBirthCityMun: '', placeOfBirthProvince: '', // Corrected placeOfBirth fields
      citizenshipType: '', naturalizationDate: undefined, naturalizationCertNo: '', // Corrected naturalization fields
      contactNumber: '', email: '',
      residencyYearsCityMun: undefined, residencyMonthsCityMun: undefined, residencyYearsPhilippines: undefined, // Corrected residency fields
      professionOccupation: '',

      // Address Details (Current)
      houseNoStreet: '', barangay: '', cityMunicipality: '', province: '', // Corrected address fields

      // Civil Details
      civilStatus: '', spouseName: '',
      fatherFirstName: '', fatherLastName: '', motherFirstName: '', motherLastName: '', // Corrected parent fields
        // Special Needs
      isIlliterate: false, isSenior: false, indigenousTribe: '', disabilityType: '', // Corrected special needs fields
      assistanceNeeded: '', assistorName: '', prefersGroundFloor: false, isPwd: false, isIndigenousPerson: false,

      // Application
      applicationType: '', // Use '' instead of undefined for enums
      biometricsFile: 'For on-site capture', 

      declarationAccepted: false,
      
      // Conditional fields
      previousPrecinctNumber: '', previousBarangay: '', previousCityMunicipality: '', previousProvince: '',
      previousForeignPost: '', previousCountry: '',
      transferDeclarantName: '', transferDeclarantBirthDate: '', // Added new fields
      correctionField: undefined,
      presentData: '', // Corrected correction fields
      newData: '',
      
      // Oath fields
      oathAccepted: false,
      regularRegistrationType: undefined,
      regularVoterStatus: undefined,
      regularOathAccepted: false,
      transferType: undefined,
      adultRegistrationConsent: undefined,
    },
  });

  // Use the custom draft hook
  const { clearDraft } = useFormDraft<ApplicationFormValues>({
    form,
    draftKey: DRAFT_STORAGE_KEY,
    fingerprintKey: LAST_SUBMITTED_FINGERPRINT_KEY,
    generateFingerprint,
    toast,
  });

  const declarationAccepted = form.watch('declarationAccepted');

  const [isDeclarationDialogOpen, setDeclarationDialogOpen] = useState(false);
  
  // Define the missing handleAcceptDeclaration function
  const handleAcceptDeclaration = () => {
    form.setValue("declarationAccepted", true, { shouldValidate: true });
  };

  const handleClearDraft = () => {
    clearDraft({
      firstName: '', lastName: '', middleName: '', suffix: '',
      sex: '', dob: '', placeOfBirthCityMun: '', placeOfBirthProvince: '',
      citizenshipType: '', naturalizationDate: undefined, naturalizationCertNo: '',
      contactNumber: '', email: '',
      residencyYearsCityMun: undefined, residencyMonthsCityMun: undefined, residencyYearsPhilippines: undefined,
      professionOccupation: '',
      houseNoStreet: '', barangay: '', cityMunicipality: '', province: '',
      civilStatus: '', spouseName: '',
      fatherFirstName: '', fatherLastName: '', motherFirstName: '', motherLastName: '',
      isIlliterate: false, isSenior: false, indigenousTribe: '', disabilityType: '',
      assistanceNeeded: '', assistorName: '', prefersGroundFloor: false, isPwd: false, isIndigenousPerson: false,
      applicationType: '',
      biometricsFile: 'For on-site capture',
      previousPrecinctNumber: '', previousBarangay: '', previousCityMunicipality: '', previousProvince: '',
      previousForeignPost: '', previousCountry: '',
      transferDeclarantName: '', transferDeclarantBirthDate: '',
      correctionField: undefined,
      presentData: '',
      newData: '',
      oathAccepted: false,
      regularRegistrationType: undefined,
      regularVoterStatus: undefined,
      regularOathAccepted: false,
      adultRegistrationConsent: undefined,
    });
  };

  const applicationType = form.watch('applicationType');
  const registrationIntention = form.watch('registrationIntention');
  const civilStatus = form.watch('civilStatus');
  const citizenshipType = form.watch('citizenshipType');
  const assistorName = form.watch('assistorName');
  const isIndigenousPerson = form.watch('isIndigenousPerson');
  const isPwd = form.watch('isPwd');
  const transferType = form.watch('transferType'); // Watch transferType

  const showDeclarationFields = applicationType === 'transfer';
  const isRegistered = !!user?.voterId;

  // This will disable all personal information sections unless applicationType is 'register'
  // For other sections like Address, specific logic will be applied.
  const shouldDisableSection = applicationType !== 'register';

  // Keep the oath section disabled logic separate
  // Update this line in your component
  const shouldDisableOath = applicationType !== 'register';

  const onSubmit: import("react-hook-form").SubmitHandler<ApplicationFormValues> = async (data) => {
    try {
      // TODO: Update this to match the new schema field names
      console.log('Form data:', data);
      
      toast({
        title: "Application Submitted!",
        description: `Your application has been submitted successfully.`,
      });
      form.reset(); // Reset form to blank state
      // router.push(`/public/application-submitted/${newApplication.id}`);

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
        </Card>        
        {/* Application Type Section */}
        <FormSection title="Application Type" description="">
          <ApplicationTypeFields 
            control={form.control}
            form={form}
            registrationIntention={registrationIntention}
            isRegistered={isRegistered}
          />
        </FormSection>

        {/* Registration Intention Section - Only show for register application type */}
        {applicationType === 'register' && (
          <FormSection title="Registration Intention" description="Select the type of registration you wish to apply for.">
            <RegistrationIntentionFields control={form.control} />
          </FormSection>
        )}

        {/* --- Fields for TRANSFER application type --- */}
        {applicationType === 'transfer' && (
          <>
            {/* 1. Transfer declaration and previous record details */}
            <FormSection 
              title="Application for Transfer of Registration Record" 
              description={transferType === 'transfer-reactivation' 
                ? "Provide details of your previous registration for transfer and reason for reactivation." 
                : "Provide details of your previous registration for transfer."}
            >
              <TransferFields control={form.control} />
            </FormSection>

            {/* 2. New Residence Information (common for all transfers) */}
            <FormSection 
              title="New Residence Information for Transfer" 
              description="Provide your new address details and residency period for the transfer."
            >
              <DisableableSection isDisabled={false}> {/* Always enabled for transfer */}
                <AddressResidencyFields control={form.control} />
              </DisableableSection>
            </FormSection>

            {/* 3. Reactivation Reason (only if transferType is 'transfer-reactivation') */}
            {transferType === 'transfer-reactivation' && (
              <FormSection title="Reason for Deactivation" description="Provide the reason your record was deactivated for reactivation.">
                <ReactivationFields control={form.control} />
              </FormSection>
            )}
          </>
        )}

        {/* --- Fields for REACTIVATION (standalone) application type --- */}
        {applicationType === 'reactivation' && (
          <FormSection title="Reason for Deactivation" description="Provide the reason your record was deactivated.">
            <ReactivationFields control={form.control} />
          </FormSection>
        )}
        
        {/* --- Fields for CORRECTION OF ENTRY application type --- */}
        {applicationType === 'correction_of_entry' && (
          <FormSection title="Correction of Entries" description="">
            <CorrectionOfEntryFields control={form.control} />
          </FormSection>
        )}

        {/* --- Fields for INCLUSION/REINSTATEMENT application type --- */}
        {(applicationType === 'reinstatement') && (
          <FormSection title="Application for Inclusion/Reinstatement" description="Request to include or reinstate your name/record in the precinct book of voters.">
            <InclusionReinstatementFields control={form.control} />
          </FormSection>
        )}

        {/* Personal Information, ID Verification, and Thumbprints/Signatures Sections - Only show for register application type */}
        {applicationType === 'register' && (
          <>
            {/* Personal Information Section using the new consolidated component */}
            <FormSection 
              title="Part 1: PERSONAL INFORMATION" 
              description="To be filled out by Applicant. Includes personal details, citizenship, profession, civil status, and special needs information."
            >
              <DisableableSection isDisabled={shouldDisableSection}>
                <PersonalInformationFields 
                  control={form.control}
                  citizenshipType={citizenshipType}
                  civilStatus={civilStatus}
                  isIndigenousPerson={isIndigenousPerson}
                  isPwd={isPwd}
                  assistorName={assistorName}
                />
              </DisableableSection>
            </FormSection>

            {/* Address Section for Registration */}
            <FormSection 
              title="Residence, Address, and Period of Residence" 
              description="Provide your current address details and how long you've lived in your current area and in the Philippines."
            >
              <DisableableSection isDisabled={shouldDisableSection}> {/* shouldDisableSection is false when applicationType is 'register' */}
                <AddressResidencyFields control={form.control} />
              </DisableableSection>
            </FormSection>

            {/* ID Verification Section */}
            <FormSection 
              title="ID Verification" 
              description="Required for new registrations. Upload clear photos of your valid ID and a selfie."
            >
              <DisableableSection isDisabled={applicationType !== 'register'}>
                <IdVerificationFields control={form.control} />
              </DisableableSection>
            </FormSection>

            {/* Thumbprints/Signatures Section */}
            <FormSection 
              title="ROLLED THUMBPRINTS / SPECIMEN SIGNATURES" 
              description="To be captured on-site at COMELEC office"
            >
              <ThumbprintsSignaturesFields control={form.control} />
            </FormSection>
          </>
        )}

        {/* PART 2 - Dynamic Oath Sections based on Registration Intention */}
        {applicationType === 'register' && registrationIntention === 'Regular' && (
          <FormSection title="PART 2: OATH, NOTICE and CONSENT (REGULAR)" description="">
            <RegularOathFields control={form.control} shouldDisableOath={shouldDisableOath} />
          </FormSection>
        )}

        {applicationType === 'register' && registrationIntention === 'Katipunan ng Kabataan' && (
          <FormSection title="Part 2: OATH, NOTICE and CONSENT (KATIPUNAN NG KABATAAN)" description="">
            <KatipunanOathFields control={form.control} shouldDisableOath={shouldDisableOath} />
          </FormSection>
        )}

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