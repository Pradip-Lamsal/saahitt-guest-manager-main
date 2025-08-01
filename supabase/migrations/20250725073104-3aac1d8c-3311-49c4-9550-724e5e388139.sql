-- Fix search_path security warning for the new function
CREATE OR REPLACE FUNCTION public.update_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';