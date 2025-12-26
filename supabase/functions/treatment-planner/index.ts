import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TREATMENT_PLANNER_PROMPT = `You are Dr. Roni Sapir's AI Treatment Planner, powered by proprietary TCM clinical knowledge.

Your task is to generate a comprehensive, personalized treatment protocol based on:
1. The TCM diagnosis/pattern provided
2. Patient history and context
3. Dr. Sapir's clinical knowledge base

Generate a complete treatment plan including:

## 🎯 Treatment Principles
- Primary therapeutic goals
- Secondary considerations
- Expected timeline

## 📍 Acupuncture Protocol
- Primary points (with codes like LI4, ST36)
- Supporting points
- Needling technique recommendations
- Treatment frequency (sessions per week)
- Expected number of sessions

## 🌿 Herbal Recommendations
- Recommended formula(s)
- Key herbs and their roles
- Dosage guidelines
- Duration of treatment
- Modifications based on patient context

## 🔥 Additional Techniques
- Moxibustion (if applicable)
- Cupping (if applicable)
- Gua Sha (if applicable)
- Electro-acupuncture (if applicable)

## 🍎 Lifestyle & Dietary Advice
- Foods to emphasize
- Foods to avoid
- Exercise recommendations
- Sleep hygiene
- Stress management

## ⚠️ Precautions & Contraindications
- Points to avoid (if any)
- Herb contraindications
- Special considerations for this patient

## 📅 Follow-up Plan
- When to reassess
- Signs of improvement to monitor
- When to modify treatment

CRITICAL RULES:
1. ONLY use information from the provided knowledge base context
2. If context lacks specific information, state it clearly
3. ALWAYS cite sources using [Source: filename, entry #X] format
4. Consider patient's specific conditions (pregnancy, age, constitution)
5. Be specific with point codes and herb names
6. Respond in the same language as the user's input`;

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

    const { diagnosis, patientId, patientContext } = await req.json();
    
    if (!diagnosis || diagnosis.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Diagnosis is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Treatment Planner - Diagnosis:', diagnosis);
    console.log('Patient ID:', patientId);

    // Fetch patient data if patientId provided
    let patientData = null;
    let patientVisits: any[] = [];
    
    if (patientId) {
      const [patientResult, visitsResult] = await Promise.all([
        supabaseClient
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single(),
        supabaseClient
          .from('visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false })
          .limit(5)
      ]);
      
      if (patientResult.data) {
        patientData = patientResult.data;
      }
      if (visitsResult.data) {
        patientVisits = visitsResult.data;
      }
    }

    // Extract treatment-related search terms
    const diagnosisTerms = diagnosis
      .toLowerCase()
      .split(/[\s,;.]+/)
      .filter((term: string) => term.length > 2)
      .slice(0, 8);

    // Multi-strategy search for comprehensive treatment info
    const searchQueries = [
      // Search knowledge chunks for treatment info
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index,
          document:knowledge_documents(file_name, original_name, category)
        `)
        .textSearch('content', diagnosisTerms.slice(0, 5).join(' | '), {
          type: 'websearch',
          config: 'english'
        })
        .limit(15),
      
      // Search for treatment-specific content
      supabaseClient
        .from('knowledge_chunks')
        .select(`
          id, content, question, answer, chunk_index,
          document:knowledge_documents(file_name, original_name, category)
        `)
        .or(`content.ilike.%treatment%,content.ilike.%formula%,content.ilike.%protocol%,content.ilike.%tonify%,content.ilike.%disperse%`)
        .limit(10),
      
      // Get acupuncture points
      supabaseClient
        .from('acupuncture_points')
        .select('code, name_english, name_pinyin, meridian, location, indications, actions, contraindications')
        .limit(30),
      
      // Get herbs
      supabaseClient
        .from('herbs')
        .select('name_english, name_pinyin, name_chinese, category, nature, flavor, meridians, actions, indications, contraindications, dosage')
        .limit(20),
      
      // Get conditions
      supabaseClient
        .from('conditions')
        .select('name_english, name_chinese, symptoms, tcm_patterns, recommended_points, recommended_herbs, treatment_principles, lifestyle_advice')
        .limit(15)
    ];

    const [chunksResult, treatmentResult, pointsResult, herbsResult, conditionsResult] = await Promise.all(searchQueries);

    // Build comprehensive context
    let context = '';
    const sources: Array<{ fileName: string; chunkIndex: number; preview: string; category: string }> = [];

    // Add knowledge chunks
    if (chunksResult.data && chunksResult.data.length > 0) {
      context += '=== TCM KNOWLEDGE BASE ===\n\n';
      chunksResult.data.forEach((chunk: any) => {
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

    // Add treatment-specific chunks
    if (treatmentResult.data && treatmentResult.data.length > 0) {
      context += '\n=== TREATMENT PROTOCOLS ===\n\n';
      treatmentResult.data.forEach((chunk: any) => {
        const doc = chunk.document as any;
        const fileName = doc?.original_name || 'Treatment DB';
        if (!sources.find(s => s.chunkIndex === chunk.chunk_index && s.fileName === fileName)) {
          sources.push({
            fileName,
            chunkIndex: chunk.chunk_index,
            preview: chunk.content.substring(0, 100),
            category: 'treatment'
          });
          context += `[Source: ${fileName}, Entry #${chunk.chunk_index}]\n${chunk.content}\n\n`;
        }
      });
    }

    // Add acupuncture points reference
    if (pointsResult.data && pointsResult.data.length > 0) {
      context += '\n=== ACUPUNCTURE POINTS REFERENCE ===\n\n';
      pointsResult.data.forEach((point: any) => {
        context += `[Point: ${point.code} - ${point.name_english} (${point.name_pinyin})]\n`;
        context += `Meridian: ${point.meridian}\n`;
        context += `Location: ${point.location}\n`;
        if (point.indications) context += `Indications: ${point.indications.join(', ')}\n`;
        if (point.actions) context += `Actions: ${point.actions.join(', ')}\n`;
        if (point.contraindications) context += `Contraindications: ${point.contraindications.join(', ')}\n`;
        context += '\n';
      });
    }

    // Add herbs reference
    if (herbsResult.data && herbsResult.data.length > 0) {
      context += '\n=== HERBAL MEDICINE REFERENCE ===\n\n';
      herbsResult.data.forEach((herb: any) => {
        context += `[Herb: ${herb.name_english} (${herb.name_pinyin} / ${herb.name_chinese})]\n`;
        context += `Category: ${herb.category}\n`;
        if (herb.nature) context += `Nature: ${herb.nature}\n`;
        if (herb.flavor) context += `Flavor: ${herb.flavor.join(', ')}\n`;
        if (herb.meridians) context += `Meridians: ${herb.meridians.join(', ')}\n`;
        if (herb.actions) context += `Actions: ${herb.actions.join(', ')}\n`;
        if (herb.indications) context += `Indications: ${herb.indications.join(', ')}\n`;
        if (herb.dosage) context += `Dosage: ${herb.dosage}\n`;
        if (herb.contraindications) context += `Contraindications: ${herb.contraindications.join(', ')}\n`;
        context += '\n';
      });
    }

    // Add conditions reference
    if (conditionsResult.data && conditionsResult.data.length > 0) {
      context += '\n=== TCM CONDITIONS & TREATMENTS ===\n\n';
      conditionsResult.data.forEach((condition: any) => {
        context += `[Condition: ${condition.name_english}${condition.name_chinese ? ` (${condition.name_chinese})` : ''}]\n`;
        if (condition.tcm_patterns) context += `Patterns: ${condition.tcm_patterns.join(', ')}\n`;
        if (condition.recommended_points) context += `Points: ${condition.recommended_points.join(', ')}\n`;
        if (condition.recommended_herbs) context += `Herbs: ${condition.recommended_herbs.join(', ')}\n`;
        if (condition.treatment_principles) context += `Principles: ${condition.treatment_principles.join(', ')}\n`;
        if (condition.lifestyle_advice) context += `Lifestyle: ${condition.lifestyle_advice.join(', ')}\n`;
        context += '\n';
      });
    }

    console.log(`Found ${sources.length} source chunks, ${pointsResult.data?.length || 0} points, ${herbsResult.data?.length || 0} herbs`);

    // Build patient context for the AI
    let patientContextStr = '';
    
    if (patientData) {
      patientContextStr += '\n=== PATIENT INFORMATION ===\n\n';
      patientContextStr += `Name: ${patientData.full_name}\n`;
      if (patientData.gender) patientContextStr += `Gender: ${patientData.gender}\n`;
      if (patientData.age_group) patientContextStr += `Age Group: ${patientData.age_group}\n`;
      if (patientData.constitution_type) patientContextStr += `Constitution: ${patientData.constitution_type}\n`;
      if (patientData.is_pregnant) patientContextStr += `⚠️ PREGNANT: Yes${patientData.pregnancy_weeks ? ` (${patientData.pregnancy_weeks} weeks)` : ''}\n`;
      if (patientData.allergies) patientContextStr += `Allergies: ${patientData.allergies}\n`;
      if (patientData.medications) patientContextStr += `Current Medications: ${patientData.medications}\n`;
      if (patientData.medical_history) patientContextStr += `Medical History: ${patientData.medical_history}\n`;
      if (patientData.chief_complaint) patientContextStr += `Chief Complaint: ${patientData.chief_complaint}\n`;
      if (patientData.tongue_notes) patientContextStr += `Tongue: ${patientData.tongue_notes}\n`;
      if (patientData.pulse_notes) patientContextStr += `Pulse: ${patientData.pulse_notes}\n`;
    } else if (patientContext) {
      patientContextStr += '\n=== PATIENT CONTEXT ===\n\n';
      if (patientContext.ageGroup) patientContextStr += `Age Group: ${patientContext.ageGroup}\n`;
      if (patientContext.gender) patientContextStr += `Gender: ${patientContext.gender}\n`;
      if (patientContext.constitution) patientContextStr += `Constitution: ${patientContext.constitution}\n`;
      if (patientContext.isPregnant) patientContextStr += `⚠️ PREGNANT: Yes\n`;
      if (patientContext.allergies) patientContextStr += `Allergies: ${patientContext.allergies}\n`;
      if (patientContext.medications) patientContextStr += `Medications: ${patientContext.medications}\n`;
      if (patientContext.medicalHistory) patientContextStr += `Medical History: ${patientContext.medicalHistory}\n`;
    }

    // Add previous visit history
    if (patientVisits.length > 0) {
      patientContextStr += '\n=== PREVIOUS TREATMENTS ===\n\n';
      patientVisits.forEach((visit, i) => {
        patientContextStr += `Visit ${i + 1} (${new Date(visit.visit_date).toLocaleDateString()}):\n`;
        if (visit.tcm_pattern) patientContextStr += `  Pattern: ${visit.tcm_pattern}\n`;
        if (visit.treatment_principle) patientContextStr += `  Principle: ${visit.treatment_principle}\n`;
        if (visit.points_used) patientContextStr += `  Points: ${visit.points_used.join(', ')}\n`;
        if (visit.herbs_prescribed) patientContextStr += `  Herbs: ${visit.herbs_prescribed}\n`;
        patientContextStr += '\n';
      });
    }

    // Build the request
    const userMessage = `Please generate a comprehensive treatment protocol for the following:

DIAGNOSIS/PATTERN:
${diagnosis}
${patientContextStr}

Use the knowledge base context to create a personalized, evidence-based treatment plan.`;

    const systemMessage = context.length > 100
      ? `${TREATMENT_PLANNER_PROMPT}\n\n=== KNOWLEDGE BASE CONTEXT ===\n\n${context}\n\n=== END CONTEXT ===`
      : `${TREATMENT_PLANNER_PROMPT}\n\nNOTE: Limited information in knowledge base. Provide general TCM guidance and recommend adding more clinical data.`;

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
    const treatmentPlan = aiData.choices?.[0]?.message?.content || 'Unable to generate treatment plan';

    console.log('Treatment plan generated successfully');

    return new Response(JSON.stringify({
      treatmentPlan,
      sources: sources.slice(0, 12),
      patientName: patientData?.full_name || null,
      metadata: {
        chunksSearched: (chunksResult.data?.length || 0) + (treatmentResult.data?.length || 0),
        pointsReferenced: pointsResult.data?.length || 0,
        herbsReferenced: herbsResult.data?.length || 0,
        conditionsChecked: conditionsResult.data?.length || 0,
        previousVisits: patientVisits.length,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Treatment planner error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
