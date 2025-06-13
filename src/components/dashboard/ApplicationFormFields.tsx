
'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationFormSchema, type ApplicationFormValues } from '@/schemas/applicationSchema';
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
import { format } from "date-fns";
import { CalendarIcon, Save, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { saveApplication } from '@/lib/applicationStore';
import { classifyApplicantType, type ClassifyApplicantTypeInput } from '@/ai/flows/classify-applicant-type';

const DisableableSection = ({ 
  isDisabled, 
  children 
}: { 
  isDisabled: boolean; 
  children: React.ReactNode 
}) => (
  <div className={isDisabled ? "opacity-60 pointer-events-none" : ""}>
    {isDisabled && (
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          This section is auto-filled from your existing voter record for non-registration applications.
        </p>
      </div>
    )}
    {children}
  </div>
);
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
      isIlliterate: false, isPwd: false, isIndigenousPerson: false, disabilityType: '',
      assistorName: '', assistorRelationship: '', assistorAddress: '',
      prefersGroundFloor: false, isSenior: false,

      // Application
      applicationType: undefined,
      biometricsFile: 'For on-site capture', 

      // Conditional fields
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '',
      transferNewHouseNo: '',
      transferYears: undefined,
      transferMonths: undefined,
      oathAccepted: false,
      inclusionPrecinctNo: '',


    },
  });
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
    }
    form.reset({ // Reset to initial default values
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
      isIlliterate: false, isPwd: false, isIndigenousPerson: false, disabilityType: '',
      assistorName: '', assistorRelationship: '', assistorAddress: '',
      prefersGroundFloor: false, isSenior: false,
      applicationType: undefined,
      biometricsFile: 'For on-site capture', 
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '',
    });
    toast({ title: "Draft Cleared", description: "The application form has been reset." });
  };


const applicationType = form.watch('applicationType');
const transferType = form.watch('transferType');
const shouldDisableSection = applicationType && 
  applicationType !== 'register' && 
  !(applicationType === 'transfer' && transferType === 'transfer-from');
