import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UploadService } from './upload.service.js';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single file' })
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    const filename = await this.uploadService.saveFile(file);
    return {
      filename,
      url: this.uploadService.getFileUrl(filename),
    };
  }

  @Post('multiple')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple files' })
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    const filenames = await this.uploadService.saveMultipleFiles(files);
    return filenames.map((filename) => ({
      filename,
      url: this.uploadService.getFileUrl(filename),
    }));
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Serve an uploaded file' })
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = this.uploadService.getFilePath(filename);
    return res.sendFile(filepath, { root: '.' });
  }
}
