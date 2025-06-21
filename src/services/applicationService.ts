import { supabase } from '@/lib/supabase/client';
import { ApplicationFormValues } from '@/schemas/applicationSchema';

// We will need to export this from AuthContext.tsx
interface AuthenticatedUser {
  id: string;
  email: string;
  voterId?: string;
  precinct?: string;
  username: string;
  role: 'officer' | 'public';
}

// Helper function for securely uploading a file and getting its public URL
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) {
    console.error(`Error uploading to ${bucket}:`, error);
    throw new Error(`Failed to upload file to ${bucket}.`);
  }
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
};


export const submitApplication = async (data: ApplicationFormValues, user: AuthenticatedUser): Promise<string> => {
  let idFrontPhotoUrl: string | undefined;
  let idBackPhotoUrl: string | undefined;
  let selfieWithIdUrl: string | undefined;

  // Step 1: Handle File Uploads if it's a registration application
  if (data.applicationType === 'register') {
    if (data.governmentIdFrontUrl) {
      const path = `public/${user.id}-${data.governmentIdFrontUrl.name}-front`;
      idFrontPhotoUrl = await uploadFile(data.governmentIdFrontUrl, 'government-ids', path);
    }
    if (data.governmentIdBackUrl) {
        const path = `public/${user.id}-${data.governmentIdBackUrl.name}-back`;
        idBackPhotoUrl = await uploadFile(data.governmentIdBackUrl, 'government-ids', path);
    }
    if (data.idSelfieUrl) {
      const path = `public/${user.id}-${data.idSelfieUrl.name}-selfie`;
      selfieWithIdUrl = await uploadFile(data.idSelfieUrl, 'id-selfie', path);
    }
  }

  // Step 2: Insert core applicant details and get the new applicant_id
  const { data: applicantData, error: applicantError } = await supabase
    .from('applicant')
    .insert({
      auth_id: user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      middle_name: data.middleName,
      suffix: data.suffix,
      citizenship_type: data.citizenshipType,
      date_of_naturalization: data.dateOfNaturalization,
      certificate_number: data.certificateNumber,
      profession_occupation: data.professionOccupation,
      contact_number: data.contactNumber,
      email_address: data.emailAddress,
      civil_status: data.civilStatus,
      spouse_name: data.spouseName,
      sex: data.sex,
      date_of_birth: data.dateOfBirth,
      place_of_birth_municipality: data.placeOfBirthMunicipality,
      place_of_birth_province: data.placeOfBirthProvince,
      father_name: data.fatherName,
      mother_maiden_name: data.motherMaidenName,
      voting_status: 'Unregistered', // Set default status
    })
    .select('applicant_id')
    .single();

  if (applicantError) {
    console.error('Error inserting applicant:', applicantError);
    throw new Error('Failed to create applicant record.');
  }
  const applicant_id = applicantData.applicant_id;

  // Step 3: Insert special sector info if provided
  if (data.isIlliterate || data.isSeniorCitizen || data.isIndigenousPerson || data.isPwd || data.voteOnGroundFloor) {
    const { error: specialSectorError } = await supabase
      .from('applicant_special_sector')
      .insert({
        applicant_id: applicant_id,
        is_illiterate: data.isIlliterate,
        is_senior_citizen: data.isSeniorCitizen,
        tribe: data.tribe,
        type_of_disability: data.typeOfDisability,
        assistance_needed: data.assistanceNeeded,
        assistor_name: data.assistorName,
        vote_on_ground_floor: data.voteOnGroundFloor,
      });
    if (specialSectorError) {
      console.error('Error inserting special sector info:', specialSectorError);
      throw new Error('Failed to save special sector information.');
    }
  }

  // Step 4: Create the main application record to get the application_number
  const { data: appData, error: appError } = await supabase
    .from('application')
    .insert({
      applicant_id: applicant_id,
      application_type: data.applicationType,
      application_date: new Date().toISOString(),
      status: 'pending', // Corrected status
    })
    .select('application_number')
    .single();

  if (appError) {
    console.error('Error inserting application:', appError);
    throw new Error('Failed to create application record.');
  }
  const application_number = appData.application_number;

  // Step 5: Insert data into application-specific tables based on type
  switch (data.applicationType) {
    case 'register':
      await supabase.from('application_registration').insert({
          application_number: application_number,
          registration_type: data.registrationType,
          adult_registration_consent: data.adultRegistrationConsent,
          government_id_front_url: idFrontPhotoUrl,
          government_id_back_url: idBackPhotoUrl,
          id_selfie_url: selfieWithIdUrl,
        });
      break;
    case 'transfer_with_reactivation':
      // For this type, we insert into both transfer and reactivation tables
      await supabase.from('application_transfer').insert({
        application_number: application_number,
        previous_precinct_number: data.previousPrecinctNumber,
        previous_barangay: data.previousBarangay,
        previous_city_municipality: data.previousCityMunicipality,
        previous_province: data.previousProvince,
        previous_foreign_post: data.previousForeignPost,
        previous_country: data.previousCountry,
        transfer_type: data.transferType,
      });
      await supabase.from('application_reactivation').insert({
        application_number: application_number,
        reason_for_deactivation: data.reasonForDeactivation,
      });
      break;
    case 'transfer':
      await supabase.from('application_transfer').insert({
        application_number: application_number,
        previous_precinct_number: data.previousPrecinctNumber,
        previous_barangay: data.previousBarangay,
        previous_city_municipality: data.previousCityMunicipality,
        previous_province: data.previousProvince,
        previous_foreign_post: data.previousForeignPost,
        previous_country: data.previousCountry,
        transfer_type: data.transferType,
      });
      break;
    case 'reactivation':
      await supabase.from('application_reactivation').insert({
        application_number: application_number,
        reason_for_deactivation: data.reasonForDeactivation,
      });
      break;
    case 'correction_of_entry':
      await supabase.from('application_correction').insert({
        application_number: application_number,
        target_field: data.targetField,
        current_value: data.currentValue,
        requested_value: data.requestedValue,
      });
      break;
    case 'reinstatement':
      await supabase.from('application_reinstatement').insert({
        application_number: application_number,
        reinstatement_type: data.reinstatementType,
      });
      break;
  }

  // Step 6: Insert address details for application types that require it
  if (['register', 'transfer', 'transfer_with_reactivation'].includes(data.applicationType)) {
    await supabase.from('application_declared_address').insert({
        application_number: application_number,
        house_number_street: `${data.houseNumber} ${data.street}`,
        barangay: data.barangay,
        city_municipality: data.cityMunicipality,
        province: data.province,
        years_in_country: data.yearsInCountry,
        years_of_residence_municipality: data.yearsOfResidenceMunicipality,
        months_of_residence_municipality: data.monthsOfResidenceMunicipality,
      });
  }

  // Step 7: Return the application number for redirection
  return String(application_number);
};
