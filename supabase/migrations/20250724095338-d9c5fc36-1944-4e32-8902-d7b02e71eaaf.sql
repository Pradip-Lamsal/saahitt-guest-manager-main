-- Create password history table to track previous passwords
CREATE TABLE public.password_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create password policy configuration table
CREATE TABLE public.password_policy_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  min_length INTEGER NOT NULL DEFAULT 8,
  max_length INTEGER NOT NULL DEFAULT 128,
  require_uppercase BOOLEAN NOT NULL DEFAULT true,
  require_lowercase BOOLEAN NOT NULL DEFAULT true,
  require_numbers BOOLEAN NOT NULL DEFAULT true,
  require_special_chars BOOLEAN NOT NULL DEFAULT true,
  password_history_count INTEGER NOT NULL DEFAULT 5,
  password_expiry_days INTEGER NOT NULL DEFAULT 90,
  max_failed_attempts INTEGER NOT NULL DEFAULT 5,
  lockout_duration_minutes INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create password reset tokens table
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create failed login attempts table
CREATE TABLE public.failed_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  email TEXT NOT NULL,
  ip_address TEXT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS on all tables
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_policy_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for password_history
CREATE POLICY "Users can view their own password history" 
ON public.password_history 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own password history" 
ON public.password_history 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for password_policy_config (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view password policy" 
ON public.password_policy_config 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create RLS policies for password_reset_tokens
CREATE POLICY "Users can view their own reset tokens" 
ON public.password_reset_tokens 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reset tokens" 
ON public.password_reset_tokens 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reset tokens" 
ON public.password_reset_tokens 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for failed_login_attempts
CREATE POLICY "Users can view their own failed attempts" 
ON public.failed_login_attempts 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert failed attempts" 
ON public.failed_login_attempts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update failed attempts" 
ON public.failed_login_attempts 
FOR UPDATE 
USING (true);

-- Insert default password policy
INSERT INTO public.password_policy_config (id) VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- Create function to clean up old password history
CREATE OR REPLACE FUNCTION public.cleanup_old_password_history()
RETURNS TRIGGER AS $$
DECLARE
  history_limit INTEGER;
BEGIN
  -- Get the history limit from policy config
  SELECT password_history_count INTO history_limit 
  FROM public.password_policy_config 
  WHERE id = 1;
  
  -- Delete old password history beyond the limit
  DELETE FROM public.password_history 
  WHERE user_id = NEW.user_id 
  AND id NOT IN (
    SELECT id 
    FROM public.password_history 
    WHERE user_id = NEW.user_id 
    ORDER BY created_at DESC 
    LIMIT history_limit
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to cleanup old password history
CREATE TRIGGER cleanup_password_history_trigger
  AFTER INSERT ON public.password_history
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_password_history();

-- Create function to check password reuse
CREATE OR REPLACE FUNCTION public.check_password_reuse(
  p_user_id UUID,
  p_password_hash TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  history_count INTEGER;
  reuse_found BOOLEAN := FALSE;
BEGIN
  -- Get the history limit from policy config
  SELECT password_history_count INTO history_count 
  FROM public.password_policy_config 
  WHERE id = 1;
  
  -- Check if password exists in recent history
  SELECT EXISTS(
    SELECT 1 
    FROM public.password_history 
    WHERE user_id = p_user_id 
    AND password_hash = p_password_hash
    ORDER BY created_at DESC 
    LIMIT history_count
  ) INTO reuse_found;
  
  RETURN reuse_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;