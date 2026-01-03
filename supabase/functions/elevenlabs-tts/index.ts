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
    // SECURITY: Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - valid authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // SECURITY: Rate limiting - check recent TTS calls (max 20 per minute)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentCalls, error: rateError } = await supabaseClient
      .from('usage_logs')
      .select('created_at')
      .eq('user_id', userId)
      .eq('action_type', 'tts_generation')
      .gte('created_at', oneMinuteAgo);

    if (!rateError && recentCalls && recentCalls.length >= 20) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before making more requests.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    const { text, voice = 'Rachel' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      throw new Error('Text must be less than 5000 characters');
    }

    // Log usage for rate limiting
    await supabaseClient.from('usage_logs').insert({
      user_id: userId,
      action_type: 'tts_generation',
      tokens_used: Math.ceil(text.length / 100),
    });

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    console.log(`User ${userId} generating TTS for text: "${text.substring(0, 50)}..." with voice ${voice}`);

    // ElevenLabs voice IDs - using multilingual voices that support Hebrew
    // Rachel is a good Hebrew voice, or use a custom cloned voice
    const voiceMap: Record<string, string> = {
      'Rachel': 'EXAVITQu4vr4xnSDxMaL', // Sarah - multilingual, good for Hebrew
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Matilda': 'XrExE9yKIg1WjnnlVkGX',
      'George': 'JBFqnCBsd6RMkjVDRZzb',
      'Daniel': 'onwK4e9ZLuTAKqWW03F9',
    };

    const voiceId = voiceMap[voice] || voiceMap['Rachel'];

    // Generate speech from text using ElevenLabs TTS
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Best for Hebrew
        output_format: 'mp3_44100_128',
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
      throw new Error(`ElevenLabs TTS API error: ${response.status} - ${errorText}`);
    }

    // Convert audio buffer to base64 using Deno's encoding library
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
