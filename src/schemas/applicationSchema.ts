import { z } from "zod";

// This schema is designed to align with the supabase/businessSchema.sql
// You will need to update your form components to use these field names and enum values.
export const applicationFormSchema = z.object({
  // --- applicant table ---
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  citizenshipType: z.enum(["By Birth", "Naturalized", "Reacquired"], { errorMap: () => ({ message: "Please select a citizenship type" }) }).optional(),
  dateOfNaturalization: z.string().optional(), // Corresponds to date_of_naturalization
  certificateNumber: z.string().optional(), // Corresponds to certificate_number
  professionOccupation: z.string().optional(),
  contactNumber: z.string().optional(),
  emailAddress: z.string().email({ message: "Invalid email address" }).or(z.literal("")).optional(), // Corresponds to email_address
  civilStatus: z.enum(["Single", "Married", "Widowed", "Legally Separated"], { errorMap: () => ({ message: "Please select a civil status" }) }).optional(),
  spouseName: z.string().optional(),
  sex: z.enum(["M", "F"]).optional(),
  dateOfBirth: z.string().optional().refine((val) => {
    if (!val) return true; // Optional field
    const today = new Date();
    const birthDate = new Date(val);
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
      return false;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 14;
  }, {
    message: "You must be at least 14 years old to register.",
  }), // Corresponds to date_of_birth
  placeOfBirthMunicipality: z.string().optional(),
  placeOfBirthProvince: z.string().optional(),
  fatherFirstName: z.string().optional(),
  fatherLastName: z.string().optional(),
  motherFirstName: z.string().optional(),
  motherMaidenLastName: z.string().optional(),

  // --- applicant_special_sector table ---
  isIlliterate: z.boolean().default(false),
  isSeniorCitizen: z.boolean().default(false), // Corresponds to is_senior_citizen
  tribe: z.string().optional(), // Corresponds to indigenousTribe
  typeOfDisability: z.string().optional(), // Corresponds to disabilityType
  assistanceNeeded: z.string().optional(),
  assistorName: z.string().optional(),
  voteOnGroundFloor: z.boolean().default(false), // Corresponds to prefersGroundFloor

  // --- application table ---
  applicationType: z.enum([
    'register',
    'transfer',
    'reactivation',
    'transfer_with_reactivation',
    'correction_of_entry',
    'reinstatement'
  ]).optional(),

  // --- application_registration table ---
  registrationType: z.enum(['Katipunan ng Kabataan', 'Regular']).optional(), // Corresponds to registrationIntention
  adultRegistrationConsent: z.boolean().optional(),
  governmentIdFrontUrl: z.instanceof(File).optional().refine(file => !file || file.size <= 5 * 1024 * 1024, "File size must be less than 5MB"), // Corresponds to idFrontPhoto
  governmentIdBackUrl: z.instanceof(File).optional().refine(file => !file || file.size <= 5 * 1024 * 1024, "File size must be less than 5MB"), // Corresponds to idBackPhoto
  idSelfieUrl: z.instanceof(File).optional().refine(file => !file || file.size <= 5 * 1024 * 1024, "File size must be less than 5MB"), // Corresponds to selfieWithId

  // --- application_transfer table ---
  previousPrecinctNumber: z.string().optional(),
  previousBarangay: z.string().optional(),
  previousCityMunicipality: z.string().optional(),
  previousProvince: z.string().optional(),
  previousForeignPost: z.string().optional(),
  previousCountry: z.string().optional(),
  transferType: z.enum([
      'Within the same City/Municipality/District.',
      'From another City/Municipality/District (Accomplish Personal Information at the back).',
      'From foreign post to local CEO other than original place of registration.'
  ]).optional(),

  // --- application_reactivation table ---
  reasonForDeactivation: z.enum([
      'Sentenced by final judgment to suffer imprisonment for not less than one (1) year',
      'Convicted by final judgment of a crime involving disloyalty to the duly constituted government, etc;',
      'Declared by competent authority to be insane or incompetent;',
      'Failed to vote in two (2) successive preceding regular elections;',
      'Loss of Filipino citizenship;',
      'Exclusion by a court order; or',
      'Failure to Validate'
  ]).optional(), // Corresponds to reactivationReason

  // --- application_correction table ---
  targetField: z.enum([
      'Name', 'Contact Number', 'Email Address', 'Spouse name',
      'Date of Birth', 'Place of Birth', "Father's Name",
      "Mother's Maiden Name", 'Other'
  ]).optional(), // Corresponds to correctionField
  currentValue: z.string().optional(), // Corresponds to presentData
  requestedValue: z.string().optional(), // Corresponds to newData

  // --- application_reinstatement table ---
  reinstatementType: z.enum([
      'Reinstatement of records due to transfer from foreign post to same local City/Municipality/District.',
      'Inclusion of VRR in the precinct book of voters.',
      'Reinstatement of the name of the registered voter which has been omitted in the list of voters.'
  ]).optional(), // Corresponds to inclusionType

  // --- application_declared_address table ---
  houseNumber: z.string().optional(), // Split from houseNoStreet
  street: z.string().optional(), // Split from houseNoStreet
  barangay: z.string().optional(),
  cityMunicipality: z.string().optional(),
  province: z.string().optional(),
  yearsOfResidenceAddress: z.number().min(0).optional(), // For address-level residency
  monthsOfResidenceAddress: z.number().min(0).optional(), // For address-level residency
  yearsOfResidenceMunicipality: z.number().min(0).optional(), // Corresponds to residencyYearsCityMun
  monthsOfResidenceMunicipality: z.number().min(0).optional(), // Corresponds to residencyMonthsCityMun
  yearsInCountry: z.number().min(0).optional(), // Corresponds to residencyYearsPhilippines

  // --- UI-only / Logic fields (do not map directly to a single DB column) ---
  isPwd: z.boolean().default(false), // UI helper for typeOfDisability
  isIndigenousPerson: z.boolean().default(false), // UI helper for tribe
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the declaration to submit the application."
  }),
  oathAccepted: z.boolean().optional(), // Used for Katipunan oath logic
  
  // The following fields from your original schema do not exist in the DB schema.
  // You will need to decide how to handle them. They are commented out here.
  // transferDeclarantName: z.string().optional(),
  // transferDeclarantBirthDate: z.string().optional(),
  // inclusionPrecinctNo: z.string().optional(),

}).superRefine((data, ctx) => {
  // Conditional validation based on application type
  const applicationType = data.applicationType;
  
  // Registration-specific validations
  if (applicationType === 'register') {
    // Required fields for registration
    if (!data.firstName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "First name is required", path: ["firstName"] });
    if (!data.lastName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Last name is required", path: ["lastName"] });
    if (!data.citizenshipType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a citizenship type", path: ["citizenshipType"] });
    if (!data.dateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date of birth is required", path: ["dateOfBirth"] });
    if (!data.sex) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select your sex", path: ["sex"] });
    if (!data.placeOfBirthMunicipality?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Place of birth municipality is required", path: ["placeOfBirthMunicipality"] });
    if (!data.placeOfBirthProvince?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Place of birth province is required", path: ["placeOfBirthProvince"] });
    if (!data.fatherFirstName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Father's first name is required", path: ["fatherFirstName"] });
    if (!data.fatherLastName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Father's last name is required", path: ["fatherLastName"] });
    if (!data.motherFirstName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mother's first name is required", path: ["motherFirstName"] });
    if (!data.motherMaidenLastName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mother's maiden last name is required", path: ["motherMaidenLastName"] });
    if (!data.civilStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a civil status", path: ["civilStatus"] });
    if (!data.houseNumber?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "House number is required", path: ["houseNumber"] });
    if (!data.street?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street is required", path: ["street"] });
    if (!data.barangay?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Barangay is required", path: ["barangay"] });
    if (!data.cityMunicipality?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City/Municipality is required", path: ["cityMunicipality"] });
    if (!data.province?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Province is required", path: ["province"] });
    if (typeof data.yearsOfResidenceAddress !== 'number' || data.yearsOfResidenceAddress < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Years of residence at address is required", path: ["yearsOfResidenceAddress"] });
    if (typeof data.monthsOfResidenceAddress !== 'number' || data.monthsOfResidenceAddress < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Months of residence at address is required", path: ["monthsOfResidenceAddress"] });
    if (typeof data.yearsOfResidenceMunicipality !== 'number' || data.yearsOfResidenceMunicipality < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Years of residence in municipality is required", path: ["yearsOfResidenceMunicipality"] });
    if (typeof data.monthsOfResidenceMunicipality !== 'number' || data.monthsOfResidenceMunicipality < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Months of residence in municipality is required", path: ["monthsOfResidenceMunicipality"] });
    if (typeof data.yearsInCountry !== 'number' || data.yearsInCountry < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Years in country is required", path: ["yearsInCountry"] });
    
    if (!data.registrationType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration type is required.", path: ["registrationType"] });
    }
    if (!data.governmentIdFrontUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID Front Photo is required for registration", path: ["governmentIdFrontUrl"] });
    if (!data.governmentIdBackUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID Back Photo is required for registration", path: ["governmentIdBackUrl"] });
    if (!data.idSelfieUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selfie with ID is required for registration", path: ["idSelfieUrl"] });
  }
  
  // Transfer-specific validations
  if (applicationType === 'transfer') {
    if (!data.previousPrecinctNumber?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous precinct number is required", path: ["previousPrecinctNumber"] });
    if (!data.previousBarangay?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous barangay is required", path: ["previousBarangay"] });
    if (!data.previousCityMunicipality?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous city/municipality is required", path: ["previousCityMunicipality"] });
    if (!data.previousProvince?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous province is required", path: ["previousProvince"] });
    if (!data.transferType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Transfer type is required", path: ["transferType"] });
    // Also require current address fields
    if (!data.houseNumber?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "House number is required", path: ["houseNumber"] });
    if (!data.street?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street is required", path: ["street"] });
    if (!data.barangay?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Barangay is required", path: ["barangay"] });
    if (!data.cityMunicipality?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City/Municipality is required", path: ["cityMunicipality"] });
    if (!data.province?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Province is required", path: ["province"] });
  }
  
  // Reactivation-specific validations
  if (applicationType === 'reactivation') {
    if (!data.reasonForDeactivation) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason for deactivation is required", path: ["reasonForDeactivation"] });
    }
  }
  
  // Reinstatement-specific validations
  if (applicationType === 'reinstatement') {
    if (!data.reinstatementType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a reinstatement type.", path: ["reinstatementType"] });
    }
  }
  
  // Correction-specific validations
  if (applicationType === 'correction_of_entry') {
    if (!data.targetField) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Target field is required", path: ["targetField"] });
    if (!data.currentValue?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Current value is required", path: ["currentValue"] });
    if (!data.requestedValue?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requested value is required", path: ["requestedValue"] });
  }
  
  // Common validations for all application types
  if (data.civilStatus === 'Married' && !data.spouseName?.trim()) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spouse name is required if married", path: ["spouseName"] });
  }
  
  if (data.isIndigenousPerson && !data.tribe?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tribe Name is required if Indigenous Person is selected.", path: ["tribe"] });
  }

  if (data.isPwd && !data.typeOfDisability?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type of Disability is required if PWD is selected.", path: ["typeOfDisability"] });
  }
  
  // Declaration must always be accepted for any application type
  if (!data.declarationAccepted) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must accept the declaration to submit the application.", path: ["declarationAccepted"] });
  }
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;