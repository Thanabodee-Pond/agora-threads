import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../db/schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {} 

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  findMyPosts(@Request() req) {
    const currentUser = req.user as User;
    return this.postsService.findMyPosts(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    console.log('--- Inside PostsController.create ---'); 
    console.log('req.user:', req.user); 
    console.log('req.user.id:', (req.user as User)?.id); 

    const currentUser = req.user as User;
    const authorId = currentUser?.id; 

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
    console.log('update post - req.user:', req.user); 
    const currentUser = req.user as User;
    return this.postsService.update(+id, updatePostDto, currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    console.log('delete post - req.user:', req.user); 
    const currentUser = req.user as User;
    return this.postsService.remove(+id, currentUser.id);
  }
}