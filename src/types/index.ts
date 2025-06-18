export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  sex: 'M' | 'F' | '';
  dob: string; // ISO string date yyyy-mm-dd
  placeOfBirthCityMun: string;
  placeOfBirthProvince: string;
  
  citizenshipType: 'By Birth' | 'Naturalized' | 'Reacquired' | '';
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
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Legally Separated' | '';
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
  
  applicationType: 'register' | 'transfer' | 'reactivation' | 'transfer_with_reactivation' | 'correction_of_entry' | 'reinstatement' | ''; // UPDATED
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
  applicationType: 'register' | 'transfer' | 'reactivation' | 'transfer_with_reactivation' | 'correction_of_entry' | 'reinstatement' | '';
  biometricsFile?: string;

  // Transfer specific fields (previous address)
  transferHouseNoStreet?: string;
  transferBarangay?: string;
  transferCityMunicipality?: string;
  transferProvince?: string;
  transferZipCode?: string;

  // Additional fields for schema compatibility
  registrationIntention?: 'Regular' | 'Katipunan ng Kabataan';
  regularOathAccepted?: boolean;
  regularRegistrationType?: 'registration' | 'transfer';
  regularVoterStatus?: 'not_registered' | 'registered_elsewhere';
  oathAccepted?: boolean;
  declarationAccepted?: boolean;
  adultRegistrationConsent?: boolean;

  // ID Verification
  idFrontPhoto?: File;
  idBackPhoto?: File;
  selfieWithId?: File;

  // Transfer/Reactivate/Correction/Inclusion fields
  previousPrecinctNumber?: string;
  previousBarangay?: string;
  previousCityMunicipality?: string;
  previousProvince?: string;
  previousForeignPost?: string;
  previousCountry?: string;
  transferDeclarantName?: string;
  transferDeclarantBirthDate?: string;
  transferType?: string;
  reactivationReason?: string;
  correctionField?: string;
  presentData?: string;
  newData?: string;
  inclusionType?: 'inclusion' | 'reinstatement';
  inclusionPrecinctNo?: string;
};

