import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyTherapistRequest {
  therapistEmail: string;
  therapistName?: string;
  patientName: string;
  clinicName: string;
  roomName: string;
  date: string;
  time: string;
  notes?: string;
  bookedBy: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received therapist booking notification request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      therapistEmail, 
      therapistName,
      patientName, 
      clinicName, 
      roomName, 
      date, 
      time, 
      notes,
      bookedBy 
    }: NotifyTherapistRequest = await req.json();
    
    if (!therapistEmail || !patientName || !date || !time) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending notification to therapist: ${therapistEmail}`);

    const logoUrl = "https://hwwwioyrsbewptuwvrix.supabase.co/storage/v1/object/public/assets/clinic-logo.png";
    
    const emailResponse = await resend.emails.send({
      from: "Clinic Notifications <onboarding@resend.dev>",
      to: [therapistEmail],
      subject: `New Session Booked: ${patientName} on ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2D5A4A, #4A7C6B);">
            <img src="${logoUrl}" alt="Dr Roni Sapir Clinic" style="height: 60px; width: auto;" />
          </div>
          <div style="background: linear-gradient(135deg, #10B981, #3B82F6); padding: 15px;">
            <h2 style="color: white; margin: 0; text-align: center;">📅 New Session Booked</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <p>Hello${therapistName ? ` ${therapistName}` : ''},</p>
            <p>A new session has been booked for you:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2D5A4A;">
              <p style="margin: 5px 0;"><strong>👤 Patient:</strong> ${patientName}</p>
              <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${time}</p>
              <p style="margin: 5px 0;"><strong>🏥 Clinic:</strong> ${clinicName}</p>
              <p style="margin: 5px 0;"><strong>🚪 Room:</strong> ${roomName}</p>
              ${notes ? `<p style="margin: 5px 0;"><strong>📝 Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">Booked by: ${bookedBy}</p>
          </div>
          <div style="text-align: center; padding: 15px; background: #2D5A4A; color: white; font-size: 12px;">
            <p style="margin: 0;">🌿 Dr Roni Sapir - Complementary Medicine Clinic</p>
          </div>
        </div>
      `,
    });

    console.log("Notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending therapist notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
