import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { UploadService } from '../upload/upload.service.js';
import { EmailService } from '../email/email.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { QueryLabReportsDto } from './dto/query-lab-reports.dto.js';
import type {
  LabValue,
  ExtractionResult,
  ReportType,
  ECGFinding,
  ECGExtractionResult,
  ImagingFinding,
  ImagingExtractionResult,
} from '../ai/ai.service.js';

@Injectable()
export class LabReportsService {
  private readonly logger = new Logger(LabReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly uploadService: UploadService,
    private readonly emailService: EmailService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async create(
    userId: string,
    files: Express.Multer.File[],
    title?: string,
    reportType?: string,
    patientContext?: {
      patientAge?: number;
      patientGender?: string;
      clinicalHistory?: string;
    },
  ) {
    const imageUrls: string[] = [];
    for (const file of files) {
      const fileResult = await this.uploadService.saveFile(file);
      const url = fileResult.startsWith('http')
        ? fileResult
        : this.uploadService.getFileUrl(fileResult);
      imageUrls.push(url);
    }

    const validType = this.validateReportType(reportType);
    const defaultTitle =
      validType === 'ECG'
        ? `ECG Report - ${new Date().toLocaleDateString()}`
        : validType === 'IMAGING'
          ? `Imaging Report - ${new Date().toLocaleDateString()}`
          : `Lab Report - ${new Date().toLocaleDateString()}`;

    const report = await (this.prisma.labReport as any).create({
      data: {
        userId,
        title: title || defaultTitle,
        reportType: validType,
        patientAge: patientContext?.patientAge || null,
        patientGender: patientContext?.patientGender || null,
        clinicalHistory: patientContext?.clinicalHistory || null,
        imageUrl: imageUrls[0],
        imageUrls,
        status: 'PENDING',
      },
    });

    this.processReport(
      report.id,
      userId,
      imageUrls,
      files,
      validType,
    ).catch((err) => {
      this.logger.error(
        `Failed to process report ${report.id}: ${err.message}`,
      );
    });

    return report;
  }

  private validateReportType(type?: string): ReportType {
    if (type === 'ECG') return 'ECG';
    if (type === 'IMAGING') return 'IMAGING';
    return 'LAB_REPORT';
  }

  private toFriendlyError(error: any): string {
    const msg = (error?.message || '').toLowerCase();
    if (
      msg.includes('quota') ||
      msg.includes('rate limit') ||
      msg.includes('429') ||
      msg.includes('too many requests') ||
      msg.includes('resource exhausted')
    )
      return 'AI service is currently busy. Please wait a moment and try again.';
    if (msg.includes('not found') || msg.includes('404'))
      return 'AI service temporarily unavailable. Please try again.';
    if (msg.includes('timeout') || msg.includes('deadline'))
      return 'Analysis is taking longer than expected. Please try again.';
    if (msg.includes('invalid') && msg.includes('image'))
      return 'Could not read the report image. Please upload a clearer photo.';
    if (msg.includes('api key') || msg.includes('authentication') || msg.includes('unauthorized'))
      return 'AI service is not configured. Please contact support.';
    if (msg.includes('json'))
      return 'AI could not parse the report. Please upload a clearer photo.';
    if (msg.includes('500') || msg.includes('internal server error') || msg.includes('503'))
      return 'AI service is experiencing issues. Please try again shortly.';
    return 'Something went wrong while analyzing your report. Please try again.';
  }

  /**
   * Known reference ranges for common lab tests.
   * Used to VERIFY and CORRECT AI-assigned status.
   */
  private static readonly LAB_REFERENCE_RANGES: Record<
    string,
    { low: number; high: number; critical_low?: number; critical_high?: number; unit: string }
  > = {
    // CBC
    hemoglobin: { low: 12, high: 17.5, critical_low: 7, critical_high: 20, unit: 'g/dL' },
    hematocrit: { low: 36, high: 54, critical_low: 20, critical_high: 60, unit: '%' },
    wbc: { low: 4000, high: 11000, critical_low: 2000, critical_high: 30000, unit: '/µL' },
    'white blood cell': { low: 4, high: 11, critical_low: 2, critical_high: 30, unit: 'x10³/µL' },
    rbc: { low: 4.2, high: 6.1, critical_low: 2.5, critical_high: 8, unit: 'M/µL' },
    platelets: { low: 150000, high: 400000, critical_low: 50000, critical_high: 1000000, unit: '/µL' },
    'platelet count': { low: 150, high: 400, critical_low: 50, critical_high: 1000, unit: 'x10³/µL' },
    mcv: { low: 80, high: 100, unit: 'fL' },
    mch: { low: 27, high: 33, unit: 'pg' },
    mchc: { low: 32, high: 36, unit: 'g/dL' },
    // Metabolic
    glucose: { low: 70, high: 100, critical_low: 40, critical_high: 500, unit: 'mg/dL' },
    'fasting glucose': { low: 70, high: 100, critical_low: 40, critical_high: 500, unit: 'mg/dL' },
    'random glucose': { low: 70, high: 140, critical_low: 40, critical_high: 500, unit: 'mg/dL' },
    hba1c: { low: 4, high: 5.6, critical_high: 14, unit: '%' },
    creatinine: { low: 0.6, high: 1.2, critical_high: 10, unit: 'mg/dL' },
    bun: { low: 7, high: 20, critical_high: 100, unit: 'mg/dL' },
    urea: { low: 15, high: 45, critical_high: 200, unit: 'mg/dL' },
    sodium: { low: 136, high: 145, critical_low: 120, critical_high: 160, unit: 'mEq/L' },
    potassium: { low: 3.5, high: 5, critical_low: 2.5, critical_high: 6.5, unit: 'mEq/L' },
    calcium: { low: 8.5, high: 10.5, critical_low: 6, critical_high: 14, unit: 'mg/dL' },
    chloride: { low: 96, high: 106, unit: 'mEq/L' },
    bicarbonate: { low: 22, high: 28, critical_low: 10, critical_high: 40, unit: 'mEq/L' },
    // Liver
    alt: { low: 7, high: 56, critical_high: 1000, unit: 'U/L' },
    sgpt: { low: 7, high: 56, critical_high: 1000, unit: 'U/L' },
    ast: { low: 10, high: 40, critical_high: 1000, unit: 'U/L' },
    sgot: { low: 10, high: 40, critical_high: 1000, unit: 'U/L' },
    'alkaline phosphatase': { low: 44, high: 147, unit: 'U/L' },
    alp: { low: 44, high: 147, unit: 'U/L' },
    'total bilirubin': { low: 0.1, high: 1.2, critical_high: 15, unit: 'mg/dL' },
    bilirubin: { low: 0.1, high: 1.2, critical_high: 15, unit: 'mg/dL' },
    albumin: { low: 3.5, high: 5.5, critical_low: 1.5, unit: 'g/dL' },
    'total protein': { low: 6, high: 8.3, unit: 'g/dL' },
    // Lipid
    'total cholesterol': { low: 0, high: 200, critical_high: 500, unit: 'mg/dL' },
    cholesterol: { low: 0, high: 200, critical_high: 500, unit: 'mg/dL' },
    ldl: { low: 0, high: 100, critical_high: 300, unit: 'mg/dL' },
    hdl: { low: 40, high: 100, unit: 'mg/dL' },
    triglycerides: { low: 0, high: 150, critical_high: 1000, unit: 'mg/dL' },
    // Thyroid
    tsh: { low: 0.4, high: 4, critical_low: 0.01, critical_high: 100, unit: 'mIU/L' },
    't3': { low: 80, high: 200, unit: 'ng/dL' },
    't4': { low: 5, high: 12, unit: 'µg/dL' },
    'free t4': { low: 0.8, high: 1.8, unit: 'ng/dL' },
    'free t3': { low: 2.3, high: 4.2, unit: 'pg/mL' },
    // Iron
    iron: { low: 60, high: 170, unit: 'µg/dL' },
    ferritin: { low: 12, high: 300, critical_high: 1000, unit: 'ng/mL' },
    tibc: { low: 250, high: 370, unit: 'µg/dL' },
    // Coagulation
    pt: { low: 11, high: 13.5, critical_high: 30, unit: 'seconds' },
    inr: { low: 0.8, high: 1.1, critical_high: 5, unit: '' },
    aptt: { low: 25, high: 35, critical_high: 100, unit: 'seconds' },
    // Kidney
    'uric acid': { low: 3.5, high: 7.2, critical_high: 15, unit: 'mg/dL' },
    egfr: { low: 90, high: 200, critical_low: 15, unit: 'mL/min' },
    // Inflammation
    esr: { low: 0, high: 20, unit: 'mm/hr' },
    crp: { low: 0, high: 5, critical_high: 200, unit: 'mg/L' },
  };

  /**
   * Match a test name to known reference ranges (fuzzy matching).
   */
  private matchLabReference(testName: string): { low: number; high: number; critical_low?: number; critical_high?: number; unit: string } | null {
    const normalized = testName.toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[()]/g, '');

    // Exact match
    if (LabReportsService.LAB_REFERENCE_RANGES[normalized]) {
      return LabReportsService.LAB_REFERENCE_RANGES[normalized];
    }

    // Partial match — check if any key is contained in the test name
    for (const [key, range] of Object.entries(LabReportsService.LAB_REFERENCE_RANGES)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return range;
      }
    }

