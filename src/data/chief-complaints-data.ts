// Chief Complaints Reference Data for Patient Intake Form
// From chief-complaints-tcm.csv - Common TCM Chief Complaints with Patterns & Treatments

export interface ChiefComplaint {
  id: string;
  category: string;
  complaint: string;
  tcmPattern: string;
  symptoms: string;
  acupuncturePoints: string;
  herbalFormula: string;
}

export interface ChiefComplaintCategory {
  category: string;
  complaints: ChiefComplaint[];
}

export const chiefComplaintsData: ChiefComplaintCategory[] = [
  {
    category: 'Pain',
    complaints: [
      { id: 'headache_frontal', category: 'Pain', complaint: 'Headache - Frontal', tcmPattern: 'Yangming Stomach Heat; Spleen Qi Deficiency', symptoms: 'Forehead pain, heavy sensation, digestive issues, fatigue after eating', acupuncturePoints: 'ST8 (Touwei), ST44 (Neiting), LI4 (Hegu), Yintang', herbalFormula: 'Bai Zhi, Ge Gen Tang' },
      { id: 'headache_temporal', category: 'Pain', complaint: 'Headache - Temporal', tcmPattern: 'Shaoyang Gallbladder Fire; Liver Yang Rising', symptoms: 'Side head pain, irritability, bitter taste, alternating chills/fever', acupuncturePoints: 'GB8 (Shuaigu), GB20 (Fengchi), SJ5 (Waiguan), LR3 (Taichong)', herbalFormula: 'Xiao Chai Hu Tang, Tian Ma Gou Teng Yin' },
      { id: 'headache_vertex', category: 'Pain', complaint: 'Headache - Vertex', tcmPattern: 'Liver Blood Deficiency; Jueyin Cold', symptoms: 'Top of head pain, dizziness, blurred vision, cold sensation', acupuncturePoints: 'GV20 (Baihui), LR3 (Taichong), BL67 (Zhiyin), KI1 (Yongquan)', herbalFormula: 'Wu Zhu Yu Tang, Si Wu Tang' },
      { id: 'headache_occipital', category: 'Pain', complaint: 'Headache - Occipital', tcmPattern: 'Taiyang Bladder Cold; Kidney Deficiency', symptoms: 'Back of head/neck pain, stiffness, aversion to cold, low back weakness', acupuncturePoints: 'BL10 (Tianzhu), GB20 (Fengchi), SI3 (Houxi), BL60 (Kunlun)', herbalFormula: 'Ge Gen Tang, You Gui Wan' },
      { id: 'migraine', category: 'Pain', complaint: 'Migraine', tcmPattern: 'Liver Yang Rising; Blood Stasis; Phlegm', symptoms: 'Severe one-sided pain, nausea, light sensitivity, aura', acupuncturePoints: 'GB20 (Fengchi), Taiyang, LR3 (Taichong), GB41 (Zulinqi)', herbalFormula: 'Tian Ma Gou Teng Yin, Xue Fu Zhu Yu Tang' },
      { id: 'neck_pain_acute', category: 'Pain', complaint: 'Neck Pain - Acute', tcmPattern: 'Wind-Cold Invasion; Qi Stagnation', symptoms: 'Stiff neck, limited ROM, pain worse with cold, sudden onset', acupuncturePoints: 'GB20 (Fengchi), GB21 (Jianjing), SI3 (Houxi), BL10 (Tianzhu)', herbalFormula: 'Ge Gen Tang, Qiang Huo Sheng Shi Tang' },
      { id: 'neck_pain_chronic', category: 'Pain', complaint: 'Neck Pain - Chronic', tcmPattern: 'Blood Stasis; Kidney Deficiency; Bi Syndrome', symptoms: 'Chronic stiffness, grinding, numbness to arms, weakness', acupuncturePoints: 'GB20 (Fengchi), Jiaji points, SI3 (Houxi), BL11 (Dazhu)', herbalFormula: 'Du Huo Ji Sheng Tang, Shen Tong Zhu Yu Tang' },
      { id: 'shoulder_pain', category: 'Pain', complaint: 'Shoulder Pain', tcmPattern: 'Qi-Blood Stagnation; Wind-Damp Bi', symptoms: 'Pain with movement, limited ROM, worse at night, local tenderness', acupuncturePoints: 'LI15 (Jianyu), SJ14 (Jianliao), SI9 (Jianzhen), LI4 (Hegu)', herbalFormula: 'Juan Bi Tang, Shen Tong Zhu Yu Tang' },
      { id: 'upper_back_pain', category: 'Pain', complaint: 'Upper Back Pain', tcmPattern: 'Qi Stagnation; Blood Stasis; Wind-Cold', symptoms: 'Pain between shoulder blades, tension, stress-related, breathing difficulty', acupuncturePoints: 'BL11-17 (Huatuojiaji), SI14 (Jianwaishu), GB21 (Jianjing)', herbalFormula: 'Ge Gen Tang, Xue Fu Zhu Yu Tang' },
      { id: 'lower_back_pain_acute', category: 'Pain', complaint: 'Lower Back Pain - Acute', tcmPattern: 'Qi-Blood Stagnation; Cold-Damp', symptoms: 'Sudden onset, spasm, limited movement, worse with cold/damp', acupuncturePoints: 'BL23 (Shenshu), BL25 (Dachangshu), BL40 (Weizhong), GV3 (Yaoyangguan)', herbalFormula: 'Du Huo Ji Sheng Tang, Shen Tong Zhu Yu Tang' },
      { id: 'lower_back_pain_chronic', category: 'Pain', complaint: 'Lower Back Pain - Chronic', tcmPattern: 'Kidney Deficiency; Blood Stasis', symptoms: 'Dull ache, weakness, fatigue, worse standing, better lying', acupuncturePoints: 'BL23 (Shenshu), GV4 (Mingmen), KI3 (Taixi), BL40 (Weizhong)', herbalFormula: 'You Gui Wan, Du Huo Ji Sheng Tang' },
      { id: 'sciatica', category: 'Pain', complaint: 'Sciatica', tcmPattern: 'Blood Stasis; Wind-Damp Bi; Kidney Deficiency', symptoms: 'Radiating leg pain, numbness, weakness, worse sitting', acupuncturePoints: 'GB30 (Huantiao), GB34 (Yanglingquan), BL54 (Zhibian), BL40 (Weizhong)', herbalFormula: 'Du Huo Ji Sheng Tang, Shen Tong Zhu Yu Tang' },
      { id: 'knee_pain', category: 'Pain', complaint: 'Knee Pain', tcmPattern: 'Bi Syndrome; Kidney Deficiency; Blood Stasis', symptoms: 'Pain, swelling, stiffness, worse with weather changes', acupuncturePoints: 'ST35 (Dubi), Xiyan, SP9 (Yinlingquan), GB34 (Yanglingquan)', herbalFormula: 'Du Huo Ji Sheng Tang, Juan Bi Tang' },
      { id: 'hip_pain', category: 'Pain', complaint: 'Hip Pain', tcmPattern: 'Blood Stasis; Kidney Deficiency; Damp-Heat', symptoms: 'Deep ache, limited ROM, worse at night, radiating pain', acupuncturePoints: 'GB30 (Huantiao), GB29 (Juliao), BL54 (Zhibian), GB34 (Yanglingquan)', herbalFormula: 'Du Huo Ji Sheng Tang, Si Miao San' },
      { id: 'abdominal_pain', category: 'Pain', complaint: 'Abdominal Pain', tcmPattern: 'Qi Stagnation; Cold; Food Stagnation', symptoms: 'Cramping, bloating, relief with warmth or bowel movement', acupuncturePoints: 'CV12 (Zhongwan), ST25 (Tianshu), ST36 (Zusanli), PC6 (Neiguan)', herbalFormula: 'Xiao Yao San, Li Zhong Wan' },
      { id: 'menstrual_cramps', category: 'Pain', complaint: 'Menstrual Cramps', tcmPattern: 'Blood Stasis; Cold in Uterus; Qi Stagnation', symptoms: 'Cramping before/during menses, clots, relief with warmth', acupuncturePoints: 'SP6 (Sanyinjiao), CV4 (Guanyuan), LR3 (Taichong), SP8 (Diji)', herbalFormula: 'Tao Hong Si Wu Tang, Wen Jing Tang' },
    ]
  },
  {
    category: 'Digestive',
    complaints: [
      { id: 'acid_reflux', category: 'Digestive', complaint: 'Acid Reflux/GERD', tcmPattern: 'Stomach Heat; Liver Invading Stomach', symptoms: 'Burning sensation, sour regurgitation, worse after eating', acupuncturePoints: 'CV12 (Zhongwan), PC6 (Neiguan), ST36 (Zusanli), LR3 (Taichong)', herbalFormula: 'Zuo Jin Wan, Ban Xia Xie Xin Tang' },
      { id: 'bloating_gas', category: 'Digestive', complaint: 'Bloating/Gas', tcmPattern: 'Spleen Qi Deficiency; Food Stagnation', symptoms: 'Distension after eating, fatigue, loose stools, poor appetite', acupuncturePoints: 'CV12 (Zhongwan), ST36 (Zusanli), SP6 (Sanyinjiao), CV6 (Qihai)', herbalFormula: 'Xiang Sha Liu Jun Zi Tang, Bao He Wan' },
      { id: 'constipation', category: 'Digestive', complaint: 'Constipation', tcmPattern: 'Heat; Qi Stagnation; Blood/Yin Deficiency', symptoms: 'Dry stools, straining, infrequent BM, abdominal fullness', acupuncturePoints: 'ST25 (Tianshu), SJ6 (Zhigou), ST37 (Shangjuxu), LI4 (Hegu)', herbalFormula: 'Ma Zi Ren Wan, Run Chang Wan' },
      { id: 'diarrhea_acute', category: 'Digestive', complaint: 'Diarrhea - Acute', tcmPattern: 'Damp-Heat; Food Poisoning; Cold-Damp', symptoms: 'Urgent loose stools, cramping, fever, nausea', acupuncturePoints: 'ST25 (Tianshu), ST37 (Shangjuxu), CV12 (Zhongwan), LI11 (Quchi)', herbalFormula: 'Ge Gen Qin Lian Tang, Huo Xiang Zheng Qi San' },
      { id: 'diarrhea_chronic', category: 'Digestive', complaint: 'Diarrhea - Chronic', tcmPattern: 'Spleen Qi/Yang Deficiency; Kidney Yang Deficiency', symptoms: 'Dawn diarrhea, undigested food, cold limbs, fatigue', acupuncturePoints: 'ST36 (Zusanli), SP3 (Taibai), CV12 (Zhongwan), BL20 (Pishu)', herbalFormula: 'Shen Ling Bai Zhu San, Si Shen Wan' },
      { id: 'ibs', category: 'Digestive', complaint: 'IBS - Mixed Pattern', tcmPattern: 'Liver-Spleen Disharmony; Damp Accumulation', symptoms: 'Alternating constipation/diarrhea, stress-related, bloating', acupuncturePoints: 'LR3 (Taichong), SP6 (Sanyinjiao), ST25 (Tianshu), CV12 (Zhongwan)', herbalFormula: 'Tong Xie Yao Fang, Xiao Yao San' },
      { id: 'nausea_vomiting', category: 'Digestive', complaint: 'Nausea/Vomiting', tcmPattern: 'Stomach Qi Rebellion; Phlegm-Damp; Liver Invading Stomach', symptoms: 'Nausea, vomiting, loss of appetite, epigastric fullness', acupuncturePoints: 'PC6 (Neiguan), CV12 (Zhongwan), ST36 (Zusanli), LR3 (Taichong)', herbalFormula: 'Ban Xia Xie Xin Tang, Xiao Ban Xia Tang' },
      { id: 'poor_appetite', category: 'Digestive', complaint: 'Poor Appetite', tcmPattern: 'Spleen Qi Deficiency; Food Stagnation; Damp Accumulation', symptoms: 'No hunger, early satiety, fatigue, loose stools', acupuncturePoints: 'CV12 (Zhongwan), ST36 (Zusanli), BL20 (Pishu), SP3 (Taibai)', herbalFormula: 'Xiang Sha Liu Jun Zi Tang, Bao He Wan' },
    ]
  },
  {
    category: 'Respiratory',
    complaints: [
      { id: 'cold_wind_cold', category: 'Respiratory', complaint: 'Common Cold - Wind-Cold', tcmPattern: 'Wind-Cold Invasion', symptoms: 'Chills, clear runny nose, body aches, no sweating, white tongue coat', acupuncturePoints: 'LU7 (Lieque), LI4 (Hegu), GB20 (Fengchi), BL12 (Fengmen)', herbalFormula: 'Gui Zhi Tang, Ma Huang Tang' },
      { id: 'cold_wind_heat', category: 'Respiratory', complaint: 'Common Cold - Wind-Heat', tcmPattern: 'Wind-Heat Invasion', symptoms: 'Fever, sore throat, yellow phlegm, thirst, yellow tongue coat', acupuncturePoints: 'LI4 (Hegu), LI11 (Quchi), LU10 (Yuji), GB20 (Fengchi)', herbalFormula: 'Yin Qiao San, Sang Ju Yin' },
      { id: 'cough_acute', category: 'Respiratory', complaint: 'Cough - Acute', tcmPattern: 'Wind-Cold/Heat; Phlegm-Damp', symptoms: 'Cough with phlegm, chest tightness, body aches', acupuncturePoints: 'LU7 (Lieque), LU5 (Chize), CV22 (Tiantu), BL13 (Feishu)', herbalFormula: 'Er Chen Tang, Zhi Sou San' },
      { id: 'cough_chronic', category: 'Respiratory', complaint: 'Cough - Chronic', tcmPattern: 'Lung Yin Deficiency; Phlegm-Damp; Kidney Not Grasping Qi', symptoms: 'Dry cough, night cough, shortness of breath, weak voice', acupuncturePoints: 'LU9 (Taiyuan), KI6 (Zhaohai), BL13 (Feishu), CV17 (Tanzhong)', herbalFormula: 'Bai He Gu Jin Tang, Bu Fei Tang' },
      { id: 'allergic_rhinitis', category: 'Respiratory', complaint: 'Allergic Rhinitis', tcmPattern: 'Wei Qi Deficiency; Lung-Spleen Qi Deficiency', symptoms: 'Sneezing, runny nose, itchy eyes, seasonal triggers', acupuncturePoints: 'LI4 (Hegu), LI20 (Yingxiang), GB20 (Fengchi), ST36 (Zusanli)', herbalFormula: 'Yu Ping Feng San, Cang Er Zi San' },
      { id: 'sinusitis', category: 'Respiratory', complaint: 'Sinusitis', tcmPattern: 'Wind-Heat; Damp-Heat; Lung Heat', symptoms: 'Facial pain, congestion, thick yellow discharge, headache', acupuncturePoints: 'LI20 (Yingxiang), Yintang, LI4 (Hegu), ST44 (Neiting)', herbalFormula: 'Cang Er Zi San, Xin Yi San' },
      { id: 'asthma', category: 'Respiratory', complaint: 'Asthma', tcmPattern: 'Phlegm-Damp; Lung-Kidney Deficiency', symptoms: 'Wheezing, shortness of breath, chest tightness, trigger-related', acupuncturePoints: 'CV17 (Tanzhong), LU7 (Lieque), Dingchuan, BL13 (Feishu)', herbalFormula: 'Su Zi Jiang Qi Tang, Ding Chuan Tang' },
    ]
  },
  {
    category: 'Mental-Emotional',
    complaints: [
      { id: 'anxiety', category: 'Mental-Emotional', complaint: 'Anxiety', tcmPattern: 'Heart Qi Deficiency; Liver Qi Stagnation; Phlegm-Fire', symptoms: 'Worry, palpitations, restlessness, chest tightness, insomnia', acupuncturePoints: 'PC6 (Neiguan), HT7 (Shenmen), CV17 (Tanzhong), Yintang', herbalFormula: 'Gui Pi Tang, Gan Mai Da Zao Tang' },
      { id: 'depression', category: 'Mental-Emotional', complaint: 'Depression', tcmPattern: 'Liver Qi Stagnation; Heart-Spleen Deficiency', symptoms: 'Low mood, sighing, chest oppression, fatigue, poor appetite', acupuncturePoints: 'LR3 (Taichong), LI4 (Hegu), CV17 (Tanzhong), GV20 (Baihui)', herbalFormula: 'Xiao Yao San, Chai Hu Shu Gan San' },
      { id: 'insomnia_falling_asleep', category: 'Mental-Emotional', complaint: 'Insomnia - Difficulty Falling Asleep', tcmPattern: 'Heart-Kidney Disharmony; Liver Fire', symptoms: 'Racing mind, restlessness, palpitations, hot flashes', acupuncturePoints: 'HT7 (Shenmen), KI6 (Zhaohai), SP6 (Sanyinjiao), Anmian', herbalFormula: 'Tian Wang Bu Xin Dan, Suan Zao Ren Tang' },
      { id: 'insomnia_early_waking', category: 'Mental-Emotional', complaint: 'Insomnia - Early Waking', tcmPattern: 'Heart-Spleen Deficiency; Blood Deficiency', symptoms: 'Waking 3-5am, dream-disturbed sleep, fatigue, palpitations', acupuncturePoints: 'HT7 (Shenmen), SP6 (Sanyinjiao), BL15 (Xinshu), BL20 (Pishu)', herbalFormula: 'Gui Pi Tang, Yang Xin Tang' },
      { id: 'stress_burnout', category: 'Mental-Emotional', complaint: 'Stress/Burnout', tcmPattern: 'Liver Qi Stagnation; Qi-Yin Deficiency', symptoms: 'Irritability, fatigue, tension, poor concentration, overwhelm', acupuncturePoints: 'LR3 (Taichong), GB34 (Yanglingquan), GV20 (Baihui), CV6 (Qihai)', herbalFormula: 'Xiao Yao San, Sheng Mai San' },
      { id: 'panic_attacks', category: 'Mental-Emotional', complaint: 'Panic Attacks', tcmPattern: 'Heart Fire; Phlegm Misting Heart', symptoms: 'Sudden fear, palpitations, shortness of breath, sweating', acupuncturePoints: 'PC6 (Neiguan), HT7 (Shenmen), GV20 (Baihui), KI1 (Yongquan)', herbalFormula: 'Wen Dan Tang, An Shen Ding Zhi Wan' },
    ]
  },
  {
    category: 'Fatigue',
    complaints: [
      { id: 'general_fatigue', category: 'Fatigue', complaint: 'General Fatigue', tcmPattern: 'Spleen Qi Deficiency; Kidney Yang Deficiency', symptoms: 'Tiredness, weakness, poor appetite, cold limbs', acupuncturePoints: 'ST36 (Zusanli), CV6 (Qihai), BL20 (Pishu), BL23 (Shenshu)', herbalFormula: 'Bu Zhong Yi Qi Tang, Si Jun Zi Tang' },
      { id: 'chronic_fatigue', category: 'Fatigue', complaint: 'Chronic Fatigue Syndrome', tcmPattern: 'Qi-Blood Deficiency; Spleen-Kidney Yang Deficiency', symptoms: 'Prolonged exhaustion, brain fog, muscle aches, unrefreshing sleep', acupuncturePoints: 'ST36 (Zusanli), SP6 (Sanyinjiao), CV4 (Guanyuan), GV20 (Baihui)', herbalFormula: 'Shi Quan Da Bu Tang, Bu Zhong Yi Qi Tang' },
      { id: 'post_viral_fatigue', category: 'Fatigue', complaint: 'Post-Viral Fatigue', tcmPattern: 'Qi Deficiency; Lingering Pathogen; Yin Deficiency', symptoms: 'Fatigue after illness, weakness, night sweats, low immunity', acupuncturePoints: 'ST36 (Zusanli), LU9 (Taiyuan), CV6 (Qihai), BL13 (Feishu)', herbalFormula: 'Yu Ping Feng San, Sheng Mai San' },
    ]
  },
  {
    category: "Women's Health",
    complaints: [
      { id: 'irregular_menstruation', category: "Women's Health", complaint: 'Irregular Menstruation', tcmPattern: 'Liver Qi Stagnation; Blood Deficiency; Kidney Deficiency', symptoms: 'Variable cycle length, PMS, breast tenderness, mood swings', acupuncturePoints: 'SP6 (Sanyinjiao), LR3 (Taichong), CV4 (Guanyuan), ST36 (Zusanli)', herbalFormula: 'Xiao Yao San, Ba Zhen Tang' },
      { id: 'heavy_menstruation', category: "Women's Health", complaint: 'Heavy Menstruation', tcmPattern: 'Spleen Qi Deficiency; Blood Heat; Blood Stasis', symptoms: 'Prolonged/heavy bleeding, clots, fatigue, dizziness', acupuncturePoints: 'SP1 (Yinbai), SP6 (Sanyinjiao), CV4 (Guanyuan), ST36 (Zusanli)', herbalFormula: 'Gui Pi Tang, Jiao Ai Tang' },
      { id: 'amenorrhea', category: "Women's Health", complaint: 'Amenorrhea', tcmPattern: 'Blood Deficiency; Kidney Deficiency; Qi-Blood Stagnation', symptoms: 'Absent periods, fatigue, low back pain, pale complexion', acupuncturePoints: 'SP6 (Sanyinjiao), CV4 (Guanyuan), BL23 (Shenshu), ST36 (Zusanli)', herbalFormula: 'Si Wu Tang, Wen Jing Tang' },
      { id: 'menopausal_symptoms', category: "Women's Health", complaint: 'Menopausal Symptoms', tcmPattern: 'Kidney Yin Deficiency; Heart-Kidney Disharmony', symptoms: 'Hot flashes, night sweats, insomnia, mood swings, vaginal dryness', acupuncturePoints: 'KI3 (Taixi), KI6 (Zhaohai), SP6 (Sanyinjiao), HT7 (Shenmen)', herbalFormula: 'Liu Wei Di Huang Wan, Er Xian Tang' },
      { id: 'infertility', category: "Women's Health", complaint: 'Infertility', tcmPattern: 'Kidney Deficiency; Blood Stasis; Phlegm-Damp', symptoms: 'Difficulty conceiving, irregular cycles, low back pain', acupuncturePoints: 'CV4 (Guanyuan), Zigong, SP6 (Sanyinjiao), BL23 (Shenshu)', herbalFormula: 'You Gui Wan, Wen Jing Tang' },
      { id: 'pcos', category: "Women's Health", complaint: 'PCOS', tcmPattern: 'Phlegm-Damp; Kidney Yang Deficiency; Blood Stasis', symptoms: 'Irregular periods, weight gain, acne, hirsutism, cysts', acupuncturePoints: 'SP6 (Sanyinjiao), ST40 (Fenglong), CV4 (Guanyuan), LR3 (Taichong)', herbalFormula: 'Cang Fu Dao Tan Tang, Gui Shao Di Huang Tang' },
      { id: 'endometriosis', category: "Women's Health", complaint: 'Endometriosis', tcmPattern: 'Blood Stasis; Cold in Uterus; Qi Stagnation', symptoms: 'Severe menstrual pain, heavy bleeding, infertility, pelvic pain', acupuncturePoints: 'SP6 (Sanyinjiao), SP10 (Xuehai), CV4 (Guanyuan), LR3 (Taichong)', herbalFormula: 'Ge Xia Zhu Yu Tang, Shao Fu Zhu Yu Tang' },
    ]
  },
  {
    category: 'Skin',
    complaints: [
      { id: 'eczema', category: 'Skin', complaint: 'Eczema/Dermatitis', tcmPattern: 'Blood Heat; Damp-Heat; Blood Deficiency Wind', symptoms: 'Itching, redness, dry/weeping patches, worse with stress/heat', acupuncturePoints: 'LI11 (Quchi), SP10 (Xuehai), SP6 (Sanyinjiao), LR3 (Taichong)', herbalFormula: 'Xiao Feng San, Si Wu Xiao Feng Yin' },
      { id: 'acne', category: 'Skin', complaint: 'Acne', tcmPattern: 'Lung-Stomach Heat; Damp-Heat; Blood Heat', symptoms: 'Pustules, inflammation, oily skin, especially on face/back', acupuncturePoints: 'LI4 (Hegu), LI11 (Quchi), ST44 (Neiting), SP10 (Xuehai)', herbalFormula: 'Pi Pa Qing Fei Yin, Wu Wei Xiao Du Yin' },
      { id: 'psoriasis', category: 'Skin', complaint: 'Psoriasis', tcmPattern: 'Blood Heat; Blood Stasis; Blood Dryness', symptoms: 'Thick scaly patches, silvery scales, itching, nail changes', acupuncturePoints: 'SP10 (Xuehai), LI11 (Quchi), BL17 (Geshu), SP6 (Sanyinjiao)', herbalFormula: 'Tu Fu Ling Tang, Xiao Feng San' },
      { id: 'urticaria', category: 'Skin', complaint: 'Urticaria/Hives', tcmPattern: 'Wind-Heat; Wind-Cold; Blood Heat', symptoms: 'Itchy welts, sudden onset, may be triggered by foods/stress', acupuncturePoints: 'LI4 (Hegu), SP10 (Xuehai), GB31 (Fengshi), LI11 (Quchi)', herbalFormula: 'Xiao Feng San, Fang Feng Tong Sheng San' },
    ]
  },
  {
    category: 'Neurological',
    complaints: [
      { id: 'dizziness_vertigo', category: 'Neurological', complaint: 'Dizziness/Vertigo', tcmPattern: 'Liver Yang Rising; Phlegm-Damp; Kidney Deficiency', symptoms: 'Spinning sensation, nausea, tinnitus, worse with movement', acupuncturePoints: 'GB20 (Fengchi), GV20 (Baihui), PC6 (Neiguan), LR3 (Taichong)', herbalFormula: 'Tian Ma Gou Teng Yin, Ban Xia Bai Zhu Tian Ma Tang' },
      { id: 'tinnitus', category: 'Neurological', complaint: 'Tinnitus', tcmPattern: 'Kidney Deficiency; Liver Fire; Phlegm-Fire', symptoms: 'Ringing in ears, hearing loss, worse at night, dizziness', acupuncturePoints: 'SJ17 (Yifeng), SJ21 (Ermen), GB2 (Tinghui), KI3 (Taixi)', herbalFormula: 'Er Long Zuo Ci Wan, Long Dan Xie Gan Tang' },
      { id: 'numbness_tingling', category: 'Neurological', complaint: 'Numbness/Tingling', tcmPattern: 'Blood Stasis; Blood Deficiency; Phlegm-Damp Obstruction', symptoms: 'Pins and needles, numbness in limbs, worse at night', acupuncturePoints: 'LI4 (Hegu), LI11 (Quchi), SP6 (Sanyinjiao), ST36 (Zusanli)', herbalFormula: 'Bu Yang Huan Wu Tang, Shen Tong Zhu Yu Tang' },
      { id: 'bells_palsy', category: 'Neurological', complaint: "Bell's Palsy", tcmPattern: 'Wind-Cold/Heat Invasion; Qi-Blood Stasis', symptoms: 'Facial paralysis, drooping, difficulty closing eye, drooling', acupuncturePoints: 'ST4 (Dicang), ST6 (Jiache), LI4 (Hegu), GB14 (Yangbai)', herbalFormula: 'Qian Zheng San, Bu Yang Huan Wu Tang' },
    ]
  },
  {
    category: 'Cardiovascular',
    complaints: [
      { id: 'palpitations', category: 'Cardiovascular', complaint: 'Palpitations', tcmPattern: 'Heart Qi/Blood Deficiency; Heart Fire; Phlegm Obstruction', symptoms: 'Awareness of heartbeat, anxiety, shortness of breath', acupuncturePoints: 'HT7 (Shenmen), PC6 (Neiguan), CV17 (Tanzhong), BL15 (Xinshu)', herbalFormula: 'Gui Pi Tang, Zhi Gan Cao Tang' },
      { id: 'hypertension', category: 'Cardiovascular', complaint: 'Hypertension', tcmPattern: 'Liver Yang Rising; Kidney Yin Deficiency; Phlegm-Damp', symptoms: 'Headache, dizziness, irritability, red face, tinnitus', acupuncturePoints: 'LR3 (Taichong), GB20 (Fengchi), ST36 (Zusanli), KI3 (Taixi)', herbalFormula: 'Tian Ma Gou Teng Yin, Zhen Gan Xi Feng Tang' },
    ]
  },
  {
    category: 'Urinary',
    complaints: [
      { id: 'frequent_urination', category: 'Urinary', complaint: 'Frequent Urination', tcmPattern: 'Kidney Qi Deficiency; Damp-Heat; Spleen Qi Sinking', symptoms: 'Frequent urge, small amounts, worse at night, low back weakness', acupuncturePoints: 'CV4 (Guanyuan), BL23 (Shenshu), KI3 (Taixi), SP6 (Sanyinjiao)', herbalFormula: 'Jin Gui Shen Qi Wan, Suo Quan Wan' },
      { id: 'uti', category: 'Urinary', complaint: 'Urinary Tract Infection', tcmPattern: 'Damp-Heat in Bladder; Kidney Yin Deficiency', symptoms: 'Burning urination, urgency, frequency, lower abdominal pain', acupuncturePoints: 'CV3 (Zhongji), SP9 (Yinlingquan), SP6 (Sanyinjiao), BL28 (Pangguangshu)', herbalFormula: 'Ba Zheng San, Dao Chi San' },
    ]
  },
  {
    category: 'Immune/Wellness',
    complaints: [
      { id: 'weak_immunity', category: 'Immune/Wellness', complaint: 'Weakened Immunity', tcmPattern: 'Lung-Spleen Qi Deficiency; Wei Qi Deficiency', symptoms: 'Frequent colds, slow recovery, fatigue, spontaneous sweating', acupuncturePoints: 'ST36 (Zusanli), LU9 (Taiyuan), BL13 (Feishu), CV6 (Qihai)', herbalFormula: 'Yu Ping Feng San, Bu Zhong Yi Qi Tang' },
      { id: 'post_covid', category: 'Immune/Wellness', complaint: 'Post-COVID Syndrome', tcmPattern: 'Qi Deficiency; Phlegm-Damp; Yin Deficiency', symptoms: 'Fatigue, brain fog, shortness of breath, loss of taste/smell', acupuncturePoints: 'ST36 (Zusanli), LU9 (Taiyuan), CV17 (Tanzhong), SP6 (Sanyinjiao)', herbalFormula: 'Sheng Mai San, Bu Fei Tang' },
    ]
  },
  {
    category: 'Eye/Vision',
    complaints: [
      { id: 'dry_eyes', category: 'Eye/Vision', complaint: 'Dry Eyes', tcmPattern: 'Liver Blood Deficiency; Kidney Yin Deficiency', symptoms: 'Gritty sensation, blurred vision, eye fatigue, worse with screens', acupuncturePoints: 'BL1 (Jingming), GB1 (Tongziliao), LR3 (Taichong), KI6 (Zhaohai)', herbalFormula: 'Qi Ju Di Huang Wan, Ming Mu Di Huang Wan' },
      { id: 'eye_strain', category: 'Eye/Vision', complaint: 'Eye Strain', tcmPattern: 'Liver Blood Deficiency; Qi Stagnation', symptoms: 'Tired eyes, headache, blurred vision, difficulty focusing', acupuncturePoints: 'BL1 (Jingming), Taiyang, GB20 (Fengchi), LR3 (Taichong)', herbalFormula: 'Xiao Yao San, Qi Ju Di Huang Wan' },
    ]
  },
];

// Get all complaints flattened
export const getAllComplaints = (): ChiefComplaint[] => {
  return chiefComplaintsData.flatMap(cat => cat.complaints);
};

// Get complaint by ID
export const getComplaintById = (id: string): ChiefComplaint | undefined => {
  return getAllComplaints().find(c => c.id === id);
};

// Get categories list
export const getComplaintCategories = (): string[] => {
  return chiefComplaintsData.map(cat => cat.category);
};

// Search complaints
export const searchComplaints = (query: string): ChiefComplaint[] => {
  const q = query.toLowerCase();
  return getAllComplaints().filter(c => 
    c.complaint.toLowerCase().includes(q) ||
    c.symptoms.toLowerCase().includes(q) ||
    c.tcmPattern.toLowerCase().includes(q)
  );
};
