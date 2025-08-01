
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import * as jose from "https://deno.land/x/jose@v4.15.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the path segments from the URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    
    // The token should be the last segment in the path
    const token = pathSegments[pathSegments.length - 1];
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Invalid invitation token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // For GET requests, return the event and guest details
    if (req.method === "GET") {
      // Look up the token in the database
      const { data: tokenData, error: tokenError } = await supabase
        .from("rsvp_tokens")
        .select("guest_id, event_id, expires_at")
        .eq("token", token)
        .single();
      
      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired invitation token" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if token is expired
      const now = new Date();
      const expiryDate = new Date(tokenData.expires_at);
      
      if (now > expiryDate) {
        return new Response(
          JSON.stringify({ error: "This invitation has expired" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get guest details
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .select("id, first_name, last_name, email, rsvp_status, rsvp_details")
        .eq("id", tokenData.guest_id)
        .single();
      
      if (guestError || !guest) {
        return new Response(
          JSON.stringify({ error: "Could not find guest" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, name, date, description")
        .eq("id", tokenData.event_id)
        .single();
      
      if (eventError || !event) {
        return new Response(
          JSON.stringify({ error: "Could not find event" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return the guest and event data
      return new Response(
        JSON.stringify({
          guest: {
            id: guest.id,
            name: `${guest.first_name} ${guest.last_name || ''}`.trim(),
            email: guest.email,
            rsvpStatus: guest.rsvp_status,
            rsvpDetails: guest.rsvp_details
          },
          event,
          token
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // For POST requests, update the RSVP status
    if (req.method === "POST") {
      // Get request body
      const { attending, guestsCount, notes } = await req.json();
      
      // Look up the token in the database
      const { data: tokenData, error: tokenError } = await supabase
        .from("rsvp_tokens")
        .select("guest_id, event_id, expires_at, used_at")
        .eq("token", token)
        .single();
      
      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired invitation token" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if token is expired
      const now = new Date();
      const expiryDate = new Date(tokenData.expires_at);
      
      if (now > expiryDate) {
        return new Response(
          JSON.stringify({ error: "This invitation has expired" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update the guest's RSVP status
      const { error: updateError } = await supabase
        .from("guests")
        .update({
          rsvp_status: attending ? "accepted" : "declined",
          rsvp_at: new Date().toISOString(),
          rsvp_details: {
            guestsCount: attending ? guestsCount : 0,
            notes
          }
        })
        .eq("id", tokenData.guest_id);
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update RSVP status", details: updateError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Mark the token as used
      await supabase
        .from("rsvp_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token);
      
      // Return success
      return new Response(
        JSON.stringify({
          success: true,
          message: attending ? "Thank you for accepting the invitation!" : "Thank you for your response."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Any other method is not allowed
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
