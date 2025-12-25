import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FollowUpWithPatient {
  id: string;
  scheduled_date: string;
  reason: string | null;
  notes: string | null;
  status: string;
  patient: {
    id: string;
    full_name: string;
    email: string | null;
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

    // Get today's date and tomorrow's date for reminder window
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking follow-ups for dates: ${todayStr} and ${tomorrowStr}`);

    // Fetch pending follow-ups scheduled for today or tomorrow
    const { data: followUps, error: fetchError } = await supabase
      .from("follow_ups")
      .select(`
        id,
        scheduled_date,
        reason,
        notes,
        status,
        patient:patients!follow_ups_patient_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .in("scheduled_date", [todayStr, tomorrowStr])
      .eq("status", "pending");

    if (fetchError) {
      console.error("Error fetching follow-ups:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${followUps?.length || 0} follow-ups to process`);

    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    if (!followUps || followUps.length === 0) {
      return new Response(
        JSON.stringify({ message: "No follow-ups to process", results }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const followUp of followUps) {
      const patient = Array.isArray(followUp.patient) ? followUp.patient[0] : followUp.patient;
      
      if (!patient?.email) {
        console.log(`Skipping follow-up ${followUp.id}: No patient email`);
        results.failed.push(`${followUp.id}: No email`);
        continue;
      }

      const isToday = followUp.scheduled_date === todayStr;
      const dateLabel = isToday ? "today" : "tomorrow";
      const formattedDate = new Date(followUp.scheduled_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      try {
        const emailResponse = await resend.emails.send({
          from: "TCM Clinic <onboarding@resend.dev>",
          to: [patient.email],
          subject: `Reminder: Your follow-up appointment is ${dateLabel}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .highlight { background: #ecfdf5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Follow-up Reminder</h1>
                </div>
                <div class="content">
                  <p>Dear ${patient.full_name},</p>
                  <p>This is a friendly reminder that you have a follow-up appointment scheduled for <strong>${dateLabel}</strong>.</p>
                  
                  <div class="highlight">
                    <p style="margin: 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
                    ${followUp.reason ? `<p style="margin: 10px 0 0 0;"><strong>📋 Reason:</strong> ${followUp.reason}</p>` : ''}
                  </div>
                  
                  <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
                  
                  <p>We look forward to seeing you!</p>
                  
                  <p>Best regards,<br>Your TCM Clinic Team</p>
                </div>
                <div class="footer">
                  <p>This is an automated reminder from your healthcare provider.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${patient.email}:`, emailResponse);
        results.success.push(`${followUp.id}: ${patient.email}`);
      } catch (emailError: any) {
        console.error(`Failed to send email for follow-up ${followUp.id}:`, emailError);
        results.failed.push(`${followUp.id}: ${emailError.message}`);
      }
    }

    console.log("Processing complete:", results);

    return new Response(
      JSON.stringify({
        message: `Processed ${followUps.length} follow-ups`,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-followup-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
