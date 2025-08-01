-- Update MFA preferences in profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mfa_setup_prompted BOOLEAN DEFAULT FALSE;

-- Add comments explaining the columns
COMMENT ON COLUMN profiles.mfa_enabled IS 'Whether user has enabled MFA for their account';
COMMENT ON COLUMN profiles.mfa_setup_prompted IS 'Whether user has been prompted to set up MFA';

-- Update existing mfa_setup_completed column comment
COMMENT ON COLUMN profiles.mfa_setup_completed IS 'Whether user has completed the MFA setup flow (regardless of whether they enabled it)';

-- Create RPC function to update MFA preferences
CREATE OR REPLACE FUNCTION update_mfa_preferences(
  user_id UUID,
  enabled BOOLEAN DEFAULT NULL,
  setup_completed BOOLEAN DEFAULT NULL,
  setup_prompted BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET 
    mfa_enabled = COALESCE(enabled, mfa_enabled),
    mfa_setup_completed = COALESCE(setup_completed, mfa_setup_completed),
    mfa_setup_prompted = COALESCE(setup_prompted, mfa_setup_prompted)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user MFA preferences
CREATE OR REPLACE FUNCTION get_user_mfa_preferences(user_id UUID)
RETURNS TABLE(
  mfa_enabled BOOLEAN,
  mfa_setup_completed BOOLEAN,
  mfa_setup_prompted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.mfa_enabled,
    p.mfa_setup_completed,
    p.mfa_setup_prompted
  FROM profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
