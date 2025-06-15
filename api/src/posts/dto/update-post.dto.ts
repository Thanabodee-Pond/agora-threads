// File: api/src/posts/dto/update-post.dto.ts
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
  // *** การแก้ไข: ทำให้ category สามารถเป็น string หรือ null ได้ ***
  category?: string | null; // <-- แก้ไขตรงนี้
}