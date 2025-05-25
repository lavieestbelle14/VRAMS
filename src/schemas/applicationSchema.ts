import { z } from 'zod';

const nonEmptyString = z.string().min(1, { message: "This field is required" });
const optionalString = z.string().optional();

export const applicationFormSchema = z.object({
  // Personal Info
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  middleName: optionalString,
  dob: nonEmptyString.refine(val => !isNaN(Date.parse(val)), { message: "Invalid date of birth" }),
  gender: z.enum(['male', 'female', 'other', ''], { errorMap: () => ({ message: "Please select a gender" }) }).refine(val => val !== '', { message: "Please select a gender"}),
  placeOfBirth: nonEmptyString,
  citizenship: nonEmptyString,
  contactNumber: optionalString.refine(val => !val || /^\+?[0-9\s-()]+$/.test(val), { message: "Invalid contact number format" }),
  email: optionalString.refine(val => !val || z.string().email().safeParse(val).success, { message: "Invalid email address" }),

  // Address Details
  houseNoStreet: nonEmptyString,
  barangay: nonEmptyString,
  cityMunicipality: nonEmptyString,
  province: nonEmptyString,
  zipCode: nonEmptyString.refine(val => /^[0-9]{4,5}$/.test(val), { message: "Invalid zip code" }),
  yearsOfResidency: z.coerce.number().min(0, "Years of residency cannot be negative").optional(),

  // Application Type
  applicationType: z.enum(['register', 'transfer', ''], { errorMap: () => ({ message: "Please select an application type" }) }).refine(val => val !== '', { message: "Please select an application type"}),

  // Transfer Address Details (conditional)
  transferHouseNoStreet: optionalString,
  transferBarangay: optionalString,
  transferCityMunicipality: optionalString,
  transferProvince: optionalString,
  transferZipCode: optionalString.refine(val => !val || /^[0-9]{4,5}$/.test(val), { message: "Invalid zip code" }),
  transferYearsOfResidency: z.coerce.number().min(0).optional(),

  // Biometrics
  biometricsFile: optionalString, // Simulating file upload, can be path or name

  // Civil Details
  civilStatus: z.enum(['single', 'married', 'widowed', 'separated', ''], { errorMap: () => ({ message: "Please select civil status" }) }).refine(val => val !== '', { message: "Please select civil status"}),
  spouseName: optionalString,
  fatherFirstName: nonEmptyString,
  fatherLastName: nonEmptyString,
  motherFirstName: nonEmptyString,
  motherLastName: nonEmptyString,

  // Special Needs
  isIlliterate: z.boolean().default(false),
  isSenior: z.boolean().default(false),
  isPwd: z.boolean().default(false),
  tribe: optionalString,
  disabilityType: optionalString,
  assistorName: optionalString,
  assistorAddress: optionalString,
  prefersGroundFloor: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.applicationType === 'transfer') {
    if (!data.transferHouseNoStreet) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for transfer", path: ["transferHouseNoStreet"] });
    if (!data.transferBarangay) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for transfer", path: ["transferBarangay"] });
    if (!data.transferCityMunicipality) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for transfer", path: ["transferCityMunicipality"] });
    if (!data.transferProvince) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for transfer", path: ["transferProvince"] });
    if (!data.transferZipCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for transfer", path: ["transferZipCode"] });
  }
  if (data.civilStatus === 'married' && !data.spouseName) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Spouse name is required if married", path: ["spouseName"] });
  }
  if (data.isPwd && !data.disabilityType) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Disability type is required if PWD", path: ["disabilityType"] });
  }
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
