// File: api/src/posts/dto/update-post.dto.ts

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}