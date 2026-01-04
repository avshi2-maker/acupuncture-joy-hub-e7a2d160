import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreditAlertRequest {
  level: 'warning' | 'critical';
  currentBalance: number;
  totalCredits: number;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-credit-alert: Received request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { level, currentBalance, totalCredits, userEmail, userName }: CreditAlertRequest = await req.json();

    console.log(`send-credit-alert: Sending ${level} alert to ${userEmail}`);
    console.log(`Balance: ${currentBalance}/${totalCredits}`);

    if (!userEmail) {
      console.log("send-credit-alert: No email provided, skipping");
      return new Response(
        JSON.stringify({ success: false, reason: "No email provided" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const percent = Math.round((currentBalance / totalCredits) * 100);
    const isWarning = level === 'warning';
    const isCritical = level === 'critical';

    const subject = isCritical 
      ? `⚠️ קרדיטים נמוכים מאוד - ${currentBalance} נותרו`
      : `📊 עדכון יתרת קרדיטים - ${percent}% נותר`;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: ${isCritical ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #f59e0b, #d97706)'}; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
              ${isCritical ? '⚠️ התראת קרדיטים' : '📊 עדכון יתרה'}
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 24px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
              שלום ${userName || 'מטפל יקר'},
            </p>
            
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              ${isCritical 
                ? 'נותרו לך מעט מאוד קרדיטים! מומלץ לטעון קרדיטים נוספים כדי להמשיך להשתמש בכל תכונות המערכת.'
                : 'רצינו לעדכן אותך שיתרת הקרדיטים שלך מתחילה להיגמר. מומלץ לשקול טעינת קרדיטים נוספים.'}
            </p>

            <!-- Balance Card -->
            <div style="background-color: ${isCritical ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${isCritical ? '#fee2e2' : '#fef3c7'}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px; font-weight: bold; color: ${isCritical ? '#dc2626' : '#d97706'}; margin-bottom: 8px;">
                ${currentBalance.toLocaleString()}
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                קרדיטים נותרו מתוך ${totalCredits.toLocaleString()}
              </div>
              <div style="margin-top: 12px; background-color: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
                <div style="background-color: ${isCritical ? '#dc2626' : '#d97706'}; height: 100%; width: ${percent}%; border-radius: 4px;"></div>
              </div>
              <div style="color: #6b7280; font-size: 12px; margin-top: 8px;">
                ${percent}% מהמכסה
              </div>
            </div>

            <!-- Estimate -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                <strong>הערכה:</strong> נותרו לך בערך <strong>${Math.floor(currentBalance / 5)}</strong> שאילתות AI 
                או טיפול ב-<strong>${Math.floor(currentBalance / 5)}</strong> מטופלים נוספים.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              <p style="color: #374151; font-size: 14px; margin-bottom: 16px;">
                לטעינת קרדיטים נוספים, היכנסו לדשבורד או צרו איתנו קשר
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              הודעה זו נשלחה אוטומטית מ-TCM Brain | ארנק המרפאה
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TCM Brain <alerts@resend.dev>",
        to: [userEmail],
        subject: subject,
        html: html,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("send-credit-alert: Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("send-credit-alert: Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
