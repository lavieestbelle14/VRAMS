
import { z } from 'zod';

const nonEmptyString = z.string().min(1, { message: "This field is required" });
const optionalString = z.string().optional();
const numericString = z.string().regex(/^\d+$/, "Must be a number").optional();

export const applicationFormSchema = z.object({
  // Part 1: Personal Information
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  middleName: optionalString,

  sex: z.enum(['male', 'female', ''], { errorMap: () => ({ message: "Please select sex" }) }).refine(val => val !== '', { message: "Please select sex"}),
  dob: nonEmptyString.refine(val => !isNaN(Date.parse(val)), { message: "Invalid date of birth" }),
  placeOfBirthCityMun: nonEmptyString,
  placeOfBirthProvince: nonEmptyString,

  citizenshipType: z.enum(['byBirth', 'naturalized', 'reacquired', ''], { errorMap: () => ({message: "Select citizenship basis"})}).refine(val => val !== '', {message: "Select citizenship basis"}),
  naturalizationDate: optionalString, // Date string
  naturalizationCertNo: optionalString,
  
  // Residence/Address (Current)
  houseNoStreet: nonEmptyString,
  barangay: nonEmptyString,
  cityMunicipality: nonEmptyString,
  province: nonEmptyString,
  zipCode: nonEmptyString.refine(val => /^[0-9]{4,5}$/.test(val), { message: "Invalid zip code" }),
  yearsOfResidency: z.coerce.number().min(0, "Years cannot be negative").optional(), // For current address
  monthsOfResidency: z.coerce.number().min(0).max(11).optional(), // For current address

  // Period of Residence (General)
  residencyYearsCityMun: z.coerce.number().min(0).optional(), // In current City/Municipality
  residencyMonthsCityMun: z.coerce.number().min(0).max(11).optional(), // In current City/Municipality
  residencyYearsPhilippines: z.coerce.number().min(0).optional(), // In Philippines

  professionOccupation: optionalString,
  tin: optionalString.refine(val => !val || /^[0-9-]+$/.test(val), { message: "Invalid TIN format" }),

  civilStatus: z.enum(['single', 'married', ''], { errorMap: () => ({ message: "Please select civil status" }) }).refine(val => val !== '', { message: "Please select civil status"}),
  spouseName: optionalString, // Required if civilStatus is 'married'

  // Parent Information (Simplified as per current structure, CEF-1 does not ask for middle names of parents)
  fatherFirstName: nonEmptyString,
  fatherLastName: nonEmptyString,
  motherFirstName: nonEmptyString,
  motherLastName: nonEmptyString, // Typically maiden name

  // Special Needs / Assistance
  isIlliterate: z.boolean().default(false),
  isPwd: z.boolean().default(false), // Person with Disability
  isIndigenousPerson: z.boolean().default(false),
  disabilityType: optionalString, // Required if isPwd is true
  assistorName: optionalString,
  assistorRelationship: optionalString, // New field
  assistorAddress: optionalString,
  prefersGroundFloor: z.boolean().default(false), // Maintained as common accessibility need
  isSenior: z.boolean().default(false), // Maintained

  // Application Type and Biometrics
  applicationType: z.enum(['register', 'transfer', 'reactivation', 'changeCorrection', 'inclusionReinstatement', ''], { errorMap: () => ({ message: "Please select an application type" }) }).refine(val => val !== '', { message: "Please select an application type"}),
  biometricsFile: optionalString, // Simulating file upload/capture status

  // Conditional Fields for Transfer
  transferHouseNoStreet: optionalString,
  transferBarangay: optionalString,
  transferCityMunicipality: optionalString,
  transferProvince: optionalString,
  transferZipCode: optionalString.refine(val => !val || /^[0-9]{4,5}$/.test(val), { message: "Invalid zip code" }),
  // years/months at old address not explicitly on CEF-1 for transfer, but often asked. Current schema has transferYearsOfResidency
  // CEF-1 asks for years/months at *new* residence for transfer, which is covered by AddressDetails.yearsOfResidency/monthsOfResidency

  // Conditional Fields for Reactivation
  reactivationReasons: z.array(z.string()).optional().default([]), // For multi-select reasons
  reactivationEvidence: optionalString,

  // Conditional Fields for Change/Correction
  presentData: optionalString,
  newCorrectedData: optionalString,

  // Conditional fields for Inclusion/Reinstatement - can be simple for now, or share reasons with reactivation
  // For now, no specific extra fields for inclusionReinstatement beyond selecting the type.

}).superRefine((data, ctx) => {
  if (data.citizenshipType === 'naturalized' || data.citizenshipType === 'reacquired') {
    if (!data.naturalizationDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["naturalizationDate"] });
    if (!data.naturalizationCertNo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for naturalized/reacquired status", path: ["naturalizationCertNo"] });
  }
  if (data.civilStatus === 'married' && !data.spouseName) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spouse name is required if married", path: ["spouseName"] });
  }
  if (data.isPwd && !data.disabilityType) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Disability type is required if PWD", path: ["disabilityType"] });
  }
  if ((data.assistorName || data.assistorAddress) && !data.assistorRelationship) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Assistor relationship is required if assistor details are provided", path: ["assistorRelationship"]});
  }

  if (data.applicationType === 'transfer') {
    // CEF-1 implies old address info might be collected elsewhere or as part of "Accomplish Personal Information at the back"
    // For a digital form, explicit fields are better.
    if (!data.transferHouseNoStreet) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous House No./Street required for transfer", path: ["transferHouseNoStreet"] });
    if (!data.transferBarangay) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Barangay required for transfer", path: ["transferBarangay"] });
    if (!data.transferCityMunicipality) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous City/Municipality required for transfer", path: ["transferCityMunicipality"] });
    if (!data.transferProvince) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Province required for transfer", path: ["transferProvince"] });
    if (!data.transferZipCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous Zip Code required for transfer", path: ["transferZipCode"] });
  }

  if (data.applicationType === 'reactivation') {
    if (!data.reactivationReasons || data.reactivationReasons.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one reason for deactivation is required", path: ["reactivationReasons"] });
    }
    // Evidence might not always be mandatory initially, depends on policy.
  }

  if (data.applicationType === 'changeCorrection') {
    if (!data.presentData) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Present data/information is required", path: ["presentData"] });
    if (!data.newCorrectedData) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New/Corrected data/information is required", path: ["newCorrectedData"] });
  }
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
