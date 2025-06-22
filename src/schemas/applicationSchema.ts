import { z } from "zod";

// This schema is designed to align with the supabase/businessSchema.sql
// You will need to update your form components to use these field names and enum values.
export const applicationFormSchema = z.object({
  // --- applicant table ---
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  citizenshipType: z.enum(["By Birth", "Naturalized", "Reacquired"], { errorMap: () => ({ message: "Please select a citizenship type" }) }),
  dateOfNaturalization: z.string().optional(), // Corresponds to date_of_naturalization
  certificateNumber: z.string().optional(), // Corresponds to certificate_number
  professionOccupation: z.string().optional(),
  contactNumber: z.string().optional(),
  emailAddress: z.string().email({ message: "Invalid email address" }).or(z.literal("")).optional(), // Corresponds to email_address
  civilStatus: z.enum(["Single", "Married", "Widowed", "Legally Separated"], { errorMap: () => ({ message: "Please select a civil status" }) }),
  spouseName: z.string().optional(),
  sex: z.enum(["M", "F"]),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((val) => {
    const today = new Date();
    const birthDate = new Date(val);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 14;
  }, {
    message: "You must be at least 14 years old to register.",
  }), // Corresponds to date_of_birth
  placeOfBirthMunicipality: z.string().min(1, "Required"),
  placeOfBirthProvince: z.string().min(1, "Required"),
  fatherFirstName: z.string().min(1, "Father's first name is required"),
  fatherLastName: z.string().min(1, "Father's last name is required"),
  motherFirstName: z.string().min(1, "Mother's first name is required"),
  motherMaidenLastName: z.string().min(1, "Mother's maiden last name is required"),

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
  houseNumber: z.string().min(1, "Required"), // Split from houseNoStreet
  street: z.string().min(1, "Required"), // Split from houseNoStreet
  barangay: z.string().min(1, "Required"),
  cityMunicipality: z.string().min(1, "Required"),
  province: z.string().min(1, "Required"),
  yearsOfResidenceAddress: z.number().min(0, "Required"), // For address-level residency
  monthsOfResidenceAddress: z.number().min(0, "Required"), // For address-level residency
  yearsOfResidenceMunicipality: z.number().min(0, "Required"), // Corresponds to residencyYearsCityMun
  monthsOfResidenceMunicipality: z.number().min(0, "Required"), // Corresponds to residencyMonthsCityMun
  yearsInCountry: z.number().min(0, "Required"), // Corresponds to residencyYearsPhilippines

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
  // You will need to update this superRefine logic to use the new field names.
  // Example:
  if (data.civilStatus === 'Married' && !data.spouseName) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spouse name is required if married", path: ["spouseName"] });
  }

  if (data.applicationType === 'register') {
    if (!data.registrationType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration type is required.", path: ["registrationType"] });
    }
    if (!data.governmentIdFrontUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID Front Photo is required for registration", path: ["governmentIdFrontUrl"] });
    if (!data.governmentIdBackUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID Back Photo is required for registration", path: ["governmentIdBackUrl"] });
    if (!data.idSelfieUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selfie with ID is required for registration", path: ["idSelfieUrl"] });
  }
  
  if (data.isIndigenousPerson && !data.tribe) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tribe Name is required if Indigenous Person is selected.", path: ["tribe"] });
  }

  if (data.isPwd && !data.typeOfDisability) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type of Disability is required if PWD is selected.", path: ["typeOfDisability"] });
  }
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;