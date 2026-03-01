import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY', '');
    if (apiKey && !apiKey.startsWith('YOUR_')) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Generate embedding vector using Gemini's embedding model (free).
   * Returns a 768-dimensional vector.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) throw new Error('Gemini API key required for embeddings');

    const model = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  /**
   * Add medical knowledge to the database with embedding.
   */
  async addKnowledge(data: {
    category: string;
    title: string;
    content: string;
    tags: string[];
    source?: string;
  }) {
    const embedding = await this.generateEmbedding(
      `${data.title} ${data.content}`,
    );

    return this.prisma.medicalKnowledge.create({
      data: {
        ...data,
        embedding,
      },
    });
  }

  /**
   * Search knowledge base using vector similarity.
   * Uses MongoDB Atlas Vector Search for production,
   * or falls back to cosine similarity in-memory for local MongoDB.
   */
  async searchKnowledge(query: string, limit = 5): Promise<any[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    // Try MongoDB Atlas Vector Search first
    try {
      const results = await (this.prisma as any).$runCommandRaw({
        aggregate: 'MedicalKnowledge',
        pipeline: [
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: queryEmbedding,
              numCandidates: limit * 10,
              limit,
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              category: 1,
              tags: 1,
              score: { $meta: 'vectorSearchScore' },
            },
          },
        ],
        cursor: {},
      });

      return results.cursor?.firstBatch || [];
    } catch {
      // Fallback: in-memory cosine similarity for local MongoDB
      this.logger.warn('Vector search not available, using in-memory fallback');
      return this.inMemorySearch(queryEmbedding, limit);
    }
  }

  private async inMemorySearch(queryEmbedding: number[], limit: number) {
    const allDocs = await this.prisma.medicalKnowledge.findMany();

    return allDocs
      .map((doc) => {
        const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
        return { ...doc, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0,
      magA = 0,
      magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  /**
   * Get relevant medical context for a set of lab values.
   * Used to enrich AI interpretations with Bangladesh-specific knowledge.
   */
  async getContextForLabValues(
    values: { test: string; status: string }[],
  ): Promise<string> {
    const abnormalTests = values
      .filter((v) => v.status !== 'normal')
      .map((v) => v.test);

    if (abnormalTests.length === 0) return '';

    const query = `Lab test abnormal values: ${abnormalTests.join(', ')}`;
    const results = await this.searchKnowledge(query, 3);

    if (results.length === 0) return '';

    return results
      .map((r: any) => `[${r.category}] ${r.title}: ${r.content}`)
      .join('\n\n');
  }

  /**
   * Seed initial medical knowledge data.
   */
  async seedKnowledge() {
    const count = await this.prisma.medicalKnowledge.count();
    if (count > 0) {
      return { message: `Knowledge base already has ${count} entries` };
    }

    const entries = [
      {
        category: 'test_info',
        title: 'Complete Blood Count (CBC)',
        content:
          'CBC measures different components of blood including RBC, WBC, hemoglobin, hematocrit, and platelets. In Bangladesh, normal hemoglobin is 12-16 g/dL for women and 14-18 g/dL for men. Low hemoglobin is common due to iron deficiency and thalassemia trait.',
        tags: ['cbc', 'blood', 'hemoglobin', 'anemia'],
      },
      {
        category: 'test_info',
        title: 'Liver Function Tests (LFT)',
        content:
          'LFTs include ALT (SGPT), AST (SGOT), ALP, bilirubin, and albumin. In Bangladesh, elevated liver enzymes may indicate viral hepatitis (common in the region), fatty liver, or medication side effects. Normal ALT is 7-56 U/L.',
        tags: ['liver', 'alt', 'ast', 'bilirubin', 'hepatitis'],
      },
      {
        category: 'test_info',
        title: 'Blood Sugar / HbA1c',
        content:
          'Fasting blood sugar normal range is 70-100 mg/dL. HbA1c below 5.7% is normal. Bangladesh has a high diabetes prevalence (12.4%). South Asian populations develop diabetes at lower BMI thresholds.',
        tags: ['diabetes', 'blood sugar', 'hba1c', 'glucose'],
      },
      {
        category: 'diet',
        title: 'Iron-rich Bangladeshi foods',
        content:
          'For iron deficiency: kanchakola (raw banana), kolmi shaak (water spinach), pui shaak, lal shaak (red amaranth), masur dal, beef liver, and dark chicken meat. Pair with vitamin C (lemon, amla) for better absorption. Avoid tea with meals.',
        tags: ['iron', 'anemia', 'diet', 'bangladesh'],
      },
      {
        category: 'diet',
        title: 'Diabetic diet for Bangladesh',
        content:
          'Replace white rice with brown rice or mixed grain roti. Include bitter gourd (korola), fenugreek seeds (methi), and turmeric. Avoid excessive mango, jackfruit, and sweets. Small frequent meals. 30 min daily walking.',
        tags: ['diabetes', 'diet', 'bangladesh', 'blood sugar'],
      },
      {
        category: 'condition',
        title: 'Thalassemia in Bangladesh',
        content:
          'Bangladesh has 7% thalassemia carrier rate. Thalassemia minor causes mild anemia with low MCV/MCH but normal iron levels. Do NOT give iron supplements unless iron deficiency is confirmed.',
        tags: ['thalassemia', 'anemia', 'genetic', 'bangladesh'],
      },
      {
        category: 'test_info',
        title: 'Kidney Function (Creatinine, BUN, eGFR)',
        content:
          'Normal creatinine: 0.7-1.3 mg/dL for men, 0.6-1.1 mg/dL for women. eGFR above 90 is normal. In Bangladesh, CKD prevalence is 17%. High creatinine with low eGFR indicates kidney damage.',
        tags: ['kidney', 'creatinine', 'egfr', 'ckd'],
      },
      {
        category: 'test_info',
        title: 'Thyroid Function (TSH, T3, T4)',
        content:
          'Normal TSH: 0.4-4.0 mIU/L. High TSH = hypothyroidism (common in women). Low TSH = hyperthyroidism. Iodine deficiency improved with iodized salt in Bangladesh. Thyroid issues affect 1 in 8 women.',
        tags: ['thyroid', 'tsh', 'hypothyroid', 'hyperthyroid'],
      },
    ];

    for (const entry of entries) {
      await this.addKnowledge({ ...entry, source: 'seed' });
    }

    return { message: `Seeded ${entries.length} knowledge entries` };
  }

  async listKnowledge(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.medicalKnowledge.findMany({
      where,
      select: {
        id: true,
        category: true,
        title: true,
        content: true,
        tags: true,
        source: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
