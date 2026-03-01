import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { KNOWLEDGE_SEED_ENTRIES } from './knowledge-seed-data.js';

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
      model: 'gemini-embedding-001',
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
   * Get relevant medical context for ECG findings.
   * Searches for ECG conditions, cardiac knowledge, and Bangladesh-specific context.
   */
  async getContextForECGFindings(
    findings: { parameter: string; status: string; value: string }[],
  ): Promise<string> {
    const abnormalFindings = findings.filter((f) => f.status !== 'normal');
    if (abnormalFindings.length === 0) return '';

    const descriptions = abnormalFindings.map(
      (f) => `${f.parameter}: ${f.value} (${f.status})`,
    );
    const query = `ECG abnormal findings cardiac: ${descriptions.join(', ')}`;
    const results = await this.searchKnowledge(query, 3);

    if (results.length === 0) return '';

    return results
      .map((r: any) => `[${r.category}] ${r.title}: ${r.content}`)
      .join('\n\n');
  }

  /**
   * Get relevant medical context for imaging findings.
   * Searches for radiology knowledge, modality-specific info, and Bangladesh context.
   */
  async getContextForImagingFindings(
    findings: { location: string; description: string; significance: string }[],
    modality: string,
  ): Promise<string> {
    const significantFindings = findings.filter(
      (f) => f.significance !== 'normal',
    );
    if (significantFindings.length === 0) return '';

    const descriptions = significantFindings
      .map((f) => `${f.location}: ${f.description}`)
      .slice(0, 3); // limit to top 3 for query relevance
    const query = `${modality} imaging findings: ${descriptions.join('; ')}`;
    const results = await this.searchKnowledge(query, 3);

    if (results.length === 0) return '';

    return results
      .map((r: any) => `[${r.category}] ${r.title}: ${r.content}`)
      .join('\n\n');
  }

  /**
   * Seed medical knowledge data on startup.
   * Skips if entries already exist in the database.
   */
  async seedKnowledge() {
    const count = await this.prisma.medicalKnowledge.count();
    if (count > 0) {
      this.logger.log(`Knowledge base already has ${count} entries, skipping seed.`);
      return { message: `Knowledge base already has ${count} entries` };
    }

    if (!this.genAI) {
      this.logger.warn('Gemini API key not configured, skipping knowledge seed.');
      return { message: 'Gemini API key required for seeding (embeddings)' };
    }

    const entries = KNOWLEDGE_SEED_ENTRIES;
    this.logger.log(`Seeding ${entries.length} medical knowledge entries...`);

    let success = 0;
    for (const entry of entries) {
      try {
        await this.addKnowledge({ ...entry, source: entry.source || 'seed' });
        success++;
      } catch (err: any) {
        // If rate-limited, wait and retry once
        if (err.message?.includes('429') || err.message?.includes('quota')) {
          this.logger.warn('Rate limited during seed, waiting 10s...');
          await new Promise((r) => setTimeout(r, 10000));
          try {
            await this.addKnowledge({ ...entry, source: entry.source || 'seed' });
            success++;
          } catch {
            this.logger.error(`Failed to seed: ${entry.title}`);
          }
        } else {
          this.logger.error(`Failed to seed: ${entry.title} — ${err.message}`);
        }
      }
      // Small delay to avoid Gemini embedding rate limits
      await new Promise((r) => setTimeout(r, 150));
    }

    this.logger.log(`Seeded ${success}/${entries.length} knowledge entries.`);
    return { message: `Seeded ${success}/${entries.length} knowledge entries` };
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
