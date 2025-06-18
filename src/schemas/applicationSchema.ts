import { z } from 'zod';

const nonEmptyString = z.string().min(1, { message: "This field is required" });
const optionalString = z.string().optional();
const optionalNumber = z.number().optional();

// Note: This interface needs to be manually kept in sync with the Zod schema below.
export interface ApplicationFormSchema {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  sex: 'M' | 'F' | '';
  dob: string; // Should be ISO date string e.g., YYYY-MM-DD
  placeOfBirthCityMun: string; // Maps to place_of_birth_municipality in DB
  placeOfBirthProvince: string;
  citizenshipType: 'By Birth' | 'Naturalized' | 'Reacquired' | '';
  naturalizationDate?: string; // Should be ISO date string
  naturalizationCertNo?: string; // Maps to certificate_number in DB

  contactNumber?: string;
  email?: string; // Maps to email_address in DB

  // Address (Current - from AddressFields.tsx)
  houseNoStreet: string; // Maps to house_number and street in DB (server-side parsing needed)
  barangay: string;
  cityMunicipality: string;
  province: string;
  yearsOfResidency?: number; // Contextual for current address, not directly in DB's address_at_registration
  monthsOfResidency?: number; // Contextual for current address, not directly in DB's address_at_registration

  // Residency (General - from ResidencyFields.tsx)
  residencyYearsCityMun?: number; // Maps to years_of_residence_municipality in DB
  residencyMonthsCityMun?: number; // Maps to months_of_residence_municipality in DB
  residencyYearsPhilippines?: number; // Maps to years_in_country in DB

  professionOccupation?: string;

  // Civil Status & Parents (from CivilStatusFields.tsx)
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Legally Separated' | '';
  spouseName?: string;
  fatherFirstName: string; // Part of father_name in DB
  fatherLastName: string;  // Part of father_name in DB
  motherFirstName: string; // Part of mother_maiden_name in DB
  motherLastName: string;  // Part of mother_maiden_name in DB (Maiden last name)

  // Special Needs / Assistance (from SpecialNeedsFields.tsx)
  isIlliterate: boolean;
  isSenior: boolean; // Maps to is_senior_citizen in DB
  isPwd?: boolean; // UI state, implies typeOfDisability if true
  isIndigenousPerson?: boolean; // UI state, implies tribe if true
  prefersGroundFloor?: boolean; // Maps to vote_on_ground_floor in DB
  indigenousTribe?: string; // Maps to tribe in DB
  disabilityType?: string; // Maps to type_of_disability in DB
  assistanceNeeded?: string; // Maps to assistance_needed in DB
  assistorName?: string;
  assistorRelationship?: string; // Not in DB applicant_special_sector

  // Application Type and Biometrics
  applicationType: 'register' | 'transfer' | 'reactivation' | 'transfer_with_reactivation' | 'correction_of_entry' | 'reinstatement' | '';
  biometricsFile?: string; // Placeholder

  // ID Verification (from IdVerificationFields.tsx)
  idFrontPhoto?: File; // Maps to government_id_front_url in DB
  idBackPhoto?: File; // Maps to government_id_back_url in DB
  selfieWithId?: File; // Maps to id_selfie_url in DB

  // Conditional Fields for Transfer (from TransferFields.tsx, TransferReactivationFields.tsx)
  // These are for the *previous* registration record
  previousPrecinctNumber?: string;
  previousBarangay?: string;
  previousCityMunicipality?: string;
  previousProvince?: string;
  previousForeignPost?: string; // New field
  previousCountry?: string; // New field
  transferDeclarantName?: string; // New field for transfer declaration
  transferDeclarantBirthDate?: string; // New field for transfer declaration (ISO date string)
  // These are for the *new* residence in a transfer - REMOVED, will use general address fields
  // transferNewHouseNo?: string; 
  // transferNewBarangay?: string;
  // transferNewCity?: string; 
  // transferNewProvince?: string;
  // transferYears?: number; 
  // transferMonths?: number; 
  transferType?: 'same-city' | 'different-city' | 'foreign-post' | 'transfer-within' | 'transfer-from' | 'transfer-foreign-post' | 'transfer-reactivation' | 'transfer-record'; // UI values, map to DB transfer_record.transfer_type

  // Reactivation (from ReactivationFields.tsx, TransferReactivationFields.tsx)
  reactivationReason?: 'sentenced' | 'convicted' | 'declared-insane' | 'failed-to-vote' | 'loss-citizenship' | 'exclusion' | 'failure-validate'; // UI values, map to DB reactivation_record.reason_for_deactivation
  // transferReactivationReason can use the same 'reactivationReason' field.

