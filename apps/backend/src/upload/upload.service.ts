import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly useCloudinary: boolean;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.maxFileSize = Number(
      this.configService.get('MAX_FILE_SIZE', 10485760),
    );

    // Configure Cloudinary if credentials provided
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    this.useCloudinary = !!cloudName;

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: this.configService.get('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
      });
      this.logger.log('Cloudinary configured for file storage');
    } else {
      // Fallback to local storage
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      this.logger.log('Using local file storage');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'File size exceeds the maximum allowed size',
      );
    }

    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP and PDF files are allowed',
      );
    }

    if (this.useCloudinary) {
      return this.uploadToCloudinary(file);
    }

    return this.saveLocally(file);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'labai/reports',
          resource_type: 'auto',
          public_id: uuidv4(),
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            reject(new BadRequestException('File upload failed'));
          } else {
            resolve(result!.secure_url);
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  private saveLocally(file: Express.Multer.File): string {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    return filename;
  }

  async saveMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.saveFile(file)));
  }

  getFilePath(filename: string): string {
    if (filename.startsWith('http')) {
      return filename; // Cloudinary URL
    }
    return path.join(this.uploadDir, filename);
  }

  getFileUrl(filename: string): string {
    if (filename.startsWith('http')) {
      return filename; // Already a full URL (Cloudinary)
    }
    const appUrl = this.configService.get('APP_URL', 'http://localhost:3001');
    return `${appUrl}/v1/upload/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    if (filename.startsWith('http') && filename.includes('cloudinary')) {
      // Extract public_id from Cloudinary URL and delete
      const parts = filename.split('/');
      const publicId = parts[parts.length - 1].split('.')[0];
      await cloudinary.uploader.destroy(`labai/reports/${publicId}`);
    } else {
      const filepath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }
}
