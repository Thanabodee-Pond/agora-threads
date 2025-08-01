import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  category?: string | null; 
}