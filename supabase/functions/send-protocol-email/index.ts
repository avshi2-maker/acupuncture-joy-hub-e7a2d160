import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  patientEmail: string;
  patientName: string;
  subject?: string;
  message?: string;
  protocolData: {
    diagnosis: string;
    herbalFormula?: string;
    acupuncturePoints: string[];
    nutritionAdvice: string[];
    lifestyleAdvice: string[];
    moduleName?: string;
    dateCreated?: string;
  };
  pdfBase64?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      patientEmail,
      patientName,
      subject,
      message,
      protocolData,
      pdfBase64,
    }: EmailRequest = await req.json();

    if (!patientEmail || !patientName) {
      return new Response(
        JSON.stringify({ error: "Patient email and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email HTML
    const emailSubject = subject || `Your TCM Protocol Summary - ${protocolData.moduleName || 'Clinical Navigator'}`;
    
    const pointsList = protocolData.acupuncturePoints.length > 0
      ? `<ul>${protocolData.acupuncturePoints.map(p => `<li>${p}</li>`).join('')}</ul>`
      : '<p>No specific points recorded</p>';

    const nutritionList = protocolData.nutritionAdvice.length > 0
      ? `<ul>${protocolData.nutritionAdvice.map(a => `<li>${a}</li>`).join('')}</ul>`
      : '';

    const lifestyleList = protocolData.lifestyleAdvice.length > 0
      ? `<ul>${protocolData.lifestyleAdvice.map(a => `<li>${a}</li>`).join('')}</ul>`
      : '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0F766E, #134E4A); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 24px; }
    .section h2 { color: #0F766E; font-size: 18px; border-bottom: 2px solid #0F766E; padding-bottom: 8px; margin-bottom: 12px; }
    .diagnosis { background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #0F766E; }
    .herbal { background: #FEF3C7; padding: 16px; border-radius: 8px; }
    ul { margin: 0; padding-left: 20px; }
    li { margin-bottom: 6px; }
    .footer { background: #1F2937; color: #9CA3AF; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 12px 12px; }
    .message { background: #E0F2F1; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌿 Your TCM Protocol Summary</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">${protocolData.moduleName || 'Clinical Navigator'}</p>
  </div>
  
  <div class="content">
    <p>Dear ${patientName},</p>
    
    ${message ? `<div class="message">${message}</div>` : '<p>Please find your personalized Traditional Chinese Medicine protocol summary below.</p>'}
    
    <div class="section">
      <h2>📋 Diagnosis</h2>
      <div class="diagnosis">
        <p>${protocolData.diagnosis}</p>
      </div>
    </div>

    ${protocolData.herbalFormula ? `
    <div class="section">
      <h2>🌿 Herbal Formula</h2>
      <div class="herbal">
        <p><strong>${protocolData.herbalFormula}</strong></p>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <h2>📍 Acupuncture Points</h2>
      ${pointsList}
    </div>

    ${protocolData.nutritionAdvice.length > 0 ? `
    <div class="section">
      <h2>🥗 Dietary Recommendations</h2>
      ${nutritionList}
    </div>
    ` : ''}

    ${protocolData.lifestyleAdvice.length > 0 ? `
    <div class="section">
      <h2>🧘 Lifestyle Recommendations</h2>
      ${lifestyleList}
    </div>
    ` : ''}

    <p style="margin-top: 24px;">If you have any questions about your protocol, please don't hesitate to reach out.</p>
    <p>Wishing you wellness,<br><strong>Your Healthcare Provider</strong></p>
  </div>
  
  <div class="footer">
    <p>This protocol summary is for informational purposes only and does not replace professional medical advice.</p>
    <p>© ${new Date().getFullYear()} TCM Clinical Navigator</p>
  </div>
</body>
</html>`;

    // Prepare email options
    const emailOptions: any = {
      from: "TCM Clinical <onboarding@resend.dev>",
      to: [patientEmail],
      subject: emailSubject,
      html: htmlContent,
    };

    // Add PDF attachment if provided
    if (pdfBase64) {
      emailOptions.attachments = [
        {
          filename: `TCM-Protocol-${protocolData.moduleName || 'Summary'}.pdf`,
          content: pdfBase64,
        },
      ];
    }

    // Send email via Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailOptions),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    // Log usage
    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action_type: "email_protocol",
      tokens_used: 0,
      metadata: { recipientEmail: patientEmail, hasAttachment: !!pdfBase64 },
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error sending protocol email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
