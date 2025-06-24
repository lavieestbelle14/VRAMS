-- Drop all relevant policies before recreating them

DO $$
DECLARE
  tbl TEXT;
  pol TEXT;
BEGIN
  -- List of policies to drop for each table
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'applicant', 'applicant_biometrics', 'applicant_voter_record', 'applicant_deactivation_record', 'applicant_special_sector',
        'application', 'application_registration', 'application_transfer', 'application_reactivation', 'application_correction',
        'application_reinstatement', 'application_declared_address', 'officer', 'officer_assignment'
      )
  LOOP
    FOR pol IN SELECT unnest(ARRAY[
      'Officer full access',
      'Public select',
      'Public insert',
      'Public update',
      'Officer delete'
    ])
    LOOP
      EXECUTE 'DROP POLICY IF EXISTS "' || pol || '" ON ' || quote_ident(tbl) || ';';
    END LOOP;
  END LOOP;
END $$;

-- Drop policies for app_user table
DROP POLICY IF EXISTS "Officer full access" ON app_user;
DROP POLICY IF EXISTS "Public select own" ON app_user;
DROP POLICY IF EXISTS "Public insert own" ON app_user;
DROP POLICY IF EXISTS "Public update own" ON app_user;

-- Drop specific policies for applicant table
DROP POLICY IF EXISTS "Public update own applicant" ON applicant;
DROP POLICY IF EXISTS "Public select own applicant" ON applicant;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'applicant', 'applicant_biometrics', 'applicant_voter_record', 'applicant_deactivation_record', 'applicant_special_sector',
        'application', 'application_registration', 'application_transfer', 'application_reactivation', 'application_correction',
        'application_reinstatement', 'application_declared_address', 'officer', 'officer_assignment'
      )
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);

    -- Drop existing policies to prevent duplication errors
    EXECUTE 'DROP POLICY IF EXISTS "Officer full access" ON ' || quote_ident(tbl) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Public select" ON ' || quote_ident(tbl) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Public insert" ON ' || quote_ident(tbl) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Public update" ON ' || quote_ident(tbl) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Officer delete" ON ' || quote_ident(tbl) || ';';

    -- Officer full access (all operations)
    EXECUTE 'CREATE POLICY "Officer full access" ON ' || quote_ident(tbl) || ' FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM app_user 
        WHERE auth_id = auth.uid() 
        AND role = ''officer''
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM app_user 
        WHERE auth_id = auth.uid() 
        AND role = ''officer''
      )
    );';

    -- Public SELECT (read) - can read their own data
    EXECUTE 'CREATE POLICY "Public select" ON ' || quote_ident(tbl) || ' FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM app_user 
        WHERE auth_id = auth.uid() 
        AND role = ''public''
      )
    );';

    -- Public INSERT (create) - can create new records only
    EXECUTE 'CREATE POLICY "Public insert" ON ' || quote_ident(tbl) || ' FOR INSERT TO authenticated WITH CHECK (
      EXISTS (
        SELECT 1 FROM app_user 
        WHERE auth_id = auth.uid() 
        AND role = ''public''
      )
    );';

    -- Public UPDATE - allow users to update their own records (for re-applications)
    EXECUTE 'CREATE POLICY "Public update" ON ' || quote_ident(tbl) || ' FOR UPDATE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM app_user 
        WHERE auth_id = auth.uid() 
        AND role = ''public''
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM app_user 
        WHERE auth_id = auth.uid() 
        AND role = ''public''
      )
    );';

  END LOOP;
END $$;

-- Separate handling for app_user table
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for app_user
DROP POLICY IF EXISTS "Officer full access" ON app_user;
DROP POLICY IF EXISTS "Public select own" ON app_user;
DROP POLICY IF EXISTS "Public insert own" ON app_user;
DROP POLICY IF EXISTS "Public update own" ON app_user;

-- Re-create policies for app_user
-- Officers can see and manage all user records
CREATE POLICY "Officer full access" ON app_user
  FOR ALL
  TO authenticated
  USING (role = 'officer')
  WITH CHECK (role = 'officer');

-- Public users can see their own record
CREATE POLICY "Public select own" ON app_user
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Public users can insert their own record (for initial setup)
CREATE POLICY "Public insert own" ON app_user
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Public users can update their own profile (username, etc.)
CREATE POLICY "Public update own" ON app_user
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Additional specific policies for applicant table to support UPSERT operations
-- Public users can only update their own applicant record
CREATE POLICY "Public update own applicant" ON applicant
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Public users can only select their own applicant record  
CREATE POLICY "Public select own applicant" ON applicant
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());
