import { z } from 'zod';

const nonEmptyString = z.string().min(1, { message: "This field is required" });
const optionalString = z.string().optional();

export interface Address {
  houseNoStreet: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipCode: string;
}

export interface TransferAddress {
  transferHouseNoStreet?: string;
  transferBarangay?: string;
  transferCityMunicipality?: string;
  transferProvince?: string;
  transferZipCode?: string;
}

export interface ParentInformation {
  fatherFirstName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherLastName: string;
}

export interface SpecialNeeds {
  isIlliterate: boolean;
  isPwd: boolean;
  isIndigenousPerson: boolean;
  indigenousTribe?: string;
  disabilityType?: string;
  assistorName?: string;
  assistorRelationship?: string;
  assistorAddress?: string;
  prefersGroundFloor: boolean;
  isSenior: boolean;
}

export interface ApplicationTypeAndBiometrics {
  applicationType: 'register' | 'transfer' | '';
  
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
  sex: 'male' | 'female' | '';
  dob: string;
  placeOfBirthCityMun: string;
  placeOfBirthProvince: string;
  citizenshipType: 'byBirth' | 'naturalized' | 'reacquired' | '';
  naturalizationDate?: string;
  naturalizationCertNo?: string;

  yearsOfResidency?: number;
  monthsOfResidency?: number;

  residencyYearsCityMun?: number;
  residencyMonthsCityMun?: number;
  residencyYearsPhilippines?: number;

  professionOccupation?: string;
  tin?: string;

  civilStatus: 'single' | 'married' | '';
  spouseName?: string;
}

export const applicationFormSchema = z.object({
  registrationIntention: z.enum(['regular', 'katipunan']).optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),

  sex: z.enum(["male", "female", ""], {
    errorMap: () => ({ message: "Please select a sex" })
  }),
  dob: z.string(),
  placeOfBirthCityMun: z.string(),
  placeOfBirthProvince: z.string(),
  citizenshipType: z.enum(["byBirth", "naturalized", "reacquired", ""], {
    errorMap: () => ({ message: "Please select a citizenship type" })
  }),
  naturalizationDate: z.string().optional(),
  naturalizationCertNo: z.string().optional(),

  contactNumber: z.string().optional(),
  email: z.string().optional(),

  // Residence/Address (Current)
  houseNoStreet: nonEmptyString,
  barangay: nonEmptyString,
  cityMunicipality: nonEmptyString,
  province: nonEmptyString,
  zipCode: nonEmptyString,
  yearsOfResidency: z.number().optional(),
  monthsOfResidency: z.number().optional(),

  // Period of Residence (General)
  residencyYearsCityMun: z.number().optional(),
  residencyMonthsCityMun: z.number().optional(),
  residencyYearsPhilippines: z.number().optional(),

  professionOccupation: z.string().optional(),
  tin: z.string().optional(),

  civilStatus: z.enum(["single", "married", ""], {
    errorMap: () => ({ message: "Please select a civil status" })
  }),
  spouseName: z.string().optional(),

  // Parent Information
  fatherFirstName: nonEmptyString,
  fatherLastName: nonEmptyString,
  motherFirstName: nonEmptyString,
  motherLastName: nonEmptyString, 

  // Special Needs / Assistance
  isIlliterate: z.boolean().default(false),
  isPwd: z.boolean().default(false),
  isIndigenousPerson: z.boolean().default(false),
  indigenousTribe: optionalString,
  disabilityType: optionalString,  assistorName: optionalString,
  assistorRelationship: optionalString, 
  assistorAddress: optionalString,
  prefersGroundFloor: z.boolean().default(false),
  isSenior: z.boolean().default(false), 

  // Application Type and Biometrics
  applicationType: z.enum([
    'register',
    'transfer',
    'reactivation',
    'change-correction',
    'inclusion-reinstatement',
    ''
  ], {
    errorMap: () => ({ message: "Please select an application type" })
  }).refine(val => val !== '', {
    message: "Please select an application type"
  }),

  transferType: z.enum(['transfer-record', 'transfer-reactivation']).optional(),
  inclusionType: z.enum(['inclusion', 'reinstatement', '']).optional(),  
  biometricsFile: optionalString, 

  transferLocationType: z.enum(['same-city', 'different-city']).optional(),
  transfer_reactivation_civilStatus: z.enum(['single', 'married', 'widowed', 'legally-separated']).optional(),
  // ID Verification (Required for Registration)
  idFrontPhoto: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ),
  idBackPhoto: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ),
  selfieWithId: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ),
  // Conditional Fields for Transfer
  transferHouseNoStreet: z.string().optional(),
  transferBarangay: z.string().optional(),
  transferCityMunicipality: z.string().optional(),
  transferProvince: z.string().optional(),
  transferZipCode: z.string().optional(),

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
  presentData: z.string().optional(),
  newData: z.string().optional(),

}).superRefine((data, ctx) => {
  if (data.citizenshipType === 'naturalized' || data.citizenshipType === 'reacquired') {
    if (!data.naturalizationDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["naturalizationDate"] });
    if (!data.naturalizationCertNo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["naturalizationCertNo"] });
  }
  if (data.applicationType === 'change-correction') {
    if (!data.correctionField) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a field to correct.", path: ["correctionField"] });
    }
    if (!data.presentData) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Present data is required.", path: ["presentData"] });
    }
    if (!data.newData) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New data is required.", path: ["newData"] });
    }
  } if (data.isIndigenousPerson && !data.indigenousTribe) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tribe name is required.", path: ["indigenousTribe"] });
  }
  if (data.assistorName && !data.assistorRelationship) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Assistor relationship is required if assistor name is provided", path: ["assistorRelationship"]});
  }
  if (data.civilStatus === 'married' && !data.spouseName) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spouse name is required if married", path: ["spouseName"] });
  }
  if (data.isPwd && !data.disabilityType) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for PWD", path: ["disabilityType"] });
  }
  if (data.applicationType === 'register') {
    if (!data.idFrontPhoto) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Front photo of ID is required for registration", 
        path: ["idFrontPhoto"] 
      });
    }
    if (!data.idBackPhoto) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Back photo of ID is required for registration", 
        path: ["idBackPhoto"] 
      });
    }
    if (!data.selfieWithId) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Selfie with ID is required for registration", 
        path: ["selfieWithId"] 
      });
    }
  }
  if (data.applicationType === 'transfer') {
    if (!data.transferHouseNoStreet) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous House No./Street required for transfer", path: ["transferHouseNoStreet"] });
    if (!data.transferBarangay) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Barangay required for transfer", path: ["transferBarangay"] });
    if (!data.transferCityMunicipality) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous City/Municipality required for transfer", path: ["transferCityMunicipality"] });
    if (!data.transferProvince) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Province required for transfer", path: ["transferProvince"] });
    if (!data.transferZipCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Zip Code required for transfer", path: ["transferZipCode"] });
  }
});

export type ApplicationFormValues = {
  registrationIntention?: 'regular' | 'katipunan' | undefined;
  firstName: string;
  lastName: string;
}