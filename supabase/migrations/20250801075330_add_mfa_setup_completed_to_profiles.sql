-- Add MFA setup completed flag to profiles table
ALTER TABLE profiles ADD COLUMN mfa_setup_completed BOOLEAN DEFAULT FALSE;

-- Add comment explaining the column
COMMENT ON COLUMN profiles.mfa_setup_completed IS 'Flag indicating whether user has completed MFA setup process';

-- Create RPC function to update MFA setup completed flag
CREATE OR REPLACE FUNCTION update_mfa_setup_completed(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET mfa_setup_completed = TRUE 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
