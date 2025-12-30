// Parsed from clinic_medications_supplements_intake.csv
// Comprehensive medication and supplement data with Western and TCM perspectives

export interface MedicationSupplement {
  category: string;
  genericName: string;
  purpose: string;
  westernMechanism: string;
  tcmPerspective: string;
  commonSideEffects: string;
  tcmConsiderations: string;
}

export const medicationsSupplementsData: MedicationSupplement[] = [
  // Cardiovascular - Antihypertensives
  {
    category: "Cardiovascular - Antihypertensives",
    genericName: "Lisinopril (ACE Inhibitor)",
    purpose: "High blood pressure, heart failure, post-MI",
    westernMechanism: "Blocks angiotensin-converting enzyme, reduces blood pressure",
    tcmPerspective: "Strongly descends qi, may deplete kidney yang and qi over time",
    commonSideEffects: "Dry cough, dizziness, hyperkalemia, angioedema",
    tcmConsiderations: "May weaken kidney qi, consider tonifying kidney and lung"
  },
  {
    category: "Cardiovascular - Antihypertensives",
    genericName: "Amlodipine (Calcium Channel Blocker)",
    purpose: "High blood pressure, angina",
    westernMechanism: "Relaxes blood vessels by blocking calcium channels",
    tcmPerspective: "Relaxes vessels, may deplete yang qi and cause fluid retention (dampness)",
    commonSideEffects: "Edema, flushing, dizziness, palpitations",
    tcmConsiderations: "Monitor for lower limb edema (spleen-kidney yang deficiency)"
  },
  {
    category: "Cardiovascular - Antihypertensives",
    genericName: "Losartan (ARB)",
    purpose: "High blood pressure, diabetic nephropathy, heart failure",
    westernMechanism: "Blocks angiotensin II receptors, lowers blood pressure",
    tcmPerspective: "Descends qi, gentler on kidney than ACE inhibitors",
    commonSideEffects: "Dizziness, hyperkalemia, kidney function changes",
    tcmConsiderations: "Less likely to cause cough than ACE inhibitors"
  },
  {
    category: "Cardiovascular - Antihypertensives",
    genericName: "Metoprolol (Beta Blocker)",
    purpose: "High blood pressure, angina, heart failure, arrhythmias",
    westernMechanism: "Blocks beta-adrenergic receptors, slows heart rate",
    tcmPerspective: "Slows heart qi, cooling nature, may deplete heart yang",
    commonSideEffects: "Fatigue, cold extremities, bradycardia, depression",
    tcmConsiderations: "Can create cold pattern, consider warming herbs cautiously"
  },
  {
    category: "Cardiovascular - Antihypertensives",
    genericName: "Hydrochlorothiazide (Thiazide Diuretic)",
    purpose: "High blood pressure, edema",
    westernMechanism: "Increases urine output, reduces fluid volume",
    tcmPerspective: "Drains dampness through kidney, may deplete kidney yin and yang",
    commonSideEffects: "Dehydration, electrolyte imbalance, dizziness, increased urination",
    tcmConsiderations: "Monitor for yin deficiency signs, may need to tonify kidney"
  },
  // Cardiovascular - Cholesterol
  {
    category: "Cardiovascular - Cholesterol",
    genericName: "Atorvastatin (Statin)",
    purpose: "High cholesterol, cardiovascular disease prevention",
    westernMechanism: "Inhibits HMG-CoA reductase, lowers LDL cholesterol",
    tcmPerspective: "Resolves phlegm-dampness in blood vessels, may deplete liver blood and qi",
    commonSideEffects: "Muscle pain, liver enzyme elevation, fatigue",
    tcmConsiderations: "May cause liver blood deficiency, muscle weakness (spleen-liver involvement)"
  },
  {
    category: "Cardiovascular - Cholesterol",
    genericName: "Simvastatin (Statin)",
    purpose: "High cholesterol, cardiovascular protection",
    westernMechanism: "Reduces cholesterol production in liver",
    tcmPerspective: "Transforms phlegm-turbidity, may damage liver yin and blood",
    commonSideEffects: "Myopathy, hepatotoxicity, digestive upset",
    tcmConsiderations: "Monitor liver function, nourish liver blood if needed"
  },
  // Cardiovascular - Anticoagulants
  {
    category: "Cardiovascular - Anticoagulants",
    genericName: "Warfarin",
    purpose: "Blood clot prevention, atrial fibrillation, DVT",
    westernMechanism: "Vitamin K antagonist, inhibits clotting factors",
    tcmPerspective: "Cools and thins blood, invigorates blood, depletes blood over time",
    commonSideEffects: "Bleeding risk, bruising",
    tcmConsiderations: "AVOID blood-invigorating herbs (Dang Gui, Hong Hua), nourish blood"
  },
  {
    category: "Cardiovascular - Anticoagulants",
    genericName: "Rivaroxaban (DOAC)",
    purpose: "Blood clot prevention, stroke prevention in AFib",
    westernMechanism: "Direct Factor Xa inhibitor",
    tcmPerspective: "Strongly moves blood, cooling, may create blood deficiency",
    commonSideEffects: "Bleeding risk, no reversal agent readily available",
    tcmConsiderations: "CAUTION with blood-moving herbs, monitor for blood deficiency"
  },
  // Cardiovascular - Antiplatelets
  {
    category: "Cardiovascular - Antiplatelets",
    genericName: "Aspirin (Low-dose)",
    purpose: "Heart attack prevention, stroke prevention, antiplatelet",
    westernMechanism: "Irreversibly inhibits COX-1, prevents platelet aggregation",
    tcmPerspective: "Bitter-cold, invigorates blood, may damage stomach and spleen",
    commonSideEffects: "GI bleeding, stomach upset, bruising",
    tcmConsiderations: "AVOID strong blood-moving herbs, protect stomach qi"
  },
  {
    category: "Cardiovascular - Antiplatelets",
    genericName: "Clopidogrel",
    purpose: "Prevent blood clots after heart attack or stroke",
    westernMechanism: "P2Y12 inhibitor, prevents platelet activation",
    tcmPerspective: "Invigorates blood, cooling, may deplete blood",
    commonSideEffects: "Bleeding, bruising, GI upset",
    tcmConsiderations: "CAUTION with blood-moving herbs, nourish blood if deficient"
  },
  // Cardiovascular - Heart Failure
  {
    category: "Cardiovascular - Heart Failure",
    genericName: "Furosemide (Loop Diuretic)",
    purpose: "Heart failure, edema, pulmonary edema",
    westernMechanism: "Powerful diuretic, reduces fluid overload",
    tcmPerspective: "Strongly drains dampness, depletes kidney yin and yang, drains qi",
    commonSideEffects: "Dehydration, electrolyte imbalance, dizziness, kidney stress",
    tcmConsiderations: "Tonify kidney and spleen qi, monitor for severe deficiency"
  },
  // Cardiovascular - Arrhythmias
  {
    category: "Cardiovascular - Arrhythmias",
    genericName: "Digoxin",
    purpose: "Atrial fibrillation, heart failure",
    westernMechanism: "Increases cardiac contractility, slows AV conduction",
    tcmPerspective: "Regulates heart rhythm, toxic in excess, affects heart qi",
    commonSideEffects: "Nausea, arrhythmias (toxic), visual changes, narrow therapeutic window",
    tcmConsiderations: "Narrow margin of safety, monitor heart qi"
  },
  // Diabetes - Oral Hypoglycemics
  {
    category: "Diabetes - Oral Hypoglycemics",
    genericName: "Metformin",
    purpose: "Type 2 diabetes, PCOS, insulin resistance",
    westernMechanism: "Reduces hepatic glucose production, increases insulin sensitivity",
    tcmPerspective: "Clears heat from middle jiao, transforms phlegm-dampness, may deplete spleen qi",
    commonSideEffects: "GI upset, diarrhea, B12 deficiency, lactic acidosis (rare)",
    tcmConsiderations: "Can weaken spleen, support with spleen-tonifying foods"
  },
  {
    category: "Diabetes - Oral Hypoglycemics",
    genericName: "Glipizide (Sulfonylurea)",
    purpose: "Type 2 diabetes",
    westernMechanism: "Stimulates pancreatic insulin release",
    tcmPerspective: "Forces pancreas (spleen) to work harder, may deplete spleen-kidney qi",
    commonSideEffects: "Hypoglycemia, weight gain",
    tcmConsiderations: "May exhaust pancreatic function, tonify spleen-kidney"
  },
  // Diabetes - Injectable
  {
    category: "Diabetes - Injectable",
    genericName: "Insulin (various types)",
    purpose: "Type 1 and Type 2 diabetes",
    westernMechanism: "Replaces or supplements natural insulin",
    tcmPerspective: "Replaces spleen's transformation function, manages wasting-thirst syndrome",
    commonSideEffects: "Hypoglycemia, weight gain, injection site reactions",
    tcmConsiderations: "Support spleen-kidney qi, monitor yin deficiency"
  },
  // Diabetes - GLP-1 Agonists
  {
    category: "Diabetes - GLP-1 Agonists",
    genericName: "Semaglutide",
    purpose: "Type 2 diabetes, weight loss",
    westernMechanism: "GLP-1 receptor agonist, increases insulin, decreases appetite",
    tcmPerspective: "Clears dampness-heat, regulates spleen-stomach, may deplete qi",
    commonSideEffects: "Nausea, vomiting, diarrhea, pancreatitis risk",
    tcmConsiderations: "Monitor for spleen qi deficiency, support digestion"
  },
  // Gastrointestinal - Acid Reducers
  {
    category: "Gastrointestinal - Acid Reducers",
    genericName: "Omeprazole (PPI)",
    purpose: "GERD, peptic ulcers, acid reflux",
    westernMechanism: "Blocks stomach acid production",
    tcmPerspective: "Reduces stomach fire but weakens spleen yang, impairs transformation",
    commonSideEffects: "Headache, nutrient malabsorption (B12, calcium), increased infection risk",
    tcmConsiderations: "Long-term use creates spleen-stomach cold-deficiency, dampness accumulation"
  },
  // Gastrointestinal - Laxatives
  {
    category: "Gastrointestinal - Laxatives",
    genericName: "Docusate (Stool Softener)",
    purpose: "Constipation",
    westernMechanism: "Increases water in stool",
    tcmPerspective: "Moistens intestines, addresses fluid deficiency",
    commonSideEffects: "Cramping, diarrhea if excessive",
    tcmConsiderations: "For intestinal dryness, support with yin-nourishing foods"
  },
  {
    category: "Gastrointestinal - Laxatives",
    genericName: "Senna (Stimulant Laxative)",
    purpose: "Constipation",
    westernMechanism: "Stimulates colon contractions",
    tcmPerspective: "Bitter-cold, purges heat, damages spleen-kidney yang with overuse",
    commonSideEffects: "Cramping, dependence, electrolyte loss",
    tcmConsiderations: "Avoid long-term use, can create cold deficiency"
  },
  // Gastrointestinal - Anti-diarrheal
  {
    category: "Gastrointestinal - Anti-diarrheal",
    genericName: "Loperamide",
    purpose: "Diarrhea",
    westernMechanism: "Slows gut motility, opioid receptor agonist",
    tcmPerspective: "Binds and constrains intestines, may worsen spleen qi deficiency",
    commonSideEffects: "Constipation, bloating, dizziness",
    tcmConsiderations: "Treats symptom not root cause, tonify spleen for chronic diarrhea"
  },
  // Gastrointestinal - Antiemetic
  {
    category: "Gastrointestinal - Antiemetic",
    genericName: "Ondansetron",
    purpose: "Nausea, vomiting (chemotherapy, surgery)",
    westernMechanism: "5-HT3 receptor antagonist",
    tcmPerspective: "Descends rebellious stomach qi, cooling nature",
    commonSideEffects: "Headache, constipation, dizziness",
    tcmConsiderations: "Harmonize stomach qi, assess for underlying patterns"
  },
  // Respiratory - Asthma/COPD
  {
    category: "Respiratory - Asthma/COPD",
    genericName: "Albuterol (SABA)",
    purpose: "Acute asthma, bronchospasm",
    westernMechanism: "Relaxes airway smooth muscle, bronchodilation",
    tcmPerspective: "Opens lung qi, disperses constraint, warming and drying",
    commonSideEffects: "Tremor, palpitations, anxiety, tachycardia",
    tcmConsiderations: "Can deplete lung yin with overuse, may create heat"
  },
  {
    category: "Respiratory - Asthma/COPD",
    genericName: "Fluticasone (ICS)",
    purpose: "Chronic asthma, COPD maintenance",
    westernMechanism: "Anti-inflammatory, reduces airway inflammation",
    tcmPerspective: "Cold-bitter nature, suppresses lung fire but may weaken lung qi",
    commonSideEffects: "Oral thrush, hoarseness, throat irritation",
    tcmConsiderations: "Long-term use weakens lung and kidney qi, rinse mouth after use"
  },
  // Respiratory - Allergy
  {
    category: "Respiratory - Allergy",
    genericName: "Loratadine (Antihistamine)",
    purpose: "Allergies, hay fever, hives",
    westernMechanism: "H1 receptor antagonist, blocks histamine",
    tcmPerspective: "Disperses wind, clears heat, drying nature may deplete fluids",
    commonSideEffects: "Dry mouth, headache, fatigue (less sedating)",
    tcmConsiderations: "Drying, may need to nourish yin, doesn't address wei qi deficiency"
  },
  {
    category: "Respiratory - Allergy",
    genericName: "Diphenhydramine (First-gen Antihistamine)",
    purpose: "Allergies, insomnia, motion sickness",
    westernMechanism: "H1 antagonist, crosses blood-brain barrier",
    tcmPerspective: "Disperses wind, sedates spirit, drying and cooling",
    commonSideEffects: "Drowsiness, dry mouth, urinary retention, confusion in elderly",
    tcmConsiderations: "Sedating, depletes fluids, affects shen and wei qi"
  },
  // Respiratory - Decongestant
  {
    category: "Respiratory - Decongestant",
    genericName: "Pseudoephedrine",
    purpose: "Nasal congestion, sinus pressure",
    westernMechanism: "Vasoconstriction in nasal passages",
    tcmPerspective: "Warm-pungent, disperses wind-cold, opens orifices, depletes yin",
    commonSideEffects: "Insomnia, anxiety, increased blood pressure, palpitations",
    tcmConsiderations: "Contraindicated in yin deficiency with heat, hypertension"
  },
  // Pain - NSAIDs
  {
    category: "Pain - NSAIDs",
    genericName: "Ibuprofen",
    purpose: "Pain, inflammation, fever",
    westernMechanism: "COX-1 and COX-2 inhibitor, reduces prostaglandins",
    tcmPerspective: "Bitter-cold, clears heat, moves qi and blood, damages spleen-stomach",
    commonSideEffects: "GI bleeding, kidney damage, cardiovascular risk",
    tcmConsiderations: "Injures stomach qi, avoid long-term use, protect spleen-stomach"
  },
  {
    category: "Pain - NSAIDs",
    genericName: "Naproxen",
    purpose: "Pain, inflammation, arthritis",
    westernMechanism: "COX inhibitor, longer-acting than ibuprofen",
    tcmPerspective: "Bitter-cold, clears heat and dampness, damages spleen-stomach yang",
    commonSideEffects: "GI issues, cardiovascular risk, kidney problems",
    tcmConsiderations: "Similar to ibuprofen, protect middle jiao"
  },
  // Pain - Opioids
  {
    category: "Pain - Opioids",
    genericName: "Oxycodone",
    purpose: "Moderate to severe pain",
    westernMechanism: "Mu-opioid receptor agonist, CNS depression",
    tcmPerspective: "Warm-sweet, stops pain by constraining, binds intestines, depletes qi",
    commonSideEffects: "Constipation, drowsiness, respiratory depression, addiction risk",
    tcmConsiderations: "Binding nature causes qi stagnation, weakens spleen, affects shen"
  },
  {
    category: "Pain - Opioids",
    genericName: "Tramadol",
    purpose: "Moderate pain",
    westernMechanism: "Weak opioid agonist, serotonin-norepinephrine reuptake inhibitor",
    tcmPerspective: "Stops pain, less constraining than stronger opioids, affects liver-kidney",
    commonSideEffects: "Nausea, dizziness, constipation, seizure risk",
    tcmConsiderations: "Less binding than oxycodone, still depletes qi"
  },
  // Pain - Acetaminophen
  {
    category: "Pain - Acetaminophen",
    genericName: "Acetaminophen (Paracetamol)",
    purpose: "Pain, fever",
    westernMechanism: "COX-3 inhibitor (proposed), central analgesic",
    tcmPerspective: "Clears heat, stops pain, less damaging to spleen than NSAIDs, harms liver",
    commonSideEffects: "Liver toxicity at high doses, generally well-tolerated",
    tcmConsiderations: "Gentler on stomach, but hepatotoxic, affects liver blood"
  },
  // Pain - Neuropathic
  {
    category: "Pain - Neuropathic",
    genericName: "Gabapentin",
    purpose: "Neuropathic pain, seizures, neuropathy",
    westernMechanism: "Modulates calcium channels, reduces nerve excitability",
    tcmPerspective: "Calms liver wind, sedates nerve qi, may deplete kidney essence",
    commonSideEffects: "Dizziness, drowsiness, weight gain, edema",
    tcmConsiderations: "Affects shen and kidney, monitor for qi deficiency"
  },
  {
    category: "Pain - Neuropathic",
    genericName: "Pregabalin",
    purpose: "Neuropathic pain, fibromyalgia, seizures",
    westernMechanism: "Similar to gabapentin, binds alpha-2-delta subunit",
    tcmPerspective: "Calms wind, sedates nerves, depletes kidney and liver essence",
    commonSideEffects: "Dizziness, drowsiness, weight gain, dependency potential",
    tcmConsiderations: "Sedating nature affects shen, kidney essence"
  },
  // Antibiotics - Penicillins
  {
    category: "Antibiotics - Penicillins",
    genericName: "Amoxicillin",
    purpose: "Bacterial infections (respiratory, ear, skin)",
    westernMechanism: "Beta-lactam, inhibits bacterial cell wall synthesis",
    tcmPerspective: "Bitter-cold, clears heat-toxin, may damage spleen-stomach qi",
    commonSideEffects: "Diarrhea, rash, allergic reactions",
    tcmConsiderations: "Depletes gut flora (spleen-stomach qi), use probiotics after"
  },
  // Antibiotics - Cephalosporins
  {
    category: "Antibiotics - Cephalosporins",
    genericName: "Cephalexin",
    purpose: "Bacterial infections (skin, respiratory, UTI)",
    westernMechanism: "Beta-lactam, bactericidal",
    tcmPerspective: "Cold-bitter, clears heat-toxin, less harsh than fluoroquinolones",
    commonSideEffects: "GI upset, allergic reactions, yeast infections",
    tcmConsiderations: "Damages spleen qi and microbiome, support with fermented foods"
  },
  // Antibiotics - Macrolides
  {
    category: "Antibiotics - Macrolides",
    genericName: "Azithromycin",
    purpose: "Respiratory infections, STIs, atypical bacteria",
    westernMechanism: "Inhibits bacterial protein synthesis",
    tcmPerspective: "Bitter-cold, clears lung and throat heat-toxin",
    commonSideEffects: "GI upset, QT prolongation, hearing changes",
    tcmConsiderations: "Affects heart rhythm (heart qi), protect spleen-stomach"
  },
  // Antibiotics - Fluoroquinolones
  {
    category: "Antibiotics - Fluoroquinolones",
    genericName: "Ciprofloxacin",
    purpose: "UTIs, respiratory, GI, bone infections",
    westernMechanism: "DNA gyrase inhibitor, broad-spectrum",
    tcmPerspective: "Very cold-bitter, clears damp-heat toxin, damages tendons and kidney",
    commonSideEffects: "Tendon rupture, neuropathy, QT prolongation, CNS effects",
    tcmConsiderations: "CAUTION: damages liver-kidney, avoid in tendon issues, tonify afterwards"
  },
  // Antibiotics - Tetracyclines
  {
    category: "Antibiotics - Tetracyclines",
    genericName: "Doxycycline",
    purpose: "Acne, respiratory infections, Lyme disease, malaria prevention",
    westernMechanism: "Inhibits protein synthesis, anti-inflammatory",
    tcmPerspective: "Cold-bitter, clears heat-toxin, damp-heat, photosensitizing (yin deficiency)",
    commonSideEffects: "GI upset, photosensitivity, esophageal irritation, tooth staining",
    tcmConsiderations: "Damages spleen-stomach, depletes yin, avoid sun exposure"
  },
  // Mental Health - Antidepressants (SSRIs)
  {
    category: "Mental Health - SSRIs",
    genericName: "Sertraline",
    purpose: "Depression, anxiety, OCD, PTSD",
    westernMechanism: "Selective serotonin reuptake inhibitor",
    tcmPerspective: "Moves liver qi, calms shen, long-term may deplete kidney essence",
    commonSideEffects: "Nausea, sexual dysfunction, insomnia, weight changes",
    tcmConsiderations: "Affects liver-heart-kidney, monitor for yin and jing depletion"
  },
  {
    category: "Mental Health - SSRIs",
    genericName: "Fluoxetine",
    purpose: "Depression, anxiety, OCD, bulimia",
    westernMechanism: "SSRI, long half-life",
    tcmPerspective: "Moves liver qi stagnation, calms shen, cooling nature",
    commonSideEffects: "Similar to sertraline, activation/agitation possible",
    tcmConsiderations: "Can be activating (raises yang), affects liver and heart"
  },
  // Mental Health - Antidepressants (SNRIs)
  {
    category: "Mental Health - SNRIs",
    genericName: "Venlafaxine",
    purpose: "Depression, anxiety, neuropathic pain",
    westernMechanism: "Serotonin-norepinephrine reuptake inhibitor",
    tcmPerspective: "Moves qi and yang, raises yang qi, may create heat",
    commonSideEffects: "Hypertension, nausea, sexual dysfunction, withdrawal symptoms",
    tcmConsiderations: "More activating, can raise blood pressure (liver yang rising)"
  },
  // Mental Health - Anxiolytics
  {
    category: "Mental Health - Anxiolytics",
    genericName: "Alprazolam (Benzodiazepine)",
    purpose: "Anxiety, panic disorder",
    westernMechanism: "GABA-A receptor agonist, CNS depression",
    tcmPerspective: "Strongly sedates shen, calms liver, depletes kidney essence, addictive",
    commonSideEffects: "Sedation, memory impairment, dependence, withdrawal",
    tcmConsiderations: "Damages kidney jing, weakens shen, difficult withdrawal (qi collapse)"
  },
  {
    category: "Mental Health - Anxiolytics",
    genericName: "Lorazepam (Benzodiazepine)",
    purpose: "Anxiety, insomnia, seizures",
    westernMechanism: "GABA-A agonist, intermediate-acting",
    tcmPerspective: "Sedates shen, calms liver and heart, depletes essence",
    commonSideEffects: "Sedation, confusion, dependence, respiratory depression",
    tcmConsiderations: "Similar to alprazolam, damages kidney and shen"
  },
  // Mental Health - Antipsychotics
  {
    category: "Mental Health - Antipsychotics",
    genericName: "Quetiapine",
    purpose: "Schizophrenia, bipolar disorder, depression adjunct",
    westernMechanism: "Dopamine and serotonin antagonist",
    tcmPerspective: "Heavily sedates shen, calms liver wind, severely depletes qi and essence",
    commonSideEffects: "Sedation, weight gain, metabolic syndrome, diabetes risk",
    tcmConsiderations: "Creates dampness, depletes spleen-kidney, affects shen profoundly"
  },
  {
    category: "Mental Health - Antipsychotics",
    genericName: "Risperidone",
    purpose: "Schizophrenia, bipolar mania, autism irritability",
    westernMechanism: "Dopamine D2 and serotonin 5-HT2 antagonist",
    tcmPerspective: "Suppresses liver yang and wind, sedates shen, depletes kidney",
    commonSideEffects: "Weight gain, extrapyramidal symptoms, hyperprolactinemia",
    tcmConsiderations: "Damages kidney essence, creates dampness, affects liver and shen"
  },
  // Mental Health - Mood Stabilizers
  {
    category: "Mental Health - Mood Stabilizers",
    genericName: "Lithium",
    purpose: "Bipolar disorder, mania",
    westernMechanism: "Modulates neurotransmitters, exact mechanism unclear",
    tcmPerspective: "Mineral medicine, calms shen and liver, toxic to kidney with narrow range",
    commonSideEffects: "Tremor, thirst, polyuria, kidney damage, thyroid issues",
    tcmConsiderations: "Damages kidney essence and yin, requires close monitoring"
  },
  // Mental Health - Stimulants
  {
    category: "Mental Health - Stimulants",
    genericName: "Methylphenidate",
    purpose: "ADHD, narcolepsy",
    westernMechanism: "Dopamine and norepinephrine reuptake inhibitor, stimulant",
    tcmPerspective: "Strongly raises yang and qi, sharpens shen, depletes yin and essence",
    commonSideEffects: "Insomnia, appetite suppression, growth suppression in children, palpitations",
    tcmConsiderations: "Depletes kidney yin and essence, creates heat, affects heart and liver"
  },
  {
    category: "Mental Health - Stimulants",
    genericName: "Amphetamine/Dextroamphetamine",
    purpose: "ADHD",
    westernMechanism: "Increases dopamine and norepinephrine release",
    tcmPerspective: "Very warming, raises yang, activates shen, severely depletes yin and jing",
    commonSideEffects: "Similar to methylphenidate, higher abuse potential",
    tcmConsiderations: "Extreme yin-depleting, kidney essence damage with long-term use"
  },
  // Hormones - Thyroid
  {
    category: "Hormones - Thyroid",
    genericName: "Levothyroxine",
    purpose: "Hypothyroidism, thyroid hormone replacement",
    westernMechanism: "Synthetic T4, replaces thyroid hormone",
    tcmPerspective: "Tonifies kidney yang and qi, warms metabolism, supports transformation",
    commonSideEffects: "Palpitations, anxiety, weight loss if excessive, bone loss",
    tcmConsiderations: "Necessary replacement, supports kidney yang, monitor for excess (heat signs)"
  },
  // Hormones - Contraceptives
  {
    category: "Hormones - Contraceptives",
    genericName: "Ethinyl Estradiol/Levonorgestrel (Birth Control)",
    purpose: "Contraception, menstrual regulation",
    westernMechanism: "Suppresses ovulation, alters cervical mucus and endometrium",
    tcmPerspective: "Disrupts natural liver-kidney axis, may create blood stasis and dampness",
    commonSideEffects: "Mood changes, weight gain, blood clot risk, breakthrough bleeding",
    tcmConsiderations: "Can cause liver qi stagnation and blood stasis, monitor liver function"
  },
  // Hormones - Corticosteroids
  {
    category: "Hormones - Corticosteroids",
    genericName: "Prednisone",
    purpose: "Inflammation, autoimmune diseases, allergies, asthma",
    westernMechanism: "Synthetic glucocorticoid, anti-inflammatory, immunosuppressive",
    tcmPerspective: "Initially raises yang qi, long-term depletes kidney yang, creates dampness and heat",
    commonSideEffects: "Weight gain, mood changes, immunosuppression, osteoporosis, diabetes",
    tcmConsiderations: "Severely damages kidney yang and essence with long-term use"
  },
  // Supplement - Vitamins
  {
    category: "Supplement - Vitamins",
    genericName: "Vitamin D3 (Cholecalciferol)",
    purpose: "Bone health, immune function, mood, deficiency prevention",
    westernMechanism: "Hormone precursor, calcium absorption, immune modulation",
    tcmPerspective: "Tonifies kidney yang, strengthens bones, supports wei qi",
    commonSideEffects: "Hypercalcemia if excessive, kidney stones",
    tcmConsiderations: "Supports kidney and bone (jing), especially important in deficiency"
  },
  {
    category: "Supplement - Vitamins",
    genericName: "Vitamin B12 (Cobalamin)",
    purpose: "Anemia prevention, nerve health, energy, methylation",
    westernMechanism: "Cofactor for DNA synthesis and myelin production",
    tcmPerspective: "Nourishes blood and essence, supports spleen-stomach transformation",
    commonSideEffects: "Generally safe, rarely acne or allergic reactions",
    tcmConsiderations: "Essential for blood production, particularly in vegetarians"
  },
  {
    category: "Supplement - Vitamins",
    genericName: "Vitamin C (Ascorbic Acid)",
    purpose: "Immune support, antioxidant, collagen synthesis",
    westernMechanism: "Antioxidant, cofactor for collagen and neurotransmitters",
    tcmPerspective: "Cool-sour, supports wei qi, generates fluids, clears heat",
    commonSideEffects: "GI upset at high doses, kidney stones possible",
    tcmConsiderations: "Supports defensive qi, cooling nature benefits heat patterns"
  },
  {
    category: "Supplement - Vitamins",
    genericName: "Folic Acid (Vitamin B9)",
    purpose: "Pregnancy, anemia prevention, cardiovascular health",
    westernMechanism: "DNA synthesis, red blood cell production, homocysteine metabolism",
    tcmPerspective: "Nourishes blood, supports spleen-liver, essential for pregnancy",
    commonSideEffects: "Generally safe, may mask B12 deficiency",
    tcmConsiderations: "Blood-nourishing, especially important for women"
  },
  {
    category: "Supplement - Vitamins",
    genericName: "Multivitamin",
    purpose: "General nutritional insurance, deficiency prevention",
    westernMechanism: "Provides various vitamins and minerals",
    tcmPerspective: "Supports general qi and blood, organ functions",
    commonSideEffects: "Generally safe, possible GI upset",
    tcmConsiderations: "Not a substitute for good diet (food qi more important)"
  },
  // Supplement - Minerals
  {
    category: "Supplement - Minerals",
    genericName: "Calcium Carbonate/Citrate",
    purpose: "Bone health, osteoporosis prevention",
    westernMechanism: "Essential mineral for bone density",
    tcmPerspective: "Tonifies kidney, strengthens bones and teeth (kidney governs bone)",
    commonSideEffects: "Constipation, kidney stones, interactions with absorption",
    tcmConsiderations: "Supports kidney jing and bone, take with vitamin D"
  },
  {
    category: "Supplement - Minerals",
    genericName: "Magnesium",
    purpose: "Muscle function, nerve health, constipation, sleep",
    westernMechanism: "Cofactor for 300+ enzymes, muscle relaxation",
    tcmPerspective: "Calms liver, relaxes sinews, moistens intestines",
    commonSideEffects: "Diarrhea at high doses, especially magnesium oxide",
    tcmConsiderations: "Relaxes liver, good for constraint and spasms"
  },
  {
    category: "Supplement - Minerals",
    genericName: "Iron (Ferrous Sulfate)",
    purpose: "Anemia, iron deficiency",
    westernMechanism: "Essential for hemoglobin production",
    tcmPerspective: "Tonifies blood, supports spleen-liver blood production",
    commonSideEffects: "Constipation, nausea, black stools, GI upset",
    tcmConsiderations: "Nourishes blood but constipating, take with vitamin C"
  },
  {
    category: "Supplement - Minerals",
    genericName: "Zinc",
    purpose: "Immune function, wound healing, taste, skin health",
    westernMechanism: "Cofactor for enzymes, immune cell function",
    tcmPerspective: "Supports wei qi, helps transformation, benefits skin (lung)",
    commonSideEffects: "Nausea, copper depletion with high doses",
    tcmConsiderations: "Strengthens defensive qi, good for immunity"
  },
  // Supplement - Omega Fatty Acids
  {
    category: "Supplement - Omega Fatty Acids",
    genericName: "Fish Oil (Omega-3 EPA/DHA)",
    purpose: "Cardiovascular health, anti-inflammatory, brain function",
    westernMechanism: "Anti-inflammatory, reduces triglycerides, supports neuronal membranes",
    tcmPerspective: "Nourishes yin and blood, moistens dryness, moves blood gently",
    commonSideEffects: "Fishy burps, bleeding risk at very high doses",
    tcmConsiderations: "Yin-nourishing, good for dryness and inflammation"
  },
  // Supplement - Probiotics
  {
    category: "Supplement - Probiotics",
    genericName: "Lactobacillus/Bifidobacterium (Probiotics)",
    purpose: "Gut health, digestion, immune support, post-antibiotic",
    westernMechanism: "Restores beneficial gut bacteria, immune modulation",
    tcmPerspective: "Supports spleen transformation, restores middle jiao harmony",
    commonSideEffects: "Gas, bloating initially, generally very safe",
    tcmConsiderations: "Restores spleen-stomach qi after antibiotics or illness"
  },
  // Supplement - Herbal
  {
    category: "Supplement - Herbal",
    genericName: "Turmeric/Curcumin",
    purpose: "Anti-inflammatory, antioxidant, joint health",
    westernMechanism: "COX-2 inhibitor, NF-kB inhibitor, antioxidant",
    tcmPerspective: "Warm-bitter-pungent, invigorates blood, moves qi, dispels wind-damp",
    commonSideEffects: "GI upset, may increase bleeding risk",
    tcmConsiderations: "Blood-moving, good for pain and stasis, warm nature"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Ginger Root",
    purpose: "Nausea, digestion, anti-inflammatory",
    westernMechanism: "Antiemetic, anti-inflammatory, digestive stimulant",
    tcmPerspective: "Warm-pungent, warms middle, stops nausea, dispels cold",
    commonSideEffects: "Heartburn at high doses",
    tcmConsiderations: "Warms spleen-stomach, excellent for cold patterns and nausea"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Ginkgo Biloba",
    purpose: "Memory, circulation, cognitive function",
    westernMechanism: "Improves blood flow, antioxidant, neuroprotective",
    tcmPerspective: "Neutral-bitter-sweet, invigorates blood to brain, benefits kidney",
    commonSideEffects: "Bleeding risk, GI upset, headache",
    tcmConsiderations: "Opens blood vessels to head, CAUTION with anticoagulants"
  },
  {
    category: "Supplement - Herbal",
    genericName: "St. John's Wort",
    purpose: "Mild to moderate depression, anxiety",
    westernMechanism: "Serotonin reuptake inhibitor, multiple neurotransmitter effects",
    tcmPerspective: "Moves liver qi, clears heat, calms shen",
    commonSideEffects: "Photosensitivity, many drug interactions (CYP450 inducer)",
    tcmConsiderations: "MAJOR drug interactions, avoid with many medications"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Valerian Root",
    purpose: "Insomnia, anxiety, sleep aid",
    westernMechanism: "GABA-A receptor modulation, sedative",
    tcmPerspective: "Calms shen, anchors ethereal soul, slightly warm",
    commonSideEffects: "Morning drowsiness, vivid dreams, paradoxical stimulation",
    tcmConsiderations: "Sedates shen, good for restless sleep"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Melatonin",
    purpose: "Insomnia, jet lag, sleep regulation",
    westernMechanism: "Hormone that regulates circadian rhythm",
    tcmPerspective: "Harmonizes yin-yang transition, calms shen, supports kidney",
    commonSideEffects: "Morning grogginess, vivid dreams, hormone effects",
    tcmConsiderations: "Regulates sleep-wake cycle, supports kidney yin"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Echinacea",
    purpose: "Immune support, cold prevention and treatment",
    westernMechanism: "Immune stimulant, anti-inflammatory",
    tcmPerspective: "Cool-bitter, clears heat-toxin, supports wei qi briefly",
    commonSideEffects: "Allergic reactions, autoimmune concerns with long-term use",
    tcmConsiderations: "Short-term use for exterior patterns, not for long-term immune support"
  },
  // Supplement - Amino Acids
  {
    category: "Supplement - Amino Acids",
    genericName: "L-Theanine",
    purpose: "Anxiety, relaxation, focus (in tea)",
    westernMechanism: "Increases GABA, dopamine, and serotonin, promotes alpha waves",
    tcmPerspective: "Calms shen, clears mind, gentle liver-soothing",
    commonSideEffects: "Very safe, rare GI upset",
    tcmConsiderations: "Calms without sedating, good for anxiety with mental clarity"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Ashwagandha",
    purpose: "Stress, anxiety, energy, adaptogen",
    westernMechanism: "Adaptogen, cortisol modulation, GABAergic",
    tcmPerspective: "Warm, tonifies kidney yang and qi, calms shen, adaptogenic",
    commonSideEffects: "GI upset, thyroid effects, may increase thyroid hormone",
    tcmConsiderations: "Tonifies kidney and adrenals, good for stress and yang deficiency"
  },
  {
    category: "Supplement - Protein",
    genericName: "Whey Protein Powder",
    purpose: "Muscle building, protein supplementation, meal replacement",
    westernMechanism: "Complete protein source, amino acids for muscle synthesis",
    tcmPerspective: "Neutral-sweet, tonifies qi and blood, supports spleen, creates dampness if excess",
    commonSideEffects: "GI upset, bloating, dairy sensitivity",
    tcmConsiderations: "Tonifies but can create dampness, use moderately"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Saw Palmetto",
    purpose: "Benign prostatic hyperplasia (BPH), prostate health",
    westernMechanism: "5-alpha-reductase inhibitor, reduces DHT",
    tcmPerspective: "Clears damp-heat from lower jiao, benefits kidney-bladder",
    commonSideEffects: "GI upset, headache, may affect PSA levels",
    tcmConsiderations: "For damp-heat in lower jiao, prostate issues"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Glucosamine/Chondroitin",
    purpose: "Joint health, osteoarthritis",
    westernMechanism: "Cartilage building blocks, anti-inflammatory",
    tcmPerspective: "Tonifies liver-kidney, nourishes sinews and bones",
    commonSideEffects: "GI upset, blood sugar effects possible",
    tcmConsiderations: "Nourishes joints (liver governs sinews, kidney governs bone)"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Coenzyme Q10 (CoQ10)",
    purpose: "Heart health, energy, antioxidant, statin side effects",
    westernMechanism: "Mitochondrial electron transport, antioxidant",
    tcmPerspective: "Tonifies heart qi and kidney essence, supports vitality",
    commonSideEffects: "GI upset, insomnia if taken late",
    tcmConsiderations: "Tonifies qi and essence, good for heart and energy"
  },
  {
    category: "Supplement - Herbal",
    genericName: "Milk Thistle (Silymarin)",
    purpose: "Liver health, liver detoxification support",
    westernMechanism: "Hepatoprotective, antioxidant, supports liver regeneration",
    tcmPerspective: "Cool-bitter, clears liver heat, protects liver, resolves toxins",
    commonSideEffects: "Mild laxative effect, rare allergic reactions",
    tcmConsiderations: "Protects and clears liver, good for liver support during medication use"
  }
];

// Get unique categories for grouping
export const medicationCategories = [...new Set(medicationsSupplementsData.map(item => item.category))];

// Group medications by category
export const medicationsByCategory = medicationsSupplementsData.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item);
  return acc;
}, {} as Record<string, MedicationSupplement[]>);
