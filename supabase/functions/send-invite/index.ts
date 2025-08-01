
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { Resend } from "npm:resend@2.0.0";
import * as jose from "https://deno.land/x/jose@v4.15.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  guestIds: string[];
  eventId: string;
  baseUrl?: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const resend = new Resend(resendApiKey);
    
    // Get JWT from request
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    
    // Verify JWT and get user
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication error", details: userError }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { guestIds, eventId, baseUrl = "https://saahitt.com/rsvp" }: InviteRequest = await req.json();
    
    if (!guestIds?.length || !eventId) {
      return new Response(
        JSON.stringify({ error: "Missing guest IDs or event ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get event details
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();
    
    if (eventError || !eventData) {
      console.error("Event fetch error:", eventError);
      return new Response(
        JSON.stringify({ error: "Could not find event", details: eventError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get guests
    const { data: guests, error: guestsError } = await supabase
      .from("guests")
      .select("*")
      .in("id", guestIds)
      .eq("user_id", user.id);
    
    if (guestsError || !guests?.length) {
      console.error("Guests fetch error:", guestsError);
      return new Response(
        JSON.stringify({ error: "Could not find guests", details: guestsError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const results = {
      success: [],
      failed: [],
    };
    
    // Send invite emails
    for (const guest of guests) {
      try {
        // Skip guests without emails
        if (!guest.email) {
          results.failed.push({ 
            guestId: guest.id, 
            error: "Guest has no email address" 
          });
          continue;
        }
        
        // Create JWT token for RSVP link
        const secret = new TextEncoder().encode(Deno.env.get("RSVP_TOKEN_SECRET") || "your-fallback-secret-key");
        const token = await new jose.SignJWT({ guestId: guest.id, eventId })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('7d') // Token expires in 7 days
          .setIssuedAt()
          .sign(secret);
        
        // Save token in database (for validation and tracking)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const { error: tokenError } = await supabase
          .from("rsvp_tokens")
          .insert({
            guest_id: guest.id,
            event_id: eventId,
            token,
            expires_at: expiresAt.toISOString(),
          });
          
        if (tokenError) {
          console.error("Token insert error:", tokenError);
          results.failed.push({ 
            guestId: guest.id, 
            error: "Failed to create invitation token" 
          });
          continue;
        }
        
        // Generate RSVP link
        const rsvpLink = `${baseUrl}/${encodeURIComponent(token)}`;
        
        // Create email
        const emailData: EmailData = {
          to: guest.email,
          subject: `${eventData.name}: You're Invited!`,
          html: generateInviteEmail({
            guestName: `${guest.first_name} ${guest.last_name || ''}`.trim(),
            eventName: eventData.name,
            eventDate: eventData.date ? new Date(eventData.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Date to be announced',
            eventTime: eventData.date ? new Date(eventData.date).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '',
            rsvpLink,
            eventDescription: eventData.description || ''
          })
        };
        
        // Send email
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: 'Saahitt Event <events@saahitt.com>',
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
        });
        
        if (emailError) {
          console.error("Email send error:", emailError);
          results.failed.push({ 
            guestId: guest.id, 
            error: "Failed to send email invitation" 
          });
          continue;
        }
        
        // Update guest with invited_at timestamp
        const { error: updateError } = await supabase
          .from("guests")
          .update({ invited_at: new Date().toISOString() })
          .eq("id", guest.id);
          
        if (updateError) {
          console.error("Guest update error:", updateError);
          // Don't add to failed as the email was sent
        }
        
        // Add to success
        results.success.push(guest.id);
        
      } catch (error) {
        console.error(`Error processing guest ${guest.id}:`, error);
        results.failed.push({ 
          guestId: guest.id, 
          error: error.message || "Unknown error" 
        });
      }
    }
    
    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateInviteEmail({ 
  guestName, 
  eventName, 
  eventDate, 
  eventTime, 
  rsvpLink,
  eventDescription 
}: { 
  guestName: string; 
  eventName: string; 
  eventDate: string; 
  eventTime: string; 
  rsvpLink: string;
  eventDescription: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${eventName}: You're Invited!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF6F00; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; background-color: #FF6F00; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
        .event-details { margin: 20px 0; background-color: #f8f8f8; padding: 15px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${eventName}</h1>
        <p>${eventDate} ${eventTime ? `at ${eventTime}` : ''}</p>
      </div>
      <div class="content">
        <p>Hi ${guestName},</p>
        <p>You are cordially invited to ${eventName}!</p>
        
        <div class="event-details">
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          ${eventTime ? `<p><strong>Time:</strong> ${eventTime}</p>` : ''}
          ${eventDescription ? `<p><strong>Details:</strong> ${eventDescription}</p>` : ''}
        </div>
        
        <p>Please let us know if you can attend by clicking the button below:</p>
        
        <a href="${rsvpLink}" class="button">View Details & RSVP</a>
        
        <p>We look forward to your response!</p>
        
        <div class="footer">
          <p>This invitation was sent through <a href="https://saahitt.com">Saahitt Guest Manager</a>.</p>
          <p>If you no longer wish to receive these emails, please contact the event organizer.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
