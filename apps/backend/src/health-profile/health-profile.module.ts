import { Module } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service.js';
import { HealthProfileController } from './health-profile.controller.js';

@Module({
  providers: [HealthProfileService],
  controllers: [HealthProfileController],
})
export class HealthProfileModule {}
