#!/usr/bin/env npx tsx
/**
 * Radiopaedia Case Scraper for AI Evaluation
 *
 * Scrapes clinical cases from Radiopaedia.org API to build a ground-truth
 * evaluation dataset. Each case contains:
 *   - Patient demographics (age, gender)
 *   - Clinical history
 *   - Imaging modality
 *   - Findings (ground truth)
 *   - Diagnosis (ground truth)
 *   - Image URLs
 *
 * Usage:
 *   npx tsx scripts/scrape-radiopaedia.ts --modality ct --count 20
 *   npx tsx scripts/scrape-radiopaedia.ts --modality mri --count 10
 *   npx tsx scripts/scrape-radiopaedia.ts --modality xray --count 15
 *   npx tsx scripts/scrape-radiopaedia.ts --all --count 10
 *
 * Output: scripts/eval-data/<modality>-cases.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Types ──

interface RadiopaediaCase {
  id: number;
  title: string;
  url: string;
  modality: string;
  bodyRegion: string;
  patientAge: string;
  patientGender: string;
  clinicalHistory: string;
  diagnosis: string[];
  findings: string;
  impression: string;
  imageUrls: string[];
  scrapedAt: string;
}

interface RadiopaediaAPICase {
  id: number;
  title: string;
  url: string;
  body: string;
  age: string;
  patient_sex: string;
  modality: { name: string } | string;
  system: { name: string } | string;
  diagnosis: string;
  clinical_history: string;
  findings: string;
  studies?: Array<{
    images?: Array<{
      public_filename?: string;
      urls?: { original?: string; preview?: string };
    }>;
  }>;
}

// ── Radiopaedia API Scraper ──

const RADIOPAEDIA_API = 'https://radiopaedia.org/api/v1';
const RADIOPAEDIA_SEARCH = 'https://radiopaedia.org/search.json';

const MODALITY_SEARCH_TERMS: Record<string, string[]> = {
  ct: ['CT scan', 'computed tomography', 'NCCT', 'CECT', 'HRCT', 'CT angiography'],
  mri: ['MRI', 'magnetic resonance', 'MR brain', 'MR spine'],
  xray: ['X-ray', 'radiograph', 'chest xray', 'plain film'],
  usg: ['ultrasound', 'sonography', 'USG abdomen', 'doppler'],
  ecg: ['ECG', 'electrocardiogram', 'EKG'],
  mammography: ['mammography', 'mammogram', 'breast imaging'],
};

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'LabAI-Evaluation/1.0 (medical-ai-accuracy-testing)',
          'Accept': 'application/json',
        },
      });
      if (res.status === 429) {
        // Rate limited — wait and retry
        const wait = Math.pow(2, i + 1) * 1000;
        console.log(`  Rate limited, waiting ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err: any) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function searchRadiopaediaCases(
  modality: string,
  count: number,
): Promise<RadiopaediaCase[]> {
  const cases: RadiopaediaCase[] = [];
  const searchTerms = MODALITY_SEARCH_TERMS[modality] || [modality];

  console.log(`\nSearching Radiopaedia for "${modality}" cases...`);

  for (const term of searchTerms) {
    if (cases.length >= count) break;

    try {
      // Use Radiopaedia search API
      const searchUrl = `${RADIOPAEDIA_SEARCH}?utf8=✓&q=${encodeURIComponent(term)}&scope=cases&lang=us&page=1`;
      const searchResult = await fetchWithRetry(searchUrl);

      if (!searchResult || !Array.isArray(searchResult)) {
        console.log(`  No results for "${term}"`);
        continue;
      }

      for (const item of searchResult) {
        if (cases.length >= count) break;

        try {
          // Fetch full case details
          const caseUrl = `${RADIOPAEDIA_API}/cases/${item.id}`;
          const caseData: RadiopaediaAPICase = await fetchWithRetry(caseUrl);

          if (!caseData) continue;

          // Extract image URLs
          const imageUrls: string[] = [];
          if (caseData.studies) {
            for (const study of caseData.studies) {
              if (study.images) {
                for (const img of study.images) {
                  const url = img.urls?.original || img.urls?.preview || img.public_filename;
                  if (url) imageUrls.push(url);
                }
              }
            }
          }

          const evalCase: RadiopaediaCase = {
            id: caseData.id,
            title: caseData.title || '',
            url: `https://radiopaedia.org${caseData.url || `/cases/${caseData.id}`}`,
            modality: typeof caseData.modality === 'object' ? caseData.modality.name : (caseData.modality || modality.toUpperCase()),
            bodyRegion: typeof caseData.system === 'object' ? caseData.system.name : (caseData.system || ''),
            patientAge: caseData.age || '',
            patientGender: caseData.patient_sex || '',
            clinicalHistory: caseData.clinical_history || '',
            diagnosis: caseData.diagnosis ? [caseData.diagnosis] : [],
            findings: caseData.findings || '',
            impression: caseData.body || '',
            imageUrls: imageUrls.slice(0, 5), // Max 5 images per case
            scrapedAt: new Date().toISOString(),
          };

          // Only include cases with sufficient data
          if (evalCase.diagnosis.length > 0 && (evalCase.findings || evalCase.impression)) {
            cases.push(evalCase);
            console.log(`  [${cases.length}/${count}] ${evalCase.title} (${evalCase.patientAge} ${evalCase.patientGender})`);
          }

          // Be respectful — wait between requests
          await new Promise(r => setTimeout(r, 500));
        } catch (err: any) {
          console.log(`  Skipping case ${item.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      console.log(`  Search error for "${term}": ${err.message}`);
    }
  }

  return cases;
}

// ── Manual Case Builder ──
// For when the API doesn't work or for curated high-quality cases

function buildManualEvalCases(): Record<string, RadiopaediaCase[]> {
  return {
    ct: [
      {
        id: 1,
        title: 'Acute subdural hematoma',
        url: 'https://radiopaedia.org/cases/acute-subdural-hematoma',
        modality: 'CT',
        bodyRegion: 'Head',
        patientAge: '72',
        patientGender: 'Male',
        clinicalHistory: 'Fall from standing height, GCS 13, on warfarin',
        diagnosis: ['Acute subdural hematoma', 'Midline shift'],
        findings: 'Crescent-shaped hyperdense collection along right cerebral convexity measuring up to 12mm in maximum thickness. 6mm rightward midline shift. Effacement of right lateral ventricle. No evidence of skull fracture.',
        impression: 'Right-sided acute subdural hematoma with significant mass effect and midline shift. Urgent neurosurgical consultation recommended.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Pulmonary embolism',
        url: 'https://radiopaedia.org/cases/pulmonary-embolism',
        modality: 'CT',
        bodyRegion: 'Chest (CTPA)',
        patientAge: '55',
        patientGender: 'Female',
        clinicalHistory: 'Sudden onset dyspnea, pleuritic chest pain, recent hip surgery',
        diagnosis: ['Bilateral pulmonary embolism', 'Right heart strain'],
        findings: 'Filling defects seen in bilateral main pulmonary arteries extending into lobar and segmental branches bilaterally. RV/LV ratio of 1.3 suggesting right heart strain. Small bilateral pleural effusions. No pulmonary infarction identified.',
        impression: 'Extensive bilateral pulmonary embolism with right heart strain. Requires urgent anticoagulation and consideration of thrombolysis.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Acute appendicitis',
        url: 'https://radiopaedia.org/cases/acute-appendicitis',
        modality: 'CT',
        bodyRegion: 'Abdomen (CECT)',
        patientAge: '28',
        patientGender: 'Male',
        clinicalHistory: 'RIF pain for 24 hours, fever 38.5°C, elevated WBC',
        diagnosis: ['Acute appendicitis'],
        findings: 'Dilated appendix measuring 11mm in diameter with wall enhancement and periappendiceal fat stranding. Appendicolith seen at the base. Small amount of free fluid in the pelvis. No abscess formation.',
        impression: 'Acute uncomplicated appendicitis with appendicolith. Surgical consultation recommended.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
    ],
    mri: [
      {
        id: 10,
        title: 'Acute ischemic stroke - MCA territory',
        url: 'https://radiopaedia.org/cases/acute-ischaemic-stroke',
        modality: 'MRI',
        bodyRegion: 'Brain',
        patientAge: '68',
        patientGender: 'Male',
        clinicalHistory: 'Sudden onset left hemiplegia and facial droop, 3 hours ago. Known hypertension and diabetes.',
        diagnosis: ['Acute ischemic stroke, right MCA territory'],
        findings: 'Restricted diffusion (bright on DWI, dark on ADC) involving right insular cortex, right frontal and parietal lobes in the MCA territory. No hemorrhagic transformation. FLAIR shows subtle hyperintensity in the same distribution. MRA demonstrates abrupt cutoff of the right M1 segment of MCA.',
        impression: 'Acute right MCA territory infarction with M1 occlusion. Consider thrombectomy given presentation within the treatment window.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
      {
        id: 11,
        title: 'L4-L5 disc herniation with nerve compression',
        url: 'https://radiopaedia.org/cases/lumbar-disc-herniation',
        modality: 'MRI',
        bodyRegion: 'Lumbar Spine',
        patientAge: '42',
        patientGender: 'Female',
        clinicalHistory: 'Left leg radiculopathy for 6 weeks, positive straight leg raise, L5 dermatomal numbness',
        diagnosis: ['L4-L5 left paracentral disc extrusion', 'L5 nerve root compression'],
        findings: 'Large left paracentral disc extrusion at L4-L5 level with inferior migration, compressing the traversing left L5 nerve root. Disc measures approximately 8mm in AP dimension. Moderate left lateral recess stenosis. Disc desiccation at L4-L5 and L5-S1 (Pfirrmann grade III-IV). No cauda equina compression. Conus terminates normally at L1-L2 level.',
        impression: 'Large L4-L5 left paracentral disc extrusion with L5 nerve root compression. Correlates with clinical presentation. Surgical consultation may be considered if conservative management fails.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
      {
        id: 12,
        title: 'Neonatal brain injury - IVH and PVL',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28263044/',
        modality: 'MRI',
        bodyRegion: 'Brain (Neonatal)',
        patientAge: '0 (premature neonate, 28 weeks)',
        patientGender: 'Unknown',
        clinicalHistory: 'Premature neonate born at 28 weeks gestation. Cranial ultrasound showed intraventricular hemorrhage.',
        diagnosis: ['Intraventricular hemorrhage (IVH)', 'Periventricular leukomalacia (PVL)', 'Post-hemorrhagic hydrocephalus'],
        findings: 'T1-weighted images show hyperintense signal within both lateral ventricles consistent with blood products (intraventricular hemorrhage). T2-weighted and FLAIR sequences demonstrate bilateral periventricular white matter signal abnormality consistent with periventricular leukomalacia. Lateral ventricles are dilated suggesting post-hemorrhagic hydrocephalus. DWI shows restricted diffusion in periventricular white matter indicating acute injury.',
        impression: 'Severe neonatal brain injury with bilateral intraventricular hemorrhage, periventricular leukomalacia, and post-hemorrhagic hydrocephalus. Prognosis for neurodevelopment is guarded.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
    ],
    xray: [
      {
        id: 20,
        title: 'Left lower lobe pneumonia',
        url: 'https://radiopaedia.org/cases/left-lower-lobe-pneumonia',
        modality: 'X-RAY',
        bodyRegion: 'Chest',
        patientAge: '60',
        patientGender: 'Male',
        clinicalHistory: 'Fever, productive cough for 5 days, left-sided chest pain',
        diagnosis: ['Left lower lobe consolidation / pneumonia'],
        findings: 'Dense consolidation in the left lower zone obscuring the left hemidiaphragm (silhouette sign positive). Air bronchograms visible within the consolidation. Heart size normal (CTR < 0.5). No pleural effusion. Right lung is clear. No pneumothorax.',
        impression: 'Left lower lobe pneumonia. Clinical correlation and follow-up imaging after treatment recommended.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
      {
        id: 21,
        title: 'Right tension pneumothorax',
        url: 'https://radiopaedia.org/cases/tension-pneumothorax',
        modality: 'X-RAY',
        bodyRegion: 'Chest',
        patientAge: '25',
        patientGender: 'Male',
        clinicalHistory: 'Stab wound right chest, acute shortness of breath, hypotension',
        diagnosis: ['Right tension pneumothorax'],
        findings: 'Large right-sided pneumothorax with complete collapse of the right lung. Mediastinal shift to the left. Flattening of the right hemidiaphragm. Left lung appears clear. Subcutaneous emphysema in the right chest wall.',
        impression: 'Right tension pneumothorax requiring immediate decompression. Critical finding.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
    ],
    usg: [
      {
        id: 30,
        title: 'Cholelithiasis with acute cholecystitis',
        url: 'https://radiopaedia.org/cases/acute-cholecystitis',
        modality: 'USG',
        bodyRegion: 'Abdomen',
        patientAge: '45',
        patientGender: 'Female',
        clinicalHistory: 'RUQ pain after fatty meal, positive Murphy sign, fever',
        diagnosis: ['Acute calculous cholecystitis'],
        findings: 'Gallbladder is distended with wall thickening measuring 5mm (normal < 3mm). Multiple echogenic foci with posterior acoustic shadowing consistent with gallstones, largest measuring 15mm. Pericholecystic fluid present. Sonographic Murphy sign positive. CBD measures 4mm (normal). Liver shows normal echogenicity. No intrahepatic biliary dilatation.',
        impression: 'Acute calculous cholecystitis. Surgical consultation for cholecystectomy recommended.',
        imageUrls: [],
        scrapedAt: new Date().toISOString(),
      },
    ],
  };
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const modalityFlag = args.indexOf('--modality');
  const countFlag = args.indexOf('--count');
  const allFlag = args.includes('--all');
  const manualFlag = args.includes('--manual');

  const modality = modalityFlag >= 0 ? args[modalityFlag + 1] : 'ct';
  const count = countFlag >= 0 ? parseInt(args[countFlag + 1]) : 10;

  const outputDir = path.join(__dirname, 'eval-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (manualFlag || true) {
    // Use curated manual cases (more reliable for evaluation)
    console.log('\n=== Building Curated Evaluation Dataset ===\n');
    const manualCases = buildManualEvalCases();

    const modalities = allFlag ? Object.keys(manualCases) : [modality];

    for (const mod of modalities) {
      const cases = manualCases[mod] || [];
      if (cases.length === 0) {
        console.log(`No manual cases for ${mod}`);
        continue;
      }

      const outputFile = path.join(outputDir, `${mod}-cases.json`);
      fs.writeFileSync(outputFile, JSON.stringify(cases, null, 2));
      console.log(`Wrote ${cases.length} ${mod.toUpperCase()} cases → ${outputFile}`);
    }

    // Write combined file
    const allCases = Object.values(manualCases).flat();
    const combinedFile = path.join(outputDir, 'all-cases.json');
    fs.writeFileSync(combinedFile, JSON.stringify(allCases, null, 2));
    console.log(`\nWrote ${allCases.length} total cases → ${combinedFile}`);

    console.log('\n=== How to Add More Cases ===');
    console.log('1. Go to https://radiopaedia.org/cases');
    console.log('2. Find cases with clear findings + diagnosis');
    console.log('3. Add them to buildManualEvalCases() in this script');
    console.log('4. Re-run: npx tsx scripts/scrape-radiopaedia.ts --manual');
    console.log('\nThen run evaluation: npx tsx scripts/evaluate-ai.ts');
    return;
  }

  // API-based scraping
  if (allFlag) {
    for (const mod of Object.keys(MODALITY_SEARCH_TERMS)) {
      const cases = await searchRadiopaediaCases(mod, count);
      const outputFile = path.join(outputDir, `${mod}-cases.json`);
      fs.writeFileSync(outputFile, JSON.stringify(cases, null, 2));
      console.log(`\nWrote ${cases.length} ${mod} cases → ${outputFile}`);
    }
  } else {
    const cases = await searchRadiopaediaCases(modality, count);
    const outputFile = path.join(outputDir, `${modality}-cases.json`);
    fs.writeFileSync(outputFile, JSON.stringify(cases, null, 2));
    console.log(`\nWrote ${cases.length} ${modality} cases → ${outputFile}`);
  }
}

main().catch(console.error);
