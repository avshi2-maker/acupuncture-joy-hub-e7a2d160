import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const action = url.searchParams.get("action"); // 'details' for fetching only

    console.log(`Processing confirmation: token=${token}, response=${response}, action=${action}`);

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle details-only request (for displaying appointment info)
    if (action === "details") {
      const { data: confirmation, error: findError } = await supabase
        .from("appointment_confirmations")
        .select(`
          *, 
          appointments(
            id, 
            title, 
            start_time, 
            status,
            patients(full_name)
          )
        `)
        .eq("token", token)
        .single();

      if (findError || !confirmation) {
        return new Response(
          JSON.stringify({ error: "קישור לא תקין או פג תוקף" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if expired
      if (new Date(confirmation.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "הקישור פג תוקף" }),
          { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (confirmation.response) {
        return new Response(
          JSON.stringify({ 
            previousResponse: confirmation.response,
            appointment: confirmation.appointments
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ appointment: confirmation.appointments }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response || !["confirmed", "cancelled"].includes(response)) {
      return new Response(
        JSON.stringify({ error: "Invalid response. Must be 'confirmed' or 'cancelled'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the confirmation record with appointment and therapist details
    const { data: confirmation, error: findError } = await supabase
      .from("appointment_confirmations")
      .select(`
        *, 
        appointments(
          id, 
          title, 
          start_time, 
          status, 
          therapist_id,
          patients(full_name, phone)
        )
      `)
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

    // Get therapist email to send notification
    const therapistId = confirmation.appointments?.therapist_id;
    if (therapistId) {
      const { data: therapistAuth } = await supabase.auth.admin.getUserById(therapistId);
      const therapistEmail = therapistAuth?.user?.email;
      
      if (therapistEmail) {
        const patientName = confirmation.appointments?.patients?.full_name || 'מטופל';
        const appointmentDate = new Date(confirmation.appointments?.start_time).toLocaleDateString('he-IL', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const appointmentTime = new Date(confirmation.appointments?.start_time).toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const statusHebrew = response === "confirmed" ? "אישר/ה הגעה" : "ביטל/ה";
        const statusColor = response === "confirmed" ? "#10B981" : "#EF4444";
        const statusEmoji = response === "confirmed" ? "✅" : "❌";

        try {
          await resend.emails.send({
            from: "TCM Clinic <onboarding@resend.dev>",
            to: [therapistEmail],
            subject: `${statusEmoji} ${patientName} ${statusHebrew} את התור`,
            html: `
              <!DOCTYPE html>
              <html dir="rtl">
              <head>
                <style>
                  body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 500px; margin: 0 auto; padding: 20px; }
                  .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 25px; border-radius: 0 0 10px 10px; }
                  .info-box { background: white; border-radius: 8px; padding: 15px; margin: 15px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">${statusEmoji} עדכון תור</h1>
                  </div>
                  <div class="content">
                    <p style="font-size: 18px; text-align: center;">
                      <strong>${patientName}</strong> ${statusHebrew} את התור
                    </p>
                    
                    <div class="info-box">
                      <p style="margin: 5px 0;"><strong>📅 תאריך:</strong> ${appointmentDate}</p>
                      <p style="margin: 5px 0;"><strong>🕐 שעה:</strong> ${appointmentTime}</p>
                    </div>
                    
                    ${response === "cancelled" ? `
                    <p style="text-align: center; color: #666;">
                      מומלץ ליצור קשר עם המטופל לקביעת תור חלופי
                    </p>
                    ` : ''}
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          console.log(`Email notification sent to therapist: ${therapistEmail}`);
        } catch (emailError: any) {
          console.error("Error sending email to therapist:", emailError);
          // Don't fail the whole request if email fails
        }
      }
    }

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
