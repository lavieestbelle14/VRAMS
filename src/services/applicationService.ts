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
const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  // Validate file before upload
  if (!file || !(file instanceof File)) {
    throw new Error(`Invalid file provided for upload to ${bucket}`);
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 5MB limit for ${bucket}`);
  }

  // Validate file type for ID uploads
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Only JPEG, JPG, PNG, and WebP files are allowed.`);
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false // Don't overwrite existing files
    });

    if (error) {
      console.error(`Detailed upload error for ${bucket}:`, {
        error,
        bucket,
        path,
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name
      });

      // Handle specific error cases
      if (error.message?.includes('Duplicate')) {
        throw new Error(`A file with this name already exists. Please try again or rename your file.`);
      }
      if (error.message?.includes('Bucket not found')) {
        throw new Error(`Storage bucket "${bucket}" not found. Please contact support.`);
      }
      if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
        throw new Error(`You don't have permission to upload to ${bucket}. Please contact support.`);
      }
      if (error.message?.includes('payload too large')) {
        throw new Error(`File is too large for upload to ${bucket}. Maximum size is 5MB.`);
      }
      
      // Generic error with more detail
      throw new Error(`Failed to upload file to ${bucket}: ${error.message || 'Unknown error'}`);
    }

    if (!data?.path) {
      throw new Error(`Upload succeeded but no file path returned from ${bucket}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    
    if (!urlData?.publicUrl) {
      throw new Error(`Failed to generate public URL for uploaded file in ${bucket}`);
    }

    return urlData.publicUrl;
  } catch (uploadError) {
    console.error(`Exception during file upload to ${bucket}:`, {
      error: uploadError,
      bucket,
      path,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
    
    // Re-throw if it's already our custom error
    if (uploadError instanceof Error && uploadError.message.includes('Failed to upload')) {
      throw uploadError;
    }
    
    // Wrap unexpected errors
    throw new Error(`Unexpected error during file upload to ${bucket}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
  }
};


