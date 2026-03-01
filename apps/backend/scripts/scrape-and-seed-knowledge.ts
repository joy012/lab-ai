#!/usr/bin/env npx tsx
/**
 * Medical Knowledge Scraper & Seeder
 *
 * Scrapes medical data from free public APIs, uses Gemini AI to format it
 * into our knowledge schema, generates embeddings, and inserts into MongoDB.
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

async function callGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function extractJson(text: string): any {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = match ? match[1].trim() : text.trim();
  return JSON.parse(raw);
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
      console.log('  ⏳ Rate limited, waiting 15s...');
      await delay(15000);
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

      // Collect summaries from all entries
      const summaries = entries
        .map((e: any) => {
          const title = e?.title?._value || '';
          const summary = e?.summary?._value || '';
          return `${title}: ${summary}`;
        })
        .filter(Boolean)
        .join('\n\n');

      if (!summaries) continue;

      // Use Gemini to format into our schema
      const prompt = `You are a medical knowledge formatter for a lab report AI app used in Bangladesh.

Given this MedlinePlus data about "${name}" (ICD-10: ${code}), create a knowledge entry.

RAW DATA:
${summaries.slice(0, 3000)}

Return ONLY valid JSON:
{
  "title": "Concise title (e.g., '${name} — Overview and Lab Markers')",
  "content": "A dense 2-3 paragraph summary covering: what the condition is, key lab tests/imaging used for diagnosis, normal vs abnormal values, treatment overview, and any Bangladesh-specific context (prevalence, local dietary factors, common medications used locally). Write for a medical AI that interprets lab reports.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

      const aiResponse = await callGemini(prompt);
      const formatted = extractJson(aiResponse);

      const saved = await saveEntry({
        category: 'condition',
        title: formatted.title,
        content: formatted.content,
        tags: formatted.tags || [name.toLowerCase()],
        source: `medlineplus:${code}`,
      });

      if (saved) {
        console.log(`  ✅ ${formatted.title}`);
        success++;
      }

      await delay(300); // rate limit: MedlinePlus 85 req/min
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
      const sections = {
        indications: label.indications_and_usage?.[0]?.slice(0, 500) || '',
        adverse: label.adverse_reactions?.[0]?.slice(0, 500) || '',
        interactions: label.drug_interactions?.[0]?.slice(0, 500) || '',
        labTests: label.laboratory_tests?.[0]?.slice(0, 500) || '',
        warnings: label.warnings?.[0]?.slice(0, 500) || '',
        contraindications: label.contraindications?.[0]?.slice(0, 300) || '',
      };

      const rawText = Object.entries(sections)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k.toUpperCase()}:\n${v}`)
        .join('\n\n');

      if (!rawText) continue;

      const prompt = `You are a medical knowledge formatter for a lab report AI app used in Bangladesh.

Given this FDA label data for "${drug}", create a knowledge entry focused on how this drug affects lab results.

RAW DATA:
${rawText.slice(0, 3000)}

Return ONLY valid JSON:
{
  "title": "${drug.charAt(0).toUpperCase() + drug.slice(1)} — Lab Impact and Interactions",
  "content": "A dense 2-paragraph summary covering: what lab tests are affected by this drug (e.g., liver enzymes, blood sugar, electrolytes, INR), how to interpret lab values in patients taking this drug, common adverse effects visible on lab reports, and monitoring recommendations. Include Bangladesh context if relevant (e.g., drug availability, common use cases locally).",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

      const aiResponse = await callGemini(prompt);
      const formatted = extractJson(aiResponse);

      const saved = await saveEntry({
        category: 'drug_interaction',
        title: formatted.title,
        content: formatted.content,
        tags: formatted.tags || [drug],
        source: `openfda:${drug}`,
      });

      if (saved) {
        console.log(`  ✅ ${formatted.title}`);
        success++;
      }

      await delay(500); // OpenFDA: ~1000 req/day unauthenticated
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

      const totalResults = data[0] || 0;
      const extraFields = data[2] || {};
      const displayStrings = data[3] || [];

      if (totalResults === 0 || displayStrings.length === 0) {
        console.log(`  ⚠️  No LOINC data for ${testName}`);
        continue;
      }

      // Build context from LOINC results
      const loincInfo = displayStrings
        .map((d: any[], i: number) => {
          const longName = extraFields.LONG_COMMON_NAME?.[i] || d[1] || '';
          const system = extraFields.SYSTEM?.[i] || '';
          const units = extraFields.EXAMPLE_UNITS?.[i] || '';
          const cls = extraFields.CLASS?.[i] || '';
          return `Code: ${d[0]}, Name: ${longName}, System: ${system}, Units: ${units}, Class: ${cls}`;
        })
        .join('\n');

      const prompt = `You are a medical knowledge formatter for a lab report AI app used in Bangladesh.

Given this LOINC lab test data for "${testName}", create a knowledge entry about this lab test.

LOINC DATA:
${loincInfo}

Return ONLY valid JSON:
{
  "title": "Concise title about this lab test",
  "content": "A dense 2-3 paragraph summary covering: what this test measures, normal reference ranges (with units), clinical significance of high and low values, common conditions that cause abnormal results, and Bangladesh-specific context (prevalence of related conditions, local dietary factors, common medications). Include specific numbers and ranges.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

      const aiResponse = await callGemini(prompt);
      const formatted = extractJson(aiResponse);

      const saved = await saveEntry({
        category: 'lab_test',
        title: formatted.title,
        content: formatted.content,
        tags: formatted.tags || [testName],
        source: `loinc:${testName}`,
      });

      if (saved) {
        console.log(`  ✅ ${formatted.title}`);
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
