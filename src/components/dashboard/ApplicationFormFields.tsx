
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
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
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
      applicationType: '',
      biometricsFile: 'For on-site capture', 

      // Conditional fields
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '',
    },
  });

  // Auto-save draft to localStorage
  useEffect(() => {
    const subscription = form.watch((values) => {
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
      applicationType: '',
      biometricsFile: 'For on-site capture', 
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '',
    });
    toast({ title: "Draft Cleared", description: "The application form has been reset." });
  };


  const applicationType = form.watch('applicationType');
  const civilStatus = form.watch('civilStatus');
  const isPwd = form.watch('isPwd');
  const citizenshipType = form.watch('citizenshipType');
  const assistorName = form.watch('assistorName');

  async function onSubmit(data: ApplicationFormValues) {
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formSection("Part 1: Personal Information", "To be filled out by Applicant.", (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Dela Cruz" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Juan" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel>Middle Name (Optional)</FormLabel><FormControl><Input placeholder="Santos" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="sex" render={({ field }) => (
                <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="placeOfBirthCityMun" render={({ field }) => (<FormItem><FormLabel>Place of Birth (City/Municipality)</FormLabel><FormControl><Input placeholder="Manila" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="placeOfBirthProvince" render={({ field }) => (<FormItem><FormLabel>Place of Birth (Province)</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="contactNumber" render={({ field }) => (<FormItem><FormLabel>Contact No. (Optional)</FormLabel><FormControl><Input placeholder="09123456789" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="juan.delacruz@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
          </>
        ))}

        {formSection("Citizenship", "", (
           <>
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
           </>
        ))}

        {formSection("Residence/Address (Current)", "", (
          <>
            <FormField control={form.control} name="houseNoStreet" render={({ field }) => (<FormItem><FormLabel>House No. / Street / Subdivision</FormLabel><FormControl><Input placeholder="123 Rizal St, Pleasant Village" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="barangay" render={({ field }) => (<FormItem><FormLabel>Barangay</FormLabel><FormControl><Input placeholder="Pembo" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cityMunicipality" render={({ field }) => (<FormItem><FormLabel>City / Municipality</FormLabel><FormControl><Input placeholder="Makati City" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="province" render={({ field }) => (<FormItem><FormLabel>Province</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="1218" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="yearsOfResidency" render={({ field }) => (<FormItem><FormLabel>Years at Current Address</FormLabel><FormControl><Input type="number" placeholder="5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="monthsOfResidency" render={({ field }) => (<FormItem><FormLabel>Months at Current Address</FormLabel><FormControl><Input type="number" placeholder="3" min="0" max="11" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          </>
        ))}

        {formSection("Period of Residence (General)", "How long you've lived in your current area and in the Philippines.", (
            <>
                <Label className="text-sm font-medium">In the City/Municipality</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="residencyYearsCityMun" render={({ field }) => (<FormItem><FormLabel>No. of Years</FormLabel><FormControl><Input type="number" placeholder="10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="residencyMonthsCityMun" render={({ field }) => (<FormItem><FormLabel>No. of Months</FormLabel><FormControl><Input type="number" placeholder="6" min="0" max="11" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="residencyYearsPhilippines" render={({ field }) => (<FormItem><FormLabel>In the Philippines (No. of Years)</FormLabel><FormControl><Input type="number" placeholder="25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            </>
        ))}

        {formSection("Profession / Occupation & TIN", "", (
            <>
                <FormField control={form.control} name="professionOccupation" render={({ field }) => (<FormItem><FormLabel>Profession / Occupation (Optional)</FormLabel><FormControl><Input placeholder="Engineer" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="tin" render={({ field }) => (<FormItem><FormLabel>TIN (Optional)</FormLabel><FormControl><Input placeholder="123-456-789-000" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </>
        ))}
        
        {formSection("Civil Status & Parents", "", (
          <>
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
          </>
        ))}

        {formSection("Special Needs / Assistance (Optional)", "Information for voters with special needs.", (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                <FormField control={form.control} name="isIlliterate" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Illiterate</FormLabel></FormItem>)} />
                <FormField control={form.control} name="isPwd" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Person with Disability (PWD)</FormLabel></FormItem>)} />
                <FormField control={form.control} name="isIndigenousPerson" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Indigenous Person</FormLabel></FormItem>)} />
                <FormField control={form.control} name="isSenior" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Senior Citizen</FormLabel></FormItem>)} />
                <FormField control={form.control} name="prefersGroundFloor" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Prefers Ground Floor Voting</FormLabel></FormItem>)} />
            </div>
            {isPwd && (
                 <FormField control={form.control} name="disabilityType" render={({ field }) => (<FormItem><FormLabel>Type of Disability</FormLabel><FormControl><Input placeholder="e.g., Visual Impairment, Mobility" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            )}
            <FormField control={form.control} name="assistorName" render={({ field }) => (<FormItem><FormLabel>Assistor's Full Name (If any)</FormLabel><FormControl><Input placeholder="Full name of assistor" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            { assistorName && (
                <FormField control={form.control} name="assistorRelationship" render={({ field }) => (<FormItem><FormLabel>Assistor's Relationship</FormLabel><FormControl><Input placeholder="e.g., Spouse, Child, Guardian" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            )}
            <FormField control={form.control} name="assistorAddress" render={({ field }) => (<FormItem><FormLabel>Assistor's Address (If any)</FormLabel><FormControl><Textarea placeholder="Full address of assistor" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
          </>
        ))}

        {formSection("Application Type & Biometrics", "", (
          <>
            <FormField control={form.control} name="applicationType" render={({ field }) => (
              <FormItem className="space-y-3"><FormLabel>Select Application Type</FormLabel>
                <FormControl><RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="register" /></FormControl><FormLabel className="font-normal">New Registration</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="transfer" /></FormControl><FormLabel className="font-normal">Transfer of Registration Record</FormLabel></FormItem>
                </RadioGroup></FormControl><FormMessage />
              </FormItem>)} />

            {applicationType === 'transfer' && (
              <>
                <Separator className="my-4" />
                <h4 className="text-md font-semibold mb-2">Previous Address Details (For Transfer)</h4>
                <FormField control={form.control} name="transferHouseNoStreet" render={({ field }) => (<FormItem><FormLabel>House No. / Street / Subdivision</FormLabel><FormControl><Input placeholder="456 Bonifacio St" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="transferBarangay" render={({ field }) => (<FormItem><FormLabel>Barangay</FormLabel><FormControl><Input placeholder="San Antonio" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="transferCityMunicipality" render={({ field }) => (<FormItem><FormLabel>City / Municipality</FormLabel><FormControl><Input placeholder="Pasig City" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="transferProvince" render={({ field }) => (<FormItem><FormLabel>Province</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="transferZipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="1600" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              </>
            )}
            
            <Separator className="my-4" />
            <FormField control={form.control} name="biometricsFile" render={({ field }) => (
                <FormItem><FormLabel>Biometrics Data (Thumbprints/Signatures)</FormLabel>
                <FormControl><Input type="text" placeholder="e.g., Captured on-site" {...field} value={field.value ?? ''} /></FormControl>
                <FormDescription>Indicate status of biometrics capture. Actual capture is done on-site.</FormDescription>
                <FormMessage /></FormItem>)} />
          </>
        ))}
        
        <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={handleClearDraft}>
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
