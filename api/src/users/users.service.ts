// File: api/src/users/users.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_ORM_TOKEN } from '../db/drizzle.provider';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';

type DbInstance = typeof db;

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_ORM_TOKEN) private drizzle: DbInstance) {}

  async create(userData: Pick<CreateUserDto, 'username'>) {
    const [newUser] = await this.drizzle
      .insert(schema.users)
      .values({ username: userData.username })
      .returning();
    return newUser;
  }

  async findOneByUsername(username: string) {
    return this.drizzle.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  }

  async findById(id: number) {
    return this.drizzle.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }
}