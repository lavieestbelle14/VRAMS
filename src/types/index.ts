// Types aligned with supabase/businessSchema.sql

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  citizenshipType: 'By Birth' | 'Naturalized' | 'Reacquired';
  dateOfNaturalization?: string; // date_of_naturalization
  certificateNumber?: string; // certificate_number
  professionOccupation?: string; // profession_occupation
  contactNumber?: string; // contact_number
  emailAddress?: string; // email_address
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Legally Separated';
  spouseName?: string; // spouse_name
  sex: 'M' | 'F';
  dateOfBirth: string; // date_of_birth
  placeOfBirthMunicipality: string; // place_of_birth_municipality
  placeOfBirthProvince: string; // place_of_birth_province
  fatherName: string; // father_name
  motherMaidenName: string; // mother_maiden_name
}

export interface AddressDetails {
  houseNumberStreet: string; // house_number_street
  barangay: string;
  cityMunicipality: string; // city_municipality
  province: string;
  monthsOfResidenceAddress: number; // months_of_residence_address
  yearsOfResidenceAddress: number; // years_of_residence_address
  monthsOfResidenceMunicipality: number; // months_of_residence_municipality
  yearsOfResidenceMunicipality: number; // years_of_residence_municipality
  yearsInCountry: number; // years_in_country
}

export interface SpecialSector {
  isIlliterate: boolean; // is_illiterate
  isSeniorCitizen: boolean; // is_senior_citizen
  tribe?: string; // tribe (for indigenous persons)
  typeOfDisability?: string; // type_of_disability
  assistanceNeeded?: string; // assistance_needed
  assistorName?: string; // assistor_name
  voteOnGroundFloor?: boolean; // vote_on_ground_floor
}

export interface ApplicationRegistration {
  registrationType: 'Katipunan ng Kabataan' | 'Regular'; // registration_type
  adultRegistrationConsent?: boolean; // adult_registration_consent
  governmentIdFrontUrl: string; // government_id_front_url
  governmentIdBackUrl: string; // government_id_back_url
  idSelfieUrl: string; // id_selfie_url
}

export interface ApplicationTransfer {
  previousPrecinctNumber?: string; // previous_precinct_number
  previousBarangay?: string; // previous_barangay
  previousCityMunicipality?: string; // previous_city_municipality
  previousProvince?: string; // previous_province
  previousForeignPost?: string; // previous_foreign_post
  previousCountry?: string; // previous_country
  transferType: 'Within the same City/Municipality/District.' | 
               'From another City/Municipality/District.' |
               'From foreign post to local CEO other than original place of registration.'; // transfer_type
}

export interface ApplicationReactivation {
  reasonForDeactivation: 'Sentenced by final judgment to suffer imprisonment for not less than one (1) year' |
                        'Convicted by final judgment of a crime involving disloyalty to the duly constituted government, etc;' |
                        'Declared by competent authority to be insane or incompetent;' |
                        'Failed to vote in two (2) successive preceding regular elections;' |
                        'Loss of Filipino citizenship;' |
                        'Exclusion by a court order; or' |
                        'Failure to Validate'; // reason_for_deactivation
}

export interface ApplicationCorrection {
  targetField: 'Name' | 'Contact Number' | 'Email Address' | 'Spouse name' |
              'Date of Birth' | 'Place of Birth' | "Father's Name" |
              "Mother's Maiden Name" | 'Other'; // target_field
  requestedValue: string; // requested_value
  currentValue: string; // current_value
}

export interface ApplicationReinstatement {
  reinstatementType: 'Reinstatement of records due to transfer from foreign post to same local City/Municipality/District.' |
                    'Inclusion of VRR in the precinct book of voters.' |
                    'Reinstatement of the name of the registered voter which has been omitted in the list of voters.'; // reinstatement_type
}

export interface DocumentInfo {
  name: string;
  url: string;
  type: 'government_id_front' | 'government_id_back' | 'id_selfie';
  uploadDate?: string;
}

