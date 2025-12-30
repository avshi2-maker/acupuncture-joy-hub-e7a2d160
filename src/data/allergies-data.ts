// Allergies Reference Data for Patient Intake Form
// Includes Western and TCM perspectives from clinic_allergies_intake_form.csv

export interface Allergen {
  name: string;
  westernView: string;
  tcmPerspective: string;
  symptoms: string;
  severity: string;
}

export interface AllergenCategory {
  category: string;
  allergens: Allergen[];
}

export const allergiesData: AllergenCategory[] = [
  {
    category: 'Food Allergy',
    allergens: [
      { name: 'Peanuts', westernView: 'IgE-mediated, can cause anaphylaxis, common in children', tcmPerspective: 'Warming, tonifies spleen and lung; allergy suggests spleen-lung qi deficiency with wei qi weakness', symptoms: 'Hives, swelling, difficulty breathing, anaphylaxis', severity: 'Potentially life-threatening' },
      { name: 'Tree nuts (almonds, walnuts, cashews)', westernView: 'IgE-mediated, cross-reactivity common, lifelong allergy', tcmPerspective: 'Moistening, tonify kidney and lung; allergy indicates kidney-lung yin deficiency', symptoms: 'Oral swelling, hives, respiratory distress, anaphylaxis', severity: 'Potentially life-threatening' },
      { name: "Cow's milk/dairy", westernView: 'IgE or non-IgE mediated, different from lactose intolerance', tcmPerspective: 'Cooling, creates dampness; allergy reflects spleen qi deficiency unable to transform phlegm-damp', symptoms: 'Hives, digestive upset, eczema, respiratory issues', severity: 'Mild to severe' },
      { name: 'Eggs', westernView: 'Common in children, often outgrown, mainly egg white proteins', tcmPerspective: 'Neutral, nourishes yin and blood; allergy suggests blood deficiency with heat', symptoms: 'Skin rashes, hives, digestive issues, respiratory symptoms', severity: 'Mild to moderate' },
      { name: 'Soy/soybeans', westernView: 'Common in infants, often outgrown, cross-reactivity with legumes', tcmPerspective: 'Cooling, tonifies spleen; allergy indicates spleen qi deficiency with dampness', symptoms: 'Hives, itching, digestive upset, eczema', severity: 'Mild to moderate' },
      { name: 'Wheat/gluten', westernView: 'Different from celiac disease, IgE-mediated wheat allergy', tcmPerspective: 'Cooling, nourishes heart; allergy reflects spleen-dampness with possible heart-heat', symptoms: 'Hives, digestive issues, respiratory problems, anaphylaxis', severity: 'Mild to potentially life-threatening' },
      { name: 'Fish (finned fish)', westernView: 'IgE-mediated, usually lifelong, species-specific or cross-reactive', tcmPerspective: 'Neutral to cool, nourishes yin and blood; allergy indicates blood-heat or dampness', symptoms: 'Hives, swelling, respiratory distress, anaphylaxis', severity: 'Potentially life-threatening' },
      { name: 'Shellfish (shrimp, crab, lobster)', westernView: 'IgE-mediated, common in adults, usually lifelong', tcmPerspective: 'Warming to hot, tonifies kidney yang; allergy suggests damp-heat or kidney imbalance', symptoms: 'Hives, swelling, GI symptoms, anaphylaxis', severity: 'Potentially life-threatening' },
      { name: 'Sesame seeds', westernView: 'Increasingly recognized major allergen, can cause anaphylaxis', tcmPerspective: 'Neutral, moistens intestines, nourishes liver-kidney; allergy indicates yin deficiency heat', symptoms: 'Hives, respiratory issues, anaphylaxis', severity: 'Potentially life-threatening' },
      { name: 'Corn/maize', westernView: 'Less common but increasing, can be in many processed foods', tcmPerspective: 'Neutral, tonifies middle jiao; allergy reflects spleen-stomach qi deficiency', symptoms: 'Digestive upset, hives, eczema', severity: 'Mild to moderate' },
      { name: 'Mustard', westernView: 'Common in Europe, can cause severe reactions', tcmPerspective: 'Warm-hot, disperses cold, moves qi; allergy indicates heat or qi stagnation', symptoms: 'Oral swelling, hives, anaphylaxis', severity: 'Mild to severe' },
      { name: 'Celery', westernView: 'Common in Europe, cross-reactivity with pollen', tcmPerspective: 'Cool, clears heat, calms liver; allergy suggests wind-heat or liver yang rising', symptoms: 'Oral allergy syndrome, swelling, anaphylaxis', severity: 'Mild to severe' },
      { name: 'Strawberries', westernView: 'Histamine-releasing food, can cause pseudo-allergic reactions', tcmPerspective: 'Cool, moistens lung, clears heat; allergy indicates heat in blood or lungs', symptoms: 'Hives, itching, oral swelling', severity: 'Mild' },
      { name: 'Tomatoes', westernView: 'Histamine-rich, cross-reactivity with latex and pollen', tcmPerspective: 'Cool, generates fluids, clears heat; allergy indicates heat or dampness', symptoms: 'Oral itching, hives, digestive upset', severity: 'Mild' },
      { name: 'Chocolate/cocoa', westernView: 'May be other components (milk, nuts), histamine content', tcmPerspective: 'Warm, activates blood, stimulates heart; allergy suggests heart-heat or blood stagnation', symptoms: 'Headaches, hives, digestive issues', severity: 'Mild' },
      { name: 'Kiwi fruit', westernView: 'Cross-reactivity with latex, birch pollen, actinidin enzyme', tcmPerspective: 'Cold, clears heat, generates fluids; allergy indicates spleen yang deficiency or cold', symptoms: 'Oral allergy syndrome, tongue swelling, GI upset', severity: 'Mild to moderate' },
      { name: 'Banana', westernView: 'Latex-fruit syndrome, cross-reactivity common', tcmPerspective: 'Cold, clears heat, moistens intestines; allergy reflects spleen-stomach cold or dampness', symptoms: 'Oral itching, hives, GI symptoms', severity: 'Mild to moderate' },
      { name: 'Avocado', westernView: 'Latex-fruit syndrome, histamine content', tcmPerspective: 'Neutral, nourishes yin, moistens dryness; allergy indicates damp-phlegm or weak spleen', symptoms: 'Oral allergy, GI upset, hives', severity: 'Mild' },
      { name: 'Citrus fruits (oranges, lemons)', westernView: 'Histamine-releasing, oral allergy syndrome common', tcmPerspective: 'Cool to cold, generates fluids; allergy suggests spleen dampness or cold', symptoms: 'Oral irritation, hives, digestive upset', severity: 'Mild' },
      { name: 'Gelatin', westernView: 'In vaccines, marshmallows, gummy candies, pork or beef source', tcmPerspective: 'Tonifies yin and moistens dryness, allergy indicates spleen-damp or heat', symptoms: 'Hives, anaphylaxis (rare)', severity: 'Mild to moderate' },
      { name: 'MSG (monosodium glutamate)', westernView: 'Not true allergy, sensitivity syndrome, controversial', tcmPerspective: 'Artificial flavor enhancer disrupts natural food qi, affects heart and stomach', symptoms: "Headache, flushing, sweating ('Chinese restaurant syndrome')", severity: 'Mild' },
      { name: 'Sulfites (preservatives)', westernView: 'Sensitivity reaction, asthma trigger, in wine and dried fruits', tcmPerspective: 'Chemical creates heat and constraint in lung and spleen', symptoms: 'Asthma exacerbation, hives', severity: 'Mild to moderate' },
      { name: 'Food dyes (tartrazine, carmine)', westernView: 'Pseudo-allergic reactions, asthma and urticaria', tcmPerspective: 'Artificial substances create heat-toxin, disrupt spleen transformation', symptoms: 'Hives, asthma, hyperactivity', severity: 'Mild to moderate' },
    ]
  },
  {
    category: 'Environmental Allergy',
    allergens: [
      { name: 'Grass pollen (Timothy, Bermuda)', westernView: 'Seasonal allergic rhinitis, IgE-mediated, spring/summer', tcmPerspective: 'External wind invasion, wei qi deficiency, lung and spleen weakness', symptoms: 'Sneezing, runny nose, itchy eyes, congestion', severity: 'Mild to moderate' },
      { name: 'Tree pollen (birch, oak, cedar)', westernView: 'Spring allergies, cross-reactivity with foods (oral allergy syndrome)', tcmPerspective: 'Wind-heat pattern, lung and liver involvement, wei qi deficiency', symptoms: 'Rhinitis, conjunctivitis, asthma exacerbation', severity: 'Mild to moderate' },
      { name: 'Ragweed pollen', westernView: 'Fall allergies, major cause of hay fever in North America', tcmPerspective: 'Wind-heat invading lung and spleen, defensive qi weakness', symptoms: 'Sneezing, congestion, itchy throat and eyes', severity: 'Mild to moderate' },
      { name: 'Dust mites', westernView: 'Perennial allergen, major asthma trigger, in bedding and carpets', tcmPerspective: 'Deficiency of lung and kidney, wei qi weakness, phlegm accumulation', symptoms: 'Asthma, rhinitis, eczema, chronic congestion', severity: 'Mild to severe' },
      { name: 'Cat dander', westernView: 'Fel d 1 protein, airborne, can trigger asthma and rhinitis', tcmPerspective: 'External pathogen invasion, lung qi deficiency, wei qi weakness', symptoms: 'Sneezing, congestion, asthma, hives, itchy eyes', severity: 'Mild to severe' },
      { name: 'Dog dander', westernView: 'Can f 1 protein, varies by breed, perennial allergen', tcmPerspective: 'Lung and spleen qi deficiency, weak wei qi, wind invasion', symptoms: 'Rhinitis, asthma, skin reactions', severity: 'Mild to moderate' },
      { name: 'Mold spores (Aspergillus, Alternaria)', westernView: 'Indoor and outdoor allergen, damp environments, year-round', tcmPerspective: 'Dampness pathogen, spleen deficiency unable to transform damp, lung phlegm', symptoms: 'Respiratory issues, asthma, sinus infections', severity: 'Mild to severe' },
      { name: 'Cockroach allergen', westernView: 'Major inner-city asthma trigger, feces and body parts', tcmPerspective: 'Toxic heat and dampness, lung and spleen involvement', symptoms: 'Asthma, rhinitis, skin rashes', severity: 'Moderate to severe' },
      { name: 'Horse dander', westernView: 'Occupational allergen, cross-reactivity with cat allergen', tcmPerspective: 'Wind invasion, wei qi deficiency, lung qi weakness', symptoms: 'Rhinitis, asthma, hives', severity: 'Mild to moderate' },
      { name: 'Rabbit dander', westernView: 'Pet and laboratory allergen, urine proteins significant', tcmPerspective: 'Lung qi deficiency, weak wei qi allowing external invasion', symptoms: 'Respiratory symptoms, conjunctivitis', severity: 'Mild to moderate' },
      { name: 'Feather/down (pillows, comforters)', westernView: 'Protein allergens, often confused with dust mite allergy', tcmPerspective: 'Bird essence, lung qi deficiency, wei qi weakness', symptoms: 'Rhinitis, asthma, nighttime symptoms', severity: 'Mild to moderate' },
      { name: 'Wool', westernView: 'Usually irritant rather than allergy, lanolin component possible', tcmPerspective: 'Warming nature, lanolin creates dampness, irritates sensitive skin', symptoms: 'Skin irritation, itching', severity: 'Mild' },
    ]
  },
  {
    category: 'Insect Allergy',
    allergens: [
      { name: 'Bee venom (honeybee)', westernView: 'IgE-mediated, venom immunotherapy available, can cause anaphylaxis', tcmPerspective: 'Hot toxin invasion, creates wind-heat, affects liver and blood', symptoms: 'Local swelling, systemic hives, anaphylaxis', severity: 'Potentially life-threatening' },
      { name: 'Wasp/yellow jacket venom', westernView: 'Cross-reactivity with other Hymenoptera, anaphylaxis risk', tcmPerspective: 'Fire toxin, aggressive heat, disturbs heart and liver', symptoms: 'Severe local reaction, systemic reactions, anaphylaxis', severity: 'Potentially life-threatening' },
      { name: 'Hornet venom', westernView: 'Similar to wasp venom, severe local reactions common', tcmPerspective: 'Intense heat toxin, wind-heat pattern, blood-level heat', symptoms: 'Pain, swelling, systemic reactions', severity: 'Potentially life-threatening' },
      { name: 'Fire ant venom', westernView: 'Unique venom, pustules characteristic, anaphylaxis possible', tcmPerspective: 'Fire toxin with dampness, creates damp-heat in skin', symptoms: 'Pustules, severe itching, possible anaphylaxis', severity: 'Moderate to severe' },
      { name: 'Mosquito saliva', westernView: 'Usually mild, skeeter syndrome in severe cases', tcmPerspective: 'Wind-heat or wind-damp invasion, blood-level involvement', symptoms: 'Itching, swelling, large welts in sensitive individuals', severity: 'Mild to moderate' },
    ]
  },
  {
    category: 'Medication Allergy',
    allergens: [
      { name: 'Penicillin/Beta-lactam antibiotics', westernView: 'Most common drug allergy, IgE and non-IgE reactions, can cross-react', tcmPerspective: 'Bitter-cold herbs damage spleen yang, create toxic heat reaction', symptoms: 'Rash, hives, anaphylaxis, serum sickness', severity: 'Mild to life-threatening' },
      { name: 'Sulfa drugs (sulfonamides)', westernView: 'Common drug allergy, cross-reactivity concerns, Stevens-Johnson syndrome risk', tcmPerspective: 'Strong bitter-cold property creates heat toxin reaction', symptoms: 'Rash, fever, Stevens-Johnson syndrome', severity: 'Moderate to severe' },
      { name: 'NSAIDs (aspirin, ibuprofen)', westernView: 'Pseudo-allergic reactions common, respiratory reactions, cross-reactivity', tcmPerspective: 'Cold property damages spleen yang, creates blood-level heat', symptoms: 'Asthma exacerbation, hives, angioedema', severity: 'Mild to severe' },
      { name: 'Codeine/opioids', westernView: 'Histamine release, true allergy rare, cross-reactivity variable', tcmPerspective: 'Constrictive property blocks qi flow, creates heat and constraint', symptoms: 'Itching, hives, nausea, respiratory depression', severity: 'Mild to moderate' },
      { name: 'Local anesthetics (lidocaine, novocaine)', westernView: 'True allergy rare, often anxiety or vasovagal response, cross-reactivity', tcmPerspective: 'Blocks qi and blood flow locally, creates stagnation', symptoms: 'Swelling, rash, rarely anaphylaxis', severity: 'Mild to moderate' },
      { name: 'Chemotherapy agents', westernView: 'Hypersensitivity reactions common, can be immediate or delayed', tcmPerspective: 'Toxic heat substances severely damage qi, blood, yin, yang', symptoms: 'Infusion reactions, rash, anaphylaxis', severity: 'Moderate to severe' },
      { name: 'ACE inhibitors', westernView: 'Angioedema risk, cough common, not true allergic reaction', tcmPerspective: 'Descends qi too strongly, affects lung and kidney', symptoms: 'Chronic cough, angioedema', severity: 'Mild to serious' },
      { name: 'Contrast dye (iodinated)', westernView: 'Not true allergy, hyperosmolar reaction, premedication helps', tcmPerspective: 'Extreme cold and toxic nature shocks kidney yang', symptoms: 'Nausea, hives, anaphylactoid reactions', severity: 'Mild to severe' },
      { name: 'Anticonvulsants (phenytoin, carbamazepine)', westernView: 'DRESS syndrome risk, delayed hypersensitivity, genetic factors', tcmPerspective: 'Sedating property damages heart-spleen, creates internal heat', symptoms: 'Rash, fever, organ involvement, DRESS', severity: 'Moderate to severe' },
    ]
  },
  {
    category: 'Contact Allergy',
    allergens: [
      { name: 'Latex (natural rubber)', westernView: 'IgE-mediated, occupational hazard, cross-reactivity with fruits', tcmPerspective: 'External pathogen creating heat and wind in skin, wei qi deficiency', symptoms: 'Hives, itching, anaphylaxis, contact dermatitis', severity: 'Mild to life-threatening' },
      { name: 'Nickel', westernView: 'Most common contact allergen, jewelry, coins, delayed hypersensitivity', tcmPerspective: 'Metal toxin creates damp-heat in skin, affects lung and spleen', symptoms: 'Contact dermatitis, itching, blisters', severity: 'Mild to moderate' },
      { name: 'Poison ivy/oak/sumac (urushiol)', westernView: 'Delayed hypersensitivity, T-cell mediated, can be severe', tcmPerspective: 'Toxic plant creates intense damp-heat and wind in skin', symptoms: 'Severe itching, blisters, rash, swelling', severity: 'Moderate to severe' },
      { name: 'Fragrances/perfumes', westernView: 'Multiple potential allergens, contact dermatitis, respiratory irritation', tcmPerspective: 'Aromatic dispersing nature affects lung and spleen, creates heat', symptoms: 'Skin rash, headaches, respiratory irritation', severity: 'Mild to moderate' },
      { name: 'Preservatives (formaldehyde, parabens)', westernView: 'Contact dermatitis, in cosmetics and household products', tcmPerspective: 'Chemical toxins create heat and dampness in skin', symptoms: 'Eczema, contact dermatitis, itching', severity: 'Mild to moderate' },
      { name: 'Hair dye (PPD - paraphenylenediamine)', westernView: 'Severe contact dermatitis possible, cross-reactivity with textiles', tcmPerspective: 'Chemical toxin creates heat and wind at scalp, liver-blood involvement', symptoms: 'Scalp dermatitis, facial swelling, severe itching', severity: 'Moderate to severe' },
      { name: 'Adhesives (in bandages, medical tape)', westernView: 'Contact dermatitis, rosin and rubber components', tcmPerspective: 'External pathogen blocks skin pores, creates local qi stagnation', symptoms: 'Skin irritation, rash at contact site', severity: 'Mild' },
      { name: 'Sunscreen ingredients (oxybenzone, PABA)', westernView: 'Contact and photoallergic reactions, chemical vs mineral', tcmPerspective: 'Chemical blocks skin qi flow, interacts with sun (yang) creating heat', symptoms: 'Rash, itching, sun sensitivity', severity: 'Mild to moderate' },
      { name: 'Neomycin (topical antibiotic)', westernView: 'Common in over-the-counter ointments, cross-reactivity with other aminoglycosides', tcmPerspective: 'Bitter-cold property creates heat toxin reaction in skin', symptoms: 'Worsening rash, contact dermatitis', severity: 'Mild to moderate' },
    ]
  },
  {
    category: 'TCM Herb Allergy',
    allergens: [
      { name: 'Dang Gui (Angelica sinensis)', westernView: 'Phototoxicity, hormonal effects, bleeding risk', tcmPerspective: 'Over-tonification of blood, excess can cause heat and move blood too strongly', symptoms: 'Skin sensitivity, rash, diarrhea', severity: 'Mild to moderate' },
      { name: 'Huang Qin (Scutellaria baicalensis)', westernView: 'Hepatotoxicity concerns, allergic reactions rare', tcmPerspective: 'Bitter-cold, excessive clearing creates spleen-stomach cold', symptoms: 'Digestive upset, possible liver enzyme elevation', severity: 'Mild to moderate' },
      { name: 'Gan Cao (Glycyrrhiza - licorice)', westernView: 'Hypertension, hypokalemia, pseudo-aldosteronism with excess use', tcmPerspective: 'Over-harmonizing creates dampness, affects kidney function', symptoms: 'Edema, high blood pressure, muscle weakness', severity: 'Moderate' },
      { name: 'Ren Shen (Panax ginseng)', westernView: 'Stimulant effects, interaction with medications, bleeding risk', tcmPerspective: 'Over-tonification creates heat and dryness, not for heat or yin deficiency patterns', symptoms: 'Insomnia, anxiety, headache, high blood pressure', severity: 'Mild to moderate' },
      { name: 'Ma Huang (Ephedra)', westernView: 'Cardiovascular risks, banned in many countries, stimulant', tcmPerspective: 'Strongly disperses and warms, depletes qi and yin, raises yang', symptoms: 'Palpitations, anxiety, high blood pressure, insomnia', severity: 'Moderate to severe' },
      { name: 'Fu Zi (Aconitum - aconite)', westernView: 'Highly toxic if not properly processed, cardiac effects', tcmPerspective: 'Hot toxin if improperly prepared, excessive yang warming', symptoms: 'Numbness, palpitations, arrhythmia, toxicity', severity: 'Severe to life-threatening' },
      { name: 'Chai Hu (Bupleurum)', westernView: 'Generally safe, rare allergic reactions, possible liver effects', tcmPerspective: 'Raises and scatters qi, inappropriate use depletes qi and yin', symptoms: 'Dizziness, headache, digestive upset', severity: 'Mild' },
      { name: 'Da Huang (Rheum - rhubarb)', westernView: 'Laxative effects, oxalate content, kidney concerns with overuse', tcmPerspective: 'Bitter-cold, strongly purging, damages spleen yang with overuse', symptoms: 'Diarrhea, abdominal cramping, electrolyte imbalance', severity: 'Mild to moderate' },
      { name: 'Huang Lian (Coptis)', westernView: 'Berberine content, generally safe, GI upset possible', tcmPerspective: 'Extremely bitter-cold, excessive use damages spleen-stomach yang', symptoms: 'Nausea, diarrhea, cold sensations', severity: 'Mild' },
      { name: 'Wu Tou (Aconitum - wild aconite)', westernView: 'Highly cardiotoxic, neurotoxic, requires expert processing', tcmPerspective: 'Intense fire toxin if unprocessed, disperses wind-damp with extreme caution', symptoms: 'Severe toxicity, cardiac arrhythmia, respiratory failure', severity: 'Life-threatening' },
    ]
  },
  {
    category: 'Occupational Allergy',
    allergens: [
      { name: "Flour/wheat dust (baker's asthma)", westernView: 'Inhalation allergy, occupational asthma, rhinitis', tcmPerspective: 'Dust creates phlegm-dampness in lung, spleen-lung deficiency', symptoms: 'Asthma, rhinitis, occupational respiratory disease', severity: 'Moderate to severe' },
      { name: 'Latex gloves (healthcare workers)', westernView: 'Type I hypersensitivity, protein allergen, occupational hazard', tcmPerspective: 'External pathogen via skin, wei qi deficiency, repeated exposure weakens defense', symptoms: 'Contact dermatitis, respiratory symptoms, anaphylaxis', severity: 'Mild to life-threatening' },
      { name: 'Isocyanates (spray painters)', westernView: 'Occupational asthma, can cause severe sensitization', tcmPerspective: 'Chemical toxin invades lung, damages lung qi and wei qi', symptoms: 'Asthma, rhinitis, skin sensitization', severity: 'Moderate to severe' },
      { name: 'Wood dust (carpenters)', westernView: 'Respiratory sensitization, nasal cancer risk with hardwoods', tcmPerspective: 'Dust-dryness damages lung yin, creates phlegm and heat', symptoms: 'Rhinitis, asthma, sinusitis', severity: 'Mild to moderate' },
      { name: 'Formaldehyde', westernView: 'Respiratory irritant, sensitization, carcinogen classification', tcmPerspective: 'Toxic vapor invades lung, creates heat and dryness', symptoms: 'Respiratory irritation, asthma, contact dermatitis', severity: 'Moderate to severe' },
      { name: 'Chlorine/bleach', westernView: 'Irritant-induced asthma, not true allergy, respiratory damage', tcmPerspective: 'Caustic vapor damages lung qi, creates dryness and heat-toxin', symptoms: 'Respiratory irritation, coughing, asthma', severity: 'Moderate to severe' },
      { name: 'Laboratory animals (mice, rats)', westernView: 'Urine proteins major allergen, occupational asthma common', tcmPerspective: 'Animal essence (jing) creates wind invasion, wei qi deficiency', symptoms: 'Rhinitis, asthma, conjunctivitis', severity: 'Mild to severe' },
    ]
  },
  {
    category: 'Other Allergy',
    allergens: [
      { name: 'Pollen-food syndrome (oral allergy)', westernView: 'Cross-reactivity between pollen and raw fruits/vegetables', tcmPerspective: 'External wind combines with food properties, weak spleen-lung qi', symptoms: 'Oral itching, throat irritation, resolved with cooking', severity: 'Mild' },
      { name: 'Beef', westernView: 'Alpha-gal syndrome from tick bite, delayed reaction', tcmPerspective: 'Warm-sweet nature; allergy indicates spleen-dampness or heat', symptoms: 'Delayed hives, anaphylaxis (3-6 hours post-consumption)', severity: 'Moderate to severe' },
      { name: 'Pork', westernView: 'Cat-pork syndrome, cross-reactivity with cat albumin', tcmPerspective: 'Neutral-sweet; allergy reflects spleen qi deficiency with dampness', symptoms: 'GI upset, hives', severity: 'Mild to moderate' },
      { name: 'Chicken/poultry', westernView: 'Bird-egg syndrome, cross-reactivity with feathers', tcmPerspective: 'Warm nature; allergy indicates heat or spleen-stomach imbalance', symptoms: 'Digestive issues, skin reactions', severity: 'Mild to moderate' },
      { name: 'Lamb/mutton', westernView: 'Less common, possible cross-reactivity with beef', tcmPerspective: 'Very warm nature; allergy suggests heat or yin deficiency', symptoms: 'Hives, digestive upset', severity: 'Mild to moderate' },
      { name: 'Rice', westernView: 'Rare but increasing, can be severe in some populations', tcmPerspective: 'Neutral-sweet, tonifies spleen; allergy indicates severe spleen disruption', symptoms: 'Digestive issues, eczema, anaphylaxis (rare)', severity: 'Mild to moderate' },
      { name: 'Buckwheat', westernView: 'Common in Asia, can cause severe reactions, cross-reactivity', tcmPerspective: 'Cool, descends qi; allergy indicates spleen-stomach cold or damp', symptoms: 'Hives, anaphylaxis, asthma', severity: 'Moderate to severe' },
      { name: 'Garlic', westernView: 'Contact dermatitis and GI reactions, allicin compound', tcmPerspective: 'Hot-pungent; allergy indicates heat or yin deficiency with heat', symptoms: 'Skin burns, GI upset, headache', severity: 'Mild to moderate' },
      { name: 'Ginger', westernView: 'Rare, possible cross-reactivity with turmeric', tcmPerspective: 'Warm-pungent; allergy indicates heat or excess yang', symptoms: 'Rash, GI upset', severity: 'Mild' },
      { name: 'Cinnamon', westernView: 'Contact dermatitis common, oral allergy possible', tcmPerspective: 'Hot-sweet-pungent; allergy indicates yin deficiency with heat', symptoms: 'Oral irritation, contact dermatitis', severity: 'Mild' },
      { name: 'Sunflower seeds', westernView: 'Increasing recognition, cross-reactivity with other seeds', tcmPerspective: 'Neutral; allergy reflects spleen-lung qi deficiency', symptoms: 'Oral allergy, anaphylaxis', severity: 'Mild to severe' },
      { name: 'Peaches', westernView: 'Lipid transfer protein allergy, severe in Mediterranean regions', tcmPerspective: 'Warm-sweet; allergy indicates damp-heat or heat in blood', symptoms: 'Oral allergy, systemic reactions, anaphylaxis', severity: 'Mild to severe' },
      { name: 'Apples', westernView: 'Birch pollen cross-reactivity, cooking destroys allergen', tcmPerspective: 'Cool-sweet; allergy indicates spleen yang deficiency or dampness', symptoms: 'Oral itching and swelling', severity: 'Mild' },
      { name: 'Tattoo ink (various metals and dyes)', westernView: 'Delayed hypersensitivity, granulomas, various pigments', tcmPerspective: 'Foreign substance (toxin) under skin, blood stagnation, damp-heat', symptoms: 'Granulomas, itching, swelling at tattoo site', severity: 'Mild to moderate' },
      { name: 'Propolis (bee glue)', westernView: 'Contact dermatitis, cross-reactivity with balsam of Peru', tcmPerspective: 'Resinous nature, warming, creates heat in sensitive individuals', symptoms: 'Contact dermatitis, oral reactions', severity: 'Mild to moderate' },
      { name: 'Royal jelly', westernView: 'Rare but can cause severe reactions, especially in atopic individuals', tcmPerspective: 'Tonifies essence strongly, excess creates heat or phlegm', symptoms: 'Asthma, anaphylaxis, dermatitis', severity: 'Moderate to severe' },
      { name: 'Lanolin (wool alcohol)', westernView: 'Contact dermatitis, in cosmetics and ointments', tcmPerspective: 'Greasy-dampening nature blocks skin pores, creates local stagnation', symptoms: 'Contact dermatitis, eczema exacerbation', severity: 'Mild' },
    ]
  },
];

// Helper function to get allergen details
export function getAllergenDetails(allergenName: string): Allergen | undefined {
  for (const category of allergiesData) {
    const allergen = category.allergens.find(a => a.name === allergenName);
    if (allergen) return allergen;
  }
  return undefined;
}

// Get severity badge color
export function getSeverityColor(severity: string): string {
  if (severity.toLowerCase().includes('life-threatening')) return 'destructive';
  if (severity.toLowerCase().includes('severe')) return 'destructive';
  if (severity.toLowerCase().includes('moderate')) return 'secondary';
  return 'outline';
}
