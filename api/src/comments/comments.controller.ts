// api/src/comments/comments.controller.ts
import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../db/schema'; // <-- นำเข้า User type เพื่อการ Cast

// --- [ การแก้ไขตรงนี้ ] ---
@UseGuards(JwtAuthGuard) // <-- แก้ไขให้ถูกต้องแล้ว
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    console.log('--- Inside CommentsController.create ---');
    console.log('Full Request User Object (req.user):', req.user);
    console.log('User ID from req.user (req.user?.id):', (req.user as User)?.id);

    const currentUser = req.user as User;
    const authorId = currentUser?.id; 

    if (!authorId) {
      console.error("Authentication error: User ID is missing from req.user for comment creation. Invalid JWT or user not found.");
      throw new Error('Authentication error: User ID not found or invalid token. Please ensure you are logged in.');
    }
    
    return this.commentsService.create(createCommentDto, authorId);
  }

  // หากมีเมธอดอื่นๆ ที่ใช้ req.user.userId ก็ต้องแก้ไขเช่นกัน
  // ตัวอย่างสำหรับเมธอดลบ (ถ้ามี):
  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // async remove(@Param('id') id: string, @Request() req) {
  //   const currentUser = req.user as User;
  //   return this.commentsService.remove(+id, currentUser.id);
  // }
}