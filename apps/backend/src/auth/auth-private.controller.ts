import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { UpdateProfileDto } from './dto/index.js';

@ApiTags('Auth / Private')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthPrivateController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  deleteAccount(@CurrentUser('id') userId: string) {
    return this.authService.deleteAccount(userId);
  }
}
