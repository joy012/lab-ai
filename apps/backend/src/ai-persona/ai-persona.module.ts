import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AiPersonaController } from './ai-persona.controller.js';
import { AiPersonaService } from './ai-persona.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AiPersonaController],
  providers: [AiPersonaService],
  exports: [AiPersonaService],
})
export class AiPersonaModule {}
