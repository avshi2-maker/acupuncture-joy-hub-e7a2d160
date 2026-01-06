import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Load the TCM Pattern Differentiation knowledge from the CSV
const TCM_PATTERNS_KNOWLEDGE = `
Question,Answer,TCM Acupuncture Points,Chinese Pharmacopeia Formula
What are the main symptoms of Spleen Qi Deficiency?,"Fatigue, poor appetite, loose stools, abdominal distension after eating, pale tongue with tooth marks, weak pulse","ST36 (Zusanli), SP6 (Sanyinjiao), SP3 (Taibai), CV12 (Zhongwan)",Si Jun Zi Tang (Four Gentlemen Decoction)
How does Lung Qi Deficiency manifest?,"Shortness of breath, weak voice, spontaneous sweating, susceptibility to colds, pale tongue, weak pulse","LU9 (Taiyuan), LU7 (Lieque), BL13 (Feishu), CV17 (Shanzhong)",Bu Fei Tang (Tonify the Lungs Decoction)
What characterizes Heart Qi Deficiency?,"Palpitations, shortness of breath on exertion, pale complexion, spontaneous sweating, pale tongue, weak pulse","HT7 (Shenmen), PC6 (Neiguan), BL15 (Xinshu), CV14 (Juque)",Yang Xin Tang (Nourish the Heart Decoction)
What are signs of Kidney Qi Not Firm?,"Frequent urination, enuresis, spermatorrhea, premature ejaculation, lower back soreness, pale tongue, deep weak pulse","KI3 (Taixi), CV4 (Guanyuan), BL23 (Shenshu), GV4 (Mingmen)",Suo Quan Wan (Shut the Sluice Pill)
How does Qi Sinking manifest?,"Prolapse of organs, chronic diarrhea, bearing down sensation, fatigue, shortness of breath, pale tongue, weak pulse","GV20 (Baihui), CV6 (Qihai), ST36 (Zusanli), SP6 (Sanyinjiao)",Bu Zhong Yi Qi Tang (Tonify the Middle and Augment the Qi Decoction)
What are the primary signs of Liver Blood Deficiency?,"Dizziness, blurred vision, dry eyes, scanty menses, pale nails, pale tongue, thin pulse","LV8 (Ququan), BL18 (Ganshu), SP6 (Sanyinjiao), ST36 (Zusanli)",Si Wu Tang (Four Substances Decoction)
How does Heart Blood Deficiency present?,"Insomnia, poor memory, palpitations, dizziness, pale face, pale tongue, thin pulse","HT7 (Shenmen), SP6 (Sanyinjiao), BL15 (Xinshu), BL17 (Geshu)",Gui Pi Tang (Restore the Spleen Decoction)
What characterizes Spleen Not Controlling Blood?,"Easy bruising, blood in stool, excessive menstruation, fatigue, poor appetite, pale tongue, weak pulse","SP10 (Xuehai), SP1 (Yinbai), SP6 (Sanyinjiao), BL20 (Pishu)",Gui Pi Tang (Restore the Spleen Decoction)
What are symptoms of General Blood Deficiency?,"Pale complexion, dizziness, dry skin and hair, numbness, scanty menses, pale tongue, thin pulse","BL17 (Geshu), SP6 (Sanyinjiao), ST36 (Zusanli), CV4 (Guanyuan)",Dang Gui Bu Xue Tang (Tangkuei Decoction to Tonify Blood)
How does Blood Stasis with Deficiency manifest?,"Fixed stabbing pain, dark complexion, purple lips, varicose veins, irregular menses with clots, purple tongue, choppy pulse","SP10 (Xuehai), SP6 (Sanyinjiao), LV3 (Taichong), BL17 (Geshu)",Tao Hong Si Wu Tang (Four Substances Decoction with Safflower and Peach Pit)
What are the key features of Kidney Yang Deficiency?,"Cold lower back and knees, cold limbs, impotence, infertility, frequent pale urination, pale swollen tongue, deep weak pulse","KI3 (Taixi), KI7 (Fuliu), BL23 (Shenshu), GV4 (Mingmen), CV4 (Guanyuan)",Jin Gui Shen Qi Wan (Kidney Qi Pill from the Golden Cabinet)
How does Spleen Yang Deficiency present?,"Cold abdomen, loose stools with undigested food, edema, cold limbs, pale swollen tongue with wet coat, slow weak pulse","ST36 (Zusanli), SP6 (Sanyinjiao), BL20 (Pishu), CV12 (Zhongwan), moxa GV4",Fu Zi Li Zhong Wan (Prepared Aconite Pill to Regulate the Middle)
What characterizes Heart Yang Deficiency?,"Palpitations, cold limbs, purple lips, chest oppression, shortness of breath, pale purple tongue, deep weak pulse","HT7 (Shenmen), PC6 (Neiguan), CV17 (Shanzhong), BL15 (Xinshu), moxa CV6",Bao Yuan Tang (Preserve the Basal Decoction)
What are signs of Yang Deficiency with Water Overflowing?,"Edema especially lower body, scanty urination, heaviness, cold limbs, pale swollen tongue, deep slow pulse","SP9 (Yinlingquan), SP6 (Sanyinjiao), CV9 (Shuifen), BL23 (Shenshu), KI7 (Fuliu)",Zhen Wu Tang (True Warrior Decoction)
What are the main symptoms of Kidney Yin Deficiency?,"Night sweats, tinnitus, lower back soreness, dizziness, hot flashes, red tongue with no coat, rapid thin pulse","KI3 (Taixi), KI6 (Zhaohai), SP6 (Sanyinjiao), KI10 (Yingu)",Liu Wei Di Huang Wan (Six Ingredient Pill with Rehmannia)
How does Lung Yin Deficiency present?,"Dry cough with little sputum, dry throat, hoarse voice, afternoon fever, red tongue with little coat, rapid thin pulse","LU10 (Yuji), LU6 (Kongzui), LU9 (Taiyuan), KI6 (Zhaohai)",Bai He Gu Jin Tang (Lily Bulb Decoction to Preserve the Metal)
What characterizes Heart Yin Deficiency?,"Insomnia, dream-disturbed sleep, palpitations, anxiety, night sweats, red tongue tip, rapid thin pulse","HT6 (Yinxi), HT7 (Shenmen), PC6 (Neiguan), KI6 (Zhaohai)",Tian Wang Bu Xin Dan (Emperor of Heaven's Special Pill to Tonify the Heart)
What are signs of Liver Yin Deficiency?,"Dry eyes, blurred vision, dizziness, irritability, night sweats, red tongue with little coat, wiry thin pulse","LV8 (Ququan), KI3 (Taixi), SP6 (Sanyinjiao), GB37 (Guangming)",Qi Ju Di Huang Wan (Lycium Fruit, Chrysanthemum and Rehmannia Pill)
How does Stomach Yin Deficiency manifest?,"Epigastric discomfort, dry mouth with little desire to drink, constipation, no appetite, red tongue with little coat, rapid thin pulse","ST36 (Zusanli), ST44 (Neiting), CV12 (Zhongwan), SP6 (Sanyinjiao)",Yi Wei Tang (Benefit the Stomach Decoction)
What are the characteristics of Lung Heat?,"Cough with yellow sticky sputum, fever, thirst, sore throat, red tongue with yellow coat, rapid pulse","LU5 (Chize), LU10 (Yuji), LI4 (Hegu), LI11 (Quchi)",Ma Xing Shi Gan Tang (Ephedra, Apricot Kernel, Gypsum and Licorice Decoction)
How does Stomach Heat present?,"Excessive hunger, burning epigastric pain, acid reflux, bad breath, bleeding gums, red tongue with yellow coat, rapid pulse","ST44 (Neiting), ST45 (Lidui), CV12 (Zhongwan), PC6 (Neiguan)",Qing Wei San (Clear the Stomach Powder)
What characterizes Liver Fire Blazing Upward?,"Headache, red eyes, irritability, bitter taste, tinnitus, constipation, red tongue with yellow coat, wiry rapid pulse","LV2 (Xingjian), GB43 (Xiaxi), LI11 (Quchi), GB20 (Fengchi)",Long Dan Xie Gan Tang (Gentiana Longdancao Decoction to Drain the Liver)
What are signs of Heart Fire?,"Palpitations, insomnia, mouth ulcers, dark scanty urine, irritability, red tongue tip with yellow coat, rapid pulse","HT8 (Shaofu), PC8 (Laogong), HT7 (Shenmen), SI2 (Qiangu)",Dao Chi San (Guide Out the Red Powder)
How does Damp-Heat in Liver and Gallbladder manifest?,"Jaundice, bitter taste, hypochondriac pain, nausea, scanty dark urine, red tongue with yellow greasy coat, wiry rapid pulse","GB34 (Yanglingquan), LV14 (Qimen), LI11 (Quchi), DU14 (Dazhui)",Long Dan Xie Gan Tang (Gentiana Longdancao Decoction to Drain the Liver)
What characterizes Damp-Heat in the Spleen?,"Abdominal fullness, poor appetite, heavy sensation, loose stools with odor, scanty dark urine, yellow greasy tongue coat, slippery rapid pulse","SP9 (Yinlingquan), ST44 (Neiting), CV12 (Zhongwan), LI11 (Quchi)",Huang Lian Jie Du Tang (Coptis Decoction to Resolve Toxicity)
What are symptoms of Bladder Damp-Heat?,"Frequent urgent painful urination, burning sensation, dark cloudy urine, lower abdominal pain, red tongue with yellow greasy coat, slippery rapid pulse","BL28 (Pangguangshu), CV3 (Zhongji), SP9 (Yinlingquan), SP6 (Sanyinjiao)",Ba Zheng San (Eight Herb Powder for Rectification)
What are the main symptoms of Phlegm-Damp?,"Chest oppression, nausea, heavy sensation, profuse white sputum, white greasy tongue coat, slippery pulse","CV12 (Zhongwan), ST40 (Fenglong), SP9 (Yinlingquan), PC6 (Neiguan)",Er Chen Tang (Two-Cured Decoction)
How does Phlegm-Heat in the Lungs present?,"Cough with thick yellow sputum, fever, chest pain, thirst, red tongue with yellow greasy coat, slippery rapid pulse","LU5 (Chize), ST40 (Fenglong), LI11 (Quchi), CV17 (Shanzhong)",Qing Qi Hua Tan Tang (Clear the Qi and Transform Phlegm Decoction)
What characterizes Wind-Phlegm?,"Sudden dizziness, vertigo, nausea, vomiting phlegm, numbness, white greasy tongue coat, wiry slippery pulse","ST40 (Fenglong), GB20 (Fengchi), GV20 (Baihui), PC6 (Neiguan)",Ban Xia Bai Zhu Tian Ma Tang (Pinellia, Atractylodes, and Gastrodia Decoction)
What are signs of Phlegm Misting the Heart?,"Mental confusion, muddled thinking, depression, aphasia, white greasy tongue coat, slippery pulse","HT7 (Shenmen), PC5 (Jianshi), ST40 (Fenglong), GV20 (Baihui)",Di Tan Tang (Scour Phlegm Decoction)
What are the main features of Liver Qi Stagnation?,"Hypochondriac distension, mood swings, sighing, irregular menses, breast distension, normal tongue, wiry pulse","LV3 (Taichong), LV14 (Qimen), GB34 (Yanglingquan), PC6 (Neiguan)",Xiao Yao San (Rambling Powder)
How does Qi Stagnation in the Stomach present?,"Epigastric distension and pain, belching, hiccups, poor appetite, symptoms worsen with emotions, normal tongue, wiry pulse","CV12 (Zhongwan), PC6 (Neiguan), ST36 (Zusanli), LV3 (Taichong)",Chai Hu Shu Gan San (Bupleurum Powder to Spread the Liver)
What characterizes Qi Stagnation in the Chest?,"Chest oppression, sighing, breathing difficulty, symptoms worsen with stress, normal tongue, wiry pulse","CV17 (Shanzhong), PC6 (Neiguan), GB34 (Yanglingquan), LV3 (Taichong)",Chai Hu Shu Gan San (Bupleurum Powder to Spread the Liver)
What are signs of Qi Stagnation with Blood Stasis?,"Fixed stabbing pain, masses, dark complexion, irregular painful menses with clots, purple tongue, wiry choppy pulse","LV3 (Taichong), SP10 (Xuehai), SP6 (Sanyinjiao), BL17 (Geshu)",Xue Fu Zhu Yu Tang (Drive Out Stasis from the Mansion of Blood Decoction)
What are the primary signs of Heart Blood Stasis?,"Stabbing chest pain, palpitations, purple lips and tongue, cold limbs, purple tongue with dark spots, choppy pulse","PC6 (Neiguan), HT7 (Shenmen), BL17 (Geshu), SP10 (Xuehai)",Xue Fu Zhu Yu Tang (Drive Out Stasis from the Mansion of Blood Decoction)
How does Liver Blood Stasis present?,"Fixed hypochondriac pain, masses in abdomen, irregular painful menses with dark clots, purple tongue, wiry choppy pulse","LV3 (Taichong), LV14 (Qimen), SP10 (Xuehai), BL17 (Geshu)",Ge Xia Zhu Yu Tang (Drive Out Stasis Below the Diaphragm Decoction)
What characterizes Uterine Blood Stasis?,"Severe menstrual cramps with dark clots, stabbing lower abdominal pain, dark purple menses, purple tongue, wiry pulse","SP8 (Diji), SP10 (Xuehai), CV6 (Qihai), LV3 (Taichong)",Shao Fu Zhu Yu Tang (Drive Out Stasis from the Lower Abdomen Decoction)
What are the characteristics of Wind-Cold Invasion?,"Aversion to cold, fever, no sweating, occipital headache, body aches, thin white tongue coat, floating tight pulse","LI4 (Hegu), BL12 (Fengmen), GB20 (Fengchi), LU7 (Lieque)",Gui Zhi Tang (Cinnamon Twig Decoction) or Jing Fang Bai Du San
How does Wind-Heat Invasion present?,"Fever with slight aversion to wind, sore throat, sweating, thirst, red tongue tip with thin yellow coat, floating rapid pulse","LI4 (Hegu), LI11 (Quchi), LU7 (Lieque), GV14 (Dazhui)",Yin Qiao San (Honeysuckle and Forsythia Powder)
What characterizes Liver Wind Internal Stirring?,"Tremors, tics, dizziness, convulsions, numbness, red tongue, wiry rapid pulse","LV3 (Taichong), GB20 (Fengchi), GV20 (Baihui), LI4 (Hegu)",Tian Ma Gou Teng Yin (Gastrodia and Uncaria Decoction)
What are signs of Wind-Dampness Bi Syndrome?,"Wandering joint pain, heaviness, numbness, limited movement, white greasy tongue coat, slippery or wiry pulse","local ashi points, GB34 (Yanglingquan), SP9 (Yinlingquan), LI4 (Hegu)",Juan Bi Tang (Remove Painful Obstruction Decoction)
What are the main symptoms of Spleen Dampness?,"Heaviness, abdominal distension, poor appetite, loose stools, white greasy tongue coat, slippery pulse","SP9 (Yinlingquan), ST36 (Zusanli), CV12 (Zhongwan), ST40 (Fenglong)",Ping Wei San (Calm the Stomach Powder)
How does Damp-Cold present?,"Heavy sensation, cold limbs, loose stools, no thirst, white greasy tongue coat, slow slippery pulse","SP9 (Yinlingquan), ST36 (Zusanli), CV9 (Shuifen), moxa CV6",Wei Ling Tang (Calm the Stomach and Poria Decoction)
What characterizes Cold-Dampness Bi Syndrome?,"Fixed joint pain worse with cold and damp, heaviness, numbness, white greasy tongue coat, slow slippery pulse","local ashi points, GB34 (Yanglingquan), SP9 (Yinlingquan), moxa affected area",Wu Tou Tang (Aconite Accessory Root Decoction)
What are signs of Dampness Obstructing the Spleen?,"Fullness sensation, no appetite, nausea, heavy limbs, white thick greasy tongue coat, slippery pulse","SP9 (Yinlingquan), CV12 (Zhongwan), ST40 (Fenglong), PC6 (Neiguan)",Huo Xiang Zheng Qi San (Agastache Powder to Rectify the Qi)
How does Lower Burner Damp-Cold manifest?,"Lower abdominal cold pain, leucorrhea (white and watery), scanty urination, pale tongue with white greasy coat, deep slow pulse","CV3 (Zhongji), SP9 (Yinlingquan), SP6 (Sanyinjiao), moxa CV4",Wan Dai Tang (End Discharge Decoction)
What characterizes Damp-Heat in Lower Burner?,"Burning urination, yellow foul-smelling discharge, lower abdominal pain, red tongue with yellow greasy coat, slippery rapid pulse","CV3 (Zhongji), SP9 (Yinlingquan), SP6 (Sanyinjiao), LV5 (Ligou)",Long Dan Xie Gan Tang (Gentiana Longdancao Decoction to Drain the Liver)
`;

