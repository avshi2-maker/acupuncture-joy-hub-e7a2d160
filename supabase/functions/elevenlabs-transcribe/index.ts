import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const enableDiarization = formData.get("diarize") === "true";
    const languageCode = formData.get("language") || "heb"; // Hebrew default

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Transcribing audio with diarization: ${enableDiarization}, language: ${languageCode}`);

    // Prepare form data for ElevenLabs API
    const apiFormData = new FormData();
    apiFormData.append("file", audioFile);
    apiFormData.append("model_id", "scribe_v1");
    apiFormData.append("diarize", enableDiarization ? "true" : "false");
    apiFormData.append("tag_audio_events", "true");
    
    if (languageCode) {
      apiFormData.append("language_code", languageCode as string);
    }

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs STT API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Transcription failed", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log("Transcription completed successfully");

    // Format response with speaker labels if diarization is enabled
    let formattedText = result.text || "";
    const speakers: { [key: string]: string[] } = {};
    
    if (enableDiarization && result.words) {
      // Group words by speaker and create formatted transcript
      let currentSpeaker = "";
      let currentSegment = "";
      const segments: { speaker: string; text: string; start: number; end: number }[] = [];

      for (const word of result.words) {
        const speaker = word.speaker || "Unknown";
        
        if (speaker !== currentSpeaker) {
          if (currentSegment.trim()) {
            segments.push({
              speaker: currentSpeaker,
              text: currentSegment.trim(),
              start: 0,
              end: 0,
            });
          }
          currentSpeaker = speaker;
          currentSegment = word.text + " ";
        } else {
          currentSegment += word.text + " ";
        }

        // Track unique speakers
        if (!speakers[speaker]) {
          speakers[speaker] = [];
        }
      }

      // Add last segment
      if (currentSegment.trim()) {
        segments.push({
          speaker: currentSpeaker,
          text: currentSegment.trim(),
          start: 0,
          end: 0,
        });
      }

      // Create formatted text with speaker labels
      formattedText = segments
        .map(seg => `[${seg.speaker}]: ${seg.text}`)
        .join("\n\n");
    }

    return new Response(
      JSON.stringify({
        text: result.text,
        formatted_text: formattedText,
        words: result.words || [],
        speakers: Object.keys(speakers),
        audio_events: result.audio_events || [],
        diarization_enabled: enableDiarization,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in transcription:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
