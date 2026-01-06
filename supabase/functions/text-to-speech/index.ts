import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting for IP addresses (resets on function cold start)
const ipRateLimits = new Map<string, { count: number; resetTime: number }>();
const IP_RATE_LIMIT = 30; // requests per minute
const IP_RATE_WINDOW = 60000; // 1 minute in ms

function checkIpRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    ipRateLimits.set(ip, { count: 1, resetTime: now + IP_RATE_WINDOW });
    return { allowed: true, remaining: IP_RATE_LIMIT - 1, resetIn: IP_RATE_WINDOW };
  }

  if (record.count >= IP_RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: IP_RATE_LIMIT - record.count, resetIn: record.resetTime - now };
}

// ElevenLabs voice IDs - multilingual voices that support Hebrew
const voiceMap: Record<string, string> = {
  'Sarah': 'EXAVITQu4vr4xnSDxMaL',
  'nova': 'EXAVITQu4vr4xnSDxMaL', // Map OpenAI voice names to ElevenLabs
  'alloy': 'pFZP5JQG7iQjIQuC4Bku', // Lily
  'echo': 'onwK4e9ZLuTAKqWW03F9', // Daniel
  'fable': 'JBFqnCBsd6RMkjVDRZzb', // George
  'onyx': 'nPczCjzI2devNBz1zQrb', // Brian
  'shimmer': 'XrExE9yKIg1WjnnlVkGX', // Matilda
  'Rachel': 'EXAVITQu4vr4xnSDxMaL',
  'Matilda': 'XrExE9yKIg1WjnnlVkGX',
  'George': 'JBFqnCBsd6RMkjVDRZzb',
  'Daniel': 'onwK4e9ZLuTAKqWW03F9',
  'Lily': 'pFZP5JQG7iQjIQuC4Bku',
  'Brian': 'nPczCjzI2devNBz1zQrb',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check authentication (optional - for enhanced rate limits)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let isAuthenticated = false;

    if (authHeader && !authHeader.includes('eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6')) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        userId = user.id;
        isAuthenticated = true;
      }
    }

    // Apply rate limiting
    if (!isAuthenticated) {
      // Unauthenticated: IP-based rate limiting
      const rateCheck = checkIpRateLimit(clientIp);
      if (!rateCheck.allowed) {
        console.log(`Rate limit exceeded for IP: ${clientIp}`);
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please wait before making more requests.',
            resetIn: Math.ceil(rateCheck.resetIn / 1000)
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetIn / 1000))
            } 
          }
        );
      }
      console.log(`TTS request from IP: ${clientIp} (remaining: ${rateCheck.remaining})`);
    } else {
      // Authenticated: use database rate limiting (higher limits)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { data: recentCalls } = await supabaseAdmin
        .from('usage_logs')
        .select('created_at')
        .eq('user_id', userId)
        .eq('action_type', 'tts_generation')
        .gte('created_at', oneMinuteAgo);

      if (recentCalls && recentCalls.length >= 50) {
        console.log(`Rate limit exceeded for user: ${userId}`);
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait before making more requests.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
        );
      }
      console.log(`TTS request from user: ${userId}`);
    }

    const { text, voice = 'Sarah', language = 'he' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    // Validate text length to prevent abuse
    if (text.length > 5000) {
      throw new Error('Text exceeds maximum length of 5000 characters');
    }

    // Log usage for authenticated users
    if (userId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      try {
        await supabaseAdmin.from('usage_logs').insert({
          user_id: userId,
          action_type: 'tts_generation',
          tokens_used: Math.ceil(text.length / 100),
        });
      } catch (e) {
        console.log('Usage logging failed (non-critical):', e);
      }
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Get voice ID from mapping
    const voiceId = voiceMap[voice] || voiceMap['Sarah'];

    console.log(`Generating TTS: "${text.substring(0, 50)}..." voice=${voice} (${voiceId})`);

    // Generate speech using ElevenLabs (better Hebrew support)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Best for Hebrew
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS API error:', response.status, errorText);
      throw new Error(`ElevenLabs TTS API error: ${response.status}`);
    }

    // Convert audio buffer to base64
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
