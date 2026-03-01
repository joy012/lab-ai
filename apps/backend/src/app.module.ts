import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envYamlFactory } from './config/env.config.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LabReportsModule } from './lab-reports/lab-reports.module.js';
import { AiModule } from './ai/ai.module.js';
import { UploadModule } from './upload/upload.module.js';
import { HealthProfileModule } from './health-profile/health-profile.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { EmailModule } from './email/email.module.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';
import { AiPersonaModule } from './ai-persona/ai-persona.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envYamlFactory],
    }),
    PrismaModule,
    AuthModule,
    LabReportsModule,
    AiModule,
    UploadModule,
    HealthProfileModule,
    RealtimeModule,
    EmailModule,
    KnowledgeModule,
    AiPersonaModule,
  ],
})
export class AppModule {}
