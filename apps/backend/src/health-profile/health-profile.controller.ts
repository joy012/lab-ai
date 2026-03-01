import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { HealthProfileService } from './health-profile.service.js';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto.js';

@ApiTags('Health Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('health-profile')
export class HealthProfileController {
  constructor(private readonly healthProfileService: HealthProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user health profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.healthProfileService.getProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user health profile' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateHealthProfileDto,
  ) {
    return this.healthProfileService.updateProfile(userId, dto);
  }
}
