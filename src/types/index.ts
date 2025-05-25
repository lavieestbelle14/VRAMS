
import type { ClassifyApplicantTypeOutput } from "@/ai/flows/classify-applicant-type";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string; // Should be ISO string date
  gender: 'male' | 'female' | 'other' | '';
  placeOfBirth: string;
  citizenship: string;
  contactNumber?: string;
  email?: string;
}

export interface AddressDetails {
  houseNoStreet: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipCode: string;
  yearsOfResidency?: number; // For current address
}

export interface CivilDetails {
  civilStatus: 'single' | 'married' | 'widowed' | 'separated' | '';
  spouseName?: string;
  fatherFirstName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherLastName: string;
}

export interface SpecialNeeds {
  isIlliterate: boolean;
  isSenior: boolean;
  isPwd: boolean;
  tribe?: string;
  disabilityType?: string;
  assistorName?: string;
  assistorAddress?: string;
  prefersGroundFloor: boolean;
}

export interface Application {
  id: string;
  personalInfo: PersonalInfo;
  addressDetails: AddressDetails;
  applicationType: 'register' | 'transfer' | '';
  oldAddressDetails?: AddressDetails; // For transfer type
  biometricsFile?: string; // Simulated file name or path
  civilDetails: CivilDetails;
  specialNeeds?: SpecialNeeds;
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  submissionDate: string; // ISO string date
  approvalDate?: string; // ISO string date
  voterId?: string;
  precinct?: string;
  classification?: ClassifyApplicantTypeOutput;
  remarks?: string;
}

// Combines all form fields into one type for react-hook-form
export type ApplicationFormData = PersonalInfo & AddressDetails & CivilDetails & SpecialNeeds & {
  applicationType: 'register' | 'transfer' | '';
  // Transfer specific fields are optional based on applicationType
  transferHouseNoStreet?: string;
  transferBarangay?: string;
  transferCityMunicipality?: string;
  transferProvince?: string;
  transferZipCode?: string;
  transferYearsOfResidency?: number;

  biometricsFile?: string; // For file upload simulation
};

