import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_ORM_TOKEN } from '../db/drizzle.provider';
import { db } from '../db';
import * as schema from '../db/schema';
import { CreateCommentDto } from './dto/create-comment.dto';

type DbInstance = typeof db;

@Injectable()
export class CommentsService {
  constructor(@Inject(DRIZZLE_ORM_TOKEN) private drizzle: DbInstance) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const [newComment] = await this.drizzle
      .insert(schema.comments)
      .values({
        content: createCommentDto.content,
        postId: createCommentDto.postId,
        authorId: userId,
      })
      .returning();
    return newComment;
  }
}