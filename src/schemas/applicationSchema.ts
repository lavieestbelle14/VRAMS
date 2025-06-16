import { z } from 'zod';

const nonEmptyString = z.string().min(1, { message: "This field is required" });
const optionalString = z.string().optional();

export interface Address {
  houseNumber: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
}

export interface TransferAddress {
  previousPrecinctNumber?: string;
  previousBarangay?: string;
  previousCityMunicipality?: string;
  previousProvince?: string;
}

export interface ParentInformation {
  fatherName: string;
  motherMaidenName: string;
}

export interface SpecialNeeds {
  isIlliterate: boolean;
  isSeniorCitizen: boolean;
  tribe?: string;
  typeOfDisability?: string;
  assistanceNeeded?: string;
  assistorName?: string;
  voteOnGroundFloor: boolean;
}

export interface ApplicationTypeAndBiometrics {
  applicationType: 'register' | 'transfer' | 'reactivation' | 'transfer_with_reactivation' | 'correction_of_entry' | 'reinstatement' | '';
  biometricsFile?: string;
}

export interface Oath {
  oathAccepted: boolean;
}

export interface ApplicationFormSchema
  extends Address,
    TransferAddress,
    ParentInformation,
    SpecialNeeds,
    ApplicationTypeAndBiometrics,
    Oath {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  sex: 'M' | 'F' | '';
  dob: string;
  placeOfBirthMunicipality: string;
  placeOfBirthProvince: string;
  citizenshipType: 'By Birth' | 'Naturalized' | 'Reacquired' | '';
  dateOfNaturalization?: string;
  certificateNumber?: string;

  yearsInCountry?: number;
  yearsOfResidenceMunicipality?: number;
  monthsOfResidenceMunicipality?: number;

  professionOccupation?: string;

  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Legally Separated' | '';
  spouseName?: string;
}

export const applicationFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),

  sex: z.enum(["M", "F", ""], {
    errorMap: () => ({ message: "Please select a sex" })
  }),
  dob: z.string(),
  placeOfBirthMunicipality: z.string(),
  placeOfBirthProvince: z.string(),
  citizenshipType: z.enum(["By Birth", "Naturalized", "Reacquired", ""], {
    errorMap: () => ({ message: "Please select a citizenship type" })
  }),
  dateOfNaturalization: z.string().optional(),
  certificateNumber: z.string().optional(),

  contactNumber: z.string().optional(),
  email: z.string().optional(),

  // Residence/Address (Current)
  houseNumber: nonEmptyString,
  street: nonEmptyString,
  barangay: nonEmptyString,
  cityMunicipality: nonEmptyString,
  province: nonEmptyString,
  
  yearsOfResidenceMunicipality: z.number().optional(),
  monthsOfResidenceMunicipality: z.number().optional(),
  yearsInCountry: z.number().optional(),

  professionOccupation: z.string().optional(),

  civilStatus: z.enum(["Single", "Married", "Widowed", "Legally Separated", ""], {
    errorMap: () => ({ message: "Please select a civil status" })
  }),
  spouseName: z.string().optional(),

  // Parent Information
  fatherName: nonEmptyString,
  motherMaidenName: nonEmptyString,

  // Special Needs / Assistance
  isIlliterate: z.boolean().default(false),
  isSeniorCitizen: z.boolean().default(false),
  tribe: optionalString,
  typeOfDisability: optionalString,
  assistanceNeeded: optionalString,
  assistorName: optionalString,
  voteOnGroundFloor: z.boolean().default(false),

  // Application Type and Biometrics
  applicationType: z.enum([
    'register',
    'transfer',
    'reactivation',
    'transfer_with_reactivation',
    'correction_of_entry',
    'reinstatement',
    ''
  ], {
    errorMap: () => ({ message: "Please select an application type" })
  }).refine(val => val !== '', {
    message: "Please select an application type"
  }),
  
  biometricsFile: optionalString, 

  // ID Verification (Required for Registration)
  governmentIdUrl: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ),
  idSelfieUrl: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ),
  // Conditional Fields for Transfer
  previousPrecinctNumber: z.string().optional(),
  previousBarangay: z.string().optional(),
  previousCityMunicipality: z.string().optional(),
  previousProvince: z.string().optional(),

  // Part 2: Oath
  oathAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the oath to submit the application"
  }),

  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the declaration to submit the application."
  }),

  correctionField: z.enum([
    'Name',
    'Contact Number',
    'Email Address',
    'Spouse name',
    'Date of Birth',
    'Place of Birth',
    'Father\'s Name',
    'Mother\'s Maiden Name',
    'Other'
  ]).optional(),
  currentValue: z.string().optional(),
  requestedValue: z.string().optional(),

  // Registration Intention (only for register application type)
  registrationIntention: z.enum(['Regular', 'Katipunan ng Kabataan']).optional(),

  // Regular Oath Fields
  regularRegistrationType: z.enum(['registration', 'transfer']).optional(),
  regularVoterStatus: z.enum(['not_registered', 'registered_elsewhere']).optional(),
  regularOathAccepted: z.boolean().optional(),

}).superRefine((data, ctx) => {
  // Registration intention is required for register application type
  if (data.applicationType === 'register' && !data.registrationIntention) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "Registration intention is required for new registrations", 
      path: ["registrationIntention"] 
    });
  }
  
  // Regular oath validation
  if (data.registrationIntention === 'Regular' && (data.applicationType === 'register' || data.applicationType === 'transfer')) {
    if (!data.regularOathAccepted) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "You must accept the oath to proceed", 
        path: ["regularOathAccepted"] 
      });
    }
    if (!data.regularRegistrationType) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Please select registration or transfer", 
        path: ["regularRegistrationType"] 
      });
    }
    if (!data.regularVoterStatus) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Please select your voter status", 
        path: ["regularVoterStatus"] 
      });
    }
  }
  
  // Katipunan oath validation
  if (data.registrationIntention === 'Katipunan ng Kabataan' && (data.applicationType === 'register' || data.applicationType === 'transfer')) {
    if (!data.oathAccepted) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "You must accept the oath to proceed", 
        path: ["oathAccepted"] 
      });
    }
  }
  
  if (data.citizenshipType === 'Naturalized' || data.citizenshipType === 'Reacquired') {
    if (!data.dateOfNaturalization) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["dateOfNaturalization"] });
    if (!data.certificateNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["certificateNumber"] });
  }
  if (data.applicationType === 'correction_of_entry') {
    if (!data.correctionField) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a field to correct.", path: ["correctionField"] });
    }
    if (!data.currentValue) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Present data is required.", path: ["currentValue"] });
    }
    if (!data.requestedValue) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New data is required.", path: ["requestedValue"] });
    }
  }
  if (data.civilStatus === 'Married' && !data.spouseName) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spouse name is required if married", path: ["spouseName"] });
  }
  if (data.applicationType === 'register') {
    if (!data.governmentIdUrl) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Government ID photo is required for registration", 
        path: ["governmentIdUrl"] 
      });
    }
    if (!data.idSelfieUrl) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Selfie with ID is required for registration", 
        path: ["idSelfieUrl"] 
      });
    }
  }
  if (data.applicationType === 'transfer' || data.applicationType === 'transfer_with_reactivation') {
    if (!data.previousPrecinctNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Precinct Number required for transfer", path: ["previousPrecinctNumber"] });
    if (!data.previousBarangay) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Barangay required for transfer", path: ["previousBarangay"] });
    if (!data.previousCityMunicipality) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous City/Municipality required for transfer", path: ["previousCityMunicipality"] });
    if (!data.previousProvince) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Province required for transfer", path: ["previousProvince"] });
  }
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;