import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { LabReportsService } from './lab-reports.service.js';
import { QueryLabReportsDto } from './dto/query-lab-reports.dto.js';
@ApiTags('Lab Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lab-reports')
export class LabReportsController {
  constructor(
    private readonly labReportsService: LabReportsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload lab report files (images/PDFs) for AI analysis' })
  upload(
    @CurrentUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('title') title?: string,
    @Body('reportType') reportType?: string,
    @Body('patientAge') patientAge?: string,
    @Body('patientGender') patientGender?: string,
    @Body('clinicalHistory') clinicalHistory?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }
    return this.labReportsService.create(userId, files, title, reportType, {
      patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
      patientGender,
      clinicalHistory,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all lab reports for current user' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryLabReportsDto,
  ) {
    return this.labReportsService.findAll(userId, query);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get health trends for a specific test' })
  getTrends(
    @CurrentUser('id') userId: string,
    @Query('test') testName: string,
  ) {
    return this.labReportsService.getTrends(userId, testName);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare two lab reports' })
  compare(
    @CurrentUser('id') userId: string,
    @Query('reportA') reportAId: string,
    @Query('reportB') reportBId: string,
  ) {
    return this.labReportsService.compareReports(userId, reportAId, reportBId);
  }

  @Post(':id/rerun')
  @ApiOperation({ summary: 'Re-run AI analysis on an existing report' })
  rerun(
    @CurrentUser('id') userId: string,
    @Param('id') reportId: string,
  ) {
    return this.labReportsService.rerun(userId, reportId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single lab report by ID' })
  findOne(@CurrentUser('id') userId: string, @Param('id') reportId: string) {
    return this.labReportsService.findOne(userId, reportId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lab report' })
  delete(@CurrentUser('id') userId: string, @Param('id') reportId: string) {
    return this.labReportsService.delete(userId, reportId);
  }
}
