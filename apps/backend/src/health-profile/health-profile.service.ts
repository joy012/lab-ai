import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto.js';

@Injectable()
export class HealthProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.healthProfile.create({
        data: { userId },
      });
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateHealthProfileDto) {
    return this.prisma.healthProfile.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
