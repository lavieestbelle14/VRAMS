-- Drop officer-related tables
DROP TABLE IF EXISTS officer_assignment CASCADE;
DROP TABLE IF EXISTS officer CASCADE;

-- Drop application-related tables
DROP TABLE IF EXISTS application_declared_address CASCADE;
DROP TABLE IF EXISTS application_reinstatement CASCADE;
DROP TABLE IF EXISTS application_correction CASCADE;
DROP TABLE IF EXISTS application_reactivation CASCADE;
DROP TABLE IF EXISTS application_transfer CASCADE;
DROP TABLE IF EXISTS application_registration CASCADE;
DROP TABLE IF EXISTS application CASCADE;

-- Drop applicant-related tables
DROP TABLE IF EXISTS applicant_special_sector CASCADE;
DROP TABLE IF EXISTS applicant_deactivation_record CASCADE;
DROP TABLE IF EXISTS applicant_voter_record CASCADE;
DROP TABLE IF EXISTS applicant_biometrics CASCADE;
DROP TABLE IF EXISTS applicant CASCADE;



/*
===============================================================================
  Voter Registration System Database Schema 

  Description:
  This SQL file defines the relational database schema for a comprehensive 
  voter registration system. 

  Designed for use in a PostgreSQL environment.
===============================================================================
*/

/*
  Tables related to the applicant entity:

  - applicant: stores personal and biometric information
  - applicant_biometrics: store links for applicant biometrics on voter registration (ONE-TO-ONE)
  - applicant_voter_record: optional voter details linked to an applicant (ONE-TO-ONE)
  - applicant_deactivation_record: records of applicant deactivations (ONE-TO-MANY - keeps separate PK)
  - applicant_special_sector: special sector attributes linked optionally to an applicant (ONE-TO-ONE)
*/
CREATE TABLE IF NOT EXISTS applicant (
    applicant_id SERIAL PRIMARY KEY,
    auth_id UUID UNIQUE NOT NULL REFERENCES app_user(auth_id) ON DELETE CASCADE,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    suffix VARCHAR(10),

    citizenship_type TEXT NOT NULL CHECK (citizenship_type IN ('By Birth', 'Naturalized', 'Reacquired')),
    date_of_naturalization DATE,
    CHECK (
        citizenship_type IN ('Naturalized', 'Reacquired') OR date_of_naturalization IS NULL
    ),

    certificate_number VARCHAR(20),
    CHECK (
        citizenship_type IN ('Naturalized', 'Reacquired') OR certificate_number IS NULL
    ),

    profession_occupation VARCHAR(50),
    contact_number VARCHAR(50),
    email_address VARCHAR(50),

    civil_status TEXT NOT NULL CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Legally Separated')),
    spouse_name VARCHAR(50) CHECK (civil_status != 'Married' OR spouse_name IS NOT NULL),

    sex TEXT NOT NULL CHECK (sex IN ('M', 'F')),
    date_of_birth DATE NOT NULL,

    place_of_birth_municipality VARCHAR(50) NOT NULL,
    place_of_birth_province VARCHAR(50) NOT NULL,

    father_name VARCHAR(100) NOT NULL,
    mother_maiden_name VARCHAR(100) NOT NULL,

    voting_status TEXT NOT NULL DEFAULT 'Unregistered' CHECK (voting_status IN ('Unregistered', 'Active', 'Deactivated'))
);

-- FK as PK enforces one-to-one relationship
CREATE TABLE applicant_biometrics (
    applicant_id INTEGER PRIMARY KEY,
    left_thumbprint_url TEXT NOT NULL,
    right_thumbprint_url TEXT NOT NULL,
    signature_specimen_url TEXT NOT NULL,
    FOREIGN KEY (applicant_id) REFERENCES applicant(applicant_id) ON DELETE CASCADE
);

-- FK as PK enforces one-to-one relationship  
CREATE TABLE IF NOT EXISTS applicant_voter_record (
    applicant_id INTEGER PRIMARY KEY,
    precinct_number VARCHAR(10) NOT NULL,
    voter_id VARCHAR(30) NOT NULL,

    CONSTRAINT fk_applicant_voter
        FOREIGN KEY (applicant_id)
        REFERENCES applicant(applicant_id)
        ON DELETE CASCADE
);

