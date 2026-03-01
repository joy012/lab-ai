/**
 * Imaging Report Extraction Prompts
 *
 * Modality-specific extraction prompts for CT, MRI, X-ray, USG,
 * PET-CT, mammography, DEXA, and other imaging modalities.
 * Each modality has specialized extraction rules and finding structures.
 */

// ── Modality-Specific Context Sections ──

const CT_SCAN_CONTEXT = `
CT SCAN SPECIFIC EXTRACTION RULES:
- Identify scan type: NCCT (non-contrast), CECT (contrast-enhanced), CTA (CT angiography), HRCT (high-resolution CT)
- Record contrast phase if applicable: arterial, portal venous, delayed, non-contrast
- For each finding, extract:
  * Exact size in mm/cm (e.g., "12mm nodule", "3.2 x 2.8 cm mass")
  * Density in Hounsfield Units (HU) if mentioned (e.g., "fluid density ~10 HU", "calcified density ~200 HU")
  * Enhancement pattern: enhancing, non-enhancing, heterogeneous, rim-enhancing, washout
  * Morphology: solid, cystic, mixed, calcified, necrotic, ground-glass
- HRCT chest specific: Note ground-glass opacities (GGO), consolidation, honeycombing, traction bronchiectasis, mosaic attenuation, tree-in-bud pattern, interlobular septal thickening
- CT head specific: Note midline shift (mm), hemorrhage type (epidural, subdural, subarachnoid, intraparenchymal), hydrocephalus, edema, mass effect, herniation
- CT abdomen specific: Note organ sizes (liver span, spleen, kidneys), vascular patency, lymph node sizes (short axis), free fluid, bowel wall thickening
- CT angiography: Note stenosis percentage, plaque type (calcified, non-calcified, mixed), vessel caliber, aneurysm dimensions, collateral circulation
- Record any incidental findings (e.g., adrenal incidentaloma, renal cyst, vertebral compression)`;

const MRI_CONTEXT = `
MRI SPECIFIC EXTRACTION RULES:
- Identify MRI type: Conventional MRI, MRA (MR angiography), MR spectroscopy, functional MRI, cardiac MRI
- Record sequences mentioned: T1-weighted, T2-weighted, FLAIR, DWI (diffusion), ADC map, GRE/SWI, post-gadolinium T1, STIR
- For each finding, extract:
  * Signal characteristics: T1 (hypo/iso/hyperintense), T2 (hypo/iso/hyperintense), FLAIR (bright/dark), DWI (restricted/facilitated diffusion)
  * Size and dimensions in mm/cm
  * Enhancement pattern after gadolinium: enhancing, ring-enhancing, non-enhancing, leptomeningeal enhancement
  * Location using standard anatomical terminology
- MRI brain specific: Note lobes affected, white matter vs grey matter, periventricular changes, corpus callosum, basal ganglia, brainstem, cerebellum, ventricle size, Fazekas grade for white matter lesions
- MRI spine specific: Note disc levels (C3-C4, L4-L5 etc.), disc bulge vs protrusion vs extrusion vs sequestration, canal stenosis (mild/moderate/severe), foraminal narrowing, cord signal changes, Modic changes (Type I/II/III), nerve root compression
- MRI musculoskeletal: Note ligament tears (partial/complete), meniscal tears (type and location), cartilage defects (grade), bone marrow edema, joint effusion, tendon pathology
- MRI abdomen: Note liver signal (steatosis on in/out phase), iron deposition, lesion characterization (hemangioma, FNH, HCC features), biliary dilatation, pancreatic duct
- Cardiac MRI: Note ejection fraction, wall motion abnormalities, late gadolinium enhancement pattern (subendocardial, mid-wall, epicardial), T1/T2 mapping values, pericardial effusion`;

