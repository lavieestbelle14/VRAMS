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

  let applicant_id: number;

  try {
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
    // Insert new applicant
    const { data: existingApplicant } = await supabase
      .from('applicant')
      .select('applicant_id')
      .eq('auth_id', user.id)
      .single();

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
    applicant_id = applicantData.applicant_id;
  } else {
    // Fetch existing applicant for this user
    const { data: applicantData, error: fetchError } = await supabase
      .from('applicant')
      .select('applicant_id')
      .eq('auth_id', user.id)
      .single();
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