const SYSTEM_PROMPT = `*** BIAN ZHENG (辨証) - TCM PATTERN DIFFERENTIATION EXPERT ***

CONTEXT: You are a Senior TCM Diagnostician performing "Bian Zheng" (Pattern Differentiation).
DATABASE: Use ONLY the provided CSV knowledge base below for matching patterns.

${TCM_PATTERNS_KNOWLEDGE}

TASK:
Analyze the patient's symptoms to identify the EXACT TCM Pattern and provide the complete treatment protocol from the knowledge base.

LOGIC PROCESS:
1. **Analyze Eight Principles (八纲辨证):**
   - Deficient (虚) vs. Excess (实)?
   - Cold (寒) vs. Heat (热)?
   - Internal (里) vs. External (表)?
   - Yin (阴) vs. Yang (阳)?

2. **Identify Zang-Fu Organ:**
   - Digestive/Fatigue symptoms -> Spleen (脾)
   - Respiratory/Sweat symptoms -> Lung (肺)
   - Emotional/Sleep/Palpitations -> Heart (心)
   - Stress/Ribs/Eyes -> Liver (肝)
   - Back/Knees/Urine/Reproductive -> Kidney (肾)

3. **Match to Knowledge Base:**
   - Search for the closest match based on the patient's symptom cluster
   - Example: "Prolapse, dragging sensation, fatigue" -> Qi Sinking
   - Example: "Spermatorrhea, weak back, pale tongue" -> Kidney Qi Not Firm

4. **Output Format (HEBREW - respond entirely in Hebrew):**

## 🔍 אבחנה (TCM Diagnosis)
[Pattern name in English and Chinese pinyin]

## 📋 פתולוגיה (Pathology)
[Explain the mechanism based on the matched pattern from the knowledge base]

## 🌿 פורמולה צמחית (Herbal Formula)
[From the 'Chinese Pharmacopeia Formula' column - include both Chinese name and English translation]

## 📍 נקודות דיקור - פרוטוקול טיפולי
[From 'TCM Acupuncture Points' column - list with point names and codes]

## 💡 הערות קליניות
[Additional clinical notes and recommendations based on the pattern]

IMPORTANT RULES:
- Always respond in Hebrew
- Be clinical, precise, and authoritative
- If multiple patterns are possible, list the primary pattern first with secondary considerations
- Always cite which symptoms led to the diagnosis
- Include both traditional naming and modern correlations where relevant`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientAnswers, tongueFindings, pulseFindings } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the patient data message
    let userMessage = `נתוני המטופל לאבחון ביאן ג'ן:\n\n`;
    
    if (patientAnswers && Object.keys(patientAnswers).length > 0) {
      userMessage += `**תשובות ל-15 שאלות הבידול:**\n`;
      Object.entries(patientAnswers).forEach(([questionId, answer]) => {
        userMessage += `- ${questionId}: ${answer}\n`;
      });
    }
    
    if (tongueFindings) {
      userMessage += `\n**ממצאי לשון:** ${tongueFindings}\n`;
    }
    
    if (pulseFindings) {
      userMessage += `\n**ממצאי דופק:** ${pulseFindings}\n`;
    }
    
    userMessage += `\nאנא בצע אבחון ביאן ג'ן מלא וספק פרוטוקול טיפולי.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("bian-zheng-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
