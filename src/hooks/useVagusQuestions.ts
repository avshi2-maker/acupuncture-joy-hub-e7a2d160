import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VagusQuestion {
  id: number;
  symptom: string;
  mechanism: string;
  acupoints: string;
  formula: string;
}

export const useVagusQuestions = () => {
  const [questions, setQuestions] = useState<VagusQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Fetch from knowledge_chunks where content contains vagus-related data
        const { data: chunks, error: fetchError } = await supabase
          .from('knowledge_chunks')
          .select('*')
          .or('content.ilike.%vagus%,content.ilike.%vagal%')
          .order('chunk_index');

        if (fetchError) throw fetchError;

        // Parse chunks into question format
        const parsedQuestions: VagusQuestion[] = [];
        let id = 1;

        chunks?.forEach(chunk => {
          // Try to parse CSV-style content
          const lines = chunk.content.split('\n');
          lines.forEach(line => {
            // Match CSV pattern: "symptom","mechanism","acupoints","formula"
            const csvMatch = line.match(/"([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
            if (csvMatch) {
              parsedQuestions.push({
                id: id++,
                symptom: csvMatch[1],
                mechanism: csvMatch[2],
                acupoints: csvMatch[3],
                formula: csvMatch[4]
              });
            } else {
              // Try simpler comma-separated format
              const parts = line.split(',');
              if (parts.length >= 4 && parts[0].includes('?')) {
                parsedQuestions.push({
                  id: id++,
                  symptom: parts[0].replace(/"/g, '').trim(),
                  mechanism: parts[1].replace(/"/g, '').trim(),
                  acupoints: parts[2].replace(/"/g, '').trim(),
                  formula: parts[3].replace(/"/g, '').trim()
                });
              }
            }
          });

          // Also try Q&A format chunks
          if (chunk.question && chunk.answer) {
            const lowerQ = chunk.question.toLowerCase();
            if (lowerQ.includes('vagus') || lowerQ.includes('vagal') || lowerQ.includes('nerve')) {
              // Extract acupoints and formula from answer
              const acupointMatch = chunk.answer.match(/([A-Z]{1,2}\d+[^,]*(?:,\s*[A-Z]{1,2}\d+[^,]*)*)/);
              const formulaMatch = chunk.answer.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\s+(?:Tang|Wan|San|Yin))/);
              
              parsedQuestions.push({
                id: id++,
                symptom: chunk.question,
                mechanism: chunk.answer.substring(0, 100),
                acupoints: acupointMatch?.[1] || 'PC6 (Neiguan)',
                formula: formulaMatch?.[1] || 'Xiao Yao San'
              });
            }
          }
        });

        // Remove duplicates based on symptom text
        const uniqueQuestions = parsedQuestions.filter((q, index, self) =>
          index === self.findIndex(t => t.symptom === q.symptom)
        );

        setQuestions(uniqueQuestions.length > 0 ? uniqueQuestions : getFallbackQuestions());
        setError(null);
      } catch (err) {
        console.error('Error fetching vagus questions:', err);
        setError('Failed to load questions from database');
        setQuestions(getFallbackQuestions());
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return { questions, loading, error, refetch: () => {} };
};

// Fallback questions from CSV if database is empty
function getFallbackQuestions(): VagusQuestion[] {
  return [
    { id: 1, symptom: "Do you feel 'wired but tired', unable to calm your racing heart?", mechanism: "Low Vagal Tone causing Sympathetic Overdrive", acupoints: "HT7 (Shenmen) + PC6 (Neiguan) + Ear Shen Men", formula: "Tian Wang Bu Xin Dan" },
    { id: 2, symptom: "Do you have a 'gut feeling' of anxiety or nausea when stressed?", mechanism: "Gut-Brain Axis dysregulation via Vagus afferent fibers", acupoints: "ST36 (Zusanli) + CV12 (Zhongwan) + PC6 (Neiguan)", formula: "Wen Dan Tang" },
    { id: 3, symptom: "Do you find it hard to make eye contact or connect socially?", mechanism: "Ventral Vagus shutdown (Social Engagement System)", acupoints: "HT5 (Tongli) + DU20 (Baihui) + Ear Point Zero", formula: "Gan Mai Da Zao Tang" },
    { id: 4, symptom: "Do you suffer from chronic inflammation or auto-immune flare-ups?", mechanism: "Cholinergic Anti-inflammatory Pathway (CAP) dysfunction", acupoints: "LI11 (Quchi) + ST36 (Zusanli) + Ear Vagus Zone", formula: "Xiao Chai Hu Tang" },
    { id: 5, symptom: "Do you experience 'frozen' states or dissociation during trauma recall?", mechanism: "Dorsal Vagal Shutdown (Freeze response)", acupoints: "GV20 (Baihui) + KI1 (Yongquan) + GV4 (Mingmen)", formula: "Chai Hu Long Gu Mu Li Tang" },
    { id: 6, symptom: "Do you have a lump in your throat (Plum Pit Qi)?", mechanism: "Vagus Nerve laryngeal branch constriction due to stress", acupoints: "CV22 (Tiantu) + PC6 (Neiguan) + LR3 (Taichong)", formula: "Ban Xia Hou Po Tang" },
    { id: 7, symptom: "Does your heart skip beats or palpitate when sleeping?", mechanism: "Vagal brake failure on the Sinoatrial Node", acupoints: "HT7 (Shenmen) + PC6 (Neiguan) + UB15 (Xinshu)", formula: "Gui Pi Tang" },
    { id: 8, symptom: "Do you wake up between 1 AM and 3 AM regularly?", mechanism: "Liver-Vagus circadian rhythm disruption", acupoints: "LR14 (Qimen) + UB18 (Ganshu) + Ear Liver", formula: "Long Dan Xie Gan Tang" },
    { id: 9, symptom: "Is your digestion slow, causing bloating after eating?", mechanism: "Gastric Vagal motor inhibition (low motility)", acupoints: "ST36 (Zusanli) + SP4 (Gongsun) + CV12 (Zhongwan)", formula: "Xiang Sha Liu Jun Zi Tang" },
    { id: 10, symptom: "Do you startle easily at loud noises (Hyper-vigilance)?", mechanism: "Dysfunctional Vagal braking mechanism", acupoints: "PC7 (Daling) + HT7 (Shenmen) + KI3 (Taixi)", formula: "Suan Zao Ren Tang" },
    { id: 11, symptom: "Do you have cold hands and feet despite being warm?", mechanism: "Vagus withdrawal causing peripheral vasoconstriction", acupoints: "LI4 (Hegu) + LR3 (Taichong) [Four Gates]", formula: "Si Ni San" },
    { id: 12, symptom: "Do you feel emotionally numb or empty inside?", mechanism: "Vagus-Insula cortex disconnection (Interoception loss)", acupoints: "GV20 (Baihui) + Sishencong + HT9 (Shaochong)", formula: "Bu Nao Wan" },
    { id: 13, symptom: "Do you have chronic neck stiffness and tension headaches?", mechanism: "Accessory Nerve / Vagus Nerve crosstalk tension", acupoints: "GB20 (Fengchi) + UB10 (Tianzhu) + SI3 (Houxi)", formula: "Ge Gen Tang" },
    { id: 14, symptom: "Do you crave sugar or carbs when emotional?", mechanism: "Vagus-Gut signaling seeking dopamine hit", acupoints: "SP6 (Sanyinjiao) + ST36 (Zusanli) + Ear Stomach", formula: "Gui Pi Tang" },
    { id: 15, symptom: "Do you have difficulty taking a deep satisfying breath?", mechanism: "Phrenic/Vagus nerve diaphragm tension", acupoints: "LU9 (Taiyuan) + LU7 (Lieque) + CV17 (Danzhong)", formula: "Su Zi Jiang Qi Tang" },
    { id: 16, symptom: "Do you suffer from silent reflux or GERD?", mechanism: "Lower Esophageal Sphincter vagal malfunction", acupoints: "CV12 (Zhongwan) + ST36 (Zusanli) + PC6 (Neiguan)", formula: "Ban Xia Xie Xin Tang" },
    { id: 17, symptom: "Is your voice weak, hoarse, or easily lost?", mechanism: "Recurrent Laryngeal Nerve (Vagus branch) weakness", acupoints: "LU9 (Taiyuan) + KI6 (Zhaohai) + CV22 (Tiantu)", formula: "Bu Zhong Yi Qi Tang" },
    { id: 18, symptom: "Do you have frequent yawning or sighing?", mechanism: "Body attempting to manually stimulate Vagus reset", acupoints: "LR3 (Taichong) + GB34 (Yanglingquan) + PC6 (Neiguan)", formula: "Yue Ju Wan" },
    { id: 19, symptom: "Do you feel dizzy or lightheaded upon standing (POTS)?", mechanism: "Baroreceptor Vagal reflex dysfunction", acupoints: "GV20 (Baihui) + ST36 (Zusanli) + PC6 (Neiguan)", formula: "Bu Zhong Yi Qi Tang" },
    { id: 20, symptom: "Do you have brain fog that clears only after exercise?", mechanism: "Low Vagal tone reducing cerebral blood flow", acupoints: "GV20 (Baihui) + ST40 (Fenglong) + SP9 (Yinlingquan)", formula: "Ban Xia Bai Zhu Tian Ma Tang" },
  ];
}
