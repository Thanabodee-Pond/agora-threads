// File: api/src/posts/posts.controller.ts

import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../db/schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {} // แก้เป็น PostsService

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  findMyPosts(@Request() req) {
    // console.log('findMyPosts - req.user:', req.user); // เพิ่ม log
    const currentUser = req.user as User;
    return this.postsService.findMyPosts(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    console.log('--- Inside PostsController.create ---'); // เพิ่ม log
    console.log('req.user:', req.user); // <-- **สำคัญมาก: เพิ่ม log ตรงนี้**
    console.log('req.user.id:', (req.user as User)?.id); // <-- **สำคัญมาก: เพิ่ม log ตรงนี้**

    const currentUser = req.user as User;
    const authorId = currentUser?.id; // ใช้ optional chaining เผื่อ req.user เป็น null/undefined

    if (!authorId) {
        console.error("Authentication error: Author ID is missing from req.user or invalid JWT.");
        throw new Error('Authentication error: User ID not found or invalid token. Please ensure you are logged in.');
    }
    
    const categoryToSave = createPostDto.category?.trim() === '' ? null : createPostDto.category;

    return this.postsService.create({
      title: createPostDto.title,
      content: createPostDto.content,
      category: categoryToSave
    }, authorId);
  }

  // ... ส่วนอื่นๆ ของ Controller (find All, findOne, update, remove)
  // เพิ่ม console.log(req.user) ในเมธอดอื่นๆ ที่ใช้ req.user ด้วยถ้ายังไม่แน่ใจ
  @Public()
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Request() req) {
    console.log('update post - req.user:', req.user); // เพิ่ม log
    const currentUser = req.user as User;
    return this.postsService.update(+id, updatePostDto, currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    console.log('delete post - req.user:', req.user); // เพิ่ม log
    const currentUser = req.user as User;
    return this.postsService.remove(+id, currentUser.id);
  }
}