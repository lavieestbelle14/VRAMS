
'use client';
import { useEffect, useState } from 'react';
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { saveApplication } from '@/lib/applicationStore';


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

      declarationAccepted: false,

      // Conditional fields
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '',
      transferNewHouseNo: '',
      transferYears: undefined,
      transferMonths: undefined,

      // Part 2: Oath
      oathAccepted: false,
      katipunanDataConsent: undefined,
      katipunanOathAccepted: false,
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
      isIlliterate: false, isPwd: false, isIndigenousPerson: false, indigenousTribe: '', disabilityType: '',
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
const registrationIntention = form.watch('registrationIntention');
const civilStatus = form.watch('civilStatus');
const isPwd = form.watch('isPwd');
const citizenshipType = form.watch('citizenshipType');
const assistorName = form.watch('assistorName');
const showDeclarationFields = applicationType === 'transfer' || applicationType === 'transfer-reactivation';
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
      
      {formSection("Registration Intention", "", (
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="registrationIntention"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormControl>
            <RadioGroup 
              onValueChange={field.onChange} 
              value={field.value ?? ''} 
              className="space-y-4"
            >
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="regular" />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-normal leading-tight">
                    I signify and confirm my intention to undergo the process of voter registration
                    <span className="block text-sm font-medium">(18 years old and above)</span>
                  </FormLabel>
                </div>
              </FormItem>

              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="katipunan" />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-normal leading-tight">
                    I signify and confirm my intention to undergo the process of voter registration in the Katipunan ng Kabataan
                    <span className="block text-sm font-medium">(15 to 17 years old)</span>
                  </FormLabel>
                </div>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
))}
      
      {/* Place Application Type first */}
{formSection("Application Type", "", (
  <>
    {!registrationIntention && (
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Please select a Registration Intention above before choosing an Application Type
        </p>
      </div>
    )}
    
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
            <RadioGroup 
              onValueChange={field.onChange} 
              value={field.value ?? ''} 
              className="flex flex-col space-y-2"
              disabled={!registrationIntention}
            >
              {/* Registration */}
              <FormItem className="space-y-1">
                <div className="flex items-center space-x-3">
                  <FormControl>
                    <RadioGroupItem 
                      value="register" 
                      disabled={!registrationIntention || !isRegistered}
                    />
                  </FormControl>
                  <FormLabel className={cn(
                    "font-normal", 
                    (!registrationIntention || !isRegistered) && "text-muted-foreground"
                  )}>
                    Application for Registration
                  </FormLabel>
                  <span className="text-xs text-muted-foreground ml-2">
                    (Accomplish Personal Information at the Voter Registration Application Form part)
                  </span>
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
                    <RadioGroupItem 
                      value="transfer" 
                      disabled={!registrationIntention || !isRegistered}
                    />
                  </FormControl>
                  <FormLabel className={cn(
                    "font-normal", 
                    (!registrationIntention || !isRegistered) && "text-muted-foreground"
                  )}>
                    Application for Transfer of Registration Record
                  </FormLabel>
                  {!isRegistered && (
                    <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                  )}
                </div>

                {field.value === 'transfer' && (
                  <div className="ml-8 space-y-4">
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="space-y-4 text-sm">
                          <DeclarationFields prefix="transfer_" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="font-medium mb-4">APPLICATION FOR TRANSFER OF REGISTRATION RECORD</p>        
                        <FormField
                          control={form.control}
                          name="transferType"
                          render={({ field }) => (
                            <FormItem>
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
                                    <div className="flex items-center">
                                      <FormLabel className="font-normal">
                                        From another City/Municipality/District
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <RadioGroupItem value="transfer-foreign-post" />
                                    </FormControl>
                                    <div className="flex items-center">
                                      <FormLabel className="font-normal">
                                        From Foreign Post to Local OEO other than original place of registration
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="font-medium mb-4">My New Residence is:</p>
                          <FormField name="transferNewHouseNo" control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <div className="text-sm">House No./Street</div>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <FormField name="transferNewBarangay" control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm">Barangay</div>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField name="transferNewCity" control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm">City/Municipality</div>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField name="transferNewProvince" control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm">Province</div>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4 text-sm mt-4">
                            <div className="flex items-baseline gap-2">
                              <span>I have resided in my new residence for</span>
                              <FormField
                                control={form.control}
                                name="transferReactivationYears"
                                render={({ field }) => (
                                  <FormItem className="w-20">
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        className="text-center h-7"
                                        {...field}
                                        value={field.value ?? ''}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <span>years and</span>
                              <FormField
                                control={form.control}
                                name="transferReactivationMonths"
                                render={({ field }) => (
                                  <FormItem className="w-20">
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        max="11"
                                        className="text-center h-7"
                                        {...field}
                                        value={field.value ?? ''}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <span>months.</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </FormItem>

              {/* Reactivation */}
              <FormItem className="space-y-2">
                <div className="flex items-center space-x-3">
                  <FormControl>
                    <RadioGroupItem 
                      value="reactivation" 
                      disabled={!registrationIntention || !isRegistered}
                    />
                  </FormControl>
                  <FormLabel className={cn(
                    "font-normal", 
                    (!registrationIntention || !isRegistered) && "text-muted-foreground"
                  )}>
                    Application for Reactivation of Registration Record
                  </FormLabel>
                  {!isRegistered && (
                    <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                  )}
                </div>

                {field.value === 'reactivation' && (
                  <div className="ml-8 space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="text-sm font-medium mb-4">Reason for Deactivation</h4>
                        <RadioGroup name="deactivationReason" className="space-y-2">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="1" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              1. Sentenced by final judgment to suffer imprisonment for not less than one (1) year;
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="2" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              2. Convicted by final judgment of a crime involving disloyalty to the duly constituted government, etc.;
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="3" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              3. Declared by competent authority to be insane or incompetent;
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="4" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              4. Failed to vote in two (2) successive preceding regular elections;
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="5" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              5. Loss of Filipino citizenship; or
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="6" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              6. Exclusion by a court order;
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="7" />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              7. Failure to Validate.
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                        <p className="text-sm text-muted-foreground mt-4">
                          That said ground no longer exists, as evidenced by the attached certification/order of the court (in cases of 1,2,3,5, and 6).
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </FormItem>

              {/* Transfer with Reactivation */}
              <FormItem className="space-y-2">
                <div className="flex items-center space-x-3">
                  <FormControl>
                    <RadioGroupItem 
                      value="transfer-reactivation" 
                      disabled={!registrationIntention || !isRegistered}
                    />
                  </FormControl>
                  <FormLabel className={cn(
                    "font-normal", 
                    (!registrationIntention || !isRegistered) && "text-muted-foreground"
                  )}>
                    Application for Transfer with Reactivation
                  </FormLabel>
                  {!isRegistered && (
                    <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                  )}
                </div>

                {field.value === 'transfer-reactivation' && (
                  <div className="ml-8 space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <DeclarationFields prefix="transfer_reactivation_" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <p className="font-medium mb-4">APPLICATION FOR TRANSFER OF RECORD</p>
                        <FormField
                          control={form.control}
                          name="transferReactivationType"
                          render={({ field }) => (
                            <FormItem>
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
                                    <div className="flex items-center">
                                      <FormLabel className="font-normal">
                                        From another City/Municipality/District
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <RadioGroupItem value="transfer-foreign-post" />
                                    </FormControl>
                                    <div className="flex items-center">
                                      <FormLabel className="font-normal">
                                        From Foreign Post to Local OEO other than original place of registration
                                      </FormLabel>
                                    </div>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="font-medium mb-4">My New Residence is:</p>
                          <FormField name="transferNewHouseNo" control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <div className="text-sm">House No./Street</div>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <FormField name="transferNewBarangay" control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm">Barangay</div>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField name="transferNewCity" control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm">City/Municipality</div>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField name="transferNewProvince" control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm">Province</div>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4 text-sm mt-4">
                            <div className="flex items-baseline gap-2">
                              <span>I have resided in my new residence for</span>
                              <FormField
                                control={form.control}
                                name="transferReactivationYears"
                                render={({ field }) => (
                                  <FormItem className="w-20">
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        className="text-center h-7"
                                        {...field}
                                        value={field.value ?? ''}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <span>years and</span>
                              <FormField
                                control={form.control}
                                name="transferReactivationMonths"
                                render={({ field }) => (
                                  <FormItem className="w-20">
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        max="11"
                                        className="text-center h-7"
                                        {...field}
                                        value={field.value ?? ''}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <span>months.</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <p className="font-medium">Further, I do hereby apply for the reactivation of my registration record which was deactivated due to: </p>
                            <span className="text-xs text-muted-foreground ml-2">
                              (please check appropriate box):
                            </span>
                            <RadioGroup name="reactivationReason" className="space-y-2">
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="1" />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  1. Sentence by final judgment to suffer imprisonment for not less than one (1) year;
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="2" />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  2. Conviction by final judgment of any crime involving disloyalty to the duly constituted government, etc;
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="3" />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  3. Declaration of insanity or incompetence by a competent authority;
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="4" />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  4. Failure to vote in two (2) successive preceding regular elections;
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="5" />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  5. Loss of Filipino Citizenship;
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="6" />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  6. Exclusion by a court order;
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="6" />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  7. Failure to Validate.
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                            <p className="text-sm text-muted-foreground mt-2">
                              That said ground no longer exists, as evidenced by the attached certification/order of the court (in cases of 1,2,3,5, and 6).
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </FormItem>

              {/* Change/Correction */}
              <FormItem className="space-y-2">
                <div className="flex items-center space-x-3">
                  <FormControl>
                    <RadioGroupItem 
                      value="change-correction" 
                      disabled={!registrationIntention || !isRegistered}
                    />
                  </FormControl>
                  <FormLabel className={cn(
                    "font-normal", 
                    (!registrationIntention || !isRegistered) && "text-muted-foreground"
                  )}>
                    Application for Change of Name/Correction of Entries
                  </FormLabel>
                  {!isRegistered && (
                    <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                  )}
                </div>
                {field.value === 'change-correction' && (
                  <div className="ml-8 space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          (Attach required supporting documents such as Certified Copy or Certificate of Court Order or Certificate of Live Birth, and others)
                        </p>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="correctionField"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Field to Correct</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a field to correct" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Name">Name</SelectItem>
                                    <SelectItem value="Contact Number">Contact Number</SelectItem>
                                    <SelectItem value="Email Address">Email Address</SelectItem>
                                    <SelectItem value="Spouse name">Spouse name</SelectItem>
                                    <SelectItem value="Date of Birth">Date of Birth</SelectItem>
                                    <SelectItem value="Place of Birth">Place of Birth</SelectItem>
                                    <SelectItem value="Father's Name">Father's Name</SelectItem>
                                    <SelectItem value="Mother's Maiden Name">Mother's Maiden Name</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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

                          <FormField
                            control={form.control}
                            name="supportingDocument"
                            render={({ field: { onChange, value, ...field } }) => (
                              <FormItem>
                                <FormLabel>Supporting Document</FormLabel>
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
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
                                  Upload your supporting document (PDF, JPG, PNG format, max 5MB)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </FormItem>

              {/* Inclusion/Reinstatement */}
              <FormItem className="space-y-2">
                <div className="flex items-center space-x-3">
                  <FormControl>
                    <RadioGroupItem 
                      value="inclusion-reinstatement" 
                      disabled={!registrationIntention || !isRegistered}
                    />
                  </FormControl>
                  <FormLabel className={cn(
                    "font-normal", 
                    (!registrationIntention || !isRegistered) && "text-muted-foreground"
                  )}>
                    Application for Inclusion/Reinstatement
                  </FormLabel>
                  {!isRegistered && (
                    <span className="text-xs text-muted-foreground ml-2">(Requires registration)</span>
                  )}
                </div>
                {field.value === 'inclusion-reinstatement' && (
                  <div className="ml-8 space-y-4">    
                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="text-sm font-medium mb-4">Select Application Type</h4>
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

                        <div className="mt-6 space-y-4">
                          <div className="text-sm">
                            <p className="text-justify leading-relaxed" style={{ textIndent: '0' }}>
                              I do hereby request that my name which has been omitted in the list of voters/my registration record which has not been included in the precinct book of voters of Precinct No. 
                              <Input 
                                className="w-24 h-7 mx-1 inline-flex" 
                                value={form.watch('inclusionRequestPrecinctNo') || ''} 
                                onChange={(e) => form.setValue('inclusionRequestPrecinctNo', e.target.value)}
                              />
                              , be reinstated/included therein. The said reinstatement of name/inclusion of registration record is necessary and valid.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {form.watch('inclusionType') === 'inclusion' && (
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="text-sm font-medium mb-4">Inclusion Request</h4>
                          <div className="prose prose-sm text-muted-foreground">
                            <p>
                              I do hereby request that my registration record which has not been included in the precinct book of voters 
                              of Precinct No. <Input 
                                className="w-20 inline-block mx-1 h-6" 
                                value={form.watch('inclusionPrecinctNo') || ''} 
                                onChange={(e) => form.setValue('inclusionPrecinctNo', e.target.value)}
                              />, be included therein. The said inclusion of registration record is necessary and valid.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {form.watch('inclusionType') === 'reinstatement' && (
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="text-sm font-medium mb-4">Reinstatement Request</h4>
                          <div className="prose prose-sm text-muted-foreground">
                            <p>
                              I do hereby request that my name which has been omitted in the list of voters of Precinct No. <Input 
                                className="w-20 inline-block mx-1 h-6" 
                                value={form.watch('inclusionPrecinctNo') || ''} 
                                onChange={(e) => form.setValue('inclusionPrecinctNo', e.target.value)}
                              />, be reinstated therein. The said reinstatement of name is necessary and valid.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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

        {formSection("Part 1:  PERSONAL INFORMATION", "To be filled out by Applicant.", (
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

            {isIndigenousPerson && (
              <FormField
                control={form.control}
                name="indigenousTribe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tribe Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Aeta, Ati, Badjao" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

{formSection("ROLLED THUMBPRINTS / SPECIMEN SIGNATURES", "To be captured on-site at COMELEC office", (
  <div className="space-y-6">
    <div className="bg-muted/50 p-4 rounded-lg mb-4">
      <p className="text-sm text-muted-foreground">
        Note: Your thumbprints and specimen signatures will be captured in person at the COMELEC office. 
        The boxes below are for illustration purposes only.
      </p>
    </div>
    <div className="space-y-4">      
      <div className="flex gap-8 items-start">
        {/* Left side: Thumbprints */}
        <div className="flex-1 grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="border-2 border-dashed border-muted-foreground/25 w-32 h-32 rounded-md flex items-center justify-center mx-auto">
              <span className="text-sm text-muted-foreground">Left Thumb</span>
            </div>
            <p className="text-sm text-center">Left Thumb</p>
          </div>

          <div className="space-y-2">
            <div className="border-2 border-dashed border-muted-foreground/25 w-32 h-32 rounded-md flex items-center justify-center mx-auto">
              <span className="text-sm text-muted-foreground">Right Thumb</span>
            </div>
            <p className="text-sm text-center">Right Thumb</p>
          </div>
        </div>

        {/* Right side: Signatures */}
        <div className="flex-1">
          <p className="text-sm font-medium mb-4">Specimen Signatures:</p>
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-4 mb-6">
              <span className="text-sm w-6">{num}</span>
              <div className="flex-1 border-b-2 border-dashed border-muted-foreground/25 h-8" />
            </div>
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name="biometricsFile"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input 
                type="hidden" 
                {...field} 
                value="For on-site capture" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
))}


{/* PART 2 - Dynamic Oath Sections */}
{(applicationType === 'register' || applicationType === 'transfer') && registrationIntention === 'regular' ? (
  formSection("PART 2    OATH, NOTICE and CONSENT (REGULAR )", "", (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <FormField
          control={form.control}
          name="regularRegistrationType"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'registration'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'registration' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">REGISTRATION</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regularRegistrationType"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'transfer'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'transfer' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">TRANSFER</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed mb-4">
          I do solemnly swear that the above statements regarding my person are true and correct; that I possess all the qualifications and none of the disqualifications of a voter; and that I am:
        </p>

        <div className="space-y-2 ml-6 mb-4">
          <FormField
            control={form.control}
            name="regularVoterStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === 'not_registered'}
                    onCheckedChange={(checked) => 
                      field.onChange(checked ? 'not_registered' : undefined)
                    }
                  />
                </FormControl>
                <FormLabel className="font-normal">not registered in any precinct;</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="regularVoterStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === 'registered_elsewhere'}
                    onCheckedChange={(checked) => 
                      field.onChange(checked ? 'registered_elsewhere' : undefined)
                    }
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  registered in a precinct of another City/Municipality/District in the Philippines
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
        <p className="text-muted-foreground leading-relaxed">
          and that I have reviewed the entries encoded in the VRS and I confirm that the same are correct, accurate and consistent with the information I supplied in this application form. Further, by affixing my signature below, I authorize and give my consent to the Commission on Elections and the concerned Election Registration Board to collect and process the personal data I supplied herein for purposes of voter registration and elections, and for other purposes and allowable disclosures under B.P. Blg. 881, R.A. No. 8189, 10173 and 10367, and the relevant Resolutions of the Commission on Elections.
        </p>
      </div>

      <div className="flex items-start space-x-3 mt-4">
        <FormField
          control={form.control}
          name="regularOathAccepted"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  required={!shouldDisableOath}
                  aria-required={(!shouldDisableOath).toString()}
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
  ))
) : (applicationType === 'register' || applicationType === 'transfer') && registrationIntention === 'katipunan' ? (  formSection("Part 2: OATH, NOTICE and CONSENT (KATIPUNAN NG KABATAAN)", "", (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <FormField
          control={form.control}
          name="katipunanRegistrationType"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'registration'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'registration' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">REGISTRATION</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="katipunanRegistrationType"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'transfer'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'transfer' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">TRANSFER</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          I do solemnly swear that the above statements regarding my person are true and correct; that I possess all the qualifications and none of the disqualifications of a voter of Katipunan ng Kabataan; that I am:
        </p>
      </div>

      <div className="space-y-2 ml-6">
        <FormField
          control={form.control}
          name="katipunanVoterStatus"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'not_registered'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'not_registered' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">not registered in any precinct</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="katipunanVoterStatus"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'registered_elsewhere'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'registered_elsewhere' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">registered in a precinct of another City/Municipality/District in the Philippines</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          and that I have reviewed the entries encoded in the VRS and I confirm that the same are correct, accurate and consistent with the information I supplied in this application form. Moreover, by affixing my signature below, I authorize and give my consent to the Commission on Elections and the concerned Election Registration Board to collect and process the personal data I supplied herein for purposes of voter's registration and elections, and for other purposes and allowable disclosures under B.P. Blg. 881, R.A. No. 8189, 10173 and 10367, and 10742 and the relevant resolutions of the Commission on Elections. Furthermore, I understand that when I reach eighteen (18) years of age, the personal data I supplied herein will be further processed by the Commission on Elections, and upon approval by the Election Registration Board, will be included in and consolidated with the database of voters who are at least eighteen (18) years of age for purposes of subsequent elections and for other lawful purposes and allowable disclosures mentioned above, to which further processing and its purposes I
        </p>
      </div>

      <div className="flex gap-4 ml-6">
        <FormField
          control={form.control}
          name="katipunanDataConsent"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'give_consent'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'give_consent' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">give my consent</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="katipunanDataConsent"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value === 'do_not_give_consent'}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? 'do_not_give_consent' : undefined)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal">do not give my consent</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground leading-relaxed">
          and that when I reach thirty one (31) years of age, my personal data in the Katipunan ng Kabataan database will be deleted accordingly.
        </p>
      </div>

      <div className="flex items-start space-x-3 mt-4">
        <FormField
          control={form.control}
          name="katipunanOathAccepted"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  required={!shouldDisableOath}
                  aria-required={(!shouldDisableOath).toString()}
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
  ))
) : null}
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