export const submitApplication = async (data: ApplicationFormValues, user: AuthenticatedUser): Promise<string> => {
  let idFrontPhotoUrl: string | undefined;
  let idBackPhotoUrl: string | undefined;
  let selfieWithIdUrl: string | undefined;

  let applicant_id: number;  try {    console.log('Starting application submission for user:', { 
      userId: user.id, 
      userRole: user.role, 
      applicationType: data.applicationType 
    });

    // Verify user exists in app_user table (for RLS policy)
    const { data: userRecord, error: userCheckError } = await supabase
      .from('app_user')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (userCheckError || !userRecord) {
      console.error('User not found in app_user table:', userCheckError);
      throw new Error('User profile not found. Please refresh the page and try again.');
    }

    console.log('User record verified:', userRecord);
    
    // Step 1: Handle File Uploads if it's a registration application
    if (data.applicationType === 'register') {
      if (data.governmentIdFrontUrl) {
        const timestamp = Date.now();
        const path = `public/${user.id}-${timestamp}-front-${data.governmentIdFrontUrl.name}`;
        try {
          idFrontPhotoUrl = await uploadFile(data.governmentIdFrontUrl, 'government-ids', path);
        } catch (e) {
          console.error('Error uploading governmentIdFrontUrl:', e);
          throw new Error(`Failed to upload ID front photo: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }
      if (data.governmentIdBackUrl) {
        const timestamp = Date.now();
        const path = `public/${user.id}-${timestamp}-back-${data.governmentIdBackUrl.name}`;
        try {
          idBackPhotoUrl = await uploadFile(data.governmentIdBackUrl, 'government-ids', path);
        } catch (e) {
          console.error('Error uploading governmentIdBackUrl:', e);
          throw new Error(`Failed to upload ID back photo: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }
      if (data.idSelfieUrl) {
        const timestamp = Date.now();
        const path = `public/${user.id}-${timestamp}-selfie-${data.idSelfieUrl.name}`;
        try {
          selfieWithIdUrl = await uploadFile(data.idSelfieUrl, 'id-selfies', path);
        } catch (e) {
          console.error('Error uploading idSelfieUrl:', e);
          throw new Error(`Failed to upload selfie photo: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }
    }
  // Step 2: Insert or fetch applicant
  if (data.applicationType === 'register') {
    // Check for existing applicant (use maybeSingle to handle no records)
    const { data: existingApplicant, error: checkError } = await supabase
      .from('applicant')
      .select('applicant_id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing applicant:', checkError);
      throw new Error('Failed to verify existing applications. Please try again.');
    }

    if (existingApplicant) {
      console.log('Found existing applicant:', existingApplicant);
      throw new Error(`You already have an existing application. Please use transfer, correction, or other application types.`);
    }

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
        spouse_name: data.spouseName || (data.civilStatus === 'Married' ? '' : null),
        sex: data.sex,
        date_of_birth: data.dateOfBirth,
        place_of_birth_municipality: data.placeOfBirthMunicipality,
        place_of_birth_province: data.placeOfBirthProvince,
        father_name: `${data.fatherFirstName} ${data.fatherLastName}`.trim(),
        mother_maiden_name: `${data.motherFirstName} ${data.motherMaidenLastName}`.trim(),
      })
      .select('applicant_id')
      .single();

    if (applicantError) {
      console.error('Error inserting applicant:', JSON.stringify(applicantError), JSON.stringify(data));
      throw new Error(`Failed to create applicant record: ${applicantError.message || 'Unknown error'}`);
    }
    applicant_id = applicantData.applicant_id;  } else {
    // Fetch existing applicant for this user
    const { data: applicantData, error: fetchError } = await supabase
      .from('applicant')
      .select('applicant_id')
      .eq('auth_id', user.id)
      .maybeSingle();
    if (fetchError || !applicantData) {
      console.error('Error fetching applicant for non-registration application:', fetchError, user.id);
      throw new Error('No applicant record found for this user. Please register first.');
    }
    applicant_id = applicantData.applicant_id;
  }

  // Step 3: Insert special sector info if provided (only for registration)
  if (data.applicationType === 'register' && (data.isIlliterate || data.isSeniorCitizen || data.isIndigenousPerson || data.isPwd || data.voteOnGroundFloor)) {
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
      console.error('Error inserting special sector info:', specialSectorError, data);
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
    console.error('Error inserting application:', appError, data);
    throw new Error('Failed to create application record.');
  }
  const application_number = appData.application_number;

  // Step 5: Insert data into application-specific tables based on type
  try {
    switch (data.applicationType) {
      case 'register':
        {
          const { error: regError } = await supabase.from('application_registration').insert({
            application_number: application_number,
            registration_type: data.registrationType,
            adult_registration_consent: data.adultRegistrationConsent,
            government_id_front_url: idFrontPhotoUrl,
            government_id_back_url: idBackPhotoUrl,
            id_selfie_url: selfieWithIdUrl,
          });
          if (regError) {
            console.error('Error inserting application_registration:', regError, data);
            throw new Error('Failed to save registration details.');
          }
        }
        break;
      case 'transfer_with_reactivation':
        {
          const { error: transferError } = await supabase.from('application_transfer').insert({
            application_number: application_number,
            previous_precinct_number: data.previousPrecinctNumber || null,
            previous_barangay: data.previousBarangay || null,
            previous_city_municipality: data.previousCityMunicipality || null,
            previous_province: data.previousProvince || null,
            previous_foreign_post: data.previousForeignPost || null,
            previous_country: data.previousCountry || null,
            transfer_type: data.transferType,
          });
          if (transferError) {
            console.error('Error inserting application_transfer:', transferError, data);
            throw new Error('Failed to save transfer details.');
          }
          const { error: reactError } = await supabase.from('application_reactivation').insert({
            application_number: application_number,
            reason_for_deactivation: data.reasonForDeactivation,
          });
          if (reactError) {
            console.error('Error inserting application_reactivation:', reactError, data);
            throw new Error('Failed to save reactivation details.');
          }
        }
        break;
      case 'transfer':
        {
          const { error: transferError } = await supabase.from('application_transfer').insert({
            application_number: application_number,
            previous_precinct_number: data.previousPrecinctNumber || null,
            previous_barangay: data.previousBarangay || null,
            previous_city_municipality: data.previousCityMunicipality || null,
            previous_province: data.previousProvince || null,
            previous_foreign_post: data.previousForeignPost || null,
            previous_country: data.previousCountry || null,
            transfer_type: data.transferType,
          });
          if (transferError) {
            console.error('Error inserting application_transfer:', transferError, data);
            throw new Error('Failed to save transfer details.');
          }
        }
        break;
      case 'reactivation':
        {
          const { error: reactError } = await supabase.from('application_reactivation').insert({
            application_number: application_number,
            reason_for_deactivation: data.reasonForDeactivation,
          });
          if (reactError) {
            console.error('Error inserting application_reactivation:', reactError, data);
            throw new Error('Failed to save reactivation details.');
          }
        }
        break;
      case 'correction_of_entry':
        {
          const { error: corrError } = await supabase.from('application_correction').insert({
            application_number: application_number,
            target_field: data.targetField,
            current_value: data.currentValue,
            requested_value: data.requestedValue,
          });
          if (corrError) {
            console.error('Error inserting application_correction:', corrError, data);
            throw new Error('Failed to save correction details.');
          }
        }
        break;
      case 'reinstatement':
        {
          const { error: reinError } = await supabase.from('application_reinstatement').insert({
            application_number: application_number,
            reinstatement_type: data.reinstatementType,
          });
          if (reinError) {
            console.error('Error inserting application_reinstatement:', reinError, data);
            throw new Error('Failed to save reinstatement details.');
          }
        }
        break;
    }
  } catch (e) {
    console.error('Error in application-specific table insert:', e, data);
    throw e;
  }

  // Step 6: Insert address details for application types that require it (only for registration, transfer, transfer_with_reactivation)
  if (data.applicationType && ["register", "transfer", "transfer_with_reactivation"].includes(data.applicationType)) {
    const { error: addressError } = await supabase.from('application_declared_address').insert({
        application_number: application_number,
        house_number_street: `${data.houseNumber} ${data.street}`,
        barangay: data.barangay,
        city_municipality: data.cityMunicipality,
        province: data.province,
        years_in_country: data.yearsInCountry,
        years_of_residence_municipality: data.yearsOfResidenceMunicipality,
        months_of_residence_municipality: data.monthsOfResidenceMunicipality,
        years_of_residence_address: data.yearsOfResidenceAddress,
        months_of_residence_address: data.monthsOfResidenceAddress,
      });
    if (addressError) {
      console.error('Error inserting application_declared_address:', addressError, data);
      throw new Error('Failed to save address details.');
    }
  }

  // Step 7: Return the application number for redirection
  return String(application_number);

  } catch (error) {
    console.error('Application submission failed:', {
      error,
      applicationType: data.applicationType,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    // If it's already a custom error with a descriptive message, re-throw it
    if (error instanceof Error && error.message.includes('Failed to')) {
      throw error;
    }

    // For database errors, provide more context
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        throw new Error('An application with this information already exists. Please check your previous submissions.');
      }
      if (error.message.includes('foreign key')) {
        throw new Error('Invalid reference data. Please refresh the page and try again.');
      }
      if (error.message.includes('not null')) {
        throw new Error('Missing required information. Please check all required fields are filled.');
      }
      if (error.message.includes('check constraint')) {
        throw new Error('Invalid data provided. Please check your input values and try again.');
      }
    }

    // Generic fallback error
    throw new Error(`Application submission failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
};

/**
 * Fetch a single application by its public-facing ID (e.g., APP-000123), joining applicant and all related tables.
 * Returns a normalized object matching ApplicationFormValues naming conventions.
 */
export async function getApplicationByPublicId(publicId: string) {
  // Debug: log the publicId being queried
  console.log('[DEBUG] Fetching application with public_facing_id:', publicId);
  const { data, error } = await supabase
    .from('application')
    .select(`
      public_facing_id,
      application_number,
      application_type,
      application_date,
      processing_date,
      status,
      reason_for_disapproval,
      erb_hearing_date,
      remarks,
      applicant:applicant_id (
        first_name, last_name, middle_name, suffix, citizenship_type, date_of_naturalization, certificate_number, profession_occupation, contact_number, email_address, civil_status, spouse_name, sex, date_of_birth, place_of_birth_municipality, place_of_birth_province, father_name, mother_maiden_name
      ),
      declared_address:application_declared_address!fk_application_address (
        house_number_street, barangay, city_municipality, province, months_of_residence_address, years_of_residence_address, months_of_residence_municipality, years_of_residence_municipality, years_in_country
      ),
      registration:application_registration!fk_application_registration (
        registration_type, adult_registration_consent, government_id_front_url, government_id_back_url, id_selfie_url
      ),
      transfer:application_transfer!fk_application_transfer (
        previous_precinct_number, previous_barangay, previous_city_municipality, previous_province, previous_foreign_post, previous_country, transfer_type
      ),
      reactivation:application_reactivation!fk_applicant_reactivation (
        reason_for_deactivation
      ),
      correction:application_correction!fk_application_correction (
        target_field, requested_value, current_value
      ),
      reinstatement:application_reinstatement!fk_application_reinstatement (
        reinstatement_type
      )
    `)
    .eq('public_facing_id', publicId)
    .single();

  // Debug: log the error and data
  if (error) {
    console.error('[DEBUG] Supabase error:', error);
  }
  if (!data) {
    console.warn('[DEBUG] No data returned for public_facing_id:', publicId);
  } else {
    console.log('[DEBUG] Data returned for public_facing_id:', publicId, data);
  }

  if (error || !data) {
    return undefined;
  }

  // Fix: Supabase join returns arrays for joined tables, use first element if array
  const getFirst = (obj: any) => Array.isArray(obj) ? obj[0] : obj;
  const applicant = getFirst(data.applicant) || {};
  const address = getFirst(data.declared_address) || {};
  const registration = getFirst(data.registration) || {};
  const transfer = getFirst(data.transfer) || {};
  const reactivation = getFirst(data.reactivation) || {};
  const correction = getFirst(data.correction) || {};
  const reinstatement = getFirst(data.reinstatement) || {};

  // Split house_number_street into houseNumber and street
  let houseNumber = '', street = '';
  if (address.house_number_street) {
    const parts = address.house_number_street.split(/\s+/, 2);
    houseNumber = parts[0] || '';
    street = parts[1] || '';
  }

  return {
    id: data.public_facing_id,
    applicationType: data.application_type,
    status: data.status,
    submissionDate: data.application_date,
    approvalDate: data.processing_date,
    remarks: data.remarks,
    reasonForDisapproval: data.reason_for_disapproval,
    // Applicant info
    firstName: applicant.first_name,
    lastName: applicant.last_name,
    middleName: applicant.middle_name,
    suffix: applicant.suffix,
    citizenshipType: applicant.citizenship_type,
    dateOfNaturalization: applicant.date_of_naturalization,
    certificateNumber: applicant.certificate_number,
    professionOccupation: applicant.profession_occupation,
    contactNumber: applicant.contact_number,
    emailAddress: applicant.email_address,
    civilStatus: applicant.civil_status,
    spouseName: applicant.spouse_name,
    sex: applicant.sex,
    dateOfBirth: applicant.date_of_birth,
    placeOfBirthMunicipality: applicant.place_of_birth_municipality,
    placeOfBirthProvince: applicant.place_of_birth_province,
    fatherFirstName: (applicant.father_name || '').split(' ')[0] || '',
    fatherLastName: (applicant.father_name || '').split(' ').slice(1).join(' ') || '',
    motherFirstName: (applicant.mother_maiden_name || '').split(' ')[0] || '',
    motherMaidenLastName: (applicant.mother_maiden_name || '').split(' ').slice(1).join(' ') || '',
    // Address
    houseNumber,
    street,
    barangay: address.barangay,
    cityMunicipality: address.city_municipality,
    province: address.province,
    monthsOfResidenceAddress: address.months_of_residence_address,
    yearsOfResidenceAddress: address.years_of_residence_address,
    monthsOfResidenceMunicipality: address.months_of_residence_municipality,
    yearsOfResidenceMunicipality: address.years_of_residence_municipality,
    yearsInCountry: address.years_in_country,
    // Registration
    registrationType: registration.registration_type,
    adultRegistrationConsent: registration.adult_registration_consent,
    governmentIdFrontUrl: registration.government_id_front_url,
    governmentIdBackUrl: registration.government_id_back_url,
    idSelfieUrl: registration.id_selfie_url,
    // Transfer
    previousPrecinctNumber: transfer.previous_precinct_number,
    previousBarangay: transfer.previous_barangay,
    previousCityMunicipality: transfer.previous_city_municipality,
    previousProvince: transfer.previous_province,
    previousForeignPost: transfer.previous_foreign_post,
    previousCountry: transfer.previous_country,
    transferType: transfer.transfer_type,
    // Reactivation
    reasonForDeactivation: reactivation.reason_for_deactivation,
    // Correction
    targetField: correction.target_field,
    requestedValue: correction.requested_value,
    currentValue: correction.current_value,
    // Reinstatement
    reinstatementType: reinstatement.reinstatement_type,
    // TODO: Add special sector, biometrics, voter record, etc. if needed
  };
}

// Function to update application remarks
export const updateApplicationRemarks = async (applicationId: string, remarks: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('application')
      .update({ 
        remarks: remarks.trim() || null
      })
      .eq('public_facing_id', applicationId);

    if (error) {
      console.error('Error updating application remarks:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update application remarks:', error);
    return false;
  }
};

export const updateApplicationStatus = async (
  applicationId: string, 
  status: 'pending' | 'verified' | 'approved' | 'disapproved',
  reasonForDisapproval?: string
): Promise<boolean> => {
  try {
    const updateData: any = { 
      status,
      processing_date: status !== 'pending' ? new Date().toISOString() : null
    };

    // Only include reason_for_disapproval if status is disapproved
    if (status === 'disapproved') {
      if (!reasonForDisapproval?.trim()) {
        throw new Error('Reason for disapproval is required when disapproving an application');
      }
      updateData.reason_for_disapproval = reasonForDisapproval.trim();
    } else {
      updateData.reason_for_disapproval = null;
    }

    const { error } = await supabase
      .from('application')
      .update(updateData)
      .eq('public_facing_id', applicationId);

    if (error) {
      console.error('Error updating application status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update application status:', error);
    return false;
  }
};

export const approveApplicationWithVoterRecord = async (
  applicationId: string, 
  voterData: { precinctNumber: string; voterId: string },
  reasonForDisapproval?: string
): Promise<boolean> => {
  try {
    // First, get the application to find the applicant_id
    const { data: applicationData, error: fetchError } = await supabase
      .from('application')
      .select('applicant_id')
      .eq('public_facing_id', applicationId)
      .single();

    if (fetchError || !applicationData) {
      console.error('Error fetching application:', fetchError);
      return false;
    }

    // Start a transaction-like operation
    // 1. Update application status to approved
    const { error: statusError } = await supabase
      .from('application')
      .update({ 
        status: 'approved',
        processing_date: new Date().toISOString(),
        reason_for_disapproval: null
      })
      .eq('public_facing_id', applicationId);

    if (statusError) {
      console.error('Error updating application status:', statusError);
      return false;
    }

    // 2. Create voter record
    const { error: voterError } = await supabase
      .from('applicant_voter_record')
      .upsert({
        applicant_id: applicationData.applicant_id,
        precinct_number: voterData.precinctNumber.trim(),
        voter_id: voterData.voterId.trim()
      });

    if (voterError) {
      console.error('Error creating voter record:', voterError);
      
      // Rollback: revert application status to verified
      await supabase
        .from('application')
        .update({ status: 'verified', processing_date: null })
        .eq('public_facing_id', applicationId);
      
      return false;
    }

    // 3. Update applicant voting status to Active
    const { error: applicantError } = await supabase
      .from('applicant')
      .update({ voting_status: 'Active' })
      .eq('applicant_id', applicationData.applicant_id);

    if (applicantError) {
      console.error('Error updating applicant voting status:', applicantError);
      // Note: We don't rollback here as the voter record is created successfully
    }

    return true;
  } catch (error) {
    console.error('Failed to approve application with voter record:', error);
    return false;
  }
};
