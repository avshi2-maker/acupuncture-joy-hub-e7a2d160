// Tongue Diagnosis Reference Data for Patient Intake Form
// Based on traditional TCM tongue diagnosis principles

export interface TongueFinding {
  finding: string;
  chineseName: string;
  description: string;
  tcmPattern: string;
  clinicalSignificance: string;
  treatmentPrinciple: string;
}

export interface TongueCategory {
  category: string;
  findings: TongueFinding[];
}

export const tongueDiagnosisData: TongueCategory[] = [
  {
    category: 'Tongue Body Color',
    findings: [
      { finding: 'Pale Tongue', chineseName: '淡舌 Dàn Shé', description: 'Lighter than normal pink, pale or whitish', tcmPattern: 'Qi deficiency, Blood deficiency, Yang deficiency, Cold', clinicalSignificance: 'Insufficient blood to nourish tongue, weak qi or yang', treatmentPrinciple: 'Tonify qi and blood, warm yang' },
      { finding: 'Normal/Pink Tongue', chineseName: '淡红舌 Dàn Hóng Shé', description: 'Light red/pink color, healthy appearance', tcmPattern: 'Normal, balanced constitution', clinicalSignificance: 'Adequate qi, blood, and yin-yang balance', treatmentPrinciple: 'Maintain balance, preventive care' },
      { finding: 'Red Tongue', chineseName: '红舌 Hóng Shé', description: 'Deeper red than normal, overall redness', tcmPattern: 'Heat (excess or deficiency), Yin deficiency with empty heat', clinicalSignificance: 'Heat in the body causing blood to rise to tongue', treatmentPrinciple: 'Clear heat, nourish yin if deficiency heat' },
      { finding: 'Deep Red/Crimson Tongue', chineseName: '绛舌 Jiàng Shé', description: 'Very dark red, crimson or scarlet color', tcmPattern: 'Severe heat in nutritive or blood level, extreme yin deficiency', clinicalSignificance: 'Heat has penetrated deep, serious condition', treatmentPrinciple: 'Strongly clear heat, cool blood, nourish yin' },
      { finding: 'Purple Tongue', chineseName: '紫舌 Zǐ Shé', description: 'Purple or bluish-purple overall color', tcmPattern: 'Blood stasis, severe cold, or extreme heat with stasis', clinicalSignificance: 'Blood circulation severely impaired', treatmentPrinciple: 'Invigorate blood, remove stasis, warm if cold' },
      { finding: 'Blue/Greenish Tongue', chineseName: '青舌 Qīng Shé', description: 'Blue or greenish tinge to tongue', tcmPattern: 'Extreme cold, blood stasis, pain, liver qi stagnation', clinicalSignificance: 'Severe cold congealing blood, or intense pain', treatmentPrinciple: 'Warm yang, expel cold, move blood' },
      { finding: 'Dark/Dusky Tongue', chineseName: '暗舌 Àn Shé', description: 'Dull, dark, lacking luster', tcmPattern: 'Blood stasis, chronic disease', clinicalSignificance: 'Long-standing stagnation or deficiency affecting circulation', treatmentPrinciple: 'Invigorate blood, address underlying chronic condition' },
    ]
  },
  {
    category: 'Tongue Body Shape',
    findings: [
      { finding: 'Swollen/Enlarged Tongue', chineseName: '胖大舌 Pàng Dà Shé', description: 'Larger than normal, may fill mouth', tcmPattern: 'Dampness, Phlegm, Spleen qi deficiency, Yang deficiency', clinicalSignificance: 'Fluids accumulating due to weak transformation', treatmentPrinciple: 'Resolve dampness, tonify spleen, warm yang' },
      { finding: 'Thin/Small Tongue', chineseName: '瘦薄舌 Shòu Báo Shé', description: 'Smaller and thinner than normal', tcmPattern: 'Yin deficiency, Blood deficiency, Qi-blood deficiency', clinicalSignificance: 'Insufficient fluids and blood to nourish tongue', treatmentPrinciple: 'Nourish yin and blood' },
      { finding: 'Tooth-marked/Scalloped Tongue', chineseName: '齿痕舌 Chǐ Hén Shé', description: 'Indentations from teeth along edges', tcmPattern: 'Spleen qi deficiency, Dampness accumulation', clinicalSignificance: 'Swollen tongue pressing against teeth due to weak spleen', treatmentPrinciple: 'Tonify spleen qi, resolve dampness' },
      { finding: 'Cracked/Fissured Tongue', chineseName: '裂纹舌 Liè Wén Shé', description: 'Cracks or fissures on tongue surface', tcmPattern: 'Yin deficiency, Blood deficiency, Heat consuming fluids', clinicalSignificance: 'Dryness from insufficient fluids or chronic heat', treatmentPrinciple: 'Nourish yin, generate fluids' },
      { finding: 'Hammer-shaped Tongue', chineseName: '锤形舌 Chuí Xíng Shé', description: 'Narrow at root, enlarged at tip', tcmPattern: 'Heart-Spleen imbalance, upper excess lower deficiency', clinicalSignificance: 'Heat rising, weakness below', treatmentPrinciple: 'Clear heart heat, tonify lower jiao' },
      { finding: 'Pointed Tongue', chineseName: '尖舌 Jiān Shé', description: 'Tongue tip is pointed/sharp', tcmPattern: 'Heart fire, severe heat', clinicalSignificance: 'Fire rising to tip (heart area)', treatmentPrinciple: 'Clear heart fire, calm spirit' },
      { finding: 'Rolled/Curled Tongue', chineseName: '卷舌 Juǎn Shé', description: 'Tongue curls or cannot extend straight', tcmPattern: 'Liver wind, severe heat in pericardium, wind-stroke', clinicalSignificance: 'Internal wind affecting tendons/muscles', treatmentPrinciple: 'Extinguish wind, clear heat, open orifices' },
    ]
  },
  {
    category: 'Tongue Coating Color',
    findings: [
      { finding: 'Thin White Coating', chineseName: '薄白苔 Báo Bái Tāi', description: 'Light, thin white coating, tongue visible through', tcmPattern: 'Normal, or exterior cold pattern', clinicalSignificance: 'Normal coating, or early stage cold invasion', treatmentPrinciple: 'Release exterior if pathogenic' },
      { finding: 'Thick White Coating', chineseName: '厚白苔 Hòu Bái Tāi', description: 'Thick white coating, tongue not visible', tcmPattern: 'Cold-dampness, Phlegm-dampness, Food stagnation', clinicalSignificance: 'Accumulation of cold, dampness, or undigested food', treatmentPrinciple: 'Warm and transform dampness, promote digestion' },
      { finding: 'Yellow Coating', chineseName: '黄苔 Huáng Tāi', description: 'Yellow colored coating, any thickness', tcmPattern: 'Heat, Interior heat, Damp-heat', clinicalSignificance: 'Heat causing transformation of coating color', treatmentPrinciple: 'Clear heat, resolve dampness if present' },
      { finding: 'Gray Coating', chineseName: '灰苔 Huī Tāi', description: 'Gray colored coating', tcmPattern: 'Interior heat or cold (severe), Dampness', clinicalSignificance: 'Deeper level pathology, either hot or cold', treatmentPrinciple: 'Clear heat or warm cold depending on other signs' },
      { finding: 'Black Coating', chineseName: '黑苔 Hēi Tāi', description: 'Black or very dark coating', tcmPattern: 'Extreme heat or extreme cold, Critical condition', clinicalSignificance: 'Very serious condition, extreme of either heat or cold', treatmentPrinciple: 'Urgent treatment based on hot/cold differentiation' },
      { finding: 'No Coating (Geographic/Peeled)', chineseName: '无苔/剥苔 Wú Tāi/Bō Tāi', description: 'Absent coating in patches or entirely', tcmPattern: 'Stomach/Spleen yin deficiency, Qi-yin exhaustion', clinicalSignificance: 'Severe depletion of stomach yin and qi', treatmentPrinciple: 'Nourish stomach yin, tonify qi' },
    ]
  },
  {
    category: 'Tongue Coating Quality',
    findings: [
      { finding: 'Thin Coating', chineseName: '薄苔 Báo Tāi', description: 'Coating is thin, can see tongue through it', tcmPattern: 'Normal, or mild exterior condition', clinicalSignificance: 'Healthy stomach qi, mild pathology if any', treatmentPrinciple: 'Maintain balance or release exterior' },
      { finding: 'Thick Coating', chineseName: '厚苔 Hòu Tāi', description: 'Thick coating, cannot see tongue through', tcmPattern: 'Interior pattern, Dampness, Phlegm, Food stagnation', clinicalSignificance: 'Accumulation in interior, turbidity', treatmentPrinciple: 'Resolve accumulation based on nature' },
      { finding: 'Greasy/Sticky Coating', chineseName: '腻苔 Nì Tāi', description: 'Oily, greasy appearance, difficult to scrape', tcmPattern: 'Dampness, Phlegm, Damp-heat', clinicalSignificance: 'Turbid dampness or phlegm accumulation', treatmentPrinciple: 'Resolve dampness and phlegm' },
      { finding: 'Slippery/Wet Coating', chineseName: '滑苔 Huá Tāi', description: 'Excessive moisture, watery appearance', tcmPattern: 'Dampness, Cold-dampness, Yang deficiency', clinicalSignificance: 'Excess fluids due to weak yang or dampness', treatmentPrinciple: 'Warm yang, transform dampness' },
      { finding: 'Dry Coating', chineseName: '燥苔 Zào Tāi', description: 'Dry, rough coating lacking moisture', tcmPattern: 'Heat consuming fluids, Yin deficiency, Blood deficiency', clinicalSignificance: 'Insufficient fluids to moisten coating', treatmentPrinciple: 'Generate fluids, clear heat, nourish yin' },
      { finding: 'Curdy/Cottage Cheese Coating', chineseName: '豆腐渣苔 Dòufu Zhā Tāi', description: 'Coating resembles cottage cheese or tofu', tcmPattern: 'Stomach heat with food stagnation, Toxic heat', clinicalSignificance: 'Turbid accumulation with heat', treatmentPrinciple: 'Clear heat, resolve food stagnation' },
      { finding: 'Rooted Coating', chineseName: '有根苔 Yǒu Gēn Tāi', description: 'Coating firmly attached to tongue', tcmPattern: 'Good stomach qi, pathogen with sufficient zheng qi', clinicalSignificance: 'Body has strength to resist, good prognosis', treatmentPrinciple: 'Treat pathogen while supporting zheng qi' },
      { finding: 'Rootless Coating', chineseName: '无根苔 Wú Gēn Tāi', description: 'Coating easily scraped off, not attached', tcmPattern: 'Weak stomach qi, Deficiency pattern', clinicalSignificance: 'Stomach qi depleted, weaker prognosis', treatmentPrinciple: 'Tonify stomach and spleen qi' },
    ]
  },
  {
    category: 'Tongue Moisture',
    findings: [
      { finding: 'Normal Moisture', chineseName: '润舌 Rùn Shé', description: 'Appropriately moist, neither wet nor dry', tcmPattern: 'Normal fluid metabolism', clinicalSignificance: 'Balanced fluids', treatmentPrinciple: 'Maintain balance' },
      { finding: 'Dry Tongue', chineseName: '干舌 Gān Shé', description: 'Lacking moisture, may have cracks', tcmPattern: 'Yin deficiency, Heat consuming fluids, Blood deficiency', clinicalSignificance: 'Insufficient fluids reaching tongue', treatmentPrinciple: 'Nourish yin, generate fluids' },
      { finding: 'Wet/Watery Tongue', chineseName: '湿润舌 Shī Rùn Shé', description: 'Excessively moist, water pooling on surface', tcmPattern: 'Yang deficiency, Cold-dampness, Fluid retention', clinicalSignificance: 'Fluids not being transformed, accumulating', treatmentPrinciple: 'Warm yang, transform dampness' },
      { finding: 'Mirror Tongue (Shiny)', chineseName: '镜面舌 Jìng Miàn Shé', description: 'Shiny, smooth like mirror, no coating', tcmPattern: 'Severe Stomach-Spleen yin deficiency', clinicalSignificance: 'Complete depletion of stomach yin', treatmentPrinciple: 'Urgently nourish stomach yin' },
    ]
  },
  {
    category: 'Tongue Movement',
    findings: [
      { finding: 'Stiff/Rigid Tongue', chineseName: '强硬舌 Qiáng Yìng Shé', description: 'Difficulty moving, stiff, speech affected', tcmPattern: 'Wind-stroke, Heat in pericardium, Phlegm misting orifices', clinicalSignificance: 'Pathogen affecting tongue movement and speech', treatmentPrinciple: 'Extinguish wind, clear heat, resolve phlegm' },
      { finding: 'Flaccid/Limp Tongue', chineseName: '痿软舌 Wěi Ruǎn Shé', description: 'Weak, limp, cannot extend properly', tcmPattern: 'Qi-blood exhaustion, Severe yin deficiency', clinicalSignificance: 'Insufficient qi and blood to move tongue', treatmentPrinciple: 'Tonify qi and blood, nourish yin' },
      { finding: 'Trembling Tongue', chineseName: '颤动舌 Chàn Dòng Shé', description: 'Shaking, trembling when extended', tcmPattern: 'Liver wind, Qi-blood deficiency, Alcohol toxicity', clinicalSignificance: 'Wind or deficiency causing tremor', treatmentPrinciple: 'Extinguish wind, tonify qi-blood' },
      { finding: 'Deviated Tongue', chineseName: '歪斜舌 Wāi Xié Shé', description: 'Points to one side when extended', tcmPattern: 'Internal wind, Wind-stroke, Channel obstruction', clinicalSignificance: 'Wind affecting channels on one side', treatmentPrinciple: 'Extinguish wind, unblock channels' },
      { finding: 'Shortened/Contracted Tongue', chineseName: '短缩舌 Duǎn Suō Shé', description: 'Cannot extend out of mouth, contracted', tcmPattern: 'Critical cold or heat, Severe phlegm obstruction', clinicalSignificance: 'Very serious, life-threatening condition', treatmentPrinciple: 'Emergency treatment based on pattern' },
      { finding: 'Protruding Tongue', chineseName: '吐舌 Tǔ Shé', description: 'Tongue extends out involuntarily', tcmPattern: 'Heart-Spleen heat (children), Mental disorders', clinicalSignificance: 'Heat disturbing spirit', treatmentPrinciple: 'Clear heart heat, calm spirit' },
    ]
  },
  {
    category: 'Tongue Areas (Organ Mapping)',
    findings: [
      { finding: 'Red Tip', chineseName: '舌尖红 Shé Jiān Hóng', description: 'Redness concentrated at tongue tip', tcmPattern: 'Heart fire, Heart heat', clinicalSignificance: 'Heat in heart, may affect sleep/spirit', treatmentPrinciple: 'Clear heart fire, calm spirit' },
      { finding: 'Red Sides', chineseName: '舌边红 Shé Biān Hóng', description: 'Redness along tongue edges', tcmPattern: 'Liver-Gallbladder heat or fire', clinicalSignificance: 'Heat in liver and gallbladder channels', treatmentPrinciple: 'Clear liver heat, soothe liver' },
      { finding: 'Red Center', chineseName: '舌中红 Shé Zhōng Hóng', description: 'Redness in central area', tcmPattern: 'Stomach heat, Middle jiao heat', clinicalSignificance: 'Heat in stomach/spleen', treatmentPrinciple: 'Clear stomach heat' },
      { finding: 'Swollen Tip', chineseName: '舌尖肿 Shé Jiān Zhǒng', description: 'Enlarged or swollen tip area', tcmPattern: 'Heart fire, Heat rising', clinicalSignificance: 'Heat accumulating in heart area', treatmentPrinciple: 'Clear heart fire' },
      { finding: 'Swollen Sides', chineseName: '舌边肿 Shé Biān Zhǒng', description: 'Swelling along edges', tcmPattern: 'Liver qi stagnation with dampness', clinicalSignificance: 'Stagnation and dampness in liver channel', treatmentPrinciple: 'Soothe liver, resolve dampness' },
      { finding: 'Coating at Root Only', chineseName: '舌根苔 Shé Gēn Tāi', description: 'Coating concentrated at back of tongue', tcmPattern: 'Lower jiao dampness, Kidney-Bladder issues', clinicalSignificance: 'Dampness or pathology in lower burner', treatmentPrinciple: 'Resolve lower jiao dampness' },
    ]
  },
  {
    category: 'Special Findings',
    findings: [
      { finding: 'Sublingual Veins Distended', chineseName: '舌下络脉曲张 Shé Xià Luò Mài Qū Zhāng', description: 'Dark, distended veins under tongue', tcmPattern: 'Blood stasis, Qi stagnation with blood stasis', clinicalSignificance: 'Blood circulation impaired, stasis present', treatmentPrinciple: 'Invigorate blood, remove stasis' },
      { finding: 'Prickles/Thorns on Tongue', chineseName: '芒刺舌 Máng Cì Shé', description: 'Raised red dots or prickles on surface', tcmPattern: 'Intense heat, Heat in nutritive level', clinicalSignificance: 'Severe heat damaging blood vessels', treatmentPrinciple: 'Clear heat, cool blood' },
      { finding: 'Ulcers/Sores on Tongue', chineseName: '舌疮 Shé Chuāng', description: 'Open sores or ulcers on tongue', tcmPattern: 'Heart-Spleen fire, Yin deficiency fire flaring', clinicalSignificance: 'Fire damaging tongue tissue', treatmentPrinciple: 'Clear fire, nourish yin' },
      { finding: 'Geographic Tongue (Map-like)', chineseName: '地图舌 Dì Tú Shé', description: 'Irregular patches like map, coating missing in areas', tcmPattern: 'Stomach-Spleen yin deficiency, Often constitutional', clinicalSignificance: 'Yin deficiency, sometimes familial', treatmentPrinciple: 'Nourish stomach-spleen yin' },
      { finding: 'Half-coated Tongue', chineseName: '半边苔 Bàn Biān Tāi', description: 'Coating only on one half of tongue', tcmPattern: 'Shaoyang disorder, Half-interior half-exterior', clinicalSignificance: 'Pathogen between exterior and interior', treatmentPrinciple: 'Harmonize Shaoyang' },
      { finding: 'Strawberry Tongue', chineseName: '草莓舌 Cǎo Méi Shé', description: 'Red with prominent papillae, like strawberry', tcmPattern: 'Toxic heat, Scarlet fever pattern', clinicalSignificance: 'Severe heat-toxin in blood level', treatmentPrinciple: 'Clear heat-toxin, cool blood' },
    ]
  },
  {
    category: 'Constitutional Variations',
    findings: [
      { finding: 'Pregnancy Tongue Changes', chineseName: '孕妇舌象 Yùn Fù Shé Xiàng', description: 'Slightly red, may have thin yellow coat', tcmPattern: 'Normal pregnancy changes, Blood nourishing fetus', clinicalSignificance: 'Increased heat from blood supporting pregnancy', treatmentPrinciple: 'Monitor for excess, support pregnancy' },
      { finding: 'Child/Infant Tongue', chineseName: '小儿舌 Xiǎo Ér Shé', description: 'Smaller, pinker, thinner coating', tcmPattern: 'Normal pediatric constitution, Pure yang body', clinicalSignificance: 'Children have less developed patterns', treatmentPrinciple: 'Gentle treatment, monitor carefully' },
      { finding: 'Elderly Tongue Changes', chineseName: '老年舌象 Lǎo Nián Shé Xiàng', description: 'May be drier, more cracks, less coating', tcmPattern: 'Normal aging, Kidney yin/essence decline', clinicalSignificance: 'Natural decline of yin and essence', treatmentPrinciple: 'Nourish kidney yin and essence' },
    ]
  },
];

// Flat list for simple selection
export const allTongueFindings = tongueDiagnosisData.flatMap(category => 
  category.findings.map(f => ({
    ...f,
    category: category.category,
    value: f.finding,
    label: `${f.finding} ${f.chineseName}`,
  }))
);
