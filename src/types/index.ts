

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  sex: 'male' | 'female' | '';
  dob: string; // ISO string date yyyy-mm-dd
  placeOfBirthCityMun: string;
  placeOfBirthProvince: string;
  
  citizenshipType: 'byBirth' | 'naturalized' | 'reacquired' | '';
  naturalizationDate?: string; // Date string yyyy-mm-dd
  naturalizationCertNo?: string;

  contactNumber?: string; // Maintained from old
  email?: string; // Maintained from old
  
  residencyYearsCityMun?: number; // Period of residence in current City/Mun
  residencyMonthsCityMun?: number; // Period of residence in current City/Mun
  residencyYearsPhilippines?: number; // Period of residence in Philippines
  
  professionOccupation?: string;
  tin?: string;
}

export interface AddressDetails { // Represents current residence
  houseNoStreet: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipCode: string;
  yearsOfResidency?: number; // Years at this current/new address
  monthsOfResidency?: number; // Months at this current/new address
}

export interface CivilDetails {
  civilStatus: 'single' | 'married' | '';
  spouseName?: string; // Required if married
  fatherFirstName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherLastName: string; // Typically maiden name
}

export interface SpecialNeeds {
  isIlliterate: boolean;
  isPwd: boolean; // Person with Disability
  isIndigenousPerson: boolean;
  disabilityType?: string; // Required if isPwd
  
  assistorName?: string;
  assistorRelationship?: string; // New
  assistorAddress?: string;
  
  prefersGroundFloor: boolean; // Maintained
  isSenior: boolean; // Maintained
}

export interface Application {
  id: string;
  personalInfo: PersonalInfo;
  addressDetails: AddressDetails; // Current address
  civilDetails: CivilDetails;
  specialNeeds?: SpecialNeeds;
  
  applicationType: 'register' | 'transfer' | 'reactivation' | 'change-correction' | 'inclusion-reinstatement' | ''; // UPDATED
  biometricsFile?: string; // Simulated file name or path or "Captured"

  // Conditional based on applicationType
  oldAddressDetails?: AddressDetails; // For transfer applications (previous address)
  
  // Removed reactivation, change/correction, inclusion fields
  // reactivationReasons?: string[]; 
  // reactivationEvidence?: string; 
  // presentData?: string; 
  // newCorrectedData?: string; 
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  submissionDate: string; // ISO string date
  approvalDate?: string; // ISO string date
  voterId?: string;
  precinct?: string;
  // classification?: ClassifyApplicantTypeOutput;
  remarks?: string;
}

// Combines all form fields into one type for react-hook-form, matching schema
export type ApplicationFormData = PersonalInfo & AddressDetails & CivilDetails & SpecialNeeds & {
  applicationType: 'register' | 'transfer' | 'reactivation' | 'change-correction' | 'inclusion-reinstatement' | ''; // UPDATED
  biometricsFile?: string;

  // Transfer specific fields (previous address)
  transferHouseNoStreet?: string;
  transferBarangay?: string;
  transferCityMunicipality?: string;
  transferProvince?: string;
  transferZipCode?: string;

  // Removed reactivation, change/correction, inclusion fields
  // reactivationReasons?: string[];
  // reactivationEvidence?: string;
  // presentData?: string;
  // newCorrectedData?: string;
};
