// File: api/src/posts/posts.service.ts

import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE_ORM_TOKEN } from '../db/drizzle.provider';
import { db } from '../db';
import * as schema from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

type DbInstance = typeof db;

@Injectable()
export class PostsService {
  constructor(@Inject(DRIZZLE_ORM_TOKEN) private drizzle: DbInstance) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const [newPost] = await this.drizzle
      .insert(schema.posts)
      .values({ ...createPostDto, authorId: userId })
      .returning();
    return newPost;
  }

  async findAll() {
    return this.drizzle.query.posts.findMany({
      orderBy: [desc(schema.posts.createdAt)],
      with: {
        author: { columns: { username: true } },
        comments: {
          with: { author: { columns: { username: true } } },
          orderBy: [desc(schema.comments.createdAt)],
        },
      },
    });
  }

  async findOne(id: number) {
    const post = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
      with: {
        author: { columns: { username: true } },
        comments: {
          with: { author: { columns: { username: true } } },
          orderBy: [desc(schema.comments.createdAt)],
        },
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findMyPosts(userId: number) {
    return this.drizzle.query.posts.findMany({
      where: eq(schema.posts.authorId, userId),
      orderBy: [desc(schema.posts.createdAt)],
      with: {
        author: { columns: { username: true } },
        comments: true,
      },
    });
  }

  // --- [โค้ดส่วนที่เพิ่มเข้ามาใหม่] ---
  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    // 1. ค้นหาโพสต์ที่จะแก้ไขก่อน
    const post = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
    });

    // 2. ตรวจสอบว่ามีโพสต์หรือไม่ และผู้ใช้เป็นเจ้าของหรือไม่
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('You can only edit your own posts');

    // 3. ถ้าผ่านทั้งหมด ให้ทำการอัปเดต
    const [updatedPost] = await this.drizzle
      .update(schema.posts)
      .set(updatePostDto)
      .where(eq(schema.posts.id, id))
      .returning();

    return updatedPost;
  }
  // ------------------------------------

  async remove(id: number, userId: number) {
    const post = await this.drizzle.query.posts.findFirst({
      where: eq(schema.posts.id, id),
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('You can only delete your own posts');

    await this.drizzle.delete(schema.posts).where(eq(schema.posts.id, id));
    return { message: 'Post deleted successfully' };
  }
}