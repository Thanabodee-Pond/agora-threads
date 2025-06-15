// api/src/comments/comments.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    // req.user จะเป็นผลลัพธ์จาก JwtStrategy.validate()
    // ถ้า JwtStrategy คืน { userId: payload.sub, username: payload.username }
    // คุณก็เรียก req.user.userId ได้เลย
    const authorId = req.user.userId; // ใช้ userId จาก req.user
    return this.commentsService.create(createCommentDto, authorId);
  }
}