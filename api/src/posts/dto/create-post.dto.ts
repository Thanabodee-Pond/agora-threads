// src/posts/dto/create-post.dto.ts

import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional() // เลือกอันนี้ เพื่อให้เป็น optional
  // @IsNotEmpty() // ไม่ใช้แล้วถ้าเป็น optional และอนุญาต null/undefined

  // *** การแก้ไข: ทำให้ category สามารถเป็น string หรือ null ได้ ***
  category?: string | null; // <-- แก้ไขตรงนี้
}