const XRAY_CONTEXT = `
X-RAY SPECIFIC EXTRACTION RULES:
- Identify view: PA (posteroanterior), AP (anteroposterior), lateral, oblique, decubitus
- Chest X-ray specific:
  * Lungs: Opacities (consolidation, ground-glass, reticular, nodular), effusion, pneumothorax, hyperinflation, fibrosis, cavitation
  * Heart: Cardiothoracic ratio (CTR — normal < 0.5), chamber enlargement, pericardial effusion
  * Mediastinum: Width, tracheal shift, hilar enlargement, lymphadenopathy
  * Pleura: Effusion (estimate amount: small/moderate/large), thickening, calcification
  * Bones: Rib fractures, vertebral compression, lytic/blastic lesions
  * Devices: ETT position, central lines, pacemaker, chest tube
  * Systematic check: Airway, Breathing (lungs), Circulation (heart/mediastinum), Disability (bones), Everything else (soft tissue, below diaphragm)
- Skeletal X-ray specific: Fracture type (transverse, oblique, spiral, comminuted, compression), displacement, angulation, joint alignment, joint space narrowing, osteophytes, erosions, periosteal reaction, soft tissue swelling
- Abdominal X-ray specific: Bowel gas pattern (normal, dilated loops, air-fluid levels), free air under diaphragm, calcifications (renal, biliary, pancreatic, vascular), organomegaly, foreign bodies`;

const USG_CONTEXT = `
ULTRASOUND (USG) SPECIFIC EXTRACTION RULES:
- Identify scan type: Abdominal USG, pelvic USG, thyroid USG, obstetric USG, Doppler USG, musculoskeletal USG, renal USG, breast USG, scrotal USG, transvaginal USG, transrectal USG
- For each finding, extract:
  * Echogenicity: anechoic, hypoechoic, isoechoic, hyperechoic, mixed/heterogeneous
  * Size in mm/cm (three dimensions when available: length x width x depth)
  * Vascularity on Doppler: avascular, hypovascular, hypervascular, flow pattern
  * Margins: well-defined, ill-defined, irregular, lobulated
- Abdominal USG specific:
  * Liver: Size (span in cm), echogenicity (normal, grade I/II/III fatty liver), focal lesions (cyst, hemangioma, solid), portal vein diameter, hepatic veins
  * Gallbladder: Wall thickness (normal < 3mm), stones (size, number), CBD diameter (normal < 6mm, post-cholecystectomy < 10mm), pericholecystic fluid, GB polyps
  * Pancreas: Visibility, echogenicity, duct diameter (normal < 3mm), focal lesions
  * Spleen: Size (normal < 12cm), echogenicity, focal lesions
  * Kidneys: Size (normal 9-12cm), cortical thickness (normal > 1cm), corticomedullary differentiation, hydronephrosis grade (I-IV), stones, cysts (Bosniak classification)
  * Bladder: Wall thickness, residual volume, intraluminal lesions
  * Free fluid: Present/absent, location (Morrison's pouch, pelvis, perisplenic)
- Thyroid USG specific: Lobe sizes, nodule characteristics (solid/cystic/mixed, echogenicity, margins, calcifications — microcalcifications are suspicious), TIRADS score, vascularity, cervical lymph nodes
- Obstetric USG specific: Gestational age, fetal biometry (BPD, HC, AC, FL), estimated fetal weight, placental location and grade, amniotic fluid index (AFI), fetal heart rate, anomaly survey findings
- Doppler USG specific: Peak systolic velocity (PSV), end diastolic velocity (EDV), resistive index (RI), pulsatility index (PI), flow direction, stenosis grading, venous reflux duration`;

const PET_CT_CONTEXT = `
PET-CT SPECIFIC EXTRACTION RULES:
- Record radiotracer used: FDG (fluorodeoxyglucose), Ga-68 DOTATATE, F-18 NaF, PSMA
- For each finding, extract:
  * SUVmax (standardized uptake value): exact number — this is CRITICAL for oncology staging
  * Comparison with background: above/below mediastinal blood pool, above/below liver uptake
  * Size of the metabolically active lesion
  * Anatomical location (be very specific: "right hilar lymph node station 10R")
- Staging context: Note primary tumor site, nodal stations involved, distant metastases
- Response assessment: Compare with prior PET if mentioned (complete metabolic response, partial response, stable disease, progressive disease)
- Deauville score (for lymphoma): 1-5 scale based on uptake relative to mediastinum and liver`;

