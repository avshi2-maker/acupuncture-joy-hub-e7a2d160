import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UsageAlertRequest {
  userId: string;
  email: string;
  userName: string;
  currentUsed: number;
  tierLimit: number;
  threshold: 80 | 90;
  tier: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, userName, currentUsed, tierLimit, threshold, tier }: UsageAlertRequest = await req.json();

    console.log(`Sending ${threshold}% usage alert to ${email} for user ${userId}`);

    const usagePercent = Math.round((currentUsed / tierLimit) * 100);
    const remaining = tierLimit - currentUsed;

    const urgencyColor = threshold === 90 ? "#ef4444" : "#f59e0b";
    const urgencyText = threshold === 90 ? "קריטי" : "אזהרה";

    const emailResponse = await resend.emails.send({
      from: "TCM Clinic <onboarding@resend.dev>",
      to: [email],
      subject: `⚠️ ${urgencyText}: ניצלת ${usagePercent}% מהמכסה החודשית שלך`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: ${urgencyColor}; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">⚠️ התראת שימוש - ${usagePercent}%</h1>
            </div>
            
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1f2937;">שלום ${userName},</p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                הגעת ל-<strong style="color: ${urgencyColor};">${usagePercent}%</strong> מהמכסה החודשית שלך בתוכנית <strong>${tier}</strong>.
              </p>
              
              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #64748b;">שימוש נוכחי:</span>
                  <span style="font-weight: bold; color: #1f2937;">${currentUsed} שאילתות</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #64748b;">מכסה חודשית:</span>
                  <span style="font-weight: bold; color: #1f2937;">${tierLimit} שאילתות</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">נותרו:</span>
                  <span style="font-weight: bold; color: ${urgencyColor};">${remaining} שאילתות</span>
                </div>
              </div>
              
              ${threshold === 90 ? `
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #991b1b; margin: 0;">
                  <strong>⚠️ שימו לב:</strong> כאשר המכסה תסתיים, לא תוכלו להשתמש בפיצ׳רי AI עד לתחילת החודש הבא.
                </p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://tcm-clinic.lovable.app/pricing" 
                   style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  שדרג את התוכנית שלי
                </a>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; margin-top: 32px; text-align: center;">
                TCM Clinic - מערכת ניהול לרפואה סינית
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Usage alert email sent successfully:", emailResponse);

    // Log the alert in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action_type: "usage_alert",
      tokens_used: 0,
      metadata: { threshold, usagePercent, emailSent: true },
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending usage alert:", error);
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
