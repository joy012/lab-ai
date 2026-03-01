import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: '123456', description: '6-digit verification code from email' })
  @IsString()
  @Length(6, 6)
  token: string;
}