const MAMMOGRAPHY_CONTEXT = `
MAMMOGRAPHY SPECIFIC EXTRACTION RULES:
- Record views: MLO (mediolateral oblique), CC (craniocaudal), spot compression, magnification
- Breast composition: ACR categories A (fatty), B (scattered fibroglandular), C (heterogeneously dense), D (extremely dense)
- For each finding, extract:
  * Type: mass, calcification, architectural distortion, asymmetry (focal, global, developing)
  * Mass characteristics: shape (oval, round, irregular), margins (circumscribed, obscured, microlobulated, indistinct, spiculated), density (fat-containing, low, equal, high)
  * Calcification type: benign (coarse, popcorn, rim, vascular, milk of calcium) vs suspicious (amorphous, coarse heterogeneous, fine pleomorphic, fine linear/branching)
  * Distribution of calcifications: diffuse, regional, grouped/clustered, linear, segmental
  * Location: quadrant, clock position, depth (anterior/middle/posterior), distance from nipple
- BI-RADS ASSESSMENT (CRITICAL — extract this):
  * BI-RADS 0: Incomplete — needs additional imaging
  * BI-RADS 1: Negative — routine screening
  * BI-RADS 2: Benign — routine screening
  * BI-RADS 3: Probably benign — short interval follow-up (6 months)
  * BI-RADS 4: Suspicious — biopsy should be considered (4A: low, 4B: moderate, 4C: high suspicion)
  * BI-RADS 5: Highly suggestive of malignancy — biopsy required
  * BI-RADS 6: Known biopsy-proven malignancy`;

const DEXA_CONTEXT = `
DEXA / BONE DENSITOMETRY SPECIFIC EXTRACTION RULES:
- Record scan sites: lumbar spine (L1-L4), femoral neck, total hip, forearm (33% radius)
- For each site, extract:
  * BMD (bone mineral density) in g/cm²
  * T-score (comparison with young adult reference)
  * Z-score (comparison with age-matched reference)
- WHO Classification based on T-score:
  * Normal: T-score ≥ -1.0
  * Osteopenia: T-score between -1.0 and -2.5
  * Osteoporosis: T-score ≤ -2.5
  * Severe osteoporosis: T-score ≤ -2.5 with fragility fracture
- Note FRAX score if calculated (10-year fracture probability)
- Record comparison with prior DEXA if available (percentage change per year)
- Note any vertebral fracture assessment (VFA) findings`;

const ENDOSCOPY_CONTEXT = `
ENDOSCOPY / PROCEDURE REPORT EXTRACTION RULES:
- Identify procedure type: Upper GI endoscopy (EGD/OGD), Colonoscopy, Sigmoidoscopy, Bronchoscopy, ERCP, EUS, Cystoscopy, Hysteroscopy, Laryngoscopy
- For each finding, extract:
  * Location (be specific: "gastric antrum", "descending colon at 40cm", "right main bronchus")
  * Description: ulcer (size, depth, edges), polyp (sessile/pedunculated, size), mass, stricture, varices (grade), inflammation (erythema, edema, erosions)
  * Biopsy taken: yes/no, site, number of specimens
- Upper GI specific: Esophageal findings (varices grade, Barrett's, stricture, Mallory-Weiss), gastric findings (ulcer, gastritis, H. pylori status), duodenal findings
- Colonoscopy specific: Cecal intubation (yes/no), preparation quality (Boston Bowel Prep Score), polyps (location, size, morphology, Paris classification), diverticulosis, colitis pattern, hemorrhoids
- ERCP specific: CBD diameter, stones (size, number), stent placement, sphincterotomy, stricture, brush cytology`;

// ── Main Extraction Prompt Builder ──