    return null;
  }

  /**
   * Validate and correct AI-assigned status against known reference ranges.
   * This catches the most common AI accuracy issue: wrong status assignment.
   */
  private validateLabValueStatus(v: LabValue): LabValue {
    const numericValue = typeof v.value === 'number' ? v.value : parseFloat(String(v.value));
    if (isNaN(numericValue)) return v; // Non-numeric values can't be validated

    const ref = this.matchLabReference(v.test);
    if (!ref) return v; // No reference range found — trust AI

    let correctedStatus: LabValue['status'] = 'normal';

    if (ref.critical_low !== undefined && numericValue < ref.critical_low) {
      correctedStatus = 'critical';
    } else if (ref.critical_high !== undefined && numericValue > ref.critical_high) {
      correctedStatus = 'critical';
    } else if (numericValue < ref.low) {
      correctedStatus = 'low';
    } else if (numericValue > ref.high) {
      correctedStatus = 'high';
    }

    if (correctedStatus !== v.status) {
      this.logger.warn(
        `Status correction: ${v.test} = ${v.value} → AI said "${v.status}", corrected to "${correctedStatus}" (range: ${ref.low}-${ref.high})`,
      );
    }

    return { ...v, status: correctedStatus };
  }

  /**
   * Normalize extracted lab values: lowercase status, trim strings, validate
   * against known reference ranges, and correct AI mistakes.
   */
  private normalizeLabValues(values: LabValue[]): LabValue[] {
    const validStatuses = new Set(['normal', 'high', 'low', 'critical']);

    // Step 1: Basic normalization
    const normalized = values.map((v) => {
      const status = (v.status || 'normal').toString().toLowerCase().trim();
      return {
        ...v,
        test: (v.test || '').trim(),
        unit: (v.unit || '').trim(),
        referenceRange: (v.referenceRange || 'N/A').trim(),
        status: validStatuses.has(status)
          ? (status as LabValue['status'])
          : 'normal',
      };
    });

    // Step 2: Validate status against known reference ranges
    const validated = normalized.map((v) => this.validateLabValueStatus(v));

    // Step 3: Deduplicate (AI sometimes extracts same test twice)
    const seen = new Map<string, LabValue>();
    for (const v of validated) {
      const key = v.test.toLowerCase();
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, v);
      } else {
        // Keep the one with worse status (more conservative)
        const statusPriority: Record<string, number> = { critical: 0, high: 1, low: 2, normal: 3 };
        if ((statusPriority[v.status] ?? 3) < (statusPriority[existing.status] ?? 3)) {
          seen.set(key, v);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Compute risk score deterministically from lab values.
   * CRITICAL: +20, HIGH: +8, LOW: +5, NORMAL: +0. Cap at 100.
   */
  private computeRiskScore(values: LabValue[]): number {
    let score = 0;
    for (const v of values) {
      if (v.status === 'critical') score += 20;
      else if (v.status === 'high') score += 8;
      else if (v.status === 'low') score += 5;
    }
    return Math.min(score, 100);
  }

  /**
   * Compute diagnosis status deterministically from lab values.
   */
  private computeDiagnosisStatus(
    values: LabValue[],
  ): 'all_clear' | 'mild' | 'moderate' | 'serious' {
    const hasCritical = values.some((v) => v.status === 'critical');
    const highCount = values.filter((v) => v.status === 'high').length;
    const lowCount = values.filter((v) => v.status === 'low').length;
    const abnormalCount = highCount + lowCount;

    if (hasCritical) return 'serious';
    if (highCount >= 3 || abnormalCount >= 5) return 'moderate';
    if (abnormalCount > 0) return 'mild';
    return 'all_clear';
  }

  /**
   * Compute risk score for ECG findings.
   * ABNORMAL: +10, CRITICAL: +25. Cap at 100.
   */
  private computeECGRiskScore(findings: ECGFinding[]): number {
    let score = 0;
    for (const f of findings) {
      if (f.status === 'critical') score += 25;
      else if (f.status === 'abnormal') score += 10;
    }
    return Math.min(score, 100);
  }

  /**
   * Compute diagnosis status for ECG findings.
   */
  private computeECGDiagnosisStatus(
    findings: ECGFinding[],
  ): 'all_clear' | 'mild' | 'moderate' | 'serious' {
    const hasCritical = findings.some((f) => f.status === 'critical');
    const abnormalCount = findings.filter((f) => f.status === 'abnormal').length;
    if (hasCritical) return 'serious';
    if (abnormalCount >= 3) return 'moderate';
    if (abnormalCount > 0) return 'mild';
    return 'all_clear';
  }

  /**
   * Critical keywords in imaging descriptions that should force severity upgrade.
   * If AI says "normal" or "benign" but the description contains these words,
   * the finding is upgraded to at least "concerning" or "critical".
   */
  private static readonly CRITICAL_IMAGING_KEYWORDS = [
    'hemorrhage', 'haemorrhage', 'bleeding', 'hematoma', 'haematoma',
    'infarct', 'ischemi', 'ischaemi', 'stroke',
    'dissection', 'aneurysm', 'rupture',
    'mass', 'tumor', 'tumour', 'malignant', 'metastas', 'carcinoma', 'neoplasm',
    'fracture', 'dislocation',
    'pneumothorax', 'hemothorax',
    'obstruction', 'perforation', 'volvulus', 'intussusception',
    'abscess', 'empyema',
    'herniation', 'midline shift', 'mass effect',
    'hydrocephalus', 'edema', 'oedema',
    'pulmonary embolism', 'thrombosis', 'thrombus',
    'cord compression', 'cauda equina',
    'tamponade', 'pericardial effusion',
  ];

  private static readonly CONCERNING_IMAGING_KEYWORDS = [
    'stenosis', 'narrowing',
    'nodule', 'lesion', 'opacity',
    'effusion', 'collection', 'fluid',
    'thickening', 'enhancement', 'hyperinten',
    'dilatation', 'dilated', 'enlarged',
    'restricted diffusion',
    'disc herniation', 'protrusion', 'extrusion',
    'compression', 'impingement',
    'calcification', 'calcified',
    'lymphadenopathy',
    'leukomalacia', 'gliosis',
    'atrophy',
  ];

  /**
   * Validate imaging findings — upgrade severity if description contains
   * critical/concerning keywords that the AI marked as normal/benign.
   */
  private validateImagingFindings(findings: ImagingFinding[]): ImagingFinding[] {
    return findings.map((f) => {
      const desc = (f.description || '').toLowerCase();
      const loc = (f.location || '').toLowerCase();
      const text = `${desc} ${loc}`;

      // Check for critical keywords
      if (f.significance === 'normal' || f.significance === 'benign') {
        const hasCriticalKeyword = LabReportsService.CRITICAL_IMAGING_KEYWORDS
          .some((kw) => text.includes(kw));
        if (hasCriticalKeyword) {
          this.logger.warn(
            `Imaging severity upgrade: "${f.location}" → "${f.significance}" upgraded to "critical" (keyword match in: ${f.description.substring(0, 60)}...)`,
          );
          return { ...f, significance: 'critical' as const };
        }
      }

      // Check for concerning keywords
      if (f.significance === 'normal' || f.significance === 'benign') {
        const hasConcerningKeyword = LabReportsService.CONCERNING_IMAGING_KEYWORDS
          .some((kw) => text.includes(kw));
        if (hasConcerningKeyword) {
          this.logger.warn(
            `Imaging severity upgrade: "${f.location}" → "${f.significance}" upgraded to "concerning" (keyword match)`,
          );
          return { ...f, significance: 'concerning' as const };
        }
      }

      return f;
    });
  }

  /**
   * Compute risk score for imaging findings.
   * CONCERNING: +12, CRITICAL: +25. Cap at 100.
   */
  private computeImagingRiskScore(findings: ImagingFinding[]): number {
    let score = 0;
    for (const f of findings) {
      if (f.significance === 'critical') score += 25;
      else if (f.significance === 'concerning') score += 12;
    }
    return Math.min(score, 100);
  }

  /**
   * Compute diagnosis status for imaging findings.
   */
  private computeImagingDiagnosisStatus(
    findings: ImagingFinding[],
  ): 'all_clear' | 'mild' | 'moderate' | 'serious' {
    const hasCritical = findings.some((f) => f.significance === 'critical');
    const concerningCount = findings.filter(
      (f) => f.significance === 'concerning',
    ).length;
    if (hasCritical) return 'serious';
    if (concerningCount >= 3) return 'moderate';
    if (concerningCount > 0) return 'mild';
    return 'all_clear';
  }

  private isPdf(file: Express.Multer.File): boolean {
    return (
      file.mimetype === 'application/pdf' ||
      file.originalname?.toLowerCase().endsWith('.pdf')
    );
  }

  /**
   * Get image data (base64 + mimeType) from a file or URL.
   */
  private async getImageData(
    file: Express.Multer.File | undefined,
    url: string,
  ): Promise<{ base64: string; mimeType: string }> {
    if (file) {
      const base64 = file.buffer.toString('base64');
      const mimeType = file.mimetype || 'image/jpeg';
      return { base64, mimeType };
    }
    if (url.startsWith('http')) {
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      return { base64: buffer.toString('base64'), mimeType };
    }
    const fs = await import('fs');
    const filePath = this.uploadService.getFilePath(url);
    const buffer = fs.readFileSync(filePath);
    const mimeType = url.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return { base64: buffer.toString('base64'), mimeType };
  }

  /**
   * Build patient context for AI from per-report fields.
   * This is used instead of healthProfile for accuracy — doctors upload reports for different patients.
   */
  private async buildPatientContext(reportId: string, userId: string): Promise<{
    age?: number | null;
    gender?: string | null;
    conditions?: string[];
    medications?: string[];
    clinicalHistory?: string | null;
  }> {
    const report = await this.prisma.labReport.findUnique({
      where: { id: reportId },
    }) as any;
    if (!report) return {};

    // Use per-report patient context first, fallback to health profile
    if (report.patientAge || report.patientGender || report.clinicalHistory) {
      return {
        age: report.patientAge,
        gender: report.patientGender,
        clinicalHistory: report.clinicalHistory,
      };
    }

    // Fallback: use logged-in user's health profile (for patients uploading own reports)
    const healthProfile = await this.prisma.healthProfile.findUnique({
      where: { userId },
    });
    if (healthProfile) {
      return {
        age: healthProfile.age,
        gender: healthProfile.gender,
        conditions: healthProfile.conditions || [],
        medications: healthProfile.medications || [],
      };
    }

    return {};
  }

  private async processReport(
    reportId: string,
    userId: string,
    imageUrls: string[],
    originalFiles: Express.Multer.File[],
    reportType: ReportType = 'LAB_REPORT',
  ) {
    try {
      await this.prisma.labReport.update({
        where: { id: reportId },
        data: { status: 'PROCESSING' },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 5,
        message: 'Scanning your report...',
      });

      // Route to type-specific processing
      if (reportType === 'ECG') {
        await this.processECGReport(reportId, userId, imageUrls, originalFiles);
      } else if (reportType === 'IMAGING') {
        await this.processImagingReport(reportId, userId, imageUrls, originalFiles);
      } else {
        await this.processLabReport(reportId, userId, imageUrls, originalFiles);
      }
    } catch (error: any) {
      this.logger.error(`Report processing failed: ${error.message}`);
      const friendlyMessage = this.toFriendlyError(error);

      await this.prisma.labReport.update({
        where: { id: reportId },
        data: {
          status: 'FAILED',
          errorMessage: friendlyMessage,
        },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:failed', {
        reportId,
        error: friendlyMessage,
      });
    }
  }

  // ── Lab Report Processing (existing flow) ──

  private async processLabReport(
    reportId: string,
    userId: string,
    imageUrls: string[],
    originalFiles: Express.Multer.File[],
  ) {
    const allValues: LabValue[] = [];
    let rawText = '';
    let labName: string | undefined;
    let reportDate: string | undefined;

    const totalFiles = imageUrls.length;
    for (let i = 0; i < totalFiles; i++) {
      const progressBase = Math.round((i / totalFiles) * 40) + 10;
      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: progressBase,
        message: `Extracting values from file ${i + 1} of ${totalFiles}...`,
      });

      const file = originalFiles[i];
      const url = imageUrls[i];
      const extraction =
        file && this.isPdf(file)
          ? await this.aiService.extractLabValuesFromPdf(file.buffer)
          : url.startsWith('http')
            ? await this.aiService.extractLabValuesFromUrl(url)
            : await this.aiService.extractLabValues(
                this.uploadService.getFilePath(url),
              );

      allValues.push(...extraction.values);
      rawText += (rawText ? '\n---\n' : '') + extraction.rawText;
      if (extraction.labName) labName = extraction.labName;
      if (extraction.reportDate) reportDate = extraction.reportDate;
    }

    const normalizedValues = this.normalizeLabValues(allValues);
    const riskScore = this.computeRiskScore(normalizedValues);
    const diagnosisStatus = this.computeDiagnosisStatus(normalizedValues);

    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 55,
      message: 'Analyzing results...',
    });

    const [patientContext, knowledgeContext, user] = await Promise.all([
      this.buildPatientContext(reportId, userId),
      this.knowledgeService
        .getContextForLabValues(normalizedValues)
        .catch(() => ''),
      this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } }),
    ]);

    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 65,
      message: 'Generating recommendations...',
    });

    let interpretation;
    try {
      interpretation = await this.aiService.interpretResults(
        normalizedValues,
        patientContext,
        'gemini-flash',
        knowledgeContext,
        undefined,
        user?.role,
      );
    } catch (primaryErr: any) {
      this.logger.warn(
        `Primary model failed for interpretation, trying Groq fallback: ${primaryErr.message}`,
      );
      interpretation = await this.aiService.interpretResults(
        normalizedValues,
        patientContext,
        'llama-3.3',
        knowledgeContext,
        undefined,
        user?.role,
      );
    }

    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 90,
      message: 'Almost done...',
    });

    await this.prisma.labReport.update({
      where: { id: reportId },
      data: {
        rawText,
        values: normalizedValues as any,
        summary: interpretation.summary,
        summaryBn: interpretation.summaryBn,
        diagnosis: interpretation.diagnosis || [],
        diagnosisBn: interpretation.diagnosisBn || [],
        diagnosisStatus,
        riskScore,
        recommendations: interpretation.recommendations as any,
        labName,
        reportDate: reportDate ? new Date(reportDate) : null,
        status: 'COMPLETED',
      },
    });

    this.realtimeGateway.emitToUser(userId, 'lab-report:completed', {
      reportId,
    });

    if (user) {
      await this.emailService.sendLabReportReadyEmail(user.email, reportId);
      if (interpretation.criticalValues.length > 0) {
        await this.emailService.sendCriticalAlertEmail(
          user.email,
          reportId,
          interpretation.criticalValues,
        );
      }
    }
  }

  // ── ECG Report Processing ──

  private async processECGReport(
    reportId: string,
    userId: string,
    imageUrls: string[],
    originalFiles: Express.Multer.File[],
  ) {
    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 10,
      message: 'Reading ECG report...',
    });

    // Extract ECG from first file (ECG reports are typically single page)
    const imageData = await this.getImageData(originalFiles[0], imageUrls[0]);
    const ecgResult = await this.aiService.extractECGValues(imageData);

    const riskScore = this.computeECGRiskScore(ecgResult.ecgFindings);
    const diagnosisStatus = this.computeECGDiagnosisStatus(ecgResult.ecgFindings);

    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 55,
      message: 'Interpreting ECG findings...',
    });

    const [patientContext, knowledgeContext, user] = await Promise.all([
      this.buildPatientContext(reportId, userId),
      this.knowledgeService
        .getContextForECGFindings(ecgResult.ecgFindings)
        .catch(() => ''),
      this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } }),
    ]);

    const interpretation = await this.aiService.interpretECGResults(
      ecgResult.ecgFindings,
      patientContext,
      user?.role,
      knowledgeContext,
    );

    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 90,
      message: 'Almost done...',
    });

    await (this.prisma.labReport as any).update({
      where: { id: reportId },
      data: {
        rawText: ecgResult.rawText,
        ecgFindings: ecgResult.ecgFindings as any,
        summary: interpretation.summary,
        summaryBn: interpretation.summaryBn,
        diagnosis: interpretation.diagnosis || [],
        diagnosisBn: interpretation.diagnosisBn || [],
        diagnosisStatus,
        riskScore,
        recommendations: interpretation.recommendations as any,
        labName: ecgResult.labName,
        reportDate: ecgResult.reportDate ? new Date(ecgResult.reportDate) : null,
        status: 'COMPLETED',
      },
    });

    this.realtimeGateway.emitToUser(userId, 'lab-report:completed', {
      reportId,
    });

    if (user) {
      await this.emailService.sendLabReportReadyEmail(user.email, reportId);
      if (interpretation.criticalValues.length > 0) {
        await this.emailService.sendCriticalAlertEmail(
          user.email,
          reportId,
          interpretation.criticalValues,
        );
      }
    }
  }

  // ── Imaging Report Processing ──

  private async processImagingReport(
    reportId: string,
    userId: string,
    imageUrls: string[],
    originalFiles: Express.Multer.File[],
  ) {
    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 10,
      message: 'Reading imaging report...',
    });

    // Extract findings from first file
    const imageData = await this.getImageData(originalFiles[0], imageUrls[0]);
    const imagingResult = await this.aiService.extractImagingFindings(imageData);

    // Validate and correct AI-assigned significance using keyword rules
    imagingResult.imagingFindings = this.validateImagingFindings(imagingResult.imagingFindings);

    const riskScore = this.computeImagingRiskScore(imagingResult.imagingFindings);
    const diagnosisStatus = this.computeImagingDiagnosisStatus(imagingResult.imagingFindings);

    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 55,
      message: 'Interpreting imaging findings...',
    });

    const [patientContext, knowledgeContext, user] = await Promise.all([
      this.buildPatientContext(reportId, userId),
      this.knowledgeService
        .getContextForImagingFindings(
          imagingResult.imagingFindings,
          imagingResult.imagingModality,
        )
        .catch(() => ''),
      this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } }),
    ]);

    const interpretation = await this.aiService.interpretImagingResults(
      imagingResult.imagingFindings,
      imagingResult.impression,
      imagingResult.imagingModality,
      patientContext,
      user?.role,
      knowledgeContext,
    );

    this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
      reportId,
      progress: 90,
      message: 'Almost done...',
    });

    await (this.prisma.labReport as any).update({
      where: { id: reportId },
      data: {
        rawText: imagingResult.rawText,
        imagingModality: imagingResult.imagingModality,
        imagingFindings: imagingResult.imagingFindings as any,
        impression: imagingResult.impression,
        impressionBn: interpretation.summaryBn,
        summary: interpretation.summary,
        summaryBn: interpretation.summaryBn,
        diagnosis: interpretation.diagnosis || [],
        diagnosisBn: interpretation.diagnosisBn || [],
        diagnosisStatus,
        riskScore,
        recommendations: interpretation.recommendations as any,
        labName: imagingResult.labName,
        reportDate: imagingResult.reportDate ? new Date(imagingResult.reportDate) : null,
        status: 'COMPLETED',
      },
    });

    this.realtimeGateway.emitToUser(userId, 'lab-report:completed', {
      reportId,
    });

    if (user) {
      await this.emailService.sendLabReportReadyEmail(user.email, reportId);
      if (interpretation.criticalValues.length > 0) {
        await this.emailService.sendCriticalAlertEmail(
          user.email,
          reportId,
          interpretation.criticalValues,
        );
      }
    }
  }

  async rerun(userId: string, reportId: string) {
    const report = await this.findOne(userId, reportId) as any;
    const reportType = (report.reportType || 'LAB_REPORT') as ReportType;

    // Determine if we have existing extracted data to reuse
    const hasExistingLabValues =
      reportType === 'LAB_REPORT' &&
      report.values &&
      Array.isArray(report.values) &&
      (report.values as any[]).length > 0;

    const hasExistingECG =
      reportType === 'ECG' &&
      report.ecgFindings &&
      Array.isArray(report.ecgFindings) &&
      (report.ecgFindings as any[]).length > 0;

    const hasExistingImaging =
      reportType === 'IMAGING' &&
      report.imagingFindings &&
      Array.isArray(report.imagingFindings) &&
      (report.imagingFindings as any[]).length > 0;

    const hasExistingData = hasExistingLabValues || hasExistingECG || hasExistingImaging;

    await this.prisma.labReport.update({
      where: { id: reportId },
      data: {
        status: 'PENDING',
        errorMessage: null,
        summary: null,
        summaryBn: null,
        diagnosis: [],
        diagnosisBn: [],
        diagnosisStatus: null,
        riskScore: null,
        recommendations: null,
        ...(hasExistingData ? {} : { values: null, ecgFindings: null, imagingFindings: null }),
      },
    });

    if (hasExistingData) {
      this.reinterpretReport(reportId, userId, report, reportType).catch(
        (err) => {
          this.logger.error(
            `Failed to reinterpret report ${reportId}: ${err.message}`,
          );
        },
      );
    } else {
      this.reprocessReport(reportId, userId, report.imageUrls, reportType).catch(
        (err) => {
          this.logger.error(
            `Failed to reprocess report ${reportId}: ${err.message}`,
          );
        },
      );
    }

    return { message: 'Re-analysis started', reportId };
  }

  /**
   * Re-interpret only — reuses existing extracted values for consistent results.
   */
  private async reinterpretReport(
    reportId: string,
    userId: string,
    report: any,
    reportType: ReportType,
  ) {
    try {
      await this.prisma.labReport.update({
        where: { id: reportId },
        data: { status: 'PROCESSING' },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 30,
        message: 'Re-analyzing with existing data...',
      });

      const [patientContext, user] = await Promise.all([
        this.buildPatientContext(reportId, userId),
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        }),
      ]);

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 65,
        message: 'Generating recommendations...',
      });

      let interpretation;
      let riskScore: number;
      let diagnosisStatus: string;
      const updateData: any = {};

      if (reportType === 'ECG') {
        const ecgFindings = report.ecgFindings as ECGFinding[];
        riskScore = this.computeECGRiskScore(ecgFindings);
        diagnosisStatus = this.computeECGDiagnosisStatus(ecgFindings);
        const ecgKnowledge = await this.knowledgeService
          .getContextForECGFindings(ecgFindings)
          .catch(() => '');
        interpretation = await this.aiService.interpretECGResults(
          ecgFindings,
          patientContext,
          user?.role,
          ecgKnowledge,
        );
      } else if (reportType === 'IMAGING') {
        const imagingFindings = this.validateImagingFindings(report.imagingFindings as ImagingFinding[]);
        riskScore = this.computeImagingRiskScore(imagingFindings);
        diagnosisStatus = this.computeImagingDiagnosisStatus(imagingFindings);
        const imagingKnowledge = await this.knowledgeService
          .getContextForImagingFindings(
            imagingFindings,
            report.imagingModality || 'Unknown',
          )
          .catch(() => '');
        interpretation = await this.aiService.interpretImagingResults(
          imagingFindings,
          report.impression || '',
          report.imagingModality || 'Unknown',
          patientContext,
          user?.role,
          imagingKnowledge,
        );
        updateData.impressionBn = interpretation.summaryBn;
      } else {
        // LAB_REPORT
        const existingValues = report.values as LabValue[];
        const normalizedValues = this.normalizeLabValues(existingValues);
        riskScore = this.computeRiskScore(normalizedValues);
        diagnosisStatus = this.computeDiagnosisStatus(normalizedValues);

        const knowledgeContext = await this.knowledgeService
          .getContextForLabValues(normalizedValues)
          .catch(() => '');

        try {
          interpretation = await this.aiService.interpretResults(
            normalizedValues,
            patientContext,
            'gemini-flash',
            knowledgeContext,
            undefined,
            user?.role,
          );
        } catch (primaryErr: any) {
          this.logger.warn(
            `Primary model failed for reinterpret, trying Groq fallback: ${primaryErr.message}`,
          );
          interpretation = await this.aiService.interpretResults(
            normalizedValues,
            patientContext,
            'llama-3.3',
            knowledgeContext,
            undefined,
            user?.role,
          );
        }
        updateData.values = normalizedValues;
      }

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 90,
        message: 'Almost done...',
      });

      await this.prisma.labReport.update({
        where: { id: reportId },
        data: {
          ...updateData,
          summary: interpretation.summary,
          summaryBn: interpretation.summaryBn,
          diagnosis: interpretation.diagnosis || [],
          diagnosisBn: interpretation.diagnosisBn || [],
          diagnosisStatus,
          riskScore,
          recommendations: interpretation.recommendations as any,
          status: 'COMPLETED',
        },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:completed', {
        reportId,
      });
    } catch (error: any) {
      this.logger.error(`Report reinterpretation failed: ${error.message}`);
      const friendlyMessage = this.toFriendlyError(error);

      await this.prisma.labReport.update({
        where: { id: reportId },
        data: {
          status: 'FAILED',
          errorMessage: friendlyMessage,
        },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:failed', {
        reportId,
        error: friendlyMessage,
      });
    }
  }

  /**
   * Full re-extraction + interpretation (no existing values).
   * Routes to type-specific processing.
   */
  private async reprocessReport(
    reportId: string,
    userId: string,
    imageUrls: string[],
    reportType: ReportType = 'LAB_REPORT',
  ) {
    try {
      await this.prisma.labReport.update({
        where: { id: reportId },
        data: { status: 'PROCESSING' },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 5,
        message: 'Re-analyzing your report...',
      });

      if (reportType === 'ECG') {
        await this.processECGReport(reportId, userId, imageUrls, []);
      } else if (reportType === 'IMAGING') {
        await this.processImagingReport(reportId, userId, imageUrls, []);
      } else {
        // Lab report — re-extract from URLs (no original files available)
        const allValues: LabValue[] = [];
        let rawText = '';
        let labName: string | undefined;
        let reportDate: string | undefined;

        const totalFiles = imageUrls.length;
        for (let i = 0; i < totalFiles; i++) {
          const progressBase = Math.round((i / totalFiles) * 40) + 10;
          this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
            reportId,
            progress: progressBase,
            message: `Extracting values from file ${i + 1} of ${totalFiles}...`,
          });

          const url = imageUrls[i];
          const extraction = url.startsWith('http')
            ? await this.aiService.extractLabValuesFromUrl(url)
            : await this.aiService.extractLabValues(
                this.uploadService.getFilePath(url),
              );

          allValues.push(...extraction.values);
          rawText += (rawText ? '\n---\n' : '') + extraction.rawText;
          if (extraction.labName) labName = extraction.labName;
          if (extraction.reportDate) reportDate = extraction.reportDate;
        }

        const normalizedValues = this.normalizeLabValues(allValues);
        const riskScore = this.computeRiskScore(normalizedValues);
        const diagnosisStatus = this.computeDiagnosisStatus(normalizedValues);

        this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
          reportId,
          progress: 55,
          message: 'Analyzing results...',
        });

        const [healthProfile, knowledgeContext, user] = await Promise.all([
          this.prisma.healthProfile.findUnique({ where: { userId } }),
          this.knowledgeService
            .getContextForLabValues(normalizedValues)
            .catch(() => ''),
          this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
        ]);

        this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
          reportId,
          progress: 65,
          message: 'Generating recommendations...',
        });

        let interpretation;
        try {
          interpretation = await this.aiService.interpretResults(
            normalizedValues,
            healthProfile || undefined,
            'gemini-flash',
            knowledgeContext,
            undefined,
            user?.role,
          );
        } catch (primaryErr: any) {
          this.logger.warn(
            `Primary model failed for rerun, trying Groq fallback: ${primaryErr.message}`,
          );
          interpretation = await this.aiService.interpretResults(
            normalizedValues,
            healthProfile || undefined,
            'llama-3.3',
            knowledgeContext,
            undefined,
            user?.role,
          );
        }

        this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
          reportId,
          progress: 90,
          message: 'Almost done...',
        });

        await this.prisma.labReport.update({
          where: { id: reportId },
          data: {
            rawText,
            values: normalizedValues as any,
            summary: interpretation.summary,
            summaryBn: interpretation.summaryBn,
            diagnosis: interpretation.diagnosis || [],
            diagnosisBn: interpretation.diagnosisBn || [],
            diagnosisStatus,
            riskScore,
            recommendations: interpretation.recommendations as any,
            labName,
            reportDate: reportDate ? new Date(reportDate) : null,
            status: 'COMPLETED',
          },
        });

        this.realtimeGateway.emitToUser(userId, 'lab-report:completed', {
          reportId,
        });
      }
    } catch (error: any) {
      this.logger.error(`Report reprocessing failed: ${error.message}`);
      const friendlyMessage = this.toFriendlyError(error);

      await this.prisma.labReport.update({
        where: { id: reportId },
        data: {
          status: 'FAILED',
          errorMessage: friendlyMessage,
        },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:failed', {
        reportId,
        error: friendlyMessage,
      });
    }
  }

  async findAll(userId: string, query: QueryLabReportsDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      this.prisma.labReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.labReport.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, reportId: string) {
    const report = await this.prisma.labReport.findFirst({
      where: { id: reportId, userId },
    });

    if (!report) {
      throw new NotFoundException('Lab report not found');
    }

    return report;
  }

  async delete(userId: string, reportId: string) {
    const report = await this.findOne(userId, reportId);

    await this.prisma.labReport.delete({ where: { id: report.id } });

    return { message: 'Lab report deleted' };
  }

  async getTrends(userId: string, testName: string) {
    const reports = await this.prisma.labReport.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' },
    });

    const dataPoints = reports
      .filter((r) => r.values)
      .map((r) => {
        const values = r.values as unknown as LabValue[];
        const match = values.find(
          (v) => v.test.toLowerCase() === testName.toLowerCase(),
        );
        if (!match) return null;
        return {
          date: r.reportDate?.toISOString() || r.createdAt.toISOString(),
          value: Number(match.value),
          status: match.status,
        };
      })
      .filter(Boolean) as { date: string; value: number; status: string }[];

    return this.aiService.analyzeTrends(testName, dataPoints);
  }

  async compareReports(userId: string, reportAId: string, reportBId: string) {
    const [reportA, reportB] = await Promise.all([
      this.findOne(userId, reportAId),
      this.findOne(userId, reportBId),
    ]);

    if (!reportA.values || !reportB.values) {
      throw new NotFoundException('Both reports must be completed to compare');
    }

    const valuesA = reportA.values as unknown as LabValue[];
    const valuesB = reportB.values as unknown as LabValue[];

    return this.aiService.compareReports(
      valuesA,
      valuesB,
      reportA.createdAt.toISOString(),
      reportB.createdAt.toISOString(),
    );
  }
}
