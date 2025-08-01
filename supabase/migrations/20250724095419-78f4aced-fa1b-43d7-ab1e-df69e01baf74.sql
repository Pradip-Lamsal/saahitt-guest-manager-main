-- Fix security warnings from the linter

-- 1. Fix function search_path issues by setting search_path to empty string
CREATE OR REPLACE FUNCTION public.cleanup_old_password_history()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.check_password_reuse(
  p_user_id UUID,
  p_password_hash TEXT
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
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
$$;