-- One applicant can have multiple deactivation records over time
CREATE TABLE IF NOT EXISTS applicant_deactivation_record (
    deactivation_id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN (
        'Sentenced by final judgment to suffer imprisonment for not less than one (1) year',
        'Convicted by final judgment of a crime involving disloyalty to the duly constituted government, etc;',
        'Declared by competent authority to be insane or incompetent;',
        'Failed to vote in two (2) successive preceding regular elections;',
        'Loss of Filipino citizenship;',
        'Exclusion by a court order; or',
        'Failure to Validate'
    )),    
    deactivation_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Unresolved', 'Resolved')),

    CONSTRAINT fk_applicant
        FOREIGN KEY (applicant_id)
        REFERENCES applicant(applicant_id)
        ON DELETE CASCADE
);

-- FK as PK enforces one-to-one relationship
CREATE TABLE IF NOT EXISTS applicant_special_sector (
    applicant_id INTEGER PRIMARY KEY,

    is_illiterate BOOLEAN NOT NULL,
    is_senior_citizen BOOLEAN NOT NULL,

    tribe VARCHAR(50),  
    type_of_disability VARCHAR(50),  
    assistance_needed VARCHAR(50),  
    assistor_name VARCHAR(100), 

    vote_on_ground_floor BOOLEAN,

    CONSTRAINT fk_applicant_special_sector
        FOREIGN KEY (applicant_id)
        REFERENCES applicant(applicant_id)
        ON DELETE CASCADE
);

/*
  Tables related to the application entity:

  - application: main table storing application details and status
  - application_registration: registration requirements (ids, and KK consent) 
  - application_transfer: stores old address details for transfer applications 
  - application_reactivation: reactivation requests and reason for deactivation
  - application_correction: requested corrections to applicant details  
  - application_reinstatement: reinstatement details 
  - application_declared_address: address provided during application, only applicable for type registration, transfer, and transfer_with_reactivation
*/
CREATE TABLE IF NOT EXISTS application (
    application_number SERIAL PRIMARY KEY,
    public_facing_id VARCHAR(15) GENERATED ALWAYS AS ('APP-' || LPAD(application_number::TEXT, 6, '0')) STORED,

    applicant_id INTEGER NOT NULL,

    application_type TEXT NOT NULL CHECK (application_type IN ('register', 'transfer', 'reactivation', 'transfer_with_reactivation', 'correction_of_entry', 'reinstatement')),

    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    processing_date DATE,

    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'approved', 'disapproved')),

    reason_for_disapproval VARCHAR(255),
    CHECK (
        status != 'disapproved' OR reason_for_disapproval IS NOT NULL
    ),

    erb_hearing_date DATE,

    remarks TEXT,

    CONSTRAINT fk_application_applicant
        FOREIGN KEY (applicant_id)
        REFERENCES applicant(applicant_id)
        ON DELETE CASCADE
);

-- FK as PK enforces one-to-one relationship
CREATE TABLE IF NOT EXISTS application_registration (
    application_number INTEGER PRIMARY KEY,
    registration_type TEXT NOT NULL CHECK (registration_type IN ('Katipunan ng Kabataan', 'Regular')) ,
    adult_registration_consent BOOLEAN,
    government_id_front_url TEXT NOT NULL,
    government_id_back_url TEXT NOT NULL,
    id_selfie_url TEXT NOT NULL,

    CONSTRAINT fk_application_registration
        FOREIGN KEY (application_number)
        REFERENCES application(application_number)
        ON DELETE CASCADE
);

-- FK as PK enforces one-to-one relationship
CREATE TABLE IF NOT EXISTS application_transfer (
    application_number INTEGER PRIMARY KEY,
    previous_precinct_number VARCHAR(10),
    previous_barangay VARCHAR(50),
    previous_city_municipality VARCHAR(50),
    previous_province VARCHAR(50),
    previous_foreign_post VARCHAR(50),
    previous_country VARCHAR(50),

    transfer_type TEXT NOT NULL CHECK (transfer_type IN (
        'Within the same City/Municipality/District.',
        'From another City/Municipality/District.',
        'From foreign post to local CEO other than original place of registration.'
    )),

    CONSTRAINT fk_application_transfer
        FOREIGN KEY (application_number)
        REFERENCES application(application_number)
        ON DELETE CASCADE
);

