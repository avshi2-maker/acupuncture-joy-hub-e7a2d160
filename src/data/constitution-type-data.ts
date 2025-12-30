// Nine Constitutions Reference Data for Patient Intake Form
// From nine-constitutions-qa.csv - Traditional Chinese Medicine Body Constitution Types

export interface ConstitutionType {
  id: string;
  name: string;
  chineseName: string;
  characteristics: string;
  acupuncturePoints: string;
  herbalFormula: string;
}

export const constitutionTypes: ConstitutionType[] = [
  {
    id: 'ping_he',
    name: 'Balanced/Gentleness',
    chineseName: '平和质',
    characteristics: 'Well-balanced qi, blood, yin and yang; healthy complexion; good energy; adaptable to environment; rarely falls ill',
    acupuncturePoints: 'ST36 (Zusanli), CV6 (Qihai), CV4 (Guanyuan), LI4 (Hegu)',
    herbalFormula: 'Generally no intervention needed; seasonal health maintenance formulas if needed'
  },
  {
    id: 'qi_xu',
    name: 'Qi Deficiency',
    chineseName: '气虚质',
    characteristics: 'Fatigue, shortness of breath, weak voice, spontaneous sweating, prone to colds, poor immunity',
    acupuncturePoints: 'ST36 (Zusanli), CV6 (Qihai), BL20 (Pishu), BL21 (Weishu), CV12 (Zhongwan)',
    herbalFormula: 'Si Jun Zi Tang (Four Gentlemen Decoction), Bu Zhong Yi Qi Tang (Tonify Middle & Augment Qi)'
  },
  {
    id: 'yang_xu',
    name: 'Yang Deficiency',
    chineseName: '阳虚质',
    characteristics: 'Cold intolerance, cold limbs, preference for warm drinks, low energy, clear abundant urine',
    acupuncturePoints: 'GV4 (Mingmen), CV4 (Guanyuan), BL23 (Shenshu), ST36 (Zusanli), KI3 (Taixi)',
    herbalFormula: 'Jin Gui Shen Qi Wan (Golden Cabinet Kidney Qi Pill), You Gui Wan (Restore Right Kidney Pill)'
  },
  {
    id: 'yin_xu',
    name: 'Yin Deficiency',
    chineseName: '阴虚质',
    characteristics: 'Heat intolerance, dry mouth and throat, hot palms and soles, night sweats, dry skin',
    acupuncturePoints: 'KI3 (Taixi), KI6 (Zhaohai), SP6 (Sanyinjiao), BL23 (Shenshu), CV4 (Guanyuan)',
    herbalFormula: 'Liu Wei Di Huang Wan (Six Ingredient Rehmannia Pill), Zhi Bai Di Huang Wan (Anemarrhena & Phellodendron Rehmannia Pill)'
  },
  {
    id: 'tan_shi',
    name: 'Phlegm-Dampness',
    chineseName: '痰湿质',
    characteristics: 'Overweight, heaviness in body and head, excessive phlegm, chest oppression, greasy sensation',
    acupuncturePoints: 'ST40 (Fenglong), SP9 (Yinlingquan), CV12 (Zhongwan), ST36 (Zusanli), SP6 (Sanyinjiao)',
    herbalFormula: 'Er Chen Tang (Two Aged Decoction), Wen Dan Tang (Warm Gallbladder Decoction)'
  },
  {
    id: 'shi_re',
    name: 'Damp-Heat',
    chineseName: '湿热质',
    characteristics: 'Oily face, acne, bitter taste in mouth, body odor, yellow greasy urine, irritability',
    acupuncturePoints: 'SP9 (Yinlingquan), LI11 (Quchi), ST36 (Zusanli), SP6 (Sanyinjiao), LR3 (Taichong)',
    herbalFormula: 'Long Dan Xie Gan Tang (Gentiana Drain Liver Decoction), Yin Chen Hao Tang (Artemisia Capillaris Decoction)'
  },
  {
    id: 'xue_yu',
    name: 'Blood Stasis',
    chineseName: '血瘀质',
    characteristics: 'Dull complexion, dark pigmentation, easy bruising, stabbing pains, rough dry skin',
    acupuncturePoints: 'SP10 (Xuehai), BL17 (Geshu), LI4 (Hegu), LR3 (Taichong), SP6 (Sanyinjiao)',
    herbalFormula: 'Xue Fu Zhu Yu Tang (Drive Out Stasis from Blood Mansion), Tao Hong Si Wu Tang (Persica & Carthamus Four Substance)'
  },
  {
    id: 'qi_yu',
    name: 'Qi Stagnation',
    chineseName: '气郁质',
    characteristics: 'Emotional depression, anxiety, sighing, chest or rib distension, lump in throat, mood swings',
    acupuncturePoints: 'LR3 (Taichong), LI4 (Hegu), PC6 (Neiguan), CV17 (Tanzhong), LR14 (Qimen)',
    herbalFormula: 'Xiao Yao San (Free and Easy Wanderer), Chai Hu Shu Gan San (Bupleurum Soothing Liver Powder)'
  },
  {
    id: 'te_bing',
    name: 'Special/Inherited',
    chineseName: '特禀质',
    characteristics: 'Allergic constitution, sneezing, hives, asthma, drug sensitivities, congenital abnormalities',
    acupuncturePoints: 'LU7 (Lieque), LI4 (Hegu), ST36 (Zusanli), SP10 (Xuehai), BL13 (Feishu)',
    herbalFormula: 'Yu Ping Feng San (Jade Windscreen Powder), Xiao Feng San (Eliminate Wind Powder)'
  }
];

// Get constitution by ID
export const getConstitutionById = (id: string): ConstitutionType | undefined => {
  return constitutionTypes.find(c => c.id === id);
};

// Get all constitution names for dropdown
export const getConstitutionOptions = (): { value: string; label: string; chinese: string }[] => {
  return constitutionTypes.map(c => ({
    value: c.id,
    label: c.name,
    chinese: c.chineseName
  }));
};
