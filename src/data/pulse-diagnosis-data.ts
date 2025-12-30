// Pulse Diagnosis Reference Data for Patient Intake Form
// Grouped by Diagnostic Category

export interface PulseFinding {
  finding: string;
  chineseName: string;
  description: string;
  tcmPattern: string;
  clinicalSignificance: string;
  treatmentPrinciple: string;
}

export interface PulseCategory {
  category: string;
  findings: PulseFinding[];
}

export const pulseDiagnosisData: PulseCategory[] = [
  {
    category: 'Pulse Rate',
    findings: [
      { finding: 'Normal Rate (Huan Mai - Moderate Pulse)', chineseName: '缓脉 Huǎn Mài', description: '4 beats per breath cycle (about 60-90 BPM)', tcmPattern: 'Normal, healthy state; harmonious qi and blood', clinicalSignificance: 'Balanced physiology, no pathology', treatmentPrinciple: 'Maintain balance, preventive care' },
      { finding: 'Rapid Pulse (Shuo Mai)', chineseName: '数脉 Shuò Mài', description: '5-6 beats per breath, over 90 BPM, faster than normal', tcmPattern: 'Heat (Excess or Deficiency), Yin deficiency', clinicalSignificance: 'Heat accelerating blood circulation, fever, inflammation', treatmentPrinciple: 'Clear heat, nourish yin if deficiency heat' },
      { finding: 'Slow Pulse (Chi Mai)', chineseName: '迟脉 Chí Mài', description: '3 or fewer beats per breath, under 60 BPM', tcmPattern: 'Cold (Excess or Deficiency), Yang deficiency', clinicalSignificance: 'Cold slowing circulation, weak yang unable to propel blood', treatmentPrinciple: 'Warm yang, expel cold' },
      { finding: 'Racing/Hasty Pulse (Ji Mai)', chineseName: '疾脉 Jí Mài', description: '7+ beats per breath, very rapid, over 120 BPM', tcmPattern: 'Extreme heat, Yang excess, critical condition', clinicalSignificance: 'Severe heat or yang excess, emergency situation', treatmentPrinciple: 'Strongly clear heat, emergency cooling' },
    ]
  },
  {
    category: 'Pulse Depth',
    findings: [
      { finding: 'Superficial/Floating Pulse (Fu Mai)', chineseName: '浮脉 Fú Mài', description: 'Felt with light pressure, weakens with heavy pressure, at skin surface', tcmPattern: 'Exterior pattern, Wei qi rising to surface to fight pathogen', clinicalSignificance: 'Pathogen at exterior level, body mounting defensive response', treatmentPrinciple: 'Release exterior, expel pathogen' },
      { finding: 'Deep/Sinking Pulse (Chen Mai)', chineseName: '沉脉 Chén Mài', description: 'Only felt with heavy pressure, deep below surface', tcmPattern: 'Interior pattern, internal organ involvement', clinicalSignificance: 'Pathogen has penetrated interior, or deep-seated chronic condition', treatmentPrinciple: 'Treat interior, address root cause' },
      { finding: 'Hidden/Secluded Pulse (Fu Mai/Bi Mai)', chineseName: '伏脉 Fú Mài / 闭脉 Bì Mài', description: 'Very deep, requires extreme pressure to feel, hidden at bone level', tcmPattern: 'Extreme cold, severe pain, yang collapse, pathogen deeply hidden', clinicalSignificance: 'Critical condition, severe interior pathology, or extreme pain', treatmentPrinciple: 'Rescue yang, strongly warm interior, or address severe pain' },
    ]
  },
  {
    category: 'Pulse Width',
    findings: [
      { finding: 'Fine/Thin Pulse (Xi Mai)', chineseName: '细脉 Xì Mài', description: 'Thin like a thread, narrow diameter, clearly defined', tcmPattern: 'Blood and/or Yin deficiency, Qi deficiency', clinicalSignificance: 'Insufficient blood in vessels, depletion of yin fluids', treatmentPrinciple: 'Nourish blood and yin, tonify qi' },
      { finding: 'Big/Large Pulse (Da Mai)', chineseName: '大脉 Dà Mài', description: 'Wide, broad, takes up large area under fingers', tcmPattern: 'Excess heat, overabundant qi and blood, or deficiency appearing excess', clinicalSignificance: 'Vessels expanding with heat or overabundance, or false excess in severe deficiency', treatmentPrinciple: 'Clear excess heat OR strongly tonify if deficiency' },
      { finding: 'Flooding/Surging Pulse (Hong Mai)', chineseName: '洪脉 Hóng Mài', description: 'Very large and forceful, surges like flooding river, strong at all levels', tcmPattern: 'Extreme excess heat in qi level, Yang Ming stage heat', clinicalSignificance: 'Peak of heat, vessels maximally expanded, high fever pattern', treatmentPrinciple: 'Strongly clear heat, drain fire' },
    ]
  },
  {
    category: 'Pulse Strength',
    findings: [
      { finding: 'Forceful/Strong Pulse (You Li)', chineseName: '有力 Yǒu Lì', description: 'Strong, forceful sensation, pushes back against fingers', tcmPattern: 'Excess pattern, sufficient zheng qi fighting pathogen', clinicalSignificance: 'Body has strength to resist, excess condition', treatmentPrinciple: 'Disperse excess, drain or purge depending on pattern' },
      { finding: 'Forceless/Weak Pulse (Wu Li)', chineseName: '无力 Wú Lì', description: 'Weak sensation, no force, easily compressed', tcmPattern: 'Deficiency pattern, weak zheng qi', clinicalSignificance: 'Insufficient qi and blood, weak body resistance', treatmentPrinciple: 'Tonify qi and blood, strengthen zheng qi' },
      { finding: 'Weak/Deficient Pulse (Ruo Mai)', chineseName: '弱脉 Ruò Mài', description: 'Deep, thin, and soft, all three qualities combined, forceless', tcmPattern: 'Severe Qi and Blood deficiency, often with dampness', clinicalSignificance: 'Profound deficiency of qi and blood', treatmentPrinciple: 'Strongly tonify qi and blood, resolve dampness if present' },
      { finding: 'Soft/Soggy Pulse (Ru Mai)', chineseName: '濡脉 Rú Mài', description: 'Superficial, thin, and soft, feels like floating cotton', tcmPattern: 'Dampness with Qi-Blood deficiency', clinicalSignificance: 'Dampness burdening a deficient body', treatmentPrinciple: 'Tonify qi, resolve dampness' },
      { finding: 'Scattered/Dissipated Pulse (San Mai)', chineseName: '散脉 Sàn Mài', description: 'Diffuse, scattered, irregular, unfocused edges, floating and forceless', tcmPattern: 'Yuan qi collapsing, kidney essence scattering, critical deficiency', clinicalSignificance: 'Life-threatening depletion, loss of root, dying pulse', treatmentPrinciple: 'Emergency rescue qi, attempt to gather and stabilize essence' },
    ]
  },
  {
    category: 'Pulse Quality - Tension',
    findings: [
      { finding: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', description: 'Feels like guitar string, straight and long, tense but resilient', tcmPattern: 'Liver/Gallbladder disorders, pain, constraint, phlegm', clinicalSignificance: 'Liver qi stagnation, liver yang rising, or pain constraining qi', treatmentPrinciple: 'Soothe liver, move qi, relieve constraint, stop pain' },
      { finding: 'Tight/Tense Pulse (Jin Mai)', chineseName: '紧脉 Jǐn Mài', description: 'Feels like twisted rope, taut and forceful, tight tension throughout', tcmPattern: 'Cold, pain, food stagnation', clinicalSignificance: 'Cold constricting, or pain causing tension in vessels', treatmentPrinciple: 'Warm and dispel cold, stop pain, resolve stagnation' },
      { finding: 'Leather/Drum-skin Pulse (Ge Mai)', chineseName: '革脉 Gé Mài', description: 'Superficial, large, and wiry, hollow at center like drum skin, hard on outside empty inside', tcmPattern: 'Blood loss, essence depletion, pregnancy disorders, spermatorrhea', clinicalSignificance: 'Severe blood or essence loss with exterior appearance of excess', treatmentPrinciple: 'Stop bleeding, tonify blood and essence urgently' },
    ]
  },
  {
    category: 'Pulse Quality - Flow',
    findings: [
      { finding: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', description: 'Smooth, flowing like pearls rolling, rounded sensation', tcmPattern: 'Phlegm, dampness, food stagnation, pregnancy (normal), excess heat in strong person', clinicalSignificance: 'Excess condition with turbid substances, or normal in pregnancy', treatmentPrinciple: 'Transform phlegm, resolve dampness, move food; or confirm pregnancy' },
      { finding: 'Choppy/Rough Pulse (Se Mai)', chineseName: '涩脉 Sè Mài', description: 'Uneven, rough, like scraping bamboo or knife on bamboo, arrives irregularly', tcmPattern: 'Blood stasis, Qi-Blood deficiency, essence depletion, phlegm obstruction', clinicalSignificance: 'Obstruction or deficiency causing rough flow', treatmentPrinciple: 'Invigorate blood, nourish blood, remove stasis' },
    ]
  },
  {
    category: 'Pulse Length',
    findings: [
      { finding: 'Long Pulse (Chang Mai)', chineseName: '长脉 Cháng Mài', description: 'Extends beyond normal positions, felt at all three positions and beyond', tcmPattern: 'Excess heat, strong constitution, or liver fire', clinicalSignificance: 'Excess yang or heat extending vessels, or healthy if no symptoms', treatmentPrinciple: 'Clear excess heat, subdue liver yang if pathological' },
      { finding: 'Short Pulse (Duan Mai)', chineseName: '短脉 Duǎn Mài', description: 'Only felt at guan position, does not extend to cun or chi, abbreviated', tcmPattern: 'Qi stagnation, severe qi deficiency, or phlegm obstruction', clinicalSignificance: 'Qi unable to extend pulse, obstruction or severe deficiency', treatmentPrinciple: 'Move qi if stagnation, tonify qi if deficiency' },
    ]
  },
  {
    category: 'Pulse Rhythm',
    findings: [
      { finding: 'Regular/Even Rhythm', chineseName: '规则 Guī Zé', description: 'Even, regular intervals between beats', tcmPattern: 'Normal, healthy rhythm', clinicalSignificance: 'No rhythm disturbance', treatmentPrinciple: 'Maintain balance' },
      { finding: 'Intermittent Pulse (Dai Mai)', chineseName: '代脉 Dài Mài', description: 'Regularly intermittent, skips beats at regular intervals, stops and resumes predictably', tcmPattern: 'Organ qi exhaustion, wind-stroke, severe trauma, pregnancy complications', clinicalSignificance: 'Serious organ damage or severe pathology, heart qi deficiency', treatmentPrinciple: 'Tonify organ qi, calm spirit, treat underlying severe condition' },
      { finding: 'Knotted Pulse (Jie Mai)', chineseName: '结脉 Jié Mài', description: 'Slow with irregular skipped beats, pauses unpredictably', tcmPattern: 'Yin-cold, qi-blood stagnation, phlegm obstruction, masses', clinicalSignificance: 'Cold or stagnation causing irregular flow', treatmentPrinciple: 'Warm yang, invigorate blood, resolve phlegm, remove stasis' },
      { finding: 'Hurried Pulse (Cu Mai)', chineseName: '促脉 Cù Mài', description: 'Rapid with irregular skipped beats, fast but interrupted', tcmPattern: 'Yang excess, heat with stagnation, qi-blood stagnation with heat', clinicalSignificance: 'Heat and stagnation combined, yang excess disrupting rhythm', treatmentPrinciple: 'Clear heat, move stagnation, calm heart' },
    ]
  },
  {
    category: 'Special Pulse Qualities',
    findings: [
      { finding: 'Hollow/Scallion Stalk Pulse (Kong Mai)', chineseName: '空脉 Kōng Mài', description: 'Large but hollow in center, feels empty like scallion stalk', tcmPattern: 'Severe blood loss, hemorrhage', clinicalSignificance: 'Blood depleted from vessels leaving hollow sensation', treatmentPrinciple: 'Stop bleeding, strongly tonify blood' },
      { finding: 'Confined/Imprisoned Pulse (Lao Mai)', chineseName: '牢脉 Láo Mài', description: 'Deep, wiry, and forceful, strong and confined at deep level', tcmPattern: 'Interior excess cold, hernia, internal accumulation', clinicalSignificance: 'Strong pathogen trapped deeply with sufficient zheng qi to resist', treatmentPrinciple: 'Warm interior, disperse accumulation' },
      { finding: 'Firm Pulse (Shi Mai)', chineseName: '实脉 Shí Mài', description: 'Forceful at all levels, strong at superficial and deep, large and powerful', tcmPattern: 'Excess pattern, strong zheng qi fighting strong pathogen', clinicalSignificance: 'Full excess condition with robust resistance', treatmentPrinciple: 'Purge or drain excess depending on nature' },
      { finding: 'Minute/Barely Perceptible Pulse (Wei Mai)', chineseName: '微脉 Wēi Mài', description: 'Extremely thin and soft, barely perceptible, feels like gossamer', tcmPattern: 'Collapse of yang qi, critical qi-blood depletion', clinicalSignificance: 'Life-threatening deficiency, near-death pulse', treatmentPrinciple: 'Emergency rescue qi and yang' },
      { finding: 'Spinning Bean/Moving Pulse (Dong Mai)', chineseName: '动脉 Dòng Mài', description: 'Rapid, short, slippery, feels like spinning bean, only at guan position, vibrating', tcmPattern: 'Fright, pain, pregnancy disorders', clinicalSignificance: 'Disturbance of spirit or severe pain, kidney qi instability', treatmentPrinciple: 'Calm spirit, stop pain, stabilize kidney qi' },
    ]
  },
  {
    category: 'Pulse Position Analysis',
    findings: [
      { finding: 'Cun Position (Inch/Distal)', chineseName: '寸脉 Cùn Mài', description: 'Position closest to wrist crease', tcmPattern: 'Heart and Lung (left cun: Heart/SI; right cun: Lung/LI)', clinicalSignificance: 'Reflects condition of upper jiao organs', treatmentPrinciple: 'Based on findings in this position' },
      { finding: 'Guan Position (Bar/Middle)', chineseName: '关脉 Guān Mài', description: 'Middle position at styloid process', tcmPattern: 'Liver and Spleen (left guan: Liver/GB; right guan: Spleen/ST)', clinicalSignificance: 'Reflects condition of middle jiao organs', treatmentPrinciple: 'Based on findings in this position' },
      { finding: 'Chi Position (Cubit/Proximal)', chineseName: '尺脉 Chǐ Mài', description: 'Position furthest from wrist crease, proximal', tcmPattern: 'Kidney (both sides), Bladder, Intestines', clinicalSignificance: 'Reflects condition of lower jiao organs and kidney', treatmentPrinciple: 'Based on findings in this position' },
    ]
  },
  {
    category: 'Constitutional Variations',
    findings: [
      { finding: 'Male Constitutional Pulse', chineseName: '男性脉象 Nán Xìng Mài Xiàng', description: 'Slightly stronger at chi (kidney) position, left slightly stronger', tcmPattern: 'Normal male physiology', clinicalSignificance: 'Reflects normal male qi dominance', treatmentPrinciple: 'Recognition of normal variation' },
      { finding: 'Female Constitutional Pulse', chineseName: '女性脉象 Nǚ Xìng Mài Xiàng', description: 'Slightly softer overall, right may be slightly stronger than left', tcmPattern: 'Normal female physiology', clinicalSignificance: 'Reflects normal female blood dominance', treatmentPrinciple: 'Recognition of normal variation' },
      { finding: 'Pregnancy Pulse (Hua Mai at Chi)', chineseName: '孕脉 Yùn Mài', description: 'Slippery pulse especially at chi positions bilaterally, smooth and rolling', tcmPattern: 'Pregnancy, especially after 3 months', clinicalSignificance: 'Increased blood volume and qi nourishing fetus', treatmentPrinciple: 'Nourish blood and qi, support pregnancy' },
      { finding: "Child's Pulse", chineseName: '小儿脉 Xiǎo Ér Mài', description: 'Faster rate (90-120 BPM), softer, more superficial', tcmPattern: 'Normal pediatric physiology', clinicalSignificance: 'Pure yang constitution of children, rapid metabolism', treatmentPrinciple: 'Recognition of normal pediatric variation' },
      { finding: 'Elderly Pulse', chineseName: '老年脉 Lǎo Nián Mài', description: 'May be slightly irregular, weaker, sometimes wiry from aging', tcmPattern: 'Normal aging process, kidney essence decline', clinicalSignificance: 'Natural decline of yuan qi and essence with age', treatmentPrinciple: 'Tonify kidney essence, support zheng qi' },
      { finding: 'Athletic/Strong Constitution', chineseName: '运动员脉 Yùn Dòng Yuán Mài', description: 'Slow but forceful (around 50-60 BPM), strong and resilient', tcmPattern: 'Abundant qi and blood, strong heart', clinicalSignificance: 'Efficient cardiovascular system, athletic conditioning', treatmentPrinciple: 'Maintain balance, monitor for overtraining' },
    ]
  },
  {
    category: 'Seasonal Variations',
    findings: [
      { finding: 'Spring Pulse - Slightly Wiry', chineseName: '春脉 Chūn Mài', description: 'Slightly wiry quality, like string of musical instrument, resilient', tcmPattern: 'Normal spring season, liver qi active', clinicalSignificance: 'Wood element ascending, liver qi rising naturally', treatmentPrinciple: 'Recognize normal seasonal quality' },
      { finding: 'Summer Pulse - Slightly Flooding', chineseName: '夏脉 Xià Mài', description: 'Slightly larger, fuller, more flooding quality, superficial', tcmPattern: 'Normal summer season, yang qi at surface', clinicalSignificance: 'Fire element, yang qi expansive and at exterior', treatmentPrinciple: 'Recognize normal seasonal quality' },
      { finding: 'Autumn Pulse - Slightly Superficial', chineseName: '秋脉 Qiū Mài', description: 'Slightly superficial and lighter, like floating hair, refined', tcmPattern: 'Normal autumn season, yang qi beginning to descend', clinicalSignificance: 'Metal element, lung qi managing descent', treatmentPrinciple: 'Recognize normal seasonal quality' },
      { finding: 'Winter Pulse - Slightly Deep', chineseName: '冬脉 Dōng Mài', description: 'Slightly deeper, heavier, more sinking, reserved', tcmPattern: 'Normal winter season, yang qi stored in interior', clinicalSignificance: 'Water element, kidney qi storing essence', treatmentPrinciple: 'Recognize normal seasonal quality' },
    ]
  },
];

// Flat list for simple dropdown selection
export const allPulseFindings = pulseDiagnosisData.flatMap(category => 
  category.findings.map(f => ({
    ...f,
    category: category.category,
    value: f.finding,
    label: `${f.finding} ${f.chineseName}`,
  }))
);
