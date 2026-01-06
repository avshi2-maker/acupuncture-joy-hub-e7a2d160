import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional authentication - if user is logged in, use their ID for rate limiting
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader && !authHeader.includes('eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6')) {
      // Only try to get user if it's not the anon key
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    // Create admin client for logging (optional)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting by IP if no user
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitKey = userId || `ip:${clientIp}`;
    
    console.log(`TTS request from: ${userId ? `user ${userId}` : `IP ${clientIp}`}`);

    const { text, voice = 'nova', language = 'he' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    // Validate text length to prevent abuse
    if (text.length > 5000) {
      throw new Error('Text exceeds maximum length of 5000 characters');
    }

    // Log usage (non-blocking, optional)
    if (userId) {
      try {
        await supabaseAdmin.from('usage_logs').insert({
          user_id: userId,
          action_type: 'openai_tts_generation',
          tokens_used: Math.ceil(text.length / 100),
        });
      } catch (e) {
        console.log('Usage logging failed (non-critical):', e);
      }
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log(`User ${userId} generating TTS for text: "${text.substring(0, 50)}..." in ${language} with voice ${voice}`);

    // Generate speech from text using OpenAI TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error:', response.status, errorText);
      throw new Error(`OpenAI TTS API error: ${response.status}`);
    }

    // Convert audio buffer to base64 using Deno's encoding library (prevents stack overflow)
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(arrayBuffer);

    console.log('TTS audio generated successfully, size:', arrayBuffer.byteLength, 'bytes');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
