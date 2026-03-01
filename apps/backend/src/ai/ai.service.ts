import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import {
  REPORT_DETECTION_PROMPT,
  LAB_REPORT_EXTRACTION_PROMPT,
  buildLabReportInterpretationPrompt,
  ECG_EXTRACTION_PROMPT,
  buildECGInterpretationPrompt,
  buildImagingExtractionPrompt,
  buildImagingInterpretationPrompt,
} from './prompts/index.js';

export type AIModel =
  | 'gemini-flash'
  | 'gemini-pro'
  | 'llama-3.3'
  | 'llama-3.1'
  | 'mixtral';

export interface LabValue {
  test: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export type ReportType = 'LAB_REPORT' | 'ECG' | 'IMAGING';

export interface ExtractionResult {
  values: LabValue[];
  labName?: string;
  reportDate?: string;
  patientName?: string;
  rawText: string;
}

export interface ECGFinding {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
}

export interface ECGExtractionResult {
  ecgFindings: ECGFinding[];
  interpretation: string;
  labName?: string;
  reportDate?: string;
  patientName?: string;
  rawText: string;
}

export interface ImagingFinding {
  location: string;
  description: string;
  significance: 'normal' | 'benign' | 'concerning' | 'critical';
}

export interface ImagingExtractionResult {
  imagingModality: string;
  bodyRegion: string;
  imagingFindings: ImagingFinding[];
  impression: string;
  labName?: string;
  reportDate?: string;
  patientName?: string;
  rawText: string;
}

export interface InterpretationResult {
  diagnosis: string[];
  diagnosisBn: string[];
  diagnosisStatus: 'all_clear' | 'mild' | 'moderate' | 'serious';
  summary: string;
  summaryBn: string;
  keyFindings: string[];
  riskScore: number;
  recommendations: {
    diet: string[];
    lifestyle: string[];
    followUp: string[];
  };
  criticalValues: string[];
}

export interface TrendPoint {
  date: string;
  value: number;
  status: string;
}

export interface TrendAnalysis {
  test: string;
  unit: string;
  dataPoints: TrendPoint[];
  trend: 'improving' | 'worsening' | 'stable' | 'insufficient_data';
  analysis: string;
}

const MODEL_MAP: Record<
  AIModel,
  { provider: 'gemini' | 'groq'; modelId: string; label: string }
> = {
  'gemini-flash': {
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (Free)',
  },
  'gemini-pro': {
    provider: 'gemini',
    modelId: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro (Free)',
  },
  'llama-3.3': {
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B (Free via Groq)',
  },
  'llama-3.1': {
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B (Free via Groq)',
  },
  mixtral: {
    provider: 'groq',
    modelId: 'mixtral-8x7b-32768',
    label: 'Mixtral 8x7B (Free via Groq)',
  },
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;

  constructor(private readonly configService: ConfigService) {
    const geminiKey = this.configService.get('GEMINI_API_KEY', '');
    if (geminiKey && !geminiKey.startsWith('YOUR_')) {
      this.genAI = new GoogleGenerativeAI(geminiKey);
      this.logger.log('Gemini AI initialized');
    }

    const groqKey = this.configService.get('GROQ_API_KEY', '');
    if (groqKey && !groqKey.startsWith('YOUR_')) {
      this.groq = new Groq({ apiKey: groqKey });
      this.logger.log('Groq AI initialized');
    }
  }

  getAvailableModels(): {
    id: AIModel;
    label: string;
    provider: string;
    available: boolean;
  }[] {
    return Object.entries(MODEL_MAP).map(([id, config]) => ({
      id: id as AIModel,
      label: config.label,
      provider: config.provider,
      available: config.provider === 'gemini' ? !!this.genAI : !!this.groq,
    }));
  }

  private async callGemini(
    prompt: string,
    imageData?: { base64: string; mimeType: string },
    modelId = 'gemini-2.5-flash',
  ): Promise<string> {
    if (!this.genAI) throw new Error('Gemini API key not configured');

    const model = this.genAI.getGenerativeModel({
      model: modelId,
      generationConfig: { temperature: 0.1 },
    });

    const parts: any[] = [prompt];
    if (imageData) {
      parts.push({
        inlineData: { mimeType: imageData.mimeType, data: imageData.base64 },
      });
    }

    const result = await model.generateContent(parts);
    return result.response.text();
  }

  private async callGroq(
    prompt: string,
    modelId = 'llama-3.3-70b-versatile',
  ): Promise<string> {
    if (!this.groq) throw new Error('Groq API key not configured');

    const completion = await this.groq.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    });

