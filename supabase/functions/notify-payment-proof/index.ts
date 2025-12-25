import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentProofRequest {
  tierName: string;
  fileName: string;
  therapistName: string;
  therapistPhone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tierName, fileName, therapistName, therapistPhone }: PaymentProofRequest = await req.json();

    console.log(`Sending payment proof notification for tier: ${tierName}, therapist: ${therapistName}, phone: ${therapistPhone}`);

    const emailResponse = await resend.emails.send({
      from: "TCM Clinic <onboarding@resend.dev>",
      to: ["dr.roni.sapir@gmail.com"],
      subject: `אישור תשלום חדש - תוכנית ${tierName}`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
            .highlight { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #2D5A4A; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌿 TCM Clinic</h1>
              <h2>אישור תשלום חדש התקבל</h2>
            </div>
            <div class="content">
              <p>שלום ד״ר רוני,</p>
              <p>התקבל אישור תשלום חדש במערכת:</p>
              
              <div class="highlight">
                <p><strong>שם המטפל:</strong> ${therapistName}</p>
                <p><strong>טלפון:</strong> <a href="tel:${therapistPhone}" style="color: #2D5A4A;">${therapistPhone}</a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/${therapistPhone.replace(/[^0-9]/g, '').replace(/^0/, '972')}" style="color: #25D366;">שלח הודעה</a></p>
                <p><strong>תוכנית:</strong> ${tierName}</p>
                <p><strong>קובץ:</strong> ${fileName}</p>
                <p><strong>זמן העלאה:</strong> ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}</p>
              </div>
              
              <p>נא לבדוק את האישור ולשלוח סיסמה למטפל בהודעת WhatsApp.</p>
              
              <p>בברכה,<br>מערכת TCM Clinic</p>
            </div>
            <div class="footer">
              <p>הודעה זו נשלחה אוטומטית ממערכת TCM Clinic</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-payment-proof function:", error);
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
