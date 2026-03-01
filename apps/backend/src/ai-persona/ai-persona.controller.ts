import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AiPersonaService } from './ai-persona.service.js';

@ApiTags('AI Personas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-personas')
export class AiPersonaController {
  constructor(private readonly aiPersonaService: AiPersonaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all personas (built-in + custom)' })
  findAll(@CurrentUser('id') userId: string) {
    return this.aiPersonaService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom persona' })
  create(
    @CurrentUser('id') userId: string,
    @Body() body: { name: string; style: string; preferences: any },
  ) {
    return this.aiPersonaService.create(userId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a custom persona' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; style?: string; preferences?: any },
  ) {
    return this.aiPersonaService.update(userId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom persona' })
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.aiPersonaService.delete(userId, id);
  }
}