  // Correction of Entries (from ChangeCorrectionFields.tsx)
  correctionField?: 'Name' | 'Contact Number' | 'Email Address' | 'Spouse name' | 'Date of Birth' | 'Place of Birth' | "Father's Name" | "Mother's Maiden Name" | 'Other'; // UI values, map to DB correction_record.target_field
  presentData?: string; // Maps to current_value in DB
  newData?: string; // Maps to requested_value in DB

  // Inclusion/Reinstatement (from InclusionReinstatementFields.tsx)
  inclusionType?: 'inclusion' | 'reinstatement'; // UI values, map to DB reinstatement_record.reinstatement_type
  inclusionPrecinctNo?: string; // Contextual for UI

  // Oath and Declarations
  oathAccepted: boolean;
  declarationAccepted: boolean;
  registrationIntention?: 'Regular' | 'Katipunan ng Kabataan';
  regularRegistrationType?: 'registration' | 'transfer';
  regularVoterStatus?: 'not_registered' | 'registered_elsewhere';
  regularOathAccepted?: boolean;
  adultRegistrationConsent?: boolean; // <-- Added for Katipunan consent
}


export const applicationFormSchema = z.object({
  // Personal Information
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  middleName: optionalString,
  suffix: optionalString,

  sex: z.enum(["M", "F", ""], { errorMap: () => ({ message: "Please select a sex" }) }),
  dob: z.string().min(1, "Date of birth is required"), // Validate as date string
  placeOfBirthCityMun: nonEmptyString,
  placeOfBirthProvince: nonEmptyString,
  citizenshipType: z.enum(["By Birth", "Naturalized", "Reacquired", ""], { errorMap: () => ({ message: "Please select a citizenship type" }) }),
  naturalizationDate: optionalString, // Validate as date string if present
  naturalizationCertNo: optionalString,

  contactNumber: optionalString,
  email: z.string().email({ message: "Invalid email address" }).optional(),

  // Address (Current - from AddressFields.tsx)
  houseNoStreet: nonEmptyString,
  barangay: nonEmptyString,
  cityMunicipality: nonEmptyString,
  province: nonEmptyString,
  yearsOfResidency: optionalNumber,
  monthsOfResidency: optionalNumber,

  // Residency (General - from ResidencyFields.tsx)
  residencyYearsCityMun: optionalNumber,
  residencyMonthsCityMun: optionalNumber,
  residencyYearsPhilippines: optionalNumber,

  professionOccupation: optionalString,

  // Civil Status & Parents (from CivilStatusFields.tsx)
  civilStatus: z.enum(["Single", "Married", "Widowed", "Legally Separated", ""], { errorMap: () => ({ message: "Please select a civil status" }) }),
  spouseName: optionalString,
  fatherFirstName: nonEmptyString,
  fatherLastName: nonEmptyString,
  motherFirstName: nonEmptyString,
  motherLastName: nonEmptyString, // Maiden Last Name

  // Special Needs / Assistance (from SpecialNeedsFields.tsx)
  isIlliterate: z.boolean().default(false),
  isSenior: z.boolean().default(false),
  isPwd: z.boolean().default(false),
  isIndigenousPerson: z.boolean().default(false),
  prefersGroundFloor: z.boolean().default(false),
  indigenousTribe: optionalString,
  disabilityType: optionalString,
  assistanceNeeded: optionalString, // Not in DB schema, but in UI
  assistorName: optionalString,
  assistorRelationship: optionalString, // Not in DB schema, but in UI

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
  
  biometricsFile: optionalString, // Placeholder

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
  previousPrecinctNumber: optionalString,
  previousBarangay: optionalString,
  previousCityMunicipality: optionalString,
  previousProvince: optionalString,
  previousForeignPost: optionalString, // New field
  previousCountry: optionalString, // New field
  transferDeclarantName: optionalString, // New field
  transferDeclarantBirthDate: optionalString, // New field, validate as date string if present

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
  presentData: optionalString, // Maps to current_value in DB
  newData: optionalString, // Maps to requested_value in DB

  // Inclusion/Reinstatement (from InclusionReinstatementFields.tsx)
  // DB: reinstatement_record.reinstatement_type has specific text values.
  inclusionType: z.enum(['inclusion', 'reinstatement']).optional(),
  inclusionPrecinctNo: optionalString, // Contextual for UI

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

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;