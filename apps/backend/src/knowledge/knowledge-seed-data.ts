/**
 * Comprehensive Medical Knowledge Base Seed Data
 *
 * 60+ entries covering lab tests, ECG conditions, imaging findings,
 * Bangladesh-specific conditions, and dietary recommendations.
 */

export interface KnowledgeSeedEntry {
  category: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
}

export const KNOWLEDGE_SEED_ENTRIES: KnowledgeSeedEntry[] = [
  // ── LAB TESTS: Hematology ──

  {
    category: 'lab_test',
    title: 'Complete Blood Count (CBC) — Overview',
    content:
      'CBC measures red blood cells (RBC), white blood cells (WBC), hemoglobin, hematocrit, platelets, and RBC indices (MCV, MCH, MCHC, RDW). In Bangladesh, anemia is extremely common — 40% of women and 25% of children are anemic, mainly from iron deficiency and thalassemia trait. Normal hemoglobin: men 14-18 g/dL, women 12-16 g/dL. Low MCV (<80 fL) with normal iron suggests thalassemia trait (7% carrier rate in Bangladesh).',
    tags: ['cbc', 'blood', 'hemoglobin', 'anemia', 'thalassemia', 'bangladesh'],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'WBC Count and Differential',
    content:
      'Normal WBC: 4,000-11,000/μL. Elevated WBC (leukocytosis): >11,000 suggests infection, inflammation, stress response, or leukemia. Low WBC (leukopenia): <4,000 may indicate viral infection, bone marrow suppression, or autoimmune disease. Differential: Neutrophils 40-70% (bacterial infection if elevated), Lymphocytes 20-40% (viral infection if elevated), Eosinophils 1-4% (allergies/parasites if elevated — very common in Bangladesh due to helminth infections), Monocytes 2-8%, Basophils <1%. Dengue fever (common in Bangladesh monsoon season) typically shows leukopenia with thrombocytopenia.',
    tags: [
      'wbc',
      'leukocytes',
      'neutrophils',
      'lymphocytes',
      'eosinophils',
      'infection',
      'dengue',
    ],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'Platelet Count',
    content:
      'Normal platelets: 150,000-400,000/μL. Low platelets (thrombocytopenia): <150,000. In Bangladesh context, dengue fever is the most common cause of acute thrombocytopenia — platelet monitoring is critical. Platelets <20,000 require platelet transfusion consideration. Other causes: ITP, medication-induced, liver disease (hypersplenism), bone marrow disorders. High platelets (thrombocytosis): >400,000 may be reactive (infection, iron deficiency) or primary (myeloproliferative). Platelet count <100,000 with fever during monsoon season in Bangladesh — consider dengue, check NS1 antigen or IgM.',
    tags: ['platelets', 'thrombocytopenia', 'dengue', 'bleeding', 'bangladesh'],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'Hemoglobin and Anemia Classification',
    content:
      'Anemia classification by hemoglobin: Mild (10-12 g/dL women, 10-14 men), Moderate (7-10 g/dL), Severe (<7 g/dL). By MCV: Microcytic (<80 fL) — iron deficiency, thalassemia, chronic disease; Normocytic (80-100 fL) — chronic disease, acute blood loss, bone marrow failure; Macrocytic (>100 fL) — B12/folate deficiency, liver disease, hypothyroidism, medications. Iron deficiency anemia shows low ferritin (<30 ng/mL), low serum iron, high TIBC, low transferrin saturation (<20%). Thalassemia trait shows low MCV with normal/high ferritin and elevated HbA2 on electrophoresis. In Bangladesh, always consider thalassemia trait before starting iron supplementation — HbE is the most common thalassemia variant in this region.',
    tags: [
      'hemoglobin',
      'anemia',
      'mcv',
      'iron deficiency',
      'thalassemia',
      'ferritin',
      'b12',
    ],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'ESR and CRP — Inflammatory Markers',
    content:
      'ESR (Erythrocyte Sedimentation Rate): Normal <20 mm/hr (men), <30 mm/hr (women). Non-specific marker of inflammation. Very high ESR (>100 mm/hr) suggests: infection, autoimmune disease (SLE, RA), malignancy (multiple myeloma), or TB. CRP (C-Reactive Protein): Normal <5 mg/L. More specific and rapid than ESR. CRP >10 mg/L suggests active infection/inflammation. hs-CRP (high-sensitivity CRP) used for cardiovascular risk: <1 mg/L low risk, 1-3 mg/L moderate risk, >3 mg/L high risk. In Bangladesh, elevated ESR/CRP should prompt consideration of tuberculosis (TB) given high prevalence — 360/100,000 population.',
    tags: [
      'esr',
      'crp',
      'inflammation',
      'infection',
      'tb',
      'autoimmune',
      'cardiovascular',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Liver Function ──

  {
    category: 'lab_test',
    title: 'ALT (SGPT) and AST (SGOT) — Liver Enzymes',
    content:
      'ALT (SGPT): Normal 7-56 U/L. Most specific liver enzyme. AST (SGOT): Normal 10-40 U/L. Found in liver, heart, muscle. ALT > 3x ULN (upper limit of normal) = significant liver injury. ALT > 10x ULN = acute hepatitis (viral, drug-induced, ischemic). AST/ALT ratio >2:1 with elevated GGT suggests alcoholic liver disease. ALT mildly elevated (1-3x ULN): fatty liver (NAFLD/NASH), medications, chronic hepatitis. In Bangladesh, Hepatitis B prevalence is 5.4% and Hepatitis C is 0.2% — always check HBsAg and anti-HCV when liver enzymes are elevated. Elevated ALT in young patients: consider Wilson disease (ceruloplasmin test).',
    tags: [
      'alt',
      'sgpt',
      'ast',
      'sgot',
      'liver',
      'hepatitis',
      'fatty liver',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'Bilirubin — Total and Direct',
    content:
      'Normal total bilirubin: 0.1-1.2 mg/dL. Direct bilirubin: 0-0.3 mg/dL. Elevated total bilirubin with high indirect (unconjugated): hemolysis, Gilbert syndrome (benign, 5-10% population), ineffective erythropoiesis. Elevated direct (conjugated) bilirubin: liver disease, biliary obstruction. Total bilirubin >2-3 mg/dL causes visible jaundice. In neonates: physiologic jaundice common, but high levels need phototherapy. Markedly elevated bilirubin (>20 mg/dL): biliary obstruction (gallstones, tumor), severe hepatitis, or rare metabolic conditions.',
    tags: [
      'bilirubin',
      'jaundice',
      'liver',
      'hemolysis',
      'gilbert',
      'gallstones',
    ],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'Albumin and Total Protein',
    content:
      'Normal albumin: 3.5-5.0 g/dL. Normal total protein: 6.0-8.3 g/dL. Low albumin (<3.5 g/dL): liver disease (reduced synthesis), nephrotic syndrome (protein loss in urine), malnutrition (common in Bangladesh — 31% stunting rate in children), chronic inflammation. Very low albumin (<2.5 g/dL): edema, ascites, poor prognosis marker in hospitalized patients. High globulin gap (total protein - albumin >4 g/dL): consider multiple myeloma, chronic infection, or autoimmune disease. Albumin is a negative acute-phase reactant — drops during inflammation.',
    tags: ['albumin', 'protein', 'liver', 'malnutrition', 'nephrotic', 'edema'],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'ALP and GGT — Cholestatic Markers',
    content:
      'ALP (Alkaline Phosphatase): Normal 44-147 U/L. Elevated in: biliary obstruction, bone disease, pregnancy. GGT: Normal 9-48 U/L. Most sensitive marker for biliary disease and alcohol use. ALP elevated with high GGT → hepatobiliary origin. ALP elevated with normal GGT → bone origin (Paget disease, bone metastases, growing children). Isolated ALP elevation: check GGT to differentiate liver vs bone. ALP >3x ULN: biliary obstruction, infiltrative liver disease, or bone disease.',
    tags: ['alp', 'ggt', 'liver', 'bile', 'bone', 'cholestasis'],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Kidney Function ──

  {
    category: 'lab_test',
    title: 'Creatinine and eGFR — Kidney Function',
    content:
      'Normal creatinine: men 0.7-1.3 mg/dL, women 0.6-1.1 mg/dL. eGFR (estimated Glomerular Filtration Rate): >90 mL/min = normal, 60-89 = mild decrease (CKD stage 2), 30-59 = moderate (CKD stage 3), 15-29 = severe (CKD stage 4), <15 = kidney failure (CKD stage 5). In Bangladesh, CKD prevalence is 17% — largely due to uncontrolled diabetes and hypertension. Acute kidney injury (AKI): creatinine rise >0.3 mg/dL within 48 hours or >1.5x baseline within 7 days. Muscle mass affects creatinine — low in elderly, high in bodybuilders. Cystatin C is a better GFR estimate in these populations.',
    tags: ['creatinine', 'egfr', 'kidney', 'ckd', 'renal', 'bangladesh'],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'BUN (Blood Urea Nitrogen)',
    content:
      'Normal BUN: 7-20 mg/dL. BUN/creatinine ratio helps differentiate causes: >20:1 = pre-renal (dehydration, heart failure, GI bleeding). <10:1 = liver disease, malnutrition. Normal ratio 10-20:1. High BUN with normal creatinine: dehydration, high protein diet, GI bleeding. High BUN with high creatinine: kidney disease. In Bangladesh context, dehydration from diarrheal diseases (cholera, rotavirus) is common and frequently elevates BUN.',
    tags: ['bun', 'urea', 'kidney', 'dehydration', 'renal'],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'Electrolytes — Sodium and Potassium',
    content:
      'Sodium: Normal 136-145 mEq/L. Hyponatremia (<136): most common electrolyte abnormality — SIADH, diuretics, diarrhea, adrenal insufficiency. Severe hyponatremia (<120) can cause seizures. Hypernatremia (>145): dehydration, diabetes insipidus. Potassium: Normal 3.5-5.0 mEq/L. Hypokalemia (<3.5): diarrhea (very common in Bangladesh), diuretics, vomiting. Can cause arrhythmias, muscle weakness. Severe hypokalemia (<2.5) is life-threatening. Hyperkalemia (>5.0): kidney disease, ACE inhibitors, potassium-sparing diuretics. >6.5 is cardiac emergency (peaked T waves on ECG). Always check potassium with kidney function.',
    tags: [
      'sodium',
      'potassium',
      'electrolytes',
      'hyponatremia',
      'hyperkalemia',
      'kidney',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Blood Sugar & Diabetes ──

  {
    category: 'lab_test',
    title: 'Fasting Blood Sugar and Random Blood Sugar',
    content:
      'Fasting Blood Sugar (FBS): Normal <100 mg/dL, Pre-diabetes 100-125 mg/dL, Diabetes ≥126 mg/dL (confirmed on two occasions). Random Blood Sugar (RBS): Diabetes ≥200 mg/dL with symptoms. 2-hour post-prandial (PP): Normal <140 mg/dL, Pre-diabetes 140-199 mg/dL, Diabetes ≥200 mg/dL. Bangladesh has 12.4% diabetes prevalence (13.1 million people), the 8th highest globally. South Asians develop diabetes at lower BMI (>23 vs >25) and younger age. Screening recommended for all Bangladeshis over 30, or earlier with risk factors.',
    tags: [
      'blood sugar',
      'glucose',
      'diabetes',
      'fasting',
      'prediabetes',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'HbA1c — Glycated Hemoglobin',
    content:
      'HbA1c reflects average blood sugar over 2-3 months. Normal: <5.7%. Pre-diabetes: 5.7-6.4%. Diabetes: ≥6.5%. Target for most diabetics: <7.0%. Target for elderly/complications: <8.0%. HbA1c correlation: 6% ≈ 126 mg/dL average, 7% ≈ 154 mg/dL, 8% ≈ 183 mg/dL, 9% ≈ 212 mg/dL, 10% ≈ 240 mg/dL. Falsely low in: hemolytic anemia, thalassemia, bleeding, blood transfusion. Falsely high in: iron deficiency anemia, kidney disease. In Bangladesh where thalassemia trait is common (7% carriers), fructosamine may be more reliable than HbA1c for diabetes monitoring.',
    tags: [
      'hba1c',
      'diabetes',
      'glycated hemoglobin',
      'blood sugar',
      'thalassemia',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Lipid Profile ──

  {
    category: 'lab_test',
    title: 'Lipid Profile — Cholesterol, LDL, HDL, Triglycerides',
    content:
      'Total Cholesterol: Desirable <200 mg/dL, Borderline 200-239, High ≥240. LDL ("bad" cholesterol): Optimal <100, Near-optimal 100-129, Borderline 130-159, High 160-189, Very high ≥190. HDL ("good" cholesterol): Low <40 (men), <50 (women) — cardiovascular risk. High ≥60 — protective. Triglycerides: Normal <150, Borderline 150-199, High 200-499, Very high ≥500 (pancreatitis risk). Non-HDL cholesterol (Total - HDL) is a better predictor than LDL alone. South Asians have atherogenic dyslipidemia pattern: high triglycerides, low HDL, small dense LDL — contributing to 3x higher CAD risk vs Europeans at same age. In Bangladesh, cardiovascular disease is the leading cause of death (27% of all deaths).',
    tags: [
      'cholesterol',
      'ldl',
      'hdl',
      'triglycerides',
      'lipid',
      'cardiovascular',
      'heart',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Thyroid ──

  {
    category: 'lab_test',
    title: 'Thyroid Function Tests — TSH, FT3, FT4',
    content:
      'TSH: Normal 0.4-4.0 mIU/L (some labs use 0.5-5.0). High TSH (>4.0) = hypothyroidism — symptoms: fatigue, weight gain, cold intolerance, constipation. Most common cause: Hashimoto thyroiditis. Low TSH (<0.4) = hyperthyroidism — symptoms: weight loss, palpitations, heat intolerance, tremor. Most common cause: Graves disease. Subclinical hypothyroidism: TSH 4-10 with normal FT4 — treat if TSH >10 or symptomatic. FT4: Normal 0.9-1.7 ng/dL. FT3: Normal 2.0-4.4 pg/mL. In Bangladesh, iodine deficiency was historically common but improved with iodized salt. Thyroid disorders affect 1 in 8 women. Always check thyroid antibodies (anti-TPO) if TSH is abnormal.',
    tags: [
      'tsh',
      'thyroid',
      't3',
      't4',
      'hypothyroid',
      'hyperthyroid',
      'hashimoto',
      'graves',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Iron Studies ──

  {
    category: 'lab_test',
    title: 'Iron Studies — Serum Iron, Ferritin, TIBC, Transferrin Saturation',
    content:
      'Serum Iron: Normal 60-170 μg/dL. Ferritin: Normal men 12-300 ng/mL, women 12-150 ng/mL. TIBC: Normal 250-370 μg/dL. Transferrin Saturation: Normal 20-50%. Iron deficiency anemia pattern: low iron, low ferritin (<30), high TIBC, low transferrin sat (<20%), low MCV. Anemia of chronic disease: low iron, normal/high ferritin (acute phase reactant), low TIBC. Hemochromatosis (iron overload): high iron, high ferritin (>300), high transferrin sat (>45%). Ferritin >1000 ng/mL: liver disease, hemochromatosis, or inflammation. In Bangladesh, iron deficiency affects 50% of pregnant women — iron and folate supplementation is standard prenatal care.',
    tags: [
      'iron',
      'ferritin',
      'tibc',
      'transferrin',
      'anemia',
      'iron deficiency',
      'hemochromatosis',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Vitamins ──

  {
    category: 'lab_test',
    title: 'Vitamin D — 25-Hydroxyvitamin D',
    content:
      'Normal: 30-100 ng/mL. Insufficient: 20-29 ng/mL. Deficient: <20 ng/mL. Severe deficiency: <10 ng/mL. Despite abundant sunlight, vitamin D deficiency is extremely common in Bangladesh (70-80% of urban women) due to: indoor lifestyles, clothing coverage, darker skin pigmentation, and vegetarian diets. Consequences: osteomalacia, osteoporosis, muscle weakness, increased fall risk. Treatment: deficiency (<20) = 50,000 IU weekly for 8 weeks then 2000 IU daily. Insufficiency (20-29) = 2000-4000 IU daily. Local food sources: ilish fish, egg yolks, mushrooms exposed to sunlight. Sun exposure: 15-20 min daily with face and arms exposed.',
    tags: [
      'vitamin d',
      'deficiency',
      'bone',
      'osteoporosis',
      'calcium',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'Vitamin B12 and Folate',
    content:
      'Vitamin B12: Normal 200-900 pg/mL. Deficiency: <200 pg/mL. Borderline: 200-300 pg/mL. Causes: vegetarian/vegan diet (very common in Bangladesh), pernicious anemia, metformin use (28% of diabetics on metformin have B12 deficiency), elderly with poor absorption. Symptoms: fatigue, neuropathy (tingling, numbness), cognitive decline, macrocytic anemia. Folate: Normal >3 ng/mL. Deficiency causes macrocytic anemia, neural tube defects in pregnancy. Always check B12 AND folate together — treating folate deficiency can mask B12 deficiency and worsen neuropathy. In Bangladesh, vegetarians and diabetics on metformin should be screened annually.',
    tags: [
      'vitamin b12',
      'folate',
      'macrocytic',
      'anemia',
      'neuropathy',
      'metformin',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Uric Acid ──

  {
    category: 'lab_test',
    title: 'Uric Acid',
    content:
      'Normal: men 3.4-7.0 mg/dL, women 2.4-6.0 mg/dL. High uric acid (hyperuricemia): >7.0 mg/dL. Causes: high purine diet (red meat, organ meats, shellfish, beer), obesity, kidney disease, diuretics, metabolic syndrome. Gout risk increases significantly when uric acid >9 mg/dL. Gout symptoms: acute joint pain (usually big toe), redness, swelling. Treatment: lifestyle modification first (reduce purine-rich foods, alcohol), then allopurinol if recurrent. In Bangladesh, biryani, kebabs, and organ meats are cultural staples that can elevate uric acid.',
    tags: ['uric acid', 'gout', 'purine', 'joint pain', 'kidney'],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Coagulation ──

  {
    category: 'lab_test',
    title: 'PT/INR and APTT — Coagulation',
    content:
      'PT (Prothrombin Time): Normal 11-13.5 seconds. INR (International Normalized Ratio): Normal 0.8-1.1. Therapeutic range on warfarin: 2.0-3.0 (mechanical valve: 2.5-3.5). INR >4.0 = bleeding risk, >10 = urgent. APTT: Normal 25-35 seconds. Prolonged PT/INR: liver disease, vitamin K deficiency, warfarin therapy, DIC. Prolonged APTT: heparin therapy, hemophilia, von Willebrand disease, lupus anticoagulant. Both prolonged: severe liver disease, DIC. D-dimer: elevated in DVT/PE, DIC, infections, surgery. In dengue (common in Bangladesh), DIC can develop with prolonged PT and low platelets — requires urgent management.',
    tags: [
      'pt',
      'inr',
      'aptt',
      'coagulation',
      'warfarin',
      'bleeding',
      'dic',
      'dengue',
    ],
    source: 'medical-reference',
  },

  // ── LAB TESTS: Urinalysis ──

  {
    category: 'lab_test',
    title: 'Urinalysis — Complete',
    content:
      'pH: Normal 4.5-8.0, usually acidic (5.0-6.5). Specific gravity: 1.005-1.030. Protein: normally absent; >30 mg/dL may indicate kidney disease. Microalbuminuria (30-300 mg/day) = early diabetic nephropathy — screen all diabetics annually. Glucose: normally absent; present in uncontrolled diabetes (renal threshold ~180 mg/dL). WBC/leukocyte esterase: suggests UTI. Nitrite positive: specific for bacterial UTI (gram-negative). RBC/blood: hematuria — investigate with imaging if persistent (stones, infection, malignancy). Casts: RBC casts = glomerulonephritis, WBC casts = pyelonephritis, muddy brown casts = ATN. Urine culture required if UTI suspected. In Bangladesh, UTIs are very common, especially in women — clean catch midstream sample essential for accurate culture.',
    tags: [
      'urinalysis',
      'urine',
      'protein',
      'uti',
      'microalbumin',
      'kidney',
      'diabetes',
    ],
    source: 'medical-reference',
  },

  // ── ECG CONDITIONS ──

  {
    category: 'ecg_condition',
    title: 'Normal Sinus Rhythm',
    content:
      'Normal sinus rhythm characteristics: Rate 60-100 bpm, regular rhythm, P wave before every QRS, PR interval 120-200 ms, QRS duration 60-120 ms, QTc <450 ms (men) or <460 ms (women), normal axis -30 to +90 degrees. Sinus arrhythmia (rate varies with breathing) is normal in young people. All parameters within normal range suggests a healthy electrical conduction system. Even with normal ECG, clinical correlation is essential — some cardiac conditions (intermittent arrhythmias, diastolic dysfunction) may have normal resting ECG.',
    tags: ['normal sinus rhythm', 'ecg', 'heart', 'normal', 'conduction'],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Sinus Bradycardia',
    content:
      'Heart rate <60 bpm with normal P wave morphology and regular rhythm. Common in athletes, during sleep, and with medications (beta-blockers, calcium channel blockers, digoxin). Physiologic bradycardia: usually asymptomatic, no treatment needed. Pathologic bradycardia: symptoms include dizziness, fatigue, syncope, exercise intolerance. Causes: sick sinus syndrome, hypothyroidism, increased vagal tone, inferior MI, medications. Requires treatment if symptomatic: atropine (acute), pacemaker (chronic). In Bangladesh, beta-blocker overuse for hypertension can cause significant bradycardia — always check medication history.',
    tags: [
      'bradycardia',
      'ecg',
      'heart rate',
      'slow',
      'pacemaker',
      'beta blocker',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Sinus Tachycardia',
    content:
      'Heart rate >100 bpm with normal P wave morphology. Usually a physiologic response, not a primary arrhythmia. Causes: fever, pain, anxiety, dehydration, anemia, hyperthyroidism, heart failure, PE, hypovolemia, medications (salbutamol, theophylline, caffeine). Treatment: treat the underlying cause, not the tachycardia itself. Inappropriate sinus tachycardia: heart rate >100 at rest without identifiable cause — rare, diagnosis of exclusion. In Bangladesh context, dehydration from heat/diarrhea and undiagnosed hyperthyroidism are common causes of persistent tachycardia.',
    tags: [
      'tachycardia',
      'ecg',
      'heart rate',
      'fast',
      'fever',
      'dehydration',
      'anemia',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'First Degree AV Block',
    content:
      'PR interval >200 ms with every P wave conducted. Usually benign and often found incidentally. Common in athletes, elderly, and with medications (beta-blockers, calcium channel blockers, digoxin). No treatment required in asymptomatic patients. May progress to higher-degree block if PR >300 ms or in the setting of structural heart disease. Associated conditions: rheumatic heart disease (common in Bangladesh — affects 1.1 per 1000 population), myocarditis, electrolyte abnormalities (hyperkalemia). Reassurance: "This is a very common ECG finding and almost always harmless."',
    tags: [
      'av block',
      'first degree',
      'pr interval',
      'ecg',
      'conduction',
      'benign',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Second Degree AV Block — Mobitz Type I (Wenckebach)',
    content:
      'Progressive PR interval prolongation until a P wave is not conducted (dropped QRS), then cycle repeats. Usually at AV node level, generally benign. Common in trained athletes, during sleep, and with medications. Treatment: usually none if asymptomatic. May need pacemaker if symptomatic (dizziness, syncope). Distinguished from Mobitz Type II by the progressive PR prolongation pattern.',
    tags: [
      'av block',
      'second degree',
      'wenckebach',
      'mobitz',
      'ecg',
      'dropped beat',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Second Degree AV Block — Mobitz Type II',
    content:
      'Fixed PR interval with sudden dropped QRS (non-conducted P wave). Usually at His-Purkinje level — more dangerous than Type I. Higher risk of progression to complete heart block. Causes: anterior MI, fibrosis of conduction system, structural heart disease. Treatment: pacemaker recommended even if currently asymptomatic. This is NEVER considered a normal finding and always requires cardiology evaluation.',
    tags: [
      'av block',
      'second degree',
      'mobitz type ii',
      'ecg',
      'pacemaker',
      'dangerous',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Third Degree (Complete) AV Block',
    content:
      'No relationship between P waves and QRS complexes — complete dissociation of atrial and ventricular conduction. Atrial rate is faster than ventricular rate. Escape rhythm: junctional (40-60 bpm, narrow QRS) or ventricular (20-40 bpm, wide QRS). Medical emergency: risk of syncope, heart failure, sudden cardiac death. Treatment: temporary pacing (transcutaneous or transvenous) followed by permanent pacemaker. Causes: acute MI (especially inferior — may be transient), fibrosis of conduction system, post-cardiac surgery, medications (digoxin toxicity, beta-blockers).',
    tags: [
      'complete heart block',
      'third degree',
      'av block',
      'ecg',
      'pacemaker',
      'emergency',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Atrial Fibrillation (AF)',
    content:
      'Irregularly irregular rhythm with absent P waves, replaced by fibrillatory baseline. Most common sustained arrhythmia worldwide. Classification: paroxysmal (<7 days, self-terminating), persistent (>7 days, needs cardioversion), permanent (accepted by patient and physician). Ventricular rate: typically 100-160 bpm if uncontrolled. Risk: stroke (CHA₂DS₂-VASc score determines anticoagulation need), heart failure, hemodynamic instability. Management: rate control (beta-blockers, CCBs, digoxin), rhythm control (amiodarone, cardioversion, ablation), anticoagulation (warfarin INR 2-3 or DOACs). In Bangladesh, rheumatic valvular AF is still more common than in Western countries — valvular AF always requires warfarin, not DOACs.',
    tags: [
      'atrial fibrillation',
      'af',
      'afib',
      'irregular',
      'ecg',
      'stroke',
      'anticoagulation',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Bundle Branch Blocks — LBBB and RBBB',
    content:
      "LBBB (Left Bundle Branch Block): QRS >120 ms, broad notched R in V5-V6, deep S in V1, absent septal Q waves in V5-V6. ALWAYS considered pathological — associated with ischemic heart disease, hypertension, cardiomyopathy, aortic valve disease. New LBBB with chest pain = STEMI equivalent until proven otherwise (use Sgarbossa criteria). RBBB (Right Bundle Branch Block): QRS >120 ms, rSR' pattern in V1, deep S in V1 lateral leads. Can be normal finding (6% of population), but may indicate: right heart strain, PE, ASD, COPD. New RBBB: consider PE, especially if associated with sinus tachycardia and right axis deviation (S1Q3T3 pattern).",
    tags: [
      'bundle branch block',
      'lbbb',
      'rbbb',
      'ecg',
      'qrs',
      'conduction',
      'stemi',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'ST Segment Changes — Elevation and Depression',
    content:
      'ST Elevation: STEMI (ST-elevation myocardial infarction) — >1 mm in limb leads or >2 mm in chest leads in ≥2 contiguous leads. Distribution indicates territory: V1-V4 = LAD (anterior), II/III/aVF = RCA (inferior), I/aVL/V5-V6 = LCx (lateral). Other causes of ST elevation: pericarditis (diffuse, concave up), early repolarization (young healthy patients, concave up, notched J-point), Brugada syndrome (coved ST in V1-V3), LV aneurysm. ST Depression: ischemia (horizontal/downsloping), digoxin effect (scooped "Salvador Dali moustache"), LVH strain pattern, reciprocal changes. >2 mm ST depression in exercise test = significant ischemia.',
    tags: [
      'st elevation',
      'st depression',
      'stemi',
      'ischemia',
      'ecg',
      'heart attack',
      'pericarditis',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Prolonged QT Interval',
    content:
      'QTc >450 ms (men) or >460 ms (women) using Bazett formula (QTc = QT/√RR). QTc >500 ms: high risk of torsades de pointes (polymorphic VT) and sudden death. Acquired causes (most common): medications (antiarrhythmics, antibiotics — azithromycin/fluoroquinolones, antipsychotics, methadone, ondansetron), hypokalemia, hypomagnesemia, hypocalcemia, hypothyroidism, bradycardia. Congenital long QT syndrome (LQTS): genetic — Romano-Ward (autosomal dominant), Jervell-Lange-Nielsen (autosomal recessive, with deafness). Management: stop offending drugs, correct electrolytes, magnesium IV, temporary pacing if symptomatic. In Bangladesh, widespread azithromycin use may contribute to QT prolongation.',
    tags: [
      'qt prolongation',
      'long qt',
      'qtc',
      'torsades',
      'ecg',
      'arrhythmia',
      'drug induced',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Left Ventricular Hypertrophy (LVH)',
    content:
      'Voltage criteria: Sokolow-Lyon (S in V1 + R in V5 or V6 >35 mm), Cornell (R in aVL + S in V3 >28 mm men, >20 mm women). ECG sensitivity is low (20-50%) — echocardiography is the gold standard. Associated features: ST depression and T-wave inversion in lateral leads (strain pattern), left axis deviation. Causes: hypertension (most common — uncontrolled HTN prevalence 25% in Bangladesh), aortic stenosis, hypertrophic cardiomyopathy, athlete heart. Clinical significance: LVH is an independent risk factor for cardiovascular events, heart failure, and sudden death. Treatment: treat underlying cause (blood pressure control), ACE inhibitors/ARBs can regress LVH.',
    tags: [
      'lvh',
      'hypertrophy',
      'ecg',
      'hypertension',
      'heart',
      'voltage criteria',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Premature Ventricular Complexes (PVCs)',
    content:
      'Wide QRS (>120 ms), bizarre morphology, no preceding P wave, followed by compensatory pause. Very common — found in up to 75% of healthy individuals on Holter monitoring. Usually benign if: <10% of total beats, monomorphic, structurally normal heart. Concerning if: frequent (>10% burden), multifocal/polymorphic, R-on-T phenomenon, associated with structural heart disease. Symptoms: palpitations, skipped beats, chest discomfort. Treatment: reassurance (most cases), beta-blockers if symptomatic, ablation if refractory. PVC-induced cardiomyopathy can occur with burden >15-20% — echocardiography recommended.',
    tags: [
      'pvc',
      'premature ventricular',
      'ectopic',
      'palpitations',
      'ecg',
      'arrhythmia',
    ],
    source: 'ecg-reference',
  },

  // ── IMAGING: CT FINDINGS ──

  {
    category: 'imaging_ct',
    title: 'Pulmonary Nodule — CT Chest',
    content:
      'Pulmonary nodules are round/oval opacities ≤30 mm on CT chest. Prevalence: incidental nodules found in 8-51% of CT scans. Management per Fleischner Society Guidelines 2017: <6 mm in low-risk patient → no follow-up needed. 6-8 mm → CT at 6-12 months, consider 18-24 month follow-up. >8 mm → CT at 3 months, PET-CT, or biopsy. Risk factors for malignancy: size >8 mm, spiculated margins, upper lobe location, history of smoking, age >40. Ground-glass nodules have different follow-up (longer intervals). Solid vs part-solid vs ground-glass characterization is essential. In Bangladesh, TB granuloma is a common benign cause of pulmonary nodules — always consider infectious etiology.',
    tags: [
      'pulmonary nodule',
      'lung',
      'ct',
      'fleischner',
      'cancer',
      'tb',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_ct',
    title: 'Fatty Liver — CT/USG',
    content:
      'Hepatic steatosis (fatty liver) is diagnosed when liver attenuation is lower than spleen on non-contrast CT, or increased echogenicity on ultrasound. USG grading: Grade I (mild) — slightly increased echogenicity, intrahepatic vessels visible; Grade II (moderate) — moderately increased, vessels obscured; Grade III (severe) — markedly increased, diaphragm not visualized. NAFLD (non-alcoholic fatty liver disease) affects 30% of global population. Can progress: NAFLD → NASH (steatohepatitis) → fibrosis → cirrhosis → hepatocellular carcinoma. FibroScan or MR elastography for fibrosis staging. In Bangladesh, NAFLD prevalence is 33% — closely linked to diabetes, obesity, and metabolic syndrome. Management: weight loss 7-10%, exercise, no specific medication approved yet.',
    tags: [
      'fatty liver',
      'nafld',
      'steatosis',
      'liver',
      'ct',
      'ultrasound',
      'imaging',
      'bangladesh',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_ct',
    title: 'Kidney Stones and Hydronephrosis — CT/USG',
    content:
      'Non-contrast CT (NCCT) is the gold standard for kidney stones — 95-98% sensitivity. Stone composition: calcium oxalate (most common, 75%), struvite (infection-related), uric acid (radiolucent on X-ray but visible on CT), cystine (rare). Size determines management: <5 mm = likely to pass spontaneously (90%), 5-10 mm = medical expulsive therapy (tamsulosin), >10 mm or >20 mm = ESWL or ureteroscopy. Hydronephrosis grading: Grade I (mild — renal pelvis dilation only), Grade II (calyceal dilation), Grade III (parenchymal thinning), Grade IV (renal atrophy). In Bangladesh, high prevalence of kidney stones due to hot climate, dehydration, and dietary factors. Prevention: adequate hydration (>2.5L/day), reduce salt, limit animal protein.',
    tags: [
      'kidney stones',
      'nephrolithiasis',
      'hydronephrosis',
      'ct',
      'usg',
      'renal',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_ct',
    title: 'Stroke — CT Head',
    content:
      'Acute ischemic stroke: CT may be normal in first 6-12 hours. Early signs: loss of gray-white matter differentiation, sulcal effacement, hyperdense vessel sign (clot). ASPECTS score (Alberta Stroke Program Early CT Score): 10 = normal, <7 = large territory infarct, poor prognosis. CT angiography (CTA): identifies large vessel occlusion for thrombectomy candidacy. Hemorrhagic stroke: immediately visible as hyperdense (bright) lesion. Intracerebral hemorrhage (ICH): hypertensive (basal ganglia, thalamus, pons, cerebellum), amyloid angiopathy (lobar). Subarachnoid hemorrhage (SAH): blood in cisterns, Fisher grade determines vasospasm risk. In Bangladesh, stroke is a leading cause of disability — hypertension is the #1 risk factor (uncontrolled in 75% of hypertensives).',
    tags: [
      'stroke',
      'ct head',
      'ischemic',
      'hemorrhage',
      'aspects',
      'brain',
      'imaging',
    ],
    source: 'radiopaedia',
  },

  // ── IMAGING: MRI FINDINGS ──

  {
    category: 'imaging_mri',
    title: 'Disc Herniation — MRI Spine',
    content:
      'MRI is the gold standard for disc disease. Disc degeneration grading (Pfirrmann): Grade I (bright white, normal height) to Grade V (collapsed, no signal). Types of disc pathology: bulge (diffuse, symmetric), protrusion (focal, base wider than dome), extrusion (dome wider than base, may migrate), sequestration (free fragment). Clinical significance depends on nerve root compression — correlate with dermatome. Lumbar: L4-L5 and L5-S1 most common. Cervical: C5-C6 and C6-C7 most common. Modic changes: Type I (edema/inflammation — active), Type II (fatty replacement — chronic stable), Type III (sclerosis — end-stage). Cauda equina syndrome (large central disc with bowel/bladder dysfunction) is a surgical emergency. Management: most disc herniations (90%) resolve with conservative treatment (6-12 weeks).',
    tags: [
      'disc herniation',
      'spine',
      'mri',
      'back pain',
      'sciatica',
      'pfirrmann',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_mri',
    title: 'White Matter Hyperintensities — MRI Brain',
    content:
      'White matter hyperintensities (WMH) are bright spots on T2/FLAIR MRI. Fazekas scale: Grade 0 = none, Grade 1 = punctate foci, Grade 2 = early confluence, Grade 3 = large confluent areas. Small vessel disease: most common cause in elderly — associated with hypertension, diabetes, aging. Risk factor for stroke, cognitive decline, dementia. Differential diagnosis: multiple sclerosis (periventricular, Dawson fingers, juxtacortical, posterior fossa — McDonald criteria), migraine (non-specific), vasculitis, ADEM. Age-related: almost universal over age 65, clinical significance depends on burden and distribution. In South Asian populations, premature small vessel disease is common due to high rates of uncontrolled hypertension and diabetes.',
    tags: [
      'white matter',
      'hyperintensities',
      'mri brain',
      'fazekas',
      'small vessel',
      'dementia',
      'ms',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_mri',
    title: 'Meniscal and Ligament Tears — MRI Knee',
    content:
      'Meniscal tears: best seen on proton density/T2-weighted sequences. Grading: Grade 1 (intrasubstance, not reaching articular surface — not a tear), Grade 2 (linear signal to one surface — equivocal), Grade 3 (signal reaching both articular surfaces — definitive tear). Types: horizontal, vertical/longitudinal, bucket-handle (displaced, can cause locking), complex. ACL tear: discontinuity of fibers, increased signal on T2. Secondary signs: bone bruising (lateral femoral condyle + posterior tibial plateau), anterior tibial translation, deep lateral femoral sulcus sign. PCL tear: less common, usually from dashboard injury. Cartilage grading (ICRS): Grade 0-4 (normal to full-thickness defect with subchondral bone exposed).',
    tags: [
      'meniscal tear',
      'acl',
      'knee',
      'mri',
      'ligament',
      'cartilage',
      'orthopedic',
      'imaging',
    ],
    source: 'radiopaedia',
  },

  // ── IMAGING: X-RAY FINDINGS ──

  {
    category: 'imaging_xray',
    title: 'Chest X-ray — Systematic Approach',
    content:
      'ABCDE approach: A = Airway (trachea midline, bronchi), B = Breathing (lung fields, costophrenic angles, pleural space), C = Circulation (heart size, mediastinum, aortic knuckle), D = Disability (bones — ribs, clavicles, spine), E = Everything else (soft tissues, review areas, tubes/lines). Key measurements: Cardiothoracic ratio (CTR) — heart width/thorax width. CTR >0.5 = cardiomegaly. Common findings: consolidation (pneumonia — lobar or bronchopneumonia pattern), pleural effusion (meniscus sign, blunting of costophrenic angle), pneumothorax (absent lung markings, visible visceral pleural line), pulmonary edema (bat-wing perihilar opacities, Kerley B lines, upper lobe diversion). In Bangladesh, TB is a critical differential for any pulmonary opacity — look for upper lobe cavitation, tree-in-bud pattern, hilar lymphadenopathy.',
    tags: [
      'chest xray',
      'cxr',
      'pneumonia',
      'effusion',
      'cardiomegaly',
      'tb',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_xray',
    title: 'Fracture Classification — X-ray',
    content:
      'Fracture description: location (proximal/middle/distal), type (transverse, oblique, spiral, comminuted, segmental), displacement (percentage and direction), angulation (degrees and direction), rotation. Key classifications: Colles fracture (distal radius, dorsal displacement — most common wrist fracture), Salter-Harris (pediatric growth plate — types I-V), Garden (femoral neck — I-IV determines operative vs conservative), Weber (ankle — A/B/C based on fibula level relative to syndesmosis). Red flags: pathologic fracture (through abnormal bone — metastasis, osteoporosis), open fracture (bone penetrating skin), neurovascular compromise, intra-articular extension. Always check joint above and below the fracture. Ottawa rules help determine when X-ray is needed for ankle/knee/foot injuries.',
    tags: [
      'fracture',
      'xray',
      'bone',
      'colles',
      'salter harris',
      'orthopedic',
      'imaging',
    ],
    source: 'radiopaedia',
  },

  // ── IMAGING: USG FINDINGS ──

  {
    category: 'imaging_usg',
    title: 'Gallstones and Cholecystitis — Ultrasound',
    content:
      'Gallstones: echogenic foci with posterior acoustic shadowing in the gallbladder. Present in 10-15% of adults. Most gallstones (80%) are asymptomatic — no treatment needed. Biliary colic: postprandial RUQ pain lasting >30 min. Acute cholecystitis (Tokyo Guidelines): Grade I (mild) — inflammation confined to gallbladder; Grade II (moderate) — local complications (pericholecystic fluid, gallbladder wall >4mm, Murphy sign); Grade III (severe) — organ dysfunction. Sonographic Murphy sign: maximal tenderness when probe pressed over gallbladder. Common bile duct dilation (>6 mm, or >10 mm post-cholecystectomy) suggests choledocholithiasis — needs MRCP or ERCP. In Bangladesh, gallstone disease is very common, especially in women (female:male ratio 3:1) — diet high in carbohydrates and low fiber may contribute.',
    tags: [
      'gallstones',
      'cholecystitis',
      'ultrasound',
      'usg',
      'biliary',
      'gallbladder',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_usg',
    title: 'Thyroid Nodules — Ultrasound TIRADS',
    content:
      'Thyroid nodules found in up to 50% of adults on ultrasound (most incidental). ACR TIRADS scoring: Composition (cystic/mixed/solid), Echogenicity (anechoic to very hypoechoic), Shape (wider-than-tall vs taller-than-wide), Margin (smooth vs irregular/extrathyroidal), Echogenic foci (none/macrocalcifications/peripheral/punctate). Categories: TR1 (benign, 0 points) — simple cyst, no FNA. TR2 (not suspicious, 2 points) — spongiform. TR3 (mildly suspicious, 3 points) — FNA if ≥2.5 cm. TR4 (moderately suspicious, 4-6 points) — FNA if ≥1.5 cm. TR5 (highly suspicious, ≥7 points) — FNA if ≥1.0 cm. Features suggesting malignancy: taller-than-wide, irregular margins, punctate echogenic foci (microcalcifications), very hypoechoic, extrathyroidal extension. In Bangladesh, multinodular goiter is common — most nodules are benign but TIRADS helps identify which need FNA biopsy.',
    tags: [
      'thyroid nodule',
      'tirads',
      'ultrasound',
      'usg',
      'thyroid cancer',
      'fna',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_usg',
    title: 'Renal Cyst — Bosniak Classification',
    content:
      'Simple renal cysts are extremely common (50% of people over 50). Bosniak classification determines management: Category I (simple cyst — thin wall, no septa, no calcification, no enhancement) → benign, no follow-up. Category II (minimally complex — thin septa, fine calcification, <3 cm hyperdense cyst) → benign, no follow-up. Category IIF (follow-up needed — more septa, minimal thickening, thick calcification) → imaging follow-up at 6 and 12 months. Category III (indeterminate — thick/irregular septa, thick/irregular calcification, measurable enhancement) → surgery or active surveillance (malignancy rate ~50%). Category IV (clearly malignant — enhancing soft tissue component) → surgical resection (malignancy rate >90%).',
    tags: [
      'renal cyst',
      'bosniak',
      'kidney',
      'ultrasound',
      'ct',
      'imaging',
      'cancer',
    ],
    source: 'radiopaedia',
  },

  // ── CONDITIONS: Bangladesh-Specific ──

  {
    category: 'condition',
    title: 'Thalassemia in Bangladesh',
    content:
      'Bangladesh has a 7% thalassemia carrier rate — approximately 11 million carriers. HbE/beta-thalassemia is the most common severe form in Southeast Asia, including Bangladesh. Lab findings in thalassemia trait: mild anemia (Hb 10-12 g/dL), low MCV (<80 fL), low MCH (<27 pg), normal/elevated RBC count, normal iron studies, elevated HbA2 (>3.5%) on hemoglobin electrophoresis. CRITICAL: Do NOT give iron supplements for thalassemia trait — will cause iron overload. Only supplement if concurrent iron deficiency is confirmed (low ferritin). Mentzer index (MCV/RBC count): <13 suggests thalassemia, >13 suggests iron deficiency. Pre-marital screening is recommended in Bangladesh to prevent thalassemia major births.',
    tags: [
      'thalassemia',
      'hbe',
      'anemia',
      'mcv',
      'iron',
      'hemoglobin electrophoresis',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'condition',
    title: 'Dengue Fever — Lab Interpretation',
    content:
      'Dengue is endemic in Bangladesh, with major outbreaks during monsoon season (June-October). Lab pattern: initial leukopenia (WBC <4,000), progressive thrombocytopenia (platelets dropping daily), rising hematocrit (hemoconcentration = plasma leakage — warning sign). Diagnosis: NS1 antigen (positive days 1-5), IgM antibody (positive from day 5). Critical phase (days 4-7): watch for warning signs — abdominal pain, persistent vomiting, bleeding, fluid accumulation (pleural effusion, ascites), rapid platelet drop, rising hematocrit. Platelet transfusion: consider if <10,000 or <20,000 with active bleeding. Liver enzymes (AST/ALT): commonly elevated, AST usually > ALT. Avoid aspirin/NSAIDs (bleeding risk). IV fluid resuscitation is the mainstay of severe dengue management.',
    tags: [
      'dengue',
      'fever',
      'thrombocytopenia',
      'platelets',
      'monsoon',
      'bangladesh',
      'ns1',
    ],
    source: 'medical-reference',
  },
  {
    category: 'condition',
    title: 'Hepatitis B in Bangladesh',
    content:
      'Bangladesh has intermediate HBV endemicity — 5.4% carrier rate (HBsAg positive). Screening: HBsAg (current infection), anti-HBs (immunity — >10 mIU/mL), anti-HBc (past exposure). Chronic hepatitis B monitoring: HBV DNA viral load, HBeAg status (e-antigen positive = high replication), ALT levels, liver ultrasound every 6 months for HCC screening, FibroScan for fibrosis assessment. Treatment criteria: HBV DNA >20,000 IU/mL (HBeAg+) or >2,000 IU/mL (HBeAg-) with elevated ALT or significant fibrosis. Medications: tenofovir (preferred in Bangladesh — available and affordable), entecavir. Vertical transmission prevention: all pregnant women should be screened; neonatal HBV vaccination within 24 hours of birth. HCC surveillance: ultrasound + AFP every 6 months for cirrhotic patients.',
    tags: [
      'hepatitis b',
      'hbv',
      'liver',
      'hbsag',
      'cirrhosis',
      'hcc',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'condition',
    title: 'Tuberculosis (TB) — Lab and Imaging',
    content:
      'Bangladesh ranks 8th globally for TB burden — incidence 360/100,000. Lab: sputum AFB smear (low sensitivity ~50-60%), GeneXpert/MTB-RIF (>95% sensitivity + rifampicin resistance in 2 hours — recommended first-line test), Mantoux/TST (positive if ≥10 mm in Bangladesh context), IGRA (QuantiFERON-Gold — more specific). Imaging: chest X-ray shows upper lobe infiltrates, cavitation, tree-in-bud nodularity, pleural effusion, miliary pattern (diffuse tiny nodules). CT chest: more sensitive for subtle findings, lymph node necrosis, bronchial disease. Extra-pulmonary TB (30% of cases): lymph node TB (cervical most common), TB meningitis, spinal TB (Pott disease), abdominal TB. All patients with unexplained chronic cough >2 weeks, fever, night sweats, or weight loss in Bangladesh should be evaluated for TB.',
    tags: [
      'tb',
      'tuberculosis',
      'afb',
      'genexpert',
      'chest xray',
      'cavitation',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'condition',
    title: 'Chronic Kidney Disease (CKD) in Bangladesh',
    content:
      'CKD prevalence in Bangladesh is 17% — one of the highest globally. Main causes: diabetes (40%), hypertension (30%), glomerulonephritis (15%), unknown/genetic (15%). Staging by eGFR: Stage 1 (≥90 with proteinuria), Stage 2 (60-89), Stage 3a (45-59), Stage 3b (30-44), Stage 4 (15-29), Stage 5 (<15 or dialysis). Key labs: creatinine, eGFR, urine albumin-creatinine ratio (ACR), electrolytes (K+, Ca, phosphate), hemoglobin, PTH, vitamin D. ACR >30 mg/g = albuminuria (early kidney damage). CKD progression prevention: ACE inhibitor or ARB (reduce proteinuria), BP target <130/80, HbA1c <7% for diabetics, avoid NSAIDs and nephrotoxic drugs, adequate hydration. Dialysis access is limited in Bangladesh — prevention and early detection are critical.',
    tags: [
      'ckd',
      'kidney',
      'creatinine',
      'egfr',
      'proteinuria',
      'dialysis',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'condition',
    title: 'Arsenic Exposure in Bangladesh',
    content:
      'Bangladesh faces the largest mass poisoning in history — 30-40 million people exposed to arsenic-contaminated groundwater (>10 μg/L, WHO limit). Lab markers: urine arsenic (>50 μg/L = significant exposure), blood arsenic, hair/nail arsenic levels. Health effects: keratosis (palmar/plantar), melanosis (skin pigmentation), peripheral neuropathy, increased risk of bladder/lung/skin cancer, cardiovascular disease, diabetes. On lab reports, chronic arsenic exposure can cause: anemia, leukopenia, liver enzyme elevation, and peripheral neuropathy-related findings. In interpreting lab values from rural Bangladeshi patients, arsenic exposure should be considered as a contributing factor for unexplained multi-system findings.',
    tags: [
      'arsenic',
      'groundwater',
      'skin',
      'cancer',
      'poisoning',
      'bangladesh',
      'environmental',
    ],
    source: 'medical-reference',
  },

  // ── DIET: Bangladesh Context ──

  {
    category: 'diet',
    title: 'Iron-Rich Bangladeshi Foods',
    content:
      'Best iron-rich foods available in Bangladesh: HEME iron (best absorbed): beef liver (kaleji), chicken liver, dark chicken meat (raan), small fish (mola, dhela, chela — eaten with bones), dried fish (shutki). NON-HEME iron: kolmi shaak (water spinach), pui shaak, lal shaak (red amaranth), kanchakola (raw banana), masur dal (red lentil), black sesame (til), jaggery (gur), pumpkin seeds. Iron absorption enhancers: vitamin C (lemon juice on food, amla/Indian gooseberry, guava, raw tomato). Iron absorption inhibitors: tea/coffee with meals (tannins — wait 1 hour after meals), excess calcium, phytates (reduce by soaking dals). Cooking tip: use iron kadai/cast iron pan for cooking — increases food iron content by 10-20%.',
    tags: [
      'iron',
      'anemia',
      'diet',
      'bangladeshi food',
      'vegetables',
      'fish',
      'cooking',
    ],
    source: 'nutrition-reference',
  },
  {
    category: 'diet',
    title: 'Diabetic Diet — Bangladesh',
    content:
      'Carbohydrate management for Bangladeshi diabetics: Replace white rice with brown/red rice (lal chal), parboiled rice (siddho chal has lower GI), or reduce portion size (1 cup cooked rice per meal). Increase fiber: whole grain roti (atta), oats, barley, mixed grain. Blood sugar-friendly foods: bitter gourd (korola), fenugreek seeds (methi — soak overnight, eat morning), cinnamon (daruchini), turmeric (holud). Protein: fish (preferably), chicken, egg, dal. Healthy fats: mustard oil (sarisher tel), olive oil, nuts (badam, kaju). AVOID: excessive white rice, polished rice, maida (refined flour), sweetened yogurt (mishti doi), gulab jamun, rasgolla, excessive mango/jackfruit, sugary drinks, fruit juices. Meal timing: eat every 3-4 hours, no skipping meals, no late-night eating. Walking: 30 minutes brisk walking after dinner reduces post-prandial blood sugar by 30-50%.',
    tags: [
      'diabetes',
      'diet',
      'blood sugar',
      'rice',
      'bangladeshi food',
      'glycemic index',
    ],
    source: 'nutrition-reference',
  },
  {
    category: 'diet',
    title: 'Heart-Healthy Diet — Bangladesh',
    content:
      'Cardiovascular disease is the leading cause of death in Bangladesh (27% of deaths). Heart-healthy local diet: Increase omega-3: ilish fish, sardines, salmon (when available), walnuts, flaxseeds (tishi). Reduce saturated fat: avoid ghee (clarified butter), dalda (vanaspati), excessive red meat, biryani with excess oil, deep-fried items (puri, samosa, singara). Reduce sodium: limit salt to <5g/day (1 teaspoon), reduce processed foods, pickles (achar), soy sauce. Use more potassium-rich foods: banana (kola), coconut water (daber pani), spinach (palak), sweet potato (mishti alu), dal. DASH diet elements adapted for Bangladesh: high vegetables (5+ servings/day), moderate fruits (2-3 servings), whole grains, lean protein, low-fat dairy. Cooking methods: steaming, boiling, grilling instead of deep-frying.',
    tags: [
      'heart',
      'cardiovascular',
      'diet',
      'salt',
      'omega-3',
      'cholesterol',
      'bangladeshi food',
    ],
    source: 'nutrition-reference',
  },
  {
    category: 'diet',
    title: 'Kidney-Friendly Diet — Bangladesh',
    content:
      'For CKD patients (very common in Bangladesh — 17% prevalence): Protein restriction: 0.6-0.8 g/kg/day for CKD stages 3-4 (reduce dal portion, limit meat to palm-sized serving). Potassium restriction (if hyperkalemia): avoid coconut water, banana, oranges, potato, tomato — leach potatoes by soaking in water for 2 hours before cooking. Phosphorus restriction: avoid processed foods, cola drinks, cheese, organ meats — phosphorus binders if needed. Sodium restriction: <2g/day — avoid extra salt (noon), pickles, processed snacks, dried fish (shutki). Fluid restriction: as advised by nephrologist for advanced CKD/dialysis. Safe foods: rice, bread, cabbage, capsicum, apple, guava, white egg. Avoid: star fruit (neurotoxic in CKD), excessive jaggery (gur — high potassium).',
    tags: [
      'kidney',
      'ckd',
      'diet',
      'potassium',
      'phosphorus',
      'protein',
      'bangladeshi food',
    ],
    source: 'nutrition-reference',
  },
  {
    category: 'diet',
    title: 'Anti-inflammatory Foods — Bangladesh',
    content:
      'For elevated ESR/CRP, autoimmune conditions, chronic inflammation: Anti-inflammatory foods available in Bangladesh: turmeric (holud — curcumin is a potent anti-inflammatory), ginger (ada), garlic (roshun), green tea, omega-3 rich fish (ilish, sardine), dark leafy greens (palak, pui shaak), berries (strawberry — increasingly available), nuts (badam, akhrot). Pro-inflammatory foods to REDUCE: refined carbohydrates (maida, white bread), deep-fried foods (singara, puri), processed meats, excess sugar, trans fats (dalda/vanaspati), excessive red meat. Supplements to consider: fish oil (omega-3), turmeric/curcumin capsules, vitamin D (commonly deficient). Lifestyle: regular moderate exercise reduces CRP by 20-30%.',
    tags: [
      'anti-inflammatory',
      'crp',
      'esr',
      'autoimmune',
      'turmeric',
      'diet',
      'bangladeshi food',
    ],
    source: 'nutrition-reference',
  },
  {
    category: 'diet',
    title: 'Calcium and Vitamin D Rich Foods — Bangladesh',
    content:
      'For osteoporosis prevention and vitamin D deficiency (affects 70-80% of urban Bangladeshi women): Calcium-rich foods: small fish with bones (mola fish, chingri/shrimp — excellent calcium source), milk (250ml = 300mg calcium), yogurt (doi), cheese (paneer), sesame seeds (til — 1 tbsp = 88mg calcium), lal shaak (red amaranth), broccoli, tofu. Daily calcium requirement: 1000mg (adults), 1200mg (>50 years, postmenopausal women). Vitamin D: sun exposure (15-20 min daily, face and arms), egg yolks, fatty fish (ilish), fortified milk. Vitamin D supplementation: 2000 IU daily for insufficiency, 50,000 IU weekly for 8 weeks if deficient (<20 ng/mL). Calcium absorption enhancers: vitamin D, stomach acid (avoid antacids with calcium-rich meals). Calcium absorption inhibitors: excessive fiber, phytates, oxalates (spinach), caffeine.',
    tags: [
      'calcium',
      'vitamin d',
      'osteoporosis',
      'bone',
      'diet',
      'fish',
      'bangladeshi food',
    ],
    source: 'nutrition-reference',
  },

  // ── LAB TESTS: Additional ──

  {
    category: 'lab_test',
    title: 'Calcium and Phosphate',
    content:
      'Calcium: Normal 8.5-10.5 mg/dL (correct for albumin: add 0.8 mg/dL for every 1 g/dL albumin below 4.0). Hypercalcemia (>10.5): primary hyperparathyroidism (most common outpatient), malignancy (most common inpatient — lung, breast, myeloma). Symptoms: "stones, bones, groans, moans" (kidney stones, bone pain, abdominal pain, confusion). Hypocalcemia (<8.5): vitamin D deficiency (very common in Bangladesh), CKD (high phosphate, low vitamin D), hypoparathyroidism (post-thyroidectomy). Symptoms: tetany, Chvostek sign, Trousseau sign, prolonged QTc. Phosphate: Normal 2.5-4.5 mg/dL. High phosphate with low calcium → CKD. Low phosphate → vitamin D deficiency, refeeding syndrome.',
    tags: [
      'calcium',
      'phosphate',
      'parathyroid',
      'vitamin d',
      'hypercalcemia',
      'ckd',
    ],
    source: 'medical-reference',
  },
  {
    category: 'lab_test',
    title: 'Liver Function Tests — Pattern Recognition',
    content:
      'Hepatocellular pattern: ALT/AST markedly elevated (>10x ULN), ALP normal or mildly elevated. Causes: viral hepatitis, drug-induced, ischemic hepatitis, autoimmune hepatitis. Cholestatic pattern: ALP markedly elevated (>3x ULN), ALT/AST mildly elevated. Causes: biliary obstruction (stone, tumor), primary biliary cholangitis (PBC), drug-induced (augmentin, OCPs). Mixed pattern: both ALT and ALP elevated. Key ratios: AST/ALT ratio >2:1 with GGT elevated → alcoholic liver disease. AST/ALT ratio <1 in chronic hepatitis. De Ritis ratio (AST/ALT) >1 in cirrhosis. Drug-induced liver injury (DILI): common culprits in Bangladesh — paracetamol overdose (most common), anti-TB drugs (INH, rifampicin, pyrazinamide — check before starting ATT), traditional herbal medicines (kabiraji), ayurvedic supplements.',
    tags: [
      'liver function',
      'hepatocellular',
      'cholestatic',
      'drug induced',
      'alt',
      'ast',
      'alp',
    ],
    source: 'medical-reference',
  },

  // ── IMAGING: Additional ──

  {
    category: 'imaging_ct',
    title: 'Aortic Aneurysm and Dissection — CT',
    content:
      'Abdominal aortic aneurysm (AAA): diameter >3 cm. Normal aorta is ~2 cm. Risk of rupture increases with size: <4 cm = 0% annual risk, 4-5 cm = 0.5-5%, 5-6 cm = 3-15%, 6-7 cm = 10-20%, >7 cm = 20-40%. Surgical threshold: ≥5.5 cm (men), ≥5.0 cm (women), or >1 cm growth per year. CT angiography is the gold standard for diagnosis and planning. Aortic dissection: Stanford Type A (ascending aorta — surgical emergency) vs Type B (descending — medical management, surgical if complicated). CT shows: intimal flap, true and false lumen, branch vessel involvement. Classic presentation: tearing chest/back pain. In Bangladesh, uncontrolled hypertension is the primary risk factor.',
    tags: [
      'aortic aneurysm',
      'aaa',
      'dissection',
      'ct',
      'vascular',
      'emergency',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_mri',
    title: 'Brain Tumor Classification — MRI',
    content:
      'MRI is the primary modality for brain tumor evaluation. Key features: Location (intra-axial vs extra-axial), enhancement pattern (ring-enhancing, solid, heterogeneous), edema (vasogenic = finger-like, cytotoxic = involves gray matter), mass effect (midline shift, herniation), MRI spectroscopy (elevated choline = cell membrane turnover, reduced NAA = neuronal damage). Common tumors: Glioblastoma (GBM — most common malignant, ring-enhancing, necrotic center, butterfly pattern), Meningioma (extra-axial, dural tail, homogeneous enhancement), Metastasis (multiple, at gray-white junction, ring-enhancing — common primaries: lung, breast, melanoma, renal, colon), Schwannoma (cerebellopontine angle, ice-cream on cone appearance). Diffusion restriction (bright DWI, dark ADC) helps distinguish abscess (restricted) from tumor (usually not restricted).',
    tags: [
      'brain tumor',
      'glioblastoma',
      'meningioma',
      'metastasis',
      'mri brain',
      'imaging',
    ],
    source: 'radiopaedia',
  },
  {
    category: 'imaging_xray',
    title: 'Pneumonia Patterns — Chest X-ray',
    content:
      'Lobar pneumonia: homogeneous consolidation limited to a lobe with air bronchograms. Most common cause: Streptococcus pneumoniae. Bronchopneumonia: patchy, bilateral, lower lobe predominant opacities. Common causes: Staphylococcus, Klebsiella, polymicrobial. Interstitial pneumonia: reticular or reticulonodular pattern, bilateral, diffuse. Causes: viral (COVID-19, influenza), Mycoplasma, Pneumocystis (HIV). Aspiration pneumonia: right lower lobe or posterior segments (supine patients). TB: upper lobe infiltrates, cavitation, tree-in-bud nodularity — very important differential in Bangladesh. Complications to look for: parapneumonic effusion, empyema, lung abscess, ARDS. In Bangladesh, pneumonia is the leading cause of under-5 mortality (15% of child deaths), and TB must always be considered in adult pneumonia that does not respond to standard antibiotics.',
    tags: [
      'pneumonia',
      'chest xray',
      'consolidation',
      'tb',
      'infection',
      'lung',
      'imaging',
    ],
    source: 'radiopaedia',
  },

  // ── ADDITIONAL ECG CONDITIONS ──

  {
    category: 'ecg_condition',
    title: 'Wolff-Parkinson-White (WPW) Syndrome',
    content:
      'WPW pattern: short PR interval (<120 ms), delta wave (slurred upstroke of QRS), wide QRS (>120 ms). Caused by accessory pathway (Bundle of Kent) allowing pre-excitation. WPW pattern: ECG findings without symptoms. WPW syndrome: ECG findings WITH tachyarrhythmias (AVRT). Risk: atrial fibrillation with rapid conduction via accessory pathway can degenerate into ventricular fibrillation — potentially fatal. Treatment: avoid AV nodal blocking drugs (adenosine, verapamil, digoxin) in WPW with AF — can accelerate accessory pathway conduction. Catheter ablation is definitive treatment. Screening: recommended for athletes, pilots, and high-risk occupations. Incidence: 1-3 per 1000 population.',
    tags: [
      'wpw',
      'wolff parkinson white',
      'pre-excitation',
      'delta wave',
      'ecg',
      'accessory pathway',
    ],
    source: 'ecg-reference',
  },
  {
    category: 'ecg_condition',
    title: 'Axis Deviation — Left and Right',
    content:
      'Normal axis: -30 to +90 degrees. Determined by leads I and aVF: both positive = normal. Left Axis Deviation (LAD): -30 to -90 degrees (positive lead I, negative aVF). Causes: left anterior fascicular block (LAFB — most common), LVH, inferior MI, LBBB, WPW. Right Axis Deviation (RAD): +90 to +180 degrees (negative lead I, positive aVF). Causes: right ventricular hypertrophy, PE, lateral MI, RBBB, COPD, normal in children/tall thin adults. Extreme axis ("northwest axis" or "no man\'s land"): -90 to -180 degrees — ventricular rhythm, severe conduction disease. Isolated LAFB is common and usually benign. Bifascicular block (RBBB + LAFB) increases risk of progression to complete heart block.',
    tags: [
      'axis deviation',
      'lad',
      'rad',
      'lafb',
      'ecg',
      'lvh',
      'pe',
      'fascicular block',
    ],
    source: 'ecg-reference',
  },

  // ── IMAGING: Mammography ──

  {
    category: 'imaging_mammo',
    title: 'Breast Imaging — BI-RADS Classification',
    content:
      'BI-RADS (Breast Imaging Reporting and Data System) standardizes mammography reporting. Category 0: Incomplete — needs additional imaging (spot compression, ultrasound, MRI). Category 1: Negative — routine screening. Category 2: Benign — simple cysts, calcified fibroadenomas, fat necrosis, lymph nodes — routine screening. Category 3: Probably benign (<2% malignancy risk) — 6-month follow-up mammogram. Category 4A: Low suspicion (2-10%) — biopsy should be considered. Category 4B: Moderate suspicion (10-50%) — biopsy recommended. Category 4C: High suspicion (50-95%) — biopsy strongly recommended. Category 5: Highly suggestive of malignancy (>95%) — tissue diagnosis required. Category 6: Known malignancy — awaiting treatment. Dense breast tissue (ACR C/D) reduces mammography sensitivity — supplemental screening with ultrasound or MRI may be recommended. Breast cancer awareness is growing in Bangladesh but late-stage presentation is still common — screening mammography from age 40 is recommended.',
    tags: [
      'mammography',
      'birads',
      'breast',
      'cancer',
      'screening',
      'biopsy',
      'imaging',
    ],
    source: 'radiopaedia',
  },

  // ── LAB TESTS: Tumor Markers ──

  {
    category: 'lab_test',
    title: 'Tumor Markers — AFP, CEA, CA-125, CA 19-9, PSA',
    content:
      'AFP (Alpha-fetoprotein): Normal <10 ng/mL. Elevated in: hepatocellular carcinoma (>400 ng/mL highly suggestive), germ cell tumors, pregnancy. Monitor every 6 months in chronic hepatitis B/C and cirrhosis patients. CEA (Carcinoembryonic Antigen): Normal <5 ng/mL. Elevated in: colorectal cancer (monitoring post-treatment), lung/breast/pancreatic cancer, smoking, liver disease. CA-125: Normal <35 U/mL. Elevated in: ovarian cancer (monitoring), endometriosis, PID, pregnancy, peritonitis. Not specific — elevated in many benign conditions. CA 19-9: Normal <37 U/mL. Elevated in: pancreatic cancer (best tumor marker for pancreas), cholangiocarcinoma, bile duct obstruction. PSA (Prostate-Specific Antigen): Normal <4 ng/mL. Elevated in: prostate cancer, BPH, prostatitis, recent ejaculation. PSA density and free/total PSA ratio improve specificity. Tumor markers should NEVER be used alone for diagnosis — always correlate with imaging and clinical context.',
    tags: [
      'tumor markers',
      'afp',
      'cea',
      'ca125',
      'ca199',
      'psa',
      'cancer',
      'screening',
    ],
    source: 'medical-reference',
  },

  // ── ADDITIONAL CONDITIONS ──

  {
    category: 'condition',
    title: 'Metabolic Syndrome — South Asian Criteria',
    content:
      'Metabolic syndrome is a cluster of risk factors for cardiovascular disease and diabetes. For South Asians, modified criteria apply (lower waist circumference thresholds): Waist circumference ≥90 cm (men), ≥80 cm (women) — vs 102/88 for Western populations. Plus any 2 of: Triglycerides ≥150 mg/dL, HDL <40 mg/dL (men) or <50 mg/dL (women), BP ≥130/85 mmHg, Fasting glucose ≥100 mg/dL. Prevalence in Bangladesh: 30-35% (urban), 20% (rural). South Asians develop metabolic syndrome at lower BMI — "metabolically obese, normal weight" phenotype. Central/visceral adiposity is more important than total body fat. Management: lifestyle modification first (diet, exercise, weight loss 5-7%), then medications for individual components.',
    tags: [
      'metabolic syndrome',
      'south asian',
      'waist circumference',
      'triglycerides',
      'diabetes',
      'cardiovascular',
    ],
    source: 'medical-reference',
  },
  {
    category: 'condition',
    title: 'Rheumatic Heart Disease in Bangladesh',
    content:
      'Rheumatic heart disease (RHD) remains a significant problem in Bangladesh — prevalence 1.1/1000 population (much higher than Western countries). Caused by untreated Group A Streptococcal pharyngitis → acute rheumatic fever → chronic valvular damage. Most commonly affects mitral valve (mitral stenosis, mitral regurgitation). Lab findings: elevated ASO titer (>200 IU/mL), elevated ESR/CRP during acute episode. Echocardiography findings: thickened, calcified valve leaflets, restricted motion. ECG findings: mitral stenosis can cause left atrial enlargement (P-mitrale — bifid P wave in lead II), atrial fibrillation. Jones criteria for acute rheumatic fever: major (carditis, polyarthritis, chorea, erythema marginatum, subcutaneous nodules) + minor (fever, arthralgia, elevated ESR/CRP, prolonged PR interval). Prevention: penicillin prophylaxis for documented rheumatic fever.',
    tags: [
      'rheumatic heart',
      'rhd',
      'mitral valve',
      'streptococcal',
      'aso',
      'ecg',
      'bangladesh',
    ],
    source: 'medical-reference',
  },
  {
    category: 'condition',
    title: 'Hypothyroidism — Lab Patterns and Bangladesh Context',
    content:
      'Hypothyroidism pattern: High TSH with low FT4. Subclinical hypothyroidism: High TSH (4-10) with normal FT4. Most common cause: Hashimoto thyroiditis (anti-TPO antibodies positive in 90%). Symptoms: fatigue, weight gain, cold intolerance, constipation, dry skin, hair loss, menstrual irregularities, depression. Lab effects of hypothyroidism: elevated cholesterol/LDL, elevated CPK, hyponatremia, macrocytic anemia, elevated prolactin. Treatment: levothyroxine (start 1.6 μg/kg/day, lower in elderly/cardiac patients — start 25-50 μg). Monitor: TSH every 6-8 weeks until stable, then annually. In Bangladesh, iodine deficiency was historically common in northern regions (Rangpur, Mymensingh) — improved with universal salt iodization but goiter still seen. Thyroid disease affects 1 in 8 Bangladeshi women.',
    tags: [
      'hypothyroidism',
      'tsh',
      'hashimoto',
      'thyroid',
      'levothyroxine',
      'anti-tpo',
      'bangladesh',
    ],
    source: 'medical-reference',
  },

  // ── IMAGING: PET-CT ──

  {
    category: 'imaging_pet',
    title: 'PET-CT — FDG Uptake Interpretation',
    content:
      'PET-CT uses FDG (fluorodeoxyglucose) to detect metabolically active tissues. SUVmax (Standardized Uptake Value) is the key metric. Normal physiologic uptake: brain (highest), heart (variable), kidneys/bladder (excretion), liver (moderate, uniform), tonsils/adenoids, muscle (if tense). Pathologic uptake: Lung nodule SUVmax >2.5 → suspicious for malignancy (60-80% PPV). Lymph nodes SUVmax > mediastinal blood pool → suspicious. Deauville criteria for lymphoma (5-point scale): 1 = no uptake, 2 = ≤ mediastinum, 3 = > mediastinum but ≤ liver, 4 = > liver, 5 = markedly > liver or new lesions. Score 1-3 = complete metabolic response (good). False positives: infection, inflammation, granulomatous disease (sarcoidosis, TB — important in Bangladesh), post-radiation changes. False negatives: low-grade tumors (some lymphomas), mucinous adenocarcinoma, small lesions (<1 cm).',
    tags: [
      'pet ct',
      'fdg',
      'suv',
      'deauville',
      'lymphoma',
      'cancer',
      'staging',
      'imaging',
    ],
    source: 'radiopaedia',
  },

  // ── PREGNANCY-RELATED ──

  {
    category: 'lab_test',
    title: 'Pregnancy Lab Tests — Normal Ranges',
    content:
      'Pregnancy causes physiologic changes in lab values: Hemoglobin: normal lower limit 11 g/dL (1st/3rd trimester), 10.5 g/dL (2nd trimester) — hemodilution. WBC: normally elevated in pregnancy (up to 15,000, up to 25,000 in labor). Platelets: mild decrease common (gestational thrombocytopenia — platelets 100-150K is usually benign). TSH: lower in 1st trimester (0.1-2.5 mIU/L) due to hCG cross-reactivity. Blood sugar: GDM screening at 24-28 weeks — 75g OGTT: fasting ≥92, 1hr ≥180, 2hr ≥153 mg/dL (WHO criteria). Liver: mild elevation of ALP (3rd trimester — placental origin). Creatinine: lower baseline (0.4-0.8 mg/dL) due to increased GFR. HELLP syndrome: Hemolysis (elevated LDH, low haptoglobin), Elevated Liver enzymes, Low Platelets — obstetric emergency. In Bangladesh, eclampsia remains a major cause of maternal mortality — regular BP and proteinuria monitoring is essential.',
    tags: [
      'pregnancy',
      'prenatal',
      'hemoglobin',
      'gdm',
      'hellp',
      'tsh',
      'preeclampsia',
    ],
    source: 'medical-reference',
  },
];
