import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHealthProfileDto {
  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 170 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 'B+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: ['Diabetes', 'Hypertension'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @ApiPropertyOptional({ example: ['Metformin'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({ example: ['Penicillin'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}