// Main Application interface reflecting the database structure
export interface Application {
  // From application table
  applicationNumber?: number; // application_number (internal)
  id: string; // public_facing_id
  applicantId?: number; // applicant_id (internal)
  applicationType: 'register' | 'transfer' | 'reactivation' | 'transfer_with_reactivation' | 'correction_of_entry' | 'reinstatement'; // application_type
  applicationDate: string; // application_date
  processingDate?: string; // processing_date
  status: 'pending' | 'verified' | 'approved' | 'disapproved'; // status
  reasonForDisapproval?: string; // reason_for_disapproval
  erbHearingDate?: string; // erb_hearing_date
  remarks?: string; // remarks

  // Related data
  personalInfo: PersonalInfo; // from applicant table
  addressDetails?: AddressDetails; // from application_declared_address table
  specialSector?: SpecialSector; // from applicant_special_sector table
  
  // Application type specific data
  registration?: ApplicationRegistration; // from application_registration table
  transfer?: ApplicationTransfer; // from application_transfer table
  reactivation?: ApplicationReactivation; // from application_reactivation table
  correction?: ApplicationCorrection; // from application_correction table
  reinstatement?: ApplicationReinstatement; // from application_reinstatement table

  // Documents (derived from registration)
  documents: DocumentInfo[];

  // Legacy fields for backward compatibility (can be removed later)
  submissionDate: string; // alias for applicationDate
  approvalDate?: string; // alias for processingDate
  voterId?: string;
  precinct?: string;

  // For UI display purposes
  addressInfo?: any; // temporary for compatibility
  civilDetails?: any; // temporary for compatibility
  specialNeeds?: any; // temporary for compatibility
  oldAddressDetails?: any; // temporary for compatibility
  biometricsFile?: string; // temporary for compatibility
}

// Form data type for creating applications (aligns with applicationSchema.ts)
export type ApplicationFormData = {
  // Personal Information (applicant table)
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  citizenshipType?: 'By Birth' | 'Naturalized' | 'Reacquired';
  dateOfNaturalization?: string;
  certificateNumber?: string;
  professionOccupation?: string;
  contactNumber?: string;
  emailAddress?: string;
  civilStatus?: 'Single' | 'Married' | 'Widowed' | 'Legally Separated';
  spouseName?: string;
  sex?: 'M' | 'F';
  dateOfBirth?: string;
  placeOfBirthMunicipality?: string;
  placeOfBirthProvince?: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  motherFirstName?: string;
  motherMaidenLastName?: string;

  // Special Sector (applicant_special_sector table)
  isIlliterate?: boolean;
  isSeniorCitizen?: boolean;
  tribe?: string;
  typeOfDisability?: string;
  assistanceNeeded?: string;
  assistorName?: string;
  voteOnGroundFloor?: boolean;

  // Application details
  applicationType?: 'register' | 'transfer' | 'reactivation' | 'transfer_with_reactivation' | 'correction_of_entry' | 'reinstatement';

  // Registration specific (application_registration table)
  registrationType?: 'Katipunan ng Kabataan' | 'Regular';
  adultRegistrationConsent?: boolean;
  governmentIdFrontUrl?: File;
  governmentIdBackUrl?: File;
  idSelfieUrl?: File;

  // Transfer specific (application_transfer table)
  previousPrecinctNumber?: string;
  previousBarangay?: string;
  previousCityMunicipality?: string;
  previousProvince?: string;
  previousForeignPost?: string;
  previousCountry?: string;
  transferType?: string;

  // Reactivation specific (application_reactivation table)
  reasonForDeactivation?: string;

  // Correction specific (application_correction table)
  targetField?: string;
  currentValue?: string;
  requestedValue?: string;

  // Reinstatement specific (application_reinstatement table)
  reinstatementType?: string;

  // Address details (application_declared_address table)
  houseNumber?: string;
  street?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  yearsOfResidenceAddress?: number;
  monthsOfResidenceAddress?: number;
  yearsOfResidenceMunicipality?: number;
  monthsOfResidenceMunicipality?: number;
  yearsInCountry?: number;

  // UI helper fields
  isPwd?: boolean;
  isIndigenousPerson?: boolean;
  declarationAccepted?: boolean;
  oathAccepted?: boolean;
};

