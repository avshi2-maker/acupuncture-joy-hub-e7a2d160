import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received contact form submission");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactEmailRequest = await req.json();
    
    // Validate required fields
    if (!name || !email || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing contact from: ${name} (${email})`);

    const logoUrl = "https://hwwwioyrsbewptuwvrix.supabase.co/storage/v1/object/public/assets/clinic-logo.png";
    
    // Send notification email to clinic owner
    const notificationEmail = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["ronisapir61@gmail.com"], // Your email - hidden from public
      subject: `New Contact: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2D5A4A, #4A7C6B);">
            <img src="${logoUrl}" alt="Dr Roni Sapir Clinic" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2 style="color: #2D5A4A;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This message was sent from your website contact form.</p>
          </div>
        </div>
      `,
    });

    console.log("Notification email sent:", notificationEmail);

    // Send confirmation email to the person who submitted
    const confirmationEmail = await resend.emails.send({
      from: "Dr Roni Sapir Clinic <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2D5A4A, #4A7C6B);">
            <img src="${logoUrl}" alt="Dr Roni Sapir Clinic" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2 style="color: #2D5A4A;">Thank you for contacting us, ${name}!</h2>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>If your matter is urgent, please contact us via WhatsApp.</p>
            <br>
            <p>Best regards,<br><strong>Dr Roni Sapir - Complementary Medicine Clinic</strong></p>
          </div>
          <div style="text-align: center; padding: 15px; background: #2D5A4A; color: white; font-size: 12px;">
            <p style="margin: 0;">🌿 Holistic Healing & Traditional Chinese Medicine</p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent:", confirmationEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
