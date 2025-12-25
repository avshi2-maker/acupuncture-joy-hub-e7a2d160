import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const response = url.searchParams.get("response"); // 'confirmed' or 'cancelled'

    console.log(`Processing confirmation: token=${token}, response=${response}`);

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response || !["confirmed", "cancelled"].includes(response)) {
      return new Response(
        JSON.stringify({ error: "Invalid response. Must be 'confirmed' or 'cancelled'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the confirmation record
    const { data: confirmation, error: findError } = await supabase
      .from("appointment_confirmations")
      .select("*, appointments(id, title, start_time, status, patients(full_name))")
      .eq("token", token)
      .single();

    if (findError || !confirmation) {
      console.error("Token not found:", findError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already responded
    if (confirmation.response) {
      console.log("Already responded:", confirmation.response);
      return new Response(
        JSON.stringify({ 
          message: "Already responded",
          previousResponse: confirmation.response,
          appointment: confirmation.appointments
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(confirmation.expires_at) < new Date()) {
      console.log("Token expired");
      return new Response(
        JSON.stringify({ error: "Token has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the confirmation record
    const { error: updateConfirmError } = await supabase
      .from("appointment_confirmations")
      .update({
        response: response,
        responded_at: new Date().toISOString(),
      })
      .eq("id", confirmation.id);

    if (updateConfirmError) {
      console.error("Error updating confirmation:", updateConfirmError);
      throw updateConfirmError;
    }

    // Update the appointment status
    const newStatus = response === "confirmed" ? "confirmed" : "cancelled";
    const { error: updateApptError } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", confirmation.appointment_id);

    if (updateApptError) {
      console.error("Error updating appointment:", updateApptError);
      throw updateApptError;
    }

    console.log(`Appointment ${confirmation.appointment_id} updated to ${newStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: response === "confirmed" 
          ? "התור אושר בהצלחה! נתראה בקרוב 💚" 
          : "התור בוטל. תודה שהודעת לנו.",
        response: response,
        appointment: confirmation.appointments
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in appointment-confirm:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