const civilStatus = form.watch('civilStatus');
const isPwd = form.watch('isPwd');
const citizenshipType = form.watch('citizenshipType');
const assistorName = form.watch('assistorName');
const showDeclarationFields = applicationType === 'transfer' || applicationType === 'transfer-reactivation';
const isRegistered = false; // TODO: Replace with actual registration status check from your auth/user system


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
        assistorName: data.assistorName, assistorRelationship: data.assistorRelationship, assistorAddress: data.assistorAddress,
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
      
      const classificationInput: ClassifyApplicantTypeInput = {
        personalInfo: `${data.firstName} ${data.lastName}, DOB: ${data.dob}, Sex: ${data.sex}, Citizenship: ${data.citizenshipType}, Profession: ${data.professionOccupation || 'N/A'}`,
        addressDetails: `${data.houseNoStreet}, ${data.barangay}, ${data.cityMunicipality}, ${data.province}. Residency: ${data.yearsOfResidency || 0}yr ${data.monthsOfResidency || 0}mo.`,
        applicationType: data.applicationType,
        biometrics: data.biometricsFile || 'Not provided',
        civilDetails: `Status: ${data.civilStatus}, Spouse: ${data.spouseName || 'N/A'}`,
        specialSectorNeeds: [
            data.isIlliterate && "Illiterate", data.isPwd && `PWD (${data.disabilityType || 'N/A'})`, data.isIndigenousPerson && "Indigenous",
            data.isSenior && "Senior Citizen", data.prefersGroundFloor && "Prefers Ground Floor Voting",
            data.assistorName && `Assisted by ${data.assistorName} (${data.assistorRelationship || 'N/A'})`
        ].filter(Boolean).join(', ') || 'None',
        previousAddressInfo: data.applicationType === 'transfer' ? `${data.transferHouseNoStreet}, ${data.transferBarangay}` : undefined,
      };
      
      const classificationResult = await classifyApplicantType(classificationInput);
      newApplication.classification = classificationResult;

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
  }

  const formSection = (title: string, description: string, children: React.ReactNode) => (
    <Card className="mb-6">
      <CardHeader><CardTitle>{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
  const DeclarationFields = ({prefix = ""}: {prefix?: string}) => (
  <div className="space-y-4 text-sm">
        <p className="text-sm text-muted-foreground mb-4">Note: (For Applicants with existing Registration Records)</p>

    <div className="flex items-baseline gap-2">
      <span>I,</span>
      <FormField
        control={form.control}
        name={`${prefix}declarantName`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'boolean' ? '' : field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, Filipino, born on</span>
      <FormField
        control={form.control}
        name={`${prefix}declarantBirthDate`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" type="date" value={typeof field.value === 'boolean' || typeof field.value === 'undefined' ? '' : field.value} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, a duly registered</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span>voter in Precinct No.</span>
      <FormField
        control={form.control}
        name={`${prefix}declarantPrecinct`}
        render={({ field }) => (
          <FormItem className="w-24">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'boolean' ? '' : field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>of Barangay</span>
      <FormField
        control={form.control}
        name={`${prefix}declarantBarangay`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'boolean' || typeof field.value === 'undefined' ? '' : field.value} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, City/Municipality of</span>
      <FormField
        control={form.control}
        name={`${prefix}declarantCity`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'boolean' || typeof field.value === 'undefined' ? '' : field.value} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>,</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span>Province of</span>
      <FormField
        control={form.control}
        name={`${prefix}declarantProvince`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} className="h-7" value={typeof field.value === 'boolean' || typeof field.value === 'undefined' ? '' : field.value} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <span>, do HEREBY APPLY FOR:</span>
    </div>
  </div>
);
  return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Place Application Type first */}
      {formSection("Application Type", "", (
  <>
    <FormField
      control={form.control}
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
<RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className="flex flex-col space-y-2">
              {/* Registration */}
<FormItem className="space-y-1">
  <div className="flex items-center space-x-3">
    <FormControl>
      <RadioGroupItem value="register" />
    </FormControl>
    <FormLabel className="font-normal">Application for Registration</FormLabel>
  </div>
  {field.value === 'register' && (
    <div className="ml-8 space-y-4">
      {/* Note removed */}
    </div>
  )}
</FormItem>

               {/* Transfer */}
              <FormItem className="space-y-1">
    <div className="flex items-center space-x-3">
      <FormControl>
        <RadioGroupItem value="transfer" disabled={!isRegistered} />
      </FormControl>
      <FormLabel className={cn("font-normal", !isRegistered && "text-muted-foreground")}>
        Application for Transfer of Registration Record
      </FormLabel>
      {!isRegistered && (
        <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
      )}
    </div>

{field.value === 'transfer' && (
      <div className="ml-8 space-y-4">
        <DeclarationFields prefix="transfer_" />
    <FormField
      control={form.control}
      name="transferType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Transfer Type</FormLabel>
          <FormControl>
            <RadioGroup 
              onValueChange={field.onChange} 
              value={field.value ?? ''} 
              className="space-y-2"
            >
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="transfer-within" />
                </FormControl>
                <FormLabel className="font-normal">
                  Within the same City/Municipality/District
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="transfer-from" />
                </FormControl>
                <FormLabel className="font-normal">
                  From another City/Municipality/District
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <div className="space-y-4">
                      <p className="text-sm font-medium">My New Residence is:</p>
                      <FormField name="transferNewHouseNo" control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>House No. & Street</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={
                                  typeof field.value === 'boolean'
                                    ? ''
                                    : field.value instanceof File
                                      ? ''
                                      : field.value ?? ''
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField name="transferNewBarangay" control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Barangay</FormLabel>
                              <FormControl>
                                <Input {...field} value={typeof field.value === 'boolean' ? '' : field.value ?? ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField name="transferNewCity" control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City/Municipality</FormLabel>
                              <FormControl>
                                <Input {...field} value={typeof field.value === 'boolean' || typeof field.value === 'undefined' ? '' : field.value} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField name="transferNewProvince" control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province</FormLabel>
                              <FormControl>
                                <Input {...field} value={typeof field.value === 'boolean' ? '' : field.value ?? ''} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
<div className="prose prose-sm text-muted-foreground">
  <div className="flex items-center gap-2">
    <span className="text-black">I have resided in my new residence for</span>
    <FormField
      control={form.control}
      name="transferYears"
      render={({ field }) => (
        <FormItem className="flex-shrink-0 w-20">
          <FormControl>
            <Input 
              type="number"
              min="0"
              className="h-8 text-center"
              placeholder="0"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
            />
          </FormControl>
        </FormItem>
      )}
    />
    <span className="text-black">years and for</span>
    <FormField
      control={form.control}
      name="transferMonths"
      render={({ field }) => (
        <FormItem className="flex-shrink-0 w-20">
          <FormControl>
            <Input 
              type="number"
              min="0"
              max="11"
              className="h-8 text-center"
              placeholder="0"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
            />
          </FormControl>
        </FormItem>
      )}
    />
    <span className="text-black">months.</span>
  </div>
</div>
                    </div>
                  </div>
                )}
              </FormItem>

              {/* Reactivation */}
              <FormItem className="space-y-2">
    <div className="flex items-center space-x-3">
      <FormControl>
        <RadioGroupItem value="reactivation" disabled={!isRegistered} />
      </FormControl>
      <FormLabel className={cn("font-normal", !isRegistered && "text-muted-foreground")}>
        Application for Reactivation of Registration Record
      </FormLabel>
      {!isRegistered && (
        <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
      )}
    </div>
                {field.value === 'reactivation' && (
  <div className="ml-8 space-y-4">
                    <RadioGroup name="deactivationReason" className="ml-4 space-y-2">
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">1. Sentenced by final judgment to suffer imprisonment for not less than one (1) year;</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="2" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">2. Convicted by final judgment of a crime involving disloyalty to the duly constituted government, etc.;</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="3" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">3. Declared by competent authority to be insane or incompetent;</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="4" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">4. Failed to vote in two (2) successive preceding regular elections;</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="5" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">5. Loss of Filipino citizenship; or</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="6" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">6. Exclusion by a court order;</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="7" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">7. Failure to Validate.</FormLabel>
                      </FormItem>
                    </RadioGroup>
                    <p className="text-sm text-muted-foreground mt-2">That said ground no longer exists, as evidenced by the attached certification/order of the court (in cases of 1,2,3,5, and 6).</p>
                  </div>
                )}
              </FormItem>
{/* Transfer with Reactivation */}
  <FormItem className="space-y-1">
    <div className="flex items-center space-x-3">
      <FormControl>
        <RadioGroupItem value="transfer-reactivation" disabled={!isRegistered} />
      </FormControl>
      <FormLabel className={cn("font-normal", !isRegistered && "text-muted-foreground")}>
        Application for Transfer with Reactivation
      </FormLabel>
      {!isRegistered && (
        <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
      )}
    </div>
    {(field.value === 'transfer' || field.value === 'reactivation') && (
      <div className="ml-8 space-y-4">
        <DeclarationFields prefix="transfer_" />
        {/* Rest of transfer specific fields */}
      </div>
    )}
  </FormItem>
              {/* Change/Correction */}
              <FormItem className="space-y-2">
    <div className="flex items-center space-x-3">
      <FormControl>
        <RadioGroupItem value="change-correction" disabled={!isRegistered} />
      </FormControl>
      <FormLabel className={cn("font-normal", !isRegistered && "text-muted-foreground")}>
        Application for Change of Name/Correction of Entries
      </FormLabel>
      {!isRegistered && (
        <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
      )}
    </div>
                {field.value === 'change-correction' && (
  <div className="ml-8 space-y-4">
                    <FormField name="presentData" control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Present Data/Information:</FormLabel>
                          <FormControl>
                            <Input {...field} value={typeof field.value === 'boolean' ? '' : field.value ?? ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField name="newData" control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New/Corrected Data/Information:</FormLabel>
                          <FormControl>
                            <Input {...field} value={typeof field.value === 'boolean' || typeof field.value === 'undefined' ? '' : field.value} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </FormItem>

              {/* Inclusion/Reinstatement */}
<FormItem className="space-y-2">
    <div className="flex items-center space-x-3">
      <FormControl>
        <RadioGroupItem value="inclusion-reinstatement" disabled={!isRegistered} />
      </FormControl>
      <FormLabel className={cn("font-normal", !isRegistered && "text-muted-foreground")}>
        Application for Inclusion/Reinstatement
      </FormLabel>
      {!isRegistered && (
        <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
      )}
    </div>
  {field.value === 'inclusion-reinstatement' && (
  <div className="ml-8 space-y-4">    
    <RadioGroup name="inclusionType" className="space-y-2">
      <FormItem className="flex items-center space-x-2">
        <FormControl>
          <RadioGroupItem value="inclusion" />
        </FormControl>
        <FormLabel className="font-normal">
          Inclusion of VRR in the precinct book of voters
        </FormLabel>
      </FormItem>
      <FormItem className="flex items-center space-x-2">
        <FormControl>
          <RadioGroupItem value="reinstatement" />
        </FormControl>
        <FormLabel className="font-normal">
          Reinstatement of the name of the registered voter which has been omitted in the list of voters
        </FormLabel>
      </FormItem>
    </RadioGroup>

    <div className="prose prose-sm text-muted-foreground mb-4">
      <p>
        I do hereby request that my name which has been omitted in the list of voters/my registration record which has not been
        included in the precinct book of voters of Precinct No. <Input 
          className="w-20 inline-block mx-1 h-6" 
          value={form.watch('inclusionPrecinctNo') || ''} 
          onChange={(e) => form.setValue('inclusionPrecinctNo', e.target.value)}
        />, be reinstated/included therein. The said reinstatement of
        name/inclusion of registration record is necessary and valid.
      </p>
    </div>
  </div>
)}
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
))}
      
<Card className="mb-6 bg-muted/50">
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

        {formSection("Part 1: Personal Information", "To be filled out by Applicant.", (
          <DisableableSection isDisabled={shouldDisableSection}>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Dela Cruz" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Juan" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel>Middle Name (Optional)</FormLabel><FormControl><Input placeholder="Santos" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sex"
                render={({
                  field,
                }: {
                  field: import("react-hook-form").ControllerRenderProps<ApplicationFormValues, "sex">;
                }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({
                  field,
                }: {
                  field: {
                    value: string;
                    onChange: (value: string) => void;
                    onBlur: () => void;
                    name: string;
                    ref: React.Ref<any>;
                  };
                }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), "MMMM d, yyyy")
                              : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                          }
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="placeOfBirthCityMun" render={({ field }) => (<FormItem><FormLabel>Place of Birth (City/Municipality)</FormLabel><FormControl><Input placeholder="Manila" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="placeOfBirthProvince" render={({ field }) => (<FormItem><FormLabel>Place of Birth (Province)</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name={"contactNumber" as keyof ApplicationFormValues} render={({ field }) => (<FormItem><FormLabel>Contact No. (Optional)</FormLabel><FormControl><Input placeholder="09123456789" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={"email" as keyof ApplicationFormValues} render={({ field }) => (<FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="juan.delacruz@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </DisableableSection>

        ))}

        {formSection("Citizenship", "", (
        <DisableableSection isDisabled={shouldDisableSection}>

            <FormField control={form.control} name="citizenshipType" render={({ field }) => (
                <FormItem><FormLabel>Citizenship Basis</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select citizenship basis" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="byBirth">By Birth</SelectItem>
                        <SelectItem value="naturalized">Naturalized</SelectItem>
                        <SelectItem value="reacquired">Reacquired</SelectItem>
                    </SelectContent>
                </Select><FormMessage /></FormItem>)} />
            {(citizenshipType === 'naturalized' || citizenshipType === 'reacquired') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField control={form.control} name="naturalizationDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date of Naturalization/Reacquisition</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(new Date(field.value), "MMMM d, yyyy") : <span>Pick a date</span>}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value ? new Date(field.value): undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                        </FormItem>)} />
                    <FormField control={form.control} name="naturalizationCertNo" render={({ field }) => (<FormItem><FormLabel>Certificate No./Order of Approval</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            )}
             </DisableableSection>

        ))}

        {formSection("Residence/Address (Current)", "", (
          <DisableableSection isDisabled={shouldDisableSection}>

            <FormField control={form.control} name="houseNoStreet" render={({ field }) => (<FormItem><FormLabel>House No. / Street / Subdivision</FormLabel><FormControl><Input placeholder="123 Rizal St, Pleasant Village" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="barangay" render={({ field }) => (<FormItem><FormLabel>Barangay</FormLabel><FormControl><Input placeholder="Pembo" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cityMunicipality" render={({ field }) => (<FormItem><FormLabel>City / Municipality</FormLabel><FormControl><Input placeholder="Makati City" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="province" render={({ field }) => (<FormItem><FormLabel>Province</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="1218" {...field} value={typeof field.value === 'boolean' ? '' : field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="yearsOfResidency" render={({ field }) => (<FormItem><FormLabel>Years at Current Address</FormLabel><FormControl><Input type="number" placeholder="5" {...field} value={typeof field.value === 'boolean' ? '' : field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="monthsOfResidency" render={({ field }) => (<FormItem><FormLabel>Months at Current Address</FormLabel><FormControl><Input type="number" placeholder="3" min="0" max="11" {...field} value={typeof field.value === 'boolean' ? '' : field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            </DisableableSection>

        ))}

        {formSection("Period of Residence (General)", "How long you've lived in your current area and in the Philippines.", (
  <DisableableSection isDisabled={shouldDisableSection}>
                <Label className="text-sm font-medium">In the City/Municipality</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="residencyYearsCityMun" render={({ field }) => (<FormItem><FormLabel>No. of Years</FormLabel><FormControl><Input type="number" placeholder="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="residencyMonthsCityMun" render={({ field }) => (<FormItem><FormLabel>No. of Months</FormLabel><FormControl><Input type="number" placeholder="6" min="0" max="11" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="residencyYearsPhilippines" render={({ field }) => (<FormItem><FormLabel>In the Philippines (No. of Years)</FormLabel><FormControl><Input type="number" placeholder="25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
              </DisableableSection>

        ))}

        {formSection("Profession / Occupation & TIN", "", (
  <DisableableSection isDisabled={shouldDisableSection}>
                <FormField control={form.control} name="professionOccupation" render={({ field }) => (<FormItem><FormLabel>Profession / Occupation (Optional)</FormLabel><FormControl><Input placeholder="Engineer" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="tin" render={({ field }) => (<FormItem><FormLabel>TIN (Optional)</FormLabel><FormControl><Input placeholder="123-456-789-000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
  </DisableableSection>
        ))}
        
        {formSection("Civil Status & Parents", "", (
  <DisableableSection isDisabled={shouldDisableSection}>
            <FormField control={form.control} name="civilStatus" render={({ field }) => (
              <FormItem><FormLabel>Civil Status</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select civil status" /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent>
              </Select><FormMessage /></FormItem>)} />
            {civilStatus === 'married' && (
              <FormField control={form.control} name="spouseName" render={({ field }) => (<FormItem><FormLabel>Spouse's Full Name</FormLabel><FormControl><Input placeholder="Maria Clara Dela Cruz" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fatherFirstName" render={({ field }) => (<FormItem><FormLabel>Father's First Name</FormLabel><FormControl><Input placeholder="Pedro" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="fatherLastName" render={({ field }) => (<FormItem><FormLabel>Father's Last Name</FormLabel><FormControl><Input placeholder="Dela Cruz" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="motherFirstName" render={({ field }) => (<FormItem><FormLabel>Mother's First Name</FormLabel><FormControl><Input placeholder="Maria" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="motherLastName" render={({ field }) => (<FormItem><FormLabel>Mother's Maiden Last Name</FormLabel><FormControl><Input placeholder="Santos" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
  </DisableableSection>
        ))}

        {formSection("Special Needs / Assistance (Optional)", "Information for voters with special needs.", (
  <DisableableSection isDisabled={shouldDisableSection}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                <FormField control={form.control} name="isIlliterate" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Illiterate</FormLabel></FormItem>)} />
                <FormField control={form.control} name="isPwd" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Person with Disability (PWD)</FormLabel></FormItem>)} />
                <FormField control={form.control} name="isIndigenousPerson" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Indigenous Person</FormLabel></FormItem>)} />
                <FormField control={form.control} name="isSenior" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Senior Citizen</FormLabel></FormItem>)} />
                <FormField control={form.control} name="prefersGroundFloor" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Prefers Ground Floor Voting</FormLabel></FormItem>)} />
            </div>
            {isPwd && (
                <FormField
                  control={form.control}
                  name="disabilityType"
                  render={({
                    field,
                  }: {
                    field: import("react-hook-form").ControllerRenderProps<ApplicationFormValues, "disabilityType">;
                  }) => (
                    <FormItem>
                      <FormLabel>Type of Disability</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Visual Impairment, Mobility" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            <FormField
              control={form.control}
              name="assistorName"
              render={({
                field,
              }: {
                field: import("react-hook-form").ControllerRenderProps<ApplicationFormValues, "assistorName">;
              }) => (
                <FormItem>
                  <FormLabel>Assistor's Full Name (If any)</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name of assistor" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            { assistorName && (
                <FormField
                  control={form.control}
                  name="assistorRelationship"
                  render={({
                    field,
                  }: {
                    field: import("react-hook-form").ControllerRenderProps<ApplicationFormValues, "assistorRelationship">;
                  }) => (
                    <FormItem>
                      <FormLabel>Assistor's Relationship</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spouse, Child, Guardian" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            <FormField
              control={form.control}
              name="assistorAddress"
              render={({
                field,
              }: {
                field: import("react-hook-form").ControllerRenderProps<ApplicationFormValues, "assistorAddress">;
              }) => (
                <FormItem>
                  <FormLabel>Assistor's Address (If any)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full address of assistor" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  </DisableableSection>
        ))}
{formSection("ID Verification", "Required for new registrations. Upload clear photos of your valid ID and a selfie.", (
  <DisableableSection isDisabled={applicationType !== 'register'}>
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Please provide clear photos of your valid government-issued ID and a selfie of yourself holding the ID.
        Each file should not exceed 5MB.
      </p>

      <FormField
        control={form.control}
        name="idFrontPhoto"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>ID Front Photo</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Please select a file smaller than 5MB",
                        variant: "destructive",
                      });
                      e.target.value = '';
                      return;
                    }
                    onChange(file);
                  }
                }}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Upload a clear photo of the front of your valid ID
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="idBackPhoto"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>ID Back Photo</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Please select a file smaller than 5MB",
                        variant: "destructive",
                      });
                      e.target.value = '';
                      return;
                    }
                    onChange(file);
                  }
                }}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Upload a clear photo of the back of your valid ID
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="selfieWithId"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>Selfie with ID</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Please select a file smaller than 5MB",
                        variant: "destructive",
                      });
                      e.target.value = '';
                      return;
                    }
                    onChange(file);
                  }
                }}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Upload a selfie of yourself holding your ID (make sure both your face and ID are clearly visible)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </DisableableSection>
))}

        {formSection("Biometrics", "", (
        <FormField
          control={form.control}
          name="biometricsFile"
          render={({
            field,
          }: {
            field: import("react-hook-form").ControllerRenderProps<ApplicationFormValues, "biometricsFile">;
          }) => (
            <FormItem>
              <FormLabel>Biometrics Data (Thumbprints/Signatures)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="For on-site capture" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>Actual biometrics capture will be done on-site at the COMELEC office.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

        {formSection("Part 2: OATH", "", (
  <>
    <div className="prose prose-sm max-w-none">
      <p className="text-muted-foreground leading-relaxed">
        I do solemnly swear that the above statements regarding my person are true and 
        correct; that I possess all the qualifications and none of the disqualifications of a voter; and 
        that I am not registered in any precinct or registered in a precinct in another 
        City/Municipality/District in the Philippines. Further, I give consent to the processing of 
        my personal data for purposes of voter registration, research, planning, coordination 
        and other purposes as may be provided by law including R.A. 8189, R.A. 10367, R.A. 
        10173 also known as the Data Privacy Act of 2012.
      </p>
    </div>

    <div className="flex items-start space-x-3 mt-4">
      <FormField
  control={form.control}
  name="oathAccepted"
  render={({
    field,
  }: {
    field: import("react-hook-form").ControllerRenderProps<ApplicationFormValues, "oathAccepted">;
  }) => (
    <FormItem className="flex items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
          required
          aria-required="true"
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel className="text-base font-semibold">
          I understand and agree to the oath stated above *
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
  </>
))}
        
        <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" onClick={handleClearDraft} className="btn-outline">
              <Trash2 className="mr-2 h-4 w-4" /> Clear Draft & Reset
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
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
