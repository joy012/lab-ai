import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { KnowledgeService } from './knowledge.service.js';

@ApiTags('Knowledge')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('seed')
  @ApiOperation({
    summary: 'Seed initial medical knowledge (Bangladesh-specific)',
  })
  seed() {
    return this.knowledgeService.seedKnowledge();
  }

  @Get('search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search medical knowledge base' })
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.knowledgeService.searchKnowledge(
      query,
      limit ? parseInt(limit) : 5,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all knowledge entries' })
  list(@Query('category') category?: string) {
    return this.knowledgeService.listKnowledge(category);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a knowledge entry' })
  add(
    @Body()
    body: {
      category: string;
      title: string;
      content: string;
      tags: string[];
      source?: string;
    },
  ) {
    return this.knowledgeService.addKnowledge(body);
  }
}
