DROP TRIGGER IF EXISTS sync_users ON auth.users;
DROP FUNCTION IF EXISTS public.sync_users();
DROP TABLE IF EXISTS public.profile;

CREATE TABLE IF NOT EXISTS public.profile (
    auth_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    role TEXT NOT NULL DEFAULT 'public' CHECK (role IN ('public', 'officer')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the trigger function to sync user data
-- This function now syncs immediately on INSERT or UPDATE, without checking for email confirmation.
CREATE OR REPLACE FUNCTION public.sync_users()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
    var_username TEXT := NEW.raw_user_meta_data ->> 'username';
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        INSERT INTO public.profile (auth_id, email, username)
        VALUES (NEW.id, NEW.email, var_username)
        ON CONFLICT (auth_id) DO UPDATE SET
            email = EXCLUDED.email,
            username = EXCLUDED.username;
            
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.profile WHERE auth_id = OLD.id;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Create the trigger that fires the function
CREATE TRIGGER sync_users
AFTER INSERT OR UPDATE OR DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_users();