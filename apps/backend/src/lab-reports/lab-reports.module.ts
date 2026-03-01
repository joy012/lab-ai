import { Module } from '@nestjs/common';
import { LabReportsService } from './lab-reports.service.js';
import { LabReportsController } from './lab-reports.controller.js';
import { AiModule } from '../ai/ai.module.js';
import { UploadModule } from '../upload/upload.module.js';
import { EmailModule } from '../email/email.module.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { AiPersonaModule } from '../ai-persona/ai-persona.module.js';

@Module({
  imports: [
    AiModule,
    UploadModule,
    EmailModule,
    RealtimeModule,
    KnowledgeModule,
    AiPersonaModule,
  ],
  providers: [LabReportsService],
  controllers: [LabReportsController],
})
export class LabReportsModule {}