export function buildImagingExtractionPrompt(): string {
  return `You are a senior radiologist and diagnostic imaging specialist. Extract ALL findings from this imaging/diagnostic report with clinical precision and completeness.

RETURN ONLY valid JSON in this exact format:
{
  "imagingModality": "CT",
  "bodyRegion": "Chest",
  "imagingFindings": [
    {
      "location": "Right lower lobe",
      "description": "4mm solid nodule, no calcification, no ground-glass component",
      "significance": "concerning",
      "measurements": "4mm",
      "characteristics": "solid, non-calcified"
    },
    {
      "location": "Left lung",
      "description": "Clear lung fields, no consolidation or effusion",
      "significance": "normal",
      "measurements": "",
      "characteristics": ""
    }
  ],
  "impression": "Radiologist's overall impression/conclusion verbatim from the report",
  "labName": "Hospital or imaging center name if visible",
  "reportDate": "YYYY-MM-DD if visible",
  "patientName": "Patient name if visible",
  "rawText": "Full extracted text from the report"
}

═══════════════════════════════════════════════════
MODALITY IDENTIFICATION
═══════════════════════════════════════════════════

Identify the EXACT imaging modality. Use one of:
"CT" | "MRI" | "X-RAY" | "USG" | "PET-CT" | "MAMMOGRAPHY" | "DEXA" | "FLUOROSCOPY" | "NUCLEAR" | "ENDOSCOPY" | "ANGIOGRAPHY" | "ECHOCARDIOGRAPHY"

If the report specifies a sub-type, set bodyRegion to include it:
- "CT" + "Head (NCCT)" or "Chest (HRCT)" or "Abdomen (CECT)"
- "MRI" + "Brain with contrast" or "Lumbar Spine" or "Knee (Right)"
- "USG" + "Whole Abdomen" or "Thyroid" or "Obstetric (20 weeks)"

═══════════════════════════════════════════════════
FINDING SIGNIFICANCE — EXACTLY one of:
═══════════════════════════════════════════════════

"normal" — No abnormality at this location
  Examples: "Normal liver echotexture", "Clear lung fields", "Normal disc spaces"

"benign" — Finding present but clinically insignificant
  Examples: Simple renal cyst (Bosniak I), small hepatic hemangioma, degenerative osteophytes, benign prostatic hypertrophy, functional ovarian cyst, BI-RADS 2 findings, grade I fatty liver, physiologic lymph nodes (< 1cm short axis)

"concerning" — Needs clinical correlation, follow-up, or further workup
  Examples: Indeterminate pulmonary nodule (4-8mm), disc herniation with nerve compression, suspicious thyroid nodule (TIRADS 4), complex renal cyst (Bosniak IIF/III), indeterminate adrenal lesion, moderate stenosis, BI-RADS 3-4A, moderate hydronephrosis, pleural effusion of unknown cause

"critical" — Urgent finding requiring immediate clinical action
  Examples: Acute intracranial hemorrhage, tension pneumothorax, aortic dissection, pulmonary embolism, acute bowel obstruction with strangulation, perforated viscus (free air), BI-RADS 4C-5, spinal cord compression, active hemorrhage, cauda equina compression, large pericardial effusion with tamponade, acute stroke (restricted diffusion on DWI)

═══════════════════════════════════════════════════
MODALITY-SPECIFIC EXTRACTION CONTEXT
═══════════════════════════════════════════════════
${CT_SCAN_CONTEXT}
${MRI_CONTEXT}
${XRAY_CONTEXT}
${USG_CONTEXT}
${PET_CT_CONTEXT}
${MAMMOGRAPHY_CONTEXT}
${DEXA_CONTEXT}
${ENDOSCOPY_CONTEXT}

═══════════════════════════════════════════════════
UNIVERSAL RULES
═══════════════════════════════════════════════════

1. EXTRACT EVERY FINDING — Do not skip any location, organ, or observation mentioned in the report
2. Be SPECIFIC with measurements — always include exact sizes in mm/cm
3. Include the "characteristics" field with technical descriptors (density, signal, echogenicity, enhancement)
4. The "impression" field MUST contain the radiologist's conclusion exactly as written (or as close as possible)
5. If the report mentions comparison with prior studies, note changes (increased, decreased, stable, new)
6. Extract any staging/grading systems mentioned: BI-RADS, TIRADS, LI-RADS, Bosniak, Kellgren-Lawrence, PIRADS, Lung-RADS, Fazekas, RECIST
7. Note incidental findings even if unrelated to the primary indication
8. For structured reports (some MRI/CT), map each section to the findings array
9. If the report has a "clinical indication" or "history", include it in rawText`;
}
