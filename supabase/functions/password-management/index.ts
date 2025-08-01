import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordRequest {
  action: 'check_reuse' | 'store_password_history';
  password: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, password, user_id }: PasswordRequest = await req.json();

    if (!action || !password || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Simple password hashing (in production, use proper bcrypt or similar)
    const passwordHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password + user_id) // Add salt
    );
    const hashArray = Array.from(new Uint8Array(passwordHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (action === 'check_reuse') {
      // Check if password was used recently
      const { data: reuseResult, error: reuseError } = await supabase
        .rpc('check_password_reuse', {
          p_user_id: user_id,
          p_password_hash: hashHex
        });

      if (reuseError) {
        console.error('Error checking password reuse:', reuseError);
        return new Response(
          JSON.stringify({ error: 'Failed to check password reuse' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ isReused: reuseResult }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } else if (action === 'store_password_history') {
      // Store password hash in history
      const { error: insertError } = await supabase
        .from('password_history')
        .insert({
          user_id: user_id,
          password_hash: hashHex
        });

      if (insertError) {
        console.error('Error storing password history:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store password history' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in password-management function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);