-- FK as PK enforces one-to-one relationship
CREATE TABLE IF NOT EXISTS application_reactivation (
    application_number INTEGER PRIMARY KEY,

    reason_for_deactivation TEXT NOT NULL CHECK (reason_for_deactivation IN (
        'Sentenced by final judgment to suffer imprisonment for not less than one (1) year',
        'Convicted by final judgment of a crime involving disloyalty to the duly constituted government, etc;',
        'Declared by competent authority to be insane or incompetent;',
        'Failed to vote in two (2) successive preceding regular elections;',
        'Loss of Filipino citizenship;',
        'Exclusion by a court order; or',
        'Failure to Validate'
    )),

    CONSTRAINT fk_applicant_reactivation
        FOREIGN KEY (application_number)
        REFERENCES application(application_number)
        ON DELETE CASCADE
);

-- FK as PK enforces one-to-one relationship
CREATE TABLE IF NOT EXISTS application_correction (
    application_number INTEGER PRIMARY KEY,
    target_field TEXT NOT NULL,
    requested_value TEXT NOT NULL,
    current_value TEXT NOT NULL,

    CONSTRAINT fk_application_correction
        FOREIGN KEY (application_number)
        REFERENCES application(application_number)
        ON DELETE CASCADE,

    CONSTRAINT chk_target_field
        CHECK (target_field IN (
            'Name',
            'Contact Number',
            'Email Address',
            'Spouse name',
            'Date of Birth',
            'Place of Birth',
            'Father''s Name',        
            'Mother''s Maiden Name',
            'Other'
        ))
);

-- FK as PK enforces one-to-one relationship 
CREATE TABLE IF NOT EXISTS application_reinstatement (
    application_number INTEGER PRIMARY KEY,

    reinstatement_type TEXT NOT NULL CHECK (reinstatement_type IN (
        'Reinstatement of records due to transfer from foreign post to same local City/Municipality/District.',
        'Inclusion of VRR in the precinct book of voters.',
        'Reinstatement of the name of the registered voter which has been omitted in the list of voters.'
    )),

    CONSTRAINT fk_application_reinstatement
        FOREIGN KEY (application_number)
        REFERENCES application(application_number)
        ON DELETE CASCADE
);

-- FK as PK enforces one-to-one relationship 
CREATE TABLE IF NOT EXISTS application_declared_address (
    application_number INTEGER PRIMARY KEY,
    house_number_street VARCHAR(100) NOT NULL,
    barangay VARCHAR(50) NOT NULL,
    city_municipality VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    months_of_residence_address INTEGER NOT NULL,
    years_of_residence_address INTEGER NOT NULL,
    months_of_residence_municipality INTEGER NOT NULL,
    years_of_residence_municipality INTEGER NOT NULL,
    years_in_country INTEGER NOT NULL,

    CONSTRAINT fk_application_address
        FOREIGN KEY (application_number)
        REFERENCES application(application_number)
        ON DELETE CASCADE
);

/*
  Tables related to the officer entity:

  - officer: stores election officer and board member information
  - officer_assignment: maps officers to applications (MANY-TO-MANY - SURROGATE KEY FOR EFFICIENT QUERY)
*/
CREATE TABLE IF NOT EXISTS officer (
    officer_id SERIAL PRIMARY KEY,

    first_name VARCHAR(50), 
    last_name VARCHAR(50), 
    
    auth_id UUID UNIQUE NOT NULL REFERENCES app_user(auth_id) ON DELETE CASCADE,
    position TEXT NOT NULL CHECK (position IN ('Election Officer', 'Board Member'))
);

-- Many-to-many relationship between officers and applications (JUNCTION table)
CREATE TABLE officer_assignment (
    assignment_id SERIAL PRIMARY KEY,
    officer_id INTEGER NOT NULL,
    application_number INTEGER NOT NULL,

    CONSTRAINT fk_officer FOREIGN KEY (officer_id) REFERENCES officer(officer_id) ON DELETE CASCADE,
    CONSTRAINT fk_application FOREIGN KEY (application_number) REFERENCES application(application_number) ON DELETE CASCADE,
    CONSTRAINT unique_officer_application UNIQUE (officer_id, application_number)
);