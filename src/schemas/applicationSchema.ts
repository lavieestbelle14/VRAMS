import { z } from "zod";

export const applicationFormSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),

  sex: z.enum(["M", "F", ""], { errorMap: () => ({ message: "Please select a sex" }) }),
  dob: z.string().min(1, "Date of birth is required"), // Validate as date string
  placeOfBirthCityMun: z.string().min(1, "Required"),
  placeOfBirthProvince: z.string().min(1, "Required"),
  citizenshipType: z.enum(["By Birth", "Naturalized", "Reacquired", ""], { errorMap: () => ({ message: "Please select a citizenship type" }) }),
  naturalizationDate: z.string().optional(), // Validate as date string if present
  naturalizationCertNo: z.string().optional(),

  contactNumber: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),

  // Address (Current - from AddressFields.tsx)
  houseNoStreet: z.string().min(1, "Required"),
  barangay: z.string().min(1, "Required"),
  cityMunicipality: z.string().min(1, "Required"),
  province: z.string().min(1, "Required"),
  yearsOfResidency: z.number().optional(),
  monthsOfResidency: z.number().optional(),

  // Residency (General - from ResidencyFields.tsx)
  residencyYearsCityMun: z.number().optional(),
  residencyMonthsCityMun: z.number().optional(),
  residencyYearsPhilippines: z.number().optional(),

  professionOccupation: z.string().optional(),

  // Civil Status & Parents (from CivilStatusFields.tsx)
  civilStatus: z.enum(["Single", "Married", "Widowed", "Legally Separated", ""], { errorMap: () => ({ message: "Please select a civil status" }) }),
  spouseName: z.string().optional(),
  fatherFirstName: z.string().min(1, "Required"),
  fatherLastName: z.string().min(1, "Required"),
  motherFirstName: z.string().min(1, "Required"),
  motherLastName: z.string().min(1, "Required"), // Maiden Last Name

  // Special Needs / Assistance (from SpecialNeedsFields.tsx)
  isIlliterate: z.boolean().default(false),
  isSenior: z.boolean().default(false),
  isPwd: z.boolean().default(false),
  isIndigenousPerson: z.boolean().default(false),
  prefersGroundFloor: z.boolean().default(false),
  indigenousTribe: z.string().optional(),
  disabilityType: z.string().optional(),
  assistanceNeeded: z.string().optional(), // Not in DB schema, but in UI
  assistorName: z.string().optional(),
  assistorRelationship: z.string().optional(), // Not in DB schema, but in UI

  // Application Type and Biometrics
  applicationType: z.enum([
    'register',
    'transfer',
    'reactivation',
    'transfer_with_reactivation', // This is a conceptual type, maps to 'transfer' with reactivation details
    'correction_of_entry',
    'reinstatement',
    ''
  ], {
    errorMap: () => ({ message: "Please select an application type" })
  }).refine(val => val !== '', {
    message: "Please select an application type"
  }),
  
  biometricsFile: z.string().optional(), // Placeholder

  // ID Verification (from IdVerificationFields.tsx)
  idFrontPhoto: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024, "File size must be less than 5MB"
  ),
  idBackPhoto: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024, "File size must be less than 5MB"
  ),
  selfieWithId: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024, "File size must be less than 5MB"
  ),
  
  // Conditional Fields for Transfer (Original registration details)
  previousPrecinctNumber: z.string().optional(),
  previousBarangay: z.string().optional(),
  previousCityMunicipality: z.string().optional(),
  previousProvince: z.string().optional(),
  previousForeignPost: z.string().optional(), // New field
  previousCountry: z.string().optional(), // New field
  transferDeclarantName: z.string().optional(), // New field
  transferDeclarantBirthDate: z.string().optional(), // New field, validate as date string if present

  // New residence for Transfer (from TransferFields.tsx, TransferReactivationFields.tsx)
  // These fields will populate address_at_registration_or_transfer for transfer applications
  // REMOVED - general address fields (houseNoStreet, barangay, etc.) will be used.
  // transferNewHouseNo: optionalString,
  // transferNewBarangay: optionalString,
  // transferNewCity: optionalString,
  // transferNewProvince: optionalString,
  // transferYears: optionalNumber,
  // transferMonths: optionalNumber,
  
  // Transfer Type (from TransferFields.tsx, TransferReactivationFields.tsx)
  // DB: transfer_record.transfer_type has specific text values.
  transferType: z.enum([
    "same-city", "different-city", "foreign-post", // from TransferReactivationFields
    "transfer-within", "transfer-from", "transfer-foreign-post", // from TransferFields
    "transfer-reactivation", "transfer-record" // from ApplicationTypeFields logic
  ]).optional(),

  // Reactivation Reason (from ReactivationFields.tsx, TransferReactivationFields.tsx)
  // DB: reactivation_record.reason_for_deactivation has specific text values.
  reactivationReason: z.enum([
    "sentenced", "convicted", "declared-insane", 
    "failed-to-vote", "loss-citizenship", "exclusion", "failure-validate"
  ]).optional(),

  // Correction of Entries (from ChangeCorrectionFields.tsx)
  // DB: correction_record.target_field has specific text values.
  correctionField: z.enum([
    'Name', 'Contact Number', 'Email Address', 'Spouse name', 
    'Date of Birth', 'Place of Birth', "Father's Name", 
    "Mother's Maiden Name", 'Other'
  ]).optional(),
  presentData: z.string().optional(), // Maps to current_value in DB
  newData: z.string().optional(), // Maps to requested_value in DB

  // Inclusion/Reinstatement (from InclusionReinstatementFields.tsx)
  // DB: reinstatement_record.reinstatement_type has specific text values.
  inclusionType: z.enum(['inclusion', 'reinstatement']).optional(),
  inclusionPrecinctNo: z.string().optional(), // Contextual for UI

  // Oath and Declarations
  oathAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the oath to submit the application"
  }),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the declaration to submit the application."
  }),
  registrationIntention: z.enum(['Regular', 'Katipunan ng Kabataan']).optional(),
  regularRegistrationType: z.enum(['registration', 'transfer']).optional(),
  regularVoterStatus: z.enum(['not_registered', 'registered_elsewhere']).optional(),
  regularOathAccepted: z.boolean().optional(),
  adultRegistrationConsent: z.boolean().optional(), // <-- Added for Katipunan consent
}).superRefine((data, ctx) => {
  if (data.applicationType === 'register' && !data.registrationIntention) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration intention is required for new registrations", path: ["registrationIntention"] });
  }
  
  if (data.registrationIntention === 'Regular' && (data.applicationType === 'register' || data.applicationType === 'transfer')) {
    if (!data.regularOathAccepted) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must accept the oath to proceed", path: ["regularOathAccepted"] });
    if (!data.regularRegistrationType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select registration or transfer", path: ["regularRegistrationType"] });
    if (!data.regularVoterStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select your voter status", path: ["regularVoterStatus"] });
  }
  
  if (data.registrationIntention === 'Katipunan ng Kabataan' && (data.applicationType === 'register' || data.applicationType === 'transfer')) {
    // Katipunan uses the main 'oathAccepted' field
    if (!data.oathAccepted) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must accept the Katipunan oath to proceed", path: ["oathAccepted"] });
    // Require explicit consent selection for adultRegistrationConsent
    if (typeof data.adultRegistrationConsent !== "boolean") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please indicate your consent for further processing at age 18.", path: ["adultRegistrationConsent"] });
    }
  }
  
  if (data.citizenshipType === 'Naturalized' || data.citizenshipType === 'Reacquired') {
    if (!data.naturalizationDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["naturalizationDate"] });
    if (!data.naturalizationCertNo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["naturalizationCertNo"] });
  }

  if (data.applicationType === 'correction_of_entry') {
    if (!data.correctionField) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a field to correct.", path: ["correctionField"] });
    if (!data.presentData) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Present data is required.", path: ["presentData"] });
    if (!data.newData) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New data is required.", path: ["newData"] });
  }

  if (data.civilStatus === 'Married' && !data.spouseName) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spouse name is required if married", path: ["spouseName"] });
  }

  if (data.applicationType === 'register') {
    if (!data.idFrontPhoto) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID Front Photo is required for registration", path: ["idFrontPhoto"] });
    // idBackPhoto might be optional depending on ID type, but good to have if available
    // if (!data.idBackPhoto) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID Back Photo is required for registration", path: ["idBackPhoto"] });
    if (!data.selfieWithId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selfie with ID is required for registration", path: ["selfieWithId"] });
  }

  const isTransfer = data.applicationType === 'transfer' || data.applicationType === 'transfer_with_reactivation';
  
  if (isTransfer) {
    // Previous registration details for transfer_record table
    if (!data.previousPrecinctNumber && data.transferType !== 'foreign-post' && data.transferType !== 'transfer-foreign-post') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Precinct Number required for local transfer", path: ["previousPrecinctNumber"] });
    }
    if (!data.previousBarangay && data.transferType !== 'foreign-post' && data.transferType !== 'transfer-foreign-post') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Barangay required for local transfer", path: ["previousBarangay"] });
    }
    if (!data.previousCityMunicipality && data.transferType !== 'foreign-post' && data.transferType !== 'transfer-foreign-post') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous City/Municipality required for local transfer", path: ["previousCityMunicipality"] });
    }
    if (!data.previousProvince && data.transferType !== 'foreign-post' && data.transferType !== 'transfer-foreign-post') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Province required for local transfer", path: ["previousProvince"] });
    }
    
    // Conditional requirement for foreign post details
    if ((data.transferType === 'foreign-post' || data.transferType === 'transfer-foreign-post') && !data.previousForeignPost) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Foreign Post required for foreign transfer", path: ["previousForeignPost"] });
    }
    if ((data.transferType === 'foreign-post' || data.transferType === 'transfer-foreign-post') && !data.previousCountry) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Country required for foreign transfer", path: ["previousCountry"] });
    }

    // New residence details for address_at_registration_or_transfer table
    // These will now use the general address fields: houseNoStreet, barangay, cityMunicipality, province, yearsOfResidency, monthsOfResidency
    if (!data.houseNoStreet) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "House No./Street required for transfer", path: ["houseNoStreet"] });
    if (!data.barangay) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Barangay required for transfer", path: ["barangay"] });
    if (!data.cityMunicipality) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City/Municipality required for transfer", path: ["cityMunicipality"] });
    if (!data.province) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Province required for transfer", path: ["province"] });
    if (data.yearsOfResidency === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Years at new residence required for transfer", path: ["yearsOfResidency"] });
    if (data.monthsOfResidency === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Months at new residence required for transfer", path: ["monthsOfResidency"] });
    
    if (!data.transferType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Transfer type is required", path: ["transferType"] });
    } else {
      // Declaration and previous registration details based on transferType
      if (data.transferType === "transfer-within" || data.transferType === "transfer-from") {
        if (!data.transferDeclarantName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Declarant name is required.", path: ["transferDeclarantName"] });
        if (!data.transferDeclarantBirthDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Declarant birth date is required.", path: ["transferDeclarantBirthDate"] });
        if (!data.previousPrecinctNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Precinct Number required for this transfer type", path: ["previousPrecinctNumber"] });
        if (!data.previousBarangay) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Barangay required for this transfer type", path: ["previousBarangay"] });
        if (!data.previousCityMunicipality) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous City/Municipality required for this transfer type", path: ["previousCityMunicipality"] });
        if (!data.previousProvince) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Province required for this transfer type", path: ["previousProvince"] });
      } else if (data.transferType === "transfer-foreign-post") {
        if (!data.transferDeclarantName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Declarant name is required.", path: ["transferDeclarantName"] });
        if (!data.transferDeclarantBirthDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Declarant birth date is required.", path: ["transferDeclarantBirthDate"] });
        if (!data.previousForeignPost) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Foreign Post required for this transfer type", path: ["previousForeignPost"] });
        if (!data.previousCountry) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Country required for this transfer type", path: ["previousCountry"] });
      }
    }
  }

  if (data.applicationType === 'transfer_with_reactivation' || data.applicationType === 'reactivation') {
    if (!data.reactivationReason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason for reactivation is required", path: ["reactivationReason"] });
  }
  
  if (data.applicationType === 'reinstatement') {
    if (!data.inclusionType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Inclusion/Reinstatement type is required", path: ["inclusionType"] });
    if (!data.inclusionPrecinctNo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Precinct number for inclusion/reinstatement is required", path: ["inclusionPrecinctNo"] });
  }

  // Ensure that if PWD or Indigenous Person is checked, the respective detail field is filled.
  if (data.isPwd && !data.disabilityType) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Type of Disability is required if PWD is selected.", path: ["disabilityType"] });
  }
  if (data.isIndigenousPerson && !data.indigenousTribe) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tribe Name is required if Indigenous Person is selected.", path: ["indigenousTribe"] });
  }
  if (data.assistorName && !data.assistorRelationship) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Assistor's Relationship is required if Assistor's Name is provided.", path: ["assistorRelationship"] });
  }

});

// ✅ Use Zod's inference for the type
export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;