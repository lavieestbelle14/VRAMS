'use client';
import { useForm, Controller } from 'react-hook-form';
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, FileText, Save } from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { saveApplication } from '@/lib/applicationStore';
import { classifyApplicantType, type ClassifyApplicantTypeInput } from '@/ai/flows/classify-applicant-type';

export function ApplicationFormFields() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      firstName: '', lastName: '', middleName: '', dob: '', gender: '', placeOfBirth: '', citizenship: 'Filipino', contactNumber: '', email: '',
      houseNoStreet: '', barangay: '', cityMunicipality: '', province: '', zipCode: '', yearsOfResidency: undefined,
      applicationType: '',
      transferHouseNoStreet: '', transferBarangay: '', transferCityMunicipality: '', transferProvince: '', transferZipCode: '', transferYearsOfResidency: undefined,
      biometricsFile: '', // Simulate file name
      civilStatus: '', spouseName: '', fatherFirstName: '', fatherLastName: '', motherFirstName: '', motherLastName: '',
      isIlliterate: false, isSenior: false, isPwd: false, tribe: '', disabilityType: '', assistorName: '', assistorAddress: '', prefersGroundFloor: false,
    },
  });

  const applicationType = form.watch('applicationType');
  const civilStatus = form.watch('civilStatus');
  const isPwd = form.watch('isPwd');

  async function onSubmit(data: ApplicationFormValues) {
    try {
      const personalInfo: PersonalInfo = {
        firstName: data.firstName, lastName: data.lastName, middleName: data.middleName, dob: data.dob, gender: data.gender,
        placeOfBirth: data.placeOfBirth, citizenship: data.citizenship, contactNumber: data.contactNumber, email: data.email,
      };
      const addressDetails: AddressDetails = {
        houseNoStreet: data.houseNoStreet, barangay: data.barangay, cityMunicipality: data.cityMunicipality,
        province: data.province, zipCode: data.zipCode, yearsOfResidency: data.yearsOfResidency,
      };
      const civilDetails: CivilDetails = {
        civilStatus: data.civilStatus, spouseName: data.spouseName, fatherFirstName: data.fatherFirstName, fatherLastName: data.fatherLastName,
        motherFirstName: data.motherFirstName, motherLastName: data.motherLastName,
      };
      const specialNeeds: SpecialNeeds = {
        isIlliterate: data.isIlliterate, isSenior: data.isSenior, isPwd: data.isPwd, tribe: data.tribe, disabilityType: data.disabilityType,
        assistorName: data.assistorName, assistorAddress: data.assistorAddress, prefersGroundFloor: data.prefersGroundFloor,
      };

      const newApplication: Application = {
        id: `APP-${Date.now().toString().slice(-6)}`,
        personalInfo,
        addressDetails,
        applicationType: data.applicationType,
        civilDetails,
        specialNeeds,
        biometricsFile: data.biometricsFile,
        status: 'pending',
        submissionDate: new Date().toISOString(),
      };

      if (data.applicationType === 'transfer') {
        newApplication.oldAddressDetails = {
          houseNoStreet: data.transferHouseNoStreet!, barangay: data.transferBarangay!, cityMunicipality: data.transferCityMunicipality!,
          province: data.transferProvince!, zipCode: data.transferZipCode!, yearsOfResidency: data.transferYearsOfResidency
        };
      }

      // AI Classification
      const classificationInput: ClassifyApplicantTypeInput = {
        personalInfo: `${data.firstName} ${data.lastName}, DOB: ${data.dob}, Gender: ${data.gender}`,
        addressDetails: `${data.houseNoStreet}, ${data.barangay}, ${data.cityMunicipality}, ${data.province}`,
        applicationType: data.applicationType,
        biometrics: data.biometricsFile || 'Not provided',
        civilDetails: `Status: ${data.civilStatus}, Spouse: ${data.spouseName || 'N/A'}, Father: ${data.fatherFirstName} ${data.fatherLastName}, Mother: ${data.motherFirstName} ${data.motherLastName}`,
        specialSectorNeeds: Object.entries(specialNeeds)
          .filter(([key, value]) => value === true || (typeof value === 'string' && value.length > 0))
          .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`) // Format key
          .join(', ') || 'None',
      };
      
      const classificationResult = await classifyApplicantType(classificationInput);
      newApplication.classification = classificationResult;

      saveApplication(newApplication);

      toast({
        title: "Application Submitted",
        description: `Application ID: ${newApplication.id} successfully submitted and classified as ${classificationResult.applicantType}.`,
      });
      form.reset();
      router.push('/dashboard');

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
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formSection("Personal Information", "Basic details of the applicant.", (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Juan" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel>Middle Name (Optional)</FormLabel><FormControl><Input placeholder="Santos" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Dela Cruz" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                  <Popover><PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value ? new Date(field.value): undefined} onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                  </PopoverContent></Popover><FormMessage />
                </FormItem>)} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="placeOfBirth" render={({ field }) => (<FormItem><FormLabel>Place of Birth</FormLabel><FormControl><Input placeholder="Manila" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="citizenship" render={({ field }) => (<FormItem><FormLabel>Citizenship</FormLabel><FormControl><Input placeholder="Filipino" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="contactNumber" render={({ field }) => (<FormItem><FormLabel>Contact No. (Optional)</FormLabel><FormControl><Input placeholder="09123456789" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="juan.delacruz@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
             </div>
          </>
        ))}

        {formSection("Address Details", "Current residential address.", (
          <>
            <FormField control={form.control} name="houseNoStreet" render={({ field }) => (<FormItem><FormLabel>House No. / Street / Subdivision</FormLabel><FormControl><Input placeholder="123 Rizal St, Pleasant Village" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="barangay" render={({ field }) => (<FormItem><FormLabel>Barangay</FormLabel><FormControl><Input placeholder="Pembo" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cityMunicipality" render={({ field }) => (<FormItem><FormLabel>City / Municipality</FormLabel><FormControl><Input placeholder="Makati City" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="province" render={({ field }) => (<FormItem><FormLabel>Province</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="1218" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="yearsOfResidency" render={({ field }) => (<FormItem><FormLabel>Years of Residency</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          </>
        ))}
        
        {formSection("Application Details", "Type of application and related information.", (
          <>
            <FormField control={form.control} name="applicationType" render={({ field }) => (
              <FormItem className="space-y-3"><FormLabel>Application Type</FormLabel>
                <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="register" /></FormControl><FormLabel className="font-normal">New Registration</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="transfer" /></FormControl><FormLabel className="font-normal">Transfer of Registration</FormLabel></FormItem>
                </RadioGroup></FormControl><FormMessage />
              </FormItem>)} />

            {applicationType === 'transfer' && (
              <>
                <Separator className="my-4" />
                <h4 className="text-md font-semibold mb-2">Previous Address (For Transfer)</h4>
                <FormField control={form.control} name="transferHouseNoStreet" render={({ field }) => (<FormItem><FormLabel>House No. / Street / Subdivision</FormLabel><FormControl><Input placeholder="456 Bonifacio St" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="transferBarangay" render={({ field }) => (<FormItem><FormLabel>Barangay</FormLabel><FormControl><Input placeholder="San Antonio" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="transferCityMunicipality" render={({ field }) => (<FormItem><FormLabel>City / Municipality</FormLabel><FormControl><Input placeholder="Pasig City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="transferProvince" render={({ field }) => (<FormItem><FormLabel>Province</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="transferZipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="1600" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="transferYearsOfResidency" render={({ field }) => (<FormItem><FormLabel>Years at Previous Address</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </>
            )}
            <Separator className="my-4" />
            <FormField control={form.control} name="biometricsFile" render={({ field }) => (
                <FormItem><FormLabel>Biometrics Data (Simulated)</FormLabel>
                <FormControl><Input type="text" placeholder="e.g., biometrics_juan_delacruz.zip or Captured" {...field} /></FormControl>
                <FormDescription>Enter filename or status if captured on-site. Actual file upload not implemented.</FormDescription>
                <FormMessage /></FormItem>)} />
          </>
        ))}

        {formSection("Civil Details", "Information about civil status and parentage.", (
          <>
            <FormField control={form.control} name="civilStatus" render={({ field }) => (
              <FormItem><FormLabel>Civil Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select civil status" /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="widowed">Widowed</SelectItem><SelectItem value="separated">Separated</SelectItem></SelectContent>
              </Select><FormMessage /></FormItem>)} />
            {civilStatus === 'married' && (
              <FormField control={form.control} name="spouseName" render={({ field }) => (<FormItem><FormLabel>Spouse's Full Name</FormLabel><FormControl><Input placeholder="Maria Clara Dela Cruz" {...field} /></FormControl><FormMessage /></FormItem>)} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fatherFirstName" render={({ field }) => (<FormItem><FormLabel>Father's First Name</FormLabel><FormControl><Input placeholder="Pedro" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="fatherLastName" render={({ field }) => (<FormItem><FormLabel>Father's Last Name</FormLabel><FormControl><Input placeholder="Dela Cruz" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="motherFirstName" render={({ field }) => (<FormItem><FormLabel>Mother's First Name</FormLabel><FormControl><Input placeholder="Maria" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="motherLastName" render={({ field }) => (<FormItem><FormLabel>Mother's Maiden Last Name</FormLabel><FormControl><Input placeholder="Santos" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          </>
        ))}

        {formSection("Special Sector Needs (Optional)", "Information for voters with special needs.", (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="isIlliterate" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Illiterate</FormLabel></div></FormItem>)} />
                <FormField control={form.control} name="isSenior" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Senior Citizen</FormLabel></div></FormItem>)} />
                <FormField control={form.control} name="isPwd" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Person with Disability (PWD)</FormLabel></div></FormItem>)} />
            </div>
            {isPwd && (
                 <FormField control={form.control} name="disabilityType" render={({ field }) => (<FormItem><FormLabel>Type of Disability</FormLabel><FormControl><Input placeholder="e.g., Visual Impairment, Mobility" {...field} /></FormControl><FormMessage /></FormItem>)} />
            )}
            <FormField control={form.control} name="tribe" render={({ field }) => (<FormItem><FormLabel>Tribe / Indigenous Group (Optional)</FormLabel><FormControl><Input placeholder="e.g., Aeta, Igorot" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="assistorName" render={({ field }) => (<FormItem><FormLabel>Assistor's Full Name (If any)</FormLabel><FormControl><Input placeholder="Full name of assistor" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="assistorAddress" render={({ field }) => (<FormItem><FormLabel>Assistor's Address (If any)</FormLabel><FormControl><Textarea placeholder="Full address of assistor" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="prefersGroundFloor" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Prefers to vote on ground floor polling place</FormLabel></div></FormItem>)} />
          </>
        ))}
        
        <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={() => form.reset()}>Reset Form</Button>
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