    return completion.choices[0]?.message?.content || '';
  }

  private async callModel(
    prompt: string,
    model: AIModel = 'gemini-flash',
    imageData?: { base64: string; mimeType: string },
  ): Promise<string> {
    const config = MODEL_MAP[model];
    if (!config) throw new Error(`Unknown model: ${model}`);

    // For image-based tasks, only Gemini supports vision
    if (imageData && config.provider !== 'gemini') {
      this.logger.warn(
        `Model ${model} doesn't support vision. Falling back to Gemini.`,
      );
      return this.callGeminiWithFallback(prompt, imageData);
    }

    if (config.provider === 'gemini') {
      // Use fallback chain for Gemini models (handles quota errors)
      try {
        return await this.callGemini(prompt, imageData, config.modelId);
      } catch (err: any) {
        if (this.isQuotaError(err)) {
          this.logger.warn(
            `Gemini ${config.modelId} quota exceeded, trying fallback models...`,
          );
          // Try other Gemini models, then Groq
          for (const fallbackId of this.GEMINI_FALLBACK_MODELS) {
            if (fallbackId === config.modelId) continue;
            try {
              return await this.callGemini(prompt, imageData, fallbackId);
            } catch (fallbackErr: any) {
              if (this.isQuotaError(fallbackErr)) continue;
              throw fallbackErr;
            }
          }
          // All Gemini models exhausted — try Groq (text-only, no images)
          if (!imageData && this.groq) {
            this.logger.warn('All Gemini models exhausted, falling back to Groq');
            return this.callGroq(prompt);
          }
        }
        throw err;
      }
    }

    return this.callGroq(prompt, config.modelId);
  }

  private extractJson(text: string): any {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }
    return JSON.parse(jsonMatch[0]);
  }

  private isQuotaError(err: any): boolean {
    const msg = (err?.message || '').toLowerCase();
    return (
      msg.includes('429') ||
      msg.includes('quota') ||
      msg.includes('rate limit') ||
      msg.includes('too many requests') ||
      msg.includes('resource exhausted')
    );
  }

  // Different Gemini models have separate quotas — try them in order
  private readonly GEMINI_FALLBACK_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ];

  /**
   * Call Gemini with automatic model fallback on quota errors.
   */
  private async callGeminiWithFallback(
    prompt: string,
    imageData?: { base64: string; mimeType: string },
  ): Promise<string> {
    let lastError: any;

    for (const modelId of this.GEMINI_FALLBACK_MODELS) {
      try {
        return await this.callGemini(prompt, imageData, modelId);
      } catch (err: any) {
        lastError = err;
        if (this.isQuotaError(err)) {
          this.logger.warn(
            `Gemini ${modelId} quota exceeded, trying next model...`,
          );
          continue;
        }
        throw err; // Non-quota error — don't retry
      }
    }

    throw lastError;
  }

  // OCR extraction — tries multiple Gemini models on quota errors
  async extractLabValues(imagePath: string): Promise<ExtractionResult> {
    if (!this.genAI)
      throw new Error('Gemini API key required for image extraction');

    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const responseText = await this.callGeminiWithFallback(
      LAB_REPORT_EXTRACTION_PROMPT,
      { base64, mimeType },
    );
    return this.extractJson(responseText) as ExtractionResult;
  }

  // OCR from URL (for Cloudinary-hosted images)
  async extractLabValuesFromUrl(imageUrl: string): Promise<ExtractionResult> {
    if (!this.genAI)
      throw new Error('Gemini API key required for image extraction');

    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    const responseText = await this.callGeminiWithFallback(
      LAB_REPORT_EXTRACTION_PROMPT,
      { base64, mimeType: contentType },
    );
    return this.extractJson(responseText) as ExtractionResult;
  }

  // PDF extraction via Gemini
  async extractLabValuesFromPdf(
    pdfBuffer: Buffer,
  ): Promise<ExtractionResult> {
    if (!this.genAI)
      throw new Error('Gemini API key required for PDF extraction');

    const base64 = pdfBuffer.toString('base64');

    const responseText = await this.callGeminiWithFallback(
      LAB_REPORT_EXTRACTION_PROMPT,
      { base64, mimeType: 'application/pdf' },
    );
    return this.extractJson(responseText) as ExtractionResult;
  }

  // ── Report Type Detection ──

  async detectReportType(
    imageData: { base64: string; mimeType: string },
  ): Promise<ReportType> {
    const responseText = await this.callGeminiWithFallback(
      REPORT_DETECTION_PROMPT,
      imageData,
    );
    const cleaned = responseText.trim().toUpperCase().replace(/[^A-Z_]/g, '');
    if (cleaned === 'ECG') return 'ECG';
    if (cleaned === 'IMAGING') return 'IMAGING';
    return 'LAB_REPORT';
  }

  // ── ECG Extraction ──

  async extractECGValues(
    imageData: { base64: string; mimeType: string },
  ): Promise<ECGExtractionResult> {
    const responseText = await this.callGeminiWithFallback(
      ECG_EXTRACTION_PROMPT,
      imageData,
    );
    return this.extractJson(responseText) as ECGExtractionResult;
  }

  // ── Imaging Extraction ──

  async extractImagingFindings(
    imageData: { base64: string; mimeType: string },
  ): Promise<ImagingExtractionResult> {
    const responseText = await this.callGeminiWithFallback(
      buildImagingExtractionPrompt(),
      imageData,
    );
    return this.extractJson(responseText) as ImagingExtractionResult;
  }

  // ── ECG Interpretation ──

  async interpretECGResults(
    ecgFindings: ECGFinding[],
    healthProfile?: {
      age?: number | null;
      gender?: string | null;
      conditions?: string[];
      medications?: string[];
    },
    userRole?: string,
    knowledgeContext?: string,
  ): Promise<InterpretationResult> {
    const prompt = buildECGInterpretationPrompt(ecgFindings, healthProfile, userRole, knowledgeContext);
    const responseText = await this.callModel(prompt, 'gemini-flash');
    return this.extractJson(responseText) as InterpretationResult;
  }

  // ── Imaging Interpretation ──

  async interpretImagingResults(
    imagingFindings: ImagingFinding[],
    impression: string,
    modality: string,
    healthProfile?: {
      age?: number | null;
      gender?: string | null;
      conditions?: string[];
      medications?: string[];
    },
    userRole?: string,
    knowledgeContext?: string,
  ): Promise<InterpretationResult> {
    const prompt = buildImagingInterpretationPrompt(
      imagingFindings,
      impression,
      modality,
      healthProfile,
      userRole,
      knowledgeContext,
    );
    const responseText = await this.callModel(prompt, 'gemini-flash');
    return this.extractJson(responseText) as InterpretationResult;
  }

  // Interpretation can use any model
  async interpretResults(
    values: LabValue[],
    healthProfile?: {
      age?: number | null;
      gender?: string | null;
      conditions?: string[];
      medications?: string[];
    },
    model: AIModel = 'gemini-flash',
    knowledgeContext?: string,
    _personaModifier?: string,
    userRole?: string,
  ): Promise<InterpretationResult> {
    const prompt = buildLabReportInterpretationPrompt(
      values,
      healthProfile,
      userRole,
      knowledgeContext,
    );
    const responseText = await this.callModel(prompt, model);
    return this.extractJson(responseText) as InterpretationResult;
  }

  async compareReports(
    reportAValues: LabValue[],
    reportBValues: LabValue[],
    reportADate: string,
    reportBDate: string,
    model: AIModel = 'gemini-flash',
  ): Promise<{
    comparison: string;
    improvements: string[];
    deteriorations: string[];
    unchanged: string[];
  }> {
    const prompt = `Compare these two lab reports and identify changes.

Report A (${reportADate}):
${JSON.stringify(reportAValues, null, 2)}

Report B (${reportBDate}):
${JSON.stringify(reportBValues, null, 2)}

Return ONLY valid JSON:
{
  "comparison": "Overall comparison summary",
  "improvements": ["Test X improved from Y to Z"],
  "deteriorations": ["Test X worsened from Y to Z"],
  "unchanged": ["Test X remained stable at Y"]
}`;

    const responseText = await this.callModel(prompt, model);
    return this.extractJson(responseText);
  }

  async analyzeTrends(
    testName: string,
    dataPoints: TrendPoint[],
    model: AIModel = 'gemini-flash',
  ): Promise<TrendAnalysis> {
    if (dataPoints.length < 2) {
      return {
        test: testName,
        unit: '',
        dataPoints,
        trend: 'insufficient_data',
        analysis:
          'Not enough data points to analyze trends. At least 2 reports needed.',
      };
    }

    const prompt = `Analyze the trend for this lab test over time.

Test: ${testName}
Data points: ${JSON.stringify(dataPoints)}

Return ONLY valid JSON:
{
  "test": "${testName}",
  "unit": "unit from data",
  "dataPoints": ${JSON.stringify(dataPoints)},
  "trend": "improving|worsening|stable",
  "analysis": "Brief analysis of the trend and what it means"
}`;

    const responseText = await this.callModel(prompt, model);
    return this.extractJson(responseText) as TrendAnalysis;
  }
}
