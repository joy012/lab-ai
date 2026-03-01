#!/usr/bin/env npx tsx
/**
 * Medical Knowledge Scraper & Seeder
 *
 * Scrapes medical data from free public APIs, formats using string templates
 * (no Gemini generation calls), generates embeddings, and inserts into MongoDB.
 *
 * Sources (all free, no auth required):
 *   - MedlinePlus Connect API   → condition/disease info by ICD-10 code
 *   - OpenFDA Drug Label API    → drug info, lab interactions, adverse effects
 *   - NIH LOINC Clinical Tables → lab test reference data
 *
 * Usage:
 *   npx tsx scripts/scrape-and-seed-knowledge.ts
 *   npx tsx scripts/scrape-and-seed-knowledge.ts --reset   # clear DB first
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { envYamlFactory } from '../src/config/env.config.js';

// Load env.yaml into process.env (same as NestJS app does)
envYamlFactory();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/** Strip HTML tags from MedlinePlus summary text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function saveEntry(entry: {
  category: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
}): Promise<boolean> {
  try {
    const embedding = await generateEmbedding(`${entry.title} ${entry.content}`);
    await prisma.medicalKnowledge.create({
      data: { ...entry, embedding },
    });
    return true;
  } catch (err: any) {
    if (err.message?.includes('429') || err.message?.includes('quota')) {
      console.log('  ⏳ Rate limited on embeddings, waiting 30s...');
      await delay(30000);
      try {
        const embedding = await generateEmbedding(
          `${entry.title} ${entry.content}`,
        );
        await prisma.medicalKnowledge.create({
          data: { ...entry, embedding },
        });
        return true;
      } catch {
        console.error(`  ❌ Retry failed: ${entry.title}`);
        return false;
      }
    }
    console.error(`  ❌ ${entry.title}: ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════
// 1. MEDLINEPLUS — Conditions by ICD-10
// ═══════════════════════════════════════════════════

const ICD10_CODES: { code: string; name: string }[] = [
  { code: 'E11', name: 'Type 2 Diabetes' },
  { code: 'E10', name: 'Type 1 Diabetes' },
  { code: 'I10', name: 'Hypertension' },
  { code: 'I48', name: 'Atrial Fibrillation' },
  { code: 'I25', name: 'Ischemic Heart Disease' },
  { code: 'I50', name: 'Heart Failure' },
  { code: 'D50', name: 'Iron Deficiency Anemia' },
  { code: 'D56', name: 'Thalassemia' },
  { code: 'K76.0', name: 'Fatty Liver' },
  { code: 'K80', name: 'Gallstones' },
  { code: 'N18', name: 'Chronic Kidney Disease' },
  { code: 'E03', name: 'Hypothyroidism' },
  { code: 'E05', name: 'Hyperthyroidism' },
  { code: 'A15', name: 'Tuberculosis' },
  { code: 'A90', name: 'Dengue Fever' },
  { code: 'B18', name: 'Chronic Viral Hepatitis' },
  { code: 'J18', name: 'Pneumonia' },
  { code: 'I63', name: 'Stroke' },
  { code: 'E78', name: 'Dyslipidemia' },
  { code: 'E55', name: 'Vitamin D Deficiency' },
  { code: 'M10', name: 'Gout' },
  { code: 'N20', name: 'Kidney Stones' },
  { code: 'E66', name: 'Obesity' },
  { code: 'J44', name: 'COPD' },
  { code: 'I21', name: 'Acute Myocardial Infarction' },
];

const MEDLINEPLUS_BASE =
  'https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&knowledgeResponseType=application/json&mainSearchCriteria.v.c=';

async function scrapeMedlinePlus(): Promise<number> {
  console.log('\n📋 Scraping MedlinePlus (conditions by ICD-10)...\n');
  let success = 0;

  for (const { code, name } of ICD10_CODES) {
    try {
      const data = await fetchJson(`${MEDLINEPLUS_BASE}${code}`);
      const entries = data?.feed?.entry;

      if (!entries || entries.length === 0) {
        console.log(`  ⚠️  No data for ${name} (${code})`);
        continue;
      }

      // Collect summaries from all entries (strip HTML)
      const summaries = entries
        .map((e: any) => {
          const summary = e?.summary?._value || '';
          return stripHtml(summary);
        })
        .filter(Boolean)
        .join(' ');

      if (!summaries) continue;

      // Format directly — no Gemini call needed
      const title = `${name} — Overview and Lab Markers (ICD-10: ${code})`;
      const content = summaries.slice(0, 2000);
      const tags = [
        name.toLowerCase(),
        code.toLowerCase(),
        'condition',
        'diagnosis',
        'lab-markers',
      ];

      const saved = await saveEntry({
        category: 'condition',
        title,
        content,
        tags,
        source: `medlineplus:${code}`,
      });

      if (saved) {
        console.log(`  ✅ ${title}`);
        success++;
      }

      await delay(300);
    } catch (err: any) {
      console.error(`  ❌ ${name} (${code}): ${err.message}`);
    }
  }

  return success;
}

// ═══════════════════════════════════════════════════
// 2. OPENFDA — Drug labels with lab interactions
// ═══════════════════════════════════════════════════

const COMMON_DRUGS = [
  'metformin',
  'amlodipine',
  'atorvastatin',
  'omeprazole',
  'levothyroxine',
  'aspirin',
  'warfarin',
  'lisinopril',
  'metoprolol',
  'ciprofloxacin',
  'amoxicillin',
  'paracetamol',
  'ibuprofen',
  'losartan',
  'insulin',
];

async function scrapeOpenFDA(): Promise<number> {
  console.log('\n💊 Scraping OpenFDA (drug labels + lab interactions)...\n');
  let success = 0;

  for (const drug of COMMON_DRUGS) {
    try {
      const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drug}"&limit=1`;
      const data = await fetchJson(url);
      const label = data?.results?.[0];

      if (!label) {
        console.log(`  ⚠️  No label for ${drug}`);
        continue;
      }

      // Extract relevant sections
      const sections: Record<string, string> = {};
      if (label.indications_and_usage?.[0]) sections.indications = String(label.indications_and_usage[0]).slice(0, 500);
      if (label.adverse_reactions?.[0]) sections.adverse = String(label.adverse_reactions[0]).slice(0, 500);
      if (label.drug_interactions?.[0]) sections.interactions = String(label.drug_interactions[0]).slice(0, 500);
      if (label.laboratory_tests?.[0]) sections.labTests = String(label.laboratory_tests[0]).slice(0, 500);
      if (label.warnings?.[0]) sections.warnings = String(label.warnings[0]).slice(0, 500);
      if (label.contraindications?.[0]) sections.contraindications = String(label.contraindications[0]).slice(0, 300);

      const contentParts = Object.entries(sections)
        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
        .join(' | ');

      if (!contentParts) continue;

      // Format directly — no Gemini call needed
      const drugName = drug.charAt(0).toUpperCase() + drug.slice(1);
      const title = `${drugName} — Lab Impact, Interactions, and Monitoring`;
      const content = contentParts.slice(0, 2000);
      const tags = [drug, 'drug', 'interaction', 'lab-impact', 'medication'];

      const saved = await saveEntry({
        category: 'drug_interaction',
        title,
        content,
        tags,
        source: `openfda:${drug}`,
      });

      if (saved) {
        console.log(`  ✅ ${title}`);
        success++;
      }

      await delay(500);
    } catch (err: any) {
      console.error(`  ❌ ${drug}: ${err.message}`);
    }
  }

  return success;
}

// ═══════════════════════════════════════════════════
// 3. LOINC NIH — Lab test reference data
// ═══════════════════════════════════════════════════

const LAB_TESTS_TO_SCRAPE = [
  'hemoglobin',
  'white blood cell count',
  'platelet count',
  'creatinine',
  'glucose fasting',
  'hemoglobin A1c',
  'cholesterol total',
  'LDL cholesterol',
  'HDL cholesterol',
  'triglycerides',
  'thyroid stimulating hormone',
  'alanine aminotransferase',
  'aspartate aminotransferase',
  'bilirubin total',
  'albumin',
  'uric acid',
  'calcium',
  'sodium',
  'potassium',
  'vitamin D 25-hydroxy',
  'vitamin B12',
  'ferritin',
  'C reactive protein',
  'erythrocyte sedimentation rate',
  'prothrombin time',
];

async function scrapeLOINC(): Promise<number> {
  console.log('\n🧪 Scraping NIH LOINC (lab test references)...\n');
  let success = 0;

  for (const testName of LAB_TESTS_TO_SCRAPE) {
    try {
      const url = `https://clinicaltables.nlm.nih.gov/api/loinc_items/v3/search?type=question&terms=${encodeURIComponent(testName)}&ef=LONG_COMMON_NAME,SYSTEM,SCALE_TYP,EXAMPLE_UNITS,CLASS&maxList=3`;
      const data = await fetchJson(url);

      const totalResults = (data as unknown[])[0] as number || 0;
      const extraFields = (data as unknown[])[2] as Record<string, string[]> || {};
      const displayStrings = (data as unknown[])[3] as string[][] || [];

      if (totalResults === 0 || displayStrings.length === 0) {
        console.log(`  ⚠️  No LOINC data for ${testName}`);
        continue;
      }

      // Build content from LOINC results — no Gemini call needed
      const loincDetails = displayStrings
        .map((d, i) => {
          const longName = extraFields.LONG_COMMON_NAME?.[i] || d[1] || '';
          const system = extraFields.SYSTEM?.[i] || '';
          const units = extraFields.EXAMPLE_UNITS?.[i] || '';
          const cls = extraFields.CLASS?.[i] || '';
          return `${longName} (Code: ${d[0]}, Specimen: ${system}, Units: ${units}, Class: ${cls})`;
        })
        .join('. ');

      const testTitle = testName.charAt(0).toUpperCase() + testName.slice(1);
      const title = `${testTitle} — LOINC Reference and Clinical Significance`;
      const content = `Lab test reference for ${testName}. ${loincDetails}. This test is commonly ordered in clinical settings for diagnostic evaluation. Abnormal values may indicate underlying pathology requiring further investigation.`;
      const tags = [
        testName.toLowerCase().replace(/\s+/g, '-'),
        'lab-test',
        'reference-range',
        'loinc',
        'diagnosis',
      ];

      const saved = await saveEntry({
        category: 'lab_test',
        title,
        content,
        tags,
        source: `loinc:${testName}`,
      });

      if (saved) {
        console.log(`  ✅ ${title}`);
        success++;
      }

      await delay(300);
    } catch (err: any) {
      console.error(`  ❌ ${testName}: ${err.message}`);
    }
  }

  return success;
}

// ═══════════════════════════════════════════════════
// 4. STATIC SEED — ECG, Imaging, Diet (from knowledge-seed-data.ts)
// ═══════════════════════════════════════════════════

// We also include the curated entries that can't be scraped
import { KNOWLEDGE_SEED_ENTRIES } from '../src/knowledge/knowledge-seed-data.js';

async function seedStaticEntries(): Promise<number> {
  console.log('\n📚 Seeding curated knowledge entries (ECG, imaging, diet)...\n');
  let success = 0;

  for (const entry of KNOWLEDGE_SEED_ENTRIES) {
    try {
      const saved = await saveEntry({
        ...entry,
        source: entry.source || 'curated',
      });
      if (saved) {
        console.log(`  ✅ ${entry.title}`);
        success++;
      }
      await delay(200);
    } catch (err: any) {
      console.error(`  ❌ ${entry.title}: ${err.message}`);
    }
  }

  return success;
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════

async function main() {
  console.log('🧠 Medical Knowledge Scraper & Seeder');
  console.log('=====================================');
  console.log('Sources: MedlinePlus, OpenFDA, LOINC, Curated data\n');

  const reset = process.argv.includes('--reset');

  if (reset) {
    console.log('🗑️  Clearing existing knowledge base...');
    const deleted = await prisma.medicalKnowledge.deleteMany({});
    console.log(`   Deleted ${deleted.count} entries.\n`);
  } else {
    const count = await prisma.medicalKnowledge.count();
    if (count > 0) {
      console.log(
        `⚠️  Knowledge base already has ${count} entries.`,
      );
      console.log(`   Use --reset to clear and re-scrape.\n`);
      return;
    }
  }

  const results = {
    medlineplus: 0,
    openfda: 0,
    loinc: 0,
    curated: 0,
  };

  // 1. Scrape MedlinePlus conditions
  results.medlineplus = await scrapeMedlinePlus();

  // 2. Scrape OpenFDA drug labels
  results.openfda = await scrapeOpenFDA();

  // 3. Scrape LOINC lab test references
  results.loinc = await scrapeLOINC();

  // 4. Seed curated entries (ECG, imaging, diet — can't be scraped)
  results.curated = await seedStaticEntries();

  // Summary
  const total =
    results.medlineplus + results.openfda + results.loinc + results.curated;

  console.log('\n=====================================');
  console.log('📊 RESULTS');
  console.log('=====================================');
  console.log(`  MedlinePlus (conditions): ${results.medlineplus}/${ICD10_CODES.length}`);
  console.log(`  OpenFDA (drugs):          ${results.openfda}/${COMMON_DRUGS.length}`);
  console.log(`  LOINC (lab tests):        ${results.loinc}/${LAB_TESTS_TO_SCRAPE.length}`);
  console.log(`  Curated (ECG/imaging):    ${results.curated}/${KNOWLEDGE_SEED_ENTRIES.length}`);
  console.log(`  ─────────────────────────`);
  console.log(`  TOTAL:                    ${total}`);
  console.log('=====================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
