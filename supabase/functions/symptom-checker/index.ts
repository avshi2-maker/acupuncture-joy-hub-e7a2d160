import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYMPTOM_CHECKER_PROMPT = `You are an expert TCM (Traditional Chinese Medicine) Symptom Analyzer powered by Dr. Roni Sapir's clinical knowledge base.

Your task is to analyze patient symptoms and identify:
1. TCM PATTERNS (証型) - The underlying pattern of disharmony
2. RECOMMENDED ACUPUNCTURE POINTS - Based on the identified patterns
3. TREATMENT PRINCIPLES - Key therapeutic approaches
4. ADDITIONAL RECOMMENDATIONS - Lifestyle, dietary, or herbal suggestions if available

CRITICAL RULES:
1. ONLY use information from the provided knowledge base context
2. If context doesn't contain relevant info, say: "I need more information in the knowledge base to analyze these symptoms accurately."
3. ALWAYS cite sources using [Source: filename, entry #X] format
4. Be specific about which symptoms led to which pattern identification
5. List acupuncture points with their codes (e.g., LI4, ST36) when available
6. Include contraindications or cautions when mentioned in sources
7. Respond in the same language as the user's input

FORMAT YOUR RESPONSE AS:
## 🔍 Pattern Analysis
[Identified TCM patterns based on symptoms]

## 📍 Recommended Acupuncture Points
[List of points with codes and brief indications]

## 🎯 Treatment Principles
[Key therapeutic approaches]

## 💡 Additional Recommendations
[Lifestyle, dietary advice if available in sources]

## 📚 Sources
[List all source citations]`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { symptoms, patientInfo } = await req.json();
    
    if (!symptoms || symptoms.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Symptoms description is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Symptom Checker - Input symptoms:', symptoms);
    console.log('Patient info:', patientInfo);

    // Extract key symptom terms for better search
    const symptomTerms = symptoms
      .toLowerCase()
      .split(/[\s,;.]+/)
      .filter((term: string) => term.length > 2)
      .slice(0, 10);

    // Multi-strategy search for better coverage
    const searchQueries = [
      // Full text search on content
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index,
          document:knowledge_documents(file_name, original_name, category)
        `)
        .textSearch('content', symptomTerms.slice(0, 5).join(' | '), {
          type: 'websearch',
          config: 'english'
        })
        .limit(15),
      
      // Search for patterns/syndromes
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index,
          document:knowledge_documents(file_name, original_name, category)
        `)
        .or(`content.ilike.%pattern%,content.ilike.%syndrome%,content.ilike.%deficiency%,content.ilike.%excess%`)
        .limit(10),
      
      // Search acupuncture points table
      supabaseClient
        .from('acupuncture_points')
        .select('code, name_english, name_pinyin, meridian, location, indications, actions')
        .limit(20),
      
      // Search conditions table
      supabaseClient
        .from('conditions')
        .select('name_english, name_chinese, symptoms, tcm_patterns, recommended_points, treatment_principles, lifestyle_advice')
        .limit(10)
    ];

    const [chunksResult, patternsResult, pointsResult, conditionsResult] = await Promise.all(searchQueries);

    // Build comprehensive context
    let context = '';
    const sources: Array<{ fileName: string; chunkIndex: number; preview: string; category: string }> = [];

    // Add knowledge chunks
    if (chunksResult.data && chunksResult.data.length > 0) {
      context += '=== TCM KNOWLEDGE BASE ===\n\n';
      chunksResult.data.forEach((chunk: any, i: number) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || doc?.file_name || 'Knowledge Base';
        sources.push({
          fileName,
          chunkIndex: chunk.chunk_index,
          preview: (chunk.question || chunk.content).substring(0, 100),
          category: doc?.category || 'general'
        });
        
        if (chunk.question && chunk.answer) {
          context += `[Source: ${fileName}, Entry #${chunk.chunk_index}]\nQ: ${chunk.question}\nA: ${chunk.answer}\n\n`;
        } else {
          context += `[Source: ${fileName}, Entry #${chunk.chunk_index}]\n${chunk.content}\n\n`;
        }
      });
    }

    // Add pattern-specific chunks
    if (patternsResult.data && patternsResult.data.length > 0) {
      context += '\n=== TCM PATTERNS & SYNDROMES ===\n\n';
      patternsResult.data.forEach((chunk: any) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || 'Patterns DB';
        if (!sources.find(s => s.chunkIndex === chunk.chunk_index && s.fileName === fileName)) {
          sources.push({
            fileName,
            chunkIndex: chunk.chunk_index,
            preview: chunk.content.substring(0, 100),
            category: 'patterns'
          });
          context += `[Source: ${fileName}, Entry #${chunk.chunk_index}]\n${chunk.content}\n\n`;
        }
      });
    }

    // Add acupuncture points
    if (pointsResult.data && pointsResult.data.length > 0) {
      context += '\n=== ACUPUNCTURE POINTS REFERENCE ===\n\n';
      pointsResult.data.forEach((point: any) => {
        context += `[Point: ${point.code} - ${point.name_english} (${point.name_pinyin})]\n`;
        context += `Meridian: ${point.meridian}\n`;
        context += `Location: ${point.location}\n`;
        if (point.indications) context += `Indications: ${point.indications.join(', ')}\n`;
        if (point.actions) context += `Actions: ${point.actions.join(', ')}\n`;
        context += '\n';
      });
    }

    // Add conditions data
    if (conditionsResult.data && conditionsResult.data.length > 0) {
      context += '\n=== TCM CONDITIONS DATABASE ===\n\n';
      conditionsResult.data.forEach((condition: any) => {
        context += `[Condition: ${condition.name_english}${condition.name_chinese ? ` (${condition.name_chinese})` : ''}]\n`;
        if (condition.symptoms) context += `Symptoms: ${condition.symptoms.join(', ')}\n`;
        if (condition.tcm_patterns) context += `TCM Patterns: ${condition.tcm_patterns.join(', ')}\n`;
        if (condition.recommended_points) context += `Points: ${condition.recommended_points.join(', ')}\n`;
        if (condition.treatment_principles) context += `Principles: ${condition.treatment_principles.join(', ')}\n`;
        context += '\n';
      });
    }

    console.log(`Found ${sources.length} source chunks, ${pointsResult.data?.length || 0} points, ${conditionsResult.data?.length || 0} conditions`);

    // Build the analysis request
    const patientContext = patientInfo 
      ? `\n\nPatient Context:\n- Age Group: ${patientInfo.ageGroup || 'Not specified'}\n- Gender: ${patientInfo.gender || 'Not specified'}\n- Constitution: ${patientInfo.constitution || 'Not specified'}\n- Pregnancy Status: ${patientInfo.isPregnant ? 'Pregnant' : 'Not pregnant'}`
      : '';

    const userMessage = `Please analyze these symptoms and identify TCM patterns with recommended acupuncture points:

SYMPTOMS DESCRIBED:
${symptoms}
${patientContext}

Use ONLY the knowledge base context below. Do not invent information.`;

    const systemMessage = context.length > 100
      ? `${SYMPTOM_CHECKER_PROMPT}\n\n=== KNOWLEDGE BASE CONTEXT ===\n\n${context}\n\n=== END CONTEXT ===`
      : `${SYMPTOM_CHECKER_PROMPT}\n\nNOTE: Limited information found in knowledge base. Provide general guidance and recommend adding more clinical data.`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || 'Unable to generate analysis';

    // Log the analysis for debugging
    console.log('Symptom analysis completed successfully');

    return new Response(JSON.stringify({
      analysis,
      sources: sources.slice(0, 10),
      metadata: {
        chunksSearched: chunksResult.data?.length || 0,
        patternsFound: patternsResult.data?.length || 0,
        pointsReferenced: pointsResult.data?.length || 0,
        conditionsChecked: conditionsResult.data?.length || 0,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Symptom checker error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
