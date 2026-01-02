import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PendingConfirmation {
  id: string;
  token: string;
  expires_at: string;
  created_at: string;
  appointment: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    patient: {
      id: string;
      full_name: string;
      email: string | null;
      phone: string | null;
    } | null;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get confirmations sent more than 24 hours ago without a response
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    console.log(`Checking for pending confirmations created before: ${twentyFourHoursAgo.toISOString()}`);

    // Fetch pending confirmations (no response yet, not expired, sent > 24h ago)
    const { data: pendingConfirmations, error: fetchError } = await supabase
      .from("appointment_confirmations")
      .select(`
        id,
        token,
        expires_at,
        created_at,
        appointment:appointments!appointment_confirmations_appointment_id_fkey (
          id,
          title,
          start_time,
          end_time,
          patient:patients!appointments_patient_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .is("response", null)
      .gt("expires_at", new Date().toISOString())
      .lt("created_at", twentyFourHoursAgo.toISOString());

    if (fetchError) {
      console.error("Error fetching pending confirmations:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingConfirmations?.length || 0} pending confirmations to follow up`);

    const results: { success: string[]; failed: string[]; whatsapp: string[] } = {
      success: [],
      failed: [],
      whatsapp: [],
    };

    if (!pendingConfirmations || pendingConfirmations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending confirmations to follow up", results }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const confirmation of pendingConfirmations) {
      const appointment = Array.isArray(confirmation.appointment) 
        ? confirmation.appointment[0] 
        : confirmation.appointment;
      
      if (!appointment) {
        console.log(`Skipping confirmation ${confirmation.id}: No appointment data`);
        results.failed.push(`${confirmation.id}: No appointment data`);
        continue;
      }

      const patient = Array.isArray(appointment.patient) 
        ? appointment.patient[0] 
        : appointment.patient;

      if (!patient) {
        console.log(`Skipping confirmation ${confirmation.id}: No patient data`);
        results.failed.push(`${confirmation.id}: No patient data`);
        continue;
      }

      const appointmentDate = new Date(appointment.start_time);
      const formattedDate = appointmentDate.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const confirmationUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/appointment?token=${confirmation.token}&lang=he`;

      // Send email if patient has email
      if (patient.email) {
        try {
          const emailResponse = await resend.emails.send({
            from: "TCM Clinic <onboarding@resend.dev>",
            to: [patient.email],
            subject: `תזכורת נוספת: אישור תור ל${formattedDate}`,
            html: `
              <!DOCTYPE html>
              <html dir="rtl" lang="he">
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .highlight { background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                  .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 5px; }
                  .button-cancel { background: #ef4444; }
                  .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">⚠️ תזכורת נוספת</h1>
                    <p style="margin: 10px 0 0 0;">טרם אישרת את הגעתך לתור</p>
                  </div>
                  <div class="content">
                    <p>שלום ${patient.full_name},</p>
                    
                    <div class="highlight">
                      <p style="margin: 0;"><strong>שלחנו לך תזכורת לפני 24 שעות וטרם קיבלנו תשובה.</strong></p>
                      <p style="margin: 10px 0 0 0;">אנא אשר/י את הגעתך בהקדם.</p>
                    </div>
                    
                    <p><strong>📅 תאריך:</strong> ${formattedDate}</p>
                    <p><strong>🕐 שעה:</strong> ${formattedTime}</p>
                    <p><strong>📋 סוג הטיפול:</strong> ${appointment.title}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${confirmationUrl}" class="button">✅ לחץ כאן לאישור או ביטול</a>
                    </div>
                    
                    <p>תודה על שיתוף הפעולה!</p>
                    <p>צוות המרפאה</p>
                  </div>
                  <div class="footer">
                    <p>זוהי תזכורת אוטומטית. אם כבר אישרת, נא להתעלם מהודעה זו.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });

          console.log(`Follow-up email sent to ${patient.email}:`, emailResponse);
          results.success.push(`${confirmation.id}: Email sent to ${patient.email}`);
        } catch (emailError: any) {
          console.error(`Failed to send follow-up email for ${confirmation.id}:`, emailError);
          results.failed.push(`${confirmation.id}: Email error - ${emailError.message}`);
        }
      }

      // Log WhatsApp follow-up needed (can be sent manually or via WhatsApp API)
      if (patient.phone) {
        results.whatsapp.push(`${patient.full_name}: ${patient.phone} - Token: ${confirmation.token}`);
      }
    }

    console.log("Follow-up processing complete:", results);

    return new Response(
      JSON.stringify({
        message: `Processed ${pendingConfirmations.length} pending confirmations`,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-followup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
