import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { UploadService } from '../upload/upload.service.js';
import { EmailService } from '../email/email.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import {
  AiPersonaService,
  BUILT_IN_PERSONAS,
} from '../ai-persona/ai-persona.service.js';
import { QueryLabReportsDto } from './dto/query-lab-reports.dto.js';
import type {
  LabValue,
  AIModel,
  ExtractionResult,
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
    private readonly aiPersonaService: AiPersonaService,
  ) {}

  async create(
    userId: string,
    files: Express.Multer.File[],
    title?: string,
    model?: AIModel,
    personaId?: string,
  ) {
    const imageUrls: string[] = [];
    for (const file of files) {
      const fileResult = await this.uploadService.saveFile(file);
      const url = fileResult.startsWith('http')
        ? fileResult
        : this.uploadService.getFileUrl(fileResult);
      imageUrls.push(url);
    }

    const report = await this.prisma.labReport.create({
      data: {
        userId,
        title: title || `Lab Report - ${new Date().toLocaleDateString()}`,
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
      model,
      personaId,
    ).catch((err) => {
      this.logger.error(
        `Failed to process report ${report.id}: ${err.message}`,
      );
    });

    return report;
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

  private isPdf(file: Express.Multer.File): boolean {
    return (
      file.mimetype === 'application/pdf' ||
      file.originalname?.toLowerCase().endsWith('.pdf')
    );
  }

  private async processReport(
    reportId: string,
    userId: string,
    imageUrls: string[],
    originalFiles: Express.Multer.File[],
    model?: AIModel,
    personaId?: string,
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

      // Extract values from all files
      const allValues: LabValue[] = [];
      let rawText = '';
      let labName: string | undefined;
      let reportDate: string | undefined;
      let patientName: string | undefined;

      const totalFiles = imageUrls.length;
      for (let i = 0; i < totalFiles; i++) {
        const progressBase = Math.round((i / totalFiles) * 40) + 10;
        this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
          reportId,
          progress: progressBase,
          message: `Extracting values from file ${i + 1} of ${totalFiles}...`,
        });

        let extraction: ExtractionResult;
        const file = originalFiles[i];
        const url = imageUrls[i];

        if (file && this.isPdf(file)) {
          extraction = await this.aiService.extractLabValuesFromPdf(
            file.buffer,
          );
        } else if (url.startsWith('http')) {
          extraction = await this.aiService.extractLabValuesFromUrl(url);
        } else {
          extraction = await this.aiService.extractLabValues(
            this.uploadService.getFilePath(url),
          );
        }

        allValues.push(...extraction.values);
        rawText += (rawText ? '\n---\n' : '') + extraction.rawText;
        if (extraction.labName) labName = extraction.labName;
        if (extraction.reportDate) reportDate = extraction.reportDate;
        if (extraction.patientName) patientName = extraction.patientName;
      }

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 55,
        message: 'Analyzing results...',
      });

      // Resolve persona modifier if a persona was selected
      let personaModifier: string | undefined;
      if (personaId) {
        const builtIn = BUILT_IN_PERSONAS.find((p) => p.id === personaId);
        if (builtIn) {
          personaModifier = this.aiPersonaService.getPromptModifier(
            builtIn.style,
            builtIn.preferences,
          );
        } else {
          const customPersona = await this.prisma.aiPersona.findFirst({
            where: { id: personaId, userId },
          });
          if (customPersona) {
            personaModifier = this.aiPersonaService.getPromptModifier(
              customPersona.style,
              customPersona.preferences as any,
            );
          }
        }
      }

      const [healthProfile, knowledgeContext, user] = await Promise.all([
        this.prisma.healthProfile.findUnique({ where: { userId } }),
        this.knowledgeService
          .getContextForLabValues(allValues)
          .catch(() => ''),
        this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } }),
      ]);

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 65,
        message: 'Generating recommendations...',
      });

      // Try primary model, fallback to Groq if Gemini fails
      let interpretation;
      try {
        interpretation = await this.aiService.interpretResults(
          allValues,
          healthProfile || undefined,
          model,
          knowledgeContext,
          personaModifier,
          user?.role,
        );
      } catch (primaryErr: any) {
        this.logger.warn(
          `Primary model failed for interpretation, trying Groq fallback: ${primaryErr.message}`,
        );
        interpretation = await this.aiService.interpretResults(
          allValues,
          healthProfile || undefined,
          'llama-3.3',
          knowledgeContext,
          personaModifier,
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
          values: allValues as any,
          summary: interpretation.summary,
          summaryBn: interpretation.summaryBn,
          diagnosis: interpretation.diagnosis || [],
          diagnosisBn: interpretation.diagnosisBn || [],
          diagnosisStatus: interpretation.diagnosisStatus || 'all_clear',
          riskScore: interpretation.riskScore,
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

  async rerun(
    userId: string,
    reportId: string,
    model?: AIModel,
    personaId?: string,
  ) {
    const report = await this.findOne(userId, reportId);

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
        values: null,
      },
    });

    this.reprocessReport(reportId, userId, report.imageUrls, model, personaId).catch(
      (err) => {
        this.logger.error(
          `Failed to reprocess report ${reportId}: ${err.message}`,
        );
      },
    );

    return { message: 'Re-analysis started', reportId };
  }

  private async reprocessReport(
    reportId: string,
    userId: string,
    imageUrls: string[],
    model?: AIModel,
    personaId?: string,
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

      // Re-extract from stored URLs (no original file buffers available)
      const allValues: LabValue[] = [];
      let rawText = '';
      let labName: string | undefined;
      let reportDate: string | undefined;
      let patientName: string | undefined;

      const totalFiles = imageUrls.length;
      for (let i = 0; i < totalFiles; i++) {
        const progressBase = Math.round((i / totalFiles) * 40) + 10;
        this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
          reportId,
          progress: progressBase,
          message: `Extracting values from file ${i + 1} of ${totalFiles}...`,
        });

        const url = imageUrls[i];
        let extraction: ExtractionResult;

        if (url.startsWith('http')) {
          extraction = await this.aiService.extractLabValuesFromUrl(url);
        } else {
          extraction = await this.aiService.extractLabValues(
            this.uploadService.getFilePath(url),
          );
        }

        allValues.push(...extraction.values);
        rawText += (rawText ? '\n---\n' : '') + extraction.rawText;
        if (extraction.labName) labName = extraction.labName;
        if (extraction.reportDate) reportDate = extraction.reportDate;
        if (extraction.patientName) patientName = extraction.patientName;
      }

      this.realtimeGateway.emitToUser(userId, 'lab-report:processing', {
        reportId,
        progress: 55,
        message: 'Analyzing results...',
      });

      let personaModifier: string | undefined;
      if (personaId) {
        const builtIn = BUILT_IN_PERSONAS.find((p) => p.id === personaId);
        if (builtIn) {
          personaModifier = this.aiPersonaService.getPromptModifier(
            builtIn.style,
            builtIn.preferences,
          );
        } else {
          const customPersona = await this.prisma.aiPersona.findFirst({
            where: { id: personaId, userId },
          });
          if (customPersona) {
            personaModifier = this.aiPersonaService.getPromptModifier(
              customPersona.style,
              customPersona.preferences as any,
            );
          }
        }
      }

      const [healthProfile, knowledgeContext, user] = await Promise.all([
        this.prisma.healthProfile.findUnique({ where: { userId } }),
        this.knowledgeService
          .getContextForLabValues(allValues)
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
          allValues,
          healthProfile || undefined,
          model,
          knowledgeContext,
          personaModifier,
          user?.role,
        );
      } catch (primaryErr: any) {
        this.logger.warn(
          `Primary model failed for rerun, trying Groq fallback: ${primaryErr.message}`,
        );
        interpretation = await this.aiService.interpretResults(
          allValues,
          healthProfile || undefined,
          'llama-3.3',
          knowledgeContext,
          personaModifier,
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
          values: allValues as any,
          summary: interpretation.summary,
          summaryBn: interpretation.summaryBn,
          diagnosis: interpretation.diagnosis || [],
          diagnosisBn: interpretation.diagnosisBn || [],
          diagnosisStatus: interpretation.diagnosisStatus || 'all_clear',
          riskScore: interpretation.riskScore,
          recommendations: interpretation.recommendations as any,
          labName,
          reportDate: reportDate ? new Date(reportDate) : null,
          status: 'COMPLETED',
        },
      });

      this.realtimeGateway.emitToUser(userId, 'lab-report:completed', {
        reportId,
      });
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
