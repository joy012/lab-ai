import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthPublicController } from './auth-public.controller.js';
import { AuthPrivateController } from './auth-private.controller.js';
import { JwtStrategy } from './jwt.strategy.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    EmailModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthPublicController, AuthPrivateController],
  exports: [AuthService],
})
export class AuthModule {}
